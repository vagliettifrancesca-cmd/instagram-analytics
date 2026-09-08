// ════════════════════════════════════════════════════════════════════════
// sync-meta.js — scarica i dati Instagram di un mese e aggiorna mockData.ts.
// Eseguito dal GitHub Action il 1° di ogni mese, o a mano.
//
// Variabili richieste (GitHub Secrets):
//   META_ACCESS_TOKEN  — token Pagina a lunga durata, con instagram_manage_insights
//   IG_USER_ID         — ID account Instagram Business
//
// Opzionali, per rilanciare un mese passato:
//   MESE=2026-08       — sincronizza quel mese invece del precedente
//   SOVRASCRIVI=1      — cancella i dati già presenti di quel mese e li rifà
// ════════════════════════════════════════════════════════════════════════

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const V     = 'v21.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ID = process.env.IG_USER_ID;

if (!TOKEN || !IG_ID) {
  console.error("❌  META_ACCESS_TOKEN e IG_USER_ID sono richiesti come variabili d'ambiente.");
  process.exit(1);
}

const GIORNO = 86400;

// ── helpers HTTP ──────────────────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(raw);
          if (j.error) reject(new Error(`Meta API: ${j.error.message} (code ${j.error.code})`));
          else resolve(j);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function api(endpoint) {
  const sep = endpoint.includes('?') ? '&' : '?';
  return httpGet(`https://graph.facebook.com/${V}${endpoint}${sep}access_token=${TOKEN}`);
}

// ── quale mese sincronizzare ──────────────────────────────────────────────
function meseDaSincronizzare() {
  const MESI = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const forzato = (process.env.MESE || '').trim();

  let anno, mese;
  if (/^\d{4}-\d{2}$/.test(forzato)) {
    anno = Number(forzato.slice(0, 4));
    mese = Number(forzato.slice(5, 7)) - 1;
  } else {
    const ora = new Date();
    anno = ora.getFullYear();
    mese = ora.getMonth() - 1;   // con mese -1 il costruttore torna a dicembre dell'anno prima
  }

  const inizio = new Date(anno, mese, 1);
  const fine   = new Date(anno, mese + 1, 1);
  return {
    since: Math.floor(inizio.getTime() / 1000),
    until: Math.floor(fine.getTime()   / 1000),
    key:   `${inizio.getFullYear()}-${String(inizio.getMonth() + 1).padStart(2, '0')}`,
    label: `${MESI[inizio.getMonth()]} ${String(inizio.getFullYear()).slice(2)}`,
  };
}

// ── lista dei contenuti del mese ──────────────────────────────────────────
async function fetchMedia(since, until) {
  const campi = 'id,caption,media_type,timestamp,like_count,comments_count,permalink';
  let endpoint = `/${IG_ID}/media?fields=${campi}&since=${since}&until=${until}&limit=50`;
  const tutti = [];
  while (endpoint) {
    const data = await api(endpoint);
    if (data.data) tutti.push(...data.data);
    if (data.paging?.next) {
      const url = new URL(data.paging.next);
      url.searchParams.delete('access_token');
      endpoint = url.pathname.replace(`/${V}`, '') + '?' + url.searchParams.toString();
    } else {
      endpoint = null;
    }
  }
  return tutti;
}

// ── statistiche del singolo contenuto ─────────────────────────────────────
// `impressions` e `video_views` sono state dismesse da Meta: chiederle fa
// fallire TUTTA la chiamata, e ogni valore torna a zero. La metrica che le
// sostituisce entrambe è `views`.
async function fetchInsights(mediaId, mediaType) {
  const video   = ['REEL', 'VIDEO'].includes(mediaType);
  const metriche = ['reach', 'saved', 'shares', 'views', ...(video ? ['ig_reels_avg_watch_time'] : [])].join(',');
  try {
    const data = await api(`/${mediaId}/insights?metric=${metriche}`);
    return Object.fromEntries((data.data || []).map(i => [i.name, i.values?.[0]?.value ?? i.value ?? 0]));
  } catch (e) {
    console.warn(`    ⚠ statistiche non disponibili per ${mediaId}: ${e.message}`);
    return {};
  }
}

