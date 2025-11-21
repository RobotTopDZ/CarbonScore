"""
CarbonScore ML Service
Advanced ML pipeline for anomaly detection, imputation, benchmarking, and action ranking
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import lightgbm as lgb
import joblib
import json
import logging
from datetime import datetime
from pathlib import Path
import mlflow
import mlflow.sklearn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CarbonScore ML Service",
    description="Machine Learning pipeline for carbon footprint analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CompanyData(BaseModel):
    sector: str
    employees: str
    revenue: Optional[float] = None
    location: str
    electricite_kwh: float
    gaz_kwh: float
    carburants_litres: float
    vehicules_km_annuel: float
    vols_domestiques_km: float
    vols_internationaux_km: float
    montant_achats_annuel: float
    pourcentage_local: float

class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    anomalous_fields: List[str]
    confidence: float

class ImputationResult(BaseModel):
    imputed_data: Dict[str, float]
    imputed_fields: List[str]
    confidence_scores: Dict[str, float]

class BenchmarkResult(BaseModel):
    predicted_emissions: float
    percentile_position: int
    sector_average: float
    confidence_interval: List[float]

class ActionRecommendation(BaseModel):
    action_id: str
    title: str
    description: str
    impact_co2e: float
    cost_estimate: str
    feasibility_score: float
    roi_score: float
    priority_rank: int

# Global model storage
models = {
    'anomaly_detector': None,
    'scaler': None,
    'imputation_models': {},
    'benchmark_models': {},
    'action_ranker': None
}

class MLService:
    """Main ML service class"""
    
    def __init__(self):
        self.models_dir = Path("/data/artifacts/models")
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.load_models()
        
    def load_models(self):
        """Load pre-trained models or initialize new ones"""
        try:
            # Load anomaly detection model
            anomaly_path = self.models_dir / "anomaly_detector.joblib"
            if anomaly_path.exists():
                models['anomaly_detector'] = joblib.load(anomaly_path)
                models['scaler'] = joblib.load(self.models_dir / "scaler.joblib")
                logger.info("Loaded anomaly detection model")
            else:
                self._train_anomaly_detector()
                
            # Load imputation models
            imputation_dir = self.models_dir / "imputation"
            if imputation_dir.exists():
                for model_file in imputation_dir.glob("*.joblib"):
                    field_name = model_file.stem
                    models['imputation_models'][field_name] = joblib.load(model_file)
                logger.info(f"Loaded {len(models['imputation_models'])} imputation models")
            else:
                self._train_imputation_models()
                
            # Load benchmark models
            benchmark_dir = self.models_dir / "benchmark"
            if benchmark_dir.exists():
                for model_file in benchmark_dir.glob("*.joblib"):
                    sector = model_file.stem
                    models['benchmark_models'][sector] = joblib.load(model_file)
                logger.info(f"Loaded {len(models['benchmark_models'])} benchmark models")
            else:
                self._train_benchmark_models()
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self._initialize_default_models()
    
    def _initialize_default_models(self):
        """Initialize default models if loading fails"""
        logger.info("Initializing default models...")
        
        # Default anomaly detector
        models['anomaly_detector'] = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        models['scaler'] = StandardScaler()
        
        # Train on synthetic data
        self._train_anomaly_detector()
        self._train_imputation_models()
        self._train_benchmark_models()
    
    def _train_anomaly_detector(self):
        """Train anomaly detection model"""
        logger.info("Training anomaly detection model...")
        
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000
        
        # Normal company profiles
        normal_data = []
        sectors = ['industrie', 'services', 'commerce', 'construction', 'transport']
        
        for _ in range(n_samples):
            sector = np.random.choice(sectors)
            employees = np.random.choice(['1-9', '10-49', '50-249', '250+'])
            
            # Sector-specific base values with realistic variations
            base_values = {
                'industrie': {'elec': 80000, 'gaz': 120000, 'carb': 8000, 'veh': 40000, 'achats': 800000},
                'services': {'elec': 25000, 'gaz': 15000, 'carb': 2000, 'veh': 15000, 'achats': 300000},
                'commerce': {'elec': 45000, 'gaz': 25000, 'carb': 5000, 'veh': 30000, 'achats': 1200000},
                'construction': {'elec': 35000, 'gaz': 40000, 'carb': 15000, 'veh': 60000, 'achats': 900000},
                'transport': {'elec': 20000, 'gaz': 10000, 'carb': 25000, 'veh': 100000, 'achats': 400000}
            }
            
            base = base_values[sector]
            size_multiplier = {'1-9': 0.3, '10-49': 1.0, '50-249': 3.0, '250+': 10.0}[employees]
            
            # Add realistic noise
            noise = np.random.normal(1.0, 0.2)
            
            sample = [
                base['elec'] * size_multiplier * noise,
                base['gaz'] * size_multiplier * noise,
                base['carb'] * size_multiplier * noise,
                base['veh'] * size_multiplier * noise,
                np.random.uniform(1000, 10000),  # domestic flights
                np.random.uniform(2000, 15000),  # international flights
                base['achats'] * size_multiplier * noise,
                np.random.uniform(20, 80)  # local percentage
            ]
            normal_data.append(sample)
        
        # Convert to DataFrame and train
        feature_names = [
            'electricite_kwh', 'gaz_kwh', 'carburants_litres', 'vehicules_km_annuel',
            'vols_domestiques_km', 'vols_internationaux_km', 'montant_achats_annuel', 'pourcentage_local'
        ]
        
        df = pd.DataFrame(normal_data, columns=feature_names)
        
        # Scale features
        scaled_data = models['scaler'].fit_transform(df)
        
        # Train anomaly detector
        models['anomaly_detector'].fit(scaled_data)
        
        # Save models
        joblib.dump(models['anomaly_detector'], self.models_dir / "anomaly_detector.joblib")
        joblib.dump(models['scaler'], self.models_dir / "scaler.joblib")
        
        logger.info("Anomaly detection model trained and saved")
    
    def _train_imputation_models(self):
        """Train imputation models for missing values"""
        logger.info("Training imputation models...")
        
        # Generate synthetic data for imputation training
        np.random.seed(42)
        n_samples = 2000
        
        # Create complete dataset
        data = []
        for _ in range(n_samples):
            sector_idx = np.random.randint(0, 5)
            size_idx = np.random.randint(0, 4)
            
            # Correlated features based on sector and size
            base_elec = [20000, 25000, 45000, 35000, 20000][sector_idx] * [0.3, 1.0, 3.0, 10.0][size_idx]
            base_gaz = base_elec * np.random.uniform(0.3, 0.8)
            base_carb = base_elec * np.random.uniform(0.05, 0.15)
            base_veh = base_elec * np.random.uniform(0.3, 2.0)
            base_achats = base_elec * np.random.uniform(8, 15)
            
            sample = {
                'sector_idx': sector_idx,
                'size_idx': size_idx,
                'electricite_kwh': base_elec * np.random.normal(1.0, 0.2),
                'gaz_kwh': base_gaz * np.random.normal(1.0, 0.3),
                'carburants_litres': base_carb * np.random.normal(1.0, 0.4),
                'vehicules_km_annuel': base_veh * np.random.normal(1.0, 0.3),
                'montant_achats_annuel': base_achats * np.random.normal(1.0, 0.25)
            }
            data.append(sample)
        
        df = pd.DataFrame(data)
        
        # Train separate models for each field
        target_fields = ['electricite_kwh', 'gaz_kwh', 'carburants_litres', 'vehicules_km_annuel', 'montant_achats_annuel']
        feature_fields = ['sector_idx', 'size_idx']
        
        imputation_dir = self.models_dir / "imputation"
        imputation_dir.mkdir(exist_ok=True)
        
        for target in target_fields:
            # Use other fields as features
            features = feature_fields + [f for f in target_fields if f != target]
            
            # Create training data (simulate missing values)
            train_mask = np.random.random(len(df)) > 0.2  # 20% missing
            X_train = df.loc[train_mask, features]
            y_train = df.loc[train_mask, target]
            
            # Train LightGBM model
            model = lgb.LGBMRegressor(
                n_estimators=100,
                learning_rate=0.1,
                random_state=42,
                verbose=-1
            )
            model.fit(X_train, y_train)
            
            models['imputation_models'][target] = model
            joblib.dump(model, imputation_dir / f"{target}.joblib")
        
        logger.info(f"Trained and saved {len(target_fields)} imputation models")
    
    def _train_benchmark_models(self):
        """Train sector-specific benchmark models"""
        logger.info("Training benchmark models...")
        
        # Generate synthetic benchmark data
        np.random.seed(42)
        sectors = ['industrie', 'services', 'commerce', 'construction', 'transport']
        
        benchmark_dir = self.models_dir / "benchmark"
        benchmark_dir.mkdir(exist_ok=True)
        
        for sector in sectors:
            # Generate sector-specific data
            n_samples = 500
            data = []
            
            for _ in range(n_samples):
                size_multiplier = np.random.choice([0.3, 1.0, 3.0, 10.0])
                
                # Sector base emissions (tCO2e)
                base_emissions = {
                    'industrie': 50, 'services': 15, 'commerce': 25,
                    'construction': 40, 'transport': 60
                }[sector]
                
                # Features: company characteristics
                features = {
                    'employees_numeric': size_multiplier * 25,
                    'revenue_millions': size_multiplier * 2.5,
                    'energy_intensity': np.random.uniform(0.5, 2.0),
                    'transport_intensity': np.random.uniform(0.3, 1.5)
                }
                
                # Target: total emissions with realistic variation
                total_emissions = base_emissions * size_multiplier * np.random.normal(1.0, 0.3)
                
                data.append({**features, 'total_emissions': total_emissions})
            
            df = pd.DataFrame(data)
            
            # Train model
            feature_cols = ['employees_numeric', 'revenue_millions', 'energy_intensity', 'transport_intensity']
            X = df[feature_cols]
            y = df['total_emissions']
            
            model = lgb.LGBMRegressor(
                n_estimators=100,
                learning_rate=0.1,
                random_state=42,
                verbose=-1
            )
            model.fit(X, y)
            
            models['benchmark_models'][sector] = model
            joblib.dump(model, benchmark_dir / f"{sector}.joblib")
        
        logger.info(f"Trained and saved {len(sectors)} benchmark models")

# Initialize ML service
ml_service = MLService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CarbonScore ML Service",
        "status": "healthy",
        "models_loaded": {
            "anomaly_detector": models['anomaly_detector'] is not None,
            "imputation_models": len(models['imputation_models']),
            "benchmark_models": len(models['benchmark_models'])
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/ml/anomaly", response_model=AnomalyResult)
async def detect_anomalies(data: CompanyData):
    """Detect anomalies in company data"""
    try:
        # Prepare features
        features = np.array([[
            data.electricite_kwh,
            data.gaz_kwh,
            data.carburants_litres,
            data.vehicules_km_annuel,
            data.vols_domestiques_km,
            data.vols_internationaux_km,
            data.montant_achats_annuel,
            data.pourcentage_local
        ]])
        
        # Scale features
        scaled_features = models['scaler'].transform(features)
        
        # Predict anomaly
        anomaly_pred = models['anomaly_detector'].predict(scaled_features)[0]
        anomaly_score = models['anomaly_detector'].decision_function(scaled_features)[0]
        
        # Identify anomalous fields (simplified approach)
        feature_names = [
            'electricite_kwh', 'gaz_kwh', 'carburants_litres', 'vehicules_km_annuel',
            'vols_domestiques_km', 'vols_internationaux_km', 'montant_achats_annuel', 'pourcentage_local'
        ]
        
        # Calculate field-specific anomaly scores
        anomalous_fields = []
        if anomaly_pred == -1:  # Anomaly detected
            # Simple heuristic: check extreme values
            values = features[0]
            for i, (name, value) in enumerate(zip(feature_names, values)):
                if value > np.percentile(scaled_features[0], 95) or value < np.percentile(scaled_features[0], 5):
                    anomalous_fields.append(name)
        
        return AnomalyResult(
            is_anomaly=anomaly_pred == -1,
            anomaly_score=float(anomaly_score),
            anomalous_fields=anomalous_fields,
            confidence=min(1.0, abs(anomaly_score) / 2.0)
        )
        
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/impute", response_model=ImputationResult)
async def impute_missing_values(data: Dict[str, Any]):
    """Impute missing values in company data"""
    try:
        # Identify missing fields (None or 0 values)
        missing_fields = []
        for field, value in data.items():
            if value is None or (isinstance(value, (int, float)) and value == 0):
                missing_fields.append(field)
        
        if not missing_fields:
            return ImputationResult(
                imputed_data={},
                imputed_fields=[],
                confidence_scores={}
            )
        
        # Prepare features for imputation
        sector_mapping = {'industrie': 0, 'services': 1, 'commerce': 2, 'construction': 3, 'transport': 4}
        size_mapping = {'1-9': 0, '10-49': 1, '50-249': 2, '250+': 3}
        
        sector_idx = sector_mapping.get(data.get('sector', 'services'), 1)
        employees = data.get('employees', '10-49')
        size_idx = size_mapping.get(employees, 1)
        
        imputed_data = {}
        confidence_scores = {}
        
        for field in missing_fields:
            if field in models['imputation_models']:
                # Prepare features (simplified)
                features = np.array([[sector_idx, size_idx, 25000, 15000, 2000, 15000, 300000]])  # Default values
                
                # Predict missing value
                predicted_value = models['imputation_models'][field].predict(features)[0]
                
                # Add realistic variation
                predicted_value *= np.random.normal(1.0, 0.1)
                
                imputed_data[field] = max(0, predicted_value)
                confidence_scores[field] = 0.75  # Simplified confidence score
        
        return ImputationResult(
            imputed_data=imputed_data,
            imputed_fields=list(missing_fields),
            confidence_scores=confidence_scores
        )
        
    except Exception as e:
        logger.error(f"Imputation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/benchmark", response_model=BenchmarkResult)
async def predict_benchmark(data: CompanyData):
    """Predict sector benchmark for company"""
    try:
        sector = data.sector
        
        if sector not in models['benchmark_models']:
            # Use default sector if not found
            sector = 'services'
        
        # Prepare features
        employees_numeric = {'1-9': 5, '10-49': 25, '50-249': 125, '250+': 500}[data.employees]
        revenue_millions = (data.revenue or 1000000) / 1000000
        
        # Calculate intensity metrics
        total_energy = data.electricite_kwh + data.gaz_kwh
        energy_intensity = total_energy / employees_numeric if employees_numeric > 0 else 0
        
        total_transport = data.vehicules_km_annuel + data.vols_domestiques_km + data.vols_internationaux_km
        transport_intensity = total_transport / employees_numeric if employees_numeric > 0 else 0
        
        features = np.array([[
            employees_numeric,
            revenue_millions,
            energy_intensity / 1000,  # Normalize
            transport_intensity / 1000  # Normalize
        ]])
        
        # Predict emissions
        model = models['benchmark_models'][sector]
        predicted_emissions = model.predict(features)[0]
        
        # Calculate percentile (simplified)
        sector_averages = {
            'industrie': 50, 'services': 15, 'commerce': 25,
            'construction': 40, 'transport': 60
        }
        sector_avg = sector_averages.get(data.sector, 15)
        
        percentile = min(90, max(10, int((predicted_emissions / sector_avg) * 50)))
        
        # Confidence interval (±20%)
        confidence_interval = [
            predicted_emissions * 0.8,
            predicted_emissions * 1.2
        ]
        
        return BenchmarkResult(
            predicted_emissions=predicted_emissions,
            percentile_position=percentile,
            sector_average=sector_avg,
            confidence_interval=confidence_interval
        )
        
    except Exception as e:
        logger.error(f"Benchmark prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/actions", response_model=List[ActionRecommendation])
async def rank_actions(data: CompanyData, calculation_result: Dict[str, float]):
    """Rank action recommendations based on company profile and emissions"""
    try:
        # Action bank with impact formulas
        action_bank = [
            {
                "id": "renewable_energy",
                "title": "Transition vers l'énergie renouvelable",
                "description": "Installer des panneaux solaires ou souscrire un contrat d'énergie verte",
                "impact_formula": lambda d: d.get('electricite', 0) * 0.0571 * 0.8,  # 80% reduction
                "cost": "Moyen",
                "feasibility": 0.7
            },
            {
                "id": "electric_vehicles",
                "title": "Électrification de la flotte",
                "description": "Remplacer les véhicules thermiques par des véhicules électriques",
                "impact_formula": lambda d: d.get('vehicules', 0) * 0.7,  # 70% reduction
                "cost": "Élevé",
                "feasibility": 0.6
            },
            {
                "id": "energy_efficiency",
                "title": "Amélioration de l'efficacité énergétique",
                "description": "Isolation, LED, équipements performants",
                "impact_formula": lambda d: (d.get('electricite', 0) + d.get('gaz', 0)) * 0.25,  # 25% reduction
                "cost": "Faible",
                "feasibility": 0.9
            },
            {
                "id": "remote_work",
                "title": "Développement du télétravail",
                "description": "Réduire les déplacements domicile-travail",
                "impact_formula": lambda d: d.get('vehicules', 0) * 0.3,  # 30% reduction
                "cost": "Faible",
                "feasibility": 0.8
            },
            {
                "id": "local_sourcing",
                "title": "Approvisionnement local",
                "description": "Privilégier les fournisseurs locaux",
                "impact_formula": lambda d: d.get('achats', 0) * 0.15,  # 15% reduction
                "cost": "Faible",
                "feasibility": 0.7
            },
            {
                "id": "video_conferencing",
                "title": "Visioconférence vs déplacements",
                "description": "Remplacer les déplacements professionnels par la visioconférence",
                "impact_formula": lambda d: (d.get('vols_domestiques', 0) + d.get('vols_internationaux', 0)) * 0.4,
                "cost": "Très faible",
                "feasibility": 0.9
            }
        ]
        
        # Calculate impact and ROI for each action
        recommendations = []
        
        for i, action in enumerate(action_bank):
            impact_co2e = action['impact_formula'](calculation_result)
            
            # Calculate ROI score (impact / cost)
            cost_scores = {"Très faible": 1.0, "Faible": 0.8, "Moyen": 0.6, "Élevé": 0.3}
            cost_score = cost_scores.get(action['cost'], 0.5)
            
            roi_score = (impact_co2e / 1000) * cost_score  # Normalize impact and multiply by cost efficiency
            
            recommendations.append(ActionRecommendation(
                action_id=action['id'],
                title=action['title'],
                description=action['description'],
                impact_co2e=impact_co2e,
                cost_estimate=action['cost'],
                feasibility_score=action['feasibility'],
                roi_score=roi_score,
                priority_rank=i + 1  # Will be re-ranked
            ))
        
        # Sort by ROI score (descending)
        recommendations.sort(key=lambda x: x.roi_score, reverse=True)
        
        # Update priority ranks
        for i, rec in enumerate(recommendations):
            rec.priority_rank = i + 1
        
        return recommendations[:5]  # Return top 5 recommendations
        
    except Exception as e:
        logger.error(f"Action ranking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/train")
async def trigger_model_training(background_tasks: BackgroundTasks):
    """Trigger model retraining"""
    try:
        background_tasks.add_task(retrain_models)
        return {
            "status": "training_started",
            "message": "Model retraining initiated in background",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Training trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def retrain_models():
    """Background task for model retraining"""
    try:
        logger.info("Starting model retraining...")
        
        # Retrain all models
        ml_service._train_anomaly_detector()
        ml_service._train_imputation_models()
        ml_service._train_benchmark_models()
        
        logger.info("Model retraining completed successfully")
        
    except Exception as e:
        logger.error(f"Model retraining failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8010,
        reload=True,
        log_level="info"
    )
