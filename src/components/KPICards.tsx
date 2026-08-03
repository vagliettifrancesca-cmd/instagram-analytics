import { TrendingUp, TrendingDown, Users, Eye, Heart, Bookmark } from 'lucide-react'
import type { MonthlySnapshot } from '../types/instagram'

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('it-IT')
}

function Delta({ value, unit = '' }: { value: number; unit?: string }) {
  const pos = value >= 0
  const Icon = pos ? TrendingUp : TrendingDown
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
      <Icon size={11} />{pos ? '+' : ''}{typeof value === 'number' && Math.abs(value) < 10 ? value.toFixed(1) : Math.round(value)}{unit} vs mese prec.
    </span>
  )
}

export default function KPICards({ current, previous }: { current: MonthlySnapshot; previous: MonthlySnapshot }) {
  const reachDeltaPct = Math.round(((current.totalReach - previous.totalReach) / previous.totalReach) * 100)
  const erDelta = Math.round((current.avgEngagementRate - previous.avgEngagementRate) * 10) / 10
  const savesDeltaPct = Math.round(((current.totalSaves - previous.totalSaves) / previous.totalSaves) * 100)

  const cards = [
    { label: 'Follower totali', value: fmt(current.followersEnd), delta: <Delta value={current.followersEnd - previous.followersEnd} />, sub: `+${current.followersGained} acquisiti · -${current.followersLost} persi`, icon: <Users size={16} className="text-pink-400" />, accent: 'from-pink-600/20' },
    { label: 'Reach totale', value: fmt(current.totalReach), delta: <Delta value={reachDeltaPct} unit="%" />, sub: `${fmt(current.totalImpressions)} impressioni`, icon: <Eye size={16} className="text-cyan-400" />, accent: 'from-cyan-600/20' },
    { label: 'Engagement Rate', value: `${current.avgEngagementRate.toFixed(1)}%`, delta: <Delta value={erDelta} unit="%" />, sub: `${fmt(current.totalLikes)} like · ${fmt(current.totalComments)} commenti`, icon: <Heart size={16} className="text-rose-400" />, accent: 'from-rose-600/20' },
    { label: 'Salvataggi totali', value: fmt(current.totalSaves), delta: <Delta value={savesDeltaPct} unit="%" />, sub: `${fmt(current.totalShares)} condivisioni`, icon: <Bookmark size={16} className="text-amber-400" />, accent: 'from-amber-600/20' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`bg-gradient-to-br ${c.accent} to-surface-800 border border-white/5 rounded-2xl p-5 flex flex-col gap-3`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{c.label}</span>
            <div className="p-2 bg-white/5 rounded-xl">{c.icon}</div>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{c.value}</div>
          <div className="space-y-0.5">{c.delta}<span className="text-xs text-gray-500">{c.sub}</span></div>
        </div>
      ))}
    </div>
  )
}
