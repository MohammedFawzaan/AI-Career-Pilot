"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Timer, ChevronRight, CheckCircle2, Award } from "lucide-react";

const TIME_LIMIT = 60;

/**
 * Cognitive Intelligence Game — Weighted Single Selection
 * User picks the BEST action from 4 options.
 * Each option has an expert weight: 100 (best), 70 (good), 40 (mediocre), 10 (poor).
 * Score = weight of chosen option. Final = average of all rounds.
 * After each round, shows the full expert ranking with explanations.
 */
export default function GameCognitiveIntelligence({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [roundScores, setRoundScores] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastRoundScore, setLastRoundScore] = useState(null);
    const finalScoresRef = useRef(null);

    const round = rounds?.[roundIndex];
    const progress = ((roundIndex + 1) / (rounds?.length || 1)) * 100;

    useEffect(() => {
        if (gameFinished && finalScoresRef.current) {
            const scores = finalScoresRef.current;
            const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            onComplete({ overallScore: overall, roundScores: scores });
        }
    }, [gameFinished, onComplete]);

    const handleSubmit = useCallback(() => {
        const chosen = round?.options?.find(o => o.id === selectedOption);
        const score = chosen?.weight ?? 10; // default to lowest if somehow nothing selected
        setLastRoundScore(score);

        const newScores = [...roundScores, score];
        setRoundScores(newScores);

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
                    setLastRoundScore(null);
                } else {
                    finalScoresRef.current = newScores;
                    setGameFinished(true);
                }
            }, 400);
        }, 2500); // longer feedback display to read explanations
    }, [round, selectedOption, roundScores, roundIndex, rounds]);

    // Timer
    useEffect(() => {
        if (gameFinished || isTransitioning || showFeedback) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, handleSubmit, gameFinished, isTransitioning, showFeedback]);

    if (!round) return null;

    const timerColor = timeLeft > 30 ? "text-emerald-400" : timeLeft > 15 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 30 ? "bg-emerald-500/10 border-emerald-500/20" : timeLeft > 15 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

    // Sort options by weight for feedback display
    const sortedOptions = showFeedback
        ? [...(round.options || [])].sort((a, b) => b.weight - a.weight)
        : round.options || [];

    const getWeightLabel = (w) => w === 100 ? "Best" : w === 70 ? "Good" : w === 40 ? "Mediocre" : "Poor";
    const getWeightColor = (w) => w === 100 ? "text-emerald-400" : w === 70 ? "text-blue-400" : w === 40 ? "text-amber-400" : "text-red-400";
    const getWeightBorder = (w) => w === 100 ? "border-emerald-400/50 bg-emerald-500/10" : w === 70 ? "border-blue-400/50 bg-blue-500/10" : w === 40 ? "border-amber-400/50 bg-amber-500/10" : "border-red-400/50 bg-red-500/10";

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
                <p className="text-sm leading-relaxed mb-2">{round.scenario}</p>
                <p className="text-sm font-semibold text-indigo-300">{round.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
                {(showFeedback ? sortedOptions : round.options).map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isUserChoice = showFeedback && selectedOption === opt.id;

                    return (
                        <button key={opt.id} onClick={() => !showFeedback && setSelectedOption(opt.id)} disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${showFeedback ? `${getWeightBorder(opt.weight)} ${isUserChoice ? "ring-2 ring-indigo-400/40" : ""}`
                                    : isSelected ? "border-indigo-400/50 bg-indigo-500/10 text-foreground font-medium ring-1 ring-indigo-400/20"
                                        : "border-border/40 hover:border-indigo-400/40 hover:bg-indigo-500/5 cursor-pointer"}`}>
                            <div className="flex items-start gap-3">
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5
                                    ${showFeedback ? `${getWeightColor(opt.weight)} border-current`
                                        : isSelected ? "border-indigo-400 bg-indigo-500 text-white"
                                            : "border-muted-foreground/30"}`}>
                                    {showFeedback ? <Award className="h-3 w-3" />
                                        : isSelected ? <CheckCircle2 className="h-3.5 w-3.5" />
                                            : opt.id.toUpperCase()}
                                </span>
                                <div className="flex-1">
                                    <span className="leading-relaxed">{opt.text}</span>
                                    {showFeedback && (
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getWeightBorder(opt.weight)} ${getWeightColor(opt.weight)}`}>
                                                {getWeightLabel(opt.weight)} ({opt.weight}/100)
                                            </span>
                                            {isUserChoice && (
                                                <span className="text-[10px] font-bold text-indigo-400">← Your choice</span>
                                            )}
                                        </div>
                                    )}
                                    {showFeedback && opt.explanation && (
                                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{opt.explanation}</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit */}
            {!showFeedback && (
                <Button onClick={handleSubmit} disabled={!selectedOption || isTransitioning} className="w-full" size="lg">
                    Confirm Decision <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )}

            {/* Feedback */}
            {showFeedback && lastRoundScore !== null && (
                <div className={`p-3 rounded-xl text-sm border flex items-center gap-2
                    ${lastRoundScore >= 80 ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-300"
                        : lastRoundScore >= 50 ? "border-amber-400/30 bg-amber-500/5 text-amber-300"
                            : "border-red-400/30 bg-red-500/5 text-red-300"}`}>
                    <Brain className="h-4 w-4 flex-shrink-0" />
                    <span>Your decision scored {lastRoundScore}/100 — Expert ranking shown above.</span>
                </div>
            )}
        </div>
    );
}
