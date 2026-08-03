import { AreaChart, Area, ComposedChart, Bar, Line, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FOLLOWER_DAILY, MONTHLY_HISTORY } from '../data/mockData'

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-white font-semibold">
          {p.name}: {p.dataKey === 'avgEngagementRate' || p.dataKey === 'completion' ? `${p.value}%` : (p.value / 1000 >= 1 ? `${(p.value/1000).toFixed(1)}K` : p.value.toLocaleString('it-IT'))}
        </p>
      ))}
    </div>
  )
}

export function FollowerChart() {
  const data = FOLLOWER_DAILY.filter((_, i) => i % 3 === 0)
  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div><p className="text-white font-semibold">Andamento Follower</p><p className="text-xs text-gray-500 mt-0.5">Maggio 2026</p></div>
        <span className="text-emerald-400 text-sm font-medium bg-emerald-400/10 px-3 py-1 rounded-full">+921</span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/><stop offset="95%" stopColor="#ec4899" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v.slice(8)}/05`} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto','auto']} tickFormatter={v => `${(v/1000).toFixed(1)}K`} width={44} />
          <Tooltip content={<TT />} />
          <Area type="monotone" dataKey="followers" name="Follower" stroke="#ec4899" strokeWidth={2} fill="url(#fg)" dot={false} activeDot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ReachERChart() {
  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="mb-5"><p className="text-white font-semibold">Reach & Engagement Rate</p><p className="text-xs text-gray-500 mt-0.5">Ultimi 6 mesi</p></div>
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={MONTHLY_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="l" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} width={38} />
          <YAxis yAxisId="r" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={32} />
          <Tooltip content={<TT />} />
          <Bar yAxisId="l" dataKey="totalReach" name="Reach" fill="#ec4899" fillOpacity={0.7} radius={[4,4,0,0]} />
          <Line yAxisId="r" type="monotone" dataKey="avgEngagementRate" name="ER" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EngagementStackedChart() {
  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="mb-5"><p className="text-white font-semibold">Engagement mensile</p><p className="text-xs text-gray-500 mt-0.5">Like · Commenti · Salvataggi · Condivisioni</p></div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={MONTHLY_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} width={38} />
          <Tooltip content={<TT />} />
          <Bar dataKey="totalLikes" name="Like" fill="#f472b6" fillOpacity={0.85} radius={[0,0,0,0]} stackId="a" />
          <Bar dataKey="totalComments" name="Commenti" fill="#60a5fa" fillOpacity={0.85} stackId="a" />
          <Bar dataKey="totalSaves" name="Salvataggi" fill="#34d399" fillOpacity={0.85} stackId="a" />
          <Bar dataKey="totalShares" name="Condivisioni" fill="#fbbf24" fillOpacity={0.85} radius={[3,3,0,0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
