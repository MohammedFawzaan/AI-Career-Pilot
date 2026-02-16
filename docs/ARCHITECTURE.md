# System Architecture

This document provides a technical overview of the **AI Career Pilot** application architecture.

## 🏗️ High-Level Overview

The application is built as a **monolithic Next.js 15 application** leveraging the **App Router** for routing and **Server Actions** for backend logic. It integrates with external services for authentication (Clerk), database (Neon/PostgreSQL), AI capabilities (Google Gemini), and job search (JSearch RapidAPI).

### Core Components

1.  **Frontend (Client)**:
    -   Built with **React 19** and **Tailwind CSS**.
    -   Uses **Shadcn UI** for a consistent and accessible component library.
    -   Client Components handle interactive elements (forms, resume editor, role cards).
    -   Server Components handle data fetching and SEO optimization.
    -   Loading states with skeleton components for smooth UX.

2.  **Backend (Server)**:
    -   **Next.js Server Actions**: Replaces traditional API routes for direct database mutations and third-party API calls.
    -   **Prisma ORM**: Type-safe database access layer interacting with PostgreSQL.
    -   **Inngest**: Handles background jobs and reliable execution for long-running tasks like AI content generation.
    -   **Caching Layer**: Next.js `unstable_cache` for API response optimization.

3.  **Database**:
    -   **PostgreSQL (Neon)**: Relational database storing user profiles, career assessments, roadmaps, and feedback.
    -   **Schema**: Managed via `prisma/schema.prisma`.
    -   **Key Models**:
        - `User`: Profile, location, skills, experience
        - `CareerAssessment`: Assessment data, AI analysis, selected role
        - `Roadmap`: AI-generated learning paths
        - `AssessmentFeedback`: User feedback (immutable)

4.  **AI Engine**:
    -   **Google Gemini 2.0 Flash**: Powers core intelligence features:
        - Career assessment analysis
        - Resume optimization
        - Cover letter generation
        - Interview question generation
        - Career roadmap creation

5.  **External APIs**:
    -   **JSearch RapidAPI**: Live job and internship data
    -   **Caching**: 1-hour cache to reduce API calls and costs

## 🗂️ Directory Structure

```
ai-career-pilot/
├── app/                  # Application Routes
│   ├── (auth)/           # Route Group: Authentication (sign-in, sign-up)
│   ├── (main)/           # Route Group: Protected Main App
│   │   ├── onboarding/   # User onboarding flow
│   │   │   ├── selection/      # User type selection
│   │   │   ├── assessment/     # Career assessment
│   │   │   ├── career-path/    # Results & role selection
│   │   │   └── page.jsx        # Profile setup
│   │   ├── dashboard/    # Main dashboard
│   │   ├── resume/       # Resume builder
│   │   ├── ai-cover-letter/  # Cover letter generator
│   │   ├── interview/    # Mock interviews
│   │   ├── internships/  # Internship search (with loading.jsx)
│   │   ├── roadmap/      # Career roadmap (with loading.jsx)
│   │   └── profile/      # Profile management
│   ├── api/              # API Endpoints (Webhooks, Inngest)
│   └── layout.js         # Root layout (Providers, Navbar)
├── actions/              # Server Actions
│   ├── user.js           # User profile & management
│   ├── assessment.js     # Career assessment logic
│   ├── internships.js    # Internship fetching (with caching)
│   ├── roadmap.js        # Roadmap generation
│   ├── feedback.js       # Feedback system (immutable)
│   ├── resume.js         # Resume creation & AI generation
│   └── interview.js      # Mock interview handling
├── components/           # UI Components
│   ├── ui/               # Shadcn UI primitives (Button, Card, Badge, etc.)
│   ├── header.jsx        # Navigation header
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utilities
│   ├── prisma.js         # Prisma Client instance
│   ├── inngest/          # Inngest client & function definitions
│   ├── gemini.js         # Google Gemini API helper
│   └── checkUser.js      # User verification utilities
├── data/                 # Static data
│   └── industries.js     # Industry list
└── prisma/               # Database
    └── schema.prisma     # Database Schema
```

## 🔄 Key Data Flows

### 1. Career Assessment Flow
1.  **User Selection**: User chooses Fresher or Experienced
2.  **Assessment Start**: Multi-layered questionnaire (4 questions per layer)
3.  **AI Analysis**: Gemini analyzes responses and generates recommendations
4.  **Results Display**: Top 3 roles, industries, countries, skills gap
5.  **Role Selection**: User selects a career path (marked as "Current Path")
6.  **Profile Setup**: AI pre-fills industry, skills, bio based on selected role
7.  **Database Save**: User profile and assessment data stored
8.  **Feedback**: Optional one-time feedback submission

