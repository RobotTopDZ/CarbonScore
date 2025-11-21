import pandas as pd
import asyncio
from pathlib import Path
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import structlog

from ..database import get_db
from ..models.emission_factor import EmissionFactor
from ..config import settings

logger = structlog.get_logger()

class ADEMELoader:
    def __init__(self):
        self.data_path = Path(settings.ADEME_DATA_PATH)
        self.factors_cache: Dict[str, EmissionFactor] = {}
        
    async def load_factors_if_needed(self):
        db = next(get_db())
        try:
            existing_count = db.query(EmissionFactor).count()
            if existing_count == 0:
                logger.info("Aucun facteur ADEME trouvé, chargement en cours...")
                await self.load_ademe_factors()
            else:
                logger.info(f"{existing_count} facteurs ADEME déjà chargés")
                await self.load_factors_to_cache()
        finally:
            db.close()
    
    async def load_ademe_factors(self):
        if not self.data_path.exists():
            raise FileNotFoundError(f"Fichier ADEME non trouvé: {self.data_path}")
        
        logger.info(f"Chargement des facteurs ADEME depuis {self.data_path}")
        
        df = pd.read_csv(self.data_path, encoding='utf-8')
        
        df_elements = df[df['Type Ligne'] == 'Elément'].copy()
        df_valid = df_elements[df_elements['Statut de l\'élément'] == 'Valide générique'].copy()
        
        logger.info(f"Traitement de {len(df_valid)} facteurs d'émission valides")
        
        db = next(get_db())
        try:
            batch_size = 1000
            for i in range(0, len(df_valid), batch_size):
                batch = df_valid.iloc[i:i+batch_size]
                factors = []
                
                for _, row in batch.iterrows():
                    factor = self._create_emission_factor(row)
                    if factor:
                        factors.append(factor)
                
                db.add_all(factors)
                db.commit()
                logger.info(f"Chargé {len(factors)} facteurs (batch {i//batch_size + 1})")
        
        except Exception as e:
            db.rollback()
            logger.error(f"Erreur lors du chargement: {e}")
            raise
        finally:
            db.close()
        
        await self.load_factors_to_cache()
        logger.info("Chargement des facteurs ADEME terminé")
    
    def _create_emission_factor(self, row: pd.Series) -> Optional[EmissionFactor]:
        try:
            total_emission = self._safe_float(row.get('Total poste non décomposé', 0))
            if total_emission <= 0:
                return None
            
            category = self._clean_category(row.get('Code de la catégorie', ''))
            if not category:
                return None
            
            factor = EmissionFactor(
                ademe_id=str(row.get('Identifiant de l\'élément', '')),
                nom=str(row.get('Nom base français', '')),
                category=category,
                unit=str(row.get('Unité français', '')),
                value=total_emission,
                co2_fossil=self._safe_float(row.get('CO2f', 0)),
                ch4_fossil=self._safe_float(row.get('CH4f', 0)),
                ch4_biogenic=self._safe_float(row.get('CH4b', 0)),
                n2o=self._safe_float(row.get('N2O', 0)),
                co2_biogenic=self._safe_float(row.get('CO2b', 0)),
                scope=self._determine_scope(category),
                source='ADEME',
                version='v17',
                status='valid',
                uncertainty=self._safe_float(row.get('Incertitude', 0)),
                tags=str(row.get('Tags français', '')),
                comment=str(row.get('Commentaire français', ''))
            )
            
            return factor
            
        except Exception as e:
            logger.warning(f"Erreur lors de la création du facteur: {e}")
            return None
    
    def _safe_float(self, value) -> float:
        try:
            if pd.isna(value) or value == '':
                return 0.0
            return float(str(value).replace(',', '.'))
        except (ValueError, TypeError):
            return 0.0
    
    def _clean_category(self, category: str) -> str:
        if not category or pd.isna(category):
            return ''
        return str(category).strip()
    
    def _determine_scope(self, category: str) -> int:
        category_lower = category.lower()
        
        if any(term in category_lower for term in ['combustible', 'gaz', 'fioul', 'essence', 'diesel']):
            return 1
        elif any(term in category_lower for term in ['électricité', 'electricite', 'réseau', 'chauffage urbain']):
            return 2
        else:
            return 3
    
    async def load_factors_to_cache(self):
        db = next(get_db())
        try:
            factors = db.query(EmissionFactor).all()
            self.factors_cache = {f.ademe_id: f for f in factors}
            logger.info(f"Cache des facteurs mis à jour: {len(self.factors_cache)} facteurs")
        finally:
            db.close()
    
    def get_factor_by_category_and_unit(self, category: str, unit: str) -> Optional[EmissionFactor]:
        for factor in self.factors_cache.values():
            if (category.lower() in factor.category.lower() and 
                unit.lower() in factor.unit.lower()):
                return factor
        return None
    
    def search_factors(self, query: str, limit: int = 10) -> List[EmissionFactor]:
        query_lower = query.lower()
        results = []
        
        for factor in self.factors_cache.values():
            if (query_lower in factor.nom.lower() or 
                query_lower in factor.category.lower() or
                query_lower in factor.tags.lower()):
                results.append(factor)
                if len(results) >= limit:
                    break
        
        return results
    
    def get_factors_by_scope(self, scope: int) -> List[EmissionFactor]:
        return [f for f in self.factors_cache.values() if f.scope == scope]
