import { useState } from 'react'
import { POSTS } from '../data/mockData'
import type { Post } from '../types/instagram'
import { X } from 'lucide-react'

type CollabPost = Post & { collaborator: string }

function getCollaborator(caption: string): string {
  const m = caption.match(/\(via @([^\s·)]+)\)/)
  return m ? `@${m[1]}` : 'Collaborazione'
}

function fmtN(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}K`
  return `${n}`
}

function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}

const MONTHS: Record<string, string> = { '01': 'Gen', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mag', '06': 'Giu', '07': 'Lug', '08': 'Ago' }
function fmtDate(d: string): string {
  const [, mm, dd] = d.split('-')
  return `${parseInt(dd)} ${MONTHS[mm] ?? mm}`
}

function viewsPer1K(p: CollabPost): number | null {
  const v = p.views ?? p.impressions ?? 0
  if (!p.creatorFollowers || v === 0) return null
  return Math.round(v / (p.creatorFollowers / 1000))
}

function organicInteractions(p: CollabPost) {
  return {
    likes:    p.likes    - (p.advLikes    ?? 0),
    comments: p.comments - (p.advComments ?? 0),
    shares:   p.shares   - (p.advShares   ?? 0),
    saves:    p.saves    - (p.advSaves    ?? 0),
  }
}

function organicERonFollowers(p: CollabPost): number | null {
  if (!p.creatorFollowers) return null
  const o = organicInteractions(p)
  return Math.round((o.likes + o.comments + o.shares + o.saves) / p.creatorFollowers * 10000) / 100
}

const COLLAB_POSTS: CollabPost[] = POSTS
  .filter(p => p.isCollaboration)
  .sort((a, b) => a.date.localeCompare(b.date))
  .map(p => ({ ...p, collaborator: getCollaborator(p.caption) }))

export default function CollaborationsPage() {
  const [selected, setSelected] = useState<number[]>([])

  function toggle(id: number) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 2 ? [prev[1], id] : [...prev, id]
    )
  }

  const totViews    = COLLAB_POSTS.reduce((s, p) => s + (p.views ?? p.impressions ?? 0), 0)
  const totLikes    = COLLAB_POSTS.reduce((s, p) => s + p.likes, 0)
  const totShares   = COLLAB_POSTS.reduce((s, p) => s + p.shares, 0)
  const totComments = COLLAB_POSTS.reduce((s, p) => s + p.comments, 0)
  const best = [...COLLAB_POSTS].sort((a, b) =>
    (b.views ?? b.impressions ?? 0) - (a.views ?? a.impressions ?? 0)
  )[0]

  const postA = selected[0] != null ? COLLAB_POSTS.find(p => p.id === selected[0]) ?? null : null
  const postB = selected[1] != null ? COLLAB_POSTS.find(p => p.id === selected[1]) ?? null : null

  const hasNormCol = COLLAB_POSTS.some(p => p.creatorFollowers)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white text-xl font-semibold">Collaborazioni</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {COLLAB_POSTS.length} post & reel in collaborazione · da marzo 2026
          </p>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-pink-600/10 border border-pink-600/20 rounded-xl px-3 py-2">
            <span className="text-xs text-pink-400 font-medium">
              {selected.length === 1
                ? 'Seleziona un secondo contenuto per confrontare'
                : 'Confronto attivo — vedi sotto ↓'}
            </span>
            <button onClick={() => setSelected([])} className="text-pink-400/60 hover:text-pink-400 transition-colors ml-1">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'N° collaborazioni', value: COLLAB_POSTS.length.toString(), sub: 'post & reel da mar 2026' },
          { label: 'Views totali',      value: fmtN(totViews),                 sub: 'somma tutte le collab' },
          { label: 'Like totali',       value: fmtN(totLikes),                 sub: `+ ${fmtN(totComments)} commenti` },
          { label: 'Condivisioni',      value: fmtN(totShares),                sub: 'impatto share organico' },
        ].map(k => (
          <div key={k.label} className="bg-surface-800 border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{k.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Best performer */}
      {best && (
        <div className="bg-gradient-to-r from-pink-600/20 to-surface-800 border border-pink-600/20 rounded-2xl p-4 flex items-center gap-4">
          <span className="text-2xl flex-shrink-0">🏆</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-pink-400 font-medium uppercase tracking-wider mb-0.5">Miglior collaborazione (views)</p>
            <p className="text-white font-semibold">{best.collaborator} · {fmtDate(best.date)}</p>
            <p className="text-gray-400 text-xs mt-1 truncate">
              {best.caption.replace(/\(via @[^)]+\)\.?/g, '').trim().slice(0, 100)}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-xl">{fmtN(best.views ?? best.impressions)}</p>
            <p className="text-gray-500 text-xs">views</p>
          </div>
        </div>
      )}

      {/* Comparison panel */}
      {postA && postB && (
        <ComparePanel a={postA} b={postB} onClose={() => setSelected([])} />
      )}

      {/* Table */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <p className="text-white font-semibold text-sm">Post & Reel in collaborazione</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Clicca su una riga per selezionarla · seleziona 2 contenuti per confrontarli
            {hasNormCol && ' · Views/1K = views normalizzate per follower del creator'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="w-8 px-4 py-3" />
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Collaboratore</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Data</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Tipo</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Views</th>
                {hasNormCol && <th className="text-right text-xs text-amber-500/70 font-medium px-4 py-3">Views/1K</th>}
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Like</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Comm.</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Condiv.</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">ER</th>
              </tr>
            </thead>
            <tbody>
              {COLLAB_POSTS.map(p => {
                const sel = selected.includes(p.id)
                const views = p.views ?? p.impressions ?? 0
                const v1k = viewsPer1K(p)
                const hasAdv = (p.advLikes ?? 0) + (p.advComments ?? 0) + (p.advShares ?? 0) > 0
                return (
                  <tr
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      sel ? 'bg-pink-600/10' : 'hover:bg-surface-700/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        sel ? 'bg-pink-600 border-pink-600' : 'border-gray-600'
                      }`}>
                        {sel && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-pink-400 font-medium text-sm">{p.collaborator}</p>
                        {hasAdv && (
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">ADV</span>
                        )}
                      </div>
                      {p.creatorFollowers && (
                        <p className="text-gray-600 text-xs mt-0.5">{fmtN(p.creatorFollowers)} follower</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(p.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.type === 'REEL' ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {p.type === 'REEL' ? 'Reel' : 'Carousel'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{fmtN(views)}</td>
                    {hasNormCol && (
                      <td className="px-4 py-3 text-right">
                        {v1k != null
                          ? <span className="text-amber-400 font-semibold">{v1k}</span>
                          : <span className="text-gray-600">—</span>}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-gray-300">{fmtN(p.likes)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmtN(p.comments)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmtN(p.shares)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        p.engagementRate >= 3 ? 'text-emerald-400' : p.engagementRate >= 2 ? 'text-amber-400' : 'text-gray-400'
                      }`}>
                        {p.engagementRate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface-700/20">
                <td colSpan={hasNormCol ? 5 : 4} className="px-4 py-3 text-xs text-gray-500 font-medium">
                  Totale {COLLAB_POSTS.length} collaborazioni
                </td>
                {hasNormCol && <td className="px-4 py-3" />}
                <td className="px-4 py-3 text-right text-white font-bold text-xs">{fmtN(totLikes)}</td>
                <td className="px-4 py-3 text-right text-white font-bold text-xs">{fmtN(totComments)}</td>
                <td className="px-4 py-3 text-right text-white font-bold text-xs">{fmtN(totShares)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}

// ── Comparison panel ───────────────────────────────────────────────────────────

function ComparePanel({ a, b, onClose }: { a: CollabPost; b: CollabPost; onClose: () => void }) {
  const vA = {
    views:    a.views ?? a.impressions ?? 0,
    reach:    a.reach > 0 ? a.reach : (a.views ?? a.impressions ?? 0),
    likes:    a.likes,
    comments: a.comments,
    shares:   a.shares,
    er:       a.engagementRate,
  }
  const vB = {
    views:    b.views ?? b.impressions ?? 0,
    reach:    b.reach > 0 ? b.reach : (b.views ?? b.impressions ?? 0),
    likes:    b.likes,
    comments: b.comments,
    shares:   b.shares,
    er:       b.engagementRate,
  }

  const metrics: { key: keyof typeof vA; label: string; isEr?: boolean }[] = [
    { key: 'views',    label: 'Views' },
    { key: 'reach',    label: 'Reach' },
    { key: 'likes',    label: 'Like' },
    { key: 'comments', label: 'Commenti' },
    { key: 'shares',   label: 'Condivisioni' },
    { key: 'er',       label: 'ER %', isEr: true },
  ]

  const winsA = metrics.filter(m => vA[m.key] > vB[m.key]).length
  const winsB = metrics.filter(m => vB[m.key] > vA[m.key]).length

  const bothHaveFollowers = !!(a.creatorFollowers && b.creatorFollowers)
  const aHasAdv = (a.advLikes ?? 0) + (a.advComments ?? 0) + (a.advShares ?? 0) > 0
  const bHasAdv = (b.advLikes ?? 0) + (b.advComments ?? 0) + (b.advShares ?? 0) > 0

  const oA = organicInteractions(a)
  const oB = organicInteractions(b)

  const v1kA = viewsPer1K(a)
  const v1kB = viewsPer1K(b)
  const erFolA = organicERonFollowers(a)
  const erFolB = organicERonFollowers(b)

  return (
    <div className="bg-surface-800 border border-pink-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-pink-600/10 to-transparent flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white font-semibold text-sm">Confronto</span>
          <span className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full text-sm font-medium">{a.collaborator}</span>
          <span className="text-gray-500 text-sm">vs</span>
          <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">{b.collaborator}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Caption preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        {([{ post: a, color: 'text-pink-400' }, { post: b, color: 'text-blue-400' }] as const).map(({ post, color }) => (
          <div key={post.id} className="p-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`font-semibold text-sm ${color}`}>{post.collaborator}</span>
              <span className="text-gray-500 text-xs">{fmtDate(post.date)} · {post.type === 'REEL' ? 'Reel' : 'Carousel'}</span>
              {post.creatorFollowers && (
                <span className="text-xs text-gray-600">{fmtN(post.creatorFollowers)} follower</span>
              )}
            </div>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
              {post.caption.replace(/\(via @[^)]+\)\.?/g, '').trim()}
            </p>
          </div>
        ))}
      </div>

      {/* Raw metrics */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-3">Metriche totali</p>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs text-gray-500 font-medium pb-3 w-28">Metrica</th>
              <th className="text-center text-xs text-pink-400 font-medium pb-3">{a.collaborator}</th>
              <th className="text-center text-xs text-gray-600 font-medium pb-3 w-8" />
              <th className="text-center text-xs text-blue-400 font-medium pb-3">{b.collaborator}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const av = vA[m.key] as number
              const bv = vB[m.key] as number
              const aWins = av > bv
              const bWins = bv > av
              return (
                <tr key={m.key} className="border-t border-white/5">
                  <td className="py-2 text-gray-500 text-xs">{m.label}</td>
                  <td className={`py-2 text-center font-bold text-sm ${aWins ? 'text-pink-400' : 'text-gray-400'}`}>
                    {m.isEr ? `${av}%` : fmtN(av)}{aWins && ' ✓'}
                  </td>
                  <td className="py-2 text-center text-gray-600 text-xs">{av === bv ? '=' : aWins ? '›' : '‹'}</td>
                  <td className={`py-2 text-center font-bold text-sm ${bWins ? 'text-blue-400' : 'text-gray-400'}`}>
                    {m.isEr ? `${bv}%` : fmtN(bv)}{bWins && ' ✓'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Winner summary */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${winsA > winsB ? 'bg-pink-600/20 text-pink-400' : 'bg-surface-700 text-gray-500'}`}>
            {a.collaborator} {winsA}/{metrics.length}
          </span>
          <span className="text-gray-600 text-sm">vs</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${winsB > winsA ? 'bg-blue-600/20 text-blue-400' : 'bg-surface-700 text-gray-500'}`}>
            {b.collaborator} {winsB}/{metrics.length}
          </span>
          <span className="text-xs text-gray-500">
            {winsA > winsB ? `${a.collaborator} vince su ${winsA} metriche`
              : winsB > winsA ? `${b.collaborator} vince su ${winsB} metriche`
              : 'Risultati equivalenti'}
          </span>
        </div>
      </div>

      {/* Normalizzato per audience creator */}
      {bothHaveFollowers && v1kA != null && v1kB != null && (
        <div className="p-4 border-t border-amber-500/15 bg-amber-500/5">
          <p className="text-xs text-amber-400 uppercase tracking-wider font-medium mb-3">
            Normalizzato per audience creator
          </p>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Con {fmtN(a.creatorFollowers)} vs {fmtN(b.creatorFollowers)} follower, il confronto diretto sui numeri assoluti
            è distorto. Queste metriche pesano le performance sulla dimensione dell'audience di ciascun creator.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Views / 1K followers */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Views per 1.000 follower del creator</p>
              <div className="space-y-2">
                {([{ post: a, v1k: v1kA, color: 'bg-pink-500' }, { post: b, v1k: v1kB, color: 'bg-blue-500' }]).map(({ post, v1k, color }) => {
                  const max = Math.max(v1kA, v1kB)
                  return (
                    <div key={post.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={post.id === a.id ? 'text-pink-400' : 'text-blue-400'}>{post.collaborator}</span>
                        <span className="text-white font-bold">{v1k}</span>
                      </div>
                      <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${(v1k / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Organic ER on followers */}
            <div>
              <p className="text-xs text-gray-500 mb-2">ER organico su follower del creator</p>
              <div className="space-y-2">
                {([{ post: a, er: erFolA, color: 'bg-pink-500' }, { post: b, er: erFolB, color: 'bg-blue-500' }]).map(({ post, er, color }) => {
                  const maxEr = Math.max(erFolA ?? 0, erFolB ?? 0)
                  if (er == null) return null
                  return (
                    <div key={post.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={post.id === a.id ? 'text-pink-400' : 'text-blue-400'}>{post.collaborator}</span>
                        <span className="text-white font-bold">{fmtPct(er, 2)}</span>
                      </div>
                      <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${(er / maxEr) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-surface-700/40 rounded-xl">
            <p className="text-xs text-gray-400 leading-relaxed">
              {v1kA > v1kB
                ? `🔍 Nonostante i numeri assoluti più alti, ${a.collaborator} genera ${v1kA} views/1K follower vs ${v1kB} di ${b.collaborator} — performance proporzionalmente simili.`
                : `🔍 ${b.collaborator} genera più views proporzionalmente al suo pubblico (${v1kB}/1K) rispetto a ${a.collaborator} (${v1kA}/1K), a parità di formato.`
              }
              {erFolA != null && erFolB != null && (
                erFolA > erFolB
                  ? ` Sull'ER organico vince ${a.collaborator} (${fmtPct(erFolA, 2)}) su ${b.collaborator} (${fmtPct(erFolB, 2)}).`
                  : erFolB > erFolA
                  ? ` Sull'ER organico vince ${b.collaborator} (${fmtPct(erFolB, 2)}) su ${a.collaborator} (${fmtPct(erFolA, 2)}).`
                  : ` ER organico equivalente.`
              )}
            </p>
          </div>
        </div>
      )}

      {/* ADV vs Organico breakdown */}
      {(aHasAdv || bHasAdv) && (
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-3">Dettaglio ADV / Organico</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {([{ post: a, hasAdv: aHasAdv, o: oA, color: 'text-pink-400' }, { post: b, hasAdv: bHasAdv, o: oB, color: 'text-blue-400' }]).map(({ post, hasAdv, o, color }) => (
              <div key={post.id}>
                <p className={`text-xs font-semibold mb-2 ${color}`}>{post.collaborator}</p>
                {!hasAdv ? (
                  <p className="text-xs text-gray-600">Dati ADV non disponibili — metriche tutte organiche.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-gray-500 font-medium pb-1.5 w-24"></th>
                        <th className="text-right text-amber-400 font-medium pb-1.5">ADV</th>
                        <th className="text-right text-emerald-400 font-medium pb-1.5">Organico</th>
                        <th className="text-right text-gray-400 font-medium pb-1.5">Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Like',        adv: post.advLikes    ?? 0, org: o.likes,    tot: post.likes    },
                        { label: 'Commenti',    adv: post.advComments ?? 0, org: o.comments, tot: post.comments },
                        { label: 'Condivisioni',adv: post.advShares   ?? 0, org: o.shares,   tot: post.shares   },
                        { label: 'Salvataggi',  adv: post.advSaves    ?? 0, org: o.saves,    tot: post.saves    },
                      ].map(row => (
                        <tr key={row.label} className="border-t border-white/5">
                          <td className="py-1.5 text-gray-500">{row.label}</td>
                          <td className="py-1.5 text-right text-amber-400">{fmtN(row.adv)}</td>
                          <td className="py-1.5 text-right text-emerald-400 font-medium">{fmtN(row.org)}</td>
                          <td className="py-1.5 text-right text-gray-300">{fmtN(row.tot)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-white/5">
                        <td className="pt-2 text-gray-500 font-medium">% organico</td>
                        <td colSpan={3} className="pt-2 text-right text-emerald-400 font-bold">
                          {fmtPct((o.likes + o.comments + o.shares + o.saves) / (post.likes + post.comments + post.shares + post.saves) * 100)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
