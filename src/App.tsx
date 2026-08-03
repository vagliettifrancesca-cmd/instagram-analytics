import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import KPICards from './components/KPICards'
import { FollowerChart, ReachERChart, EngagementStackedChart } from './components/Charts'
import ContentBreakdown from './components/ContentBreakdown'
import ContentTable from './components/ContentTable'
import StoriesPanel from './components/StoriesPanel'
import InsightsPanel from './components/InsightsPanel'
import AudiencePanel from './components/AudiencePanel'
import PerformancePage from './components/PerformancePage'
import StoriesPage from './components/StoriesPage'
import ReportPage from './components/ReportPage'
import CollaborationsPage from './components/CollaborationsPage'
import { MONTHLY_HISTORY } from './data/mockData'

type Page = 'overview' | 'performance' | 'stories' | 'report' | 'collaborazioni' | 'settings'

export default function App() {
  const [month, setMonth] = useState('2026-07')
  const [page, setPage] = useState<Page>('overview')
  const idx = MONTHLY_HISTORY.findIndex(m => m.month === month)
  const current = MONTHLY_HISTORY[idx]
  const previous = MONTHLY_HISTORY[Math.max(0, idx - 1)]

  return (
    <div className="flex min-h-screen bg-surface-900">
      <Sidebar page={page} onPageChange={setPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header month={month} onChange={setMonth} />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {page === 'overview' && (
            <>
              <KPICards current={current} previous={previous} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FollowerChart />
                <ReachERChart />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ContentBreakdown month={month} />
                <div className="lg:col-span-2"><EngagementStackedChart /></div>
              </div>
              <StoriesPanel month={month} />
              <ContentTable month={month} />
              <AudiencePanel />
              <InsightsPanel />
            </>
          )}
          {page === 'performance' && <PerformancePage month={month} />}
          {page === 'stories' && <StoriesPage month={month} />}
          {page === 'report' && <ReportPage month={month} current={current} previous={previous} />}
          {page === 'collaborazioni' && <CollaborationsPage />}
          {page === 'settings' && (
            <div className="bg-surface-800 border border-white/5 rounded-2xl p-8">
              <h2 className="text-white text-xl font-semibold mb-3">Impostazioni</h2>
              <p className="text-gray-400">Impostazioni API e preferenze in arrivo ⚙️</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
