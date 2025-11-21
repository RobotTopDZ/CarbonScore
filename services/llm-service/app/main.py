"""
CarbonScore LLM Service
Advanced AI insights and conversational assistant using RAG pipeline
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
import httpx
import json
import logging
from datetime import datetime
from pathlib import Path
import asyncio
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CarbonScore LLM Service",
    description="AI-powered insights and conversational assistant for carbon footprint analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MINIMAX_API_KEY = "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"
MINIMAX_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Pydantic models
class CompanyProfile(BaseModel):
    name: str
    sector: str
    employees: str
    revenue: Optional[float] = None
    location: str

class EmissionResults(BaseModel):
    total_co2e: float
    scope_1: float
    scope_2: float
    scope_3: float
    breakdown: Dict[str, float]
    carbon_efficiency_score: float
    sustainability_grade: str
    benchmark_position: str

class ReportRequest(BaseModel):
    company_profile: CompanyProfile
    emission_results: EmissionResults
    language: str = "fr"
    report_type: str = "comprehensive"

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None

class InsightRequest(BaseModel):
    company_profile: CompanyProfile
    emission_results: EmissionResults
    insight_type: str = "strategic"

class RAGKnowledgeBase:
    """RAG Knowledge Base for carbon footprint expertise"""
    
    def __init__(self):
        self.knowledge_dir = Path("/data/artifacts/knowledge")
        self.knowledge_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize sentence transformer for embeddings
        try:
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.warning(f"Could not load sentence transformer: {e}")
            self.encoder = None
        
        self.documents = []
        self.embeddings = None
        self.index = None
        
        # Load or create knowledge base
        self.load_knowledge_base()
    
    def load_knowledge_base(self):
        """Load existing knowledge base or create new one"""
        try:
            # Try to load existing knowledge base
            kb_path = self.knowledge_dir / "knowledge_base.pkl"
            index_path = self.knowledge_dir / "faiss_index.bin"
            
            if kb_path.exists() and index_path.exists():
                with open(kb_path, 'rb') as f:
                    data = pickle.load(f)
                    self.documents = data['documents']
                    self.embeddings = data['embeddings']
                
                if self.encoder:
                    self.index = faiss.read_index(str(index_path))
                
                logger.info(f"Loaded knowledge base with {len(self.documents)} documents")
            else:
                self.create_knowledge_base()
                
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            self.create_knowledge_base()
    
    def create_knowledge_base(self):
        """Create knowledge base with ADEME and sustainability expertise"""
        logger.info("Creating new knowledge base...")
        
        # ADEME and carbon footprint knowledge
        knowledge_documents = [
            {
                "id": "ademe_methodology",
                "title": "Méthodologie ADEME Base Carbone",
                "content": """
                La Base Carbone ADEME v17 fournit des facteurs d'émission pour le calcul des bilans GES.
                Elle couvre les scopes 1, 2 et 3 du protocole GHG. Les facteurs sont exprimés en kgCO2e
                et incluent les émissions amont et aval. La méthodologie suit les standards ISO 14067 et 14064.
                """,
                "category": "methodology",
                "tags": ["ademe", "ghg", "methodology"]
            },
            {
                "id": "scope_definitions",
                "title": "Définitions des Scopes GES",
                "content": """
                Scope 1: Émissions directes de l'organisation (combustion, procédés, véhicules).
                Scope 2: Émissions indirectes liées à l'énergie (électricité, chaleur, vapeur).
                Scope 3: Autres émissions indirectes (achats, déplacements, déchets, transport).
                Le scope 3 représente souvent 70-80% des émissions totales d'une entreprise.
                """,
                "category": "definitions",
                "tags": ["scope", "ghg", "emissions"]
            },
            {
                "id": "sector_benchmarks",
                "title": "Benchmarks Sectoriels",
                "content": """
                Industrie: 12-15 tCO2e/employé, focus sur l'efficacité énergétique et les procédés.
                Services: 3-6 tCO2e/employé, principalement électricité et déplacements.
                Commerce: 5-8 tCO2e/employé, transport de marchandises et énergie des locaux.
                Construction: 10-20 tCO2e/employé, matériaux et équipements lourds.
                Transport: 15-25 tCO2e/employé, carburants et véhicules.
                """,
                "category": "benchmarks",
                "tags": ["secteur", "benchmark", "intensité"]
            },
            {
                "id": "reduction_strategies",
                "title": "Stratégies de Réduction",
                "content": """
                1. Efficacité énergétique: LED, isolation, équipements performants (15-30% réduction)
                2. Énergies renouvelables: solaire, éolien, contrats verts (50-80% scope 2)
                3. Mobilité durable: véhicules électriques, télétravail, transports en commun
                4. Économie circulaire: réduction déchets, réparation, réutilisation
                5. Approvisionnement local: réduction transport, soutien économie locale
                """,
                "category": "actions",
                "tags": ["réduction", "stratégie", "actions"]
            },
            {
                "id": "regulatory_context",
                "title": "Contexte Réglementaire",
                "content": """
                CSRD (Corporate Sustainability Reporting Directive): reporting obligatoire dès 2024.
                Taxonomie européenne: classification des activités durables.
                Objectifs climatiques UE: -55% d'émissions d'ici 2030, neutralité carbone 2050.
                Loi française: bilan GES obligatoire pour entreprises >500 salariés.
                """,
                "category": "regulation",
                "tags": ["réglementation", "csrd", "taxonomie"]
            },
            {
                "id": "calculation_methods",
                "title": "Méthodes de Calcul",
                "content": """
                Approche par facteurs d'émission: Activité × Facteur d'émission = Émissions CO2e
                Approche par analyse de cycle de vie (ACV): évaluation complète des impacts
                Incertitudes: ±10-30% selon la qualité des données et la méthode
                Vérification: audit par tierce partie recommandé pour la crédibilité
                """,
                "category": "calculation",
                "tags": ["calcul", "facteurs", "acv"]
            }
        ]
        
        self.documents = knowledge_documents
        
        if self.encoder:
            # Create embeddings
            texts = [doc['content'] for doc in self.documents]
            self.embeddings = self.encoder.encode(texts)
            
            # Create FAISS index
            dimension = self.embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)  # Inner product for similarity
            
            # Normalize embeddings for cosine similarity
            faiss.normalize_L2(self.embeddings)
            self.index.add(self.embeddings)
            
            # Save knowledge base
            self.save_knowledge_base()
            
        logger.info(f"Created knowledge base with {len(self.documents)} documents")
    
    def save_knowledge_base(self):
        """Save knowledge base to disk"""
        try:
            kb_path = self.knowledge_dir / "knowledge_base.pkl"
            index_path = self.knowledge_dir / "faiss_index.bin"
            
            # Save documents and embeddings
            with open(kb_path, 'wb') as f:
                pickle.dump({
                    'documents': self.documents,
                    'embeddings': self.embeddings
                }, f)
            
            # Save FAISS index
            if self.index:
                faiss.write_index(self.index, str(index_path))
            
            logger.info("Knowledge base saved successfully")
            
        except Exception as e:
            logger.error(f"Error saving knowledge base: {e}")
    
    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search for relevant documents"""
        if not self.encoder or not self.index:
            return []
        
        try:
            # Encode query
            query_embedding = self.encoder.encode([query])
            faiss.normalize_L2(query_embedding)
            
            # Search
            scores, indices = self.index.search(query_embedding, top_k)
            
            # Return results
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.documents):
                    doc = self.documents[idx].copy()
                    doc['relevance_score'] = float(score)
                    results.append(doc)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {e}")
            return []

