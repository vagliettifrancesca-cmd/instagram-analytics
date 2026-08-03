import { LayoutDashboard, TrendingUp, FileText, Settings, ChevronRight, Camera, Megaphone, Layers, Users } from 'lucide-react'

export default function Sidebar({ page, onPageChange }: { page: string; onPageChange: (p: 'overview' | 'performance' | 'stories' | 'report' | 'collaborazioni' | 'settings') => void }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-surface-800 border-r border-white/5 flex flex-col min-h-screen">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
            <Camera size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">Deeva Analytics</p>
            <p className="text-gray-500 text-xs">@deeva.it</p>
          </div>
        </div>
      </div>
      <div className="p-3 border-b border-white/5">
        <p className="text-xs text-gray-600 font-medium px-2 mb-2 uppercase tracking-wider">Moduli</p>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:bg-surface-700 transition-colors text-sm">
          <Megaphone size={14} /><span>Meta Ads</span><ChevronRight size={12} className="ml-auto" />
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-600/15 text-pink-400 border border-pink-600/20 text-sm">
          <Camera size={14} /><span className="font-medium">Instagram Organic</span>
        </button>
      </div>
      <nav className="p-3 flex-1">
        <p className="text-xs text-gray-600 font-medium px-2 mb-2 uppercase tracking-wider">Sezioni</p>
        {[
          { icon: LayoutDashboard, label: 'Overview',       pageKey: 'overview'     as const },
          { icon: TrendingUp,      label: 'Performance',    pageKey: 'performance'  as const },
          { icon: Layers,          label: 'Stories',        pageKey: 'stories'      as const },
          { icon: FileText,        label: 'Report mensile', pageKey: 'report'          as const },
          { icon: Users,           label: 'Collaborazioni', pageKey: 'collaborazioni' as const },
          { icon: Settings,        label: 'Impostazioni',   pageKey: 'settings'        as const },
        ].map(({ icon: Icon, label, pageKey }) => {
          const active = page === pageKey
          return (
            <button key={label} onClick={() => onPageChange(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors mb-0.5 ${active ? 'bg-surface-700 text-white' : 'text-gray-400 hover:bg-surface-700/50 hover:text-gray-200'}`}>
              <Icon size={14} /><span>{label}</span>{active && <ChevronRight size={12} className="ml-auto text-gray-600" />}
            </button>
          )
        })}
      </nav>
      <div className="p-3 m-3 bg-surface-700/50 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400 font-medium">Dati mock · Deeva</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">Dati simulati realistici. Connetti l'API per dati live.</p>
      </div>
    </aside>
  )
}
