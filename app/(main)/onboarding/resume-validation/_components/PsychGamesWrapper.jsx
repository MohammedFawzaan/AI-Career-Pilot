"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import GameDecisionPressure from "@/components/psych-games/GameDecisionPressure";
import GamePatternHunter from "@/components/psych-games/GamePatternHunter";
import GameHiddenPersona from "@/components/psych-games/GameHiddenPersona";
import { generatePsychGameContent } from "@/actions/psych-games";
import { savePsychStats } from "@/actions/psych-stats";
import { AlertTriangle, Brain, MessageSquare, ChevronRight, Loader2, Sparkles, Trophy, Zap, Shield } from "lucide-react";

const GAMES_META = [
    { id: "decisionGame", title: "Decision Under Pressure", icon: AlertTriangle, iconColor: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20", gradientFrom: "from-orange-500/20", gradientTo: "to-orange-500/5", tagline: "How do you react when things go wrong?", description: "3 rapid career crisis scenarios. Pick 2 actions per scenario. Be honest — there are no wrong answers.", duration: "~2 mins", tests: ["Risk Tolerance", "Leadership Style", "Ethical Reasoning"] },
    { id: "patternGame", title: "Pattern Hunter", icon: Brain, iconColor: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", gradientFrom: "from-blue-500/20", gradientTo: "to-blue-500/5", tagline: "How does your brain solve problems?", description: "6 rounds: 3 logic puzzles + 3 career-based challenges. 60 seconds per round.", duration: "~4 mins", tests: ["Pattern Recognition", "Bug Detection", "Career Prioritization", "Decision Clarity"] },
    { id: "personaGame", title: "Hidden Persona", icon: MessageSquare, iconColor: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", gradientFrom: "from-purple-500/20", gradientTo: "to-purple-500/5", tagline: "How do you show up for your team?", description: "3 short workplace chat scenarios. Pick how you'd genuinely respond.", duration: "~1 min", tests: ["Openness", "Conscientiousness", "Team Dynamics"] },
];

function deriveArchetype(psychProfile) {
    const { decisionGame, patternGame, personaGame } = psychProfile;
    const isAnalytical = (decisionGame?.traits?.analytical || 0) > 65;
    const isRiskTaker = (decisionGame?.traits?.riskAppetite || 50) > 65;
    const isLeader = (decisionGame?.traits?.leadership || 0) > 65;
    const isAbstractor = (patternGame?.traits?.abstraction || 0) > 65;
    const isAnomalySpotter = (patternGame?.traits?.anomalyDetection || 0) > 65;
    const isOptimizer = (patternGame?.traits?.optimization || 0) > 65;
    const isCreative = (personaGame?.bigFive?.O || 50) > 65;
    const isConscientiousness = (personaGame?.bigFive?.C || 50) > 65;
    const isExtrovert = (personaGame?.bigFive?.E || 50) > 65;
    const isEmpathetic = (personaGame?.bigFive?.A || 50) > 65;
    const riskScore = decisionGame?.traits?.riskAppetite || 50;
    const riskProfile = riskScore < 40 ? "Low" : riskScore < 70 ? "Moderate" : "High";
    let title = "Balanced Professional", strength = "Adaptability";
    if (isAbstractor && isAnalytical) { title = "Systems Architect"; strength = "Structured Abstraction"; }
    else if (isAnomalySpotter && isAnalytical) { title = "Precision Engineer"; strength = "Anomaly Detection"; }
    else if (isRiskTaker && isCreative) { title = "Risk-Driven Innovator"; strength = "Creative Problem Solving"; }
    else if (isLeader && isExtrovert) { title = "Collaborative Leader"; strength = "Team Influence"; }
    else if (isEmpathetic) { title = "Empathetic Builder"; strength = "People-First Thinking"; }
    else if (isOptimizer && isConscientiousness) { title = "Disciplined Optimizer"; strength = "Process Efficiency"; }
    else if (isCreative && isAbstractor) { title = "Creative Technologist"; strength = "Lateral Thinking"; }
    else if (isLeader && isAnalytical) { title = "Strategic Executor"; strength = "Analytical Leadership"; }
    return { title, strength, riskProfile };
}

export default function PsychGamesWrapper({ resumeData, validationAnswers, onComplete }) {
    const [gameContent, setGameContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [gameStep, setGameStep] = useState("intro");
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [psychProfile, setPsychProfile] = useState({});
    const [archetype, setArchetype] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const buildSummary = () => {
            const parts = [];
            if (resumeData) {
                if (resumeData.name) parts.push(`Professional: ${resumeData.name}`);
                if (resumeData.skills?.length) parts.push(`Skills: ${resumeData.skills.slice(0, 8).join(", ")}`);
                if (resumeData.experience?.length) parts.push(`Experience: ${resumeData.experience.slice(0, 2).map(e => e.title || e.role || "").join(", ")}`);
                if (resumeData.education?.length) parts.push(`Education: ${resumeData.education[0]?.degree || ""} ${resumeData.education[0]?.field || ""}`);
            }
            if (validationAnswers?.length) {
                validationAnswers.filter(a => a.type !== "psych").slice(0, 8).forEach(a => {
                    parts.push(`Q: ${a.question} A: ${a.answer}`);
                });
            }
            return parts.join("\n") || "An experienced professional seeking career growth.";
        };

        const fetchContent = async () => {
            try {
                const summary = buildSummary();
                const content = await generatePsychGameContent({ type: "EXPERIENCED", summary });
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
            const derived = deriveArchetype(updated);
            setArchetype({ ...derived, psychProfile: updated });
            setGameStep("reveal");
        }
    };

    const handleFinalSubmit = async () => {
        if (!archetype) return;
        setIsSubmitting(true);
        try {
            // Save psych stats to DB
            await savePsychStats({
                archetype: archetype.title,
                strength: archetype.strength,
                riskProfile: archetype.riskProfile,
                traitScores: archetype.psychProfile,
            });
        } catch (err) {
            console.error("Failed to save psych stats:", err);
        }
        onComplete(archetype.psychProfile);
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
                    <p className="font-semibold text-lg">Personalizing your games...</p>
                    <p className="text-sm text-muted-foreground">Crafting scenarios based on your professional background</p>
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
                <p className="text-red-400 font-semibold">Failed to personalize games</p>
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
                <div className={`p-6 rounded-2xl border ${game.borderColor} bg-gradient-to-br ${game.gradientFrom} ${game.gradientTo} to-transparent space-y-4 backdrop-blur-sm`}>
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
                {currentGameIndex === 0 && gameContent.decisionScenarios && (
                    <GameDecisionPressure scenarios={gameContent.decisionScenarios} onComplete={handleGameComplete} />
                )}
                {currentGameIndex === 1 && gameContent.patternRounds && (
                    <GamePatternHunter rounds={gameContent.patternRounds} onComplete={handleGameComplete} />
                )}
                {currentGameIndex === 2 && gameContent.personaScenes && (
                    <GameHiddenPersona scenes={gameContent.personaScenes} onComplete={handleGameComplete} />
                )}
            </div>
        );
    }

    if (gameStep === "reveal" && archetype) {
        const { decisionGame, patternGame, personaGame } = archetype.psychProfile;
        const bars = [
            { label: "Analytical Depth", value: decisionGame?.traits?.analytical || 50, color: "bg-orange-400" },
            { label: "Risk Appetite", value: decisionGame?.traits?.riskAppetite || 50, color: "bg-red-400" },
            { label: "Pattern Recognition", value: patternGame?.traits?.abstraction || 50, color: "bg-blue-400" },
            { label: "Bug Detection", value: patternGame?.traits?.anomalyDetection || 50, color: "bg-cyan-400" },
            { label: "Career Prioritization", value: patternGame?.traits?.prioritization || 50, color: "bg-amber-400" },
            { label: "Decision Clarity", value: patternGame?.traits?.decisionClarity || 50, color: "bg-emerald-400" },
            { label: "Empathy & Agreeableness", value: personaGame?.bigFive?.A || 50, color: "bg-purple-400" },
            { label: "Conscientiousness", value: personaGame?.bigFive?.C || 50, color: "bg-green-400" },
        ];
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Archetype Title */}
                <div className="text-center space-y-2">
                    <div className="text-5xl">🧠</div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Your Brain Type</p>
                    <h2 className="text-3xl font-bold gradient-title">{archetype.title}</h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 text-center space-y-1.5">
                        <Zap className="h-5 w-5 text-orange-400 mx-auto" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Strength</p>
                        <p className="text-xs font-semibold leading-tight">{archetype.strength}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 text-center space-y-1.5">
                        <Shield className="h-5 w-5 text-red-400 mx-auto" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</p>
                        <p className="text-xs font-semibold">{archetype.riskProfile}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 text-center space-y-1.5">
                        <Trophy className="h-5 w-5 text-blue-400 mx-auto" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                        <p className="text-xs font-semibold leading-tight">{archetype.title?.split(" ")[0]}</p>
                    </div>
                </div>

                {/* Trait Bars */}
                <div className="space-y-3 p-5 rounded-2xl bg-muted/10 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trait Breakdown</p>
                    {bars.map(bar => (
                        <div key={bar.label} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{bar.label}</span>
                                <span className="font-bold">{bar.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                                <div className={`h-full rounded-full ${bar.color} transition-all duration-1000`} style={{ width: `${bar.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <Button onClick={handleFinalSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Your Career Blueprint...</> : <>Generate My Career Blueprint 🎯</>}
                </Button>
            </div>
        );
    }

    return null;
}
