from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import structlog

from .database import get_db, init_db
from .routers import calculation, factors, validation, dashboard
from .services.ademe_loader import ADEMELoader
from .config import settings

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Démarrage du service de calcul")
    
    init_db()
    
    ademe_loader = ADEMELoader()
    await ademe_loader.load_factors_if_needed()
    
    yield
    
    logger.info("Arrêt du service de calcul")

app = FastAPI(
    title="CarbonScore - Service de Calcul",
    description="API de calcul d'empreinte carbone basée sur les facteurs ADEME",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculation.router, prefix="/api/v1", tags=["Calcul"])
app.include_router(factors.router, prefix="/api/v1", tags=["Facteurs"])
app.include_router(validation.router, prefix="/api/v1", tags=["Validation"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "calc-service",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "CarbonScore - Service de Calcul d'Empreinte Carbone",
        "docs": "/docs",
        "health": "/health"
    }
