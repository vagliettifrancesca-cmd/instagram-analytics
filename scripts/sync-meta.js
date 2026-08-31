// ════════════════════════════════════════════════════════════════════════
// sync-meta.js — scarica i dati Instagram del mese precedente e aggiorna
// mockData.ts. Eseguito dal GitHub Action il 1° di ogni mese (e a mano).
//
// Variabili richieste (GitHub Secrets):
//   META_ACCESS_TOKEN  — token a lunga durata (valido ~60 gg, rigenera con meta-refresh.js)
//   IG_USER_ID         — ID account Instagram Business (es. 17841457894854297)
// ════════════════════════════════════════════════════════════════════════

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const V     = 'v21.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ID = process.env.IG_USER_ID;

if (!TOKEN || !IG_ID) {
  console.error('❌  META_ACCESS_TOKEN e IG_USER_ID sono richiesti come variabili d\'ambiente.');
  console.error('    Localmente: META_ACCESS_TOKEN=... IG_USER_ID=... node scripts/sync-meta.js');
  process.exit(1);
}

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

// ── calcolo mese precedente ───────────────────────────────────────────────
function prevMonth() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 1);
  const MESI  = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  return {
    since:  Math.floor(start.getTime() / 1000),
    until:  Math.floor(end.getTime()   / 1000),
    key:    start.toISOString().slice(0, 7),          // es. "2026-08"
    label:  `${MESI[start.getMonth()]} ${String(start.getFullYear()).slice(2)}`, // es. "Ago 26"
  };
}

// ── fetch lista media del mese ────────────────────────────────────────────
async function fetchMedia(since, until) {
  const fields = 'id,caption,media_type,timestamp,like_count,comments_count,permalink';
  let endpoint = `/${IG_ID}/media?fields=${fields}&since=${since}&until=${until}&limit=50`;
  const all = [];
  while (endpoint) {
    const data = await api(endpoint);
    if (data.data) all.push(...data.data);
    if (data.paging?.next) {
      // next è un URL completo — estraiamo solo il path+query senza il token
      const url  = new URL(data.paging.next);
      url.searchParams.delete('access_token');
      endpoint = url.pathname + '?' + url.searchParams.toString();
    } else {
      endpoint = null;
    }
  }
  return all;
}

// ── insight per singolo post/reel ─────────────────────────────────────────
async function fetchInsights(mediaId, mediaType) {
  const isVideo = ['REEL', 'VIDEO'].includes(mediaType);
  const metrics = ['reach', 'impressions', 'saved', 'shares', ...(isVideo ? ['video_views', 'ig_reels_avg_watch_time'] : [])].join(',');
  try {
    const data = await api(`/${mediaId}/insights?metric=${metrics}`);
    return Object.fromEntries((data.data || []).map(i => [i.name, i.values?.[0]?.value ?? i.value ?? 0]));
  } catch (e) {
    console.warn(`    ⚠ insight non disponibili per ${mediaId}: ${e.message}`);
    return {};
  }
}

// ── insight account (reach/impression mensili) ────────────────────────────
async function fetchAccountInsights(since, until) {
  try {
    const data = await api(`/${IG_ID}/insights?metric=reach,impressions&period=month&since=${since}&until=${until}`);
    return Object.fromEntries((data.data || []).map(i => [i.name, i.values?.[0]?.value ?? 0]));
  } catch (e) {
    console.warn('  ⚠ insight account non disponibili:', e.message);
    return {};
  }
}

