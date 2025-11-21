import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '../components/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata = {
  title: 'CarbonScore - Calculateur d\'Empreinte Carbone',
  description: 'Plateforme de calcul d\'empreinte carbone pour les PME utilisant les données ADEME',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
