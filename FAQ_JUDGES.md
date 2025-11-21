# CarbonScore: Judge Q&A Cheat Sheet

**Goal:** Anticipate the tough questions and have data-backed, confident answers ready.

---

## ❓ Market & Competition

**Q: "How are you different from Greenly / Sweep / Watershed?"**
*   **Answer:** "Great question. They are 'Generalist SaaS' platforms. We are the **Specialist SME Standard**.
    1.  **Precision:** They often use spend-based estimates (monetary factors). We use activity-based ADEME factors (physical units) which is far more accurate.
    2.  **AI Depth:** Their AI generates text. Our AI generates *scenarios* and *math*. We simulate the ROI of actions, they just list them.
    3.  **SME Focus:** Their onboarding takes hours/days. Ours takes 15 minutes."

**Q: "Is the market big enough? SMEs don't have money."**
*   **Answer:** "The market is shifting. It's no longer voluntary. The **CSRD (Corporate Sustainability Reporting Directive)** in Europe forces 50,000 large companies to report Scope 3. This means they are *forcing* their millions of SME suppliers to report data. We sell the shovel to the suppliers who *must* dig."

**Q: "Why would an SME pay for this?"**
*   **Answer:** "Two reasons: **Compliance** (keeping their clients) and **Cost Savings**. Our AI identifies energy and waste inefficiencies that save them money. The ROI of the software is positive just from the energy savings alone."

---

## ❓ Technology & AI

**Q: "Is your AI actually accurate? LLMs hallucinate."**
*   **Answer:** "That's why we use a **RAG (Retrieval-Augmented Generation)** architecture. We don't let the LLM guess emission factors. We use deterministic code for the math (ADEME engine) and use the LLM only for the *reasoning* and *qualitative analysis* (Action Plans). The numbers are hard-coded; the advice is AI-generated."

**Q: "What happens if ADEME changes their factors?"**
*   **Answer:** "Our engine is versioned. We can re-run past calculations with new factors instantly and show a 'Diff Report'. This is a key advantage of our deterministic backend over spreadsheet-based competitors."

**Q: "How do you handle data privacy with AI?"**
*   **Answer:** "We offer a self-hosted / Docker option for sensitive clients. Furthermore, we anonymize data before sending it to the LLM for trend analysis. We are GDPR compliant by design."

---

## ❓ Business Model

**Q: "How do you acquire customers cheaply?"**
*   **Answer:** "Through the **Supply Chain Viral Loop**. We target one large buyer (e.g., a Retailer) and give them a bulk discount to invite their 500 suppliers to our 'Core Plan'. This lowers our CAC (Customer Acquisition Cost) to near zero for those SMEs."

**Q: "Why give the Core Plan away for free?"**
*   **Answer:** "Data is the moat. By getting thousands of SMEs on the standard, we build the largest proprietary dataset of SME emissions. We monetize the *value* (Scope 3, AI insights, API access), not the *entry*."

---

## ❓ Future & Scale

**Q: "What is your exit strategy?"**
*   **Answer:** "We aim to become the standard operating system for carbon data. This makes us a prime acquisition target for major ERPs (SAP, Oracle) or Accounting Software (Intuit, Sage) who need to add a 'Carbon Ledger' to their financial ledger."

**Q: "How do you scale to other countries?"**
*   **Answer:** "Our architecture is factor-agnostic. We currently load ADEME (France), but we can plug in **EPA (USA)** or **DEFRA (UK)** databases into our vector store. The engine remains the same; only the reference data changes."
