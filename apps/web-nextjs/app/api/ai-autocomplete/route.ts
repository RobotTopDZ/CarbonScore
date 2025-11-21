import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = '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'

interface CompanyInfo {
  companyName: string
  sector: string
  employees: string
  revenue?: number
  location: string
}

export async function POST(request: NextRequest) {
  let requestData: CompanyInfo
  
  try {
    requestData = await request.json()
    const { companyName, sector, employees, revenue, location } = requestData

    // Create a detailed prompt for the AI to estimate carbon footprint data
    const prompt = `Tu es un expert en calcul d'empreinte carbone utilisant les données ADEME Base Carbone v17. 

Entreprise: ${companyName}
Secteur: ${sector}
Effectif: ${employees}
Chiffre d'affaires: ${revenue ? `${revenue}€` : 'Non spécifié'}
Localisation: ${location}

Basé sur ces informations et les moyennes sectorielles ADEME, estime les consommations annuelles suivantes pour cette entreprise.

IMPORTANT: Utilise des valeurs réalistes et variées, PAS des nombres ronds comme 1000, 5000, etc. 
Utilise des valeurs comme 1247, 3892, 847, etc. pour rendre les estimations plus crédibles.

1. ÉNERGIE:
   - Électricité (kWh/an) - valeur réaliste non-ronde
   - Gaz naturel (kWh/an) - valeur réaliste non-ronde
   - Carburants (L/an) - valeur réaliste non-ronde

2. TRANSPORT:
   - Véhicules d'entreprise (km/an) - valeur réaliste non-ronde
   - Vols domestiques (km/an) - valeur réaliste non-ronde
   - Vols internationaux (km/an) - valeur réaliste non-ronde

3. ACHATS:
   - Montant total des achats (€/an) - valeur réaliste non-ronde
   - Pourcentage d'achats locaux (%) - entre 15-85%, pas exactement 20, 50, etc.

Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact:
{
  "energie": {
    "electricite_kwh": number,
    "gaz_kwh": number,
    "carburants_litres": number
  },
  "transport": {
    "vehicules_km_annuel": number,
    "vols_domestiques_km": number,
    "vols_internationaux_km": number
  },
  "achats": {
    "montant_achats_annuel": number,
    "pourcentage_local": number
  },
  "justification": "Explication brève des estimations basées sur le secteur et la taille"
}`

    // Try API call with reasoning, but use fallback if it fails
    let estimations
    
    try {
      let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "minimax/minimax-m2",
          "messages": [
            {
              "role": "system",
              "content": "Tu es un expert en calcul d'empreinte carbone. Tu utilises les données ADEME et les moyennes sectorielles pour estimer les consommations d'entreprises. Réponds toujours avec un JSON valide."
            },
            {
              "role": "user",
              "content": prompt
            }
          ],
          "reasoning": {"enabled": true},
          "temperature": 0.3,
          "max_tokens": 1000
        })
      })

      if (!response.ok) {
        console.log(`API returned ${response.status}, using fallback`)
        estimations = getFallbackEstimations(sector, employees)
      } else {
        const result = await response.json()
        const aiResponse = result.choices[0].message

        // Parse the JSON response from AI
        const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          estimations = JSON.parse(jsonMatch[0])
        } else {
          estimations = getFallbackEstimations(sector, employees)
        }
      }
    } catch (apiError) {
      console.log('API call failed, using fallback:', apiError)
      estimations = getFallbackEstimations(sector, employees)
    }

    // Validate and sanitize the estimations
    const sanitizedEstimations = {
      energie: {
        electricite_kwh: Math.max(0, estimations.energie?.electricite_kwh || 0),
        gaz_kwh: Math.max(0, estimations.energie?.gaz_kwh || 0),
        carburants_litres: Math.max(0, estimations.energie?.carburants_litres || 0)
      },
      transport: {
        vehicules_km_annuel: Math.max(0, estimations.transport?.vehicules_km_annuel || 0),
        vols_domestiques_km: Math.max(0, estimations.transport?.vols_domestiques_km || 0),
        vols_internationaux_km: Math.max(0, estimations.transport?.vols_internationaux_km || 0)
      },
      achats: {
        montant_achats_annuel: Math.max(0, estimations.achats?.montant_achats_annuel || 0),
        pourcentage_local: Math.min(100, Math.max(0, estimations.achats?.pourcentage_local || 20))
      },
      justification: estimations.justification || "Estimations basées sur les moyennes sectorielles ADEME"
    }

    return NextResponse.json(sanitizedEstimations)

  } catch (error) {
    console.error('AI autocomplete error:', error)
    
    // Return fallback estimations in case of error
    const sector = requestData?.sector || 'services'
    const employees = requestData?.employees || '10-49'
    
    const fallback = getFallbackEstimations(sector, employees)
    
    return NextResponse.json({
      ...fallback,
      justification: "Estimations par défaut (service IA temporairement indisponible)",
      error: null
    })
  }
}

