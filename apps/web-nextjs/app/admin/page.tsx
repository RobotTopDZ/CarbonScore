'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SimpleNav from '../../components/layout/SimpleNav'
import { 
  Cog6ToothIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CpuChipIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'

interface SystemHealth {
  service: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  last_check: string
  response_time: number
  details?: string
}

interface SystemMetrics {
  total_users: number
  total_companies: number
  total_calculations: number
  total_reports: number
  active_sessions: number
  api_calls_today: number
  storage_used: number
  storage_total: number
}

interface RecentActivity {
  id: string
  type: 'calculation' | 'report' | 'user_signup' | 'error'
  description: string
  timestamp: string
  user?: string
  status: 'success' | 'warning' | 'error'
}

export default function AdminPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'data'>('overview')

  useEffect(() => {
    fetchSystemData()
    const interval = setInterval(fetchSystemData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemData = async () => {
    try {
      // Mock data - in production, fetch from admin API
      const mockHealth: SystemHealth[] = [
        {
          service: 'Frontend (Next.js)',
          status: 'healthy',
          uptime: '99.9%',
          last_check: new Date().toISOString(),
          response_time: 120
        },
        {
          service: 'Calculation Service',
          status: 'healthy',
          uptime: '99.8%',
          last_check: new Date().toISOString(),
          response_time: 85
        },
        {
          service: 'ML Service',
          status: 'warning',
          uptime: '98.5%',
          last_check: new Date().toISOString(),
          response_time: 340,
          details: 'High memory usage detected'
        },
        {
          service: 'PDF Service',
          status: 'healthy',
          uptime: '99.7%',
          last_check: new Date().toISOString(),
          response_time: 200
        },
        {
          service: 'LLM Service',
          status: 'healthy',
          uptime: '99.2%',
          last_check: new Date().toISOString(),
          response_time: 450
        },
        {
          service: 'Database (PostgreSQL)',
          status: 'healthy',
          uptime: '99.9%',
          last_check: new Date().toISOString(),
          response_time: 15
        }
      ]

      const mockMetrics: SystemMetrics = {
        total_users: 1247,
        total_companies: 892,
        total_calculations: 3456,
        total_reports: 2134,
        active_sessions: 45,
        api_calls_today: 12890,
        storage_used: 45.2, // GB
        storage_total: 100 // GB
      }

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'calculation',
          description: 'Nouveau calcul d\'empreinte carbone - TechCorp Solutions',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          user: 'jean.dupont@techcorp.fr',
          status: 'success'
        },
        {
          id: '2',
          type: 'report',
          description: 'Génération de rapport PDF - EcoServices SARL',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          user: 'marie.martin@ecoservices.fr',
          status: 'success'
        },
        {
          id: '3',
          type: 'user_signup',
          description: 'Nouvelle inscription - GreenTech Industries',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'error',
          description: 'Erreur ML Service - Timeout lors de l\'entraînement',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'error'
        },
        {
          id: '5',
          type: 'calculation',
          description: 'Calcul d\'empreinte carbone - Manufacturing Plus',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          user: 'pierre.bernard@manufacturing.fr',
          status: 'success'
        }
      ]

      setSystemHealth(mockHealth)
      setMetrics(mockMetrics)
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'calculation':
        return <ChartBarIcon className="w-4 h-4" />
      case 'report':
        return <DocumentTextIcon className="w-4 h-4" />
      case 'user_signup':
        return <UsersIcon className="w-4 h-4" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `Il y a ${days}j`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panneau d'administration...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Panneau d'Administration
                </h1>
                <p className="text-gray-600 mt-1">
                  Surveillance et gestion du système CarbonScore
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchSystemData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'users', label: 'Utilisateurs', icon: UsersIcon },
              { id: 'system', label: 'Système', icon: ServerIcon },
              { id: 'data', label: 'Données', icon: CircleStackIcon }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metrics?.total_users.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Utilisateurs totaux</div>
                <div className="text-xs text-green-600 mt-1">+12% ce mois</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metrics?.total_companies.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Entreprises</div>
                <div className="text-xs text-green-600 mt-1">+8% ce mois</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metrics?.total_calculations.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Calculs effectués</div>
                <div className="text-xs text-green-600 mt-1">+25% ce mois</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metrics?.total_reports.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Rapports générés</div>
                <div className="text-xs text-green-600 mt-1">+18% ce mois</div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Health */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <ServerIcon className="w-5 h-5 text-blue-600" />
                  État des Services
                </h2>
                
                <div className="space-y-4">
                  {systemHealth.map((service, index) => (
                    <div key={service.service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                          {service.status}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{service.service}</div>
                          {service.details && (
                            <div className="text-xs text-gray-500">{service.details}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>{service.response_time}ms</div>
                        <div className="text-xs">{service.uptime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  Activité Récente
                </h2>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {activity.description}
                        </div>
                        {activity.user && (
                          <div className="text-xs text-gray-500">{activity.user}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-purple-600" />
                Métriques de Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900 mb-2">
                    {metrics?.active_sessions}
                  </div>
                  <div className="text-sm text-blue-700">Sessions actives</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900 mb-2">
                    {metrics?.api_calls_today.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Appels API aujourd'hui</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900 mb-2">
                    {metrics?.storage_used}GB / {metrics?.storage_total}GB
                  </div>
                  <div className="text-sm text-orange-700">Stockage utilisé</div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(metrics?.storage_used || 0) / (metrics?.storage_total || 100) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* System Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions Système</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
                  <div className="font-medium text-gray-900 mb-1">Redémarrer Services</div>
                  <div className="text-sm text-gray-600">Redémarrage sécurisé</div>
                </button>
                
                <button className="p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
                  <div className="font-medium text-gray-900 mb-1">Backup Base</div>
                  <div className="text-sm text-gray-600">Sauvegarde manuelle</div>
                </button>
                
                <button className="p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
                  <div className="font-medium text-gray-900 mb-1">Réentraîner ML</div>
                  <div className="text-sm text-gray-600">Mise à jour modèles</div>
                </button>
                
                <button className="p-4 border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left">
                  <div className="font-medium text-gray-900 mb-1">Nettoyer Cache</div>
                  <div className="text-sm text-gray-600">Vider les caches</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestion des Utilisateurs
            </h3>
            <p className="text-gray-600 mb-6">
              Interface de gestion des utilisateurs et entreprises
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Voir tous les utilisateurs
            </button>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CircleStackIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestion des Données
            </h3>
            <p className="text-gray-600 mb-6">
              Facteurs ADEME, benchmarks sectoriels, et données de référence
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Gérer les données
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
