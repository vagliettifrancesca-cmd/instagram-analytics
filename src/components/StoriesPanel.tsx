import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { STORIES } from '../data/mockData'

export default function StoriesPanel({ month }: { month: string }) {
  const monthStories = STORIES.filter(s => s.date.startsWith(month))
  const avgReach = Math.round(monthStories.reduce((a, s) => a + s.reach, 0) / monthStories.length)
  const avgCompletion = Math.round(monthStories.reduce((a, s) => a + s.completionRate, 0) / monthStories.length * 10) / 10
  const totalReplies = monthStories.reduce((a, s) => a + s.replies, 0)
  const totalLinkClicks = monthStories.reduce((a, s) => a + (s.linkClicks ?? 0), 0)
  const top = [...monthStories].sort((a, b) => b.reach - a.reach)[0]

  const TT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return <div className="bg-surface-700 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl"><p className="text-gray-400 mb-1">{label}</p><p className="text-white font-bold">{payload[0].value.toLocaleString('it-IT')} reach</p></div>
  }

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="mb-5"><p className="text-white font-semibold">Stories</p><p className="text-xs text-gray-500 mt-0.5">{monthStories.length} stories campione · {month.slice(0,4)}-{month.slice(5,7)}</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { l: 'Reach media', v: `${(avgReach/1000).toFixed(1)}K`, c: 'text-pink-400' },
          { l: 'Completion rate', v: `${avgCompletion}%`, c: 'text-emerald-400' },
          { l: 'Risposte totali', v: totalReplies.toLocaleString('it-IT'), c: 'text-amber-400' },
          { l: 'Link click', v: totalLinkClicks.toLocaleString('it-IT'), c: 'text-blue-400' },
        ].map(s => (
          <div key={s.l} className="bg-surface-700/50 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={monthStories.slice(0,8).map(s => ({ date: s.date.slice(5).replace('-','/'), reach: s.reach }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A141014" />
          <XAxis dataKey="date" tick={{ fill: '#6F655C', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6F655C', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}K`} width={36} />
          <Tooltip content={<TT />} />
          <Bar dataKey="reach" fill="#FF5740" fillOpacity={0.75} radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 bg-surface-700/40 rounded-xl p-3">
        <p className="text-xs text-gray-500 mb-1">Story con reach più alta</p>
        <p className="text-white text-sm font-medium line-clamp-1">{top.caption}</p>
        <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
          <span>👁️ {top.reach.toLocaleString('it-IT')}</span>
          <span>✅ {top.completionRate}% completion</span>
          <span>💬 {top.replies} risposte</span>
        </div>
      </div>
    </div>
  )
}
