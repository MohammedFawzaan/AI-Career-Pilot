"use client";

import { CheckCircle2 } from "lucide-react";

/**
 * Horizontal section indicator bar for assessment flows.
 * @param {{ sections: { label: string, icon?: React.ElementType }[], activeIndex: number }} props
 */
export default function SectionIndicator({ sections, activeIndex }) {
    return (
        <div className="flex items-center justify-between w-full mb-6">
            {sections.map((section, i) => {
                const isCompleted = i < activeIndex;
                const isActive = i === activeIndex;
                const isUpcoming = i > activeIndex;
                const Icon = section.icon;

                return (
                    <div key={i} className="flex items-center flex-1 last:flex-initial">
                        {/* Step circle + label */}
                        <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500
                                ${isCompleted
                                    ? "border-emerald-400 bg-emerald-500 text-white"
                                    : isActive
                                        ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20"
                                        : "border-border/40 bg-muted/20 text-muted-foreground/50"
                                }`}>
                                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-semibold text-center leading-tight max-w-[80px] transition-colors
                                ${isCompleted
                                    ? "text-emerald-400"
                                    : isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground/50"
                                }`}>
                                {section.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < sections.length - 1 && (
                            <div className="flex-1 mx-2 mt-[-18px]">
                                <div className={`h-[2px] rounded-full transition-all duration-700
                                    ${isCompleted
                                        ? "bg-emerald-400"
                                        : "bg-border/30"
                                    }`} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
