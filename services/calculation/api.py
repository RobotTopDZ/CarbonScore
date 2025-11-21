"""
CarbonScore Calculation API
FastAPI service for carbon footprint calculations
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
import json
import uuid
from datetime import datetime
import logging

from carbon_calculator import process_questionnaire_data, EmissionResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CarbonScore Calculation API",
    description="Advanced carbon footprint calculation using ADEME Base Carbone v17",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class EntrepriseData(BaseModel):
    nom: str = Field(..., description="Company name")
    secteur: str = Field(..., description="Business sector")
    effectif: str = Field(..., description="Number of employees")
    chiffre_affaires: Optional[float] = Field(None, description="Annual revenue in euros")
    localisation: str = Field(..., description="Company location")

class EnergieData(BaseModel):
    electricite_kwh: float = Field(..., ge=0, description="Annual electricity consumption in kWh")
    gaz_kwh: float = Field(..., ge=0, description="Annual gas consumption in kWh")
    carburants_litres: float = Field(..., ge=0, description="Annual fuel consumption in liters")

class TransportData(BaseModel):
    vehicules_km_annuel: float = Field(..., ge=0, description="Annual vehicle kilometers")
    vols_domestiques_km: float = Field(..., ge=0, description="Annual domestic flight kilometers")
    vols_internationaux_km: float = Field(..., ge=0, description="Annual international flight kilometers")

class AchatsData(BaseModel):
    montant_achats_annuel: float = Field(..., ge=0, description="Annual purchase amount in euros")
    pourcentage_local: float = Field(..., ge=0, le=100, description="Percentage of local purchases")

class QuestionnaireRequest(BaseModel):
    entreprise: EntrepriseData
    energie: EnergieData
    transport: TransportData
    achats: AchatsData

class CalculationResponse(BaseModel):
    calculation_id: str
    status: str
    total_co2e: float
    scope_1: float
    scope_2: float
    scope_3: float
    breakdown: Dict[str, float]
    recommendations: List[str]
    benchmark_position: str
    intensity_per_employee: float
    intensity_per_revenue: Optional[float]
    calculated_at: datetime

# In-memory storage (replace with database in production)
calculations_store: Dict[str, CalculationResponse] = {}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CarbonScore Calculation API",
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "calculations_count": len(calculations_store),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/calculate", response_model=CalculationResponse)
async def calculate_emissions(
    request: QuestionnaireRequest,
    background_tasks: BackgroundTasks
):
    """
    Calculate carbon footprint from questionnaire data
    """
    try:
        logger.info(f"Starting calculation for company: {request.entreprise.nom}")
        
        # Generate unique calculation ID
        calculation_id = str(uuid.uuid4())
        
        # Convert request to JSON format expected by calculator
        questionnaire_data = {
            "entreprise": {
                "nom": request.entreprise.nom,
                "secteur": request.entreprise.secteur,
                "effectif": request.entreprise.effectif,
                "chiffreAffaires": request.entreprise.chiffre_affaires,
                "localisation": request.entreprise.localisation
            },
            "energie": {
                "electricite_kwh": request.energie.electricite_kwh,
                "gaz_kwh": request.energie.gaz_kwh,
                "carburants_litres": request.energie.carburants_litres
            },
            "transport": {
                "vehicules_km_annuel": request.transport.vehicules_km_annuel,
                "vols_domestiques_km": request.transport.vols_domestiques_km,
                "vols_internationaux_km": request.transport.vols_internationaux_km
            },
            "achats": {
                "montant_achats_annuel": request.achats.montant_achats_annuel,
                "pourcentage_local": request.achats.pourcentage_local
            }
        }
        
        # Process calculation
        result = process_questionnaire_data(json.dumps(questionnaire_data))
        
        # Create response
        response = CalculationResponse(
            calculation_id=calculation_id,
            status="completed",
            total_co2e=result.total_co2e,
            scope_1=result.scope_1,
            scope_2=result.scope_2,
            scope_3=result.scope_3,
            breakdown=result.breakdown,
            recommendations=result.recommendations,
            benchmark_position=result.benchmark_position,
            intensity_per_employee=result.intensity_per_employee,
            intensity_per_revenue=result.intensity_per_revenue,
            calculated_at=datetime.now()
        )
        
        # Store result
        calculations_store[calculation_id] = response
        
        # Log success
        logger.info(f"Calculation completed: {calculation_id} - {result.total_co2e} kgCO2e")
        
        return response
        
    except Exception as e:
        logger.error(f"Calculation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Calculation failed: {str(e)}"
        )

@app.get("/api/v1/calculation/{calculation_id}", response_model=CalculationResponse)
async def get_calculation(calculation_id: str):
    """
    Retrieve calculation results by ID
    """
    if calculation_id not in calculations_store:
        raise HTTPException(
            status_code=404,
            detail="Calculation not found"
        )
    
    return calculations_store[calculation_id]

@app.get("/api/v1/calculations")
async def list_calculations(limit: int = 10, offset: int = 0):
    """
    List recent calculations
    """
    calculations = list(calculations_store.values())
    calculations.sort(key=lambda x: x.calculated_at, reverse=True)
    
    return {
        "calculations": calculations[offset:offset + limit],
        "total": len(calculations),
        "limit": limit,
        "offset": offset
    }

@app.get("/api/v1/emission-factors")
async def get_emission_factors():
    """
    Get ADEME emission factors for reference
    """
    from carbon_calculator import ADEMEDataProcessor
    
    processor = ADEMEDataProcessor()
    return {
        "factors": processor.emission_factors,
        "source": "ADEME Base Carbone v17",
        "last_updated": "2024"
    }

@app.get("/api/v1/sectors")
async def get_sectors():
    """
    Get available business sectors
    """
    return {
        "sectors": [
            {"value": "industrie", "label": "Industrie manufacturière"},
            {"value": "services", "label": "Services aux entreprises"},
            {"value": "commerce", "label": "Commerce de détail/gros"},
            {"value": "construction", "label": "Construction/BTP"},
            {"value": "transport", "label": "Transport"},
            {"value": "logistique", "label": "Logistique et distribution"},
            {"value": "restauration", "label": "Restauration/Hôtellerie"},
            {"value": "sante", "label": "Santé et services sociaux"},
            {"value": "education", "label": "Éducation et formation"},
            {"value": "agriculture", "label": "Agriculture et agroalimentaire"},
            {"value": "technologie", "label": "Technologies et numérique"}
        ]
    }

@app.post("/api/v1/validate")
async def validate_questionnaire(request: QuestionnaireRequest):
    """
    Validate questionnaire data without calculating
    """
    try:
        # Basic validation is handled by Pydantic
        # Additional business logic validation can be added here
        
        validation_results = {
            "valid": True,
            "warnings": [],
            "suggestions": []
        }
        
        # Check for potential data quality issues
        if request.energie.electricite_kwh == 0 and request.energie.gaz_kwh == 0:
            validation_results["warnings"].append(
                "Aucune consommation énergétique renseignée - les résultats peuvent être incomplets"
            )
        
        if request.transport.vehicules_km_annuel > 100000:
            validation_results["suggestions"].append(
                "Kilométrage véhicules élevé - vérifiez la saisie"
            )
        
        if request.achats.pourcentage_local > 80:
            validation_results["suggestions"].append(
                "Excellent taux d'achats locaux - continuez vos efforts!"
            )
        
        return validation_results
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Validation failed: {str(e)}"
        )

@app.post("/api/v1/scenario-analysis/{calculation_id}")
async def analyze_action_scenario(calculation_id: str, action_index: int):
    """
    Generate detailed scenario analysis for a specific recommended action
    Provides implementation steps, costs, timeline, and quantified impact
    """
    try:
        # Get calculation results
        if calculation_id not in calculations_store:
            raise HTTPException(status_code=404, detail="Calculation not found")
        
        result = calculations_store[calculation_id]
        
        # Get the specific action
        if action_index >= len(result.recommendations):
            raise HTTPException(status_code=400, detail="Invalid action index")
        
        action = result.recommendations[action_index]
        
        # Parse action details
        import re
        co2_match = re.search(r'réduit (\d+(?:\.\d+)?)\s*kgCO₂e', action)
        co2_reduction = float(co2_match.group(1)) if co2_match else 0
        
        # Extract action type from emoji/keywords
        action_type = None
        if '⚡' in action or 'électricité' in action.lower():
            action_type = 'electricity'
        elif '🚗' in action or '🔋' in action or 'véhicule' in action.lower() or 'flotte' in action.lower():
            action_type = 'vehicles'
        elif '⛽' in action or 'carburant' in action.lower():
            action_type = 'fuel'
        elif '🔥' in action or 'chaudière' in action.lower() or 'pompe à chaleur' in action.lower():
            action_type = 'heating'
        elif '✈️' in action or 'vol' in action.lower():
            action_type = 'flights'
        elif '🛒' in action or 'achat' in action.lower() or 'fournisseur' in action.lower():
            action_type = 'purchases'
        elif '🚂' in action or 'modal' in action.lower():
            action_type = 'modal_shift'
        
        # Generate detailed scenario based on action type
        scenario = {
            "action": action,
            "action_type": action_type,
            "co2_reduction_kg": co2_reduction,
            "co2_reduction_tons": round(co2_reduction / 1000, 2),
            "percentage_total_reduction": round((co2_reduction / result.total_co2e) * 100, 1),
            "implementation_steps": [],
            "timeline": {},
            "costs": {},
            "roi_analysis": {},
            "risks": [],
            "benefits": [],
            "kpis": [],
            "case_studies": []
        }
        
        # Prepare prompt for LLM scenario analysis
        scenario_prompt = f"""
        Agis comme un expert consultant en décarbonation. Analyse cette action recommandée pour une entreprise et génère un plan de mise en œuvre détaillé.

        CONTEXTE ENTREPRISE:
        - Secteur: {result.company_data.secteur}
        - Effectif: {result.company_data.effectif}
        - Localisation: {result.company_data.localisation}
        - Émissions Totales: {result.total_co2e:,.0f} kgCO2e

        ACTION RECOMMANDÉE:
        "{action}"

        IMPACT ESTIMÉ:
        - Réduction CO2: {co2_reduction:.0f} kgCO2e
        - Type: {action_type}

        Génère une analyse de scénario détaillée au format JSON strict avec la structure suivante:
        {{
            "action": "Titre complet de l'action",
            "action_type": "{action_type}",
            "co2_reduction_kg": {co2_reduction},
            "implementation_steps": [
                "Étape 1: Titre (Durée) - Description courte",
                "Étape 2...",
                "Étape 3...",
                "Étape 4...",
                "Étape 5..."
            ],
            "timeline": {{
                "phase_1": "Mois 1-2",
                "phase_2": "Mois 3-4",
                "phase_3": "Mois 5-6"
            }},
            "costs": {{
                "poste_depense_1": "Montant estimé €",
                "poste_depense_2": "Montant estimé €",
                "poste_depense_3": "Montant estimé €"
            }},
            "roi_analysis": {{
                "payback_period": "X mois/années",
                "annual_savings": "Montant estimé €/an",
                "non_financial_benefits": "Avantage qualitatif majeur",
                "subsidies_available": "Nom des aides possibles (France)"
            }},
            "risks": [
                "Risque 1",
                "Risque 2"
            ],
            "benefits": [
                "Bénéfice 1",
                "Bénéfice 2",
                "Bénéfice 3"
            ],
            "kpis": [
                "KPI 1",
                "KPI 2",
                "KPI 3"
            ]
        }}

        Sois très précis et réaliste sur les coûts et les délais. Adapte le ton au secteur d'activité ({result.company_data.secteur}).
        """

        # Call Minimax API
        import httpx
        async with httpx.AsyncClient() as client:
            ai_response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "minimax/minimax-m2",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Tu es un expert technique en transition écologique des entreprises. Tu fournis des plans d'action chiffrés et opérationnels."
                        },
                        {
                            "role": "user", 
                            "content": scenario_prompt
                        }
                    ],
                    "temperature": 0.2,
                    "max_tokens": 1500
                },
                timeout=30.0
            )
        
        if ai_response.status_code != 200:
            # Fallback to hardcoded logic if API fails
            raise Exception("LLM API unavailable")
            
        ai_content = ai_response.json()["choices"][0]["message"]["content"]
        
        # Parse JSON from LLM response
        import json
        import re
        json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
        if json_match:
            scenario = json.loads(json_match.group())
            # Ensure numeric fields are preserved/added
            scenario["co2_reduction_kg"] = co2_reduction
            scenario["co2_reduction_tons"] = round(co2_reduction / 1000, 2)
            scenario["percentage_total_reduction"] = round((co2_reduction / result.total_co2e) * 100, 1)
        else:
            raise ValueError("Invalid JSON from LLM")

        # Add general implementation support (these are not generated by LLM in this prompt)
        scenario["support_resources"] = {
            "consultants": ["ADEME", "Carbone 4", "EcoAct"],
            "subsidies": ["France Relance", "Aides régionales", "CEE"],
            "certifications": ["ISO 14001", "B Corp", "Label Bas-Carbone"],
            "tools": ["Bilan Carbone®", "GHG Protocol", "SBTi"]
        }
        
        scenario["next_steps"] = [
            "1. Valider budget et obtenir approbation direction",
            "2. Constituer équipe projet (sponsor, chef projet, experts)",
            "3. Lancer phase pilote sur périmètre restreint",
            "4. Mesurer résultats et ajuster approche",
            "5. Déployer à grande échelle",
            "6. Communiquer succès en interne et externe"
        ]
        
        return scenario
        
    except Exception as e:
        logger.error(f"Scenario analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate scenario analysis: {str(e)}"
        )


@app.post("/api/v1/ai-insights/{calculation_id}")
async def generate_ai_insights(calculation_id: str):
    """
    Generate advanced AI insights using LLM for existing calculation
    """
    try:
        # Get calculation results
        if calculation_id not in calculations_store:
            raise HTTPException(status_code=404, detail="Calculation not found")
        
        result = calculations_store[calculation_id]
        
        # Prepare data for AI analysis
        analysis_prompt = f"""
        Analyse cette empreinte carbone d'entreprise et fournis des recommandations détaillées et personnalisées:

        DONNÉES ENTREPRISE:
        - Émissions totales: {result.total_co2e} kgCO2e
        - Scope 1: {result.scope_1} kgCO2e
        - Scope 2: {result.scope_2} kgCO2e  
        - Scope 3: {result.scope_3} kgCO2e
        - Score efficacité: {result.carbon_efficiency_score}/100
        - Grade durabilité: {result.sustainability_grade}
        - Position sectorielle: {result.benchmark_position}

        RÉPARTITION DÉTAILLÉE:
        {json.dumps(result.breakdown, indent=2)}

        POTENTIEL DE RÉDUCTION:
        {json.dumps(result.reduction_potential, indent=2)}

        Fournis une analyse approfondie avec:
        1. DIAGNOSTIC EXPERT (3-4 points clés)
        2. PLAN D'ACTION PRIORITAIRE (5 actions concrètes avec impact estimé)
        3. STRATÉGIE LONG TERME (roadmap 2030)
        4. OPPORTUNITÉS BUSINESS (économies, subventions, image)
        5. RISQUES À ANTICIPER (réglementaire, concurrentiel)

        Réponds en JSON avec cette structure:
        {{
            "diagnostic": ["point1", "point2", "point3"],
            "plan_action": [
                {{"action": "description", "impact_co2e": number, "cout_estime": "string", "delai": "string"}},
                ...
            ],
            "strategie_2030": {{"objectif": "string", "etapes": ["etape1", "etape2"]}},
            "opportunites": ["opportunite1", "opportunite2"],
            "risques": ["risque1", "risque2"],
            "score_maturite": number,
            "prochaines_etapes": ["etape1", "etape2", "etape3"]
        }}
        """

        # Call Minimax API
        import httpx
        async with httpx.AsyncClient() as client:
            ai_response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "minimax/minimax-m2",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Tu es un expert consultant en décarbonation d'entreprises. Tu analyses les empreintes carbone et fournis des recommandations stratégiques précises et actionnables."
                        },
                        {
                            "role": "user", 
                            "content": analysis_prompt
                        }
                    ],
                    "reasoning": {"enabled": True},
                    "temperature": 0.3,
                    "max_tokens": 2000
                }
            )
        
        if ai_response.status_code != 200:
            raise HTTPException(status_code=500, detail="AI service unavailable")
        
        ai_result = ai_response.json()
        ai_content = ai_result["choices"][0]["message"]["content"]
        
        # Parse AI response
        try:
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
            if json_match:
                ai_insights = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in AI response")
        except:
            # Fallback structured response
            ai_insights = {
                "diagnostic": ["Analyse en cours", "Données reçues", "Traitement effectué"],
                "plan_action": [
                    {"action": "Optimisation énergétique", "impact_co2e": result.reduction_potential.get('electricite', 0), "cout_estime": "Moyen", "delai": "6 mois"}
                ],
                "strategie_2030": {"objectif": "Réduction 55%", "etapes": ["Phase 1", "Phase 2"]},
                "opportunites": ["Économies d'énergie", "Image de marque"],
                "risques": ["Réglementation", "Concurrence"],
                "score_maturite": int(result.carbon_efficiency_score),
                "prochaines_etapes": ["Audit détaillé", "Plan d'action", "Mise en œuvre"]
            }
        
        # Store enhanced insights
        enhanced_result = result.dict()
        enhanced_result['ai_insights_detailed'] = ai_insights
        enhanced_result['ai_reasoning'] = ai_result["choices"][0]["message"].get("reasoning_details")
        
        return {
            "calculation_id": calculation_id,
            "ai_insights": ai_insights,
            "generated_at": datetime.now().isoformat(),
            "reasoning": ai_result["choices"][0]["message"].get("reasoning_details")
        }
        
    except Exception as e:
        logger.error(f"AI insights generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI insights: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
