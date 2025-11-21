# CarbonScore: Strategic Business Plan & Market Positioning

## 1. Executive Summary
**Vision:** To become the **technical standard for ADEME-based carbon accounting**, positioning CarbonScore not just as a reporting tool, but as the world's first **AI-native Sustainability Analyst**.

**Mission:** Democratize high-precision, audit-ready carbon accounting for SMEs while providing enterprise-grade automation and intelligence for complex organizations.

**Core Philosophy:** Unlike competitors (e.g., Greenly) who focus on broad approximation, CarbonScore bets on **precision, transparency, and AI-driven actionability**. We don't just tell companies *what* their footprint is; we tell them *exactly why* (auditability) and *how to fix it* (action engine).

---

## 2. Unique Value Proposition (The "Unfair Advantages")

We differentiate by solving the "Black Box" problem of current carbon platforms.

### 🏗️ Technical Trust & Auditability
1.  **ADEME-Native Deterministic Engine**:
    *   **Differentiation**: While others use generic factors, we implement the full **ADEME Base Carbone v17/v18** with strict versioning.
    *   **Feature**: "Scenario Diffs" showing how footprint changes between regulatory versions.
    *   **Trust**: Full lineage and citation for every emission factor used.

2.  **Open Carbon Model & Vector Intelligence**:
    *   **Differentiation**: Competitors use simple database lookups. We use **pgvector embeddings**.
    *   **Feature**: "Smart Factor Matching" – finding the mathematically closest emission factor for obscure supplier items.
    *   **Feature**: "Cluster Benchmarking" – using k-NN to find truly similar companies for realistic comparison.

3.  **Audit-Ready by Design**:
    *   **Differentiation**: Automated generation of **ISO 14064 / GHG Protocol / CSRD** compliant reports.
    *   **Feature**: Embedded QR codes in PDFs to verify calculation integrity.

### 🧠 AI-First Innovation
4.  **The "AI Sustainability Analyst"**:
    *   **Differentiation**: Beyond generic text generation, our LLM pipeline is trained on carbon accounting standards.
    *   **Feature**: Automated drafting of CSRD narratives.
    *   **Feature**: Explains *why* a specific factor was chosen, acting as an automated auditor.

5.  **Hyper-Personalized Action Engine**:
    *   **Differentiation**: Moving from "Switch to LED" (generic) to "Switching Supplier X to Y saves 14 tons CO₂" (specific).
    *   **Feature**: Real-time simulation of reduction scenarios with ROI and timeline analysis.
    *   **Feature**: The "Grammarly of Carbon Reduction" – constant, proactive suggestions.

### ⚡ Speed & UX
6.  **SME-First "15-Minute Audit"**:
    *   **Differentiation**: Drastically reducing onboarding time from hours to minutes.
    *   **Feature**: Industry-specific preset templates (SaaS, Logistics, Retail).
    *   **Feature**: AI OCR for instant invoice-to-emission conversion.

---

## 3. Business Model & Pricing Strategy

Our pricing model is designed to lower barriers to entry (viral growth) while monetizing complexity and automation (enterprise value).

### 🟢 Core Plan (The "Viral Entry")
*Target: SMEs, Startups, First-time Reporters*
*   **Price**: Free (Invite-only or Freemium)
*   **Strategy**: Build the network effect. Get companies onto the standard.
*   **Features**:
    *   ✅ Scope 1 & 2 Emissions
    *   ✅ Manual Data Imports
    *   ✅ Basic Impact Profile & Dashboard
    *   ✅ Unlimited Users
    *   ✅ Access to Knowledge Base
    *   ✅ Standard ADEME Report

### 🔵 Growth Plan (The "SME Standard")
*Target: Growing Companies, Supply Chain Actors*
*   **Price**: Monthly Subscription (e.g., €199/mo)
*   **Strategy**: Monetize Scope 3 and supply chain integration.
*   **Features**:
    *   ✅ **Everything in Core +**
    *   ✅ **Full Scope 3 Analysis**
    *   ✅ **AI Invoice Processing** (up to 500/mo)
    *   ✅ **Supply Chain Network**: Connect up to 100 value chain partners
    *   ✅ **Action Engine**: Basic reduction scenarios
    *   ✅ **Audit Trail**: Basic export for auditors
    *   ✅ **2 Strategic Check-ins/Year**

