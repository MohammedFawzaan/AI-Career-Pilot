# UML Diagrams for AI Career Coach

> **Note**: For the best viewing experience, please open `UML_Visualization.html` in your browser.

## 1. Use Case Diagram
Describes the functional requirements and user interactions with the system.

```mermaid
usecaseDiagram
    actor "Job Seeker" as User
    actor "Google Gemini API" as AI
    actor "Clerk Auth" as Auth

    usecase "Sign Up / Sign In" as UC1
    usecase "Onboarding (Industry/Experience)" as UC2
    usecase "Dashboard: Industry Insights" as UC6
    usecase "Create AI Resume" as UC3
    usecase "Generate Cover Letter" as UC4
    usecase "Start Mock Interview" as UC5
    usecase "Download Documents" as UC7

    User --> UC1
    User --> UC2
    User --> UC6
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC7

    UC1 ..> Auth : uses
    UC3 ..> AI : generates content
    UC4 ..> AI : generates content
    UC5 ..> AI : generates Q&A
```

## 2. Activity Diagram
Comprehensive system flow including Resume Builder, Cover Letter, and Interviews.

```mermaid
flowchart TD
    start([Start]) --> Login[User Logs In]
    Login --> Auth{Authenticated?}
    Auth -- No --> SignUp[Sign Up / Login via Clerk]
    SignUp --> Onboard[Onboarding: Industry & Skills]
    Onboard --> ProfileSetup[Profile Setup & Review]
    Auth -- Yes --> Dash[Dashboard: Industry Insights<br/>Trending Tech & Skills]
    ProfileSetup --> Dash
    
    Dash --> Choice{Select Feature}
    
    %% Resume Path
    Choice -- Resume Builder --> ResForm[Enter Details / Upload]
    ResForm --> ResAI[Request AI Optimization]
    ResAI --> CheckRes[Review Markdown Resume]
    CheckRes --> SaveRes[Save Resume]
    
    %% Cover Letter Path
    Choice -- Cover Letter --> SelRes[Select Resume]
    SelRes --> PasteJD[Paste Job Description]
    PasteJD --> GenCL[Generate Cover Letter]
    GenCL --> EditCL[Edit & Refine]
    EditCL --> SaveCL[Save Cover Letter]
    
    %% Interview Path
    Choice -- Mock Interview --> ConfigInt[Select Topic & Difficulty]
    ConfigInt --> StartInt[Start Session]
    StartInt --> QLoop{Question Loop}
    QLoop -- Ask --> GenQ[AI Generates Question]
    GenQ --> UserAns[User Answers]
    UserAns --> Analy[AI Analyzes & Rates]
    Analy --> QLoop
    QLoop -- End --> Summ[View Feedback Summary]
    
    SaveRes --> Dash
    SaveCL --> Dash
    Summ --> Dash
```

## 3. Sequence Diagram
Showing the interaction sequence for generating content (Resume/Letter).

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (Next.js)
    participant BE as Backend (Server Actions)
    participant DB as Neon DB (Prisma)
    participant AI as Google Gemini API

    note over U, FE: User initiates generation

    U->>FE: Click "Generate Cover Letter/Resume"
    FE->>BE: POST request (User Data + Prompt)
    BE->>DB: Fetch User Context / Profile
    DB-->>BE: Return Profile Data
    
    BE->>AI: Send Prompt (Profile + Requirements)
    activate AI
    AI-->>BE: Return Generated Content
    deactivate AI
    
    BE->>FE: Return Markdown Response
    FE->>U: Display Preview
    
    U->>FE: Click "Save to Dashboard"
    FE->>BE: Save Action
    BE->>DB: Insert into DB
    DB-->>BE: Confirmation
    BE-->>FE: Success Toast
```

## 4. Class Diagram
Represents the database schema and object relationships, including external services.

```mermaid
classDiagram
    class User {
        +String id
        +String clerkId
        +String industry
        +Int experienceYears
        +List~Resume~ resumes
        +List~CoverLetter~ coverLetters
        +List~MockInterview~ interviews
    }
    
    class Resume {
        +String id
        +String title
        +String contentMarkdown
        +String atsScore
    }
    
    class CoverLetter {
        +String id
        +String jobDescription
        +String generatedText
    }
    
    class MockInterview {
        +String id
        +String industry
        +Int overallScore
        +List~InterviewQuestion~ questions
    }
    
    class InterviewQuestion {
        +String question
        +String userAnswer
        +String feedback
        +Int score
    }
    
    class IndustryInsight {
        +String id
        +String industry
        +List~String~ trendingSkills
        +List~String~ salaryRange
    }
    
    class Database_Neon {
        +saveUser()
        +saveResume()
        +saveInterview()
    }
    
    class Gemini_API {
        +generateResume()
        +generateCoverLetter()
        +generateQuestion()
        +analyzeAnswer()
    }
    
    User "1" --> "*" Resume
    User "1" --> "*" CoverLetter
    User "1" --> "*" MockInterview
    MockInterview "1" --> "*" InterviewQuestion
    User ..> IndustryInsight : views
    User ..> Gemini_API : uses via Backend
    User ..> Database_Neon : stores data
```

## 5. Flowchart Diagram (System Flow)
High-level navigation flow of the application.

```mermaid
graph TD
    A[Landing Page] -->|Click Get Started| B{Is Authenticated?}
    B -- No --> C[Clerk Login/Signup]
    C --> B
    B -- Yes --> D{Is Onboarded?}
    D -- No --> E[Onboarding Form]
    E --> F[Profile Setup]
    F --> F2[Save to DB]
    F2 --> G[Dashboard: Industry Insights]
    D -- Yes --> G
    
    G --> H[Resume Builder]
    G --> I[Cover Letter Gen]
    G --> J[Mock Interview]
    
    H --> K[View/Edit Resume]
    I --> L[View/Edit Letter]
    J --> M[Interview Session]
    M --> N[Results & Feedback]
    N --> G
```

## 6. Deployment Diagram
Shows the physical/architectural deployment of the system.

```mermaid
graph TB
    subgraph Client ["Client Side"]
        Browser[User Browser]
    end
    
    subgraph Server ["Server Side (Vercel)"]
        NextJS[Next.js App Router]
        API[API Routes]
    end
    
    subgraph External ["External Services"]
        Neon[(Neon DB Postgres)]
        Gemini[Google Gemini API]
        Clerk[Clerk Auth]
    end

    Browser -->|HTTPS| NextJS
    NextJS -->|Internal Call| API
    API -->|TCP/Prisma| Neon
    API -->|REST/JSON| Gemini
    Browser -->|JWT| Clerk
```
