import toast from 'react-hot-toast'

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  ML_ERROR = 'ML_ERROR',
  PDF_ERROR = 'PDF_ERROR',
  LLM_ERROR = 'LLM_ERROR'
}

export interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: Date
  context?: {
    component?: string
    action?: string
    userId?: string
    sessionId?: string
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle HTTP response errors
   */
  handleHttpError(response: Response, context?: any): AppError {
    let errorType: ErrorType
    let message: string

    switch (response.status) {
      case 400:
        errorType = ErrorType.VALIDATION
        message = 'Données invalides. Veuillez vérifier votre saisie.'
        break
      case 401:
        errorType = ErrorType.AUTHENTICATION
        message = 'Authentification requise. Veuillez vous connecter.'
        break
      case 403:
        errorType = ErrorType.AUTHORIZATION
        message = 'Accès non autorisé. Permissions insuffisantes.'
        break
      case 404:
        errorType = ErrorType.NOT_FOUND
        message = 'Ressource introuvable.'
        break
      case 429:
        errorType = ErrorType.RATE_LIMIT
        message = 'Trop de requêtes. Veuillez patienter avant de réessayer.'
        break
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.SERVER_ERROR
        message = 'Erreur serveur temporaire. Veuillez réessayer dans quelques instants.'
        break
      default:
        errorType = ErrorType.NETWORK
        message = 'Erreur de connexion. Vérifiez votre connexion internet.'
    }

    const error: AppError = {
      type: errorType,
      message,
      code: response.status.toString(),
      timestamp: new Date(),
      context
    }

    this.logError(error)
    this.showUserNotification(error)
    
    return error
  }

  /**
   * Handle calculation service errors
   */
  handleCalculationError(error: any, context?: any): AppError {
    const appError: AppError = {
      type: ErrorType.CALCULATION_ERROR,
      message: 'Erreur lors du calcul d\'empreinte carbone. Vérifiez vos données.',
      details: error,
      timestamp: new Date(),
      context: { ...context, component: 'CalculationService' }
    }

    this.logError(appError)
    this.showUserNotification(appError)
    
    return appError
  }

  /**
   * Handle ML service errors
   */
  handleMLError(error: any, context?: any): AppError {
    const appError: AppError = {
      type: ErrorType.ML_ERROR,
      message: 'Erreur du service d\'intelligence artificielle. Fonctionnalités limitées.',
      details: error,
      timestamp: new Date(),
      context: { ...context, component: 'MLService' }
    }

    this.logError(appError)
    this.showUserNotification(appError)
    
    return appError
  }

  /**
   * Handle PDF generation errors
   */
  handlePDFError(error: any, context?: any): AppError {
    const appError: AppError = {
      type: ErrorType.PDF_ERROR,
      message: 'Erreur lors de la génération du rapport PDF. Veuillez réessayer.',
      details: error,
      timestamp: new Date(),
      context: { ...context, component: 'PDFService' }
    }

    this.logError(appError)
    this.showUserNotification(appError)
    
    return appError
  }

  /**
   * Handle LLM service errors
   */
  handleLLMError(error: any, context?: any): AppError {
    const appError: AppError = {
      type: ErrorType.LLM_ERROR,
      message: 'Assistant IA temporairement indisponible. Veuillez réessayer.',
      details: error,
      timestamp: new Date(),
      context: { ...context, component: 'LLMService' }
    }

    this.logError(appError)
    this.showUserNotification(appError)
    
    return appError
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, message: string, context?: any): AppError {
    const appError: AppError = {
      type: ErrorType.VALIDATION,
      message: `${field}: ${message}`,
      timestamp: new Date(),
      context: { ...context, field }
    }

    this.logError(appError)
    
    return appError
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any, context?: any): AppError {
    const appError: AppError = {
      type: ErrorType.NETWORK,
      message: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
      details: error,
      timestamp: new Date(),
      context
    }

    this.logError(appError)
    this.showUserNotification(appError)
    
    return appError
  }

  /**
   * Log error for monitoring and debugging
   */
  private logError(error: AppError): void {
    // Add to local log
    this.errorLog.push(error)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.error('AppError:', error)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error)
    }
  }

  /**
   * Show user-friendly notification
   */
  private showUserNotification(error: AppError): void {
    const options = {
      duration: this.getNotificationDuration(error.type),
      icon: this.getNotificationIcon(error.type)
    }

    switch (error.type) {
      case ErrorType.VALIDATION:
        toast.error(error.message, options)
        break
      case ErrorType.NETWORK:
      case ErrorType.SERVER_ERROR:
        toast.error(error.message, {
          ...options,
          action: {
            label: 'Réessayer',
            onClick: () => window.location.reload()
          }
        })
        break
      case ErrorType.RATE_LIMIT:
        toast.error(error.message, { ...options, duration: 8000 })
        break
      default:
        toast.error(error.message, options)
    }
  }

  /**
   * Get notification duration based on error type
   */
  private getNotificationDuration(type: ErrorType): number {
    switch (type) {
      case ErrorType.VALIDATION:
        return 4000
      case ErrorType.NETWORK:
      case ErrorType.SERVER_ERROR:
        return 6000
      case ErrorType.RATE_LIMIT:
        return 8000
      default:
        return 5000
    }
  }

  /**
   * Get notification icon based on error type
   */
  private getNotificationIcon(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return '⚠️'
      case ErrorType.NETWORK:
        return '🌐'
      case ErrorType.SERVER_ERROR:
        return '🔧'
      case ErrorType.RATE_LIMIT:
        return '⏱️'
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return '🔒'
      default:
        return '❌'
    }
  }

  /**
   * Send error to monitoring service
   */
  private async sendToMonitoring(error: AppError): Promise<void> {
    try {
      // In production, send to monitoring service like Sentry
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // })
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError)
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number
    byType: Record<ErrorType, number>
    recent: AppError[]
  } {
    const byType = {} as Record<ErrorType, number>
    
    // Initialize counts
    Object.values(ErrorType).forEach(type => {
      byType[type] = 0
    })

    // Count errors by type
    this.errorLog.forEach(error => {
      byType[error.type]++
    })

    return {
      total: this.errorLog.length,
      byType,
      recent: this.errorLog.slice(-10) // Last 10 errors
    }
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Check if service is healthy based on recent errors
   */
  isServiceHealthy(service: string, timeWindowMinutes: number = 5): boolean {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
    const recentErrors = this.errorLog.filter(
      error => error.timestamp > cutoff && 
      error.context?.component?.toLowerCase().includes(service.toLowerCase())
    )

    // Consider unhealthy if more than 5 errors in the time window
    return recentErrors.length <= 5
  }
}

