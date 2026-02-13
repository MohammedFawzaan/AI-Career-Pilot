# System Architecture

This document provides a technical overview of the **AI Career Pilot** application architecture.

## 🏗️ High-Level Overview

The application is built as a **monolithic Next.js 15 application** leveraging the **App Router** for routing and **Server Actions** for backend logic. It integrates with external services for authentication (Clerk), database (Neon/PostgreSQL), and AI capabilities (Google Gemini).

### Core Components

1.  **Frontend (Client)**:
    -   Built with **React 19** and **Tailwind CSS**.
    -   Uses **Shadcn UI** for a consistent and accessible component library.
    -   Client Components handle interactive elements (forms, resume editor).
    -   Server Components handle data fetching and SEO optimization.

2.  **Backend (Server)**:
    -   **Next.js Server Actions**: Replaces traditional API routes for direct database mutations and third-party API calls.
    -   **Prisma ORM**: Type-safe database access layer interacting with PostgreSQL.
    -   **Inngest**: Handles background jobs and reliable execution for long-running tasks like AI content generation.

3.  **Database**:
    -   **PostgreSQL (Neon)**: Relational database storing user profiles, resumes, cover letters, and interview sessions.
    -   **Schema**: managed via `prisma/schema.prisma`.

4.  **AI Engine**:
    -   **Google Gemini API**: Powers the core "intelligence" features (resume writing, Q&A generation, cover letter drafting).

## 🗂️ Directory Structure

```
ai-career-coach/
├── app/                  # Application Routes
│   ├── (auth)/           # Route Group: Authentication (sign-in, sign-up)
│   ├── (main)/           # Route Group: Protected Main App (Dashboard, Tools)
│   ├── api/              # API Endpoints (Webhooks, Cron Jobs)
│   └── layout.js         # Root Layout (Providers, Navbar)
├── actions/              # Server Actions
│   ├── user.js           # User profile & onboarding logic
│   ├── resume.js         # Resume creation & AI generation
│   └── interview.js      # Mock interview handling
├── components/           # UI Components
│   ├── ui/               # Shadcn UI primitives (Button, Card, etc.)
│   ├── resume/           # Resume builder specific components
│   └── dashboard/        # Dashboard widgets
├── lib/                  # Utilities
│   ├── prisma.js         # Prisma Client instance
│   ├── inngest/          # Inngest client & function definitions
│   └── gemini.js         # Google Gemini API helper
└── prisma/               # Database
    └── schema.prisma     # Database Schema
```

## 🔄 Key Data Flows

### 1. AI Content Generation
To prevent timeouts and ensure reliability, AI generation often follows an asynchronous pattern:
1.  **User Trigger**: User requests a cover letter.
2.  **Server Action**: Validates input and triggers an Inngest event (or calls API directly for short tasks).
3.  **Processing**: The AI model processes the request.
4.  **Database Update**: The result is saved to the database.
5.  **UI Update**: The UI streams the response or updates via `revalidatePath`.

### 2. Authentication Flow
-   **Clerk Middleware** protects `/dashboard` and other private routes.
-   Public routes (Landing page) are accessible without auth.
-   Post-login, users are checked for "onboarding status". If incomplete, they are redirected to `/onboarding`.

## 🛠️ Deployment

-   **Frontend/Backend**: Vercel (recommended for Next.js).
-   **Database**: Neon (Serverless Postgres).
-   **Cron/Queue**: Inngest (integrates seamlessly with Vercel).
