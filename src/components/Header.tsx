import { Calendar, Download, RefreshCw } from 'lucide-react'
import { MONTHLY_HISTORY } from '../data/mockData'

export default function Header({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const current = MONTHLY_HISTORY.find(m => m.month === month)
  return (
    <header className="bg-surface-800/80 backdrop-blur border-b border-white/5 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white font-semibold text-lg">Instagram Organic · Deeva</h1>
          <p className="text-gray-500 text-xs mt-0.5">{current?.followersEnd.toLocaleString('it-IT')} follower · Bellezza & cura del corpo</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-700 border border-white/10 rounded-xl px-3 py-2">
            <Calendar size={13} className="text-gray-400" />
            <select value={month} onChange={e => onChange(e.target.value)} className="bg-transparent text-white text-sm outline-none cursor-pointer">
              {MONTHLY_HISTORY.map(m => <option key={m.month} value={m.month} className="bg-surface-700">{m.label}</option>)}
            </select>
          </div>
          <button className="flex items-center gap-1.5 bg-surface-700 border border-white/10 rounded-xl px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm">
            <RefreshCw size={13} /><span className="hidden sm:inline">Aggiorna</span>
          </button>
          <button className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 rounded-xl px-3 py-2 text-white transition-colors text-sm font-medium">
            <Download size={13} /><span className="hidden sm:inline">Esporta</span>
          </button>
        </div>
      </div>
    </header>
  )
}
