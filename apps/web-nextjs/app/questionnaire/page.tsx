'use client'

import { motion } from 'framer-motion'
import { AIQuestionnaireForm } from '../../components/questionnaire/AIQuestionnaireForm'
import { SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import SimpleNav from '../../components/layout/SimpleNav'

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Calculateur d'Empreinte Carbone
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Assisté par Intelligence Artificielle • Données ADEME certifiées
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Questionnaire simplifié avec IA
            </h2>
            <p className="text-gray-600">
              Notre assistant IA vous aide à compléter automatiquement les données manquantes 
              en se basant sur votre secteur d'activité et les moyennes ADEME.
            </p>
          </div>

          <AIQuestionnaireForm />
        </motion.div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">IA Intégrée</h3>
            </div>
            <p className="text-sm text-gray-600">
              Complétion automatique basée sur votre secteur et les données ADEME
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Données ADEME</h3>
            </div>
            <p className="text-sm text-gray-600">
              Facteurs d'émission officiels Base Carbone v17 pour des résultats précis
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Rapide & Précis</h3>
            </div>
            <p className="text-sm text-gray-600">
              Questionnaire simplifié de 4 étapes pour un calcul complet
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
