'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
}

const navigation: NavigationItem[] = [
  {
    name: 'Accueil',
    href: '/',
    icon: HomeIcon,
    description: 'Page d\'accueil et présentation'
  },
  {
    name: 'Questionnaire',
    href: '/questionnaire',
    icon: ClipboardDocumentListIcon,
    description: 'Calculer votre empreinte carbone'
  },
  {
    name: 'Tableau de Bord',
    href: '/dashboard',
    icon: ChartBarIcon,
    description: 'Suivi et analyse des données'
  },
  {
    name: 'Centre d\'Actions',
    href: '/actions',
    icon: LightBulbIcon,
    description: 'Recommandations personnalisées',
    badge: 'IA'
  },
  {
    name: 'Rapports',
    href: '/reports',
    icon: DocumentTextIcon,
    description: 'Bibliothèque de rapports PDF'
  },
  {
    name: 'Assistant IA',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    description: 'Chat avec l\'expert carbone',
    badge: 'Nouveau'
  },
  {
    name: 'Administration',
    href: '/admin',
    icon: Cog6ToothIcon,
    description: 'Panneau d\'administration'
  },
  {
    name: 'Documentation',
    href: '/docs',
    icon: DocumentTextIcon,
    description: 'API et guides développeur'
  }
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.nav
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%'
        }}
        transition={{ type: 'tween', duration: 0.3 }}
        className={`
          fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 shadow-xl z-50
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CarbonScore</h1>
                <p className="text-sm text-gray-600">Plateforme Carbone IA</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="px-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 transition-colors
                        ${active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}
                      `}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className={`
                            ml-2 px-2 py-0.5 text-xs font-medium rounded-full
                            ${active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Version 1.0</p>
                  <p className="text-xs text-gray-600">ADEME Certifié</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0" />
    </>
  )
}
