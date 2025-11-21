"""
CarbonScore PDF Service
Professional PDF report generation with charts and branding
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
import io
import base64
from datetime import datetime
from pathlib import Path
import json
import logging
import httpx
import asyncio
from threading import Lock

# ReportLab imports
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import Color, HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

# Chart generation
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import seaborn as sns
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REPORT_INDEX_FILE = Path("./data/reports_index.json")
report_index_lock = Lock()


def _extract_metadata_from_filename(pdf_path: Path) -> Dict[str, Any]:
    """Build minimal metadata when no index entry exists."""
    stem_parts = pdf_path.stem.split('_')
    company_parts = stem_parts[2:-2] if len(stem_parts) > 4 else stem_parts[2:]
    company_name = " ".join(part.capitalize() for part in company_parts) or "Entreprise"

    generated_at = datetime.fromtimestamp(pdf_path.stat().st_mtime)
    if len(stem_parts) >= 4:
        date_part = stem_parts[-2]
        time_part = stem_parts[-1]
        try:
            generated_at = datetime.strptime(f"{date_part}{time_part}", "%Y%m%d%H%M%S")
        except ValueError:
            pass

    return {
        "id": pdf_path.stem,
        "filename": pdf_path.name,
        "title": f"Rapport Empreinte Carbone - {company_name}",
        "company_name": company_name,
        "company_sector": None,
        "generated_at": generated_at.isoformat(),
        "template": "standard",
        "total_co2e": None,
        "grade": None,
        "file_size": pdf_path.stat().st_size,
        "status": "ready"
    }


def _load_reports_metadata(reports_dir: Path) -> List[Dict[str, Any]]:
    """Load report metadata index or rebuild it from disk if missing."""
    if REPORT_INDEX_FILE.exists():
        try:
            with open(REPORT_INDEX_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as exc:
            logger.warning("Unable to read report index file: %s", exc)

    reports = [_extract_metadata_from_filename(path) for path in sorted(reports_dir.glob("*.pdf"), reverse=True)]
    if reports:
        _save_reports_metadata(reports)
    return reports


def _save_reports_metadata(reports: List[Dict[str, Any]]) -> None:
    REPORT_INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(reports, f, ensure_ascii=False, indent=2)


def _register_report_metadata(reports_dir: Path, metadata: Dict[str, Any]) -> None:
    with report_index_lock:
        reports = _load_reports_metadata(reports_dir)
        reports = [report for report in reports if report.get("id") != metadata["id"]]
        reports.append(metadata)
        reports.sort(key=lambda item: item.get("generated_at", ""), reverse=True)
        _save_reports_metadata(reports)


def _create_metadata_from_request(
    report_request: "ReportRequest",
    filename: str,
    file_size: int,
    generated_at: datetime
) -> Dict[str, Any]:
    """Create metadata payload based on the request content."""
    company_name = report_request.company_info.name.strip() or "Entreprise"
    report_title = (
        report_request.branding.get("report_title")
        if report_request.branding and report_request.branding.get("report_title")
        else f"Rapport Empreinte Carbone - {company_name}"
    )

    return {
        "id": filename.replace(".pdf", ""),
        "filename": filename,
        "title": report_title,
        "company_name": company_name,
        "company_sector": report_request.company_info.sector,
        "generated_at": generated_at.isoformat(),
        "template": report_request.template,
        "total_co2e": report_request.emission_data.total_co2e,
        "grade": report_request.emission_data.sustainability_grade,
        "file_size": file_size,
        "status": "ready"
    }

app = FastAPI(
    title="CarbonScore PDF Service",
    description="Professional PDF report generation for carbon footprint analysis",
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

# Pydantic models
class CompanyInfo(BaseModel):
    name: str
    sector: str
    employees: str
    revenue: Optional[float] = None
    location: str

class EmissionData(BaseModel):
    total_co2e: float
    scope_1: float
    scope_2: float
    scope_3: float
    breakdown: Dict[str, float]
    intensity_per_employee: float
    carbon_efficiency_score: Optional[float] = 75
    sustainability_grade: str
    intensity_per_revenue: Optional[float] = None
    calculated_at: Optional[str] = None
    monthly_breakdown: Optional[List[Dict[str, float]]] = None
    peer_comparison: Optional[Dict[str, float]] = None
    certification_readiness: Optional[Dict[str, bool]] = None
    ai_insights: Optional[Dict[str, str]] = None
    trajectory_2030: Optional[Dict[str, float]] = None
    cost_of_carbon: Optional[float] = None

class ReportRequest(BaseModel):
    company_info: CompanyInfo
    emission_data: EmissionData
    recommendations: List[str]
    benchmark_position: str
    equivalent_metrics: Optional[Dict[str, float]] = None
    reduction_potential: Optional[Dict[str, float]] = None
    template: str = "standard"
    branding: Optional[Dict[str, str]] = None

class ChartRequest(BaseModel):
    chart_type: str
    data: Dict[str, Any]
    title: str
    width: int = 800
    height: int = 600

# LLM API Configuration
LLM_API_KEY = "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"
LLM_API_URL = "https://openrouter.ai/api/v1/chat/completions"

class PDFService:
    """Main PDF generation service"""
    
    def __init__(self):
        # Use relative paths that work on Windows
        self.reports_dir = Path("./data/reports")
        self.charts_dir = Path("./data/charts")
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.charts_dir.mkdir(parents=True, exist_ok=True)
        
        # Set up matplotlib style
        try:
            plt.style.use('seaborn-v0_8')
        except:
            plt.style.use('default')
        sns.set_palette("husl")
    
    async def call_llm_api(self, prompt: str, max_tokens: int = 4000) -> str:
        """Call LLM API to generate comprehensive report content"""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    LLM_API_URL,
                    headers={
                        "Authorization": f"Bearer {LLM_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "minimax/minimax-m2",
                        "messages": [
                            {
                                "role": "system",
                                "content": "Tu es un expert consultant en décarbonation d'entreprises, spécialisé dans l'analyse d'empreinte carbone selon la méthodologie ADEME. Tu génères des rapports professionnels détaillés, complets et actionnables en français. Tu fournis des analyses approfondies avec des explications claires et des recommandations concrètes."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "reasoning": {"enabled": True},
                        "temperature": 0.3,
                        "max_tokens": max_tokens
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"LLM API error: {response.status_code} - {response.text}")
                    return ""
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
        except Exception as e:
            logger.error(f"LLM API call error: {e}")
            return ""
    
    def generate_chart(self, chart_request: ChartRequest) -> str:
        """Generate chart and return base64 encoded image"""
        try:
            fig, ax = plt.subplots(figsize=(chart_request.width/100, chart_request.height/100))
            
            if chart_request.chart_type == "scope_breakdown":
                # Pie chart for scope breakdown
                data = chart_request.data
                labels = ['Scope 1', 'Scope 2', 'Scope 3']
                sizes = [data['scope_1'], data['scope_2'], data['scope_3']]
                colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
                
                wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                
            elif chart_request.chart_type == "category_breakdown":
                # Horizontal bar chart for category breakdown
                data = chart_request.data
                categories = list(data.keys())
                values = list(data.values())
                
                # Sort by value
                sorted_data = sorted(zip(categories, values), key=lambda x: x[1], reverse=True)
                categories, values = zip(*sorted_data)
                
                bars = ax.barh(categories, values, color='#45B7D1')
                ax.set_xlabel('Émissions (kgCO₂e)', fontsize=12)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                
                # Add value labels on bars
                for i, (bar, value) in enumerate(zip(bars, values)):
                    ax.text(bar.get_width() + max(values) * 0.01, bar.get_y() + bar.get_height()/2, 
                           f'{value:,.0f}', ha='left', va='center', fontsize=10)
                
            elif chart_request.chart_type == "benchmark_comparison":
                # Bar chart comparing company vs sector average
                data = chart_request.data
                categories = ['Votre entreprise', 'Moyenne sectorielle', 'Top 25%']
                values = [data['company'], data['sector_avg'], data['top_25']]
                colors = ['#FF6B6B', '#FFA07A', '#90EE90']
                
                bars = ax.bar(categories, values, color=colors)
                ax.set_ylabel('Émissions par employé (kgCO₂e)', fontsize=12)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                
                # Add value labels on bars
                for bar, value in zip(bars, values):
                    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(values) * 0.01,
                           f'{value:,.1f}', ha='center', va='bottom', fontsize=11, fontweight='bold')
                
            elif chart_request.chart_type == "reduction_potential":
                # Stacked bar chart showing current vs potential
                data = chart_request.data
                categories = list(data['current'].keys())
                current = list(data['current'].values())
                potential = [data['potential'].get(cat, 0) for cat in categories]
                
                x = np.arange(len(categories))
                width = 0.35
                
                bars1 = ax.bar(x - width/2, current, width, label='Actuel', color='#FF6B6B')
                bars2 = ax.bar(x + width/2, [c - p for c, p in zip(current, potential)], width, 
                              label='Après réduction', color='#90EE90')
                
                ax.set_ylabel('Émissions (kgCO₂e)', fontsize=12)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                ax.set_xticks(x)
                ax.set_xticklabels(categories, rotation=45, ha='right')
                ax.legend()
                
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
            img_buffer.seek(0)
            
            # Encode to base64
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            
            plt.close(fig)
            
            return img_base64
            
        except Exception as e:
            logger.error(f"Chart generation error: {e}")
            raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")
    
    def create_chart_image(self, chart_type: str, data: Dict, title: str, width: int = 400, height: int = 300) -> Image:
        """Create chart image for PDF inclusion"""
        try:
            fig, ax = plt.subplots(figsize=(width/100, height/100), facecolor='white')
            
            if chart_type == "pie_scopes":
                # Scope breakdown pie chart
                labels = ['Scope 1\n(Direct)', 'Scope 2\n(Énergie)', 'Scope 3\n(Indirect)']
                sizes = [data['scope_1'], data['scope_2'], data['scope_3']]
                colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
                explode = (0.05, 0.05, 0.05)
                
                wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, 
                                                  autopct='%1.1f%%', startangle=90, explode=explode,
                                                  textprops={'fontsize': 10, 'fontweight': 'bold'})
                ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
                
            elif chart_type == "bar_breakdown":
                # Category breakdown horizontal bar chart
                categories = list(data.keys())
                values = list(data.values())
                
                # Sort by value
                sorted_data = sorted(zip(categories, values), key=lambda x: x[1], reverse=True)
                categories, values = zip(*sorted_data)
                
                # Translate category names
                category_labels = {
                    'electricite': 'Électricité',
                    'gaz': 'Gaz naturel', 
                    'carburants': 'Carburants',
                    'vehicules': 'Véhicules',
                    'vols_domestiques': 'Vols domestiques',
                    'vols_internationaux': 'Vols internationaux',
                    'achats': 'Achats',
                    'energie': 'Énergie',
                    'transport': 'Transport'
                }
                
                display_categories = [category_labels.get(cat, cat) for cat in categories]
                
                bars = ax.barh(display_categories, values, color='#45B7D1')
                ax.set_xlabel('Émissions (kgCO₂e)', fontsize=12, fontweight='bold')
                ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
                
                # Add value labels
                for i, (bar, value) in enumerate(zip(bars, values)):
                    ax.text(bar.get_width() + max(values) * 0.01, bar.get_y() + bar.get_height()/2, 
                           f'{value:,.0f}', ha='left', va='center', fontsize=9, fontweight='bold')
                           
            elif chart_type == "grade_gauge":
                # Grade visualization as simple bar chart (avoiding polar plot issues)
                grades = ['E', 'D', 'C', 'B', 'A', 'A+']
                colors = ['#FF4444', '#FF8800', '#FFAA00', '#88CC00', '#44AA00', '#00AA44']
                current_grade = data.get('grade', 'C')
                
                # Create simple bar chart
                values = [0.5 if grade != current_grade else 1.0 for grade in grades]
                bars = ax.bar(grades, values, color=colors, alpha=0.7)
                
                # Highlight current grade
                if current_grade in grades:
                    grade_idx = grades.index(current_grade)
                    bars[grade_idx].set_alpha(1.0)
                    bars[grade_idx].set_edgecolor('black')
                    bars[grade_idx].set_linewidth(3)
                    bars[grade_idx].set_height(1.0)
                
                ax.set_ylabel('Performance', fontsize=12, fontweight='bold')
                ax.set_title(f'Grade de Durabilité: {current_grade}', fontsize=14, fontweight='bold', pad=20)
                ax.set_ylim(0, 1.2)
                
            elif chart_type == "reduction_potential":
                # Reduction potential timeline
                periods = ['Immédiat\n(0-6 mois)', 'Court terme\n(6-18 mois)', 'Long terme\n(18-36 mois)']
                reductions = [data.get('immediate', 0), data.get('short_term', 0), data.get('long_term', 0)]
                colors = ['#90EE90', '#4ECDC4', '#45B7D1']
                
                bars = ax.bar(periods, reductions, color=colors)
                ax.set_ylabel('Réduction potentielle (kgCO₂e)', fontsize=12, fontweight='bold')
                ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
                
                # Add value labels
                if max(reductions) > 0:
                    for bar, value in zip(bars, reductions):
                        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(reductions) * 0.01,
                               f'{value:,.0f}', ha='center', va='bottom', fontsize=10, fontweight='bold')
            
            elif chart_type == "trajectory_2030":
                # Trajectory chart showing current vs 2030 target
                years_labels = ['2024\n(Actuel)', '2026', '2028', '2030\n(Objectif)']
                x_positions = [0, 1, 2, 3]
                current_emissions = data.get('current', 0)
                target_2030 = data.get('target_2030', current_emissions * 0.5)
                feasible = data.get('feasible_with_actions', target_2030 * 1.1)
                
                # Create linear progression
                values = [current_emissions, 
                         current_emissions * 0.75, 
                         current_emissions * 0.5, 
                         target_2030]
                feasible_values = [current_emissions,
                                  feasible * 1.15,
                                  feasible * 1.1,
                                  feasible]
                
                ax.plot(x_positions, values, marker='o', linewidth=3, markersize=10, label='Objectif 2030', color='#45B7D1')
                ax.plot(x_positions, feasible_values, marker='s', linewidth=2, markersize=8, label='Réalisable avec actions', color='#90EE90', linestyle='--')
                ax.fill_between(x_positions, values, feasible_values, alpha=0.2, color='#4ECDC4')
                
                ax.set_xticks(x_positions)
                ax.set_xticklabels(years_labels)
                ax.set_ylabel('Émissions (kgCO₂e)', fontsize=12, fontweight='bold')
                ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
                ax.legend(loc='best')
                ax.grid(True, alpha=0.3)
            
            elif chart_type == "monthly_breakdown":
                # Monthly emissions breakdown
                if isinstance(data, list) and len(data) > 0:
                    months = [f"M{i+1}" for i in range(12)]
                    emissions = [0.0] * 12
                    for item in data:
                        month_idx = int(item.get('month', 1)) - 1
                        if 0 <= month_idx < 12:
                            emissions[month_idx] = item.get('emissions', 0)
                    
                    bars = ax.bar(months, emissions, color='#FF6B6B')
                    ax.set_ylabel('Émissions (kgCO₂e)', fontsize=12, fontweight='bold')
                    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
                    ax.set_xticklabels(months, rotation=45, ha='right')
                    
                    if max(emissions) > 0:
                        for bar, value in zip(bars, emissions):
                            if value > 0:
                                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(emissions) * 0.01,
                                       f'{value:,.0f}', ha='center', va='bottom', fontsize=8, fontweight='bold')
            
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight', facecolor='white')
            img_buffer.seek(0)
            
            # Create ReportLab Image
            img = Image(img_buffer, width=width, height=height)
            
            plt.close(fig)
            
            return img
            
        except Exception as e:
            logger.error(f"Chart creation error: {e}")
            # Return placeholder
            return Paragraph(f"[Graphique {chart_type} - Erreur de génération]", getSampleStyleSheet()['Normal'])
    
    def _prepare_comprehensive_prompt(self, report_request: ReportRequest) -> str:
        """Prepare comprehensive prompt with all data for LLM"""
        prompt = f"""