class LLMService:
    """Main LLM service for AI insights and chat"""
    
    def __init__(self):
        self.knowledge_base = RAGKnowledgeBase()
        self.conversation_history = {}
    
    async def call_minimax_api(self, messages: List[Dict], temperature: float = 0.3, max_tokens: int = 2000) -> Dict:
        """Call Minimax API via OpenRouter"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    MINIMAX_API_URL,
                    headers={
                        "Authorization": f"Bearer {MINIMAX_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "minimax/minimax-m2",
                        "messages": messages,
                        "reasoning": {"enabled": True},
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, detail="LLM API error")
                
                return response.json()
                
        except Exception as e:
            logger.error(f"Minimax API error: {e}")
            raise HTTPException(status_code=500, detail=f"LLM service error: {str(e)}")
    
    async def generate_report(self, request: ReportRequest) -> Dict:
        """Generate comprehensive narrative report"""
        try:
            # Search for relevant knowledge
            search_queries = [
                f"méthodologie calcul empreinte carbone {request.company_profile.sector}",
                f"benchmark sectoriel {request.company_profile.sector}",
                f"stratégies réduction émissions {request.company_profile.sector}"
            ]
            
            relevant_docs = []
            for query in search_queries:
                docs = self.knowledge_base.search(query, top_k=2)
                relevant_docs.extend(docs)
            
            # Prepare context
            context = "\n\n".join([doc['content'] for doc in relevant_docs[:5]])
            
            # Create detailed prompt
            system_prompt = """Tu es un expert consultant en décarbonation d'entreprises, spécialisé dans l'analyse d'empreinte carbone selon la méthodologie ADEME. Tu génères des rapports professionnels détaillés et actionnables."""
            
            user_prompt = f"""
            Génère un rapport d'analyse complet pour cette entreprise:
            
            PROFIL ENTREPRISE:
            - Nom: {request.company_profile.name}
            - Secteur: {request.company_profile.sector}
            - Effectif: {request.company_profile.employees}
            - Localisation: {request.company_profile.location}
            
            RÉSULTATS EMPREINTE CARBONE:
            - Émissions totales: {request.emission_results.total_co2e:,.0f} kgCO₂e
            - Scope 1: {request.emission_results.scope_1:,.0f} kgCO₂e
            - Scope 2: {request.emission_results.scope_2:,.0f} kgCO₂e
            - Scope 3: {request.emission_results.scope_3:,.0f} kgCO₂e
            - Score efficacité: {request.emission_results.carbon_efficiency_score}/100
            - Grade durabilité: {request.emission_results.sustainability_grade}
            - Position sectorielle: {request.emission_results.benchmark_position}
            
            RÉPARTITION DÉTAILLÉE:
            {json.dumps(request.emission_results.breakdown, indent=2)}
            
            CONTEXTE EXPERT:
            {context}
            
            Génère un rapport structuré avec:
            1. RÉSUMÉ EXÉCUTIF (2-3 paragraphes)
            2. ANALYSE DÉTAILLÉE DES RÉSULTATS (par scope et catégorie)
            3. POSITIONNEMENT SECTORIEL ET BENCHMARKING
            4. PLAN D'ACTION STRATÉGIQUE (5 recommandations prioritaires)
            5. TRAJECTOIRE 2030 ET OBJECTIFS
            6. OPPORTUNITÉS BUSINESS ET ROI
            7. PROCHAINES ÉTAPES CONCRÈTES
            
            Le rapport doit être professionnel, précis, et orienté action. Utilise les données ADEME et les meilleures pratiques sectorielles.
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # Call LLM
            response = await self.call_minimax_api(messages, temperature=0.2, max_tokens=3000)
            
            return {
                "report_content": response["choices"][0]["message"]["content"],
                "reasoning": response["choices"][0]["message"].get("reasoning_details"),
                "generated_at": datetime.now().isoformat(),
                "company_name": request.company_profile.name,
                "report_type": request.report_type
            }
            
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def chat_assistant(self, request: ChatRequest) -> Dict:
        """Conversational assistant for carbon footprint questions"""
        try:
            # Search knowledge base for relevant context
            relevant_docs = self.knowledge_base.search(request.message, top_k=3)
            context = "\n\n".join([doc['content'] for doc in relevant_docs])
            
            # Get conversation history
            conversation_id = request.conversation_id or "default"
            history = self.conversation_history.get(conversation_id, [])
            
            # Prepare messages
            system_prompt = f"""Tu es CarbonScore Assistant, un expert IA en empreinte carbone et durabilité. Tu aides les entreprises à comprendre et réduire leurs émissions GES.

