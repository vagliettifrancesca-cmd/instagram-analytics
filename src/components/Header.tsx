import { Calendar, Download, RefreshCw } from 'lucide-react'
import { MONTHLY_HISTORY } from '../data/mockData'

export default function Header({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const current = MONTHLY_HISTORY.find(m => m.month === month)
  return (
    <header className="bg-surface-800/90 backdrop-blur border-b border-surface-500 px-6 py-3.5 sticky top-0 z-10 shadow-soft">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-gray-200 font-semibold text-sm">Instagram Organic</p>
          <p className="text-gray-400 text-xs mt-0.5">{current?.followersEnd.toLocaleString('it-IT')} follower · dati aggiornati via API Meta</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-700 border border-surface-500 rounded-2xl px-3 py-2">
            <Calendar size={13} className="text-gray-400" />
            <select
              value={month}
              onChange={e => onChange(e.target.value)}
              className="bg-transparent text-gray-200 text-sm outline-none cursor-pointer"
            >
              {MONTHLY_HISTORY.map(m => <option key={m.month} value={m.month} className="bg-surface-800">{m.label}</option>)}
            </select>
          </div>
          <button className="flex items-center gap-1.5 bg-surface-700 border border-surface-500 rounded-full px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors text-sm">
            <RefreshCw size={13} /><span className="hidden sm:inline">Aggiorna</span>
          </button>
          <button className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-400 rounded-full px-4 py-2 text-surface-900 font-semibold transition-all hover:-translate-y-0.5 shadow-soft text-sm">
            <Download size={13} /><span className="hidden sm:inline">Esporta</span>
          </button>
        </div>
      </div>
    </header>
  )
}
