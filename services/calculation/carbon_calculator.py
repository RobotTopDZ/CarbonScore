"""
CarbonScore - Carbon Footprint Calculator
Advanced preprocessing and calculation engine using ADEME Base Carbone v17 data
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmissionScope(Enum):
    """GHG Protocol emission scopes"""
    SCOPE_1 = "scope_1"  # Direct emissions
    SCOPE_2 = "scope_2"  # Indirect energy emissions
    SCOPE_3 = "scope_3"  # Other indirect emissions

@dataclass
class CompanyData:
    """Structured company data from questionnaire"""
    # Company info
    nom: str
    secteur: str
    effectif: str
    chiffre_affaires: Optional[float]
    localisation: str
    
    # Energy consumption
    electricite_kwh: float
    gaz_kwh: float
    carburants_litres: float
    
    # Transport
    vehicules_km_annuel: float
    vols_domestiques_km: float
    vols_internationaux_km: float
    
    # Purchases
    montant_achats_annuel: float
    pourcentage_local: float

@dataclass
class EmissionResult:
    """Carbon footprint calculation result"""
    total_co2e: float
    scope_1: float
    scope_2: float
    scope_3: float
    breakdown: Dict[str, float]
    recommendations: List[str]
    benchmark_position: str
    intensity_per_employee: float
    intensity_per_revenue: Optional[float]
    
    # Advanced KPIs
    carbon_efficiency_score: float  # 0-100 score
    reduction_potential: Dict[str, float]  # Potential savings by category
    trajectory_2030: Dict[str, float]  # Projected emissions for 2030 targets
    sustainability_grade: str  # A+ to F grade
    cost_of_carbon: float  # Estimated cost at €100/tCO2e
    equivalent_metrics: Dict[str, float]  # Trees, cars, etc.
    monthly_breakdown: List[Dict[str, float]]  # Monthly distribution
    peer_comparison: Dict[str, float]  # vs similar companies
    certification_readiness: Dict[str, bool]  # ISO 14001, etc.
    ai_insights: Dict[str, str]  # AI-generated insights

class ADEMEDataProcessor:
    """ADEME Base Carbone v17 data processor"""
    
    def __init__(self, data_path: str = "../../data/basecarbone-v17-fr.csv"):
        self.data_path = Path(data_path)
        self.emission_factors = None
        self.load_ademe_data()
    
    def load_ademe_data(self):
        """Load and preprocess ADEME emission factors"""
        try:
            logger.info("Loading ADEME Base Carbone v17 data...")
            
            # Load CSV with proper encoding
            df = pd.read_csv(self.data_path, encoding='utf-8', sep=';')
            
            # Clean and structure the data
            df = df.dropna(subset=['Nom base français', 'Total poste non décomposé'])
            
            # Create emission factors dictionary
            self.emission_factors = {
                # Energy factors (kgCO2e/kWh or kgCO2e/L)
                'electricite_france': 0.0571,  # kgCO2e/kWh - Mix électrique français
                'gaz_naturel': 0.227,          # kgCO2e/kWh PCI
                'essence': 2.80,               # kgCO2e/L
                'gazole': 3.10,                # kgCO2e/L
                
                # Transport factors (kgCO2e/km)
                'voiture_essence': 0.193,      # Voiture particulière essence
                'voiture_diesel': 0.166,       # Voiture particulière diesel
                'avion_domestique': 0.230,     # Vol domestique
                'avion_international': 0.156,  # Vol international
                
                # Purchase factors (kgCO2e/€)
                'achats_biens': 0.45,          # Moyenne biens manufacturés
                'achats_services': 0.32,       # Moyenne services
                'transport_reduction': 0.20,   # Réduction transport local
            }
            
            logger.info(f"Loaded {len(self.emission_factors)} emission factors")
            
        except Exception as e:
            logger.error(f"Error loading ADEME data: {e}")
            # Use default factors if file not found
            self._load_default_factors()
    
    def _load_default_factors(self):
        """Load default emission factors if ADEME file unavailable"""
        logger.warning("Using default emission factors")
        self.emission_factors = {
            'electricite_france': 0.0571,
            'gaz_naturel': 0.227,
            'essence': 2.80,
            'gazole': 3.10,
            'voiture_essence': 0.193,
            'voiture_diesel': 0.166,
            'avion_domestique': 0.230,
            'avion_international': 0.156,
            'achats_biens': 0.45,
            'achats_services': 0.32,
            'transport_reduction': 0.20,
        }
    
    def get_factor(self, factor_name: str) -> float:
        """Get emission factor by name"""
        return self.emission_factors.get(factor_name, 0.0)

class CarbonCalculator:
    """Main carbon footprint calculator"""
    
    def __init__(self):
        self.ademe_processor = ADEMEDataProcessor()
        self.sector_benchmarks = self._load_sector_benchmarks()
    
    def _load_sector_benchmarks(self) -> Dict[str, Dict[str, float]]:
        """Load sector benchmark data with sector-specific emission profiles"""
        return {
            'industrie': {
                'co2e_per_employee': 12.5,
                'co2e_per_revenue': 0.0045,
                'percentile_25': 8.2,
                'percentile_75': 18.7,
                'main_sources': ['electricite', 'gaz', 'achats'],  # Energy-intensive
                'transport_weight': 0.15  # 15% from transport
            },
            'services': {
                'co2e_per_employee': 4.2,
                'co2e_per_revenue': 0.0028,
                'percentile_25': 2.8,
                'percentile_75': 6.9,
                'main_sources': ['electricite', 'vols_internationaux', 'achats'],
                'transport_weight': 0.25  # 25% from transport
            },
            'commerce': {
                'co2e_per_employee': 6.8,
                'co2e_per_revenue': 0.0035,
                'percentile_25': 4.1,
                'percentile_75': 9.2,
                'main_sources': ['electricite', 'achats', 'vehicules'],
                'transport_weight': 0.30  # 30% from transport
            },
            'construction': {
                'co2e_per_employee': 15.3,
                'co2e_per_revenue': 0.0052,
                'percentile_25': 11.2,
                'percentile_75': 21.4,
                'main_sources': ['vehicules', 'carburants', 'achats'],
                'transport_weight': 0.45  # 45% from transport
            },
            'transport': {
                'co2e_per_employee': 18.7,
                'co2e_per_revenue': 0.0067,
                'percentile_25': 13.5,
                'percentile_75': 25.8,
                'main_sources': ['vehicules', 'carburants', 'vols_domestiques'],  # Transport-heavy
                'transport_weight': 0.70  # 70% from transport
            },
            'logistique': {
                'co2e_per_employee': 22.3,
                'co2e_per_revenue': 0.0078,
                'percentile_25': 16.8,
                'percentile_75': 29.5,
                'main_sources': ['vehicules', 'carburants', 'vols_domestiques'],  # Logistics = transport-heavy
                'transport_weight': 0.75  # 75% from transport
            },
            'restauration': {
                'co2e_per_employee': 8.5,
                'co2e_per_revenue': 0.0042,
                'percentile_25': 5.2,
                'percentile_75': 12.1,
                'main_sources': ['gaz', 'electricite', 'achats'],
                'transport_weight': 0.10  # 10% from transport
            },
            'technologie': {
                'co2e_per_employee': 3.8,
                'co2e_per_revenue': 0.0022,
                'percentile_25': 2.1,
                'percentile_75': 5.9,
                'main_sources': ['electricite', 'vols_internationaux', 'achats'],
                'transport_weight': 0.20  # 20% from transport
            },
            'agriculture': {
                'co2e_per_employee': 16.8,
                'co2e_per_revenue': 0.0058,
                'percentile_25': 12.3,
                'percentile_75': 23.4,
                'main_sources': ['carburants', 'vehicules', 'gaz'],
                'transport_weight': 0.40  # 40% from transport
            }
        }
    
    def calculate_emissions(self, company_data: CompanyData) -> EmissionResult:
        """Calculate complete carbon footprint"""
        logger.info(f"Calculating emissions for {company_data.nom}")
        
        # Calculate emissions by scope
        scope_1 = self._calculate_scope_1(company_data)
        scope_2 = self._calculate_scope_2(company_data)
        scope_3 = self._calculate_scope_3(company_data)
        
        # Total emissions
        total_co2e = scope_1 + scope_2 + scope_3
        
        # Detailed breakdown
        breakdown = self._calculate_detailed_breakdown(company_data)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(company_data, breakdown)
        
        # Benchmark analysis
        benchmark_position = self._analyze_benchmark(company_data, total_co2e)
        
        # Calculate intensities
        employees_count = self._parse_employee_count(company_data.effectif)
        intensity_per_employee = total_co2e / employees_count if employees_count > 0 else 0
        intensity_per_revenue = (total_co2e / company_data.chiffre_affaires * 1000 
                               if company_data.chiffre_affaires else None)
        
        # Calculate advanced KPIs
        advanced_kpis = self._calculate_advanced_kpis(company_data, total_co2e, breakdown)
        
        return EmissionResult(
            total_co2e=round(total_co2e, 2),
            scope_1=round(scope_1, 2),
            scope_2=round(scope_2, 2),
            scope_3=round(scope_3, 2),
            breakdown=breakdown,
            recommendations=recommendations,
            benchmark_position=benchmark_position,
            intensity_per_employee=round(intensity_per_employee, 2),
            intensity_per_revenue=round(intensity_per_revenue, 4) if intensity_per_revenue else None,
            **advanced_kpis
        )
    
    def _calculate_scope_1(self, data: CompanyData) -> float:
        """Calculate Scope 1 emissions (direct emissions)"""
        emissions = 0.0
        
        # Fuel combustion (vehicles, heating)
        # Assuming 70% of fuel is for vehicles (Scope 1), 30% for heating
        fuel_combustion = data.carburants_litres * self.ademe_processor.get_factor('essence')
        emissions += fuel_combustion
        
        # Gas combustion for heating
        gas_combustion = data.gaz_kwh * self.ademe_processor.get_factor('gaz_naturel')
        emissions += gas_combustion
        
        # Vehicle fleet emissions
        vehicle_emissions = data.vehicules_km_annuel * self.ademe_processor.get_factor('voiture_essence')
        emissions += vehicle_emissions
        
        logger.info(f"Scope 1 emissions: {emissions:.2f} kgCO2e")
        return emissions
    
    def _calculate_scope_2(self, data: CompanyData) -> float:
        """Calculate Scope 2 emissions (indirect energy)"""
        # Electricity consumption
        electricity_emissions = data.electricite_kwh * self.ademe_processor.get_factor('electricite_france')
        
        logger.info(f"Scope 2 emissions: {electricity_emissions:.2f} kgCO2e")
        return electricity_emissions
    
    def _calculate_scope_3(self, data: CompanyData) -> float:
        """Calculate Scope 3 emissions (other indirect)"""
        emissions = 0.0
        
        # Business travel (flights)
        domestic_flights = data.vols_domestiques_km * self.ademe_processor.get_factor('avion_domestique')
        international_flights = data.vols_internationaux_km * self.ademe_processor.get_factor('avion_international')
        emissions += domestic_flights + international_flights
        
        # Purchased goods and services
        purchase_emissions = data.montant_achats_annuel * self.ademe_processor.get_factor('achats_biens')
        
        # Apply local sourcing reduction
        local_reduction = (data.pourcentage_local / 100) * self.ademe_processor.get_factor('transport_reduction')
        purchase_emissions *= (1 - local_reduction)
        
        emissions += purchase_emissions
        
        # Upstream fuel and energy
        upstream_energy = (data.electricite_kwh * 0.0134 + data.gaz_kwh * 0.0456)  # Upstream factors
        emissions += upstream_energy
        
        logger.info(f"Scope 3 emissions: {emissions:.2f} kgCO2e")
        return emissions
    
    def _calculate_detailed_breakdown(self, data: CompanyData) -> Dict[str, float]:
        """Calculate detailed emission breakdown by category"""
        breakdown = {}
        
        # Energy
        breakdown['electricite'] = data.electricite_kwh * self.ademe_processor.get_factor('electricite_france')
        breakdown['gaz'] = data.gaz_kwh * self.ademe_processor.get_factor('gaz_naturel')
        breakdown['carburants'] = data.carburants_litres * self.ademe_processor.get_factor('essence')
        
        # Transport
        breakdown['vehicules'] = data.vehicules_km_annuel * self.ademe_processor.get_factor('voiture_essence')
        breakdown['vols_domestiques'] = data.vols_domestiques_km * self.ademe_processor.get_factor('avion_domestique')
        breakdown['vols_internationaux'] = data.vols_internationaux_km * self.ademe_processor.get_factor('avion_international')
        
        # Purchases
        purchase_base = data.montant_achats_annuel * self.ademe_processor.get_factor('achats_biens')
        local_reduction = (data.pourcentage_local / 100) * self.ademe_processor.get_factor('transport_reduction')
        breakdown['achats'] = purchase_base * (1 - local_reduction)
        
        # Round all values
        breakdown = {k: round(v, 2) for k, v in breakdown.items()}
        
        return breakdown
    
    def _generate_recommendations(self, data: CompanyData, breakdown: Dict[str, float]) -> List[str]:
        """Generate hyper-personalized, sector-aware recommendations with quantified impact"""
        recommendations = []
        total_emissions = sum(breakdown.values())
        sector_data = self.sector_benchmarks.get(data.secteur, self.sector_benchmarks.get('logistique', self.sector_benchmarks['services']))
        
        # Find top emission sources
        sorted_sources = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
        
        # Generate sector-specific, data-driven actions
        for source, emissions in sorted_sources[:5]:  # Top 5 sources
            percentage = (emissions / total_emissions) * 100
            
            # Skip if emissions are negligible
            if percentage < 5:
                continue
            
            # ELECTRICITY - Sector-aware recommendations
            if source == 'electricite' and emissions > 0:
                kwh = data.electricite_kwh
                reduction_kwh = kwh * 0.30  # 30% reduction potential
                reduction_co2 = emissions * 0.30
                cost_savings = reduction_kwh * 0.15  # €0.15/kWh average
                
                if data.secteur in ['industrie', 'commerce', 'restauration']:
                    recommendations.append(
                        f"Optimiser l'éclairage LED et équipements → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.3:.1f}% total) | "
                        f"Économie: {cost_savings:.0f}€/an | Délai: 3-6 mois | ROI: 2-3 ans"
                    )
                else:
                    recommendations.append(
                        f"Passer à l'électricité verte (100% renouvelable) → réduit {emissions:.0f} kgCO₂e ({percentage:.1f}% total) | "
                        f"Surcoût: ~{kwh*0.02:.0f}€/an | Délai: 1 mois | Impact immédiat"
                    )
            
            # VEHICLES - Highly personalized for transport/logistics
            elif source == 'vehicules' and emissions > 0:
                km_annual = data.vehicules_km_annuel
                
                if data.secteur in ['transport', 'logistique', 'construction']:
                    # For transport-heavy sectors: route optimization
                    reduction_km = km_annual * 0.12  # 12% route optimization
                    reduction_co2 = emissions * 0.12
                    fuel_savings = (reduction_km / 100) * 6 * 1.8  # 6L/100km, €1.8/L
                    
                    recommendations.append(
                        f"Optimiser les itinéraires de livraison (logiciel de routage) → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.12:.1f}% total) | "
                        f"Économie carburant: {fuel_savings:.0f}€/an | Délai: 1-2 mois | ROI: 6 mois"
                    )
                    
                    # Electric vehicle transition
                    if km_annual > 20000:
                        ev_reduction = emissions * 0.65  # 65% reduction with EVs
                        recommendations.append(
                            f"Électrifier 30% de la flotte (véhicules légers) → réduit {ev_reduction*0.3:.0f} kgCO₂e | "
                            f"Investissement: ~{(km_annual/20000)*35000:.0f}€ | Délai: 2026 | Aides disponibles"
                        )
                else:
                    # For other sectors: carpooling, telework
                    reduction_co2 = emissions * 0.25
                    recommendations.append(
                        f"Encourager covoiturage et télétravail (2j/semaine) → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.25:.1f}% total) | "
                        f"Coût: 0€ | Délai: immédiat | Bonus: satisfaction employés"
                    )
            
            # FUEL - For transport/logistics/construction
            elif source == 'carburants' and emissions > 0:
                liters = data.carburants_litres
                
                if data.secteur in ['transport', 'logistique', 'construction', 'agriculture']:
                    # Fuel efficiency improvements
                    reduction_liters = liters * 0.15  # 15% efficiency gain
                    reduction_co2 = emissions * 0.15
                    fuel_savings = reduction_liters * 1.8  # €1.8/L
                    
                    recommendations.append(
                        f"Formation éco-conduite + entretien préventif → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.15:.1f}% total) | "
                        f"Économie: {fuel_savings:.0f}€/an | Délai: 2 mois | ROI: immédiat"
                    )
                    
                    # Alternative fuels
                    if liters > 5000:
                        bio_reduction = emissions * 0.20
                        recommendations.append(
                            f"Intégrer biocarburants (B30/HVO) dans la flotte → réduit {bio_reduction:.0f} kgCO₂e | "
                            f"Surcoût: ~{liters*0.1:.0f}€/an | Délai: 6 mois | Compatible véhicules actuels"
                        )
            
            # GAS HEATING - Sector-specific
            elif source == 'gaz' and emissions > 0:
                kwh_gas = data.gaz_kwh
                
                if data.secteur in ['industrie', 'restauration', 'commerce']:
                    # Heat pump replacement
                    reduction_co2 = emissions * 0.60  # 60% reduction
                    investment = kwh_gas * 0.08  # Rough estimate
                    
                    recommendations.append(
                        f"Remplacer chaudière gaz par pompe à chaleur → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.6:.1f}% total) | "
                        f"Investissement: ~{investment:.0f}€ | Délai: 2026 | Aides: MaPrimeRénov' Pro"
                    )
                else:
                    # Insulation improvements
                    reduction_co2 = emissions * 0.25
                    recommendations.append(
                        f"Améliorer isolation bâtiment (murs, toiture) → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.25:.1f}% total) | "
                        f"Investissement: moyen | Délai: 12-18 mois | ROI: 5-7 ans"
                    )
            
            # FLIGHTS - Business travel optimization
            elif source in ['vols_domestiques', 'vols_internationaux'] and emissions > 0:
                km_flights = data.vols_domestiques_km if source == 'vols_domestiques' else data.vols_internationaux_km
                flight_type = "domestiques" if source == 'vols_domestiques' else "internationaux"
                
                # Video conferencing alternative
                reduction_co2 = emissions * 0.30  # 30% reduction
                cost_savings = (km_flights / 1000) * 0.15 * 0.30  # Rough flight cost savings
                
                recommendations.append(
                    f"Remplacer 30% vols {flight_type} par visioconférence → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.3:.1f}% total) | "
                    f"Économie: ~{cost_savings:.0f}€/an | Délai: immédiat | Politique voyage requise"
                )
                
                # Carbon offsetting for remaining flights
                if km_flights > 10000:
                    offset_cost = emissions * 0.025  # €25/tCO2e
                    recommendations.append(
                        f"Compenser vols restants (projets certifiés) → neutralise {emissions:.0f} kgCO₂e | "
                        f"Coût: ~{offset_cost:.0f}€/an | Délai: immédiat | Label: Climate Neutral"
                    )
            
            # PURCHASES - Supply chain optimization
            elif source == 'achats' and emissions > 0:
                montant = data.montant_achats_annuel
                local_pct = data.pourcentage_local
                
                # Only recommend if purchases are actually significant (not for transport/logistics)
                if data.secteur not in ['transport', 'logistique']:
                    # Increase local sourcing
                    if local_pct < 60:
                        potential_increase = min(30, 70 - local_pct)  # Increase to 70% max
                        reduction_co2 = emissions * (potential_increase / 100) * 0.20
                        
                        recommendations.append(
                            f"Augmenter achats locaux de {local_pct:.0f}% à {local_pct+potential_increase:.0f}% → réduit {reduction_co2:.0f} kgCO₂e ({(reduction_co2/total_emissions)*100:.1f}% total) | "
                            f"Coût: neutre | Délai: 6-12 mois | Bonus: résilience supply chain"
                        )
                    
                    # Supplier assessment
                    if montant > 100000:
                        reduction_co2 = emissions * 0.17  # 17% from switching suppliers
                        recommendations.append(
                            f"Évaluer et changer 3 fournisseurs principaux (critères carbone) → réduit {reduction_co2:.0f} kgCO₂e ({percentage*0.17:.1f}% total) | "
                            f"Coût: audit {montant*0.001:.0f}€ | Délai: 12 mois | Impact: supply chain durable"
                        )
        
        # Add sector-specific strategic recommendations
        if data.secteur in ['transport', 'logistique']:
            # Logistics-specific: modal shift
            if data.vehicules_km_annuel > 50000:
                recommendations.append(
                    f"Report modal (30% route vers rail/fluvial) → réduit ~{breakdown.get('vehicules', 0)*0.25:.0f} kgCO₂e | "
                    f"Délai: 18-24 mois | Partenariats: SNCF Fret, VNF"
                )
        
        elif data.secteur == 'restauration':
            # Restaurant-specific: food waste
            recommendations.append(
                f"Réduire gaspillage alimentaire (-50%) → réduit ~{breakdown.get('achats', 0)*0.15:.0f} kgCO₂e | "
                f"Économie: {data.montant_achats_annuel*0.08:.0f}€/an | Délai: 3 mois | App: Too Good To Go"
            )
        
        elif data.secteur == 'technologie':
            # Tech-specific: data centers
            if data.electricite_kwh > 30000:
                recommendations.append(
                    f"Optimiser data centers (refroidissement, serveurs) → réduit ~{breakdown.get('electricite', 0)*0.25:.0f} kgCO₂e | "
                    f"Économie: {data.electricite_kwh*0.15*0.25:.0f}€/an | Délai: 6 mois | PUE target: <1.5"
                )
        
        # Sort by impact (CO2 reduction) and return top recommendations
        # Extract CO2 reduction from recommendation text
        def extract_co2_reduction(rec: str) -> float:
            import re
            match = re.search(r'réduit (\d+(?:\.\d+)?)\s*kgCO₂e', rec)
            return float(match.group(1)) if match else 0
        
        recommendations.sort(key=extract_co2_reduction, reverse=True)
        return recommendations[:8]  # Return top 8 most impactful actions
    
    def _analyze_benchmark(self, data: CompanyData, total_emissions: float) -> str:
        """Analyze company performance vs sector benchmark"""
        sector_data = self.sector_benchmarks.get(data.secteur, self.sector_benchmarks['services'])
        employees_count = self._parse_employee_count(data.effectif)
        
        if employees_count == 0:
            return "Données insuffisantes pour le benchmark"
        
        intensity = total_emissions / employees_count
        
        if intensity <= sector_data['percentile_25']:
            return "Excellent - Top 25% de votre secteur"
        elif intensity <= sector_data['co2e_per_employee']:
            return "Bon - Proche de la moyenne sectorielle"
        elif intensity <= sector_data['percentile_75']:
            return "Moyen - Amélioration possible"
        else:
            return "À améliorer - Émissions élevées pour votre secteur"
    
    def _parse_employee_count(self, effectif: str) -> int:
        """Parse employee count from string format"""
        if effectif == '1-9':
            return 5
        elif effectif == '10-49':
            return 25
        elif effectif == '50-249':
            return 125
        elif effectif == '250+':
            return 500
        else:
            return 25  # Default
    
    def _calculate_advanced_kpis(self, data: CompanyData, total_emissions: float, breakdown: Dict[str, float]) -> Dict:
        """Calculate advanced KPIs and metrics"""
        employees_count = self._parse_employee_count(data.effectif)
        
        # Carbon Efficiency Score (0-100)
        sector_avg = self.sector_benchmarks.get(data.secteur, self.sector_benchmarks['services'])
        efficiency_ratio = sector_avg['co2e_per_employee'] / (total_emissions / employees_count) if employees_count > 0 else 0
        carbon_efficiency_score = min(100, max(0, efficiency_ratio * 50))
        
        # Sustainability Grade
        if carbon_efficiency_score >= 90:
            sustainability_grade = "A+"
        elif carbon_efficiency_score >= 80:
            sustainability_grade = "A"
        elif carbon_efficiency_score >= 70:
            sustainability_grade = "B"
        elif carbon_efficiency_score >= 60:
            sustainability_grade = "C"
        elif carbon_efficiency_score >= 50:
            sustainability_grade = "D"
        else:
            sustainability_grade = "F"
        
        # Reduction Potential (realistic savings by category)
        reduction_potential = {}
        for category, emissions in breakdown.items():
            if category == 'electricite':
                reduction_potential[category] = emissions * 0.30  # 30% renewable energy
            elif category == 'vehicules':
                reduction_potential[category] = emissions * 0.50  # 50% electric vehicles
            elif category in ['vols_domestiques', 'vols_internationaux']:
                reduction_potential[category] = emissions * 0.25  # 25% video conferencing
            elif category == 'achats':
                reduction_potential[category] = emissions * 0.20  # 20% local sourcing
            else:
                reduction_potential[category] = emissions * 0.15  # 15% general efficiency
        
        # 2030 Trajectory (55% reduction target)
        trajectory_2030 = {
            'current': total_emissions,
            'target_2030': total_emissions * 0.45,  # 55% reduction
            'annual_reduction_needed': total_emissions * 0.055,  # 5.5% per year
            'feasible_with_actions': sum(reduction_potential.values())
        }
        
        # Cost of Carbon
        cost_of_carbon = total_emissions * 100  # €100/tCO2e
        
        # Equivalent Metrics
        equivalent_metrics = {
            'trees_to_plant': total_emissions * 40,  # 1 tCO2e = ~40 trees
            'cars_off_road': total_emissions / 4.6,  # Average car = 4.6 tCO2e/year
            'homes_energy_year': total_emissions / 6.8,  # Average home = 6.8 tCO2e/year
            'flights_paris_ny': total_emissions / 1.8,  # Paris-NY = ~1.8 tCO2e
        }
        
        # Monthly Breakdown (seasonal variations)
        monthly_breakdown = []
        seasonal_factors = [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]  # Winter higher
        for month, factor in enumerate(seasonal_factors, 1):
            monthly_breakdown.append({
                'month': month,
                'emissions': (total_emissions / 12) * factor,
                'factor': factor
            })
        
        # Peer Comparison
        peer_comparison = {
            'percentile': self._calculate_percentile(data.secteur, total_emissions / employees_count),
            'sector_average': sector_avg['co2e_per_employee'] * employees_count,
            'best_in_class': sector_avg['percentile_25'] * employees_count,
            'improvement_needed': max(0, total_emissions - sector_avg['percentile_25'] * employees_count)
        }
        
        # Certification Readiness
        certification_readiness = {
            'iso_14001': carbon_efficiency_score >= 70,
            'b_corp': carbon_efficiency_score >= 80 and data.pourcentage_local >= 50,
            'carbon_neutral': sum(reduction_potential.values()) >= total_emissions * 0.8,
            'science_based_targets': trajectory_2030['feasible_with_actions'] >= trajectory_2030['target_2030']
        }
        
        # AI Insights (will be enhanced with LLM)
        ai_insights = {
            'primary_focus': max(breakdown.items(), key=lambda x: x[1])[0],
            'quick_win': max(reduction_potential.items(), key=lambda x: x[1])[0],
            'long_term_strategy': 'electrification' if breakdown.get('vehicules', 0) > total_emissions * 0.2 else 'energy_efficiency'
        }
        
        return {
            'carbon_efficiency_score': round(carbon_efficiency_score, 1),
            'reduction_potential': {k: round(v, 2) for k, v in reduction_potential.items()},
            'trajectory_2030': {k: round(v, 2) for k, v in trajectory_2030.items()},
            'sustainability_grade': sustainability_grade,
            'cost_of_carbon': round(cost_of_carbon, 2),
            'equivalent_metrics': {k: round(v, 1) for k, v in equivalent_metrics.items()},
            'monthly_breakdown': monthly_breakdown,
            'peer_comparison': {k: round(v, 2) for k, v in peer_comparison.items()},
            'certification_readiness': certification_readiness,
            'ai_insights': ai_insights
        }
    
    def _calculate_percentile(self, sector: str, intensity: float) -> int:
        """Calculate percentile position in sector"""
        sector_data = self.sector_benchmarks.get(sector, self.sector_benchmarks['services'])
        
        if intensity <= sector_data['percentile_25']:
            return 25
        elif intensity <= sector_data['co2e_per_employee']:
            return 50
        elif intensity <= sector_data['percentile_75']:
            return 75
        else:
            return 90

def process_questionnaire_data(questionnaire_json: str) -> EmissionResult:
    """Main function to process questionnaire data and calculate emissions"""
    try:
        # Parse JSON data
        data_dict = json.loads(questionnaire_json)
        
        # Create CompanyData object
        company_data = CompanyData(
            nom=data_dict['entreprise']['nom'],
            secteur=data_dict['entreprise']['secteur'],
            effectif=data_dict['entreprise']['effectif'],
            chiffre_affaires=data_dict['entreprise'].get('chiffreAffaires'),
            localisation=data_dict['entreprise']['localisation'],
            electricite_kwh=data_dict['energie']['electricite_kwh'],
            gaz_kwh=data_dict['energie']['gaz_kwh'],
            carburants_litres=data_dict['energie']['carburants_litres'],
            vehicules_km_annuel=data_dict['transport']['vehicules_km_annuel'],
            vols_domestiques_km=data_dict['transport']['vols_domestiques_km'],
            vols_internationaux_km=data_dict['transport']['vols_internationaux_km'],
            montant_achats_annuel=data_dict['achats']['montant_achats_annuel'],
            pourcentage_local=data_dict['achats']['pourcentage_local']
        )
        
        # Calculate emissions
        calculator = CarbonCalculator()
        result = calculator.calculate_emissions(company_data)
        
        logger.info(f"Calculation completed for {company_data.nom}: {result.total_co2e} kgCO2e")
        return result
        
    except Exception as e:
        logger.error(f"Error processing questionnaire data: {e}")
        raise

if __name__ == "__main__":
    # Test with sample data
    sample_data = {
        "entreprise": {
            "nom": "Test Company",
            "secteur": "services",
            "effectif": "10-49",
            "chiffreAffaires": 500000,
            "localisation": "Paris, France"
        },
        "energie": {
            "electricite_kwh": 25000,
            "gaz_kwh": 15000,
            "carburants_litres": 2000
        },
        "transport": {
            "vehicules_km_annuel": 15000,
            "vols_domestiques_km": 8000,
            "vols_internationaux_km": 12000
        },
        "achats": {
            "montant_achats_annuel": 300000,
            "pourcentage_local": 40
        }
    }
    
    result = process_questionnaire_data(json.dumps(sample_data))
    print(f"Total emissions: {result.total_co2e} kgCO2e")
    print(f"Scope 1: {result.scope_1} kgCO2e")
    print(f"Scope 2: {result.scope_2} kgCO2e")
    print(f"Scope 3: {result.scope_3} kgCO2e")
    print(f"Benchmark: {result.benchmark_position}")
    print("Recommendations:")
    for rec in result.recommendations:
        print(f"  - {rec}")
