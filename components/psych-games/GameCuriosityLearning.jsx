"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, ChevronRight, Compass } from "lucide-react";

export default function GameCuriosityLearning({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [traitScores, setTraitScores] = useState({ curiosity: 50, learningInitiative: 50, adaptability: 50, exploration: 50 });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const finalScoresRef = useRef(null);

    const round = rounds?.[roundIndex];
    const progress = ((roundIndex + 1) / (rounds?.length || 1)) * 100;

    useEffect(() => {
        if (gameFinished && finalScoresRef.current) {
            const scores = finalScoresRef.current;
            const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
            const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
            const labelMap = {
                curiosity: "Curiosity",
                learningInitiative: "Learning Initiative",
                adaptability: "Adaptability",
                exploration: "Exploration Mindset",
            };
            onComplete({
                traits: scores,
                dominantTrait: labelMap[dominant] || dominant,
                overallScore: overall,
            });
        }
    }, [gameFinished, onComplete]);

    const handleSubmit = () => {
        if (!selectedOption) return;

        setTraitScores(prev => {
            const newScores = { ...prev };
            if (rounds?.[roundIndex]) {
                const chosen = rounds[roundIndex].options.find(o => o.id === selectedOption);
                if (chosen) {
                    Object.entries(chosen.traits).forEach(([trait, val]) => {
                        newScores[trait] = Math.min(100, Math.max(0, (newScores[trait] || 50) + val));
                    });
                }
            }
            if (roundIndex >= (rounds?.length || 1) - 1) {
                finalScoresRef.current = newScores;
            }
            return newScores;
        });

        setIsTransitioning(true);
        setTimeout(() => {
            if (roundIndex < (rounds?.length || 1) - 1) {
                setRoundIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsTransitioning(false);
            } else {
                setGameFinished(true);
            }
        }, 400);
    };

    if (!round) return null;

    return (
        <div className={`space-y-5 transition-all duration-400 ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="font-semibold text-sm">Scenario {roundIndex + 1} of {rounds.length}</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Compass className="h-3 w-3" /> Take your time
                </span>
            </div>

            <Progress value={progress} className="h-1.5" />

            {/* Scenario */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/8 via-amber-500/4 to-transparent border border-amber-500/15">
                <p className="text-sm leading-relaxed mb-3">{round.scenario}</p>
                <p className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />{round.question}
                </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
                {round.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    return (
                        <button key={opt.id} onClick={() => setSelectedOption(opt.id)}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${isSelected
                                    ? "border-amber-400/50 bg-amber-500/10 text-foreground font-medium ring-1 ring-amber-400/20"
                                    : "border-border/40 hover:border-amber-400/40 hover:bg-amber-500/5 cursor-pointer"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                                    ${isSelected ? "border-amber-400 bg-amber-500 text-white" : "border-muted-foreground/30"}`}>
                                    {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : opt.id.toUpperCase()}
                                </span>
                                <span className="leading-relaxed">{opt.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} disabled={!selectedOption || isTransitioning} className="w-full" size="lg">
                {roundIndex < (rounds?.length || 1) - 1
                    ? <>Next Scenario <ChevronRight className="ml-2 h-4 w-4" /></>
                    : <>Complete Game <CheckCircle2 className="ml-2 h-4 w-4" /></>}
            </Button>
        </div>
    );
}
