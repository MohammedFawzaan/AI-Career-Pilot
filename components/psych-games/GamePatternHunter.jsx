"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Timer, CheckCircle2, ChevronRight, XCircle, ArrowUpRight, Shuffle, Scale } from "lucide-react";

const TIME_PER_ROUND = 60;

const TYPE_META = {
    sequence: { label: "Sequence", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    flowchart: { label: "Flowchart", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    anomaly: { label: "Anomaly", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    priority: { label: "Priority", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    mismatch: { label: "Mismatch", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    tradeoff: { label: "Tradeoff", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

export default function GamePatternHunter({ rounds, onComplete }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
    const [traitScores, setTraitScores] = useState({
        abstraction: 50, anomalyDetection: 50, optimization: 50,
        prioritization: 50, careerAwareness: 50, decisionClarity: 50,
    });
    const [isTransitioning, setIsTransitioning] = useState(false);

    const round = rounds?.[roundIndex];
    const progress = ((roundIndex + 1) / (rounds?.length || 1)) * 100;
    const typeMeta = TYPE_META[round?.type] || TYPE_META.sequence;

    const handleAnswer = useCallback((answer) => {
        if (showFeedback || selectedAnswer) return;
        setSelectedAnswer(answer);
        setShowFeedback(true);
        if (!round) return;
        const correctKey = round.answer || round.bugStep || round.bugRow;
        const isCorrect = answer === correctKey;
        if (isCorrect && round.trait) {
            setTraitScores(prev => ({
                ...prev,
                [round.trait]: Math.min(100, (prev[round.trait] || 50) + 15),
            }));
        }
    }, [showFeedback, selectedAnswer, round]);

    useEffect(() => {
        if (showFeedback) return;
        if (timeLeft <= 0) { handleAnswer("__timeout__"); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, showFeedback, handleAnswer]);

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (roundIndex < (rounds?.length || 1) - 1) {
                setRoundIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
                setTimeLeft(TIME_PER_ROUND);
                setIsTransitioning(false);
            } else {
                const dominant = Object.entries(traitScores).sort((a, b) => b[1] - a[1])[0][0];
                const traitMap = {
                    abstraction: "Pattern Recognition & Abstraction",
                    anomalyDetection: "Anomaly & Bug Detection",
                    optimization: "Optimization Thinking",
                    prioritization: "Strategic Prioritization",
                    careerAwareness: "Career Awareness",
                    decisionClarity: "Decision Clarity",
                };
                onComplete({
                    traits: traitScores,
                    dominantTrait: traitMap[dominant] || dominant,
                    score: Math.round(Object.values(traitScores).reduce((a, b) => a + b, 0) / Object.keys(traitScores).length),
                });
            }
        }, 500);
    };

    if (!round) return null;

    const timerColor = timeLeft > 30 ? "text-emerald-400" : timeLeft > 15 ? "text-amber-400" : "text-red-400";
    const timerBg = timeLeft > 30 ? "bg-emerald-500/10" : timeLeft > 15 ? "bg-amber-500/10" : "bg-red-500/10";
    const correctKey = round.answer || round.bugStep || round.bugRow;
    const isCorrect = selectedAnswer && selectedAnswer !== "__timeout__" && selectedAnswer === correctKey;

    // Check if this is one of the simple 4-option types (priority, mismatch, tradeoff, or sequence)
    const isMultipleChoice = ["sequence", "priority", "mismatch", "tradeoff"].includes(round.type);

    return (
        <div className={`space-y-5 transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${typeMeta.bg} border ${typeMeta.border}`}>
                        <Brain className={`h-4 w-4 ${typeMeta.color}`} />
                    </div>
                    <span className="font-semibold text-sm">Round {roundIndex + 1} of {rounds.length}</span>
                    <Badge variant="outline" className={`text-xs capitalize ${typeMeta.bg} ${typeMeta.border} ${typeMeta.color}`}>{typeMeta.label}</Badge>
                </div>
                {!showFeedback && (
                    <div className={`flex items-center gap-1.5 font-bold text-lg px-3 py-1 rounded-full ${timerBg} ${timerColor}`}>
                        <Timer className="h-4 w-4" />{timeLeft}s
                    </div>
                )}
            </div>

            {/* Progress */}
            <div className="space-y-1">
                <Progress value={progress} className="h-2 rounded-full" />
                <p className="text-[10px] text-muted-foreground text-right">{Math.round(progress)}% complete</p>
            </div>

            {/* Question */}
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${typeMeta.bg} via-transparent to-transparent border ${typeMeta.border} backdrop-blur-sm space-y-3`}>
                <p className="text-sm font-medium">{round.question}</p>

                {/* Sequence display */}
                {round.type === "sequence" && round.sequence && (
                    <p className="text-lg font-mono font-bold text-center py-2 tracking-widest text-blue-300 bg-blue-500/5 rounded-xl border border-blue-500/10">{round.sequence}</p>
                )}

                {/* Flowchart display */}
                {round.type === "flowchart" && (
                    <div className="flex flex-col gap-1.5 mt-1">
                        {round.steps?.map((step, i) => (
                            <div key={step.id}>
                                <button onClick={() => handleAnswer(step.id)} disabled={!!showFeedback}
                                    className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-all
                                        ${showFeedback && step.isBug ? "border-red-400 bg-red-500/10 text-red-300"
                                            : showFeedback && selectedAnswer === step.id && !step.isBug ? "border-red-400 bg-red-500/10 text-red-300"
                                                : !showFeedback ? "border-border/50 hover:border-blue-400/50 hover:bg-blue-500/5 cursor-pointer"
                                                    : "border-border/20 opacity-40"}`}>
                                    <span className="font-bold text-xs w-5 text-blue-400">{step.id}</span>
                                    <span>{step.text}</span>
                                    {showFeedback && step.isBug && <XCircle className="ml-auto h-4 w-4 text-red-400 flex-shrink-0" />}
                                </button>
                                {i < round.steps.length - 1 && <span className="text-muted-foreground/50 text-xs ml-3">↓</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Anomaly table display */}
                {round.type === "anomaly" && (
                    <div className="overflow-x-auto mt-1 rounded-xl border border-border/30">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border/30 bg-muted/20">
                                    {round.headers?.map(h => <th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {round.rows?.map((row) => (
                                    <tr key={row.id} onClick={() => !showFeedback && handleAnswer(row.id)}
                                        className={`border-b border-border/20 cursor-pointer transition-colors
                                            ${showFeedback && row.id === round.bugRow ? "bg-red-500/10"
                                                : showFeedback && selectedAnswer === row.id && row.id !== round.bugRow ? "bg-red-500/10"
                                                    : !showFeedback ? "hover:bg-blue-500/5" : ""}`}>
                                        {row.data?.map((cell, i) => (
                                            <td key={i} className={`px-3 py-2.5 ${showFeedback && row.id === round.bugRow ? "text-red-300 font-bold" : ""}`}>{cell}</td>
                                        ))}
                                        {showFeedback && row.id === round.bugRow && <td><XCircle className="h-4 w-4 text-red-400" /></td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Multiple Choice Options (sequence, priority, mismatch, tradeoff) */}
            {isMultipleChoice && round.options && (
                <div className={`grid ${round.type === "sequence" ? "grid-cols-2" : "grid-cols-1"} gap-2.5`}>
                    {round.options?.map((opt, i) => {
                        const correct = opt === round.answer;
                        const isThis = selectedAnswer === opt;
                        const icons = { priority: <ArrowUpRight className="h-3.5 w-3.5" />, mismatch: <Shuffle className="h-3.5 w-3.5" />, tradeoff: <Scale className="h-3.5 w-3.5" /> };
                        const icon = icons[round.type];
                        return (
                            <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!showFeedback}
                                className={`${round.type === "sequence" ? "py-3.5 text-center font-bold text-lg" : "py-3 px-4 text-left text-sm"} rounded-xl border transition-all
                                    ${showFeedback && correct ? `border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]`
                                        : showFeedback && isThis && !correct ? "border-red-400 bg-red-500/15 text-red-300"
                                            : !showFeedback ? `border-border/50 hover:${typeMeta.border} hover:${typeMeta.bg} cursor-pointer`
                                                : "border-border/20 opacity-30"}`}>
                                {round.type !== "sequence" ? (
                                    <div className="flex items-center gap-2.5">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all
                                            ${isThis && showFeedback && correct ? "border-emerald-400 bg-emerald-500 text-white"
                                                : isThis && showFeedback ? "border-red-400 bg-red-500 text-white"
                                                    : showFeedback && correct ? "border-emerald-400 bg-emerald-500 text-white"
                                                        : "border-muted-foreground/30"}`}>
                                            {showFeedback && (correct || isThis) ? (correct ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />) : String.fromCharCode(65 + i)}
                                        </span>
                                        <span className="leading-relaxed">{opt}</span>
                                        {icon && !showFeedback && <span className={`ml-auto ${typeMeta.color} opacity-40`}>{icon}</span>}
                                    </div>
                                ) : opt}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Feedback */}
            {showFeedback && (
                <div className={`p-4 rounded-2xl text-sm border flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300
                    ${isCorrect ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-red-400/30 bg-red-500/10 text-red-300"}`}>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <span>{round.explanation}</span>
                </div>
            )}

            {/* Next Button */}
            {showFeedback && (
                <Button onClick={handleNext} className="w-full" size="lg">
                    {roundIndex < rounds.length - 1
                        ? <>Next Round <ChevronRight className="ml-2 h-4 w-4" /></>
                        : <>Complete Game <CheckCircle2 className="ml-2 h-4 w-4" /></>}
                </Button>
            )}
        </div>
    );
}
