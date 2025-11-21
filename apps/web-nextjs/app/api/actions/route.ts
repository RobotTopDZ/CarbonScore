import { NextRequest, NextResponse } from 'next/server'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8010'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    const calculationId = searchParams.get('calculationId')
    
    // Fetch ML-ranked actions from ML service
    const response = await fetch(`${ML_SERVICE_URL}/api/v1/ml/actions?userId=${userId}&calculationId=${calculationId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch actions')
    }
    
    const actions = await response.json()
    return NextResponse.json(actions)
    
  } catch (error) {
    console.error('Actions API error:', error)
    
    // Return mock ML-ranked actions as fallback
    return NextResponse.json({
      actions: [
        {
          id: 'action_001',
          title: 'Transition vers l\'énergie renouvelable',
          description: 'Installation de panneaux solaires pour couvrir 60% des besoins électriques',
          category: 'energy',
          impact_co2e: 8550,
          impact_percentage: 24.1,
          cost_estimate: 'Élevé (50k-150k€)',
          roi_months: 48,
          feasibility_score: 0.75,
          roi_score: 0.75,
          priority_rank: 1,
          implementation_time: '6-12 mois',
          complexity: 'medium',
          sector_relevance: ['industrie', 'services', 'commerce'],
          tags: ['scope2', 'économies', 'image'],
          requirements: ['Audit énergétique', 'Étude de faisabilité', 'Financement'],
          benefits: ['Réduction factures', 'Indépendance énergétique', 'Image verte']
        },
        {
          id: 'action_002',
          title: 'Optimisation du parc véhicules',
          description: 'Remplacement progressif par des véhicules électriques',
          category: 'transport',
          impact_co2e: 4850,
          impact_percentage: 13.7,
          cost_estimate: 'Moyen (30k-80k€)',
          roi_months: 36,
          feasibility_score: 0.85,
          roi_score: 0.65,
          priority_rank: 2,
          implementation_time: '3-6 mois',
          complexity: 'medium',
          sector_relevance: ['transport', 'services', 'commerce'],
          tags: ['scope1', 'innovation', 'subventions'],
          requirements: ['Analyse du parc actuel', 'Bornes de recharge', 'Formation conducteurs'],
          benefits: ['Coûts carburant réduits', 'Maintenance simplifiée', 'Conformité ZFE']
        },
        {
          id: 'action_003',
          title: 'Amélioration de l\'isolation thermique',
          description: 'Isolation des bâtiments pour réduire les besoins en chauffage',
          category: 'energy',
          impact_co2e: 3200,
          impact_percentage: 9.0,
          cost_estimate: 'Moyen (20k-60k€)',
          roi_months: 60,
          feasibility_score: 0.90,
          roi_score: 0.85,
          priority_rank: 3,
          implementation_time: '2-4 mois',
          complexity: 'low',
          sector_relevance: ['industrie', 'services', 'commerce', 'construction'],
          tags: ['scope2', 'économies', 'facile'],
          requirements: ['Audit thermique', 'Devis travaux', 'Aides CEE'],
          benefits: ['Confort thermique', 'Économies chauffage', 'Valorisation patrimoine']
        },
        {
          id: 'action_004',
          title: 'Politique de télétravail structurée',
          description: 'Mise en place de 2 jours de télétravail par semaine',
          category: 'transport',
          impact_co2e: 2100,
          impact_percentage: 5.9,
          cost_estimate: 'Faible (<10k€)',
          roi_months: 12,
          feasibility_score: 0.95,
          roi_score: 0.9,
          priority_rank: 4,
          implementation_time: '1-2 mois',
          complexity: 'low',
          sector_relevance: ['services', 'technologie'],
          tags: ['scope3', 'productivité', 'wellbeing'],
          requirements: ['Charte télétravail', 'Équipement informatique', 'Outils collaboration'],
          benefits: ['Satisfaction employés', 'Productivité', 'Réduction déplacements']
        },
        {
          id: 'action_005',
          title: 'Approvisionnement local privilégié',
          description: 'Augmenter la part d\'achats locaux de 40% à 70%',
          category: 'procurement',
          impact_co2e: 1850,
          impact_percentage: 5.2,
          cost_estimate: 'Neutre',
          roi_months: 24,
          feasibility_score: 0.80,
          roi_score: 0.6,
          priority_rank: 5,
          implementation_time: '3-6 mois',
          complexity: 'medium',
          sector_relevance: ['commerce', 'restauration', 'industrie'],
          tags: ['scope3', 'local', 'supply-chain'],
          requirements: ['Cartographie fournisseurs', 'Négociations', 'Contrats'],
          benefits: ['Soutien économie locale', 'Résilience supply chain', 'Qualité produits']
        },
        {
          id: 'action_006',
          title: 'Éclairage LED intelligent',
          description: 'Remplacement de l\'éclairage par des LED avec détection de présence',
          category: 'energy',
          impact_co2e: 1420,
          impact_percentage: 4.0,
          cost_estimate: 'Faible (5k-15k€)',
          roi_months: 18,
          feasibility_score: 0.98,
          roi_score: 0.95,
          priority_rank: 6,
          implementation_time: '1 mois',
          complexity: 'low',
          sector_relevance: ['industrie', 'services', 'commerce'],
          tags: ['scope2', 'quick-win', 'facile'],
          requirements: ['Audit éclairage', 'Installation', 'Paramétrage'],
          benefits: ['Économies immédiates', 'Durée de vie longue', 'Confort visuel']
        }
      ],
      summary: {
        total_actions: 6,
        total_potential_reduction: 22970,
        total_potential_percentage: 64.9,
        quick_wins: 3,
        long_term_projects: 3
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { actionIds, calculationId } = body
    
    // Calculate scenario impact
    const response = await fetch(`${ML_SERVICE_URL}/api/v1/ml/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionIds, calculationId })
    })
    
    if (!response.ok) {
      throw new Error('Failed to calculate scenario')
    }
    
    const scenario = await response.json()
    return NextResponse.json(scenario)
    
  } catch (error) {
    console.error('Scenario calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate scenario' },
      { status: 500 }
    )
  }
}
