'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface BenchmarkData {
  secteur: string
  mediane: number
  percentile: number
  position: 'excellent' | 'bon' | 'moyen' | 'ameliorer'
  votreSociete: number
}

interface BenchmarkChartProps {
  data: BenchmarkData
}

export function BenchmarkChart({ data }: BenchmarkChartProps) {
  // Safety check: if data is undefined, provide defaults
  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée disponible
      </div>
    )
  }
  
  const chartData = [
    {
      name: 'Quartile inférieur',
      value: (data.mediane || 0) * 0.6,
      color: '#22c55e',
      label: 'Excellent'
    },
    {
      name: 'Médiane sectorielle',
      value: data.mediane || 0,
      color: '#f59e0b',
      label: 'Moyen'
    },
    {
      name: 'Quartile supérieur',
      value: (data.mediane || 0) * 1.4,
      color: '#ef4444',
      label: 'À améliorer'
    }
  ]

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'excellent': return '#22c55e'
      case 'bon': return '#84cc16'
      case 'moyen': return '#f59e0b'
      case 'ameliorer': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getPositionText = (position: string) => {
    switch (position) {
      case 'excellent': return 'Excellent'
      case 'bon': return 'Bon'
      case 'moyen': return 'Moyen'
      case 'ameliorer': return 'À améliorer'
      default: return 'Non évalué'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value.toFixed(1)} tCO₂e/employé
          </p>
          <p className="text-sm text-gray-600">{data.payload.label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Benchmark Sectoriel
        </h3>
        <p className="text-gray-600">
          Comparaison avec le secteur {data.secteur || 'N/A'}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {(data.votreSociete || 0).toFixed(1)} tCO₂e
            </div>
            <div className="text-sm text-gray-600">par employé</div>
          </div>
          <div className="text-right">
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: getPositionColor(data.position || 'moyen') + '20',
                color: getPositionColor(data.position || 'moyen')
              }}
            >
              {getPositionText(data.position || 'moyen')}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {data.percentile || 50}e percentile
            </div>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'tCO₂e/employé', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
            <ReferenceLine 
              y={data.votreSociete || 0} 
              stroke={getPositionColor(data.position || 'moyen')}
              strokeWidth={3}
              strokeDasharray="5 5"
              label={{ 
                value: "Votre société", 
                position: "top"
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-green-600">
            {((data.mediane || 0) * 0.6).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Leaders</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-amber-600">
            {(data.mediane || 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Médiane</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-red-600">
            {((data.mediane || 0) * 1.4).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">À améliorer</div>
        </div>
      </div>
    </div>
  )
}
