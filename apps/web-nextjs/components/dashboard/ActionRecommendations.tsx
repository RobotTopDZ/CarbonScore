'use client'

import { ArrowTrendingUpIcon, CurrencyEuroIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ActionRecommendation {
  id: string
  titre: string
  description: string
  impactCO2: number
  cout: number
  roi: number
  faisabilite: number
  priorite: number
}

interface ActionRecommendationsProps {
  recommendations: ActionRecommendation[]
}

export function ActionRecommendations({ recommendations }: ActionRecommendationsProps) {
  // Safety check: if recommendations is undefined or empty, provide message
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune recommandation disponible
      </div>
    )
  }
  
  const getPriorityColor = (priorite: number) => {
    if (priorite >= 8) return 'bg-red-100 text-red-800 border-red-200'
    if (priorite >= 6) return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getPriorityText = (priorite: number) => {
    if (priorite >= 8) return 'Haute'
    if (priorite >= 6) return 'Moyenne'
    return 'Faible'
  }

  const getFeasibilityIcon = (faisabilite: number) => {
    if (faisabilite >= 8) return '🟢'
    if (faisabilite >= 6) return '🟡'
    return '🔴'
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k€`
    }
    return `${amount}€`
  }

  const sortedRecommendations = [...recommendations]
    .sort((a, b) => b.priorite - a.priorite)
    .slice(0, 6) // Show top 6 recommendations

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Actions Recommandées
        </h3>
        <p className="text-gray-600">
          Actions prioritaires classées par impact et faisabilité
        </p>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((action, index) => (
          <div 
            key={action.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <h4 className="font-semibold text-gray-900">{action.titre}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(action.priorite)}`}>
                    {getPriorityText(action.priorite)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Impact CO₂</div>
                  <div className="font-semibold text-green-600">
                    -{action.impactCO2.toFixed(1)} tCO₂e
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CurrencyEuroIcon className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">Investissement</div>
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(action.cout)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-600">ROI</div>
                  <div className="font-semibold text-purple-600">
                    {action.roi > 0 ? `${action.roi.toFixed(1)} ans` : 'Immédiat'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Faisabilité</div>
                  <div className="flex items-center gap-1">
                    <span>{getFeasibilityIcon(action.faisabilite)}</span>
                    <span className="font-semibold text-gray-900">
                      {action.faisabilite}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-500">
                  Économies potentielles: {formatCurrency(action.impactCO2 * 50)} /an
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">Impact total potentiel</div>
            <div className="text-sm text-gray-600">Si toutes les actions sont mises en œuvre</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              -{sortedRecommendations.reduce((sum, action) => sum + action.impactCO2, 0).toFixed(1)} tCO₂e
            </div>
            <div className="text-sm text-gray-600">
              Réduction de {((sortedRecommendations.reduce((sum, action) => sum + action.impactCO2, 0) / 100) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button className="px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors">
          Voir toutes les actions
        </button>
      </div>
    </div>
  )
}
