# System Architecture

This meticulously engineered document provides a highly technical, structural overview of the **AI Career Pilot** application architecture. It is designed to demonstrate the platform's robust serverless capabilities, its secure data flow, and its complex algorithmic implementations.

## 🏗️ High-Level Architectural Overview

The application is deployed as a highly advanced **Modular Monolith** utilizing the **Next.js 15 App Router**. It completely bypasses traditional separate backend provisioning by routing all secure mutation logic and third-party API interactions through strictly guarded **Next.js Server Actions**. 

### Core System Tiers

1.  **Presentation & Interaction Tier (Frontend)**:
    -   Engineered with **React 19** utilizing **Tailwind CSS** for fluid, responsive Utility-First styling.
    -   Integrates **Shadcn UI** primitives to ensure enterprise-grade accessibility and visual consistency.
    -   Client Components specifically handle complex interactive states (e.g., Markdown Resume editing, interactive Role Cards), heavily shielded by **React Hook Form** and **Zod** schema validations to guarantee data integrity before transmission.
    -   React Server Components aggressively handle initial data fetching, dramatically reducing the Client-Side Javascript payload and maximizing Core Web Vitals (LCP/CLS).

2.  **Core Logic & Execution Tier (Backend)**:
    -   **Next.js Server Actions**: Function as the impregnable backend API layer, executing secure database mutations and communicating with external LLMs without exposing proprietary keys to the browser environment.
    -   **Inngest Background Orchestrator**: Strategically implemented to offload heavy, long-running AI generative tasks (like 12-month roadmaps). By placing these on an asynchronous queue, the system prevents crippling serverless function timeouts and ensures reliable execution despite network latency.
    -   **Temporal Cache Layer**: Utilizes Next.js `unstable_cache` with a strict Time-To-Live (TTL) algorithmic approach to intercept and serve redundant external API requests instantly.

3.  **Data Persistence Tier (Database)**:
    -   **Serverless PostgreSQL (Neon DB)**: Chosen specifically for its ability to scale compute independently of storage, seamlessly handling traffic spikes without manual dev-ops intervention.
    -   **Prisma ORM**: The absolute boundary for database interactions, providing rigid type-safety and mitigating classical SQL injection vulnerabilities via programmatic schema modelling (`prisma/schema.prisma`).

4.  **External Intelligence & Integration Tier**:
    -   **Google Gemini 2.0 Flash API**: The cognitive nucleus of the platform, executing deep semantic parsing, structural synthesis, and complex contextual reasoning.
    -   **JSearch RapidAPI**: The live aggregation engine fetching real-time global and local internship data.

---

## 🔬 Core Algorithms Implemented

To achieve its elite level of career optimization, the platform relies on four critical proprietary logical algorithms:

### 1. Generative Intelligence Chain-of-Thought (CoT)
The system never requests raw list outputs from the LLM. Instead, it programmatically forces the AI to execute a multi-step sequence: first analyzing the user's specific "Skill Gap", second computing the chronological learning requirement, and finally formatting strictly to a pre-defined JSON schema. This guarantees high-fidelity, mathematically consistent outputs.

### 2. Weighted Scoring System Algorithm
During career path computation, the logic assigns disparate mathematical weights to user inputs based on presumed impact. Hard technical skills and historical industry experience receive a higher computational vector than innate psychological traits, allowing the engine to quantitatively rank and present the top 3 recommended optimal career paths with extreme accuracy.

### 3. Progression Difficulty Simulation Algorithm
The interactive Mock Interview state machine actively monitors the user's real-time feedback success rate. Successfully answering initial "Intermediate" competency questions automatically triggers the algorithmic logic to increase the difficulty parameter of the subsequent generated payload, effectively simulating the escalating stress of a genuine corporate technical screen.

