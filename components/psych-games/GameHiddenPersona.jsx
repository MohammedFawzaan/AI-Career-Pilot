"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";

const TRAIT_LABELS = { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism" };

export default function GameHiddenPersona({ scenes, onComplete }) {
    const [sceneIndex, setSceneIndex] = useState(0);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [bigFive, setBigFive] = useState({ O: 50, C: 50, E: 50, A: 50, N: 50 });
    const [isTransitioning, setIsTransitioning] = useState(false);

    const scene = scenes?.[sceneIndex];
    const progress = ((sceneIndex + 1) / (scenes?.length || 1)) * 100;

    const handleNext = () => {
        if (selectedResponse === null || !scene) return;
        const chosenTraits = scene.responses[selectedResponse].traits;
        const newBigFive = { ...bigFive };
        Object.entries(chosenTraits).forEach(([trait, val]) => {
            newBigFive[trait] = Math.min(100, Math.max(0, (newBigFive[trait] || 50) + val));
        });
        setBigFive(newBigFive);
        setIsTransitioning(true);

        setTimeout(() => {
            if (sceneIndex < (scenes?.length || 1) - 1) {
                setSceneIndex(prev => prev + 1);
                setSelectedResponse(null);
                setIsTransitioning(false);
            } else {
                const dominant = Object.entries(newBigFive).filter(([k]) => k !== "N").sort((a, b) => b[1] - a[1])[0][0];
                const archetypeMap = { O: "Creative Explorer", C: "Disciplined Executor", E: "Collaborative Influencer", A: "Empathetic Team Player" };
                const score = Math.round(Object.entries(newBigFive).filter(([k]) => k !== "N").reduce((acc, [, v]) => acc + v, 0) / 4);
                onComplete({ bigFive: newBigFive, dominantTrait: TRAIT_LABELS[dominant], archetype: archetypeMap[dominant] || "Balanced Professional", score });
            }
        }, 500);
    };

    if (!scene) return null;

    return (
        <div className={`space-y-5 transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="font-semibold text-sm">Scene {sceneIndex + 1} of {scenes.length}</span>
                </div>
                <Badge variant="outline" className="text-xs bg-purple-500/5 border-purple-500/20 text-purple-400">personality</Badge>
            </div>

            {/* Progress */}
            <div className="space-y-1">
                <Progress value={progress} className="h-2 rounded-full" />
                <p className="text-[10px] text-muted-foreground text-right">{Math.round(progress)}% complete</p>
            </div>

            {/* Chat Scene */}
            <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex items-center justify-center text-sm flex-shrink-0">💬</div>
                    <div className="p-4 rounded-2xl rounded-tl-sm bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border border-border/40 text-sm leading-relaxed max-w-[85%] backdrop-blur-sm">
                        {scene.setup}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground font-semibold text-right pr-1 uppercase tracking-wider">How do you respond?</p>
            </div>

            {/* Response Options */}
            <div className="space-y-2.5">
                {scene.responses?.map((response, i) => {
                    const isSelected = selectedResponse === i;
                    return (
                        <button key={i} onClick={() => setSelectedResponse(selectedResponse === null || selectedResponse !== i ? i : null)}
                            disabled={selectedResponse !== null && !isSelected}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${isSelected
                                    ? "border-purple-400/50 bg-purple-500/10 text-foreground font-medium shadow-[0_0_15px_rgba(168,85,247,0.1)] ring-1 ring-purple-400/20"
                                    : selectedResponse !== null
                                        ? "border-border/20 text-muted-foreground/40 cursor-not-allowed"
                                        : "border-border/50 hover:border-purple-400/40 hover:bg-purple-500/5 cursor-pointer"}`}>
                            <div className="flex items-start gap-2.5">
                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                                    ${isSelected ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white scale-110" : "bg-muted text-muted-foreground"}`}>You</div>
                                <span className="leading-relaxed">{response.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <Button onClick={handleNext} disabled={selectedResponse === null || isTransitioning} className="w-full" size="lg">
                {sceneIndex < scenes.length - 1
                    ? <>Next Scene <ChevronRight className="ml-2 h-4 w-4" /></>
                    : <>Complete Game <CheckCircle2 className="ml-2 h-4 w-4" /></>}
            </Button>
        </div>
    );
}