// ── follower attuali ──────────────────────────────────────────────────────
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

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  const { since, until, key, label } = prevMonth();
  console.log(`\n📅 Sincronizzazione: ${label} (${key})\n`);

  // 1. Media del mese
  console.log('📸 Recupero post...');
  const media = await fetchMedia(since, until);
  console.log(`   ${media.length} post trovati`);

  if (media.length === 0) {
    console.log('   Nessun post da aggiungere.');
    return;
  }

  // 2. Insights per ogni post
  const posts = [];
  let nextId  = 600; // offset id per i nuovi post (evita collisioni)

  for (const m of media) {
    const day = m.timestamp.slice(0, 10);
    console.log(`   → ${day} [${m.media_type}] ${(m.caption || '').slice(0, 50).replace(/\n/g, ' ')}…`);
    const ins = await fetchInsights(m.id, m.media_type);

    const likes    = m.like_count     || 0;
    const comments = m.comments_count || 0;
    const shares   = ins.shares       || 0;
    const saves    = ins.saved        || 0;
    const reach    = ins.reach        || 0;
    const views    = ins.video_views  || null;
    const watchMs  = ins.ig_reels_avg_watch_time || null;
    const er       = reach > 0 ? Math.round(((likes + comments + shares + saves) / reach) * 1000) / 10 : 0;

    posts.push({
      id:               nextId++,
      type:             toTSType(m.media_type),
      date:             day,
      caption:          escapeStr(m.caption || ''),
      reach,
      impressions:      ins.impressions || null,
      likes, comments, shares, saves,
      views,
      avgWatchTimeSec:  watchMs ? Math.round(watchMs / 1000) : null,
      engagementRate:   er,
      isCollaboration:  isCollab(m.caption),
    });
  }

  // 3. Insight account e follower
  console.log('\n📊 Insight account...');
  const acct        = await fetchAccountInsights(since, until);
  const followersEnd = await fetchFollowers();
  const totalReach       = acct.reach       || posts.reduce((s, p) => s + p.reach, 0);
  const totalImpressions = acct.impressions  || 0;

  const totalLikes    = posts.reduce((s, p) => s + p.likes,    0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);
  const totalShares   = posts.reduce((s, p) => s + p.shares,   0);
  const totalSaves    = posts.reduce((s, p) => s + p.saves,    0);
  const reelsCount    = posts.filter(p => p.type === 'REEL').length;
  const carouselCount = posts.filter(p => p.type === 'CAROUSEL').length;
  const avgER         = posts.length
    ? Math.round(posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length * 10) / 10
    : 0;

  // 4. Genera il codice TypeScript
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

  // 5. Aggiorna mockData.ts
  const mockPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
  let src = fs.readFileSync(mockPath, 'utf-8');

  if (src.includes(`month: '${key}'`)) {
    console.log(`\n⚠️  Mese ${key} già presente — skip. Nessuna modifica.`);
    return;
  }

  console.log('\n📝 Aggiornamento mockData.ts...');

  // Inserisce i post prima del commento "// ── Storico mensile"
  src = src.replace(
    /(\n\]\n\n\/\/ ── Storico mensile)/,
    `,\n  // ── ${key} – post da API Meta ──────────────────────────────────────────\n${postsBlock}\n]$1`
  );

  // Inserisce la riga mensile prima della ] finale di MONTHLY_HISTORY
  // Ancora: ultima riga che ha format "  { month: '20xx-xx', ..."
  src = src.replace(
    /(  \{ month: '\d{4}-\d{2}'[^\n]+\},?\n\](\n\n\/\/ Follower))/,
    match => match.replace(/\](\n\n\/\/ Follower)/, `\n${monthlyLine}\n]$1`)
  );

  fs.writeFileSync(mockPath, src, 'utf-8');

  console.log(`\n✅ mockData.ts aggiornato — ${key}`);
  console.log(`   Post: ${posts.length} | Reach: ${totalReach.toLocaleString('it-IT')} | Follower: ${followersEnd.toLocaleString('it-IT')}`);
  console.log('\n📌 Da aggiornare manualmente (non disponibili via API storica):');
  console.log('   • Stories (solo ultime 24h via API)');
  console.log('   • Dati demografici (CSV Meta Business Suite)');
  console.log('   • followersGained / followersLost (non accessibili via API base)');
  console.log('   • AUTO_INSIGHTS (analisi qualitativa)');
}

main().catch(e => {
  console.error('\n❌ Errore:', e.message);
  process.exit(1);
});
