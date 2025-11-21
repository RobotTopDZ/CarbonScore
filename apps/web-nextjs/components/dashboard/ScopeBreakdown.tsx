'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ScopeData {
  scope1: number
  scope2: number
  scope3: number
}

interface ScopeBreakdownProps {
  data: ScopeData
}

export function ScopeBreakdown({ data }: ScopeBreakdownProps) {
  // Safety check: if data is undefined, provide defaults
  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée disponible
      </div>
    )
  }
  
  const total = (data.scope1 || 0) + (data.scope2 || 0) + (data.scope3 || 0)
  
  if (total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune émission enregistrée
      </div>
    )
  }

  const chartData = [
    {
      name: 'Scope 1',
      value: data.scope1,
      percentage: ((data.scope1 / total) * 100).toFixed(1),
      color: '#ef4444',
      description: 'Émissions directes',
      details: 'Combustion de carburants fossiles, procédés industriels, véhicules de société'
    },
    {
      name: 'Scope 2',
      value: data.scope2,
      percentage: ((data.scope2 / total) * 100).toFixed(1),
      color: '#f97316',
      description: 'Énergie indirecte',
      details: 'Électricité, vapeur, chauffage et refroidissement achetés'
    },
    {
      name: 'Scope 3',
      value: data.scope3,
      percentage: ((data.scope3 / total) * 100).toFixed(1),
      color: '#22c55e',
      description: 'Autres émissions indirectes',
      details: 'Achats, transport, déchets, déplacements professionnels, télétravail'
    }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-gray-900">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value.toLocaleString()} tCO₂e ({data.percentage}%)
          </p>
          <p className="text-xs text-gray-500 mt-2">{data.details}</p>
        </div>
      )
    }
    return null
  }

  const getScopeRecommendation = (scopeData: any) => {
    const maxScope = chartData.reduce((prev, current) => 
      prev.value > current.value ? prev : current
    )
    
    if (maxScope.name === 'Scope 3') {
      return {
        type: 'info',
        message: 'Le Scope 3 représente la majorité de vos émissions. Concentrez-vous sur la chaîne d\'approvisionnement.'
      }
    } else if (maxScope.name === 'Scope 1') {
      return {
        type: 'warning',
        message: 'Émissions directes élevées. Considérez l\'électrification ou l\'efficacité énergétique.'
      }
    } else {
      return {
        type: 'info',
        message: 'Émissions énergétiques importantes. Explorez les énergies renouvelables.'
      }
    }
  }

  const recommendation = getScopeRecommendation(data)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyse par Scope GHG
        </h3>
        <p className="text-gray-600">
          Répartition détaillée selon le protocole GHG Protocol
        </p>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#d1d5db' }}
              label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {chartData.map((scope, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: scope.color }}
              />
              <div>
                <div className="font-semibold text-gray-900">{scope.name}</div>
                <div className="text-sm text-gray-600">{scope.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {scope.value.toLocaleString()} tCO₂e
              </div>
              <div className="text-sm text-gray-600">
                {scope.percentage}% du total
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg border ${
        recommendation.type === 'warning' 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            recommendation.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
          }`} />
          <span className={`text-sm font-medium ${
            recommendation.type === 'warning' ? 'text-amber-800' : 'text-blue-800'
          }`}>
            Recommandation
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          recommendation.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
        }`}>
          {recommendation.message}
        </p>
      </div>
    </div>
  )
}
