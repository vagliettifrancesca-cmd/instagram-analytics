import { POSTS } from '../data/mockData'
import type { MediaType } from '../types/instagram'

const CFG: Record<MediaType, { label: string; color: string; emoji: string; bg: string }> = {
  REEL:     { label: 'Reel',     color: '#FF5740', emoji: '🎬', bg: 'bg-pink-600/15' },
  CAROUSEL: { label: 'Carousel', color: '#2E7D32', emoji: '📄', bg: 'bg-emerald-600/15' },
  IMAGE:    { label: 'Post',     color: '#2F86DB', emoji: '🖼️', bg: 'bg-blue-600/15' },
  STORY:    { label: 'Story',    color: '#D98324', emoji: '⭕', bg: 'bg-amber-600/15' },
}

export default function ContentBreakdown({ month }: { month: string }) {
  const types: MediaType[] = ['REEL', 'CAROUSEL', 'IMAGE']
  const monthPosts = POSTS.filter(p => p.date.startsWith(month))
  const stats = types.map(t => {
    const posts = monthPosts.filter(p => p.type === t)
    return {
      type: t,
      count: posts.length,
      avgReach: Math.round(posts.reduce((a, p) => a + p.reach, 0) / posts.length),
      avgER: Math.round(posts.reduce((a, p) => a + p.engagementRate, 0) / posts.length * 10) / 10,
      avgSaves: Math.round(posts.reduce((a, p) => a + p.saves, 0) / posts.length),
      totalReach: posts.reduce((a, p) => a + p.reach, 0),
    }
  })
  const totalReach = stats.reduce((a, s) => a + s.totalReach, 0)

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="mb-5"><p className="text-white font-semibold">Performance per Formato</p><p className="text-xs text-gray-500 mt-0.5">{monthPosts.length} contenuti · {month.slice(0,4)}</p></div>
      <div className="space-y-3 mb-6">
        {stats.filter(s => s.count > 0).map(s => {
          const cfg = CFG[s.type]
          const pct = Math.round((s.totalReach / totalReach) * 100)
          return (
            <div key={s.type} className={`${cfg.bg} rounded-xl p-3`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg.emoji}</span>
                  <span className="text-white text-sm font-medium">{cfg.label}</span>
                  <span className="text-xs text-gray-500">{s.count} post</span>
                </div>
                <span className="text-xs font-bold" style={{ color: cfg.color }}>{pct}% reach</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><div className="text-white text-sm font-bold">{s.avgReach >= 1000 ? `${(s.avgReach/1000).toFixed(1)}K` : s.avgReach}</div><div className="text-gray-500 text-xs">reach media</div></div>
                <div><div className="text-sm font-bold" style={{ color: cfg.color }}>{s.avgER}%</div><div className="text-gray-500 text-xs">eng. rate</div></div>
                <div><div className="text-white text-sm font-bold">{s.avgSaves}</div><div className="text-gray-500 text-xs">salvataggi</div></div>
              </div>
              <div className="mt-2 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
