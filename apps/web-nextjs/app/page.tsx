'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChartBarIcon, CpuChipIcon, DocumentTextIcon, ShieldCheckIcon, GlobeAltIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  const features = [
    {
      icon: ChartBarIcon,
      title: "Calculs ADEME Certifiés",
      description: "Facteurs d'émission officiels Base Carbone v17 pour des résultats précis et conformes aux standards internationaux",
      stats: "17,000+ facteurs d'émission"
    },
    {
      icon: CpuChipIcon,
      title: "Intelligence Artificielle Avancée",
      description: "Détection d'anomalies, imputation intelligente et recommandations personnalisées basées sur l'apprentissage automatique",
      stats: "95% de précision"
    },
    {
      icon: DocumentTextIcon,
      title: "Rapports Professionnels",
      description: "Rapports PDF détaillés générés par IA avec graphiques interactifs, analyses sectorielles et plans d'action personnalisés",
      stats: "Format ISO 14064"
    },
    {
      icon: ShieldCheckIcon,
      title: "Conformité Réglementaire",
      description: "Respect des normes CSRD, GHG Protocol et préparation aux obligations de reporting carbone européennes",
      stats: "100% conforme"
    },
    {
      icon: GlobeAltIcon,
      title: "Benchmark Sectoriel",
      description: "Comparaison avec les moyennes sectorielles et identification des opportunités d'amélioration par rapport aux leaders",
      stats: "50+ secteurs"
    },
    {
      icon: ArrowTrendingUpIcon,
      title: "Suivi Temporel",
      description: "Évolution des émissions dans le temps, définition d'objectifs et suivi des progrès vers la neutralité carbone",
      stats: "Trajectoire 1.5°C"
    }
  ]

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CarbonScore</h1>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Pro</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/questionnaire" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Calculateur
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Tableau de bord
              </Link>
              <Link href="/rapports" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Rapports
              </Link>
              <Link href="/benchmark" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Benchmark
              </Link>
              <Link href="/questionnaire" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Commencer
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                  Certifié ADEME • Conforme CSRD
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight" style={{fontSize: '4rem', fontWeight: 'bold', color: '#111827'}}>
                Maîtrisez votre
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent" style={{background: 'linear-gradient(to right, #059669, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}> empreinte carbone</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Plateforme de calcul d'empreinte carbone de niveau entreprise pour les PME. 
                Calculs certifiés ADEME, intelligence artificielle intégrée et rapports conformes aux standards internationaux.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/questionnaire"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Démarrer l'évaluation gratuite
                </Link>
                <Link
                  href="/demo"
                  className="bg-white hover:bg-gray-50 text-gray-900 text-lg px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
                  style={{
                    backgroundColor: 'white',
                    color: '#111827',
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Voir la démonstration
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">17,000+</div>
                  <div className="text-gray-600">Facteurs d'émission ADEME</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
                  <div className="text-gray-600">Précision des calculs IA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">ISO 14064</div>
                  <div className="text-gray-600">Conformité internationale</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Une plateforme complète pour votre transition carbone
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tous les outils nécessaires pour mesurer, analyser et réduire votre empreinte carbone dans une seule plateforme professionnelle.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-green-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 rounded-xl p-3 mr-4">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <span className="text-sm text-green-600 font-medium">{feature.stats}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Prêt à mesurer votre impact environnemental ?
              </h2>
              <p className="text-xl text-green-100 mb-8">
                Rejoignez les entreprises qui font confiance à CarbonScore pour leur transition carbone.
              </p>
              <Link
                href="/questionnaire"
                className="bg-white hover:bg-gray-100 text-green-600 text-lg px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Commencer maintenant
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
