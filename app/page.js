import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BrainCircuit,
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  ScrollText,
  PenBox,
  LayoutDashboard,
  Sparkles,
  Target,
  TrendingUp,
  Route,
} from "lucide-react";
import HeroSection from "@/components/hero";
import { howItWorks } from "@/data/howItWorks";
import { features } from "@/data/features";

export default function LandingPage() {
  return (
    <>
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section — Stitch-Inspired Cards */}
      <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Project Modules
            </p>
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

      {/* Why Choose AI Career Pilot — Stitch 2-Column Layout */}
      <section className="w-full py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Left Visual */}
            <div className="relative group cursor-pointer" style={{ perspective: '1000px' }}>
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] bg-slate-950 border border-white/10 transform transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-2">

                {/* Dynamic Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 z-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "1s" }}></div>

                {/* Animated Decorative Grid */}
                <div className="absolute inset-0 z-[5] opacity-20 transition-opacity duration-500 group-hover:opacity-40">
                  <div className="absolute inset-0 grid-move-bg"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  ></div>
                </div>

                {/* Floating "Data Nodes" */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)] animate-bounce" style={{ animationDuration: "2.5s" }}></div>
                <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_15px_theme(colors.purple.400)] animate-pulse" style={{ animationDuration: "3s" }}></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_theme(colors.blue.400)] animate-ping" style={{ animationDuration: "4s" }}></div>

                {/* Scanning Laser Line */}
                <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 opacity-60 shadow-[0_0_10px_theme(colors.primary.DEFAULT)] scan-line-anim"></div>

                {/* Inline CSS for Custom Animations entirely isolated here */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes grid-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                  }
                  .grid-move-bg {
                    animation: grid-move 15s linear infinite;
                  }
                  @keyframes scan {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    40% { top: 110%; opacity: 1; }
                    50% { opacity: 0; }
                    100% { top: 110%; opacity: 0; }
                  }
                  .scan-line-anim {
                    animation: scan 6s ease-in-out infinite;
                  }
                `}} />

                {/* Content Card overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary shadow-lg shadow-primary/40 mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
                    Empowering the next generation to bridge the gap between academic theory and the high-velocity demands of the AI-driven workforce.
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between group/link">
                    <p className="text-sm font-bold text-purple-200 uppercase tracking-wider group-hover/link:text-purple-400 transition-colors">Our Core Mission</p>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 group-hover/link:text-purple-400 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
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
          </div>
        </div>
      </section>

      {/* CTA Section — Dark with Blur Effects from Stitch */}
      <section className="w-full relative overflow-hidden">
        <div className="relative py-24 bg-[#131022]">
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
              <Link href="/onboarding" passHref>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 px-8 py-6 text-base font-bold animate-bounce"
                >
                  Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