Tu es un expert consultant en décarbonation d'entreprises. Génère un rapport professionnel détaillé de 5 pages en français pour cette entreprise.

DONNÉES DE L'ENTREPRISE:
- Nom: {report_request.company_info.name}
- Secteur: {report_request.company_info.sector}
- Effectif: {report_request.company_info.employees}
- Localisation: {report_request.company_info.location}
- Revenus: {report_request.company_info.revenue or 'Non renseigné'}

RÉSULTATS EMPREINTE CARBONE:
- Émissions totales: {report_request.emission_data.total_co2e:,.0f} kgCO₂e
- Scope 1 (directes): {report_request.emission_data.scope_1:,.0f} kgCO₂e ({(report_request.emission_data.scope_1/report_request.emission_data.total_co2e*100):.1f}%)
- Scope 2 (énergie): {report_request.emission_data.scope_2:,.0f} kgCO₂e ({(report_request.emission_data.scope_2/report_request.emission_data.total_co2e*100):.1f}%)
- Scope 3 (indirectes): {report_request.emission_data.scope_3:,.0f} kgCO₂e ({(report_request.emission_data.scope_3/report_request.emission_data.total_co2e*100):.1f}%)
- Intensité par employé: {report_request.emission_data.intensity_per_employee:.1f} kgCO₂e/employé
- Grade de durabilité: {report_request.emission_data.sustainability_grade}
- Score d'efficacité carbone: {report_request.emission_data.carbon_efficiency_score:.1f}/100

