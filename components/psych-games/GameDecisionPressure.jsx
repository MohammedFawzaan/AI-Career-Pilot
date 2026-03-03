"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Timer, CheckCircle2, ChevronRight, Zap } from "lucide-react";

const TIME_LIMIT = 60;

export default function GameDecisionPressure({ scenarios, onComplete }) {
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [traitScores, setTraitScores] = useState({ analytical: 50, riskAppetite: 50, ethical: 50, leadership: 50, calmness: 50 });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const finalScoresRef = useRef(null);

    const scenario = scenarios?.[scenarioIndex];
    const progress = ((scenarioIndex + 1) / (scenarios?.length || 1)) * 100;

    // Fire onComplete AFTER render — avoids setState-in-render
    useEffect(() => {
        if (gameFinished && finalScoresRef.current) {
            const scores = finalScoresRef.current;
            const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
            const traitMap = {
                analytical: "Analytical Depth",
                riskAppetite: "Risk Appetite",
                ethical: "Ethical Reasoning",
                leadership: "Leadership Tendency",
                calmness: "Calmness Under Stress",
            };
            onComplete({
                traits: scores,
                dominantTrait: traitMap[dominant] || dominant,
                score: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length),
            });
        }
    }, [gameFinished, onComplete]);

    const advanceScenario = useCallback((finalSelected) => {
        setTraitScores(prev => {
            const newScores = { ...prev };
            if (scenarios?.[scenarioIndex]) {
                scenarios[scenarioIndex].options.forEach(opt => {
                    if (finalSelected.includes(opt.id)) {
                        Object.entries(opt.traits).forEach(([trait, val]) => {
                            newScores[trait] = Math.min(100, Math.max(0, (newScores[trait] || 50) + val));
                        });
                    }
                });
            }
            // Store final scores for the useEffect to pick up
            if (scenarioIndex >= (scenarios?.length || 1) - 1) {
                finalScoresRef.current = newScores;
            }
            return newScores;
        });
        setIsTransitioning(true);

        setTimeout(() => {
            if (scenarioIndex < (scenarios?.length || 1) - 1) {
                setScenarioIndex(prev => prev + 1);
                setSelectedOptions([]);
                setTimeLeft(TIME_LIMIT);
                setIsTransitioning(false);
            } else {
                setGameFinished(true);
            }
        }, 600);
    }, [scenarioIndex, scenarios]);

    useEffect(() => {
        if (gameFinished || isTransitioning) return;
        if (timeLeft <= 0) { advanceScenario(selectedOptions); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, selectedOptions, advanceScenario, gameFinished, isTransitioning]);

    const handleSelect = (optId) => {
        setSelectedOptions(prev => {
            if (prev.includes(optId)) return prev.filter(id => id !== optId);
            if (prev.length >= 2) return prev;
            return [...prev, optId];
        });
    };

    if (!scenario) return null;

    const timerColor = timeLeft > 30 ? "text-emerald-400" : timeLeft > 15 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 30 ? "bg-emerald-500/10" : timeLeft > 15 ? "bg-amber-500/10" : "bg-red-500/10";

    return (
        <div className={`space-y-5 transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                    </div>
                    <span className="font-semibold text-sm">Scenario {scenarioIndex + 1} of {scenarios.length}</span>
                </div>
                <div className={`flex items-center gap-1.5 font-bold text-lg px-3 py-1 rounded-full ${timerBg} ${timerColor}`}>
                    <Timer className="h-4 w-4" />{timeLeft}s
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
                <Progress value={progress} className="h-2 rounded-full" />
                <p className="text-[10px] text-muted-foreground text-right">{Math.round(progress)}% complete</p>
            </div>

            {/* Scenario Context */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 backdrop-blur-sm">
                <p className="text-sm leading-relaxed">{scenario.context}</p>
            </div>

            {/* Instruction */}
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                <span>{scenario.instruction}</span>
                <Badge variant="outline" className="ml-auto text-xs font-bold">{selectedOptions.length}/2</Badge>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
                {scenario.options.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    const isDisabled = !isSelected && selectedOptions.length >= 2;
                    return (
                        <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={isDisabled}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${isSelected
                                    ? "border-orange-400/50 bg-orange-500/10 text-foreground font-medium shadow-[0_0_15px_rgba(249,115,22,0.1)] ring-1 ring-orange-400/20"
                                    : isDisabled
                                        ? "border-border/20 text-muted-foreground/40 cursor-not-allowed bg-muted/10"
                                        : "border-border/50 hover:border-orange-400/40 hover:bg-orange-500/5 cursor-pointer"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                                    ${isSelected ? "border-orange-400 bg-orange-500 text-white scale-110" : "border-muted-foreground/30"}`}>
                                    {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : opt.id.toUpperCase()}
                                </span>
                                <span className="leading-relaxed">{opt.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit */}
            <Button onClick={() => advanceScenario(selectedOptions)} disabled={selectedOptions.length === 0 || isTransitioning} className="w-full" size="lg">
                {scenarioIndex < scenarios.length - 1
                    ? <>Next Scenario <ChevronRight className="ml-2 h-4 w-4" /></>
                    : <>Complete Game <CheckCircle2 className="ml-2 h-4 w-4" /></>}
            </Button>
        </div>
    );
}
