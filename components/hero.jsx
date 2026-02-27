"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10 relative overflow-hidden">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            AI-Powered Career Intelligence
          </div>

          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, skill gap analysis,
            and AI-powered tools for job success.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/onboarding/career-path">
            <Button size="lg" className="px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200">
              Get Started
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="px-8">
              Explore Features
            </Button>
          </Link>
        </div>

        {/* AI Neural Visual Banner — from Stitch Design */}
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <div className="relative max-w-5xl mx-auto mt-10 md:mt-16">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              {/* Main Banner */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 aspect-[16/9] flex items-center justify-center">
                {/* Background */}
                <div className="absolute inset-0 bg-[#0f0c29]">
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(75,43,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,43,238,0.1) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                      maskImage:
                        "radial-gradient(ellipse at center, black 40%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(ellipse at center, black 40%, transparent 100%)",
                    }}
                  ></div>
                  {/* Central Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                  {/* Floating Dots */}
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse"></div>
                  <div
                    className="absolute top-3/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-bounce"
                    style={{ animationDuration: "3s" }}
                  ></div>
                  <div
                    className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(75,43,238,0.8)] animate-pulse"
                    style={{ animationDuration: "4s" }}
                  ></div>
                  <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                  {/* Neural Network SVG Lines */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-40"
                    viewBox="0 0 800 450"
                  >
                    <defs>
                      <linearGradient
                        id="grad1"
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#a855f7", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#4b2bee", stopOpacity: 1 }}
                        />
                      </linearGradient>
                      <linearGradient
                        id="grad2"
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#60a5fa", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#818cf8", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M200,112 Q400,225 600,150"
                      fill="none"
                      stroke="url(#grad1)"
                      strokeWidth="2"
                    />
                    <path
                      d="M266,337 Q400,225 533,300"
                      fill="none"
                      stroke="url(#grad2)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M200,112 L266,337"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                    <path
                      d="M600,150 L533,300"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                {/* Central Content */}
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(75,43,238,0.3)]">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    AI Powered Career Guidance
                  </h3>
                  <p className="text-slate-300 mt-2 text-sm">
                    {/* with 5+ Growth tools */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
