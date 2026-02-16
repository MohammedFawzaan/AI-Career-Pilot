# AI Career Pilot 🚀

## 📌 Overview

**AI Career Pilot** is a comprehensive, AI-powered platform designed to supercharge your career journey. By leveraging Google's Gemini LLM and advanced career assessment algorithms, it helps users discover their ideal career path, build professional resumes, generate tailored cover letters, find internships, and practice mock interviews with real-time AI feedback.

Whether you are a student, a career switcher, or a professional looking to level up, this tool provides the personalized guidance you need to land your dream job.

## ✨ Key Features

### 🎯 Career Assessment & Path Selection
- **Intelligent Career Assessment**: Multi-layered AI-powered assessment that analyzes your skills, interests, and experience
- **Personalized Role Recommendations**: Get top 3 career roles tailored to your profile with detailed match reasoning
- **Career Path Selection**: Choose your ideal career path with AI-suggested industry, skills, and bio
- **Country Recommendations**: Discover the best countries for your chosen career path
- **Skills Gap Analysis**: Identify skills you need to learn with priority levels (High/Medium/Low)
- **Feedback System**: Rate assessment accuracy and help improve the AI (one-time submission, no updates)

### 📍 Location-Based Internship Search
- **Smart Internship Finder**: Discover internships based on your selected role and location
- **Local Opportunities**: Find internships in your city and country (all available results)
- **Remote Opportunities**: Browse remote internships from anywhere (all available results)
- **Live Job Data**: Powered by JSearch RapidAPI with 1-hour caching for optimal performance
- **Certificate Recommendations**: Get relevant certification suggestions for skill development

### 📝 Resume & Cover Letter Tools
- **Intelligent Resume Builder**: Create ATS-optimized resumes with an interactive builder supporting Markdown and real-time preview
- **Smart Cover Letter Generator**: Generate context-aware cover letters tailored to specific job descriptions and your resume
- **Profile Management**: Update your location, skills, bio, and experience anytime

### 🗣️ Interview Preparation
- **AI Mock Interviews**: Practice with role-specific interview questions
- **Real-time Feedback**: Get instant, constructive feedback on your answers
- **Performance Tracking**: Monitor your improvement over time

### 📊 Career Roadmap
- **Personalized Learning Path**: AI-generated roadmap based on your role, current skills, and skills to learn
- **Flexible Duration**: Choose 3, 6, or 12-month roadmap plans
- **Visual Progress**: Track your journey with clear milestones and goals

