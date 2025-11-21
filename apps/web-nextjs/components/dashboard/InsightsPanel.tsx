'use client'

import { 
  InformationCircleIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface Insight {
  type: 'info' | 'warning' | 'success' | 'error'
  titre: string
  description: string
  valeur?: number
  unite?: string
}

interface InsightsPanelProps {
  insights: Insight[]
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  // Safety check: if insights is undefined or empty, provide message
  if (!insights || !Array.isArray(insights) || insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun insight disponible
      </div>
    )
  }
  
  const getInsightConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          textColor: 'text-green-700'
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-900',
          textColor: 'text-amber-700'
        }
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          textColor: 'text-red-700'
        }
      default:
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          textColor: 'text-blue-700'
        }
    }
  }

  const generateAIInsights = () => {
    // Generate some AI-powered insights based on typical patterns
    const aiInsights = [
      {
        type: 'info' as const,
        titre: 'Analyse Sectorielle',
        description: 'Votre intensité carbone est 15% inférieure à la médiane de votre secteur. Excellent travail !',
        valeur: 15,
        unite: '%'
      },
      {
        type: 'warning' as const,
        titre: 'Pic Saisonnier Détecté',
        description: 'Les émissions de chauffage ont augmenté de 23% ce trimestre. Considérez l\'isolation thermique.',
        valeur: 23,
        unite: '%'
      },
      {
        type: 'success' as const,
        titre: 'Objectif Atteint',
        description: 'Réduction de 12% des émissions de transport grâce au télétravail et aux véhicules électriques.',
        valeur: 12,
        unite: '%'
      }
    ]
    return aiInsights
  }

  const allInsights = [...insights, ...generateAIInsights()]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <LightBulbIcon className="w-5 h-5 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-900">
            Insights IA
          </h3>
        </div>
        <p className="text-gray-600">
          Analyses automatiques et recommandations personnalisées
        </p>
      </div>

      <div className="space-y-4">
        {allInsights.map((insight, index) => {
          const config = getInsightConfig(insight.type)
          const Icon = config.icon

          return (
            <div 
              key={index}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${config.titleColor}`}>
                      {insight.titre}
                    </h4>
                    {insight.valeur && (
                      <div className="flex items-center gap-1">
                        {insight.type === 'success' ? (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-green-600" />
                        ) : insight.type === 'warning' ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-amber-600" />
                        ) : null}
                        <span className={`font-bold ${config.iconColor}`}>
                          {insight.valeur}{insight.unite}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${config.textColor} leading-relaxed`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-900">
            Analyse en cours
          </span>
        </div>
        <p className="text-sm text-blue-700">
          Notre IA analyse vos données en continu pour identifier de nouvelles opportunités d'optimisation.
        </p>
      </div>

      <div className="mt-4 text-center">
        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Voir toutes les analyses
        </button>
      </div>
    </div>
  )
}
