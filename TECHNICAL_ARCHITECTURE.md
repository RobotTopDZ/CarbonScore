# CarbonScore: Technical Architecture & "Unfair Advantages"

**Goal:** Explain *why* our tech stack makes us faster, smarter, and more scalable than competitors.

---

## 🏗️ High-Level Architecture
Our platform is built on a modern, **Microservices-First** architecture, ensuring scalability and modularity.

### 1. The Frontend (The "Face")
*   **Tech:** **Next.js (React)** + **Tailwind CSS** + **Framer Motion**.
*   **Why:** Delivers the "15-Minute Audit" experience. Fast, responsive, and interactive.
*   **Key Feature:** **Adaptive Questionnaire**. The UI changes dynamically based on user answers (e.g., selecting "Logistics" hides "Office" questions), reducing friction.

### 2. The Calculation Engine (The "Brain")
*   **Tech:** **Python (FastAPI)** + **Pandas** + **ADEME Database**.
*   **Why:** **Deterministic Precision**. Unlike Excel or simple scripts, this is a robust engine that handles unit conversions, factor versioning, and complex mapping rules.
*   **Unfair Advantage:** **Traceability**. Every calculation is tagged with the exact Source ID and Version of the emission factor used.

### 3. The AI & Vector Core (The "Intelligence")
*   **Tech:** **pgvector (PostgreSQL)** + **LLM Service (Minimax/OpenAI)**.
*   **Why:** Enables the **"AI Sustainability Analyst"**.
*   **How it works:**
    1.  **Vector Search:** We embed emission factors and user data into a vector space.
    2.  **RAG (Retrieval-Augmented Generation):** When generating advice, we retrieve relevant *technical* context (e.g., specific reduction potentials) and feed it to the LLM.
    3.  **Result:** The AI doesn't hallucinate; it "reasons" based on hard data.

### 4. The Reporting Service (The "Proof")
*   **Tech:** **ReportLab (Python)** + **Microservice**.
*   **Why:** **Audit-Readiness**. Generates pixel-perfect, compliant PDF reports instantly.
*   **Unfair Advantage:** **Decoupled Generation**. The reporting logic is separate from the calculation, allowing us to swap templates (CSRD vs GHG Protocol) without touching the math.

---

## 🚀 The "Unfair Advantages" (Tech Edition)

| Feature | Competitor Tech | CarbonScore Tech | Benefit |
| :--- | :--- | :--- | :--- |
| **Factor Matching** | Keyword Search (SQL LIKE) | **Vector Embeddings (pgvector)** | We find "closest matches" even with typos or synonyms. |
| **Scenario Analysis** | Static "If/Else" Logic | **LLM-Driven Simulation** | We generate unlimited, personalized scenarios. |
| **Scalability** | Monolithic App (Django/Rails) | **Dockerized Microservices** | We can scale the Calculation engine independently of the UI. |
| **Deployment** | Cloud Only | **Docker Compose / On-Prem** | We can deploy inside a bank's secure server. |

---

## 🔒 Security & Compliance
*   **Data Isolation:** Each client's data is logically separated.
*   **GDPR:** "Privacy by Design". Personal data is minimized.
*   **Encryption:** All data encrypted at rest (DB) and in transit (TLS).

---

## 🔮 Future Tech Roadmap
1.  **Automated Ingestion:** OCR service to read PDF invoices and auto-fill the questionnaire.
2.  **Real-Time API:** Webhooks to trigger calculations whenever a client adds a row to their ERP.
3.  **Blockchain Verification:** Hash the PDF reports on a public ledger for immutable proof of audit.