### 2. Internship Search Flow
1.  **User Navigation**: User visits `/internships` page
2.  **Loading State**: Skeleton loader displayed
3.  **Cache Check**: System checks for cached results (1-hour TTL)
4.  **API Calls** (if cache miss):
    - Parallel fetch: Local internships (if location set) + Remote internships
    - JSearch API queries based on primaryRole and location
5.  **Filtering**: Results filtered for internship-related keywords
6.  **Cache Store**: Results cached with key: userId + role + location
7.  **Display**: Separate sections for local and remote opportunities
8.  **Apply**: Users click through to external job applications

### 3. AI Content Generation
To prevent timeouts and ensure reliability, AI generation follows an asynchronous pattern:
1.  **User Trigger**: User requests content (resume, cover letter, roadmap)
2.  **Server Action**: Validates input and triggers Inngest event (or calls API directly for short tasks)
3.  **Processing**: Gemini AI processes the request
4.  **Database Update**: Result saved to database
5.  **UI Update**: UI streams response or updates via `revalidatePath`

### 4. Authentication Flow
-   **Clerk Middleware** protects `/dashboard` and other private routes
-   Public routes (Landing page) accessible without auth
-   Post-login redirect to `/onboarding/selection` for new users
-   Existing users redirect to `/dashboard`
-   User verification via `checkUser()` utility

### 5. Feedback Flow
1.  **User Completes Assessment**: Assessment results displayed
2.  **Feedback Form**: User sees feedback form at bottom of career-path page
3.  **One-Time Submission**: User submits rating, accuracy, and optional comment
4.  **Validation**: Server checks if feedback already exists
5.  **Database Save**: Feedback stored (if new) or error thrown (if exists)
6.  **Read-Only Display**: Submitted feedback shown in green card
7.  **No Updates**: Feedback is immutable after submission

## 🚀 Performance Optimizations

### Caching Strategy
-   **Internship API**: 1-hour cache using `unstable_cache`
-   **Cache Keys**: Unique per user, role, and location
-   **Benefits**: 66-75% reduction in API calls, faster page loads

### Parallel Processing
-   **Internship Fetching**: Local and remote searches run in parallel
-   **Assessment Analysis**: Multiple AI analysis tasks can run concurrently

### Loading States
-   **Skeleton Loaders**: Smooth UX during data fetching
-   **Next.js Loading Files**: Automatic loading states for routes

### Database Optimization
-   **Prisma Relations**: Efficient joins with `include`
-   **Selective Fields**: Only fetch needed data with `select`

## 🔐 Security

### Authentication
-   **Clerk Integration**: Industry-standard auth with JWT
-   **Protected Routes**: Middleware guards all private pages
-   **User Verification**: Server-side checks in all actions

### Data Privacy
-   **Encrypted Storage**: Neon DB with SSL
-   **Access Control**: User-scoped queries
-   **API Keys**: Stored in environment variables
-   **No Client Exposure**: Sensitive operations in Server Actions

### Input Validation
-   **Zod Schemas**: Type-safe validation for all forms
-   **Server-Side Checks**: Double validation in Server Actions
-   **Error Handling**: Graceful error messages without exposing internals

## 🛠️ Deployment

-   **Frontend/Backend**: Vercel (recommended for Next.js)
-   **Database**: Neon (Serverless PostgreSQL)
-   **Cron/Queue**: Inngest (integrates seamlessly with Vercel)
-   **Environment Variables**: Managed via Vercel dashboard or `.env` file
-   **Build Optimization**: Next.js automatic code splitting and optimization

## 📊 Database Schema Overview

### User Table
```prisma
model User {
  id              String   @id @default(cuid())
  clerkUserId     String   @unique
  name            String?
  email           String   @unique
  userType        UserType?
  industry        String?
  experience      String?
  bio             String?
  skills          String?
  country         String?  // For internship search
  city            String?  // For internship search
  careerAssessment CareerAssessment?
  roadmap         Roadmap?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### CareerAssessment Table
```prisma
model CareerAssessment {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(...)
  primaryRole     String?  // Selected career path
  analysis        Json     // AI analysis results
  feedback        AssessmentFeedback?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### AssessmentFeedback Table
```prisma
model AssessmentFeedback {
  id              String   @id @default(cuid())
  assessmentId    String   @unique
  assessment      CareerAssessment @relation(...)
  rating          Int      // 1-5 stars
  isAccurate      Boolean  // Assessment accuracy
  comment         String?  // Optional feedback
  createdAt       DateTime @default(now())
}
```

## 🔄 State Management

-   **Server State**: Managed via Server Actions and `revalidatePath`
-   **Client State**: React hooks (`useState`, `useRouter`)
-   **Form State**: React Hook Form with Zod validation
-   **Cache State**: Next.js built-in caching mechanisms

## 🎯 Future Enhancements

-   Voice input for mock interviews
-   Real-time collaboration on resumes
-   Advanced analytics dashboard
-   Integration with LinkedIn
-   Mobile app (React Native)
-   Multi-language support
