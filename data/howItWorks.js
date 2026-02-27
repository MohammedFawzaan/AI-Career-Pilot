import {
  ClipboardCheck,
  Sparkles,
  UserCheck,
  Search,
  MapPin,
  Briefcase,
  FileEdit,
  Rocket,
} from "lucide-react";

export const howItWorks = [
  {
    step: 1,
    title: "Take the AI Career Assessment",
    description:
      "Answer a multi-layered intelligent questionnaire about your background, interests, and career goals.",
    icon: <ClipboardCheck className="w-8 h-8 text-primary" />,
  },
  {
    step: 2,
    title: "Discover Your Career Match",
    description:
      "AI analyzes your responses and recommends your top 3 career roles with detailed match reasoning.",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
  },
  {
    step: 3,
    title: "Select Your Career Path",
    description:
      "Choose your ideal role and get an AI-generated profile with suggested industry, skills, and bio.",
    icon: <UserCheck className="w-8 h-8 text-primary" />,
  },
  {
    step: 4,
    title: "Get Your Skill Gap Analysis",
    description:
      "See your current skills vs. skills to learn, with priority levels and development tips.",
    icon: <Search className="w-8 h-8 text-primary" />,
  },
  {
    step: 5,
    title: "Follow Your Personalized Roadmap",
    description:
      "Access a 3, 6, or 12-month AI-generated learning path tailored to your chosen role.",
    icon: <MapPin className="w-8 h-8 text-primary" />,
  },
  {
    step: 6,
    title: "Find Internships & Certifications",
    description:
      "Discover local and remote opportunities matched to your career path and location.",
    icon: <Briefcase className="w-8 h-8 text-primary" />,
  },
  {
    step: 7,
    title: "Build Resume & Practice Interviews",
    description:
      "Create ATS-optimized resumes and practice with AI mock interviews for final preparation.",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    step: 8,
    title: "Apply with Confidence",
    description:
      "Use your polished resume, tailored cover letters, and interview skills to land your dream job.",
    icon: <Rocket className="w-8 h-8 text-primary" />,
  },
];
