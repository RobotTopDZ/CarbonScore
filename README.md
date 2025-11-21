# CarbonScore – AI-Powered Carbon Footprint Platform

CarbonScore is a production-grade sustainability platform for SMEs. It combines deterministic ADEME Base Carbone v17 calculations with machine-learning insights, prescriptive action plans, and professional-grade reporting. The system is built with a Next.js frontend, Python FastAPI microservices, and a set of worker pipelines that cover analytics, PDF generation, and AI assistance.

![CarbonScore Platform](https://img.shields.io/badge/Version-1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Python](https://img.shields.io/badge/Python-3.10+-blue) ![Next.js](https://img.shields.io/badge/Next.js-14+-black)

---

## 1. Product Overview

### Purpose
CarbonScore helps companies quantify their greenhouse-gas emissions, simulate reduction strategies, and publish stakeholder-ready reports. Every capability—from questionnaires to dashboards to PDF exports—is optimized for teams that need transparent audit trails and executive-level insights.

### Value Proposition
- Deterministic ADEME-compliant calculations powered by carefully curated Base Carbone v17 factors.
- AI-assisted narratives and benchmarking so sustainability officers can focus on decisions rather than spreadsheets.
- Ready-to-deploy Railway setup that prioritizes serving the frontend as the public entry point while backend services remain secured.

### Key Capabilities
1. Carbon accounting wizard with validation rules and data enrichment.
2. Multi-scope dashboard (Scopes 1/2/3) with benchmarking, insights, and recommended actions.
3. Report library storing generated PDF files with company metadata and download history.
4. Worker pipelines for ML models, LLM orchestration, and scheduled calculations.
5. Modular API surface that can be embedded into partner workflows.

---

## 2. Architecture Summary

```
┌─────────────────────────────┐
│        Next.js Frontend     │
│  (apps/web-nextjs)          │
│  - Dashboard & reports      │
│  - Questionnaire            │
│  - Admin & docs             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Python FastAPI Services     │
│  - Calc Service (ADEME)     │
│  - ML Service               │
│  - PDF Service              │
│  - LLM Service              │
│  - Worker Service           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  PostgreSQL + pgvector DB   │
│  Redis cache                │
│  Object storage for reports │
└─────────────────────────────┘
```

Core services:
- **Front-end (Next.js 14, TypeScript, TailwindCSS, React Query)** – user experience, dashboards, reports.
- **calc-service** – deterministic carbon accounting, ADEME mapping, validation.
- **ml-service** – anomaly detection, benchmarking, intensity forecasting.
- **pdf-service** – ReportLab-based generator for branded PDF reports and library index.
- **llm-service** – RAG pipeline powering explanations, insights, and actions.
- **worker-service** – background jobs, ingestion, scheduled report refresh.

For deeper component diagrams and API flows, see `DOCUMENTATION.md`.

---

## 3. Technology Stack

| Layer          | Technologies                                                                                                   |
|---------------|------------------------------------------------------------------------------------------------------------------|
| Frontend       | Next.js 14, TypeScript, React 18, TailwindCSS, Framer Motion, Heroicons, React Hook Form                       |
| Backend        | Python 3.10, FastAPI, Pydantic, Uvicorn, Celery-style workers                                                   |
| Data & Storage | PostgreSQL + pgvector, Redis 7, MLflow (optional), object storage for generated PDFs                            |
| Data Science   | scikit-learn, pandas, numpy, seaborn, matplotlib                                                                |
| DevOps         | Docker, Docker Compose, Railway, GitHub Actions (optional), linting via Next/ESLint and mypy/pytest on services |

---

## 4. Getting Started

### 4.1 Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.10+
- Git CLI

### 4.2 Repository Clone
```bash
git clone https://github.com/RobotTopDZ/Carbogo.git
cd Carbogo
```

### 4.3 Environment Configuration
```bash
cp .env.example .env
# Edit .env and populate API keys, database credentials, and Railway-specific variables.
```

### 4.4 Service Startup
```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f
```

### 4.5 Database Initialization
```bash
docker-compose exec calc-service python -m alembic upgrade head
docker-compose exec calc-service python scripts/load_ademe_data.py
docker-compose exec calc-service python scripts/create_sample_data.py
```

### 4.6 Local Endpoints
- Frontend: `http://localhost:3000`
- API (calc-service): `http://localhost:8000`
- MLflow UI: `http://localhost:5000`
- Admin dashboard: `http://localhost:3000/admin`

---

## 5. Railway Deployment (Frontend-first)

1. Push the repository to GitHub or another Git provider.
2. In Railway, create a service and set the **Root Directory** to `apps/web-nextjs`.
3. Choose the Dockerfile builder; `apps/web-nextjs/Dockerfile` already produces a standalone Next.js server.
4. Configure environment variables:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_API_URL=https://<backend-host>`
   - `PDF_SERVICE_URL=https://<pdf-service-host>` (optional override)
5. Deploy. Railway exposes port 3000 internally and serves the Next.js application on the generated public URL.

Backend services (calc, ML, PDF, LLM, worker) can be deployed through separate Railway services, containers, or any preferred infrastructure. Ensure the `NEXT_PUBLIC_API_URL` points to the API gateway that fronts those services.

---

## 6. Project Structure

```
carbogo/
├── apps/
│   └── web-nextjs/         # Next.js frontend
├── services/
│   ├── calc-service/       # FastAPI calculations
│   ├── ml-service/         # ML training/inference
│   ├── pdf-service/        # PDF generation pipeline
│   ├── llm-service/        # LLM orchestration
│   └── worker-service/     # Background workers
├── data/                   # Static ADEME datasets
├── scripts/                # Utility scripts
├── docker-compose.yml
└── DOCUMENTATION.md        # Extended technical reference
```

---

## 7. Development Workflow

### 7.1 Frontend
```bash
cd apps/web-nextjs
npm install
npm run dev
```

### 7.2 Backend Services
```bash
cd services/calc-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 7.3 Testing
```bash
# Frontend
cd apps/web-nextjs && npm test

# Backend
cd services/calc-service && pytest

# Integration
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### 7.4 Database Migrations
```bash
docker-compose exec calc-service alembic revision --autogenerate -m "description"
docker-compose exec calc-service alembic upgrade head
docker-compose exec calc-service alembic downgrade -1
```

---

## 8. Operations and Monitoring

- Health checks:  
  `http://localhost:3000/api/health` (frontend)  
  `http://localhost:8000/health` (calc)  
  `http://localhost:8010/health` (ML)  
  `http://localhost:8020/health` (PDF)  
  `http://localhost:8030/health` (LLM)

- Logging: all services emit structured JSON to stdout for container aggregation.
- Metrics: each FastAPI service exposes Prometheus-compatible metrics on `/metrics`.
- Error tracking: integrate Sentry by setting `SENTRY_DSN` and enabling the middleware in each service.

Security checklist:
- JWT-based authentication with refresh tokens.
- Role-based access control for admin routes.
- TLS termination via the ingress layer (Railway, Nginx, or reverse proxy of choice).
- Regular dependency scanning via GitHub Advanced Security or other tooling.

---

## 9. Documentation

Comprehensive architecture notes, API descriptions, runbooks, and troubleshooting tips live in [`DOCUMENTATION.md`](DOCUMENTATION.md). That file consolidates information for engineers, SREs, sustainability analysts, and sales engineers.

---

## 10. Licensing and Support

- License: MIT – see the [LICENSE](LICENSE) file.
- Issues: open a ticket on GitHub.
- Discussions & roadmap: create a GitHub Discussion or contact the maintainers at support@carbonscore.com.

---

## 11. Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-change`).
3. Commit with a descriptive message.
4. Open a pull request and link related issues.
5. Ensure linting, tests, and Docker builds succeed before requesting review.

Thank you for helping CarbonScore deliver actionable sustainability insights. For detailed workflows, refer to `DOCUMENTATION.md`.
