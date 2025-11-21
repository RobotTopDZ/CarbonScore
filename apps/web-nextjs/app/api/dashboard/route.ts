import { NextRequest, NextResponse } from 'next/server'

const CALCULATION_SERVICE_URL = process.env.CALCULATION_SERVICE_URL || 'http://localhost:8001'
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8010'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    
    // Fetch latest calculation results - try both endpoints
    let latestCalculation = null
    
    try {
      // Try to get latest calculation
      const calcResponse = await fetch(`${CALCULATION_SERVICE_URL}/api/v1/calculations?limit=1`)
      
      if (calcResponse.ok) {
        const calcData = await calcResponse.json()
        if (calcData.calculations && calcData.calculations.length > 0) {
          latestCalculation = calcData.calculations[0]
        }
      }
    } catch (error) {
      console.error('Error fetching calculations:', error)
    }
    
    // Also try getting from local storage / session if available
    // Check for calculation ID in URL params or session
    const calculationId = searchParams.get('calculationId')
    if (calculationId && !latestCalculation) {
      try {
        const calcResponse = await fetch(`${CALCULATION_SERVICE_URL}/api/v1/calculation/${calculationId}`)
        if (calcResponse.ok) {
          latestCalculation = await calcResponse.json()
        }
      } catch (error) {
        console.error('Error fetching specific calculation:', error)
      }
    }
    
    // Fetch ML insights
    let mlInsights = null
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/v1/ml/insights?userId=${userId}`)
      if (mlResponse.ok) {
        mlInsights = await mlResponse.json()
      }
    } catch (error) {
      console.error('ML service unavailable:', error)
    }
    
    // Aggregate dashboard data
    const dashboardData = {
      emissions: latestCalculation ? {
        total: (latestCalculation.total_co2e || 0) / 1000, // Convert to tons
        scope1: (latestCalculation.scope_1 || 0) / 1000,
        scope2: (latestCalculation.scope_2 || 0) / 1000,
        scope3: (latestCalculation.scope_3 || 0) / 1000,
        parEmploye: (latestCalculation.intensity_per_employee || 0) / 1000,
        parChiffreAffaires: latestCalculation.intensity_per_revenue || 0
      } : null,
      trends: [],
      benchmark: latestCalculation ? {
        secteur: latestCalculation.company_sector || latestCalculation.company_name || 'Services',
        mediane: 0,
        percentile: 50,
        position: latestCalculation.benchmark_position?.includes('excellent') ? 'excellent' :
                 latestCalculation.benchmark_position?.includes('bon') ? 'bon' :
                 latestCalculation.benchmark_position?.includes('moyen') ? 'moyen' : 'ameliorer'
      } : null,
      recommandations: latestCalculation?.recommendations ? (
        Array.isArray(latestCalculation.recommendations) 
          ? latestCalculation.recommendations.map((rec: string, idx: number) => ({
              id: `rec-${idx}`,
              titre: rec,
              description: rec,
              impactCO2: 0,
              cout: 0,
              roi: 0,
              faisabilite: 0,
              priorite: idx + 1
            }))
          : []
      ) : [],
      insights: Array.isArray(mlInsights) ? mlInsights : (mlInsights?.recommendations || []).map((rec: any) => ({
        type: 'info' as const,
        titre: rec.title || rec.titre || 'Recommandation',
        description: rec.description || rec.desc || '',
        valeur: rec.reduction_potential || 0
      })),
      lastUpdate: latestCalculation?.calculated_at || new Date().toISOString()
    }
    
    // If we have emissions data, return it
    if (dashboardData.emissions && dashboardData.emissions.total > 0) {
      return NextResponse.json(dashboardData)
    }
    
    // Otherwise throw to use fallback
    throw new Error('No calculation data available')
    
  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // Return mock data as fallback (already in tons)
    return NextResponse.json({
      emissions: {
        total: 35.42,
        scope1: 8.75,
        scope2: 14.25,
        scope3: 12.42,
        parEmploye: 1.18,
        parChiffreAffaires: 14.2
      },
      trends: [
        { month: 'Jan', value: 32000 },
        { month: 'Fév', value: 33500 },
        { month: 'Mar', value: 35420 }
      ],
      benchmark: {
        secteur: 'Services',
        mediane: 42000,
        percentile: 65,
        position: 'bon'
      },
      recommandations: [
        {
          id: 'rec-1',
          titre: 'Optimiser la consommation électrique',
          description: 'Optimiser la consommation électrique',
          impactCO2: 4.5,
          cout: 25000,
          roi: 0.75,
          faisabilite: 0.8,
          priorite: 1
        }
      ],
      insights: [
        {
          type: 'info' as const,
          titre: 'Optimiser la consommation électrique',
          description: 'Potentiel de réduction: 4.5 tCO2e',
          valeur: 4500
        }
      ],
      lastUpdate: new Date().toISOString()
    })
  }
}
