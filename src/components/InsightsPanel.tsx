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

function nomeMese(month: string) {
  const [anno, mese] = month.split('-')
  const nome = new Date(Number(anno), Number(mese) - 1, 1)
    .toLocaleDateString('it-IT', { month: 'long' })
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${anno}`
}

export default function InsightsPanel({ month }: { month: string }) {
  // Prima il pannello non riceveva il mese e mostrava sempre TUTTI gli insight:
  // scegliendo agosto si continuavano a leggere i commenti di luglio.
  const insights = AUTO_INSIGHTS.filter(i => i.month === month)

  return (
    <div className="bg-surface-800 border border-surface-500 rounded-3xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-gray-200 font-semibold">Analisi del mese</p>
          <p className="text-xs text-gray-400 mt-0.5">{nomeMese(month)} · lettura redazionale, scritta a mano</p>
        </div>
        {insights.length > 0 && (
          <span className="text-xs text-pink-500 bg-pink-900 px-3 py-1 rounded-full font-semibold">
            {insights.length} {insights.length === 1 ? 'osservazione' : 'osservazioni'}
          </span>
        )}
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">✍️</p>
          <p className="text-gray-200 font-semibold">Nessuna analisi per {nomeMese(month)}</p>
          <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
            Queste osservazioni non sono calcolate dai dati: vanno scritte a mano
            leggendo l'andamento del mese.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map(i => <Card key={i.id} i={i} />)}
        </div>
      )}
    </div>
  )
}
