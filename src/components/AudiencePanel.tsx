import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// ── Dati reali da Pubblico.csv · @deeva.it · aggiornato lug 2026 ─────────────
const AGE_DATA = [
  { age: '18-24', donne: 2.0,  uomini: 0.2 },
  { age: '25-34', donne: 22.9, uomini: 1.0 },
  { age: '35-44', donne: 36.8, uomini: 0.9 },
  { age: '45-54', donne: 20.6, uomini: 0.8 },
  { age: '55-64', donne: 11.5, uomini: 0.4 },
  { age: '65+',   donne: 2.7,  uomini: 0.2 },
]

const TOP_CITIES = [
  { city: 'Milano',            pct: 20.7 },
  { city: 'Torino',            pct: 14.0 },
  { city: 'Roma',              pct: 2.9  },
  { city: 'Monza',             pct: 1.8  },
  { city: 'Moncalieri',        pct: 0.8  },
  { city: 'Sesto S. Giovanni', pct: 0.7  },
  { city: 'Rivoli',            pct: 0.7  },
  { city: 'Collegno',          pct: 0.6  },
  { city: 'Nichelino',         pct: 0.6  },
  { city: 'Genova',            pct: 0.6  },
]

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-semibold">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  )
}

export default function AudiencePanel() {
  const totalDonne  = AGE_DATA.reduce((a, d) => a + d.donne, 0)   // ~96.6%
  const totalUomini = AGE_DATA.reduce((a, d) => a + d.uomini, 0)  // ~3.4%

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Genere + Paese */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5 flex flex-col gap-5">
        <div>
          <p className="text-white font-semibold">Pubblico</p>
          <p className="text-xs text-gray-500 mt-0.5">Genere · Provenienza</p>
        </div>

        {/* Genere */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Genere</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-pink-400 font-medium">Donne</span>
                <span className="text-white font-bold">{totalDonne.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${totalDonne}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-medium">Uomini</span>
                <span className="text-white font-bold">{totalUomini.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalUomini}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Paesi */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Paese</p>
          <div className="space-y-1.5">
            {[
              { flag: '🇮🇹', name: 'Italia',        pct: 98.4 },
              { flag: '🇨🇭', name: 'Svizzera',      pct: 0.2  },
              { flag: '🇪🇸', name: 'Spagna',        pct: 0.2  },
              { flag: '🇬🇧', name: 'Regno Unito',   pct: 0.1  },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span className="w-5">{c.flag}</span>
                <span className="text-gray-300 flex-1">{c.name}</span>
                <span className="text-white font-semibold">{c.pct}%</span>
                <div className="w-16 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Età */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <div className="mb-5">
          <p className="text-white font-semibold">Fascia d'età</p>
          <p className="text-xs text-gray-500 mt-0.5">Donne · Uomini</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={AGE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} layout="vertical">
            <XAxis type="number" tick={{ fill: '#6F655C', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="age" tick={{ fill: '#8B8078', fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<TT />} />
            <Bar dataKey="donne"  name="Donne"  fill="#FF5740" fillOpacity={0.85} radius={[0,3,3,0]} stackId="a" />
            <Bar dataKey="uomini" name="Uomini" fill="#2F86DB" fillOpacity={0.85} radius={[0,3,3,0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />Donne</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Uomini</span>
        </div>
      </div>

      {/* Città */}
      <div className="bg-surface-800 border border-white/5 rounded-2xl p-5">
        <div className="mb-5">
          <p className="text-white font-semibold">Top città</p>
          <p className="text-xs text-gray-500 mt-0.5">% del pubblico totale</p>
        </div>
        <div className="space-y-3">
          {TOP_CITIES.map((c, i) => (
            <div key={c.city}>
              <div className="flex justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono w-4">{i + 1}</span>
                  <span className="text-gray-200">{c.city}</span>
                </div>
                <span className="text-white font-bold">{c.pct}%</span>
              </div>
              <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(c.pct / 22.2) * 100}%`,
                    background: i < 2 ? '#FF5740' : '#6F655C',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">📍 Milano + Torino = 37.5% del totale audience</p>
      </div>

    </div>
  )
}
