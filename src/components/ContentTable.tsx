import { useState } from 'react'
import { Eye, Heart, Bookmark, Play } from 'lucide-react'
import { POSTS } from '../data/mockData'
import type { MediaType } from '../types/instagram'

const BADGE: Record<MediaType, string> = {
  REEL:     'bg-pink-600/20 text-pink-400 border-pink-600/30',
  CAROUSEL: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
  IMAGE:    'bg-blue-600/20 text-blue-400 border-blue-600/30',
  STORY:    'bg-amber-600/20 text-amber-400 border-amber-600/30',
}
const TOPIC: Record<string, string> = {
  tutorial: '🎓 Tutorial', prima_dopo: '✅ Prima/Dopo', educational: '📚 Educational',
  routine: '⏱️ Routine', trend: '🔥 Trend', stagionale: '🎁 Stagionale',
  brand: '📷 Brand', ugc: '💬 UGC', quote: '💭 Quote', teaser: '👀 Teaser',
  collaboration: '🤝 Collab', giveaway: '🎉 Giveaway', prodotto: '🛍️ Prodotto',
}
const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n)

export default function ContentTable({ month }: { month: string }) {
  const [mode, setMode] = useState<'top'|'worst'>('top')
  const [filter, setFilter] = useState<MediaType|'ALL'>('ALL')

  const byMonth = POSTS.filter(p => p.date.startsWith(month))
  const filtered = filter === 'ALL' ? byMonth : byMonth.filter(p => p.type === filter)
  const sorted = [...filtered].sort((a, b) => mode === 'top' ? b.engagementRate - a.engagementRate : a.engagementRate - b.engagementRate)

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div><p className="text-white font-semibold">Contenuti del Mese</p><p className="text-xs text-gray-500 mt-0.5">Ordinati per engagement rate</p></div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-surface-700 rounded-xl p-0.5">
            {(['top','worst'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode===m ? (m==='top'?'bg-emerald-600':'bg-rose-600')+' text-white' : 'text-gray-400 hover:text-white'}`}>
                {m==='top'?'↑ Top':'↓ Worst'}
              </button>
            ))}
          </div>
          <div className="flex bg-surface-700 rounded-xl p-0.5">
            {(['ALL','REEL','CAROUSEL','IMAGE'] as const).map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===t?'bg-brand-600 text-white':'text-gray-400 hover:text-white'}`}>
                {t==='ALL'?'Tutti':t==='IMAGE'?'Post':t.charAt(0)+t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="border-b border-white/5">
              {['#','Tipo','Contenuto','Reach','Like','Salvataggi','ER','Watch'].map(h => (
                <th key={h} className={`py-2 px-3 text-xs font-medium text-gray-500 ${h==='#'||h==='Tipo'?'text-left':'text-right'} ${h==='Contenuto'?'text-left':''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0,9).map((post, i) => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 text-sm font-bold" style={{ color: mode==='top'?'#34d399':'#f87171' }}>{mode==='top'?'↑':'↓'}{i+1}</td>
                <td className="py-3 px-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${BADGE[post.type]}`}>{post.type==='IMAGE'?'Post':post.type.charAt(0)+post.type.slice(1).toLowerCase()}</span></td>
                <td className="py-3 px-3 max-w-[260px]">
                  <p className="text-gray-300 text-xs line-clamp-1">{post.caption}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{post.date.slice(5).replace('-','/')} · {TOPIC[post.topic]??post.topic}{post.isCollaboration?' · 🤝':''}</p>
                </td>
                <td className="py-3 px-3 text-right"><span className="flex items-center justify-end gap-1 text-gray-300 text-xs"><Eye size={10} className="text-gray-600"/>{fmt(post.reach)}</span></td>
                <td className="py-3 px-3 text-right"><span className="flex items-center justify-end gap-1 text-gray-300 text-xs"><Heart size={10} className="text-gray-600"/>{fmt(post.likes)}</span></td>
                <td className="py-3 px-3 text-right"><span className="flex items-center justify-end gap-1 text-gray-300 text-xs"><Bookmark size={10} className="text-gray-600"/>{fmt(post.saves)}</span></td>
                <td className="py-3 px-3 text-right"><span className={`text-xs font-bold ${post.engagementRate>=3.5?'text-emerald-400':post.engagementRate>=2?'text-amber-400':'text-rose-400'}`}>{post.engagementRate}%</span></td>
                <td className="py-3 px-3 text-right text-xs text-gray-400">{post.avgWatchTimeSec?<span className="flex items-center justify-end gap-1"><Play size={10} className="text-gray-600"/>{post.avgWatchTimeSec}s</span>:'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
