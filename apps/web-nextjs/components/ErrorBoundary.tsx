'use client'

import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'
import { errorHandler, ErrorType } from '../lib/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to our error handler
    errorHandler.handleNetworkError(error, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack,
      action: 'componentDidCatch'
    })

    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oups ! Une erreur s'est produite
          </h1>
          
          <p className="text-gray-600 mb-8">
            Nous sommes désolés, mais quelque chose s'est mal passé. 
            Notre équipe a été automatiquement notifiée.
          </p>

          {/* Development Error Details */}
          {isDevelopment && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">Détails de l'erreur (développement):</h3>
              <pre className="text-xs text-red-700 overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retry}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Réessayer
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              Retour à l'accueil
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Si le problème persiste, contactez notre support à{' '}
              <a href="mailto:support@carbonscore.com" className="text-blue-600 hover:text-blue-700">
                support@carbonscore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific error fallbacks for different contexts
export function CalculationErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Erreur de Calcul
      </h3>
      <p className="text-red-700 mb-4">
        Impossible de calculer l'empreinte carbone. Vérifiez vos données et réessayez.
      </p>
      <button
        onClick={retry}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Réessayer le calcul
      </button>
    </div>
  )
}

export function ChatErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
        Assistant IA Indisponible
      </h3>
      <p className="text-yellow-700 mb-4">
        L'assistant IA rencontre des difficultés. Veuillez réessayer dans quelques instants.
      </p>
      <button
        onClick={retry}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Relancer l'assistant
      </button>
    </div>
  )
}

export function ReportErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
      <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-orange-900 mb-2">
        Erreur de Génération de Rapport
      </h3>
      <p className="text-orange-700 mb-4">
        Impossible de générer le rapport PDF. Le service sera bientôt rétabli.
      </p>
      <button
        onClick={retry}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Régénérer le rapport
      </button>
    </div>
  )
}

// Hook for using error boundary in functional components
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: any) => {
      errorHandler.handleNetworkError(error, context)
    },
    handleCalculationError: (error: Error, context?: any) => {
      errorHandler.handleCalculationError(error, context)
    },
    handleMLError: (error: Error, context?: any) => {
      errorHandler.handleMLError(error, context)
    },
    handlePDFError: (error: Error, context?: any) => {
      errorHandler.handlePDFError(error, context)
    },
    handleLLMError: (error: Error, context?: any) => {
      errorHandler.handleLLMError(error, context)
    }
  }
}
