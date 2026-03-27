import React from "react";
import {
  Sparkles,
  Target,
  TrendingUp,
  Route,
  Users,
  Zap,
  Award,
  Infinity,
} from "lucide-react";
import HeroSection from "@/components/hero";
import { howItWorks } from "@/data/howItWorks";
import { features } from "@/data/features";
import { CTAButton } from "@/components/cta-button";
import Footer from "@/components/footer";

import { db } from "@/lib/prisma";

export default async function LandingPage() {
  const userCount = await db.user.count();

  return (
    <>
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section — Stitch-Inspired Cards */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comprehensive Career Development System
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg text-primary transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — 8-Step Timeline from Stitch Design */}
      <section className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              System Workflow
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              An 8-step journey from assessment to employment
            </p>
          </div>

          <div className="relative grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-8 max-w-7xl mx-auto">
            {/* Connecting Line (desktop only) */}
            <div className="hidden lg:block absolute top-8 left-0 w-full h-0.5 bg-border -z-10"></div>

            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center cursor-pointer"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg z-10 transition-all duration-300 ${index === howItWorks.length - 1
                    ? "bg-primary border-primary shadow-primary/30 border-4"
                    : "bg-background border-primary shadow-lg"
                    }`}
                >
                  {index === howItWorks.length - 1 ? (
                    <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span
                      className="text-lg font-bold text-primary">
                      {item.icon}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-bold">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose AI Career Pilot — 2-Column Layout */}
      <section className="w-full py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">

            {/* Left Content (text) */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why This Web-App Matters
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Addressing the modern skill crisis with intelligent technology.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-none pt-1">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Deep AI-Powered Personalization</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Algorithms that adapt to individual user progress and career aspirations.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none pt-1">
                    <Route className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">End-to-End Career Workflow</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      A unified platform for all stages of career development.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none pt-1">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Real-Time Industry Insights</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Leveraging live data for relevant skill recommendations.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none pt-1">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Skill-Based Learning Paths</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Curriculum structures optimized for maximum retention and utility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual — Stats Grid */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Platform at a Glance</h3>
                <p className="text-sm text-muted-foreground mt-1">Real facts about what AI Career Pilot delivers.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, value: "95%", label: "AI Career Match Accuracy", sub: "Based on psychometric + skill analysis", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                  { icon: Infinity, value: "∞", label: "Unique Career Paths", sub: "Every path is AI-generated based on your career assessment", color: "text-green-500", bg: "bg-green-500/10" },
                  { icon: Award, value: "8-Step", label: "Structured Journey", sub: "From assessment to job-ready", color: "text-purple-500", bg: "bg-purple-500/10" },
                  { icon: Users, value: userCount.toLocaleString() + "+", label: "Active Users", sub: "Growing community of students and professionals", color: "text-blue-500", bg: "bg-blue-500/10" },
                ].map(({ icon: Icon, value, label, sub, color, bg }) => (
                  <div
                    key={label}
                    className="group rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
                      <p className="text-sm font-semibold mt-0.5">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section — Dark with Blur Effects */}
      <section className="w-full relative overflow-hidden">
        <div className="relative py-24 bg-[#131022] rounded-tl-3xl rounded-tr-3xl">
          {/* Background Glow Effects */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700 rounded-full blur-[128px]"></div>
          </div>
          <div className="relative container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl mb-6">
              Get started with AI Career Pilot
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-300 mb-10">
              This project represents a comprehensive solution for student career
              placement and professional growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