RÉPARTITION DÉTAILLÉE PAR CATÉGORIE:
"""
        
        # Add breakdown details
        if report_request.emission_data.breakdown:
            for category, value in sorted(report_request.emission_data.breakdown.items(), key=lambda x: x[1], reverse=True):
                pct = (value / report_request.emission_data.total_co2e * 100) if report_request.emission_data.total_co2e > 0 else 0
                prompt += f"- {category}: {value:,.0f} kgCO₂e ({pct:.1f}%)\n"
        
        # Add benchmark position
        prompt += f"""
POSITION SECTORIELLE:
{report_request.benchmark_position}

POTENTIEL DE RÉDUCTION:
"""
        
        if report_request.reduction_potential:
            for key, value in report_request.reduction_potential.items():
                prompt += f"- {key}: {value:,.0f} kgCO₂e\n"
        
        # Add trajectory 2030
        if report_request.emission_data.trajectory_2030:
            prompt += f"""
TRAJECTOIRE 2030:
"""
            for key, value in report_request.emission_data.trajectory_2030.items():
                prompt += f"- {key}: {value:,.0f} kgCO₂e\n"
        
        # Add equivalent metrics
        if report_request.equivalent_metrics:
            prompt += f"""
ÉQUIVALENCES IMPACT:
"""
            for key, value in report_request.equivalent_metrics.items():
                prompt += f"- {key}: {value:,.0f}\n"
        
        # Add cost of carbon
        if report_request.emission_data.cost_of_carbon:
            prompt += f"\nCoût carbone estimé (80€/tCO₂e): {report_request.emission_data.cost_of_carbon:,.0f} €\n"
        
        # Add certifications
        if report_request.emission_data.certification_readiness:
            prompt += f"\nÉLIGIBILITÉ CERTIFICATIONS:\n"
            for cert, ready in report_request.emission_data.certification_readiness.items():
                status = "Éligible" if ready else "À améliorer"
                prompt += f"- {cert.replace('_', ' ').title()}: {status}\n"
        
        # Add existing recommendations
        if report_request.recommendations:
            prompt += f"\nRECOMMANDATIONS EXISTANTES:\n"
            for i, rec in enumerate(report_request.recommendations, 1):
                prompt += f"{i}. {rec}\n"
        
        prompt += """
