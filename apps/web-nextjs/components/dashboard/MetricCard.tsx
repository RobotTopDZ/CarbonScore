'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  icon?: React.ComponentType<{ className?: string }> | string
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red'
  description?: string
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  changeLabel,
  icon: Icon,
  color = 'blue',
  description 
}: MetricCardProps) {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900'
    }
  }

  const classes = colorClasses[color]

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-xl p-6 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 ${classes.bg} rounded-lg`}>
              {typeof Icon === 'string' ? (
                <span className="text-2xl" role="img" aria-label={title}>
                  {Icon}
                </span>
              ) : (
                <Icon className={`w-5 h-5 ${classes.icon}`} />
              )}
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            change >= 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {change >= 0 ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${classes.text}`}>
            {formatValue(value)}
          </span>
          {unit && (
            <span className="text-lg text-gray-600 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}

      {changeLabel && change !== undefined && (
        <div className="text-xs text-gray-500">
          {change >= 0 ? 'Augmentation' : 'Réduction'} de {Math.abs(change).toFixed(1)}% {changeLabel}
        </div>
      )}
    </div>
  )
}
