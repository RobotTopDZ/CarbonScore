'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimpleNav from '../../components/layout/SimpleNav'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  typing?: boolean
  sources?: string[]
}

interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: string
  category: 'analysis' | 'recommendations' | 'compliance' | 'general'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'explain_scope3',
      label: 'Expliquer le Scope 3',
      prompt: 'Peux-tu m\'expliquer ce qu\'est le Scope 3 et pourquoi c\'est important pour mon entreprise ?',
      icon: '📊',
      category: 'analysis'
    },
    {
      id: 'reduce_emissions',
      label: 'Réduire mes émissions',
      prompt: 'Quelles sont les meilleures actions pour réduire rapidement l\'empreinte carbone de mon entreprise ?',
      icon: '🌱',
      category: 'recommendations'
    },
    {
      id: 'csrd_compliance',
      label: 'Conformité CSRD',
      prompt: 'Comment me préparer à la directive CSRD ? Quelles sont les obligations ?',
      icon: '📋',
      category: 'compliance'
    },
    {
      id: 'benchmark_sector',
      label: 'Benchmark sectoriel',
      prompt: 'Comment mon entreprise se compare-t-elle aux autres dans mon secteur ?',
      icon: '🏆',
      category: 'analysis'
    },
    {
      id: 'carbon_offset',
      label: 'Compensation carbone',
      prompt: 'Que penses-tu de la compensation carbone ? Est-ce une bonne stratégie ?',
      icon: '🌳',
      category: 'recommendations'
    },
    {
      id: 'green_energy',
      label: 'Énergie verte',
      prompt: 'Comment puis-je passer à l\'énergie renouvelable dans mon entreprise ?',
      icon: '⚡',
      category: 'recommendations'
    }
  ]

  useEffect(() => {
    // Initialize conversation with welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Bonjour ! Je suis votre assistant IA spécialisé en empreinte carbone. 🌱

Je peux vous aider avec :
• **Analyse de vos émissions** et explications techniques
• **Recommandations personnalisées** pour réduire votre impact
• **Conformité réglementaire** (CSRD, taxonomie européenne, etc.)
• **Benchmarking sectoriel** et meilleures pratiques
• **Stratégies de décarbonation** adaptées à votre entreprise

Que souhaitez-vous savoir sur votre empreinte carbone ?`,
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
    setConversationId(`conv_${Date.now()}`)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      typing: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('http://localhost:8030/api/v1/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversation_id: conversationId,
          context: {
            user_type: 'business',
            language: 'fr'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erreur de communication avec l\'assistant')
      }

      const data = await response.json()

      // Remove typing indicator and add response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing')
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
          sources: data.relevant_docs
        }
        return [...withoutTyping, assistantMessage]
      })

    } catch (error) {
      console.error('Chat error:', error)
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing')
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?',
          role: 'assistant',
          timestamp: new Date()
        }
        return [...withoutTyping, errorMessage]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    // Could add a toast notification here
  }

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.lang = 'fr-FR'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      analysis: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      recommendations: 'bg-green-100 text-green-700 hover:bg-green-200',
      compliance: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      general: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Assistant IA Carbone
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Expert en empreinte carbone et durabilité
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.typing ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2">Assistant réfléchit...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    
                    {/* Message metadata */}
                    <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {message.role === 'assistant' && !message.typing && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="hover:text-gray-700 transition-colors"
                          title="Copier"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>Sources: {message.sources.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="border-t border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Questions fréquentes :</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${getCategoryColor(action.category)}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question sur l'empreinte carbone..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                
                {/* Voice Input Button */}
                <button
                  onClick={startVoiceRecording}
                  disabled={isLoading || isListening}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                    isListening 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={isListening ? 'Enregistrement en cours...' : 'Enregistrement vocal'}
                >
                  {isListening ? (
                    <StopIcon className="w-5 h-5" />
                  ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Appuyez sur Entrée pour envoyer</span>
                {isListening && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span>Écoute en cours...</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                <span>Alimenté par l'IA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Informations importantes :</p>
              <p>
                Cet assistant IA fournit des informations générales sur l'empreinte carbone. 
                Pour des conseils spécifiques à votre situation, consultez un expert en durabilité. 
                Les recommandations sont basées sur les meilleures pratiques et les données ADEME.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