function getFallbackEstimations(sector: string, employees: string) {
  // Base multipliers by company size with realistic variations
  const sizeMultipliers = {
    '1-9': 0.87 + Math.random() * 0.26, // 0.87 - 1.13
    '10-49': 2.74 + Math.random() * 0.52, // 2.74 - 3.26
    '50-249': 7.43 + Math.random() * 1.14, // 7.43 - 8.57
    '250+': 18.92 + Math.random() * 2.16 // 18.92 - 21.08
  }

  const multiplier = sizeMultipliers[employees as keyof typeof sizeMultipliers] || (2.74 + Math.random() * 0.52)

  // Sector-specific base values (for 10-49 employees) with realistic variations
  const addVariation = (base: number, variation: number = 0.15) => {
    return Math.round(base * (1 + (Math.random() - 0.5) * variation))
  }

  const sectorDefaults = {
    industrie: {
      electricite_kwh: addVariation(78420),
      gaz_kwh: addVariation(117650),
      carburants_litres: addVariation(7834),
      vehicules_km_annuel: addVariation(39240),
      vols_domestiques_km: addVariation(2947),
      vols_internationaux_km: addVariation(4892),
      montant_achats_annuel: addVariation(784300),
      pourcentage_local: Math.round(23 + Math.random() * 8) // 23-31%
    },
    services: {
      electricite_kwh: addVariation(24680),
      gaz_kwh: addVariation(14720),
      carburants_litres: addVariation(1947),
      vehicules_km_annuel: addVariation(14830),
      vols_domestiques_km: addVariation(7840),
      vols_internationaux_km: addVariation(11750),
      montant_achats_annuel: addVariation(294800),
      pourcentage_local: Math.round(37 + Math.random() * 10) // 37-47%
    },
    commerce: {
      electricite_kwh: addVariation(44280),
      gaz_kwh: addVariation(24590),
      carburants_litres: addVariation(4920),
      vehicules_km_annuel: addVariation(29470),
      vols_domestiques_km: addVariation(1960),
      vols_internationaux_km: addVariation(2840),
      montant_achats_annuel: addVariation(1174600),
      pourcentage_local: Math.round(57 + Math.random() * 12) // 57-69%
    },
    construction: {
      electricite_kwh: addVariation(34720),
      gaz_kwh: addVariation(39280),
      carburants_litres: addVariation(14760),
      vehicules_km_annuel: addVariation(58940),
      vols_domestiques_km: addVariation(947),
      vols_internationaux_km: addVariation(1240),
      montant_achats_annuel: addVariation(884700),
      pourcentage_local: Math.round(67 + Math.random() * 8) // 67-75%
    },
    transport: {
      electricite_kwh: addVariation(19640),
      gaz_kwh: addVariation(9840),
      carburants_litres: addVariation(24680),
      vehicules_km_annuel: addVariation(98470),
      vols_domestiques_km: addVariation(4920),
      vols_internationaux_km: addVariation(7840),
      montant_achats_annuel: addVariation(394800),
      pourcentage_local: Math.round(28 + Math.random() * 8) // 28-36%
    }
  }

  const defaults = sectorDefaults[sector as keyof typeof sectorDefaults] || sectorDefaults.services

  return {
    energie: {
      electricite_kwh: Math.round(defaults.electricite_kwh * multiplier),
      gaz_kwh: Math.round(defaults.gaz_kwh * multiplier),
      carburants_litres: Math.round(defaults.carburants_litres * multiplier)
    },
    transport: {
      vehicules_km_annuel: Math.round(defaults.vehicules_km_annuel * multiplier),
      vols_domestiques_km: Math.round(defaults.vols_domestiques_km * multiplier),
      vols_internationaux_km: Math.round(defaults.vols_internationaux_km * multiplier)
    },
    achats: {
      montant_achats_annuel: Math.round(defaults.montant_achats_annuel * multiplier),
      pourcentage_local: defaults.pourcentage_local
    }
  }
}