CONTEXTE EXPERT:
{context}

INSTRUCTIONS:
- Réponds de manière précise et professionnelle
- Utilise les données ADEME quand pertinent
- Propose des actions concrètes
- Reste dans le domaine de l'empreinte carbone
- Si tu ne sais pas, dis-le clairement"""
            
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history (last 5 exchanges)
            messages.extend(history[-10:])
            
            # Add current message
            messages.append({"role": "user", "content": request.message})
            
            # Call LLM
            response = await self.call_minimax_api(messages, temperature=0.4, max_tokens=1000)
            
            assistant_response = response["choices"][0]["message"]["content"]
            
            # Update conversation history
            history.extend([
                {"role": "user", "content": request.message},
                {"role": "assistant", "content": assistant_response}
            ])
            self.conversation_history[conversation_id] = history
            
            return {
                "response": assistant_response,
                "conversation_id": conversation_id,
                "relevant_docs": [doc['title'] for doc in relevant_docs],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Chat assistant error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def generate_insights(self, request: InsightRequest) -> Dict:
        """Generate strategic insights for company"""
        try:
            # Search for sector-specific insights
            search_query = f"insights stratégiques {request.company_profile.sector} réduction émissions"
            relevant_docs = self.knowledge_base.search(search_query, top_k=3)
            context = "\n\n".join([doc['content'] for doc in relevant_docs])
            
            system_prompt = """Tu es un analyste expert en stratégie carbone. Tu génères des insights stratégiques personnalisés pour aider les entreprises à optimiser leur décarbonation."""
            
            user_prompt = f"""
            Analyse cette entreprise et génère des insights stratégiques:
            
            ENTREPRISE: {request.company_profile.name} ({request.company_profile.sector})
            EFFECTIF: {request.company_profile.employees}
            
            PERFORMANCE CARBONE:
            - Total: {request.emission_results.total_co2e:,.0f} kgCO₂e
            - Score: {request.emission_results.carbon_efficiency_score}/100
            - Grade: {request.emission_results.sustainability_grade}
            - Position: {request.emission_results.benchmark_position}
            
            CONTEXTE SECTORIEL:
            {context}
            
            Génère 5 insights stratégiques sous forme de JSON:
            {{
                "insights": [
                    {{
                        "type": "performance|opportunity|risk|benchmark|innovation",
                        "title": "Titre court",
                        "description": "Description détaillée",
                        "impact": "high|medium|low",
                        "actionable": true/false,
                        "priority": 1-5
                    }}
                ]
            }}
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.call_minimax_api(messages, temperature=0.3, max_tokens=1500)
            
            # Parse JSON response
            try:
                import re
                content = response["choices"][0]["message"]["content"]
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    insights_data = json.loads(json_match.group())
                else:
                    raise ValueError("No JSON found")
            except:
                # Fallback insights
                insights_data = {
                    "insights": [
                        {
                            "type": "performance",
                            "title": "Analyse de performance",
                            "description": f"Votre score de {request.emission_results.carbon_efficiency_score}/100 indique des opportunités d'amélioration",
                            "impact": "medium",
                            "actionable": True,
                            "priority": 3
                        }
                    ]
                }
            
            return {
                **insights_data,
                "generated_at": datetime.now().isoformat(),
                "company_name": request.company_profile.name,
                "insight_type": request.insight_type
            }
            
        except Exception as e:
            logger.error(f"Insights generation error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# Initialize LLM service
llm_service = LLMService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CarbonScore LLM Service",
        "status": "healthy",
        "knowledge_base_docs": len(llm_service.knowledge_base.documents),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/llm/report")
async def generate_report(request: ReportRequest):
    """Generate comprehensive narrative report"""
    logger.info(f"Generating report for {request.company_profile.name}")
    return await llm_service.generate_report(request)

@app.post("/api/v1/llm/chat")
async def chat_assistant(request: ChatRequest):
    """Conversational assistant for carbon footprint questions"""
    logger.info(f"Chat request: {request.message[:50]}...")
    return await llm_service.chat_assistant(request)

@app.post("/api/v1/llm/insights")
async def generate_insights(request: InsightRequest):
    """Generate strategic insights for company"""
    logger.info(f"Generating insights for {request.company_profile.name}")
    return await llm_service.generate_insights(request)

@app.get("/api/v1/llm/templates")
async def get_prompt_templates():
    """Get available prompt templates"""
    return {
        "templates": [
            {
                "id": "comprehensive_report",
                "name": "Rapport Complet",
                "description": "Rapport d'analyse complet avec recommandations"
            },
            {
                "id": "executive_summary",
                "name": "Résumé Exécutif",
                "description": "Synthèse pour dirigeants"
            },
            {
                "id": "technical_analysis",
                "name": "Analyse Technique",
                "description": "Analyse détaillée pour experts"
            },
            {
                "id": "action_plan",
                "name": "Plan d'Action",
                "description": "Recommandations opérationnelles"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8030,
        reload=True,
        log_level="info"
    )
