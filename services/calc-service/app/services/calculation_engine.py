from typing import Dict, List, Optional, Tuple
import structlog
from datetime import datetime
from ..models.emission_factor import EmissionFactor
from ..services.ademe_loader import ADEMELoader

logger = structlog.get_logger()

class CalculationEngine:
    def __init__(self, ademe_loader: ADEMELoader):
        self.ademe_loader = ademe_loader
        self.calculation_trace = []
    
    def calculate_emissions(self, questionnaire_data: Dict) -> Dict:
        self.calculation_trace = []
        
        try:
            results = {
                "scope1": self._calculate_scope1(questionnaire_data),
                "scope2": self._calculate_scope2(questionnaire_data),
                "scope3": self._calculate_scope3(questionnaire_data),
                "trace": self.calculation_trace,
                "metadata": {
                    "calculation_date": datetime.now().isoformat(),
                    "ademe_version": "v17",
                    "methodology": "ADEME Base Carbone"
                }
            }
            
            results["total"] = results["scope1"] + results["scope2"] + results["scope3"]
            
            entreprise = questionnaire_data.get("entreprise", {})
            effectif = entreprise.get("effectif", 1)
            chiffre_affaires = entreprise.get("chiffreAffaires", 0)
            
            results["intensites"] = {
                "par_employe": results["total"] / max(effectif, 1),
                "par_chiffre_affaires": results["total"] / max(chiffre_affaires, 1) if chiffre_affaires > 0 else 0
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors du calcul: {e}")
            raise
    
    def _calculate_scope1(self, data: Dict) -> float:
        scope1_total = 0.0
        
        energie = data.get("energie", {})
        transport = data.get("transport", {})
        
        scope1_total += self._calculate_combustibles(energie)
        scope1_total += self._calculate_vehicules_entreprise(transport.get("vehiculesEntreprise", []))
        
        return scope1_total
    
    def _calculate_scope2(self, data: Dict) -> float:
        scope2_total = 0.0
        
        energie = data.get("energie", {})
        
        scope2_total += self._calculate_electricite(energie.get("electricite", 0))
        
        return scope2_total
    
    def _calculate_scope3(self, data: Dict) -> float:
        scope3_total = 0.0
        
        transport = data.get("transport", {})
        achats = data.get("achats", {})
        dechets = data.get("dechets", {})
        
        scope3_total += self._calculate_deplacements_professionnels(transport.get("deplacementsProfessionnels", {}))
        scope3_total += self._calculate_trajets_employes(transport.get("trajetsEmployes", {}))
        scope3_total += self._calculate_achats(achats)
        scope3_total += self._calculate_dechets(dechets)
        
        return scope3_total
    
    def _calculate_combustibles(self, energie: Dict) -> float:
        total = 0.0
        
        gaz_kwh = energie.get("gaz", 0)
        if gaz_kwh > 0:
            factor = self.ademe_loader.get_factor_by_category_and_unit("Gaz naturel", "kWh")
            if factor:
                emission = gaz_kwh * factor.value
                total += emission
                self._add_trace("Gaz naturel", gaz_kwh, "kWh", factor.value, emission, 1)
        
        fioul_litres = energie.get("fioul", 0)
        if fioul_litres > 0:
            factor = self.ademe_loader.get_factor_by_category_and_unit("Fioul", "litre")
            if factor:
                emission = fioul_litres * factor.value
                total += emission
                self._add_trace("Fioul domestique", fioul_litres, "litres", factor.value, emission, 1)
        
        autres_energies = energie.get("autresEnergies", [])
        for energie_item in autres_energies:
            type_energie = energie_item.get("type", "")
            quantite = energie_item.get("quantite", 0)
            unite = energie_item.get("unite", "")
            
            if quantite > 0:
                factor = self.ademe_loader.get_factor_by_category_and_unit(type_energie, unite)
                if factor:
                    emission = quantite * factor.value
                    total += emission
                    self._add_trace(type_energie, quantite, unite, factor.value, emission, 1)
        
        return total
    
    def _calculate_electricite(self, electricite_kwh: float) -> float:
        if electricite_kwh <= 0:
            return 0.0
        
        factor = self.ademe_loader.get_factor_by_category_and_unit("Électricité", "kWh")
        if not factor:
            factor_value = 0.0579
            self._add_trace("Électricité (facteur par défaut)", electricite_kwh, "kWh", factor_value, electricite_kwh * factor_value, 2)
            return electricite_kwh * factor_value
        
        emission = electricite_kwh * factor.value
        self._add_trace("Électricité réseau France", electricite_kwh, "kWh", factor.value, emission, 2)
        return emission
    
    def _calculate_vehicules_entreprise(self, vehicules: List[Dict]) -> float:
        total = 0.0
        
        for vehicule in vehicules:
            type_carburant = vehicule.get("type", "")
            nombre = vehicule.get("nombre", 0)
            kilometrage = vehicule.get("kilometrage", 0)
            
            if nombre > 0 and kilometrage > 0:
                km_total = nombre * kilometrage
                
                factor_mapping = {
                    "essence": "Essence",
                    "diesel": "Gazole",
                    "electrique": "Électricité",
                    "hybride": "Essence"
                }
                
                factor_name = factor_mapping.get(type_carburant, "Essence")
                factor = self.ademe_loader.get_factor_by_category_and_unit(f"Véhicule {factor_name}", "km")
                
                if factor:
                    emission = km_total * factor.value
                    total += emission
                    self._add_trace(f"Véhicules {type_carburant}", km_total, "km", factor.value, emission, 1)
        
        return total
    
    def _calculate_deplacements_professionnels(self, deplacements: Dict) -> float:
        total = 0.0
        
        voiture_km = deplacements.get("voiture", 0)
        if voiture_km > 0:
            factor = self.ademe_loader.get_factor_by_category_and_unit("Voiture particulière", "km")
            if factor:
                emission = voiture_km * factor.value
                total += emission
                self._add_trace("Déplacements voiture", voiture_km, "km", factor.value, emission, 3)
        
        train_km = deplacements.get("train", 0)
        if train_km > 0:
            factor = self.ademe_loader.get_factor_by_category_and_unit("Train", "km")
            if factor:
                emission = train_km * factor.value
                total += emission
                self._add_trace("Déplacements train", train_km, "km", factor.value, emission, 3)
        
        avion_km = deplacements.get("avion", 0)
        if avion_km > 0:
            factor = self.ademe_loader.get_factor_by_category_and_unit("Avion", "km")
            if factor:
                emission = avion_km * factor.value
                total += emission
                self._add_trace("Déplacements avion", avion_km, "km", factor.value, emission, 3)
        
        return total
    
    def _calculate_trajets_employes(self, trajets: Dict) -> float:
        total = 0.0
        
        km_domicile_travail = trajets.get("domicileTravail", 0)
        mode_transport = trajets.get("modeTransport", "voiture")
        
        if km_domicile_travail > 0:
            km_annuel = km_domicile_travail * 2 * 220
            
            factor_mapping = {
                "voiture": "Voiture particulière",
                "transport_commun": "Transport en commun",
                "velo": "Vélo",
                "marche": "Marche",
                "mixte": "Transport mixte"
            }
            
            factor_name = factor_mapping.get(mode_transport, "Voiture particulière")
            factor = self.ademe_loader.get_factor_by_category_and_unit(factor_name, "km")
            
            if factor:
                emission = km_annuel * factor.value
                total += emission
                self._add_trace(f"Trajets employés {mode_transport}", km_annuel, "km", factor.value, emission, 3)
        
        return total
    
    def _calculate_achats(self, achats: Dict) -> float:
        total = 0.0
        
        matieres_premieres = achats.get("matieresPremières", 0)
        if matieres_premieres > 0:
            factor_value = 0.5
            emission = matieres_premieres * factor_value
            total += emission
            self._add_trace("Matières premières", matieres_premieres, "k€", factor_value, emission, 3)
        
        equipements = achats.get("equipements", 0)
        if equipements > 0:
            factor_value = 0.3
            emission = equipements * factor_value
            total += emission
            self._add_trace("Équipements", equipements, "k€", factor_value, emission, 3)
        
        services = achats.get("services", 0)
        if services > 0:
            factor_value = 0.2
            emission = services * factor_value
            total += emission
            self._add_trace("Services", services, "k€", factor_value, emission, 3)
        
        return total
    
    def _calculate_dechets(self, dechets: Dict) -> float:
        total = 0.0
        
        production = dechets.get("production", 0)
        traitement = dechets.get("traitement", "recyclage")
        
        if production > 0:
            factor_mapping = {
                "incineration": 0.5,
                "enfouissement": 0.8,
                "compostage": 0.1,
                "recyclage": 0.05
            }
            
            factor_value = factor_mapping.get(traitement, 0.3)
            emission = production * factor_value
            total += emission
            self._add_trace(f"Déchets {traitement}", production, "tonnes", factor_value, emission, 3)
        
        return total
    
    def _add_trace(self, source: str, quantity: float, unit: str, factor: float, emission: float, scope: int):
        self.calculation_trace.append({
            "source": source,
            "quantity": quantity,
            "unit": unit,
            "emission_factor": factor,
            "emission": emission,
            "scope": scope
        })