// ── copertura UNICA del mese ──────────────────────────────────────────────
// period=days_28 dà le persone diverse raggiunte nelle 28 giornate precedenti.
// Sommare invece la copertura giorno per giorno conterebbe più volte la stessa
// persona e gonfierebbe il dato di 2-3 volte: agosto sarebbe uscito 956.294
// contro i 360.953 di luglio, un +165% che non è mai successo.
async function reachUnico(fineMese) {
  try {
    const r = await api(`/${IG_ID}/insights?metric=reach&period=days_28&since=${fineMese - GIORNO * 2}&until=${fineMese}`);
    const valori = r.data?.[0]?.values || [];
    return valori.length ? (valori[valori.length - 1].value || 0) : 0;
  } catch (e) {
    console.warn('  ⚠ copertura del mese non disponibile:', e.message);
    return 0;
  }
}

// ── visualizzazioni totali del mese ───────────────────────────────────────
// Meta rifiuta finestre superiori a 30 giorni, quindi il mese va spezzato.
async function viewsTotali(since, until) {
  const BLOCCO = GIORNO * 29;
  let totale = 0;
  try {
    for (let da = since; da < until; da += BLOCCO) {
      const a = Math.min(da + BLOCCO, until);
      const r = await api(`/${IG_ID}/insights?metric=views&period=day&metric_type=total_value&since=${da}&until=${a}`);
      totale += r.data?.[0]?.total_value?.value || 0;
    }
    return totale;
  } catch (e) {
    console.warn('  ⚠ visualizzazioni del mese non disponibili:', e.message);
    return 0;
  }
}

async function fetchFollowers() {
  const data = await api(`/${IG_ID}?fields=followers_count`);
  return data.followers_count || 0;
}

// ── conversioni ──────────────────────────────────────────────────────────
function toTSType(meta) {
  if (meta === 'CAROUSEL_ALBUM') return 'CAROUSEL';
  if (meta === 'IMAGE') return 'IMAGE';
  return 'REEL';
}

