'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import SimpleNav from '../../components/layout/SimpleNav'
import { 
  DocumentTextIcon,
  CodeBracketIcon,
  ServerIcon,
  CpuChipIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  example_request?: string
  example_response?: string
}

interface APIService {
  name: string
  description: string
  base_url: string
  icon: React.ComponentType<{ className?: string }>
  endpoints: APIEndpoint[]
}

export default function DocsPage() {
  const [activeService, setActiveService] = useState('calculation')
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null)

  const services: APIService[] = [
    {
      name: 'Calculation Service',
      description: 'Service de calcul d\'empreinte carbone utilisant les facteurs ADEME',
      base_url: 'http://localhost:8001',
      icon: ServerIcon,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/calculate',
          description: 'Calculer l\'empreinte carbone d\'une entreprise',
          parameters: [
            {
              name: 'entreprise',
              type: 'object',
              required: true,
              description: 'Informations de l\'entreprise (nom, secteur, effectif, etc.)'
            },
            {
              name: 'energie',
              type: 'object',
              required: true,
              description: 'Consommations énergétiques (électricité, gaz, carburants)'
            },
            {
              name: 'transport',
              type: 'object',
              required: true,
              description: 'Données de transport (véhicules, vols)'
            },
            {
              name: 'achats',
              type: 'object',
              required: true,
              description: 'Données d\'achats et approvisionnement'
            }
          ],
          example_request: `{
  "entreprise": {
    "nom": "TechCorp Solutions",
    "secteur": "services",
    "effectif": "10-49",
    "chiffre_affaires": 2500000,
    "localisation": "France"
  },
  "energie": {
    "electricite_kwh": 25000,
    "gaz_kwh": 15000,
    "carburants_litres": 2000
  },
  "transport": {
    "vehicules_km_annuel": 15000,
    "vols_domestiques_km": 5000,
    "vols_internationaux_km": 8000
  },
  "achats": {
    "montant_achats_annuel": 800000,
    "pourcentage_local": 60
  }
}`,
          example_response: `{
  "calculation_id": "calc_123456",
  "status": "completed",
  "total_co2e": 35420.5,
  "scope_1": 8750.2,
  "scope_2": 14250.8,
  "scope_3": 12419.5,
  "breakdown": {
    "electricite": 14250.8,
    "gaz": 6420.3,
    "carburants": 2329.9,
    "vehicules": 4850.7,
    "vols_domestiques": 2180.4,
    "vols_internationaux": 3508.2,
    "achats": 1880.2
  },
  "carbon_efficiency_score": 72.5,
  "sustainability_grade": "B",
  "calculated_at": "2024-11-13T15:30:00Z"
}`
        },
        {
          method: 'GET',
          path: '/api/v1/calculation/{id}',
          description: 'Récupérer les résultats d\'un calcul existant',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'Identifiant unique du calcul'
            }
          ]
        }
      ]
    },
    {
      name: 'ML Service',
      description: 'Service d\'apprentissage automatique pour l\'analyse avancée',
      base_url: 'http://localhost:8010',
      icon: CpuChipIcon,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/ml/anomaly',
          description: 'Détecter les anomalies dans les données d\'entrée',
          example_request: `{
  "sector": "services",
  "employees": "10-49",
  "electricite_kwh": 25000,
  "gaz_kwh": 15000,
  "carburants_litres": 2000,
  "vehicules_km_annuel": 15000,
  "vols_domestiques_km": 5000,
  "vols_internationaux_km": 8000,
  "montant_achats_annuel": 800000,
  "pourcentage_local": 60
}`,
          example_response: `{
  "is_anomaly": false,
  "anomaly_score": 0.15,
  "anomalous_fields": [],
  "confidence": 0.87
}`
        },
        {
          method: 'POST',
          path: '/api/v1/ml/actions',
          description: 'Obtenir des recommandations d\'actions classées par ML',
          example_response: `[
  {
    "action_id": "renewable_energy",
    "title": "Transition vers l'énergie renouvelable",
    "description": "Installation de panneaux solaires...",
    "impact_co2e": 15420,
    "cost_estimate": "Moyen",
    "feasibility_score": 0.8,
    "roi_score": 0.75,
    "priority_rank": 1
  }
]`
        }
      ]
    },
    {
      name: 'PDF Service',
      description: 'Service de génération de rapports PDF professionnels',
      base_url: 'http://localhost:8020',
      icon: DocumentArrowDownIcon,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/pdf/generate',
          description: 'Générer un rapport PDF personnalisé',
          example_request: `{
  "company_info": {
    "name": "TechCorp Solutions",
    "sector": "services",
    "employees": "10-49"
  },
  "emission_data": {
    "total_co2e": 35420.5,
    "scope_1": 8750.2,
    "scope_2": 14250.8,
    "scope_3": 12419.5,
    "carbon_efficiency_score": 72.5,
    "sustainability_grade": "B"
  },
  "template": "standard"
}`,
          example_response: `{
  "status": "success",
  "filename": "rapport_techcorp_20241113.pdf",
  "size_bytes": 2458624,
  "generated_at": "2024-11-13T15:30:00Z"
}`
        }
      ]
    },
    {
      name: 'LLM Service',
      description: 'Service d\'IA conversationnelle et d\'insights avancés',
      base_url: 'http://localhost:8030',
      icon: SparklesIcon,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/llm/chat',
          description: 'Interaction avec l\'assistant IA carbone',
          example_request: `{
  "message": "Comment réduire mes émissions de scope 3 ?",
  "conversation_id": "conv_123",
  "context": {
    "user_type": "business",
    "language": "fr"
  }
}`,
          example_response: `{
  "response": "Pour réduire vos émissions de Scope 3, voici les stratégies les plus efficaces...",
  "conversation_id": "conv_123",
  "relevant_docs": ["Stratégies de réduction", "Scope 3 Guide"],
  "timestamp": "2024-11-13T15:30:00Z"
}`
        },
        {
          method: 'POST',
          path: '/api/v1/llm/insights',
          description: 'Générer des insights stratégiques personnalisés',
          example_response: `{
  "insights": [
    {
      "type": "opportunity",
      "title": "Potentiel d'amélioration énergétique",
      "description": "Votre consommation électrique...",
      "impact": "high",
      "actionable": true,
      "priority": 1
    }
  ]
}`
        }
      ]
    }
  ]

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const currentService = services.find(s => s.name.toLowerCase().includes(activeService))

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Documentation API
              </h1>
              <p className="text-gray-600 mt-1">
                Guide complet des APIs CarbonScore pour les développeurs
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Services API</h2>
              
              <nav className="space-y-2">
                {services.map((service) => {
                  const Icon = service.icon
                  const isActive = service.name.toLowerCase().includes(activeService)
                  
                  return (
                    <button
                      key={service.name}
                      onClick={() => setActiveService(service.name.toLowerCase().split(' ')[0])}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {service.endpoints.length} endpoint{service.endpoints.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Liens Rapides</h3>
                <div className="space-y-2 text-sm">
                  <a href="#authentication" className="text-indigo-600 hover:text-indigo-700 block">
                    Authentification
                  </a>
                  <a href="#rate-limits" className="text-indigo-600 hover:text-indigo-700 block">
                    Limites de taux
                  </a>
                  <a href="#errors" className="text-indigo-600 hover:text-indigo-700 block">
                    Codes d'erreur
                  </a>
                  <a href="#sdks" className="text-indigo-600 hover:text-indigo-700 block">
                    SDKs disponibles
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentService && (
              <motion.div
                key={activeService}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Service Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <currentService.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentService.name}</h2>
                      <p className="text-gray-600 mt-1">{currentService.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-500">Base URL:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {currentService.base_url}
                        </code>
                        <button className="text-indigo-600 hover:text-indigo-700">
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endpoints */}
                <div className="space-y-6">
                  {currentService.endpoints.map((endpoint, index) => (
                    <motion.div
                      key={`${endpoint.method}-${endpoint.path}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Endpoint Header */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm flex-1">
                            {endpoint.path}
                          </code>
                          <button
                            onClick={() => setActiveEndpoint(
                              activeEndpoint === `${endpoint.method}-${endpoint.path}` 
                                ? null 
                                : `${endpoint.method}-${endpoint.path}`
                            )}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            {activeEndpoint === `${endpoint.method}-${endpoint.path}` ? 'Masquer' : 'Détails'}
                          </button>
                        </div>

                        <p className="text-gray-700 mb-4">{endpoint.description}</p>

                        {/* Parameters */}
                        {endpoint.parameters && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Paramètres:</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param) => (
                                <div key={param.name} className="flex items-start gap-3 text-sm">
                                  <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                                    {param.name}
                                  </code>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    param.required 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {param.required ? 'Requis' : 'Optionnel'}
                                  </span>
                                  <span className="text-gray-600">{param.type}</span>
                                  <span className="text-gray-500 flex-1">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Examples */}
                        {activeEndpoint === `${endpoint.method}-${endpoint.path}` && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 pt-4 mt-4"
                          >
                            {endpoint.example_request && (
                              <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Exemple de requête:</h4>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                  <code>{endpoint.example_request}</code>
                                </pre>
                              </div>
                            )}

                            {endpoint.example_response && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Exemple de réponse:</h4>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                  <code>{endpoint.example_response}</code>
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Additional Documentation Sections */}
            <div className="mt-12 space-y-8">
              {/* Authentication */}
              <div id="authentication" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentification</h2>
                <p className="text-gray-600 mb-4">
                  Les APIs CarbonScore utilisent l'authentification par clé API. Incluez votre clé dans l'en-tête de chaque requête.
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                  <code>{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</code>
                </pre>
              </div>

              {/* Rate Limits */}
              <div id="rate-limits" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Limites de Taux</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">100</div>
                    <div className="text-sm text-blue-700">requêtes/minute</div>
                    <div className="text-xs text-blue-600 mt-1">Plan Gratuit</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">1000</div>
                    <div className="text-sm text-green-700">requêtes/minute</div>
                    <div className="text-xs text-green-600 mt-1">Plan Pro</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">∞</div>
                    <div className="text-sm text-purple-700">requêtes/minute</div>
                    <div className="text-xs text-purple-600 mt-1">Plan Enterprise</div>
                  </div>
                </div>
              </div>

              {/* Error Codes */}
              <div id="errors" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Codes d'Erreur</h2>
                <div className="space-y-3">
                  {[
                    { code: '400', message: 'Bad Request - Paramètres invalides' },
                    { code: '401', message: 'Unauthorized - Clé API invalide' },
                    { code: '429', message: 'Too Many Requests - Limite de taux dépassée' },
                    { code: '500', message: 'Internal Server Error - Erreur serveur' }
                  ].map((error) => (
                    <div key={error.code} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-mono text-sm">
                        {error.code}
                      </span>
                      <span className="text-gray-700">{error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
