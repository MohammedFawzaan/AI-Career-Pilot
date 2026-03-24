"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crosshair, Timer, ChevronRight, Check, X, Eye } from "lucide-react";

const TIME_LIMIT = 40;

/**
 * Focus & Precision Game — Correct Identification
 * User must find the ONE correct claim among 4 (3 are wrong).
 * Precision = 100 if correct, 0 if wrong.
 * Final = (Precision × 0.8) + (SpeedScore × 0.2)
 */
export default function GameFocusPrecision({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [roundScores, setRoundScores] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastRoundScore, setLastRoundScore] = useState(null);
    const finalScoresRef = useRef(null);
    const roundStartRef = useRef(Date.now());

    const round = rounds?.[roundIndex];
    const progress = ((roundIndex + 1) / (rounds?.length || 1)) * 100;

    // Calculate speed score: 60-100 based on time taken (faster = higher)
    const getSpeedScore = useCallback((timeTaken) => {
        const ratio = Math.min(timeTaken / TIME_LIMIT, 1);
        return Math.round(100 - (ratio * 40));
    }, []);

    // Calculate score for a round
    const calculateRoundScore = useCallback((selected, claims) => {
        const correctClaim = claims.find(c => c.isCorrect);
        const precision = selected === correctClaim?.id ? 100 : 0;

        const timeTaken = (Date.now() - roundStartRef.current) / 1000;
        const speedScore = getSpeedScore(timeTaken);

        const finalScore = Math.round((precision * 0.8) + (speedScore * 0.2));
        return Math.max(0, Math.min(100, finalScore));
    }, [getSpeedScore]);

    useEffect(() => {
        if (gameFinished && finalScoresRef.current) {
            const scores = finalScoresRef.current;
            const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            onComplete({ overallScore: overall, roundScores: scores });
        }
    }, [gameFinished, onComplete]);

    const handleSubmit = useCallback(() => {
        const score = calculateRoundScore(
            selectedClaim,
            round?.claims || []
        );
        setLastRoundScore(score);

        const newScores = [...roundScores, score];
        setRoundScores(newScores);

        setShowFeedback(true);
        setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                if (roundIndex < (rounds?.length || 1) - 1) {
                    setRoundIndex(prev => prev + 1);
                    setSelectedClaim(null);
                    setTimeLeft(TIME_LIMIT);
                    roundStartRef.current = Date.now();
                    setIsTransitioning(false);
                    setShowFeedback(false);
                    setLastRoundScore(null);
                } else {
                    finalScoresRef.current = newScores;
                    setGameFinished(true);
                }
            }, 400);
        }, 1500);
    }, [round, selectedClaim, roundScores, roundIndex, rounds, calculateRoundScore]);

    // Timer
    useEffect(() => {
        if (gameFinished || isTransitioning || showFeedback) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, handleSubmit, gameFinished, isTransitioning, showFeedback]);

    if (!round) return null;

    const timerColor = timeLeft > 20 ? "text-emerald-400" : timeLeft > 10 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 20 ? "bg-emerald-500/10 border-emerald-500/20" : timeLeft > 10 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

    return (
        <div className={`space-y-5 transition-all duration-400 ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        <Crosshair className="h-4 w-4 text-teal-400" />
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/8 via-teal-500/4 to-transparent border border-teal-500/15">
                <p className="text-sm leading-relaxed">{round.scenario}</p>
            </div>

            {/* Instruction */}
            <p className="text-xs text-muted-foreground text-center font-medium flex items-center justify-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Find the ONE correct claim about the above
            </p>

            {/* Claims (single-select) */}
            <div className="space-y-2.5">
                {round.claims.map((claim) => {
                    const isSelected = selectedClaim === claim.id;
                    const isCorrectClaim = claim.isCorrect;
                    const userPickedThis = showFeedback && selectedClaim === claim.id;
                    const userWasRight = userPickedThis && isCorrectClaim;
                    const userWasWrong = userPickedThis && !isCorrectClaim;

                    return (
                        <button key={claim.id} onClick={() => !showFeedback && setSelectedClaim(claim.id)} disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${showFeedback && isCorrectClaim ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300 font-medium"
                                    : showFeedback && userWasWrong ? "border-red-400/50 bg-red-500/10 text-red-300"
                                        : showFeedback ? "border-border/20 opacity-40"
                                            : isSelected ? "border-teal-400/50 bg-teal-500/10 text-foreground font-medium ring-1 ring-teal-400/20"
                                                : "border-border/40 hover:border-teal-400/40 hover:bg-teal-500/5 cursor-pointer"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                                    ${showFeedback && isCorrectClaim ? "border-emerald-400 bg-emerald-500 text-white"
                                        : showFeedback && userWasWrong ? "border-red-400 bg-red-500 text-white"
                                            : isSelected && !showFeedback ? "border-teal-400 bg-teal-500 text-white"
                                                : "border-muted-foreground/30"}`}>
                                    {showFeedback && isCorrectClaim ? <Check className="h-3 w-3" />
                                        : showFeedback && userWasWrong ? <X className="h-3 w-3" />
                                            : claim.id.toUpperCase()}
                                </span>
                                <span className="leading-relaxed flex-1">{claim.text}</span>
                                {showFeedback && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                                        ${isCorrectClaim ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                        {isCorrectClaim ? "✓ CORRECT" : "✗ WRONG"}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit */}
            {!showFeedback && (
                <Button onClick={handleSubmit} disabled={!selectedClaim || isTransitioning} className="w-full" size="lg">
                    Submit Answer <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )}

            {/* Feedback */}
            {showFeedback && lastRoundScore !== null && (
                <div className={`p-3 rounded-xl text-sm border flex items-center gap-2
                    ${lastRoundScore >= 70 ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-300"
                        : "border-red-400/30 bg-red-500/5 text-red-300"}`}>
                    <Crosshair className="h-4 w-4 flex-shrink-0" />
                    <span>{lastRoundScore >= 70 ? "Correct!" : "Wrong!"} Precision score: {lastRoundScore}/100</span>
                </div>
            )}
        </div>
    );
}
