import { AUTO_INSIGHTS } from '../data/mockData'
import type { AutoInsight } from '../types/instagram'

const CAT = {
  top:            { label: 'Top performer',    border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  warning:        { label: 'Attenzione',       border: 'border-rose-500/30',    bg: 'bg-rose-500/5' },
  trend:          { label: 'Trend',            border: 'border-pink-500/30',    bg: 'bg-pink-500/5' },
  opportunity:    { label: 'Opportunità',      border: 'border-amber-500/30',   bg: 'bg-amber-500/5' },
  recommendation: { label: 'Raccomandazione',  border: 'border-blue-500/30',    bg: 'bg-blue-500/5' },
}

function Card({ i }: { i: AutoInsight }) {
  const cfg = CAT[i.category]
  return (
    <div className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4`}>
      <div className="flex gap-3">
        <span className="text-xl flex-shrink-0">{i.icon}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-700 text-gray-300">{cfg.label}</span>
            {i.metric && <span className="text-xs font-bold text-white bg-surface-600 px-2 py-0.5 rounded-full">{i.metric}</span>}
          </div>
          <p className="text-white text-sm font-semibold mb-1">{i.title}</p>
          <p className="text-gray-400 text-xs leading-relaxed">{i.body}</p>
        </div>
      </div>
    </div>
  )
}

export default function InsightsPanel() {
  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div><p className="text-white font-semibold">Insight Automatici</p><p className="text-xs text-gray-500 mt-0.5">Analisi Aprile 2026 · Deeva</p></div>
        <span className="text-xs text-pink-400 bg-pink-400/10 px-3 py-1 rounded-full font-medium">{AUTO_INSIGHTS.length} insight</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AUTO_INSIGHTS.map(i => <Card key={i.id} i={i} />)}
      </div>
    </div>
  )
}