### 🟣 Impact Plan (The "Enterprise Engine")
*Target: Large Enterprises, Regulated Industries, Consultancies*
*   **Price**: Custom / High-Tier Subscription (e.g., €1,500+/mo)
*   **Strategy**: Monetize automation, compliance, and deep AI customization.
*   **Features**:
    *   ✅ **Everything in Growth +**
    *   ✅ **Automation Hub**: API access & ERP Integrations
    *   ✅ **AI Infusion**: Unlimited "AI Analyst" queries & CSRD drafting
    *   ✅ **Regulatory Frameworks**: CSRD, ISO 14064, GHG Protocol compliant reports
    *   ✅ **Unlimited Supply Chain Mapping**
    *   ✅ **Due Diligence Surveys** for suppliers
    *   ✅ **White-Label Options** (for consultancies)
    *   ✅ **Quarterly Strategic Reviews**

---

## 4. Go-To-Market (GTM) Strategy

### Phase 1: The "Technical Authority" (Months 1-6)
*   **Focus**: Build trust and prove the "Technical Standard" claim.
*   **Tactics**:
    *   **Launch "Open ADEME Explorer"**: A free, public tool to search emission factors with API access. Captures SEO traffic from people searching for "emission factor for X".
    *   **Content Marketing**: "The Carbon Engineering Blog" – deep dives into calculation methodologies, "How we calculated X vs Greenly".
    *   **Developer Outreach**: Release the API documentation early. Position as "Stripe for Carbon".

### Phase 2: The "SME Blitz" (Months 6-12)
*   **Focus**: User acquisition via the "15-Minute Audit".
*   **Tactics**:
    *   **Vertical Campaigns**: Targeted landing pages for specific industries (e.g., "Carbon Accounting for Logistics Companies").
    *   **Partner Program**: Integrate with accounting software (QuickBooks, Xero) to offer "1-click carbon estimates".
    *   **Referral Loop**: "Invite your suppliers to the Core Plan to unlock your Scope 3 accuracy."

### Phase 3: The "Enterprise & API Ecosystem" (Year 2+)
*   **Focus**: High LTV contracts and platform dominance.
*   **Tactics**:
    *   **Consultant Edition**: Offer the platform to independent sustainability consultants to manage their clients. They become our sales force.
    *   **White-Label API**: Power the sustainability features of banks, procurement platforms, and HR tools.
    *   **On-Premise Deployment**: Pitch the Docker/Self-hosted option to defense, government, and highly regulated sectors.

---

## 5. Technical Roadmap & Architecture Alignment

Your current architecture is perfectly positioned to execute this plan:

*   **Frontend (Next.js)**:
    *   *Action*: Build the "15-minute onboarding" wizard with industry templates.
    *   *Action*: Enhance the Dashboard to visualize "Scenario Diffs".

*   **Backend (FastAPI Microservices)**:
    *   **Calculation Service**: Harded the ADEME v17 implementation. Add "Traceability" metadata to every result.
    *   **ML Service**: Expand `pgvector` usage for "Smart Factor Matching" and "Cluster Benchmarking".
    *   **PDF Service**: Implement the "Regulatory Mode" switch (CSRD vs GHG Protocol layouts) and QR code signing.

*   **LLM Service**:
    *   *Action*: Fine-tune the prompt engineering for the "Analyst" persona.
    *   *Action*: Implement RAG (Retrieval-Augmented Generation) using the vector store to ground AI answers in ADEME documentation.

---

## 6. Key Differentiators Summary (The "Why Us?")

| Feature | Competitors (e.g., Greenly) | CarbonScore |
| :--- | :--- | :--- |
| **Methodology** | Black Box / Approximate | **Transparent / Deterministic ADEME v17** |
| **AI Role** | Generic Text Gen | **Audit-Ready Analyst & Action Engine** |
| **Onboarding** | Consultant-heavy (Hours) | **Self-serve (15 Minutes)** |
| **Scope 3** | Manual / Survey-based | **AI-Inferred / Supplier Network** |
| **Deployment** | SaaS Only | **SaaS + On-Premise / Docker** |
| **Ecosystem** | Closed Garden | **API-First / Open Model** |

---

## 7. Financial Projections & KPIs

*   **North Star Metric**: **Tons of CO₂e Under Management (TUM)**.
*   **Secondary Metric**: **High-Confidence Scope 3 %** (Percentage of Scope 3 emissions based on real supplier data vs estimates).
*   **Revenue Goal**:
    *   Year 1: Acquire 500 Core users, convert 10% to Growth.
    *   Year 2: Launch API partnerships, secure 5 Enterprise/Impact clients.

---

*This document serves as the strategic blueprint for CarbonScore's development and market entry.*
