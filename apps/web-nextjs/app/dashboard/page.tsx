'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GlobeAltIcon,
  UserIcon,
  CurrencyEuroIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline'
import SimpleNav from '../../components/layout/SimpleNav'
import { EmissionChart } from '../../components/dashboard/EmissionChart'
import { BenchmarkChart } from '../../components/dashboard/BenchmarkChart'
import { TrendChart } from '../../components/dashboard/TrendChart'
import { ScopeBreakdown } from '../../components/dashboard/ScopeBreakdown'
import { ActionRecommendations } from '../../components/dashboard/ActionRecommendations'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { InsightsPanel } from '../../components/dashboard/InsightsPanel'

interface DashboardData {
  emissions: {
    total: number
    scope1: number
    scope2: number
    scope3: number
    parEmploye: number
    parChiffreAffaires: number
  }
  benchmark: {
    secteur: string
    mediane: number
    percentile: number
    position: 'excellent' | 'bon' | 'moyen' | 'ameliorer'
  }
  tendances: Array<{
    mois: string
    emissions: number
    objectif: number
  }>
  recommandations: Array<{
    id: string
    titre: string
    description: string
    impactCO2: number
    cout: number
    roi: number
    faisabilite: number
    priorite: number
  }>
  insights: Array<{
    type: 'info' | 'warning' | 'success' | 'error'
    titre: string
    description: string
    valeur?: number
    unite?: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('12m')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check for calculation ID in localStorage or URL
        const calculationId = localStorage.getItem('lastCalculationId') || new URLSearchParams(window.location.search).get('calculationId')
        
        let url = `/api/dashboard?period=${selectedPeriod}`
        if (calculationId) {
          url += `&calculationId=${calculationId}`
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données')
        }
        const dashboardData = await response.json()
        
        // Check if we have valid emissions data
        if (dashboardData.emissions && dashboardData.emissions.total > 0) {
          setData(dashboardData)
        } else {
          // No valid data
          setData(null)
        }
      } catch (error) {
        console.error('Erreur:', error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-carbon-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-carbon-600">Aucune donnée disponible</p>
          <button 
            onClick={() => window.location.href = '/questionnaire'}
            className="btn-primary mt-4"
          >
            Commencer une évaluation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-carbon-900">
                Tableau de Bord Carbone
              </h1>
              <p className="text-carbon-600 mt-1">
                Suivi et analyse de votre empreinte carbone
              </p>
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="rounded-lg border-gray-300 text-sm"
              >
                <option value="3m">3 derniers mois</option>
                <option value="6m">6 derniers mois</option>
                <option value="12m">12 derniers mois</option>
                <option value="24m">24 derniers mois</option>
              </select>
              <button className="btn-primary">
                Générer un rapport
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Émissions Totales"
            value={data.emissions.total}
            unit="tCO2e"
            change={-5.2}
            changeLabel="vs mois précédent"
            icon={GlobeAltIcon}
            color="green"
          />
          <MetricCard
            title="Par Employé"
            value={data.emissions.parEmploye}
            unit="tCO2e/employé"
            change={-3.1}
            changeLabel="vs mois précédent"
            icon={UserIcon}
            color="blue"
          />
          <MetricCard
            title="Intensité Carbone"
            value={data.emissions.parChiffreAffaires}
            unit="kgCO2e/k€"
            change={-7.8}
            changeLabel="vs mois précédent"
            icon={CurrencyEuroIcon}
            color="purple"
          />
          <MetricCard
            title="Percentile Secteur"
            value={data.benchmark.percentile}
            unit="ème"
            change={12}
            changeLabel="position"
            icon={PresentationChartBarIcon}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-carbon-900 mb-4">
              Répartition par Scope
            </h3>
            <ScopeBreakdown data={data.emissions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-carbon-900 mb-4">
              Benchmark Sectoriel
            </h3>
            <BenchmarkChart benchmark={data.benchmark} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-carbon-900 mb-4">
              Évolution des Émissions
            </h3>
            <TrendChart data={data.tendances} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-carbon-900 mb-4">
              Insights IA
            </h3>
            <InsightsPanel insights={data.insights} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-carbon-900 mb-4">
            Recommandations d'Actions
          </h3>
          <ActionRecommendations recommendations={data.recommandations} />
        </motion.div>
      </main>
    </div>
  )
}
