'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SimpleNav from '../../components/layout/SimpleNav'
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Report {
  id: string
  title: string
  type: 'comprehensive' | 'executive' | 'technical' | 'regulatory'
  company_name: string
  generated_at: string
  filename: string
  file_size?: number
  status?: 'ready' | 'generating' | 'error'
  download_count?: number
  shared?: boolean
  calculation_id?: string
  total_co2e?: number
  grade?: string
  download_url?: string
  template?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  preview_url: string
  customizable: boolean
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'library' | 'templates' | 'analytics'>('library')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [showGenerator, setShowGenerator] = useState(false)

  const reportTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'comprehensive', label: 'Rapport complet' },
    { value: 'executive', label: 'Résumé exécutif' },
    { value: 'technical', label: 'Analyse technique' },
    { value: 'regulatory', label: 'Conformité réglementaire' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Date de création' },
    { value: 'name', label: 'Nom' },
    { value: 'downloads', label: 'Téléchargements' },
    { value: 'size', label: 'Taille' }
  ]

  const normalizeReportType = (value?: string): Report['type'] => {
    const allowedTypes: Report['type'][] = ['comprehensive', 'executive', 'technical', 'regulatory']
    if (!value) return 'comprehensive'
    const normalized = String(value).toLowerCase() as Report['type']
    return allowedTypes.includes(normalized) ? normalized : 'comprehensive'
  }

  useEffect(() => {
    fetchReports()
    fetchTemplates()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports', { cache: 'no-store' })
      const data = await response.json()

      const normalizedReports: Report[] = (data.reports || []).map((report: any) => {
        const type = normalizeReportType(report.type || report.template)
        const companyName = report.company_name || 'Entreprise'
        const generatedAt = report.generated_at || new Date().toISOString()
        const filename = report.filename || `${report.id || 'rapport'}.pdf`
        return {
          id: report.id || filename.replace('.pdf', ''),
          title: report.title || `Rapport Empreinte Carbone - ${companyName}`,
          type,
          company_name: companyName,
          generated_at: generatedAt,
          filename,
          file_size: report.file_size ?? 0,
          status: report.status || 'ready',
          download_count: report.download_count ?? 0,
          shared: Boolean(report.shared),
          calculation_id: report.calculation_id,
          total_co2e: report.total_co2e ?? 0,
          grade: report.grade || 'N/A',
          download_url: report.download_url || `/api/reports/file/${encodeURIComponent(filename)}`,
          template: report.template || type
        }
      })

      setReports(normalizedReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const mockTemplates: ReportTemplate[] = [
        {
          id: 'template_standard',
          name: 'Rapport Standard',
          description: 'Rapport complet avec analyse détaillée et recommandations',
          type: 'comprehensive',
          preview_url: '/templates/standard-preview.png',
          customizable: true
        },
        {
          id: 'template_executive',
          name: 'Résumé Exécutif',
          description: 'Synthèse pour dirigeants avec KPIs essentiels',
          type: 'executive',
          preview_url: '/templates/executive-preview.png',
          customizable: true
        },
        {
          id: 'template_csrd',
          name: 'Conformité CSRD',
          description: 'Rapport conforme à la directive CSRD européenne',
          type: 'regulatory',
          preview_url: '/templates/csrd-preview.png',
          customizable: false
        }
      ]

      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleDownload = async (report: Report) => {
    if (!report.download_url) return

    try {
      const response = await fetch(report.download_url)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.filename || `${report.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setReports(prev => prev.map(item => 
        item.id === report.id 
          ? { ...item, download_count: (item.download_count ?? 0) + 1 }
          : item
      ))
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleView = (report: Report) => {
    if (!report.download_url) return
    window.open(report.download_url, '_blank', 'noopener,noreferrer')
  }

  const handleShare = (reportId: string) => {
    const shareUrl = `${window.location.origin}/reports/shared/${reportId}`
    navigator.clipboard.writeText(shareUrl)
    
    // Update shared status
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, shared: true }
        : report
    ))
    
    alert('Lien de partage copié dans le presse-papier!')
  }

  const generateNewReport = async (templateId: string, calculationId: string) => {
    try {
      // In production, call PDF service with template and calculation data
      const response = await fetch('http://localhost:8020/api/v1/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          calculation_id: calculationId,
          company_info: {
            name: 'Nouvelle Entreprise',
            sector: 'services'
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Add new report to list
        const newReport: Report = {
          id: result.filename.replace('.pdf', ''),
          title: 'Nouveau Rapport',
          type: 'comprehensive',
          company_name: 'Nouvelle Entreprise',
          generated_at: new Date().toISOString(),
          file_size: result.size_bytes,
          status: 'ready',
          download_count: 0,
          shared: false,
          calculation_id: calculationId,
          total_co2e: 35000,
          grade: 'B'
        }
        
        setReports(prev => [newReport, ...prev])
        setShowGenerator(false)
      }
    } catch (error) {
      console.error('Report generation error:', error)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    return matchesSearch && matchesType
  })

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
      case 'name':
        return a.title.localeCompare(b.title)
      case 'downloads':
        return (b.download_count ?? 0) - (a.download_count ?? 0)
      case 'size':
        return (b.file_size ?? 0) - (a.file_size ?? 0)
      default:
        return 0
    }
  })

  const formatFileSize = (bytes?: number) => {
    if (!bytes || Number.isNaN(bytes)) return '—'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return 'Date inconnue'
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    const typeMap = {
      comprehensive: 'Complet',
      executive: 'Exécutif',
      technical: 'Technique',
      regulatory: 'Réglementaire'
    }
    return typeMap[type as keyof typeof typeMap] || 'Personnalisé'
  }

  const getTypeColor = (type: string) => {
    const colorMap = {
      comprehensive: 'bg-blue-100 text-blue-800',
      executive: 'bg-purple-100 text-purple-800',
      technical: 'bg-green-100 text-green-800',
      regulatory: 'bg-orange-100 text-orange-800'
    }
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const getGradeColor = (grade: string) => {
    const colorMap = {
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    }
    return colorMap[grade as keyof typeof colorMap] || 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bibliothèque de Rapports
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez et partagez vos rapports d'empreinte carbone
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowGenerator(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nouveau rapport
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'library', label: 'Bibliothèque', icon: DocumentTextIcon },
              { id: 'templates', label: 'Modèles', icon: Cog6ToothIcon },
              { id: 'analytics', label: 'Analytiques', icon: ChartBarIcon }
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
        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un rapport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      Trier par {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-600">
                    {sortedReports.length} rapport{sortedReports.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{report.company_name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {getTypeLabel(report.type)}
                          </span>
                          <span className={`font-bold ${getGradeColor(report.grade)}`}>
                            Grade {report.grade}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {report.shared && (
                          <ShareIcon className="w-4 h-4 text-green-500" />
                        )}
                        {report.status === 'generating' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Émissions:</span>
                        <div className="font-semibold">
                          {report.total_co2e
                            ? `${(report.total_co2e / 1000).toFixed(1)}t CO₂e`
                            : '—'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Taille:</span>
                        <div className="font-semibold">{formatFileSize(report.file_size)}</div>
                      </div>
                    </div>

                    {/* Date and Downloads */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(report.generated_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDownTrayIcon className="w-3 h-3" />
                        {(report.download_count ?? 0)} téléchargement{(report.download_count ?? 0) > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== 'ready'}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Télécharger
                      </button>
                      
                      <button
                        onClick={() => handleShare(report.id)}
                        className="px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleView(report)}
                        className="px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {getTypeLabel(template.type)}
                    </span>
                    
                    <button
                      onClick={() => generateNewReport(template.id, 'calc_new')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Utiliser
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytiques des Rapports
            </h3>
            <p className="text-gray-600 mb-6">
              Suivez l'engagement et l'utilisation de vos rapports
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Voir les statistiques détaillées
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
