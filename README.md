# AI Career Coach 🚀

## 📌 Overview

**AI Career Coach** is a comprehensive, AI-powered platform designed to supercharge your job search. By leveraging Google's Gemini LLM, it helps users build professional resumes, generate tailored cover letters, and practice mock interviews with real-time AI feedback.

Whether you are a student, a career switcher, or a professional looking to level up, this tool provides the personalized guidance you need to land your dream job.

## ✨ Key Features

- **📝 Intelligent Resume Builder**: Create ATS-optimized resumes with an interactive builder that supports Markdown.
- **✉️ Smart Cover Letter Generator**: Generate context-aware cover letters tailored to specific job descriptions and your resume.
- **🗣️ AI Mock Interviews**: Practice with role-specific interview questions and get instant, constructive feedback on your answers.
- **📊 Career Dashboard**: Track your application progress, saved insights, and improvement metrics in one place.
- **🔐 Secure & Scalable**: Built with industry-standard security using Clerk authentication and robust database management.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: Next.js Server Actions, [Inngest](https://www.inngest.com/) (Background Jobs)
- **AI Engine**: [Google Gemini API](https://deepmind.google/technologies/gemini/)
- **Database**: [Neon DB](https://neon.tech/) (PostgreSQL), [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Form Handling**: React Hook Form, Zod

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Neon DB account (PostgreSQL)
- A Clerk account
- A Google Cloud Console project (for Gemini API)

### Installation

1. **Clone the repository:**
   ```bash
   cd ai-career-coach
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
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

   # AI API Key (Google Gemini)
   GEMINI_API_KEY=AIzaSy...
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
ai-career-coach/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Authentication routes
│   ├── (main)/           # Main application routes (Dashboard, Tools)
│   ├── api/              # API routes
│   └── layout.js         # Root layout
├── components/           # Reusable UI components
├── lib/                  # Utility functions and libraries (Prisma, Inngest)
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── action/               # Server actions for data mutation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
