import { POSTS, STORIES, AUTO_INSIGHTS } from '../data/mockData'
import { TrendingUp, TrendingDown, Minus, Users, Eye, Heart, Bookmark, Share2, Film, LayoutGrid, ImageIcon } from 'lucide-react'

interface MonthData {
  month: string; label: string
  followersEnd: number; followersGained: number; followersLost?: number
  totalReach: number; totalImpressions: number; avgEngagementRate: number
  postsPublished: number; reelsPublished: number; storiesPublished: number; carouselsPublished?: number
  totalLikes: number; totalComments: number; totalShares: number; totalSaves: number
}

interface Props {
  month: string
  current: MonthData
  previous: MonthData
}

function Delta({ val, unit = '', invert = false }: { val: number; unit?: string; invert?: boolean }) {
  const good = invert ? val < 0 : val > 0
  const color = val === 0 ? 'text-gray-500' : good ? 'text-emerald-400' : 'text-rose-400'
  const Icon = val === 0 ? Minus : val > 0 ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${color}`}>
      <Icon size={11} />
      {val > 0 ? '+' : ''}{val}{unit}
    </span>
  )
}

const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : String(n)
const pct = (a: number, b: number) => b === 0 ? 0 : Math.round((a - b) / b * 100)

export default function ReportPage({ month, current, previous }: Props) {
  const monthPosts  = POSTS.filter(p => p.date.startsWith(month))
  const collabPosts = monthPosts.filter(p => p.isCollaboration)
  const monthStories = STORIES.filter(s => s.date.startsWith(month))

  const reels    = monthPosts.filter(p => p.type === 'REEL')
  const carousel = monthPosts.filter(p => p.type === 'CAROUSEL')
  const images   = monthPosts.filter(p => p.type === 'IMAGE')

  const top3 = [...monthPosts]
    .sort((a, b) => (b.reach + b.likes * 10) - (a.reach + a.likes * 10))
    .slice(0, 3)

  const avgER = current.avgEngagementRate
  const erColor = avgER >= 3.5 ? 'text-emerald-400' : avgER >= 2 ? 'text-amber-400' : 'text-rose-400'

  const reachDelta  = pct(current.totalReach, previous.totalReach)
  const follDelta   = current.followersGained - (current.followersLost ?? 0)
  const engDelta    = Math.round((current.avgEngagementRate - previous.avgEngagementRate) * 10) / 10

  const avgStoryCR = monthStories.length
    ? Math.round(monthStories.reduce((a, s) => a + (s.completionRate ?? 0), 0) / monthStories.length * 10) / 10
    : 0

  const monthName = new Date(month + '-01').toLocaleString('it-IT', { month: 'long', year: 'numeric' })

  const insights = AUTO_INSIGHTS.slice(0, 5)

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header report */}
      <div className="bg-gradient-to-r from-pink-900/30 to-surface-800 border border-white/5 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-pink-400 text-xs font-semibold uppercase tracking-widest mb-1">Report mensile</p>
            <h2 className="text-white text-2xl font-bold capitalize">{monthName}</h2>
            <p className="text-gray-500 text-sm mt-1">@deeva.it · Instagram Organic Analytics</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-xs">Generato il</p>
            <p className="text-gray-400 text-sm font-medium">28/05/2026</p>
          </div>
        </div>
      </div>

      {/* KPI principali */}
      <div>
        <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">📊 KPI principali</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Users size={16} />,
              label: 'Follower totali',
              value: fmtK(current.followersEnd),
              sub: `+${current.followersGained} nuovi`,
              delta: <Delta val={follDelta} />,
              color: 'text-emerald-400',
            },
            {
              icon: <Eye size={16} />,
              label: 'Reach totale',
              value: fmtK(current.totalReach),
              sub: `${fmtK(current.totalImpressions)} impressioni`,
              delta: <Delta val={reachDelta} unit="%" />,
              color: 'text-pink-400',
            },
            {
              icon: <Heart size={16} />,
              label: 'Engagement Rate',
              value: `${avgER}%`,
              sub: `vs ${previous.avgEngagementRate}% mese prec.`,
              delta: <Delta val={engDelta} unit="%" />,
              color: erColor,
            },
            {
              icon: <Bookmark size={16} />,
              label: 'Salvataggi totali',
              value: current.totalSaves,
              sub: `${current.totalLikes} like · ${current.totalComments} commenti`,
              delta: <Delta val={pct(current.totalSaves, previous.totalSaves)} unit="%" />,
              color: 'text-amber-400',
            },
          ].map(k => (
            <div key={k.label} className="bg-surface-800 border border-white/5 rounded-2xl p-4">
              <div className={`${k.color} mb-2 opacity-70`}>{k.icon}</div>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-white text-xs font-medium mt-0.5">{k.label}</p>
              <p className="text-gray-500 text-xs mt-1">{k.sub}</p>
              <div className="mt-2">{k.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attività di pubblicazione */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-4">📅 Attività di pubblicazione</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {[
            { icon: <Film size={18} className="mx-auto" />, label: 'Reel', n: reels.length, color: 'text-pink-400' },
            { icon: <LayoutGrid size={18} className="mx-auto" />, label: 'Carousel', n: carousel.length, color: 'text-violet-400' },
            { icon: <ImageIcon size={18} className="mx-auto" />, label: 'Immagini', n: images.length, color: 'text-blue-400' },
            { icon: <Share2 size={18} className="mx-auto" />, label: 'Collaborazioni', n: collabPosts.length, color: 'text-emerald-400' },
          ].map(f => (
            <div key={f.label} className="bg-surface-700/40 rounded-xl p-3">
              <div className={`${f.color} mb-2 opacity-80`}>{f.icon}</div>
              <p className="text-white text-2xl font-black">{f.n}</p>
              <p className="text-gray-500 text-xs mt-0.5">{f.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-surface-700/30 rounded-xl p-3">
            <p className="text-white font-bold text-lg">{monthPosts.length}</p>
            <p className="text-gray-500 text-xs">Post totali</p>
          </div>
          <div className="bg-surface-700/30 rounded-xl p-3">
            <p className="text-white font-bold text-lg">{monthStories.length}</p>
            <p className="text-gray-500 text-xs">Stories campione</p>
          </div>
          <div className="bg-surface-700/30 rounded-xl p-3">
            <p className="text-white font-bold text-lg">{avgStoryCR}%</p>
            <p className="text-gray-500 text-xs">Completion Rate stories</p>
          </div>
        </div>
      </div>

      {/* Engagement dettaglio */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-4">❤️ Dettaglio interazioni</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Like', val: current.totalLikes, icon: '❤️', prev: previous.totalLikes },
            { label: 'Commenti', val: current.totalComments, icon: '💬', prev: previous.totalComments },
            { label: 'Condivisioni', val: current.totalShares, icon: '↗️', prev: previous.totalShares },
            { label: 'Salvataggi', val: current.totalSaves, icon: '🔖', prev: previous.totalSaves },
          ].map(e => (
            <div key={e.label} className="bg-surface-700/30 rounded-xl p-4">
              <p className="text-xl mb-1">{e.icon}</p>
              <p className="text-white text-xl font-bold">{e.val.toLocaleString('it-IT')}</p>
              <p className="text-gray-500 text-xs mt-0.5">{e.label}</p>
              <div className="mt-1.5">
                <Delta val={pct(e.val, e.prev)} unit="%" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 contenuti */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-4">🏆 Top 3 contenuti del mese</p>
        <div className="space-y-3">
          {top3.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-4 rounded-xl p-4 border ${i === 0 ? 'bg-pink-900/20 border-pink-600/20' : 'bg-surface-700/30 border-white/5'}`}>
              <span className={`text-2xl font-black w-7 text-center ${i === 0 ? 'text-pink-400' : 'text-gray-600'}`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm line-clamp-2">{p.caption}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {p.date} · {p.type}{p.isCollaboration ? ' · 🤝 Collab' : ''}
                </p>
              </div>
              <div className="flex gap-4 text-xs text-right shrink-0">
                <div>
                  <p className="text-white font-bold">{fmtK(p.reach || p.impressions || 0)}</p>
                  <p className="text-gray-500">reach</p>
                </div>
                <div>
                  <p className={`font-bold ${p.engagementRate >= 3.5 ? 'text-emerald-400' : p.engagementRate >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>{p.engagementRate}%</p>
                  <p className="text-gray-500">ER</p>
                </div>
                <div>
                  <p className="text-amber-400 font-bold">{p.saves}</p>
                  <p className="text-gray-500">save</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confronto mese precedente */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-4">📈 Confronto con mese precedente ({previous.label})</p>
        <div className="space-y-3">
          {[
            { label: 'Follower guadagnati', curr: current.followersGained, prev: previous.followersGained, unit: '' },
            { label: 'Reach totale', curr: current.totalReach, prev: previous.totalReach, unit: '', fmt: fmtK },
            { label: 'Impressioni', curr: current.totalImpressions, prev: previous.totalImpressions, unit: '', fmt: fmtK },
            { label: 'Engagement Rate', curr: current.avgEngagementRate, prev: previous.avgEngagementRate, unit: '%' },
            { label: 'Post pubblicati', curr: current.postsPublished, prev: previous.postsPublished, unit: '' },
            { label: 'Like totali', curr: current.totalLikes, prev: previous.totalLikes, unit: '' },
          ].map(row => {
            const delta = pct(row.curr, row.prev)
            const display = (n: number) => row.fmt ? row.fmt(n) : `${n}${row.unit}`
            return (
              <div key={row.label} className="flex items-center gap-3">
                <p className="text-gray-400 text-sm w-48 shrink-0">{row.label}</p>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${delta >= 0 ? 'bg-pink-500' : 'bg-rose-700'}`}
                      style={{ width: `${Math.min(Math.abs(delta), 100)}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold text-sm w-16 text-right">{display(row.curr)}</span>
                  <Delta val={delta} unit="%" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights chiave */}
      {insights.length > 0 && (
        <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
          <p className="text-white font-semibold mb-4">💡 Insights chiave</p>
          <div className="space-y-3">
            {insights.map(ins => (
              <div key={ins.id} className={`rounded-xl p-4 border text-sm ${
                ins.category === 'warning'     ? 'bg-amber-900/20 border-amber-600/20' :
                ins.category === 'top'         ? 'bg-pink-900/20 border-pink-600/20' :
                ins.category === 'opportunity' ? 'bg-violet-900/20 border-violet-600/20' :
                'bg-surface-700/40 border-white/5'
              }`}>
                <p className="font-semibold text-white mb-0.5">{ins.icon} {ins.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{ins.metric}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note strategiche */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-semibold mb-4">🎯 Note strategiche per il prossimo mese</p>
        <div className="space-y-2 text-sm text-gray-300">
          {[
            reels.length > 0 && reels.reduce((a,p)=>a+p.engagementRate,0)/reels.length > 2.5
              ? '✅ I Reel stanno performando bene — mantieni la frequenza e sperimenta con hook più forti nei primi 3 secondi.'
              : '⚠️ I Reel hanno un ER sotto soglia — testa nuovi format e studia i trend del momento.',
            collabPosts.length > 0
              ? `✅ Le collaborazioni (${collabPosts.length}) hanno ampliato il pubblico raggiungendo follower non organici — strategia da continuare.`
              : '💡 Considera di attivare collaborazioni con creator affini per espandere la reach oltre il pubblico esistente.',
            current.totalSaves < previous.totalSaves
              ? '⚠️ I salvataggi sono diminuiti rispetto al mese precedente — crea contenuti più "evergreen" e pratici (guide, liste, tutorial).'
              : '✅ I salvataggi sono in crescita — il contenuto è percepito come utile e di valore.',
            `📊 ER medio: ${avgER}% — ${avgER >= 3.5 ? 'ottimo, sopra la media di settore.' : avgER >= 2 ? 'nella media, margine di miglioramento possibile con più call to action.' : 'sotto media, punta su contenuti più interattivi (domande, sondaggi, caroselli educativi).'}`,
          ].filter(Boolean).map((note, i) => (
            <p key={i} className="bg-surface-700/30 rounded-lg px-4 py-2.5">{note as string}</p>
          ))}
        </div>
      </div>

    </div>
  )
}
