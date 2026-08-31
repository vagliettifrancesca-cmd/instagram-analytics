import { LayoutDashboard, TrendingUp, FileText, Settings, ChevronRight, Camera, Megaphone, Layers, Users } from 'lucide-react'

export default function Sidebar({ page, onPageChange }: { page: string; onPageChange: (p: 'overview' | 'performance' | 'stories' | 'report' | 'collaborazioni' | 'settings') => void }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-surface-800 border-r border-surface-500 flex flex-col min-h-screen">
      {/* Logo Deeva */}
      <div className="px-5 py-4 border-b border-surface-500">
        <img
          src="https://cdn.prod.website-files.com/6874d68cd97d7a65278ede5b/687511504c73544a0d41868f_logo-color-deeva.svg"
          alt="Deeva"
          className="h-7"
        />
        <p className="text-gray-400 text-xs mt-1">Analytics · @deeva.it</p>
      </div>

      {/* Moduli */}
      <div className="p-3 border-b border-surface-500">
        <p className="text-xs text-gray-400 font-semibold px-2 mb-2 uppercase tracking-wider">Moduli</p>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-gray-400 hover:bg-surface-700 transition-colors text-sm">
          <Megaphone size={14} /><span>Meta Ads</span><ChevronRight size={12} className="ml-auto" />
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl bg-pink-900 text-pink-500 border border-pink-500/20 text-sm">
          <Camera size={14} /><span className="font-semibold">Instagram Organic</span>
        </button>
      </div>

      {/* Navigazione */}
      <nav className="p-3 flex-1">
        <p className="text-xs text-gray-400 font-semibold px-2 mb-2 uppercase tracking-wider">Sezioni</p>
        {[
          { icon: LayoutDashboard, label: 'Overview',       pageKey: 'overview'        as const },
          { icon: TrendingUp,      label: 'Performance',    pageKey: 'performance'     as const },
          { icon: Layers,          label: 'Stories',        pageKey: 'stories'         as const },
          { icon: FileText,        label: 'Report mensile', pageKey: 'report'          as const },
          { icon: Users,           label: 'Collaborazioni', pageKey: 'collaborazioni'  as const },
          { icon: Settings,        label: 'Impostazioni',   pageKey: 'settings'        as const },
        ].map(({ icon: Icon, label, pageKey }) => {
          const active = page === pageKey
          return (
            <button
              key={label}
              onClick={() => onPageChange(pageKey)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm transition-colors mb-0.5 ${
                active
                  ? 'bg-pink-900/60 text-pink-500 font-semibold border border-pink-500/20'
                  : 'text-gray-400 hover:bg-surface-700 hover:text-gray-200'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
              {active && <ChevronRight size={12} className="ml-auto text-pink-400" />}
            </button>
          )
        })}
      </nav>

      {/* Badge API */}
      <div className="p-3 m-3 bg-surface-700 rounded-2xl border border-surface-500">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-semibold">API Meta · Attiva</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">Sincronizzazione automatica il 1° del mese.</p>
      </div>
    </aside>
  )
}
