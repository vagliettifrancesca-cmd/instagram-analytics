import { STORIES, MONTHLY_HISTORY } from '../data/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill || p.stroke || '#fff' }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name?.includes('%') ? `${p.value}%` : p.value?.toLocaleString?.('it-IT') ?? p.value}
        </p>
      ))}
    </div>
  )
}

const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)

export default function StoriesPage({ month }: { month: string }) {
  const monthStories = STORIES.filter(s => s.date.startsWith(month))
  const sorted = [...monthStories].sort((a, b) => a.date.localeCompare(b.date))

  const idx = MONTHLY_HISTORY.findIndex(m => m.month === month)
  const prevMonth = MONTHLY_HISTORY[Math.max(0, idx - 1)]

  if (!monthStories.length) {
    return (
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-10 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-white font-semibold">Nessuna story trovata per {month.replace('-', '/')}</p>
        <p className="text-gray-500 text-sm mt-1">Cambia mese dall'header per vedere i dati</p>
      </div>
    )
  }

  // ── KPI ────────────────────────────────────────────────────────────────────
  const avgReach      = Math.round(monthStories.reduce((a, s) => a + s.reach, 0) / monthStories.length)
  const avgCR         = Math.round(monthStories.reduce((a, s) => a + s.completionRate, 0) / monthStories.length * 10) / 10
  const totalReplies  = monthStories.reduce((a, s) => a + s.replies, 0)
  const totalLinkClk  = monthStories.reduce((a, s) => a + (s.linkClicks ?? 0), 0)
  const totalExits    = monthStories.reduce((a, s) => a + s.exits, 0)
  const totalTapsFwd  = monthStories.reduce((a, s) => a + s.tapsForward, 0)
  const topStory      = [...monthStories].sort((a, b) => b.reach - a.reach)[0]
  const topCR         = [...monthStories].sort((a, b) => b.completionRate - a.completionRate)[0]

  // ── Dati grafico reach per story ──────────────────────────────────────────
  const reachChartData = sorted.map(s => ({
    label: s.date.slice(5).replace('-', '/'),
    reach: s.reach,
    cr: s.completionRate,
  }))

  // ── Distribuzione completion rate ─────────────────────────────────────────
  const crBuckets = [
    { label: '< 75%',   n: monthStories.filter(s => s.completionRate < 75).length,  fill: '#f43f5e' },
    { label: '75-90%',  n: monthStories.filter(s => s.completionRate >= 75 && s.completionRate < 90).length, fill: '#fbbf24' },
    { label: '≥ 90%',   n: monthStories.filter(s => s.completionRate >= 90).length, fill: '#34d399' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl font-bold">Stories</h2>
        <p className="text-gray-500 text-sm mt-1">
          {monthStories.length} stories · {month.replace('-', '/')}
          {prevMonth && ` · mese prec. ${prevMonth.storiesPublished} stories`}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '📸', label: 'Stories totali',     value: monthStories.length,    color: 'text-pink-400',    sub: `${prevMonth?.storiesPublished ?? '—'} mese prec.` },
          { icon: '👁️', label: 'Reach media',        value: fmtK(avgReach),         color: 'text-white',       sub: `${fmtK(monthStories.reduce((a,s)=>a+s.reach,0))} totale` },
          { icon: '✅', label: 'Completion Rate',    value: `${avgCR}%`,            color: avgCR >= 90 ? 'text-emerald-400' : avgCR >= 75 ? 'text-amber-400' : 'text-rose-400', sub: 'media del mese' },
          { icon: '💬', label: 'Risposte',           value: totalReplies,           color: 'text-emerald-400', sub: `${totalLinkClk} link click` },
        ].map(k => (
          <div key={k.label} className="bg-surface-800 border border-white/5 rounded-2xl p-4">
            <p className="text-xl mb-2">{k.icon}</p>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-white text-xs font-medium mt-0.5">{k.label}</p>
            <p className="text-gray-500 text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Reach per story */}
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-1">Reach per story</p>
          <p className="text-xs text-gray-500 mb-4">Andamento nel mese</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={reachChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmtK(v)} width={36} />
              <Tooltip content={<TT />} />
              <Bar dataKey="reach" name="Reach" fill="#ec4899" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Rate trend */}
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-1">Completion Rate %</p>
          <p className="text-xs text-gray-500 mb-4">Quante persone hanno visto la story fino alla fine</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={reachChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} width={38} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="cr" name="CR%" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuzione CR + metriche totali */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Distribuzione CR */}
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-4">Distribuzione Completion Rate</p>
          <div className="space-y-3">
            {crBuckets.map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{b.label}</span>
                  <span style={{ color: b.fill }} className="font-bold">{b.n} stories</span>
                </div>
                <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(b.n / monthStories.length) * 100}%`, background: b.fill }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Exit totali</span><span className="text-rose-300 font-semibold">{totalExits.toLocaleString('it-IT')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tap avanti totali</span><span className="text-blue-300 font-semibold">{totalTapsFwd.toLocaleString('it-IT')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Link click totali</span><span className="text-amber-300 font-semibold">{totalLinkClk}</span></div>
          </div>
        </div>

        {/* Top story reach + top CR */}
        <div className="lg:col-span-2 bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-4">🏆 Top stories del mese</p>
          <div className="space-y-3">
            <div className="bg-pink-900/20 border border-pink-600/20 rounded-xl p-4">
              <p className="text-pink-400 text-xs font-semibold mb-1">👁️ Reach più alta</p>
              <p className="text-white text-sm font-medium">{topStory.caption}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>📅 {topStory.date.slice(5).replace('-', '/')}</span>
                <span className="text-pink-300 font-bold">👁️ {topStory.reach.toLocaleString('it-IT')}</span>
                <span className={topStory.completionRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}>✅ {topStory.completionRate}% CR</span>
                {topStory.replies > 0 && <span className="text-emerald-300">💬 {topStory.replies}</span>}
              </div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-600/20 rounded-xl p-4">
              <p className="text-emerald-400 text-xs font-semibold mb-1">✅ Completion Rate più alta</p>
              <p className="text-white text-sm font-medium">{topCR.caption}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>📅 {topCR.date.slice(5).replace('-', '/')}</span>
                <span className="text-pink-300">👁️ {topCR.reach.toLocaleString('it-IT')}</span>
                <span className="text-emerald-400 font-bold">✅ {topCR.completionRate}% CR</span>
                {topCR.replies > 0 && <span className="text-emerald-300">💬 {topCR.replies}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella completa */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-1">Tabella completa stories</p>
        <p className="text-xs text-gray-500 mb-4">{sorted.length} stories · ordinate per data · dati da CSV</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                {['Data', 'Contenuto', 'Reach', 'Imp.', 'Exits', 'Tap avanti', 'Tap indietro', 'Risposte', 'Link click', 'Completion%'].map(h => (
                  <th key={h} className="py-2 px-2 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i === sorted.findIndex(x => x.id === topStory.id) ? 'bg-pink-900/10' : ''}`}>
                  <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{s.date.slice(5).replace('-', '/')}</td>
                  <td className="py-2.5 px-2 text-gray-300 max-w-[180px]">
                    <span className="block truncate" title={s.caption}>{s.caption}</span>
                  </td>
                  <td className="py-2.5 px-2 text-white font-semibold">{s.reach.toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-2 text-gray-400">{s.impressions.toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-2 text-rose-300">{s.exits}</td>
                  <td className="py-2.5 px-2 text-blue-300">{s.tapsForward}</td>
                  <td className="py-2.5 px-2 text-gray-500">{s.tapsBack}</td>
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
              <tr className="border-t border-white/10 bg-surface-700/30 font-semibold">
                <td colSpan={2} className="py-2.5 px-2 text-gray-500">Media / totali</td>
                <td className="py-2.5 px-2 text-white">{fmtK(avgReach)} <span className="text-gray-600 font-normal">media</span></td>
                <td className="py-2.5 px-2 text-gray-400">{fmtK(Math.round(sorted.reduce((a,s)=>a+s.impressions,0)/sorted.length))} <span className="text-gray-600 font-normal">media</span></td>
                <td className="py-2.5 px-2 text-rose-300">{totalExits}</td>
                <td className="py-2.5 px-2 text-blue-300">{totalTapsFwd}</td>
                <td className="py-2.5 px-2 text-gray-500">{sorted.reduce((a,s)=>a+s.tapsBack,0)}</td>
                <td className="py-2.5 px-2 text-emerald-300">{totalReplies}</td>
                <td className="py-2.5 px-2 text-amber-300">{totalLinkClk}</td>
                <td className="py-2.5 px-2 text-white">{avgCR}% <span className="text-gray-600 font-normal">media</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
