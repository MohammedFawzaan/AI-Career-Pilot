import {
  BrainCircuit,
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  ScrollText,
  PenBox,
  LayoutDashboard,
} from "lucide-react";

export const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Career Assessment",
    description:
      "Multi-layered intelligent questionnaire that analyzes your profile to recommend top career roles, industries, and ideal countries.",
  },
  {
    icon: <Search className="w-10 h-10 mb-4 text-primary" />,
    title: "Skill Gap Detection",
    description:
      "Identifies your current skills vs. required skills with priority levels and personalized development tips.",
  },
  {
    icon: <MapPin className="w-10 h-10 mb-4 text-primary" />,
    title: "Career Roadmap Generator",
    description:
      "AI-generated 3, 6, or 12-month personalized learning paths with milestones based on your role and skill gaps.",
  },
  {
    icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
    title: "Internship & Certification Finder",
    description:
      "Location-based search for local and remote internships plus skill-based certification recommendations.",
  },
  {
    icon: <GraduationCap className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Mock Interviews",
    description:
      "Role-specific interview questions with instant AI feedback, scoring system, and progress tracking.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "Smart Resume Builder",
    description:
      "Markdown-powered, ATS-optimized resume builder with AI suggestions, real-time preview, and PDF export.",
  },
  {
    icon: <PenBox className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Cover Letter Generator",
    description:
      "Context-aware cover letters that match your resume against job descriptions for personalized results.",
  },
  {
    icon: <LayoutDashboard className="w-10 h-10 mb-4 text-primary" />,
    title: "Career Dashboard",
    description:
      "Central hub showing profile overview, career path status, and quick access to all features in one view.",
  },
];