GÉNÈRE UN RAPPORT STRUCTURÉ EN 6 SECTIONS (en français, très détaillé):

1. RÉSUMÉ EXÉCUTIF (4-5 paragraphes)
   - Synthèse des résultats clés
   - Points forts et axes d'amélioration
   - Position sectorielle
   - Opportunités de réduction

2. ANALYSE DÉTAILLÉE DES ÉMISSIONS (5-6 paragraphes)
   - Analyse par scope (Scope 1, 2, 3)
   - Analyse par catégorie d'émissions
   - Points d'attention majeurs
   - Comparaison avec les moyennes sectorielles

3. INSIGHTS STRATÉGIQUES (4-5 paragraphes)
   - Analyse du grade de durabilité
   - Positionnement par rapport aux pairs
   - Potentiel de réduction identifié
   - Opportunités d'amélioration rapide (quick wins)

4. RECOMMANDATIONS DÉTAILLÉES (liste structurée)
   - Au moins 8-10 recommandations actionnables
   - Prioriser par impact et facilité de mise en œuvre
   - Indiquer le potentiel de réduction pour chacune

5. TRAJECTOIRE 2030 (3-4 paragraphes)
   - Analyse de la trajectoire de réduction
   - Objectifs réalistes et ambitieux
   - Feuille de route proposée
   - Jalons de progression

6. CONCLUSIONS (2-3 paragraphes)
   - Synthèse finale
   - Prochaines étapes recommandées
   - Vision à long terme

