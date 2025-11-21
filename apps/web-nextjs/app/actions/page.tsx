'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SimpleNav from '../../components/layout/SimpleNav'
import {
  LightBulbIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  BookmarkIcon,
  BoltIcon,
  TruckIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Action {
  id: string
  title: string
  description: string
  category: string
  impact_co2e: number
  cost_estimate: string
  feasibility_score: number
  roi_score: number
  priority_rank: number
  implementation_time: string
  complexity: 'low' | 'medium' | 'high'
  sector_relevance: string[]
  tags: string[]
}

interface ScenarioResult {
  total_reduction: number
  total_cost: number
  roi_timeline: number
  feasibility_score: number
  selected_actions: string[]
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [filteredActions, setFilteredActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null)
  const [showScenario, setShowScenario] = useState(false)

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'energy', label: 'Énergie' },
    { value: 'transport', label: 'Transport' },
    { value: 'waste', label: 'Déchets' },
    { value: 'procurement', label: 'Achats' },
    { value: 'operations', label: 'Opérations' }
  ]

  const complexityLevels = [
    { value: 'all', label: 'Toutes complexités' },
    { value: 'low', label: 'Facile' },
    { value: 'medium', label: 'Modéré' },
    { value: 'high', label: 'Complexe' }
  ]

  useEffect(() => {
    fetchActions()
  }, [])

  useEffect(() => {
    filterActions()
  }, [actions, selectedCategory, selectedComplexity, searchQuery])

  const fetchActions = async () => {
    setLoading(true)
    try {
      // Try to get the latest calculation from localStorage
      const latestCalculationId = localStorage.getItem('latestCalculationId') || localStorage.getItem('lastCalculationId')

      if (latestCalculationId) {
        // Fetch the calculation results
        const calcResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/calculation/${latestCalculationId}`)

        if (calcResponse.ok) {
          const calcData = await calcResponse.json()

          // Parse recommendations into Action format
          const parsedActions: Action[] = calcData.recommendations.map((rec: string, index: number) => {
            // Extract CO2 reduction using regex
            const co2Match = rec.match(/réduit (\d+(?:\.\d+)?)\s*kgCO₂e/)
            const co2Reduction = co2Match ? parseFloat(co2Match[1]) : 0

            // Extract cost/savings
            const costMatch = rec.match(/(?:Économie|Investissement|Coût|Surcoût):\s*~?([^|]+)/)
            const costEstimate = costMatch ? costMatch[1].trim() : 'Variable'

            // Extract timeline
            const timelineMatch = rec.match(/Délai:\s*([^|]+)/)
            const timeline = timelineMatch ? timelineMatch[1].trim() : '3-6 mois'

            // Extract ROI
            const roiMatch = rec.match(/ROI:\s*([^|]+)/)
            const roi = roiMatch ? roiMatch[1].trim() : 'Variable'

            // Determine category from keywords
            let category = 'operations'
            let complexity: 'low' | 'medium' | 'high' = 'medium'

            const lowerRec = rec.toLowerCase()

            if (lowerRec.includes('électricité') || lowerRec.includes('éclairage')) {
              category = 'energy'
              complexity = lowerRec.includes('solaire') ? 'high' : 'medium'
            } else if (lowerRec.includes('véhicule') || lowerRec.includes('flotte') || lowerRec.includes('électrifier')) {
              category = 'transport'
              complexity = lowerRec.includes('électrifier') ? 'high' : 'medium'
            } else if (lowerRec.includes('carburant') || lowerRec.includes('éco-conduite')) {
              category = 'transport'
              complexity = 'low'
            } else if (lowerRec.includes('chaudière') || lowerRec.includes('pompe à chaleur') || lowerRec.includes('isolation')) {
              category = 'energy'
              complexity = 'high'
            } else if (lowerRec.includes('vol') || lowerRec.includes('avion') || lowerRec.includes('déplacement')) {
              category = 'transport'
              complexity = 'low'
            } else if (lowerRec.includes('achat') || lowerRec.includes('fournisseur') || lowerRec.includes('approvisionnement')) {
              category = 'procurement'
              complexity = 'medium'
            } else if (lowerRec.includes('gaspillage') || lowerRec.includes('déchet')) {
              category = 'waste'
              complexity = 'low'
            }

            // Calculate feasibility and ROI scores
            const feasibilityScore = complexity === 'low' ? 0.9 : complexity === 'medium' ? 0.7 : 0.5
            const roiScore = roi.includes('immédiat') || roi.includes('6 mois') ? 0.9 :
              roi.includes('2-3 ans') ? 0.75 :
                roi.includes('4-6 ans') ? 0.6 : 0.5

            // Extract title (first part before →)
            const titleMatch = rec.match(/^[^→]+/)
            const title = titleMatch ? titleMatch[0].trim() : rec.substring(0, 60)

            return {
              id: `action_${index}`,
              title: title,
              description: rec,
              category: category,
              impact_co2e: co2Reduction,
              cost_estimate: costEstimate,
              feasibility_score: feasibilityScore,
              roi_score: roiScore,
              priority_rank: index + 1,
              implementation_time: timeline,
              complexity: complexity,
              sector_relevance: [calcData.benchmark_position || 'general'],
              tags: [
                co2Reduction > 2000 ? 'high-impact' : 'medium-impact',
                roiScore > 0.8 ? 'quick-win' : 'long-term',
                category
              ]
            }
          })

          setActions(parsedActions)
          setLoading(false)
          return
        }
      }

      // Fallback to mock data if no calculation found
      const mockActions: Action[] = [
        {
          id: 'renewable_energy',
          title: 'Transition vers l\'énergie renouvelable',
          description: 'Installation de panneaux solaires ou souscription à un contrat d\'énergie verte pour réduire les émissions du scope 2',
          category: 'energy',
          impact_co2e: 15420,
          cost_estimate: '25 000 - 50 000 €',
          feasibility_score: 0.8,
          roi_score: 0.75,
          priority_rank: 1,
          implementation_time: '6-12 mois',
          complexity: 'medium',
          sector_relevance: ['industrie', 'services', 'commerce'],
          tags: ['scope2', 'économies', 'image']
        },
        {
          id: 'energy_efficiency',
          title: 'Amélioration de l\'efficacité énergétique',
          description: 'Isolation, éclairage LED, équipements performants pour réduire la consommation',
          category: 'energy',
          impact_co2e: 6200,
          cost_estimate: '5 000 - 15 000 €',
          feasibility_score: 0.9,
          roi_score: 0.85,
          priority_rank: 2,
          implementation_time: '3-6 mois',
          complexity: 'low',
          sector_relevance: ['industrie', 'services', 'commerce', 'construction'],
          tags: ['scope2', 'économies', 'facile']
        }
      ]

      setActions(mockActions)
    } catch (error) {
      console.error('Error fetching actions:', error)
      setActions([])
    } finally {
      setLoading(false)
    }
  }

  const filterActions = () => {
    let filtered = actions

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.category === selectedCategory)
    }

    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(action => action.complexity === selectedComplexity)
    }

    if (searchQuery) {
      filtered = filtered.filter(action =>
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (action.tags && action.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    }

    setFilteredActions(filtered)
  }

  const toggleActionSelection = (actionId: string) => {
    const newSelected = new Set(selectedActions)
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId)
    } else {
      newSelected.add(actionId)
    }
    setSelectedActions(newSelected)
  }

  const runScenarioAnalysis = async () => {
    const selectedActionData = actions.filter(action => selectedActions.has(action.id))

    if (selectedActionData.length === 0) {
      return
    }

    try {
      // Get the latest calculation ID
      const latestCalculationId = localStorage.getItem('latestCalculationId') || localStorage.getItem('lastCalculationId')

      if (!latestCalculationId) {
        // Fallback to simple analysis
        const totalReduction = selectedActionData.reduce((sum, action) => sum + action.impact_co2e, 0)
        const avgFeasibility = selectedActionData.reduce((sum, action) => sum + action.feasibility_score, 0) / selectedActionData.length
        const totalCost = selectedActionData.length * 25000 // Simplified

        const result: ScenarioResult = {
          total_reduction: totalReduction,
          total_cost: totalCost,
          roi_timeline: Math.round(totalCost / (totalReduction * 100) * 12),
          feasibility_score: avgFeasibility,
          selected_actions: Array.from(selectedActions)
        }

        setScenarioResult(result)
        setShowScenario(true)
        return
      }

      // Call scenario analysis API for each selected action
      const scenarioPromises = selectedActionData.map(async (action, index) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/scenario-analysis/${latestCalculationId}?action_index=${action.priority_rank - 1}`,
            { method: 'POST' }
          )

          if (response.ok) {
            return await response.json()
          }
          return null
        } catch (error) {
          console.error(`Error fetching scenario for action ${index}:`, error)
          return null
        }
      })

      const scenarios = await Promise.all(scenarioPromises)
      const validScenarios = scenarios.filter(s => s !== null)

      // Aggregate results
      const totalReduction = validScenarios.reduce((sum, s) => sum + (s.co2_reduction_kg || 0), 0)
      const avgFeasibility = selectedActionData.reduce((sum, action) => sum + action.feasibility_score, 0) / selectedActionData.length

      // Estimate total cost from scenarios
      let totalCost = 0
      validScenarios.forEach(scenario => {
        if (scenario.costs) {
          // Try to extract numeric values from cost estimates
          const costValues = Object.values(scenario.costs).join(' ')
          const costMatch = costValues.match(/(\d+(?:,\d+)*(?:\.\d+)?)/g)
          if (costMatch) {
            const avgCost = costMatch.map(c => parseFloat(c.replace(/,/g, ''))).reduce((a, b) => a + b, 0) / costMatch.length
            totalCost += avgCost
          }
        }
      })

      if (totalCost === 0) {
        totalCost = selectedActionData.length * 25000 // Fallback
      }

      const result: ScenarioResult = {
        total_reduction: totalReduction,
        total_cost: totalCost,
        roi_timeline: Math.round(totalCost / (totalReduction * 100) * 12),
        feasibility_score: avgFeasibility,
        selected_actions: Array.from(selectedActions)
      }

        // Store detailed scenarios for display
        (result as any).detailed_scenarios = validScenarios

      setScenarioResult(result)
      setShowScenario(true)

    } catch (error) {
      console.error('Error running scenario analysis:', error)

      // Fallback to simple calculation
      const totalReduction = selectedActionData.reduce((sum, action) => sum + action.impact_co2e, 0)
      const avgFeasibility = selectedActionData.reduce((sum, action) => sum + action.feasibility_score, 0) / selectedActionData.length
      const totalCost = selectedActionData.length * 25000

      const result: ScenarioResult = {
        total_reduction: totalReduction,
        total_cost: totalCost,
        roi_timeline: Math.round(totalCost / (totalReduction * 100) * 12),
        feasibility_score: avgFeasibility,
        selected_actions: Array.from(selectedActions)
      }

      setScenarioResult(result)
      setShowScenario(true)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  type HeroIcon = typeof LightBulbIcon
  const categoryIconMap: Record<string, HeroIcon> = {
    energy: BoltIcon,
    transport: TruckIcon,
    waste: TrashIcon,
    procurement: ShoppingCartIcon,
    operations: Cog6ToothIcon
  }

  const getCategoryIcon = (category: string): HeroIcon => (
    categoryIconMap[category] || LightBulbIcon
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des actions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Centre d'Actions
                </h1>
                <p className="text-gray-600 mt-1">
                  Recommandations personnalisées pour réduire votre empreinte carbone
                </p>
              </div>
            </div>

            {selectedActions.size > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={runScenarioAnalysis}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  Analyser le scénario ({selectedActions.size})
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Complexity Filter */}
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {complexityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredActions.map((action, index) => {
            const CategoryIcon = getCategoryIcon(action.category)
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer ${selectedActions.has(action.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => toggleActionSelection(action.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(action.complexity)}`}>
                            {action.complexity === 'low' ? 'Facile' : action.complexity === 'medium' ? 'Modéré' : 'Complexe'}
                          </span>
                          <span className="text-xs text-gray-500">#{action.priority_rank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedActions.has(action.id) && (
                        <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                      )}
                      <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {action.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <ArrowTrendingDownIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-900">
                        {(action.impact_co2e / 1000).toFixed(1)}t
                      </div>
                      <div className="text-xs text-green-700">CO₂e économisé</div>
                    </div>

                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <CurrencyEuroIcon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-bold text-blue-900">
                        {action.cost_estimate}
                      </div>
                      <div className="text-xs text-blue-700">Investissement</div>
                    </div>
                  </div>

                  {/* ROI & Timeline */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ChartBarIcon className="w-4 h-4" />
                      ROI: {(action.roi_score * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {action.implementation_time}
                    </div>
                  </div>

                  {/* Tags */}
                  {action.tags && action.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {action.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Scenario Analysis Modal */}
        {showScenario && scenarioResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScenario(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analyse de Scénario Détaillée</h2>
                  <button
                    onClick={() => setShowScenario(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-900 mb-1">
                      {(scenarioResult.total_reduction / 1000).toFixed(1)}t
                    </div>
                    <div className="text-xs text-green-700 font-medium">Réduction CO₂e totale</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-900 mb-1">
                      {(scenarioResult.total_cost / 1000).toFixed(0)}k€
                    </div>
                    <div className="text-xs text-blue-700 font-medium">Investissement total</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-900 mb-1">
                      {scenarioResult.roi_timeline}
                    </div>
                    <div className="text-xs text-purple-700 font-medium">Mois pour ROI</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-900 mb-1">
                      {(scenarioResult.feasibility_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-yellow-700 font-medium">Faisabilité</div>
                  </div>
                </div>

                {/* Detailed Scenarios */}
                {(scenarioResult as any).detailed_scenarios && (scenarioResult as any).detailed_scenarios.length > 0 && (
                  <div className="space-y-6">
                    {(scenarioResult as any).detailed_scenarios.map((scenario: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-white"
                      >
                        {/* Action Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <BoltIcon className="w-5 h-5 text-purple-600" />
                          {scenario.action || `Action ${idx + 1}`}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Implementation Steps */}
                          {scenario.implementation_steps && scenario.implementation_steps.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                Plan de mise en œuvre
                              </h4>
                              <ul className="space-y-1.5 text-sm">
                                {scenario.implementation_steps.map((step: string, i: number) => (
                                  <li key={i} className="text-gray-700 flex items-start gap-2">
                                    <span className="text-purple-600 font-semibold mt-0.5">•</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Timeline */}
                          {scenario.timeline && Object.keys(scenario.timeline).length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-blue-600" />
                                Calendrier
                              </h4>
                              <div className="space-y-1.5 text-sm">
                                {Object.entries(scenario.timeline).map(([phase, timing]: [string, any]) => (
                                  <div key={phase} className="flex justify-between items-center">
                                    <span className="text-gray-600 capitalize">{phase.replace(/_/g, ' ')}</span>
                                    <span className="font-medium text-gray-900">{timing}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Costs */}
                          {scenario.costs && Object.keys(scenario.costs).length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <CurrencyEuroIcon className="w-4 h-4 text-green-600" />
                                Structure des coûts
                              </h4>
                              <div className="space-y-1.5 text-sm">
                                {Object.entries(scenario.costs).map(([item, cost]: [string, any]) => (
                                  <div key={item} className="flex justify-between items-center">
                                    <span className="text-gray-600 capitalize">{item.replace(/_/g, ' ')}</span>
                                    <span className="font-medium text-gray-900">{cost}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ROI Analysis */}
                          {scenario.roi_analysis && Object.keys(scenario.roi_analysis).length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <ChartBarIcon className="w-4 h-4 text-purple-600" />
                                Analyse ROI
                              </h4>
                              <div className="space-y-1.5 text-sm">
                                {Object.entries(scenario.roi_analysis).map(([metric, value]: [string, any]) => (
                                  <div key={metric} className="flex justify-between items-center">
                                    <span className="text-gray-600 capitalize">{metric.replace(/_/g, ' ')}</span>
                                    <span className="font-medium text-gray-900">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Benefits & Risks */}
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                          {scenario.benefits && scenario.benefits.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <LightBulbIcon className="w-4 h-4 text-yellow-600" />
                                Bénéfices
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {scenario.benefits.map((benefit: string, i: number) => (
                                  <li key={i} className="text-gray-700 flex items-start gap-2">
                                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {scenario.risks && scenario.risks.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                                Risques à anticiper
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {scenario.risks.map((risk: string, i: number) => (
                                  <li key={i} className="text-gray-700 flex items-start gap-2">
                                    <span className="text-red-600 font-bold mt-0.5">!</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* KPIs */}
                        {scenario.kpis && scenario.kpis.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <ChartBarIcon className="w-4 h-4 text-blue-600" />
                              Indicateurs de suivi (KPIs)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {scenario.kpis.map((kpi: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                                >
                                  {kpi}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowScenario(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Fermer
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl">
                    Exporter le plan détaillé
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
