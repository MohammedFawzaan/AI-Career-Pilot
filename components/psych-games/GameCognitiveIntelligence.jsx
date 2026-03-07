"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Timer, ChevronRight, GripVertical } from "lucide-react";

const TIME_LIMIT = 60;

/**
 * Cognitive Intelligence Game — Decision Ranking
 * User ranks 4 actions from Best (1) → Worst (4).
 * Score = 100 - (rankingDistance × 10), where distance = sum of |userPos - expertPos|
 */
export default function GameCognitiveIntelligence({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [userRanking, setUserRanking] = useState([]); // Array of action IDs in user's order
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [roundScores, setRoundScores] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastRoundScore, setLastRoundScore] = useState(null);
    const finalScoresRef = useRef(null);

    const round = rounds?.[roundIndex];
    const progress = ((roundIndex + 1) / (rounds?.length || 1)) * 100;

    // Calculate score for a round
    const calculateRoundScore = useCallback((userRank, expertRank) => {
        if (!userRank.length || !expertRank.length) return 0;
        let distance = 0;
        for (let i = 0; i < expertRank.length; i++) {
            const userPos = userRank.indexOf(expertRank[i]);
            if (userPos === -1) continue;
            distance += Math.abs(userPos - i);
        }
        return Math.max(0, 100 - (distance * 10));
    }, []);

    useEffect(() => {
        if (gameFinished && finalScoresRef.current) {
            const scores = finalScoresRef.current;
            const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            onComplete({ overallScore: overall, roundScores: scores });
        }
    }, [gameFinished, onComplete]);

    const handleSubmit = useCallback(() => {
        const expert = round?.expertRanking || [];
        const ranking = userRanking.length === 4 ? userRanking : (round?.actions?.map(a => a.id) || []);
        const score = calculateRoundScore(ranking, expert);
        setLastRoundScore(score);

        const newScores = [...roundScores, score];
        setRoundScores(newScores);

        setShowFeedback(true);
        setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                if (roundIndex < (rounds?.length || 1) - 1) {
                    setRoundIndex(prev => prev + 1);
                    setUserRanking([]);
                    setTimeLeft(TIME_LIMIT);
                    setIsTransitioning(false);
                    setShowFeedback(false);
                    setLastRoundScore(null);
                } else {
                    finalScoresRef.current = newScores;
                    setGameFinished(true);
                }
            }, 400);
        }, 1200);
    }, [round, userRanking, roundScores, roundIndex, rounds, calculateRoundScore]);

    // Timer
    useEffect(() => {
        if (gameFinished || isTransitioning || showFeedback) return;
        if (timeLeft <= 0) { handleSubmit(); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, handleSubmit, gameFinished, isTransitioning, showFeedback]);

    // Toggle an action in ranking
    const toggleRank = (actionId) => {
        if (showFeedback) return;
        setUserRanking(prev => {
            if (prev.includes(actionId)) {
                return prev.filter(id => id !== actionId);
            }
            if (prev.length >= 4) return prev;
            return [...prev, actionId];
        });
    };

    if (!round) return null;

    const timerColor = timeLeft > 30 ? "text-emerald-400" : timeLeft > 15 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 30 ? "bg-emerald-500/10 border-emerald-500/20" : timeLeft > 15 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

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

            {/* Instruction */}
            <p className="text-xs text-muted-foreground text-center font-medium">
                Click actions in order: Best (1st) → Worst (4th)
            </p>

            {/* Actions to rank */}
            <div className="space-y-2.5">
                {round.actions.map((action) => {
                    const rankPos = userRanking.indexOf(action.id);
                    const isRanked = rankPos !== -1;
                    const expertPos = showFeedback ? round.expertRanking.indexOf(action.id) : -1;
                    const isExpertMatch = showFeedback && rankPos === expertPos;

                    return (
                        <button key={action.id} onClick={() => toggleRank(action.id)} disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${showFeedback && isExpertMatch ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                                    : showFeedback && isRanked ? "border-amber-400/50 bg-amber-500/10 text-amber-300"
                                        : showFeedback ? "border-border/20 opacity-50"
                                            : isRanked ? "border-indigo-400/50 bg-indigo-500/10 text-foreground font-medium ring-1 ring-indigo-400/20"
                                                : "border-border/40 hover:border-indigo-400/40 hover:bg-indigo-500/5 cursor-pointer"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold
                                    ${isRanked ? "border-indigo-400 bg-indigo-500 text-white" : "border-muted-foreground/30"}`}>
                                    {isRanked ? rankPos + 1 : <GripVertical className="h-3 w-3" />}
                                </span>
                                <span className="leading-relaxed flex-1">{action.text}</span>
                                {showFeedback && (
                                    <span className="text-[10px] font-bold opacity-60">
                                        Expert: #{expertPos + 1}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit */}
            {!showFeedback && (
                <Button onClick={handleSubmit} disabled={userRanking.length < 4 || isTransitioning} className="w-full" size="lg">
                    Confirm Ranking <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )}

            {/* Feedback */}
            {showFeedback && lastRoundScore !== null && (
                <div className={`p-3 rounded-xl text-sm border flex items-center gap-2 
                    ${lastRoundScore >= 80 ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-300"
                        : lastRoundScore >= 50 ? "border-amber-400/30 bg-amber-500/5 text-amber-300"
                            : "border-red-400/30 bg-red-500/5 text-red-300"}`}>
                    <Brain className="h-4 w-4 flex-shrink-0" />
                    <span>Round score: {lastRoundScore}/100 — Expert ranking shown above.</span>
                </div>
            )}
        </div>
    );
}