IMPORTANT:
- Sois très détaillé et professionnel
- Utilise des chiffres précis de l'analyse
- Propose des actions concrètes et mesurables
- Adopte un ton expert mais accessible
- Génère au minimum 1500-2000 mots au total
"""
        return prompt
    
    def _parse_llm_content(self, llm_content: str, report_request: ReportRequest) -> Dict[str, str]:
        """Parse LLM content into structured sections"""
        sections = {}
        
        # Try to extract sections by headers
        content_lower = llm_content.lower()
        
        # Executive summary
        exec_match = self._extract_section(llm_content, ["résumé exécutif", "résumé", "executive summary"])
        sections['executive_summary'] = exec_match if exec_match else self._generate_fallback_exec_summary(report_request)
        
        # Detailed analysis
        detailed_match = self._extract_section(llm_content, ["analyse détaillée", "analyse des émissions", "détail"])
        sections['detailed_analysis'] = detailed_match if detailed_match else self._generate_fallback_detailed_analysis(report_request)
        
        # Strategic insights
        insights_match = self._extract_section(llm_content, ["insights stratégiques", "analyse stratégique", "positionnement", "insights"])
        sections['strategic_insights'] = insights_match if insights_match else self._generate_fallback_insights(report_request)
        
        # Recommendations
        rec_match = self._extract_section(llm_content, ["recommandations", "recommandation", "actions recommandées"])
        if rec_match:
            sections['recommendations'] = rec_match
        else:
            sections['recommendations'] = report_request.recommendations
        
        # Action plan
        action_match = self._extract_section(llm_content, ["plan d'action", "feuille de route", "plan d'action prioritaire"])
        sections['action_plan'] = action_match if action_match else self._generate_fallback_action_plan(report_request)
        
        # Trajectory 2030
        traj_match = self._extract_section(llm_content, ["trajectoire 2030", "trajectoire", "2030"])
        sections['trajectory_2030'] = traj_match if traj_match else self._generate_fallback_trajectory(report_request)
        
        # Conclusions
        concl_match = self._extract_section(llm_content, ["conclusions", "conclusion", "synthèse finale"])
        sections['conclusions'] = concl_match if concl_match else self._generate_fallback_conclusions(report_request)
        
        return sections
    
    def _extract_section(self, content: str, keywords: List[str]) -> str:
        """Extract section content based on keywords"""
        content_lower = content.lower()
        
        for keyword in keywords:
            idx = content_lower.find(keyword.lower())
            if idx != -1:
                # Find the start of the section (after the header)
                start = content.find('\n', idx) + 1
                # Find the next major section or end
                end = len(content)
                next_sections = ["\n\n", "\n1.", "\n2.", "\n3.", "\n4.", "\n5.", "\n6.", "RÉSUMÉ", "ANALYSE", "RECOMMANDATIONS", "TRAJECTOIRE", "CONCLUSIONS"]
                for next_section in next_sections:
                    next_idx = content.lower().find(next_section.lower(), start)
                    if next_idx != -1 and next_idx < end:
                        end = next_idx
                
                section_content = content[start:end].strip()
                if len(section_content) > 100:  # Ensure meaningful content
                    return section_content
        
        return ""
    
    def _generate_fallback_content(self, report_request: ReportRequest) -> str:
        """Generate fallback content if LLM fails"""
        return f"""
RAPPORT D'EMPREINTE CARBONE - {report_request.company_info.name}

Ce rapport présente l'analyse détaillée de l'empreinte carbone de l'entreprise {report_request.company_info.name}, 
secteur {report_request.company_info.sector}, basée sur la méthodologie ADEME.
"""
    
    def _generate_fallback_exec_summary(self, report_request: ReportRequest) -> str:
        """Generate fallback executive summary"""
        return f"""
L'entreprise {report_request.company_info.name} présente une empreinte carbone totale de {report_request.emission_data.total_co2e:,.0f} kgCO₂e, 
soit {report_request.emission_data.intensity_per_employee:.1f} kgCO₂e par employé. La répartition montre que le Scope {1 if report_request.emission_data.scope_1 > report_request.emission_data.scope_2 and report_request.emission_data.scope_1 > report_request.emission_data.scope_3 else 2 if report_request.emission_data.scope_2 > report_request.emission_data.scope_3 else 3} 
représente la principale source d'émissions. Le grade de durabilité {report_request.emission_data.sustainability_grade} et le score d'efficacité 
de {report_request.emission_data.carbon_efficiency_score:.1f}/100 indiquent des opportunités significatives d'amélioration. 
{report_request.benchmark_position} Des actions prioritaires permettent d'engager une trajectoire de réduction ambitieuse.
"""
    
    def _generate_fallback_detailed_analysis(self, report_request: ReportRequest) -> str:
        """Generate fallback detailed analysis"""
        scope1_pct = (report_request.emission_data.scope_1 / report_request.emission_data.total_co2e * 100) if report_request.emission_data.total_co2e > 0 else 0
        scope2_pct = (report_request.emission_data.scope_2 / report_request.emission_data.total_co2e * 100) if report_request.emission_data.total_co2e > 0 else 0
        scope3_pct = (report_request.emission_data.scope_3 / report_request.emission_data.total_co2e * 100) if report_request.emission_data.total_co2e > 0 else 0
        
        return f"""
Les émissions sont réparties entre les trois scopes: Scope 1 ({scope1_pct:.1f}%), Scope 2 ({scope2_pct:.1f}%), et Scope 3 ({scope3_pct:.1f}%). 
{"Le Scope 1 représente les émissions directes issues des sources contrôlées par l'entreprise." if scope1_pct > 30 else ""}
{"Le Scope 2 concerne les émissions liées à la consommation d'énergie électrique." if scope2_pct > 30 else ""}
{"Le Scope 3 regroupe les autres émissions indirectes de la chaîne de valeur." if scope3_pct > 30 else ""}
L'analyse par catégorie révèle les principaux leviers d'action à prioriser.
"""
    
    def _generate_fallback_insights(self, report_request: ReportRequest) -> str:
        """Generate fallback insights"""
        return f"""
Le grade {report_request.emission_data.sustainability_grade} positionne l'entreprise dans {report_request.benchmark_position}. 
Le score d'efficacité carbone de {report_request.emission_data.carbon_efficiency_score:.1f}/100 offre une marge de progression significative. 
L'analyse comparative avec le secteur révèle des opportunités d'alignement avec les meilleures pratiques et des objectifs de réduction ambitieux.
"""
    
    def _generate_fallback_action_plan(self, report_request: ReportRequest) -> str:
        """Generate fallback action plan"""
        actions = []
        if report_request.recommendations:
            actions.extend(report_request.recommendations[:5])
        else:
            actions = [
                "Optimiser les consommations énergétiques",
                "Réduire les déplacements professionnels",
                "Améliorer l'efficacité des équipements",
                "Sensibiliser les équipes aux éco-gestes",
                "Évaluer les fournisseurs sur leur performance carbone"
            ]
        
        plan = "Plan d'action prioritaire:\n\n"
        for i, action in enumerate(actions, 1):
            plan += f"{i}. {action}\n"
        
        return plan
    
    def _generate_fallback_trajectory(self, report_request: ReportRequest) -> str:
        """Generate fallback trajectory"""
        if report_request.emission_data.trajectory_2030:
            target = report_request.emission_data.trajectory_2030.get('target_2030', report_request.emission_data.total_co2e * 0.5)
            reduction = ((report_request.emission_data.total_co2e - target) / report_request.emission_data.total_co2e * 100) if report_request.emission_data.total_co2e > 0 else 0
            return f"""
