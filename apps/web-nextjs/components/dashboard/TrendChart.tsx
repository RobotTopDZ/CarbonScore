'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface TrendData {
  mois: string
  emissions: number
  objectif: number
}

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
  // Safety check: if data is undefined or empty, provide message
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée de tendance disponible
      </div>
    )
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.value.toFixed(1)} tCO₂e
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const currentEmissions = data[data.length - 1]?.emissions || 0
  const targetEmissions = data[data.length - 1]?.objectif || 0
  const isOnTrack = currentEmissions <= targetEmissions * 1.1 // 10% tolerance

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Évolution Temporelle
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isOnTrack 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnTrack ? 'Sur la bonne voie' : 'Hors trajectoire'}
          </div>
        </div>
        <p className="text-gray-600">
          Suivi des émissions vs objectifs de réduction
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="objectifGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="mois" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="objectif"
              stroke="#22c55e"
              strokeWidth={3}
              fill="url(#objectifGradient)"
              name="Objectif"
            />
            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#emissionsGradient)"
              name="Émissions réelles"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <div>
            <div className="text-sm text-gray-600">Émissions actuelles</div>
            <div className="text-xl font-bold text-gray-900">
              {currentEmissions.toFixed(1)} tCO₂e
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <div>
            <div className="text-sm text-gray-600">Objectif</div>
            <div className="text-xl font-bold text-gray-900">
              {targetEmissions.toFixed(1)} tCO₂e
            </div>
          </div>
        </div>
      </div>

      {!isOnTrack && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm font-medium text-red-800">
              Écart à l'objectif: +{((currentEmissions - targetEmissions) / targetEmissions * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Des actions supplémentaires sont nécessaires pour atteindre vos objectifs.
          </p>
        </div>
      )}
    </div>
  )
}
