'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface EmissionData {
  scope1: number
  scope2: number
  scope3: number
}

interface EmissionChartProps {
  data: EmissionData
}

const COLORS = {
  scope1: '#ef4444', // red-500
  scope2: '#f97316', // orange-500
  scope3: '#22c55e'  // green-500
}

export function EmissionChart({ data }: EmissionChartProps) {
  const chartData = [
    {
      name: 'Scope 1 - Émissions directes',
      value: data.scope1,
      color: COLORS.scope1,
      description: 'Combustion de carburants, procédés industriels'
    },
    {
      name: 'Scope 2 - Énergie indirecte',
      value: data.scope2,
      color: COLORS.scope2,
      description: 'Électricité, vapeur, chauffage/refroidissement'
    },
    {
      name: 'Scope 3 - Autres émissions indirectes',
      value: data.scope3,
      color: COLORS.scope3,
      description: 'Achats, transport, déchets, déplacements'
    }
  ]

  const total = data.scope1 + data.scope2 + data.scope3

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value.toLocaleString()} tCO₂e ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Répartition par Scope
        </h3>
        <p className="text-gray-600">
          Distribution des émissions selon le protocole GHG
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color, fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {chartData.map((scope, index) => {
          const percentage = ((scope.value / total) * 100).toFixed(1)
          return (
            <div key={index} className="text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: scope.color }}
              />
              <div className="text-2xl font-bold text-gray-900">
                {scope.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {percentage}% du total
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