La trajectoire 2030 vise une réduction de {reduction:.0f}% des émissions, portant l'empreinte carbone à {target:,.0f} kgCO₂e. 
Cet objectif aligné avec les engagements climatiques internationaux nécessite une feuille de route structurée avec des jalons annuels 
et des actions prioritaires dès les 6 prochains mois.
"""
        return """
La trajectoire de réduction vers 2030 doit être définie avec des objectifs intermédiaires annuels et des actions concrètes 
priorisées par impact et facilité de mise en œuvre. Un suivi trimestriel permettra d'ajuster la stratégie selon les résultats obtenus.
"""
    
    def _generate_fallback_conclusions(self, report_request: ReportRequest) -> str:
        """Generate fallback conclusions"""
        return f"""
L'analyse de l'empreinte carbone de {report_request.company_info.name} révèle des opportunités significatives d'amélioration. 
Le grade {report_request.emission_data.sustainability_grade} et le potentiel de réduction identifié permettent d'engager une trajectoire 
ambitieuse vers la décarbonation. Les recommandations prioritaires doivent être mises en œuvre dès les prochains mois avec un suivi 
régulier des indicateurs clés. L'engagement de l'ensemble des parties prenantes est essentiel pour atteindre les objectifs de réduction.
"""
    
    async def generate_pdf_report_async(self, report_request: ReportRequest) -> bytes:
        """Generate comprehensive 5-page PDF report with LLM-generated content"""
        try:
            logger.info("Starting comprehensive PDF generation...")
            
            # Prepare comprehensive prompt for LLM with ALL data
            llm_prompt = self._prepare_comprehensive_prompt(report_request)
            
            # Call LLM API to generate detailed content
            logger.info("Calling LLM API for detailed content generation...")
            llm_content = await self.call_llm_api(llm_prompt, max_tokens=4000)
            
            if not llm_content:
                logger.warning("LLM API returned empty content, using fallback")
                llm_content = self._generate_fallback_content(report_request)
            
            # Parse LLM content into sections
            sections = self._parse_llm_content(llm_content, report_request)
            
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Create document with custom styles
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=1.5*cm,
                leftMargin=1.5*cm,
                topMargin=2*cm,
                bottomMargin=2*cm
            )
            
            # Get and customize styles
            styles = getSampleStyleSheet()
            
            # Create custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Title'],
                fontSize=24,
                textColor=HexColor('#2D5016'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            heading1_style = ParagraphStyle(
                'CustomHeading1',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=HexColor('#2D5016'),
                spaceAfter=12,
                spaceBefore=12,
                fontName='Helvetica-Bold'
            )
            
            heading2_style = ParagraphStyle(
                'CustomHeading2',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=HexColor('#45B7D1'),
                spaceAfter=10,
                spaceBefore=10,
                fontName='Helvetica-Bold'
            )
            
            body_style = ParagraphStyle(
                'CustomBody',
                parent=styles['BodyText'],
                fontSize=10,
                leading=14,
                spaceAfter=6,
                alignment=TA_JUSTIFY
            )
            
            # Build story
            story = []
            
            # ========== PAGE 1: COVER + EXECUTIVE SUMMARY ==========
            # Cover page title
            story.append(Spacer(1, 3*cm))
            story.append(Paragraph("RAPPORT D'EMPREINTE CARBONE", title_style))
            story.append(Spacer(1, 1*cm))
            story.append(Paragraph(f"<b>{report_request.company_info.name}</b>", heading1_style))
            story.append(Spacer(1, 0.5*cm))
            story.append(Paragraph(f"Secteur: {report_request.company_info.sector} | Effectif: {report_request.company_info.employees}", styles['Normal']))
            story.append(Paragraph(f"Localisation: {report_request.company_info.location}", styles['Normal']))
            story.append(Spacer(1, 1*cm))
            story.append(Paragraph(f"<i>Rapport généré le {datetime.now().strftime('%d %B %Y')}</i>", styles['Normal']))
            story.append(PageBreak())
            
            # Executive Summary
            story.append(Paragraph("RÉSUMÉ EXÉCUTIF", heading1_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Key metrics table
            key_metrics_data = [
                ['Indicateur', 'Valeur'],
                ['Empreinte carbone totale', f"{report_request.emission_data.total_co2e:,.0f} kgCO₂e"],
                ['Par employé', f"{report_request.emission_data.intensity_per_employee:.1f} kgCO₂e"],
                ['Grade de durabilité', f"{report_request.emission_data.sustainability_grade}"],
                ['Score d\'efficacité carbone', f"{report_request.emission_data.carbon_efficiency_score:.1f}/100"],
            ]
            
            if report_request.emission_data.cost_of_carbon:
                key_metrics_data.append(['Coût carbone estimé (80€/t)', f"{report_request.emission_data.cost_of_carbon:,.0f} €"])
            
            metrics_table = Table(key_metrics_data, colWidths=[8*cm, 8*cm])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2D5016')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F5F5F5')),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#CCCCCC')),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')]),
            ]))
            story.append(metrics_table)
            story.append(Spacer(1, 0.5*cm))
            
            # Executive summary text from LLM
            exec_summary = sections.get('executive_summary', self._generate_fallback_exec_summary(report_request))
            story.append(Paragraph(exec_summary.replace('\n', '<br/>'), body_style))
            story.append(PageBreak())
            
            # ========== PAGE 2: EMISSIONS BREAKDOWN WITH CHARTS ==========
            story.append(Paragraph("ANALYSE DÉTAILLÉE DES ÉMISSIONS", heading1_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Scope breakdown chart
            scope_chart = self.create_chart_image(
                "pie_scopes",
                {
                    'scope_1': report_request.emission_data.scope_1,
                    'scope_2': report_request.emission_data.scope_2,
                    'scope_3': report_request.emission_data.scope_3
                },
                "Répartition par Scope",
                width=500,
                height=400
            )
            story.append(scope_chart)
            story.append(Spacer(1, 0.5*cm))
            
            # Scope breakdown table
            scope_data = [
                ['Scope', 'Émissions (kgCO₂e)', 'Pourcentage'],
                ['Scope 1 - Émissions directes', f"{report_request.emission_data.scope_1:,.0f}", 
                 f"{(report_request.emission_data.scope_1/report_request.emission_data.total_co2e*100):.1f}%"],
                ['Scope 2 - Énergie indirecte', f"{report_request.emission_data.scope_2:,.0f}",
                 f"{(report_request.emission_data.scope_2/report_request.emission_data.total_co2e*100):.1f}%"],
                ['Scope 3 - Autres indirectes', f"{report_request.emission_data.scope_3:,.0f}",
                 f"{(report_request.emission_data.scope_3/report_request.emission_data.total_co2e*100):.1f}%"],
                ['<b>TOTAL</b>', f"<b>{report_request.emission_data.total_co2e:,.0f}</b>", '<b>100%</b>']
            ]
            
            scope_table = Table(scope_data, colWidths=[7*cm, 5*cm, 4*cm])
            scope_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#45B7D1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), HexColor('#F5F5F5')),
                ('BACKGROUND', (0, -1), (-1, -1), HexColor('#E0E0E0')),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#CCCCCC')),
            ]))
            story.append(scope_table)
            story.append(Spacer(1, 0.5*cm))
            
            # Category breakdown chart
            if report_request.emission_data.breakdown:
                category_chart = self.create_chart_image(
                    "bar_breakdown",
                    report_request.emission_data.breakdown,
                    "Répartition par Catégorie d'Émissions",
                    width=500,
                    height=400
                )
                story.append(category_chart)
                story.append(Spacer(1, 0.3*cm))
            
            # Detailed analysis text
            detailed_analysis = sections.get('detailed_analysis', self._generate_fallback_detailed_analysis(report_request))
            story.append(Paragraph(detailed_analysis.replace('\n', '<br/>'), body_style))
            story.append(PageBreak())
            
            # ========== PAGE 3: ANALYSIS & INSIGHTS ==========
            story.append(Paragraph("ANALYSE STRATÉGIQUE ET POSITIONNEMENT", heading1_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Grade visualization
            grade_chart = self.create_chart_image(
                "grade_gauge",
                {'grade': report_request.emission_data.sustainability_grade},
                "Grade de Durabilité",
                width=400,
                height=300
            )
            story.append(grade_chart)
            story.append(Spacer(1, 0.3*cm))
            
            # Benchmark position
            story.append(Paragraph("Position Sectorielle", heading2_style))
            story.append(Paragraph(f"<b>{report_request.benchmark_position}</b>", body_style))
            story.append(Spacer(1, 0.3*cm))
            
            # Peer comparison
            if report_request.emission_data.peer_comparison:
                story.append(Paragraph("Comparaison avec les Pairs", heading2_style))
                peer_text = ""
                for key, value in report_request.emission_data.peer_comparison.items():
                    peer_text += f"• {key}: {value:,.0f} kgCO₂e<br/>"
                story.append(Paragraph(peer_text, body_style))
                story.append(Spacer(1, 0.3*cm))
            
            # Reduction potential chart
            if report_request.reduction_potential:
                reduction_chart = self.create_chart_image(
                    "reduction_potential",
                    report_request.reduction_potential,
                    "Potentiel de Réduction par Horizon",
                    width=500,
                    height=350
                )
                story.append(reduction_chart)
                story.append(Spacer(1, 0.3*cm))
            
            # Strategic insights
            insights = sections.get('strategic_insights', self._generate_fallback_insights(report_request))
            story.append(Paragraph(insights.replace('\n', '<br/>'), body_style))
            story.append(Spacer(1, 0.3*cm))
            
            # Equivalent metrics
            if report_request.equivalent_metrics:
                story.append(Paragraph("Équivalences Impact", heading2_style))
                equiv_text = ""
                if 'trees_to_plant' in report_request.equivalent_metrics:
                    equiv_text += f"• Arbres à planter pour compenser: {report_request.equivalent_metrics['trees_to_plant']:,.0f}<br/>"
                if 'cars_off_road' in report_request.equivalent_metrics:
                    equiv_text += f"• Voitures retirées de la route (1 an): {report_request.equivalent_metrics['cars_off_road']:,.0f}<br/>"
                if 'flights_paris_ny' in report_request.equivalent_metrics:
                    equiv_text += f"• Vols Paris-New York équivalents: {report_request.equivalent_metrics['flights_paris_ny']:,.0f}<br/>"
                story.append(Paragraph(equiv_text, body_style))
            story.append(PageBreak())
            
            # ========== PAGE 4: RECOMMENDATIONS & ACTION PLAN ==========
            story.append(Paragraph("RECOMMANDATIONS ET PLAN D'ACTION", heading1_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Recommendations from LLM
            recommendations = sections.get('recommendations', report_request.recommendations)
            
            if isinstance(recommendations, str):
                story.append(Paragraph(recommendations.replace('\n', '<br/>'), body_style))
            else:
                for i, rec in enumerate(recommendations[:10], 1):  # Limit to 10 recommendations
                    story.append(Paragraph(f"<b>Recommandation {i}:</b> {rec}", body_style))
                    story.append(Spacer(1, 0.3*cm))
            
            story.append(Spacer(1, 0.5*cm))
            
            # Action plan table
            action_plan = sections.get('action_plan', self._generate_fallback_action_plan(report_request))
            story.append(Paragraph("Plan d'Action Prioritaire", heading2_style))
            story.append(Paragraph(action_plan.replace('\n', '<br/>'), body_style))
            story.append(Spacer(1, 0.3*cm))
            
            # Certification readiness
            if report_request.emission_data.certification_readiness:
                story.append(Paragraph("Éligibilité Certifications", heading2_style))
                cert_text = ""
                for cert, ready in report_request.emission_data.certification_readiness.items():
                    status = "✓ Éligible" if ready else "○ À améliorer"
                    cert_text += f"• {cert.replace('_', ' ').title()}: {status}<br/>"
                story.append(Paragraph(cert_text, body_style))
            story.append(PageBreak())
            
            # ========== PAGE 5: TRAJECTORY 2030 & APPENDICES ==========
            story.append(Paragraph("TRAJECTOIRE 2030 ET CONCLUSIONS", heading1_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Trajectory 2030 chart
            if report_request.emission_data.trajectory_2030:
                trajectory_data = {
                    'current': report_request.emission_data.total_co2e,
                    **report_request.emission_data.trajectory_2030
                }
                trajectory_chart = self.create_chart_image(
                    "trajectory_2030",
                    trajectory_data,
                    "Trajectoire de Réduction 2024-2030",
                    width=500,
                    height=350
                )
                story.append(trajectory_chart)
                story.append(Spacer(1, 0.3*cm))
            
            # Monthly breakdown if available
            if report_request.emission_data.monthly_breakdown:
                monthly_chart = self.create_chart_image(
                    "monthly_breakdown",
                    report_request.emission_data.monthly_breakdown,
                    "Répartition Mensuelle des Émissions",
                    width=500,
                    height=300
                )
                story.append(monthly_chart)
                story.append(Spacer(1, 0.3*cm))
            
            # Trajectory analysis
            trajectory_text = sections.get('trajectory_2030', self._generate_fallback_trajectory(report_request))
            story.append(Paragraph(trajectory_text.replace('\n', '<br/>'), body_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Conclusions
            conclusions = sections.get('conclusions', self._generate_fallback_conclusions(report_request))
            story.append(Paragraph("Conclusions", heading2_style))
            story.append(Paragraph(conclusions.replace('\n', '<br/>'), body_style))
            story.append(Spacer(1, 0.5*cm))
            
            # Footer
            story.append(Spacer(1, 1*cm))
            story.append(Paragraph(f"<i>Rapport généré par CarbonScore le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</i>", 
                                  ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, 
                                               textColor=HexColor('#666666'), alignment=TA_CENTER)))
            
            logger.info("Building PDF document...")
            doc.build(story)
            
            # Get PDF bytes
            buffer.seek(0)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            logger.info(f"PDF generated successfully, size: {len(pdf_bytes)} bytes")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"PDF generation error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
    
    def generate_pdf_report(self, report_request: ReportRequest) -> bytes:
        """Synchronous wrapper for async PDF generation"""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self.generate_pdf_report_async(report_request))

# Initialize PDF service
pdf_service = PDFService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CarbonScore PDF Service",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/pdf/generate")
async def generate_pdf(report_request: ReportRequest):
    """Generate PDF report"""
    try:
        logger.info(f"Generating PDF report for {report_request.company_info.name}")
        
        # Generate PDF using async method
        pdf_bytes = await pdf_service.generate_pdf_report_async(report_request)
        
        # Generate unique filename (sanitize company name)
        generated_time = datetime.now()
        timestamp = generated_time.strftime("%Y%m%d_%H%M%S")
        safe_company_name = "".join(c for c in report_request.company_info.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_company_name = safe_company_name.replace(' ', '_')[:20]  # Limit length
        filename = f"rapport_carbone_{safe_company_name}_{timestamp}.pdf"
        
        # Save to file
        pdf_path = pdf_service.reports_dir / filename
        with open(pdf_path, 'wb') as f:
            f.write(pdf_bytes)

        metadata = _create_metadata_from_request(report_request, filename, len(pdf_bytes), generated_time)
        _register_report_metadata(pdf_service.reports_dir, metadata)
        
        logger.info(f"PDF report generated successfully: {filename}")
        
        return {
            "status": "success",
            "filename": filename,
            "file_path": str(pdf_path),
            "size_bytes": len(pdf_bytes),
            "generated_at": generated_time.isoformat()
        }
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@app.get("/api/v1/pdf/reports")
async def list_reports():
    """Return metadata for all generated reports."""
    try:
        reports = _load_reports_metadata(pdf_service.reports_dir)
        return {"reports": reports}
    except Exception as exc:
        logger.error("Failed to list reports: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to list reports")

@app.get("/api/v1/pdf/{filename}")
async def download_pdf(filename: str):
    """Download PDF report"""
    try:
        pdf_path = pdf_service.reports_dir / filename
        
        if not pdf_path.exists():
            raise HTTPException(status_code=404, detail="PDF not found")
        
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"PDF download error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8020,
        reload=True,
        log_level="info"
    )
