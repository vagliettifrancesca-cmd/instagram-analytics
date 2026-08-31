import { POSTS, STORIES, MONTHLY_HISTORY } from '../data/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill || p.stroke }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString('it-IT') : `${p.value}${p.name?.includes('%') || p.dataKey?.includes('ER') || p.dataKey?.includes('er') ? '%' : ''}`}
        </p>
      ))}
    </div>
  )
}

export default function PerformancePage({ month }: { month: string }) {
  const monthPosts = POSTS.filter(p => p.date.startsWith(month))
  const ownPosts   = monthPosts.filter(p => !p.isCollaboration)
  const collabPosts = monthPosts.filter(p => p.isCollaboration)

  // ── Reach organico vs collab ─────────────────────────────────────────────
  const ownReach    = ownPosts.reduce((a, p) => a + p.reach, 0)
  const collabImp   = collabPosts.reduce((a, p) => a + (p.impressions || 0), 0)
  const ownER       = ownPosts.length ? Math.round(ownPosts.reduce((a, p) => a + p.engagementRate, 0) / ownPosts.length * 10) / 10 : 0
  const collabER    = collabPosts.length ? Math.round(collabPosts.reduce((a, p) => a + p.engagementRate, 0) / collabPosts.length * 10) / 10 : 0

  // ── Per formato ──────────────────────────────────────────────────────────
  type FormatStat = { name: string; posts: number; avgReach: number; avgER: number; avgSaves: number; avgShares: number; avgLikes: number }
  const byType: FormatStat[] = (['REEL', 'CAROUSEL'] as const).flatMap(t => {
    const posts = monthPosts.filter(p => p.type === t)
    if (!posts.length) return []
    return [{
      name: t === 'REEL' ? 'Reel' : 'Carousel',
      posts: posts.length,
      avgReach: Math.round(posts.reduce((a, p) => a + p.reach, 0) / posts.length),
      avgER: Math.round(posts.reduce((a, p) => a + p.engagementRate, 0) / posts.length * 10) / 10,
      avgSaves: Math.round(posts.reduce((a, p) => a + p.saves, 0) / posts.length * 10) / 10,
      avgShares: Math.round(posts.reduce((a, p) => a + p.shares, 0) / posts.length * 10) / 10,
      avgLikes: Math.round(posts.reduce((a, p) => a + p.likes, 0) / posts.length),
    }]
  })

  // ── Top 5 post del mese ───────────────────────────────────────────────────
  const top5 = [...monthPosts].sort((a, b) => b.reach + b.likes * 10 - (a.reach + a.likes * 10)).slice(0, 5)

  // ── Confronto mensile ultimi 4 mesi ────────────────────────────────────────
  const idx = MONTHLY_HISTORY.findIndex(m => m.month === month)
  const last4 = MONTHLY_HISTORY.slice(Math.max(0, idx - 3), idx + 1)


  const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : String(n)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl font-bold">Performance avanzata</h2>
        <p className="text-gray-500 text-sm mt-1">Analisi dettagliata per formato, fonte e trend — {month.replace('-', '/')}</p>
      </div>

      {/* Organico vs Collab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-1">Post propri vs Collaborazioni</p>
          <p className="text-xs text-gray-500 mb-4">Confronto reach, interazioni e conversione</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Post propri', n: ownPosts.length, reach: fmtK(ownReach), er: `${ownER}%`, color: 'text-pink-400', bg: 'bg-pink-600/10 border-pink-600/20' },
              { label: 'Collaborazioni', n: collabPosts.length, reach: fmtK(collabImp), er: `${collabER}%`, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-600/20' },
            ].map(c => (
              <div key={c.label} className={`${c.bg} border rounded-xl p-4`}>
                <p className={`text-xs font-medium ${c.color} mb-2`}>{c.label}</p>
                <p className="text-white text-2xl font-bold">{c.n}</p>
                <p className="text-gray-500 text-xs mb-3">contenuti</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-400">Reach/Views</span><span className="text-white font-semibold">{c.reach}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">ER medio</span><span className={`font-semibold ${c.color}`}>{c.er}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-surface-700/40 rounded-xl p-3 text-xs text-gray-400">
            💡 Le collaborazioni raggiungono un pubblico <span className="text-white font-medium">non-follower</span> — fondamentali per la crescita
          </div>
        </div>

        {/* Confronto per formato */}
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-1">Metriche per formato</p>
          <p className="text-xs text-gray-500 mb-4">Valori medi per Reel e Carousel</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byType} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A141014" />
              <XAxis dataKey="name" tick={{ fill: '#8B8078', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6F655C', fontSize: 10 }} tickLine={false} axisLine={false} width={38} />
              <Tooltip content={<TT />} />
              <Bar dataKey="avgLikes" name="Like medi" fill="#FF5740" fillOpacity={0.8} radius={[3,3,0,0]} />
              <Bar dataKey="avgShares" name="Condivisioni medie" fill="#2E7D32" fillOpacity={0.8} radius={[3,3,0,0]} />
              <Bar dataKey="avgSaves" name="Salvataggi medi" fill="#D98324" fillOpacity={0.8} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block"/>Like</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Condivisioni</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Salvataggi</span>
          </div>
        </div>
      </div>

      {/* Trend mensile */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-1">Trend reach ultimi {last4.length} mesi</p>
        <p className="text-xs text-gray-500 mb-4">Reach totale account (post propri + collab + earned media)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={last4} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A141014" />
            <XAxis dataKey="label" tick={{ fill: '#8B8078', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6F655C', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmtK(v)} width={42} />
            <Tooltip content={<TT />} />
            <Bar dataKey="totalReach" name="Reach" fill="#FF5740" fillOpacity={0.75} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 contenuti */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-1">Top 5 contenuti del mese</p>
        <p className="text-xs text-gray-500 mb-4">Ordinati per impatto (reach + like)</p>
        <div className="space-y-3">
          {top5.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 bg-surface-700/30 rounded-xl p-3">
              <span className="text-2xl font-black text-gray-600 w-7 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm line-clamp-1">{p.caption}</p>
                <p className="text-gray-500 text-xs mt-0.5">{p.date} · {p.type}{p.isCollaboration ? ' · 🤝 Collab' : ''}</p>
              </div>
              <div className="flex gap-4 text-xs text-right shrink-0">
                <div><p className="text-white font-bold">{fmtK(p.reach || p.impressions || 0)}</p><p className="text-gray-500">reach</p></div>
                <div><p className="text-pink-400 font-bold">{p.engagementRate}%</p><p className="text-gray-500">ER</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabella per formato */}
      {byType.length > 0 && (
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-4">Riepilogo metriche per formato</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500">
                  {['Formato', 'N° post', 'Reach media', 'Like medi', 'Salvataggi', 'ER medio', 'Condivisioni'].map(h => (
                    <th key={h} className="py-2 px-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byType.map(t => (
                  <tr key={t.name} className="border-b border-white/5">
                    <td className="py-3 px-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${t.name === 'Reel' ? 'bg-pink-600/20 text-pink-400 border-pink-600/30' : 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30'}`}>{t.name}</span></td>
                    <td className="py-3 px-3 text-gray-300">{t.posts}</td>
                    <td className="py-3 px-3 text-gray-300 font-medium">{fmtK(t.avgReach)}</td>
                    <td className="py-3 px-3 text-gray-300">{t.avgLikes}</td>
                    <td className="py-3 px-3 text-gray-300">{t.avgSaves}</td>
                    <td className="py-3 px-3"><span className={`font-bold ${t.avgER >= 3.5 ? 'text-emerald-400' : t.avgER >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>{t.avgER}%</span></td>
                    <td className="py-3 px-3 text-gray-300">{t.avgShares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Analisi contenuti: Post / Reel ─────────────────────────────────── */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-1">Analisi contenuti — Post & Reel</p>
        <p className="text-xs text-gray-500 mb-4">{monthPosts.length} contenuti · {month.replace('-', '/')} · dati da CSV</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                {['Data', 'Tipo', 'Contenuto', 'Reach', 'Imp.', '❤️ Like', '💬 Com.', '↗️ Cond.', '🔖 Salv.', 'ER%'].map(h => (
                  <th key={h} className="py-2 px-2 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthPosts].sort((a, b) => a.date.localeCompare(b.date)).map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{p.date.slice(5).replace('-', '/')}</td>
                  <td className="py-2.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded font-medium border text-[10px] ${
                      p.type === 'REEL'     ? 'bg-pink-600/20 text-pink-400 border-pink-600/30' :
                      p.type === 'CAROUSEL' ? 'bg-violet-600/20 text-violet-400 border-violet-600/30' :
                                              'bg-blue-600/20 text-blue-400 border-blue-600/30'
                    }`}>{p.type === 'CAROUSEL' ? 'CAR' : p.type}</span>
                    {p.isCollaboration && <span className="ml-1 text-emerald-400 text-[10px]">🤝</span>}
                  </td>
                  <td className="py-2.5 px-2 text-gray-300 max-w-[180px]">
                    <span className="block truncate" title={p.caption}>{p.caption}</span>
                  </td>
                  <td className="py-2.5 px-2 text-white font-semibold">{fmtK(p.reach)}</td>
                  <td className="py-2.5 px-2 text-gray-400">{p.impressions != null ? fmtK(p.impressions) : '—'}</td>
                  <td className="py-2.5 px-2 text-pink-300">{p.likes}</td>
                  <td className="py-2.5 px-2 text-blue-300">{p.comments}</td>
                  <td className="py-2.5 px-2 text-emerald-300">{p.shares}</td>
                  <td className="py-2.5 px-2 text-amber-300">{p.saves}</td>
                  <td className="py-2.5 px-2">
                    <span className={`font-bold ${p.engagementRate >= 3.5 ? 'text-emerald-400' : p.engagementRate >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {p.engagementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-surface-700/30">
                <td colSpan={3} className="py-2.5 px-2 text-gray-500 font-medium">Totali / medie</td>
                <td className="py-2.5 px-2 text-white font-bold">{fmtK(monthPosts.reduce((a, p) => a + p.reach, 0))}</td>
                <td className="py-2.5 px-2 text-gray-400 font-semibold">{fmtK(monthPosts.reduce((a, p) => a + (p.impressions ?? 0), 0))}</td>
                <td className="py-2.5 px-2 text-pink-300 font-semibold">{monthPosts.reduce((a, p) => a + p.likes, 0)}</td>
                <td className="py-2.5 px-2 text-blue-300 font-semibold">{monthPosts.reduce((a, p) => a + p.comments, 0)}</td>
                <td className="py-2.5 px-2 text-emerald-300 font-semibold">{monthPosts.reduce((a, p) => a + p.shares, 0)}</td>
                <td className="py-2.5 px-2 text-amber-300 font-semibold">{monthPosts.reduce((a, p) => a + p.saves, 0)}</td>
                <td className="py-2.5 px-2 font-bold text-white">
                  {monthPosts.length ? (Math.round(monthPosts.reduce((a, p) => a + p.engagementRate, 0) / monthPosts.length * 10) / 10) : 0}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Analisi contenuti: Stories ──────────────────────────────────────── */}
      {(() => {
        const monthStories = STORIES.filter(s => s.date.startsWith(month))
        if (!monthStories.length) return null
        const sorted = [...monthStories].sort((a, b) => a.date.localeCompare(b.date))
        return (
          <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
            <p className="text-white font-semibold mb-1">Analisi contenuti — Stories</p>
            <p className="text-xs text-gray-500 mb-4">{monthStories.length} stories · {month.replace('-', '/')} · dati da CSV</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500">
                    {['Data', 'Contenuto', 'Reach', 'Imp.', 'Exits', 'Tap avanti', 'Risposte', 'Link click', 'Completion%'].map(h => (
                      <th key={h} className="py-2 px-2 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(s => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{s.date.slice(5).replace('-', '/')}</td>
                      <td className="py-2.5 px-2 text-gray-300 max-w-[200px]">
                        <span className="block truncate" title={s.caption}>{s.caption}</span>
                      </td>
                      <td className="py-2.5 px-2 text-white font-semibold">{s.reach.toLocaleString('it-IT')}</td>
                      <td className="py-2.5 px-2 text-gray-400">{s.impressions.toLocaleString('it-IT')}</td>
                      <td className="py-2.5 px-2 text-rose-300">{s.exits}</td>
                      <td className="py-2.5 px-2 text-blue-300">{s.tapsForward}</td>
                      <td className="py-2.5 px-2 text-emerald-300">{s.replies}</td>
                      <td className="py-2.5 px-2 text-amber-300">{s.linkClicks ?? '—'}</td>
                      <td className="py-2.5 px-2">
                        <span className={`font-bold ${s.completionRate >= 90 ? 'text-emerald-400' : s.completionRate >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {s.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-surface-700/30">
                    <td colSpan={2} className="py-2.5 px-2 text-gray-500 font-medium">Totali / medie</td>
                    <td className="py-2.5 px-2 text-white font-bold">{Math.round(sorted.reduce((a, s) => a + s.reach, 0) / sorted.length).toLocaleString('it-IT')}<span className="text-gray-500 font-normal"> media</span></td>
                    <td className="py-2.5 px-2 text-gray-400 font-semibold">{Math.round(sorted.reduce((a, s) => a + s.impressions, 0) / sorted.length).toLocaleString('it-IT')}</td>
                    <td className="py-2.5 px-2 text-rose-300 font-semibold">{sorted.reduce((a, s) => a + s.exits, 0)}</td>
                    <td className="py-2.5 px-2 text-blue-300 font-semibold">{sorted.reduce((a, s) => a + s.tapsForward, 0)}</td>
                    <td className="py-2.5 px-2 text-emerald-300 font-semibold">{sorted.reduce((a, s) => a + s.replies, 0)}</td>
                    <td className="py-2.5 px-2 text-amber-300 font-semibold">{sorted.reduce((a, s) => a + (s.linkClicks ?? 0), 0)}</td>
                    <td className="py-2.5 px-2 text-white font-bold">
                      {Math.round(sorted.reduce((a, s) => a + s.completionRate, 0) / sorted.length * 10) / 10}%<span className="text-gray-500 font-normal"> media</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
