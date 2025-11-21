'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EmissionsChartProps {
  data: {
    scope_1: number
    scope_2: number
    scope_3: number
    breakdown: Record<string, number>
  }
}

const SCOPE_COLORS = ['#ef4444', '#3b82f6', '#8b5cf6'] // red, blue, purple
const BREAKDOWN_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function ScopesPieChart({ data }: EmissionsChartProps) {
  const scopeData = [
    { name: 'Scope 1', value: data.scope_1, color: '#ef4444' },
    { name: 'Scope 2', value: data.scope_2, color: '#3b82f6' },
    { name: 'Scope 3', value: data.scope_3, color: '#8b5cf6' }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {new Intl.NumberFormat('fr-FR').format(data.value)} kgCO₂e
          </p>
          <p className="text-xs text-gray-500">
            {((data.value / (data.payload.scope_1 + data.payload.scope_2 + data.payload.scope_3)) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={scopeData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {scopeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BreakdownBarChart({ data }: EmissionsChartProps) {
  const breakdownData = Object.entries(data.breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) // Top 8 sources
    .map(([key, value], index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      value: value,
      color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length]
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {new Intl.NumberFormat('fr-FR').format(data.value)} kgCO₂e
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={breakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {breakdownData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
