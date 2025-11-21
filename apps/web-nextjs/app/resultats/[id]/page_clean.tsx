'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import SimpleNav from '../../../components/layout/SimpleNav'
import { ScopesPieChart, BreakdownBarChart } from '../../../components/charts/EmissionsChart'
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  TrophyIcon,
  GlobeAltIcon,
  LightBulbIcon,
  FireIcon,
  BoltIcon,
  ShoppingCartIcon,
  TruckIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'

interface CalculationResult {
  calculation_id: string
  status: string
  total_co2e: number
  scope_1: number
  scope_2: number
  scope_3: number
  breakdown: Record<string, number>
  recommendations: string[]
  benchmark_position: string
  intensity_per_employee: number
  intensity_per_revenue?: number
  calculated_at: string
  
  // Advanced KPIs
  carbon_efficiency_score?: number
  reduction_potential?: Record<string, number>
  trajectory_2030?: Record<string, number>
  sustainability_grade?: string
  cost_of_carbon?: number
  equivalent_metrics?: Record<string, number>
  monthly_breakdown?: Array<{month: number, emissions: number, factor: number}>
  peer_comparison?: Record<string, number>
  certification_readiness?: Record<string, boolean>
  ai_insights?: Record<string, string>
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('🔍 Fetching results for ID:', params.id)
        const response = await fetch(`http://localhost:8001/api/v1/calculation/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Résultats non trouvés')
        }

        const data = await response.json()
        console.log('✅ Results loaded:', data)
        setResult(data)
      } catch (err) {
        console.error('❌ Error loading results:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchResults()
    }
  }, [params.id])

  const downloadPDF = async () => {
    const loadingToast = toast.loading('Génération du rapport PDF...')
    
    try {
      console.log('📄 Requesting PDF generation for:', params.id)
      
      const response = await fetch('http://localhost:8020/api/v1/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculation_id: params.id,
          calculation_data: result,
          template: 'comprehensive'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur génération PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-carbone-${params.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('✅ Rapport PDF téléchargé !', { id: loadingToast })
    } catch (error) {
      console.error('❌ PDF generation error:', error)
      toast.error('❌ Erreur lors de la génération du PDF', { id: loadingToast })
    }
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-green-600 bg-green-50 border-green-200',
      'A': 'text-green-600 bg-green-50 border-green-200',
      'B': 'text-blue-600 bg-blue-50 border-blue-200',
      'C': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'D': 'text-orange-600 bg-orange-50 border-orange-200',
      'E': 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[grade] || colors['C']
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Chargement des résultats...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FireIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/questionnaire')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Nouveau calcul
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate grade if not provided
  const grade = result.sustainability_grade || (() => {
    const perEmployee = result.intensity_per_employee
    if (perEmployee < 1000) return 'A+'
    if (perEmployee < 2000) return 'A'
    if (perEmployee < 5000) return 'B'
    if (perEmployee < 10000) return 'C'
    if (perEmployee < 20000) return 'D'
    return 'E'
  })()

  // Calculate reduction potential if not provided
  const reductionPotential = result.reduction_potential || {
    'immediate': result.total_co2e * 0.15,
    'short_term': result.total_co2e * 0.30,
    'long_term': result.total_co2e * 0.50
  }

  // Calculate cost of carbon if not provided
  const costOfCarbon = result.cost_of_carbon || result.total_co2e * 80 // 80€ per ton

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Votre Empreinte Carbone
              </h1>
              <p className="text-green-100">
                Calculé le {new Date(result.calculated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className={`text-center px-8 py-4 rounded-xl border-4 ${getGradeColor(grade)}`}>
              <div className="text-5xl font-bold">{grade}</div>
              <div className="text-sm font-medium mt-1">Note</div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <FireIcon className="w-8 h-8 text-red-500" />
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(result.total_co2e)}
            </div>
            <div className="text-sm text-gray-500 mt-1">kgCO₂e</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-medium text-gray-500">Par employé</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(result.intensity_per_employee)}
            </div>
            <div className="text-sm text-gray-500 mt-1">kgCO₂e/employé</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <ArrowTrendingDownIcon className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium text-gray-500">Potentiel</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(reductionPotential.long_term || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">kgCO₂e réductibles</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <CurrencyEuroIcon className="w-8 h-8 text-purple-500" />
              <span className="text-sm font-medium text-gray-500">Coût carbone</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(costOfCarbon)}
            </div>
            <div className="text-sm text-gray-500 mt-1">à 80€/tonne</div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Scope</h3>
            <ScopesPieChart data={result} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources principales</h3>
            <BreakdownBarChart data={result} />
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <SparklesIcon className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommandations IA</h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <LightBulbIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-900 mb-1">Réduction immédiate</div>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(reductionPotential.immediate || 0)}
              </div>
              <div className="text-xs text-green-700 mt-1">kgCO₂e (0-6 mois)</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900 mb-1">Court terme</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(reductionPotential.short_term || 0)}
              </div>
              <div className="text-xs text-blue-700 mt-1">kgCO₂e (6-18 mois)</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-900 mb-1">Long terme</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(reductionPotential.long_term || 0)}
              </div>
              <div className="text-xs text-purple-700 mt-1">kgCO₂e (18-36 mois)</div>
            </div>
          </div>
        </motion.div>

        {/* Benchmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <TrophyIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Position sectorielle</h3>
              <p className="text-gray-700 mb-2">{result.benchmark_position}</p>
              <p className="text-sm text-gray-600">
                Votre intensité carbone: <span className="font-semibold">{formatNumber(result.intensity_per_employee)} kgCO₂e par employé</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Télécharger le rapport PDF
          </button>
          
          <button
            onClick={() => router.push('/actions')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <LightBulbIcon className="w-5 h-5" />
            Voir les actions recommandées
          </button>
          
          <button
            onClick={() => router.push('/questionnaire')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Nouveau calcul
          </button>
        </div>
      </div>
    </div>
  )
}
