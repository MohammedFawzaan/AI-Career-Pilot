"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Timer, CheckCircle2, ChevronRight, XCircle, Eye } from "lucide-react";

const TIME_LIMIT = 40;

export default function GameFocusPrecision({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [traitScores, setTraitScores] = useState({ attentionToDetail: 50, accuracy: 50, persistence: 50, taskDiscipline: 50 });
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
                attentionToDetail: "Attention to Detail",
                accuracy: "Accuracy",
                persistence: "Persistence",
                taskDiscipline: "Task Discipline",
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
        }, 1000);
    }, [roundIndex, rounds]);

    useEffect(() => {
        if (gameFinished || isTransitioning || showFeedback) return;
        if (timeLeft <= 0) { applyAndAdvance(selectedOption); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, selectedOption, applyAndAdvance, gameFinished, isTransitioning, showFeedback]);

    if (!round) return null;

    const timerColor = timeLeft > 20 ? "text-emerald-400" : timeLeft > 10 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 20 ? "bg-emerald-500/10 border-emerald-500/20" : timeLeft > 10 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";
    const correctKey = round.correctAnswer;
    const isCorrect = selectedOption && selectedOption === correctKey;

    const typeLabel = { spot_detail: "Spot the Detail", sequence: "Pattern Sequence", precision: "Precision Check" };

    return (
        <div className={`space-y-5 transition-all duration-400 ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        <Crosshair className="h-4 w-4 text-teal-400" />
                    </div>
                    <span className="font-semibold text-sm">Round {roundIndex + 1} of {rounds.length}</span>
                    <Badge variant="outline" className="text-[10px] capitalize border-teal-500/20 text-teal-400">
                        {typeLabel[round.type] || round.type}
                    </Badge>
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
                <p className="text-sm leading-relaxed mb-2">{round.scenario}</p>
                {round.type === "sequence" && round.sequence && (
                    <p className="text-lg font-mono font-bold text-center py-3 tracking-[0.25em] text-teal-300">{round.sequence}</p>
                )}
                <p className="text-sm font-semibold text-teal-300 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />{round.question}
                </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
                {round.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isBest = showFeedback && opt.id === correctKey;
                    const isWrong = showFeedback && isSelected && opt.id !== correctKey;
                    return (
                        <button key={opt.id} onClick={() => !showFeedback && setSelectedOption(opt.id)} disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                ${isBest ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300 font-medium ring-1 ring-emerald-400/20"
                                    : isWrong ? "border-red-400/50 bg-red-500/10 text-red-300 font-medium"
                                        : isSelected && !showFeedback ? "border-teal-400/50 bg-teal-500/10 text-foreground font-medium ring-1 ring-teal-400/20"
                                            : showFeedback ? "border-border/20 text-muted-foreground/40 opacity-50"
                                                : "border-border/40 hover:border-teal-400/40 hover:bg-teal-500/5 cursor-pointer"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                                    ${isBest ? "border-emerald-400 bg-emerald-500 text-white"
                                        : isWrong ? "border-red-400 bg-red-500 text-white"
                                            : isSelected && !showFeedback ? "border-teal-400 bg-teal-500 text-white"
                                                : "border-muted-foreground/30"}`}>
                                    {isBest ? <CheckCircle2 className="h-3.5 w-3.5" /> : isWrong ? <XCircle className="h-3.5 w-3.5" /> : opt.id.toUpperCase()}
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

            {showFeedback && !isTransitioning && round.explanation && (
                <div className="p-3 rounded-xl text-sm border border-teal-400/20 bg-teal-500/5 text-teal-300 flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{round.explanation}</span>
                </div>
            )}
        </div>
    );
}
