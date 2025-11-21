'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  
  // Pages that should not show navigation
  const noNavPages = ['/']
  
  const showNavigation = !noNavPages.includes(pathname)

  if (!showNavigation) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
