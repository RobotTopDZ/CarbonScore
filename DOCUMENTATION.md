# CarbonScore Technical Documentation

This document provides an end-to-end reference for architects, engineers, sustainability analysts, and SRE teams who work with CarbonScore. It consolidates information from deployment topology to API contracts and operational runbooks. The content is organized into the following sections:

1. [System Architecture](#1-system-architecture)  
2. [Services Overview](#2-services-overview)  
3. [Data and Storage](#3-data-and-storage)  
4. [APIs and Contracts](#4-apis-and-contracts)  
5. [Frontend Experience](#5-frontend-experience)  
6. [Deployment Models](#6-deployment-models)  
7. [Environment Configuration](#7-environment-configuration)  
8. [Development Workflow](#8-development-workflow)  
9. [Operations and Observability](#9-operations-and-observability)  
10. [Security and Compliance](#10-security-and-compliance)  
11. [Troubleshooting Guide](#11-troubleshooting-guide)  
12. [Future Enhancements](#12-future-enhancements)

---

## 1. System Architecture

CarbonScore follows a micro frontends + microservices model:

```
                     ┌──────────────────────────┐
                     │      Next.js Frontend     │
                     │  - Dashboard / Admin      │
                     │  - Questionnaire          │
                     │  - Report library         │
                     │  - Client-side auth       │
                     └──────────────┬────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────┐
│             FastAPI Microservices Layer                  │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ calc-svc   │  │ ml-svc     │  │ pdf-svc    │  ...    │
│  │ determ.    │  │ inference  │  │ reports    │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│          ▲               ▲              ▲               │
│          │               │              │               │
└──────────┼───────────────┼──────────────┼───────────────┘
           │               │              │
           ▼               ▼              ▼
       PostgreSQL     Redis / Cache   Object Storage
```

Key design tenets:
- **Separation of concerns**: calculation logic, ML models, LLM orchestration, and PDF generation all run in their own services.
- **API Gateway at frontend**: Next.js rewrites proxy `/api/*` requests to the backend host defined via `NEXT_PUBLIC_API_URL`.
- **Stateless services**: each FastAPI service is stateless. Persistence lives in Postgres, Redis, or storage.
- **Infrastructure as code**: Dockerfiles per service, docker-compose for local orchestration, and Railway for hosted deployments.

---

## 2. Services Overview

### 2.1 Frontend (`apps/web-nextjs`)
- Next.js 14 app directory.
- TailwindCSS for styling, Framer Motion for animations.
- React Query handles data fetching/caching.
- Contains: dashboards, questionnaire, reports library, admin panel.
- Communicates with backend via `/api/*` rewrites.

### 2.2 Calculation Service (`services/calc-service`)
- FastAPI app.
- Houses ADEME Base Carbone v17 factors (CSV ingestion under `data/`).
- Endpoints:
  - `POST /api/v1/calculate` – run deterministic carbon footprint computation.
  - `GET /api/v1/factors` – factor search (with pagination/filter).
  - `POST /api/v1/validation` – validate questionnaire payloads.
- Uses PostgreSQL for persistence and Redis for caching intermediate results.

### 2.3 ML Service (`services/ml-service`)
- FastAPI + background training modules.
- Provides:
  - Anomaly detection for questionnaire answers.
  - Imputation models for missing data.
  - Benchmarking APIs returning percentile info by sector.
- Integrates with MLflow for experiment tracking (optional).

### 2.4 PDF Service (`services/pdf-service`)
- FastAPI with ReportLab + Matplotlib.
- Responsible for generating branded reports as multi-page PDFs.
- Stores outputs under `services/pdf-service/data/reports/`.
- Maintains an index `reports_index.json` so the frontend can list historic reports with metadata (company, date, size, grade).
- API surface:
  - `POST /api/v1/pdf/generate`
  - `GET /api/v1/pdf/{filename}`
  - `GET /api/v1/pdf/reports`

### 2.5 LLM Service (`services/llm-service`)
- Interfaces with OpenRouter/OpenAI/Anthropic to produce executive summaries and recommendations.
- Embeds documents into pgvector for retrieval-augmented generation.
- Rate limiting and prompt templates are encapsulated in this service.

### 2.6 Worker Service (`services/worker-service`)
- Runs asynchronous jobs such as:
  - Batch recomputation of dashboards.
  - Scheduling PDF exports.
  - Syncing ADEME updates.
- Communicates with Redis / message broker for job queues.

---

## 3. Data and Storage

| Component            | Purpose                                             | Notes                                                     |
|---------------------|-----------------------------------------------------|-----------------------------------------------------------|
| PostgreSQL (pgvector)| Primary datastore for calculations, questionnaire responses, ML metadata | Provisioned via Docker Compose / Railway add-on          |
| Redis                | Caching, session storage, job queues                | Optional but recommended for production                  |
| File storage         | PDF binary outputs (`services/pdf-service/data`)    | Mount persistent volume in production                     |
| MLflow artifacts     | Models, metrics, and checkpoints                    | Configurable path via environment variables               |

Database migrations live in `services/calc-service` using Alembic.

---

## 4. APIs and Contracts

### 4.1 REST Conventions
- All endpoints are prefixed with `/api/v1`.
- JSON bodies and responses use snake_case for payload fields.
- Errors return `{ "error": "message" }` with appropriate HTTP status codes.
- Authentication is JWT-based (middleware not shown in public repo but hooks are present).

### 4.2 Example Endpoints

#### POST `/api/v1/calculate`
```
{
  "company": {
    "name": "Example SA",
    "sector": "Services",
    "employees": 120
  },
  "questionnaire": {
    "energy": {...},
    "transport": {...},
    "waste": {...}
  }
}
```
Response contains aggregated scopes, intensity per employee, financial ratios, and recommended next steps.

#### GET `/api/v1/pdf/reports`
Response:
```
{
  "reports": [
    {
      "id": "rapport_carbone_Example_20251114_084143",
      "title": "Rapport Empreinte Carbone - Example",
      "company_name": "Example",
      "generated_at": "2025-11-14T08:41:43Z",
      "template": "comprehensive",
      "grade": "B",
      "file_size": 2458624,
      "download_url": "/api/reports/file/rapport_carbone_Example_20251114_084143.pdf"
    }
  ]
}
```

#### POST `/api/v1/pdf/generate`
Accepts `ReportRequest` payload defined in `services/pdf-service/app/main.py` and returns filename, path, and size. On success the metadata gets appended to the report index for retrieval.

### 4.3 gRPC / Eventing
Not implemented. Future plan: emit events to a broker when calculations or reports finish (`calculation.completed`, `report.generated`).

---

## 5. Frontend Experience

### 5.1 Navigation
- `/dashboard`: emissions overview, metrics, charts, insights.
- `/actions`: catalogue of reduction initiatives with ROI, timeline, feasibility.
- `/reports`: library of generated PDFs with filtering, sorting, and download/view actions.
- `/questionnaire`: multi-step form capturing activity data.
- `/admin`: placeholder for account management and billing.

### 5.2 State Management
- React Query for data fetching and caching.
- Local storage used for storing `lastCalculationId` to retrieve dashboards tied to a run.
- Motion components provide subtle transitions but degrade gracefully if animations are disabled.

### 5.3 Theming and Accessibility
- Tailwind design tokens under `globals.css`.
- Heroicons ensure iconography without emojis, aligning with enterprise UX guidelines.
- Inputs and buttons follow WCAG contrast ratios, and forms include ARIA labels where applicable.

---

## 6. Deployment Models

### 6.1 Local Docker Compose
- Full stack via `docker-compose.yml`.
- Useful for integration testing and demos.

### 6.2 Railway (Recommended for hosted demos)
- Frontend deployed via `apps/web-nextjs/Dockerfile` using Next.js standalone output.
- Backend services can be deployed individually or behind an API gateway.
- Ensure environment variables match service URLs (particularly `NEXT_PUBLIC_API_URL` and `PDF_SERVICE_URL`).

### 6.3 Alternative Targets
- Kubernetes (Helm charts not provided yet).
- AWS ECS/Fargate with RDS/Postgres and Elasticache/Redis.
- Azure Container Apps with Azure Database for PostgreSQL.

---

## 7. Environment Configuration

Create a `.env` file at the project root. Key variables:

| Variable                | Description                                          |
|-------------------------|------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`   | Base URL for backend API (used by Next.js rewrites) |
| `PDF_SERVICE_URL`       | Direct URL to pdf-service                            |
| `DATABASE_URL`          | Postgres connection string                           |
| `REDIS_URL`             | Redis instance                                       |
| `OPENAI_API_KEY`        | LLM provider key (llm-service)                       |
| `GROK_API_KEY`          | Optional key for Grok integration                    |
| `CLAUDE_API_KEY`        | Optional key for Anthropic Claude                    |
| `NEXTAUTH_SECRET`       | Secret for NextAuth (future auth integration)        |
| `SENTRY_DSN`            | Error tracking integration                           |

Each service folder may also contain its own `.env` file or config module if more granularity is needed.

---

## 8. Development Workflow

1. **Bootstrap**  
   - `npm install` inside `apps/web-nextjs`.  
   - `pip install -r requirements.txt` inside each Python service.

2. **Code Quality**  
   - Frontend: `npm run lint`, `npm run test`, `npm run type-check`.  
   - Backend: `ruff`, `black`, `pytest`, `mypy` (not all enforced yet but recommended).

3. **Feature flags**  
   - Use `NEXT_PUBLIC_` prefixed env vars for frontend toggles.
   - Backend toggles live in `.env` and can be exposed via `/settings`.

4. **Pull Requests**  
   - Include context, screenshots, and testing evidence.
   - Ensure report index compatibility when touching pdf-service.

---

## 9. Operations and Observability

### 9.1 Logging
- JSON logs with request IDs.  
- Example log entry (FastAPI):
```
{
  "timestamp": "2025-11-14T09:00:00Z",
  "service": "pdf-service",
  "level": "INFO",
  "message": "PDF report generated successfully",
  "company": "Example SA",
  "filename": "rapport_carbone_Example_20251114_090000.pdf"
}
```

### 9.2 Metrics
- Expose Prometheus metrics via `/metrics` (enable `prometheus_fastapi_instrumentator`).
- Suggested dashboards:
  - Calculation duration and throughput.
  - Report generation latency and error rate.
  - LLM token usage per provider.

### 9.3 Alerting
- Configure alert rules for:
  - Consecutive calculation errors.
  - PDF generation failures.
  - High 95th percentile response times.
  - Queue depth anomalies in worker service.

---

## 10. Security and Compliance

- **Transport security**: enforce TLS at the ingress layer; configure `NEXTAUTH_URL` with HTTPS.
- **Data encryption**: Postgres at rest encryption via hosting provider. Secrets stored in Railway or cloud secret manager.
- **Access control**: JWT-based API security (future iteration will include NextAuth integration with OAuth providers).
- **GDPR considerations**:
  - Provide data-export endpoints for questionnaire responses.
  - Support deletion requests via worker service jobs.
- **Logging hygiene**: avoid writing personal data to logs; mask API keys before logging.

---

## 11. Troubleshooting Guide

| Symptom                                   | Likely Cause                                   | Resolution                                                                    |
|-------------------------------------------|------------------------------------------------|-------------------------------------------------------------------------------|
| Frontend cannot reach `/api/*`            | `NEXT_PUBLIC_API_URL` misconfigured            | Update `.env`, rebuild Next.js, or configure Railway environment variable.    |
| PDF download returns 404                  | Report not indexed or storage missing          | Ensure pdf-service has write access; check `data/reports_index.json`.         |
| Dashboard shows “Aucune donnée disponible”| No calculation ID stored locally               | Re-run questionnaire or set `lastCalculationId` manually via local storage.   |
| Worker jobs stuck                         | Redis unavailable or queue misconfigured       | Validate `REDIS_URL`, ensure worker container is running, inspect logs.       |
| LLM requests fail                         | Missing API keys or rate limiting              | Check `OPENAI_API_KEY`/`GROK_API_KEY`; add exponential backoff or caching.    |
| Railway deployment serves backend port    | Wrong root directory or Dockerfile selection   | Set root to `apps/web-nextjs` and use provided Dockerfile.                    |

---

## 12. Future Enhancements

1. **Full Auth Integration** – NextAuth + JWT bridging front and backend.
2. **Multi-tenant Isolation** – organization-based RBAC and data partitioning.
3. **Advanced Analytics** – predictive modeling for reduction trajectories, abatement curves.
4. **Marketplace Integrations** – connectors to ERP systems (SAP, Netsuite) and carbon accounting tools.
5. **Mobile-Ready UX** – responsive design improvements and offline data collection.
6. **Infrastructure as Code** – Terraform modules for AWS/Azure/GCP.

---

This documentation evolves with the platform. When submitting significant changes (e.g., new services, major API additions), update this file alongside the code to keep all stakeholders aligned.

