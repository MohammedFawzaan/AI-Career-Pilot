"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import GameCognitiveIntelligence from "@/components/psych-games/GameCognitiveIntelligence";
import GameFocusPrecision from "@/components/psych-games/GameFocusPrecision";
import GameCuriosityLearning from "@/components/psych-games/GameCuriosityLearning";
import { generatePsychGameContent } from "@/actions/psych-games";
import { Brain, Crosshair, Sparkles, ChevronRight, Loader2, Zap, Target, TrendingUp } from "lucide-react";

const GAMES_META = [
    { id: "cognitiveGame", title: "Cognitive Intelligence", icon: Brain, iconColor: "text-indigo-400", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", gradientFrom: "from-indigo-500/20", tagline: "How sharp is your thinking?", description: "5 scenario-based rounds testing your analytical thinking, logical reasoning, and decision making.", duration: "~3 mins", tests: ["Analytical Thinking", "Logical Reasoning", "Problem Solving", "Decision Making"] },
    { id: "focusGame", title: "Focus & Precision", icon: Crosshair, iconColor: "text-teal-400", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/20", gradientFrom: "from-teal-500/20", tagline: "How sharp are your eyes?", description: "5 rounds testing attention to detail, accuracy, and pattern recognition. 40 seconds per round.", duration: "~3 mins", tests: ["Attention to Detail", "Accuracy", "Persistence", "Task Discipline"] },
    { id: "curiosityGame", title: "Curiosity & Learning", icon: Sparkles, iconColor: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", gradientFrom: "from-amber-500/20", tagline: "How do you explore the unknown?", description: "5 scenarios about new and unfamiliar situations. No timer — take your time.", duration: "~2 mins", tests: ["Curiosity", "Learning Initiative", "Adaptability", "Exploration"] },
];

export default function PsychGamesWrapper({ targetRole, onComplete }) {
    const [gameContent, setGameContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [gameStep, setGameStep] = useState("intro");
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [psychProfile, setPsychProfile] = useState({});
    const [scores, setScores] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchContent = async () => {
            try {
                const content = await generatePsychGameContent({ targetRole: targetRole || null });
                setGameContent(content);
            } catch (err) {
                console.error("Failed to generate game content:", err);
                setLoadError(true);
            } finally {
                setLoadingContent(false);
            }
        };

        fetchContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalGames = GAMES_META.length;
    const currentGameMeta = GAMES_META[currentGameIndex];

    const handleGameComplete = (result) => {
        const updated = { ...psychProfile, [currentGameMeta.id]: result };
        setPsychProfile(updated);
        if (currentGameIndex < totalGames - 1) {
            setCurrentGameIndex(prev => prev + 1);
            setGameStep("intro");
        } else {
            const finalScores = {
                cognitiveIntelligence: updated.cognitiveGame?.overallScore || 50,
                focusPrecision: updated.focusGame?.overallScore || 50,
                curiosityLearning: updated.curiosityGame?.overallScore || 50,
            };
            setScores(finalScores);
            setGameStep("reveal");
        }
    };

    if (loadingContent) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-5">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <Brain className="h-14 w-14 text-primary animate-pulse relative z-10" />
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground absolute -bottom-1 -right-1 z-20" />
                </div>
                <div className="text-center space-y-1.5">
                    <p className="font-semibold text-lg">Preparing psychological games...</p>
                    <p className="text-sm text-muted-foreground">
                        {targetRole ? `Tailoring scenarios for "${targetRole}"` : "Creating general assessment scenarios"}
                    </p>
                </div>
                <div className="w-48">
                    <Progress value={undefined} className="h-1.5 animate-pulse" />
                </div>
            </div>
        );
    }

    if (loadError || !gameContent) {
        return (
            <div className="text-center py-10 space-y-3">
                <p className="text-red-400 font-semibold">Failed to generate games</p>
                <p className="text-sm text-muted-foreground">Please refresh and try again.</p>
            </div>
        );
    }

    if (gameStep === "intro") {
        const game = currentGameMeta;
        const Icon = game.icon;
        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">Game {currentGameIndex + 1} of {totalGames}</span>
                        <span className="font-medium">{game.duration}</span>
                    </div>
                    <Progress value={(currentGameIndex / totalGames) * 100} className="h-2" />
                </div>
                <div className={`p-6 rounded-2xl border ${game.borderColor} bg-gradient-to-br ${game.gradientFrom} to-transparent space-y-4`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${game.bgColor} border ${game.borderColor}`}>
                            <Icon className={`h-6 w-6 ${game.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{game.title}</h3>
                            <p className={`text-sm ${game.iconColor}`}>{game.tagline}</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {game.tests.map(t => (
                            <span key={t} className={`text-xs px-3 py-1.5 rounded-full border ${game.bgColor} ${game.borderColor} ${game.iconColor} font-medium`}>{t}</span>
                        ))}
                    </div>
                </div>
                <Button onClick={() => setGameStep("playing")} className="w-full" size="lg">
                    Start Game <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        );
    }

    if (gameStep === "playing") {
        const game = currentGameMeta;
        const Icon = game.icon;
        return (
            <div className="space-y-4">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${game.borderColor} bg-gradient-to-r ${game.gradientFrom} to-transparent`}>
                    <Icon className={`h-4 w-4 ${game.iconColor}`} />
                    <span className={`text-xs font-semibold ${game.iconColor}`}>{game.title}</span>
                </div>
                {currentGameIndex === 0 && gameContent.cognitiveRounds && (
                    <GameCognitiveIntelligence rounds={gameContent.cognitiveRounds} onComplete={handleGameComplete} />
                )}
                {currentGameIndex === 1 && gameContent.focusRounds && (
                    <GameFocusPrecision rounds={gameContent.focusRounds} onComplete={handleGameComplete} />
                )}
                {currentGameIndex === 2 && gameContent.curiosityRounds && (
                    <GameCuriosityLearning rounds={gameContent.curiosityRounds} onComplete={handleGameComplete} />
                )}
            </div>
        );
    }

    if (gameStep === "reveal" && scores) {
        const scoreCards = [
            { label: "Cognitive Intelligence", value: scores.cognitiveIntelligence, icon: Brain, color: "text-indigo-400", bg: "from-indigo-500/10", border: "border-indigo-500/20" },
            { label: "Focus & Precision", value: scores.focusPrecision, icon: Crosshair, color: "text-teal-400", bg: "from-teal-500/10", border: "border-teal-500/20" },
            { label: "Curiosity & Learning", value: scores.curiosityLearning, icon: Sparkles, color: "text-amber-400", bg: "from-amber-500/10", border: "border-amber-500/20" },
        ];
        const overallAvg = Math.round((scores.cognitiveIntelligence + scores.focusPrecision + scores.curiosityLearning) / 3);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <div className="text-5xl">🧠</div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Your Psychological Profile</p>
                    <h2 className="text-2xl font-bold gradient-title">Assessment Complete</h2>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Score</p>
                    <p className="text-4xl font-bold gradient-title">{overallAvg}</p>
                </div>
                <div className="space-y-3">
                    {scoreCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className={`p-4 rounded-2xl bg-gradient-to-r ${card.bg} to-transparent border ${card.border} space-y-2`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${card.color}`} />
                                        <span className="text-sm font-semibold">{card.label}</span>
                                    </div>
                                    <span className={`text-lg font-bold ${card.color}`}>{card.value}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                                    <div className={`h-full rounded-full bg-current ${card.color} transition-all duration-1000`} style={{ width: `${card.value}%` }} />
                                </div>

                            </div>
                        );
                    })}
                </div>
                <Button onClick={() => { setIsSubmitting(true); onComplete({ psychScores: { cognitiveScore: scores.cognitiveIntelligence, focusScore: scores.focusPrecision, curiosityScore: scores.curiosityLearning } }); }} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Your Career Blueprint...</> : <>Generate My Career Blueprint 🎯</>}
                </Button>
            </div>
        );
    }
    return null;
}
