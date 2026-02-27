"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const prevPathRef = useRef(pathname);
    const animationRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (prevPathRef.current !== pathname) {
            // Route changed — start the animation
            prevPathRef.current = pathname;

            // Clear any existing animation
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            setIsVisible(true);
            setProgress(0);

            // Phase 1: Quick burst to ~30%
            let currentProgress = 0;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;

                if (elapsed < 200) {
                    // Fast initial burst (0-30% in 200ms)
                    currentProgress = (elapsed / 200) * 30;
                } else if (elapsed < 1500) {
                    // Slow crawl (30-80% over 1.3s)
                    currentProgress = 30 + ((elapsed - 200) / 1300) * 50;
                } else if (elapsed < 3000) {
                    // Very slow crawl (80-90% over 1.5s)
                    currentProgress = 80 + ((elapsed - 1500) / 1500) * 10;
                } else {
                    // Stall at 90%
                    currentProgress = 90;
                }

                setProgress(currentProgress);

                if (currentProgress < 90) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            animationRef.current = requestAnimationFrame(animate);

            // Complete the animation
            timeoutRef.current = setTimeout(() => {
                if (animationRef.current) cancelAnimationFrame(animationRef.current);
                setProgress(100);

                // Fade out after completion
                setTimeout(() => {
                    setIsVisible(false);
                    setProgress(0);
                }, 400);
            }, 150);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [pathname]);

    if (!isVisible && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
            style={{
                opacity: isVisible ? 1 : 0,
                transition: "opacity 0.4s ease-out",
            }}
        >
            {/* Main progress bar */}
            <div
                className="h-[3px] relative"
                style={{
                    width: `${progress}%`,
                    transition: progress === 100 ? "width 0.2s ease-out" : "none",
                    background:
                        "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa, #c084fc, #8b5cf6)",
                    backgroundSize: "200% 100%",
                    animation: "navGradientShift 2s linear infinite",
                }}
            >
                {/* Glow effect */}
                <div
                    className="absolute inset-0"
                    style={{
                        boxShadow:
                            "0 0 10px rgba(139, 92, 246, 0.7), 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
                    }}
                />

                {/* Shimmer sweep */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                        backgroundSize: "50% 100%",
                        animation: "navShimmer 1.5s ease-in-out infinite",
                    }}
                />

                {/* Leading edge glow dot */}
                <div
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    style={{
                        width: "80px",
                        height: "3px",
                        background:
                            "linear-gradient(90deg, transparent, rgba(196, 132, 252, 0.8))",
                        boxShadow:
                            "0 0 12px rgba(196, 132, 252, 0.9), 0 0 24px rgba(139, 92, 246, 0.5)",
                        borderRadius: "50%",
                    }}
                />
            </div>

            <style jsx>{`
        @keyframes navGradientShift {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
        @keyframes navShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
        </div>
    );
}
