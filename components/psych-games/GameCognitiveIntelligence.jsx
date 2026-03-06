"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Timer, CheckCircle2, ChevronRight, Lightbulb } from "lucide-react";

const TIME_LIMIT = 60;

export default function GameCognitiveIntelligence({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [traitScores, setTraitScores] = useState({ analyticalThinking: 50, logicalReasoning: 50, problemSolving: 50, decisionMaking: 50 });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const finalScoresRef = useRef(null);

    const round = rounds?.[roundIndex];
    const progress = ((roundIndex + 1) / (rounds?.length || 1)) * 100;

    useEffect(() => {
        if (gameFinished && finalScoresRef.current) {
            const scores = finalScoresRef.current;
            const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
            const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
            const labelMap = {
                analyticalThinking: "Analytical Thinking",
                logicalReasoning: "Logical Reasoning",
                problemSolving: "Problem Solving",
                decisionMaking: "Decision Making",
            };
            onComplete({
                traits: scores,
                dominantTrait: labelMap[dominant] || dominant,
                overallScore: overall,
            });
        }
    }, [gameFinished, onComplete]);

    const applyAndAdvance = useCallback((optionId) => {
        setTraitScores(prev => {
            const newScores = { ...prev };
            if (rounds?.[roundIndex] && optionId) {
                const chosen = rounds[roundIndex].options.find(o => o.id === optionId);
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

        setShowFeedback(true);
        setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                if (roundIndex < (rounds?.length || 1) - 1) {
                    setRoundIndex(prev => prev + 1);
                    setSelectedOption(null);
                    setTimeLeft(TIME_LIMIT);
                    setIsTransitioning(false);
                    setShowFeedback(false);
                } else {
                    setGameFinished(true);
                }
            }, 400);
        }, 800);
    }, [roundIndex, rounds]);

    useEffect(() => {
        if (gameFinished || isTransitioning || showFeedback) return;
        if (timeLeft <= 0) { applyAndAdvance(selectedOption); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, selectedOption, applyAndAdvance, gameFinished, isTransitioning, showFeedback]);

    if (!round) return null;

    const timerColor = timeLeft > 30 ? "text-emerald-400" : timeLeft > 15 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 30 ? "bg-emerald-500/10 border-emerald-500/20" : timeLeft > 15 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";
    const isCorrect = selectedOption === round.bestAnswer;

    return (
        <div className={`space-y-5 transition-all duration-400 ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <Brain className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="font-semibold text-sm">Round {roundIndex + 1} of {rounds.length}</span>
                </div>
                {!showFeedback && (
                    <div className={`flex items-center gap-1.5 font-bold text-base px-3 py-1 rounded-full border ${timerBg} ${timerColor}`}>
                        <Timer className="h-3.5 w-3.5" />{timeLeft}s
                    </div>
                )}
            </div>

            <Progress value={progress} className="h-1.5" />

            {/* Scenario */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/8 via-indigo-500/4 to-transparent border border-indigo-500/15">
                <p className="text-sm leading-relaxed mb-3">{round.scenario}</p>
                <p className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />{round.question}
                </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
                {round.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isBest = showFeedback && opt.id === round.bestAnswer;
                    const isWrong = showFeedback && isSelected && opt.id !== round.bestAnswer;
                    return (
                        <button key={opt.id} onClick={() => !showFeedback && setSelectedOption(opt.id)} disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${isBest ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300 font-medium ring-1 ring-emerald-400/20"
                                    : isWrong ? "border-red-400/50 bg-red-500/10 text-red-300 font-medium"
                                        : isSelected && !showFeedback ? "border-indigo-400/50 bg-indigo-500/10 text-foreground font-medium ring-1 ring-indigo-400/20"
                                            : showFeedback ? "border-border/20 text-muted-foreground/40 opacity-50"
                                                : "border-border/40 hover:border-indigo-400/40 hover:bg-indigo-500/5 cursor-pointer"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                                    ${isBest ? "border-emerald-400 bg-emerald-500 text-white"
                                        : isWrong ? "border-red-400 bg-red-500 text-white"
                                            : isSelected && !showFeedback ? "border-indigo-400 bg-indigo-500 text-white"
                                                : "border-muted-foreground/30"}`}>
                                    {isBest ? <CheckCircle2 className="h-3.5 w-3.5" /> : opt.id.toUpperCase()}
                                </span>
                                <span className="leading-relaxed">{opt.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit */}
            {!showFeedback && (
                <Button onClick={() => applyAndAdvance(selectedOption)} disabled={!selectedOption || isTransitioning} className="w-full" size="lg">
                    Confirm Answer <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )}

            {showFeedback && !isTransitioning && (
                <div className={`p-3 rounded-xl text-sm border flex items-center gap-2 ${isCorrect ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-300" : "border-amber-400/30 bg-amber-500/5 text-amber-300"}`}>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <Lightbulb className="h-4 w-4 flex-shrink-0" />}
                    <span>{isCorrect ? "Great analytical thinking!" : "The best approach was highlighted above."}</span>
                </div>
            )}
        </div>
    );
}