### 4. Temporal Caching (TTL) Hash Algorithm
To aggressively mitigate API rate-limits, the platform employs a rigid caching algorithm set to 3600 seconds (1 hour). It dynamically generates an encrypted hash key derived from the User ID, requested Career Path, City, and Country. A hash collision securely bypasses the external JSearch HTTP request, immediately serving the JSON payload from memory.

---

## 🗂️ Logical Directory Structure

```text
ai-career-pilot/
├── app/                  # Next.js Presentation Routing Layer
│   ├── (auth)/           # Clerk Auth Interception (sign-in/up)
│   ├── (main)/           # Protected Application Core
│   │   ├── onboarding/   # Multi-layered diagnostic assessment routing
│   │   ├── dashboard/    # Centralized analytics hub
│   │   ├── resume/       # Markdown Editor & ATS optimization view
│   │   ├── ai-cover-letter/ # Job Description synthesis view
│   │   ├── interview/    # Dynamic progression mock interview sandbox
│   │   ├── internships/  # Location-aware cached opportunity hub
│   │   └── roadmap/      # Temporal AI learning trajectory view
├── actions/              # Secure API & Mutation Endpoints
│   ├── assessment.js     # Executes AI evaluation logic
│   ├── internships.js    # Manages JSearch interactions & TTL Cache
│   ├── roadmap.js        # Synthesizes learning paths
│   └── interview.js      # Processes algorithmic difficulty grading
├── components/           # Reusable Atomic UI Library
│   ├── ui/               # Shadcn styled raw primitives
│   └── header.jsx        # Global navigation orchestration
├── lib/                  # Independent Utility Hub
│   ├── prisma.js         # Instantiates connection pooling
│   ├── inngest/          # Defines asynchronous background queues
│   └── gemini.js         # Secures and executes Google LLM payloads
└── prisma/               # Data Persistence Architecture
    └── schema.prisma     # Relational Postgres schema definitions
```

---

## 🔄 Core Data & Execution Flows

### 1. Parallel Internship Retrieval 
1. **User Request**: Client navigates to `/internships`.
2. **Hash Check**: Server requests local memory for valid 1-hour cache snippet.
3. **Execution Concurrency (On Cache Miss)**: Server Action initiates two *simultaneous* asynchronous requests to JSearch (one bounded for local physical roles, one bound for remote global roles).
4. **Data Unification**: The two independent Promise arrays resolve, merge, and write to the Next.js cache.
5. **Client Render**: Data is streamed down to the React UI component.

### 2. Generative Artificial Intelligence Delegation (Inngest)
To prevent the notorious serverless 15-second timeout during deep reasoning (like executing a highly complex 12-month roadmap):
1. **Action Trigger**: User submits valid Zod-checked form data to Server Action.
2. **Event Dispatch**: Server Action dispatches an event payload exclusively to the Inngest queue and immediately returns a "Processing" state to the user.
3. **Background Execution**: Inngest robustly manages the Gemini API request, handling built-in retries for network drops.
4. **Database Commit**: Upon success, Inngest writes the finalized JSON directly to the Neon Postgres Database.
5. **Revalidation**: Next.js automatically detects the data change and re-hydrates the User's dashboard.

---

## 🔐 Enterprise-Grade Security Implementation

- **Data Boundaries**: Absolutely no SQL queries or proprietary API Keys (e.g., `GEMINI_API_KEY`) are ever accessible to the browser's `window` object. They are sealed entirely within Server Actions.
- **Parametric Defense**: The integration of **Zod** schema validation enforces rigorous mathematical checks on user-submitted data (preventing malicious string injections or payload overflow vulnerabilities).
- **Identity Enforcement**: **Clerk Middleware** operates at the Edge network layer, instantly hijacking unauthorized requests and verifying cryptographic JWT tokens before the server ever begins rendering application code.
- **Relational Integrity**: **Prisma ORM** strictly scopes read/mutate queries utilizing the inherently secure `clerkUserId` parameter, ensuring it is mathematically impossible for a tenant to query assessment data belonging to another user.