/**
 * Utility functions for common error handling patterns
 */
export const errorHandler = ErrorHandler.getInstance()

/**
 * Wrapper for API calls with automatic error handling
 */
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  context?: any
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      errorHandler.handleHttpError(response, { ...context, url })
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorHandler.handleNetworkError(error, { ...context, url })
    }
    throw error
  }
}

/**
 * Wrapper for async operations with error boundary
 */
export async function withErrorBoundary<T>(
  operation: () => Promise<T>,
  context?: any
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    errorHandler.handleNetworkError(error, context)
    return null
  }
}

/**
 * Validation helper
 */
export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw errorHandler.handleValidationError(fieldName, 'Ce champ est requis')
  }
}

/**
 * Number validation helper
 */
export function validateNumber(value: any, fieldName: string, min?: number, max?: number): void {
  const num = Number(value)
  
  if (isNaN(num)) {
    throw errorHandler.handleValidationError(fieldName, 'Doit être un nombre valide')
  }
  
  if (min !== undefined && num < min) {
    throw errorHandler.handleValidationError(fieldName, `Doit être supérieur ou égal à ${min}`)
  }
  
  if (max !== undefined && num > max) {
    throw errorHandler.handleValidationError(fieldName, `Doit être inférieur ou égal à ${max}`)
  }
}