function isCollab(caption = '') {
  return /\(via @|\bAdv\b|\bSupplied\b/i.test(caption);
}

function escapeStr(s = '') {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// ── inserimento nel file dei dati ─────────────────────────────────────────
// Aggiunge `elementi` in fondo all'array che precede `dichiarazioneSuccessiva`.
//
// Ci si ancora a ciò che viene DOPO, non a un commento vicino: la prima
// versione cercava il commento "// ── Storico mensile" e finiva per scrivere i
// post dentro STORIES invece che dentro POSTS, perché quel commento sta dopo
// entrambi gli array. Il nome della dichiarazione successiva, invece, è unico.
function inCodaAllArrayCheStaPrimaDi(testoFile, dichiarazioneSuccessiva, elementi) {
  const dopo = testoFile.indexOf(dichiarazioneSuccessiva);
  if (dopo === -1) {
    throw new Error(`Non trovo "${dichiarazioneSuccessiva}" in mockData.ts: il file è cambiato, aggiorna lo script.`);
  }

  const chiusura = testoFile.lastIndexOf('\n]\n', dopo);
  if (chiusura === -1) {
    throw new Error(`Non trovo la chiusura dell'array prima di "${dichiarazioneSuccessiva}".`);
  }

  const prima = testoFile.slice(0, chiusura);
  // l'ultimo elemento può già avere la virgola: aggiungerne un'altra creerebbe
  // un buco nell'array (`},,` = un elemento `undefined`) e il tipo salterebbe
  const virgola = prima.trimEnd().endsWith(',') ? '' : ',';

  return prima + virgola + '\n' + elementi + testoFile.slice(chiusura);
}

// ── rimozione di un mese già scritto (per SOVRASCRIVI=1) ──────────────────
function rimuoviMese(testoFile, key) {
  const righe = testoFile.split('\n');
  const tenute = [];
  let dentroIlBlocco = false;

  for (const riga of righe) {
    if (riga.includes(`// ── ${key} – post da API Meta`)) { dentroIlBlocco = true; continue; }
    if (dentroIlBlocco) {
      // il blocco finisce alla chiusura dell'array o all'inizio del mese dopo
      if (riga === ']' || /\/\/ ── \d{4}-\d{2} – post da API Meta/.test(riga)) dentroIlBlocco = false;
      else continue;
    }
    if (riga.includes(`{ month: '${key}'`)) continue;
    tenute.push(riga);
  }
  return tenute.join('\n');
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  const { since, until, key, label } = meseDaSincronizzare();
  const sovrascrivi = process.env.SOVRASCRIVI === '1';

  console.log(`\n📅 Sincronizzazione: ${label} (${key})${sovrascrivi ? ' — SOVRASCRITTURA' : ''}\n`);

  console.log('📸 Recupero i contenuti...');
  const media = await fetchMedia(since, until);
  console.log(`   ${media.length} contenuti trovati`);

  if (media.length === 0) {
    console.log('   Nessun contenuto da aggiungere.');
    return;
  }

  const posts = [];
  let prossimoId = 600;

  for (const m of media) {
    const giorno = m.timestamp.slice(0, 10);
    console.log(`   → ${giorno} [${m.media_type}] ${(m.caption || '').slice(0, 45).replace(/\n/g, ' ')}…`);
    const ins = await fetchInsights(m.id, m.media_type);

    const video     = ['REEL', 'VIDEO'].includes(m.media_type);
    const likes     = m.like_count     || 0;
    const commenti  = m.comments_count || 0;
    const shares    = ins.shares       || 0;
    const salvataggi = ins.saved       || 0;
    const reach     = ins.reach        || 0;
    const views     = ins.views ?? null;
    const watchMs   = ins.ig_reels_avg_watch_time || null;
    const er        = reach > 0
      ? Math.round(((likes + commenti + shares + salvataggi) / reach) * 1000) / 10
      : 0;

    posts.push({
      id: prossimoId++, type: toTSType(m.media_type), date: giorno,
      caption: escapeStr(m.caption || ''),
      reach,
      // Meta ha unito impressioni e visualizzazioni in `views`: le teniamo su
      // un campo solo per non mostrare due colonne con lo stesso numero
      impressions: video ? null : views,
      likes, comments: commenti, shares, saves: salvataggi,
      views: video ? views : null,
      avgWatchTimeSec: watchMs ? Math.round(watchMs / 1000) : null,
      engagementRate: er,
      isCollaboration: isCollab(m.caption),
    });
  }

  console.log('\n📊 Statistiche del profilo...');
  const totalReach       = await reachUnico(until);
  const totalImpressions = await viewsTotali(since, until);
  const followersEnd     = await fetchFollowers();
  console.log(`   copertura unica: ${totalReach.toLocaleString('it-IT')} · visualizzazioni: ${totalImpressions.toLocaleString('it-IT')} · follower: ${followersEnd.toLocaleString('it-IT')}`);

  const totalLikes    = posts.reduce((s, p) => s + p.likes,    0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);
  const totalShares   = posts.reduce((s, p) => s + p.shares,   0);
  const totalSaves    = posts.reduce((s, p) => s + p.saves,    0);
  const reelsCount    = posts.filter(p => p.type === 'REEL').length;
  const carouselCount = posts.filter(p => p.type === 'CAROUSEL').length;
  const avgER         = posts.length
    ? Math.round(posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length * 10) / 10
    : 0;

  // Like e commenti arrivano insieme al contenuto; copertura, salvataggi e
  // condivisioni solo dalle statistiche. Se la copertura è zero ovunque, Meta
  // le ha rifiutate: quasi sempre manca `instagram_manage_insights` al token.
  if (posts.every(p => p.reach === 0)) {
    console.warn('\n⚠️  ATTENZIONE: copertura a zero su TUTTI i contenuti.');
    console.warn('    Meta ha rifiutato le statistiche (di solito errore #10).');
    console.warn('    Il token va rigenerato aggiungendo il permesso `instagram_manage_insights`.');
    console.warn('    Like, commenti e follower qui sopra sono comunque reali.\n');
  }

  const postsBlock = posts.map(p => `  {
    id: ${p.id}, type: '${p.type}', date: '${p.date}',
    caption: '${p.caption.slice(0, 150)}',
    topic: 'brand',
    reach: ${p.reach}, impressions: ${p.impressions ?? 'null'}, likes: ${p.likes}, comments: ${p.comments}, shares: ${p.shares}, saves: ${p.saves},
    views: ${p.views ?? 'null'}, avgWatchTimeSec: ${p.avgWatchTimeSec ?? 'null'},
    engagementRate: ${p.engagementRate},
    isCollaboration: ${p.isCollaboration},
  }`).join(',\n');

  const monthlyLine = `  { month: '${key}', label: '${label}', followersEnd: ${followersEnd}, followersGained: 0, followersLost: 0, totalReach: ${totalReach}, totalImpressions: ${totalImpressions}, avgEngagementRate: ${avgER}, postsPublished: ${posts.length}, reelsPublished: ${reelsCount}, storiesPublished: 0, carouselsPublished: ${carouselCount}, totalLikes: ${totalLikes}, totalComments: ${totalComments}, totalShares: ${totalShares}, totalSaves: ${totalSaves} },`;

  const mockPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
  let src = fs.readFileSync(mockPath, 'utf-8');

  if (src.includes(`month: '${key}'`)) {
    if (!sovrascrivi) {
      console.log(`\n⚠️  Il mese ${key} è già presente — non tocco niente.`);
      console.log('    Per rifarlo:  SOVRASCRIVI=1 MESE=' + key + ' node scripts/sync-meta.js');
      return;
    }
    console.log(`\n🧹 Rimuovo i dati già presenti di ${key}...`);
    src = rimuoviMese(src, key);
  }

  console.log('\n📝 Aggiornamento mockData.ts...');

  const chiusurePrima = (src.match(/^\]$/gm) || []).length;

  src = inCodaAllArrayCheStaPrimaDi(
    src,
    'export const STORIES',
    `  // ── ${key} – post da API Meta ──────────────────────────────────────────\n${postsBlock}`
  );
  src = inCodaAllArrayCheStaPrimaDi(src, 'export const FOLLOWER_DAILY', monthlyLine);

  // Se il numero di parentesi di chiusura è cambiato ne abbiamo aggiunta o persa
  // una: il file non compila, Vercel fallisce il build in silenzio e continua a
  // servire la versione vecchia. Meglio fermarsi qui che pubblicare un file rotto.
  const chiusureDopo = (src.match(/^\]$/gm) || []).length;
  if (chiusureDopo !== chiusurePrima) {
    throw new Error(`mockData.ts non è bilanciato: ${chiusurePrima} "]" prima, ${chiusureDopo} dopo. Non scrivo il file.`);
  }

  fs.writeFileSync(mockPath, src, 'utf-8');

  console.log(`\n✅ mockData.ts aggiornato — ${key}`);
  console.log(`   ${posts.length} contenuti · copertura ${totalReach.toLocaleString('it-IT')} · engagement medio ${avgER}%`);
  console.log('\n📌 Restano da aggiornare a mano (non disponibili via API):');
  console.log('   • Stories (l\'API espone solo le ultime 24 ore)');
  console.log('   • Dati demografici (CSV da Meta Business Suite)');
  console.log('   • Follower acquisiti e persi (non esposti dall\'API)');
  console.log('   • AUTO_INSIGHTS (analisi qualitativa)');
}

main().catch(e => {
  console.error('\n❌ Errore:', e.message);
  process.exit(1);
});