### 🎨 User Experience
- **Dual User Types**: Separate flows for Freshers and Experienced professionals
- **Loading States**: Beautiful skeleton loaders for smooth navigation
- **Responsive Design**: Optimized for all devices
- **Secure Authentication**: Powered by Clerk with role-based access

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: Next.js Server Actions, [Inngest](https://www.inngest.com/) (Background Jobs)
- **AI Engine**: [Google Gemini API](https://deepmind.google/technologies/gemini/) (Gemini 2.0 Flash)
- **Database**: [Neon DB](https://neon.tech/) (PostgreSQL), [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Job Search API**: [JSearch RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
- **Form Handling**: React Hook Form, Zod
- **Caching**: Next.js `unstable_cache` for API optimization

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Neon DB account (PostgreSQL)
- A Clerk account
- A Google Cloud Console project (for Gemini API)
- A RapidAPI account (for JSearch API)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-career-pilot.git
   cd ai-career-pilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:

   ```env
   # Database connection
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding/selection
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/selection

   # AI API Key (Google Gemini)
   GEMINI_API_KEY=AIzaSy...

   # Job Search API (RapidAPI - JSearch)
   RAPIDAPI_KEY=your_rapidapi_key_here

   # Background Jobs (Inngest)
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key
   ```

4. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
ai-career-pilot/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Authentication routes (sign-in, sign-up)
│   ├── (main)/           # Main application routes
│   │   ├── onboarding/   # User onboarding flow
│   │   │   ├── selection/      # User type selection (Fresher/Experienced)
│   │   │   ├── assessment/     # Career assessment
│   │   │   ├── career-path/    # Assessment results & role selection
│   │   │   └── page.jsx        # Profile setup
│   │   ├── dashboard/    # User dashboard
│   │   ├── resume/       # Resume builder
│   │   ├── ai-cover-letter/  # Cover letter generator
│   │   ├── interview/    # Mock interview practice
│   │   ├── internships/  # Internship & certificate search
│   │   ├── roadmap/      # Career roadmap
│   │   └── profile/      # User profile management
│   ├── api/              # API routes (Webhooks, Inngest)
│   └── layout.js         # Root layout
├── actions/              # Server Actions for business logic
│   ├── assessment.js     # Career assessment logic
│   ├── user.js          # User management
│   ├── internships.js   # Internship & certificate fetching (with caching)
│   ├── roadmap.js       # Roadmap generation
│   ├── feedback.js      # Feedback system
│   └── ...
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn UI components
│   └── header.jsx       # Navigation header
├── data/                 # Static data and constants
│   └── industries.js    # Industry list
├── docs/                 # Documentation & UML Diagrams
├── lib/                  # Utility functions
│   ├── prisma.js        # Prisma client
│   └── checkUser.js     # User verification
├── prisma/               # Database schema
│   └── schema.prisma    # User, CareerAssessment, Roadmap models
└── public/               # Static assets
```

## 🔄 User Flow

1. **Sign Up/Sign In** → Clerk authentication
2. **User Type Selection** → Choose Fresher or Experienced
3. **Career Assessment** → Multi-layered AI assessment (4 questions per layer)
4. **Career Path Results** → View top 3 recommended roles with match reasoning
5. **Role Selection** → Choose a career path (marked as "Current Path")
6. **Profile Setup** → Complete profile with AI-suggested industry, skills, and bio
7. **Dashboard** → Access all features:
   - View and update profile (including location)
   - Build resume
   - Generate cover letters
   - Search internships (local + remote)
   - Practice interviews
   - Generate career roadmap
   - Provide feedback on assessment

## 📊 Database Schema

### User Model
- Basic info: name, email, userType (FRESHER/EXPERIENCED)
- Profile: industry, experience, bio, skills
- **Location**: country, city (for internship search)
- Relations: careerAssessment, roadmap

### CareerAssessment Model
- User responses and AI analysis
- **primaryRole**: Selected career path
- Recommended roles, industries, countries
- Skills: identifiedSkills, recommendedSkills, skillGap
- Feedback relation (one-to-one, immutable)

### Roadmap Model
- Duration (3/6/12 months)
- AI-generated roadmap content
- User relation

### AssessmentFeedback Model
- Rating (1-5 stars)
- Accuracy flag (boolean)
- Comment (optional)
- **One-time submission** - cannot be updated

## 🎯 API Optimization

### Caching Strategy
- **Internships API**: Cached for 1 hour using Next.js `unstable_cache`
- **Cache Key**: Based on userId, primaryRole, city, country
- **Benefits**: 
  - 66-75% reduction in API calls
  - Faster page loads
  - Reduced costs

### API Usage
- **Per Page Load**: 2 parallel API calls (local + remote)
- **With Caching**: 0 API calls for cached results
- **Cache Duration**: 1 hour (3600 seconds)

## 📚 Documentation

For more detailed information, check out the `docs/` folder:

- [**Features & Capabilities**](docs/FEATURES.md): In-depth look at all application features
- [**System Architecture**](docs/ARCHITECTURE.md): Technical overview of the codebase and data flow
- [**UML Diagrams**](docs/UML_Diagrams.md): Visual representations of the system structure and workflows

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Author - Mohammed Fawzaan

---

**Built with ❤️ using Next.js, React, and Google Gemini AI**
