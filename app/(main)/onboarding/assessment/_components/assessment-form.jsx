"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { assessmentLayers } from "@/data/assessmentDetails";
import { toast } from "sonner";
import { submitAssessment, generateNextQuestion } from "@/actions/assessment";
import { ArrowRight, CheckCircle2, Loader2, Send, Brain, Target, Sparkles } from "lucide-react";
import SectionIndicator from "@/components/assessment/SectionIndicator";
import RoleTargetingSection from "@/components/assessment/RoleTargetingSection";
import PsychGamesWrapper from "./PsychGamesWrapper";

const SECTIONS = [
    { label: "Career Discovery", icon: Sparkles },
    { label: "Role Targeting", icon: Target },
    { label: "Psych Profile", icon: Brain },
];

export default function AssessmentForm() {
    const router = useRouter();
    // 'conversation' | 'role-targeting' | 'psych-games' | 'submitting'
    const [phase, setPhase] = useState("conversation");
    const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
    const [questionCountInLayer, setQuestionCountInLayer] = useState(0);
    const [history, setHistory] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const [showLayerInput, setShowLayerInput] = useState(false);
    const [layerInput, setLayerInput] = useState("");

    // Section 2 data
    const [roleTargetData, setRoleTargetData] = useState(null);
    // Section 3 target
    const [targetRole, setTargetRole] = useState(null);

    const currentLayer = assessmentLayers[currentLayerIndex];
    const totalLayers = assessmentLayers.length;

    useEffect(() => {
        if (assessmentLayers.length > 0 && !currentQuestion) {
            setCurrentQuestion(assessmentLayers[0].initialQuestion);
        }
    }, []);

    // Section index for indicator
    const sectionIndex = phase === "conversation" ? 0
        : phase === "role-targeting" ? 1
            : phase === "psych-games" || phase === "submitting" ? 2
                : 0;

    // Progress within current section
    const totalQuestions = totalLayers * 4;
    const questionsAnswered = (currentLayerIndex * 4) + questionCountInLayer;
    const sectionProgress = phase === "conversation"
        ? (questionsAnswered / totalQuestions) * 100
        : 100;

    const handleAnswerSubmit = async () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer.");
            return;
        }

        setLoading(true);

        const newHistoryItem = {
            layerId: currentLayer.id,
            question: currentQuestion,
            answer: currentAnswer
        };
        const updatedHistory = [...history, newHistoryItem];
        setHistory(updatedHistory);
        setCurrentAnswer("");

        if (questionCountInLayer >= 3) {
            setShowLayerInput(true);
            setLoading(false);
        } else {
            try {
                const layerHistory = updatedHistory.filter(h => h.layerId === currentLayer.id);
                const aiPromise = generateNextQuestion(currentLayer, layerHistory);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 10000)
                );
                let nextQuestion = await Promise.race([aiPromise, timeoutPromise]);
                if (!nextQuestion) nextQuestion = "Could you tell me more about that?";
                setCurrentQuestion(nextQuestion);
                setQuestionCountInLayer(prev => prev + 1);
            } catch (error) {
                console.error("Error fetching question:", error);
                setCurrentQuestion("Can you provide more details on that?");
                setQuestionCountInLayer(prev => prev + 1);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLayerCompletion = async () => {
        if (layerInput.trim()) {
            setHistory(prev => [...prev, {
                layerId: currentLayer.id,
                question: "Additional Context",
                answer: layerInput,
                type: "optional"
            }]);
        }

        if (currentLayerIndex < totalLayers - 1) {
            const nextLayerIndex = currentLayerIndex + 1;
            setCurrentLayerIndex(nextLayerIndex);
            setCurrentQuestion(assessmentLayers[nextLayerIndex].initialQuestion);
            setQuestionCountInLayer(0);
            setShowLayerInput(false);
            setLayerInput("");
        } else {
            // Section 1 done → move to Section 2
            const finalHistory = [...history, ...(layerInput.trim() ? [{
                layerId: currentLayer.id,
                question: "Additional Context",
                answer: layerInput,
                type: "optional"
            }] : [])];
            setHistory(finalHistory);
            setPhase("role-targeting");
        }
    };

    const handleRoleTargetComplete = (data) => {
        setRoleTargetData(data);
        setTargetRole(data?.targetRole || null);
        setPhase("psych-games");
    };

    const handleGamesComplete = async (psychData) => {
        setPhase("submitting");
        await finalSubmit(history, psychData?.psychScores || null);
    };

    const finalSubmit = async (finalData, psychScores = null) => {
        setLoading(true);
        try {
            const dataWithExtras = [...finalData];

            // Add role targeting data
            if (roleTargetData) {
                dataWithExtras.push({
                    layerId: "roleTargeting",
                    question: "Role Targeting Data",
                    answer: JSON.stringify(roleTargetData),
                    type: "roleTarget"
                });
            }

            // Add psych scores summary
            if (psychScores) {
                dataWithExtras.push({
                    layerId: "psychProfile",
                    question: "Psychological Game Results",
                    answer: JSON.stringify(psychScores),
                    type: "psych"
                });
            }

            const result = await submitAssessment(dataWithExtras, targetRole, psychScores);
            if (result) {
                toast.success("Assessment completed!");
                router.replace("/onboarding/career-path");
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit assessment. Please try again.");
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!loading && !showLayerInput) handleAnswerSubmit();
        }
    };

    if (loading && questionCountInLayer === 0 && currentLayerIndex === 0 && !currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Initializing assessment...</p>
            </div>
        );
    }

    // Section 2: Role Targeting
    if (phase === "role-targeting") {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <SectionIndicator sections={SECTIONS} activeIndex={1} />
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl gradient-title flex items-center gap-2">
                            <Target className="h-6 w-6" /> Role Targeting
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">Section 2 of 3</span>
                    </div>
                    <CardDescription className="text-base">
                        Tell us which role or domain you&apos;re targeting. We&apos;ll evaluate your personality fit & learning capability for it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RoleTargetingSection
                        skipLabel="No target role/domain"
                        section1Context={history}
                        onComplete={handleRoleTargetComplete}
                    />
                </CardContent>
            </Card>
        );
    }

    // Section 3: Psych Games
    if (phase === "psych-games") {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <SectionIndicator sections={SECTIONS} activeIndex={2} />
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl gradient-title flex items-center gap-2">
                            <Brain className="h-6 w-6" /> Psychological Profile
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">Section 3 of 3</span>
                    </div>
                    <CardDescription className="text-base">
                        3 quick mini-games to complete your psychological profile.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PsychGamesWrapper targetRole={targetRole} onComplete={handleGamesComplete} />
                </CardContent>
            </Card>
        );
    }

    // Section 1: Career Discovery
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <SectionIndicator sections={SECTIONS} activeIndex={0} />
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl gradient-title">{currentLayer.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Layer {currentLayerIndex + 1} of {totalLayers}
                    </span>
                </div>
                <Progress value={sectionProgress} className="h-2" />
                <CardDescription className="mt-2 text-base">
                    {showLayerInput
                        ? "Great! Before we move on, is there anything else you'd like to add about this topic?"
                        : "Please answer the following question to help us understand you better."}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {!showLayerInput ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 bg-muted/30 border rounded-lg">
                            <h3 className="text-lg font-medium leading-relaxed">{currentQuestion}</h3>
                        </div>

                        <div className="relative">
                            <Textarea
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your answer here..."
                                className="min-h-[120px] pr-12 text-base resize-none"
                                disabled={loading}
                                autoFocus
                            />
                            <Button
                                className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full"
                                onClick={handleAnswerSubmit}
                                disabled={!currentAnswer.trim() || loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                            Question {questionCountInLayer + 1} of 4
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Textarea
                            value={layerInput}
                            onChange={(e) => setLayerInput(e.target.value)}
                            placeholder={`Optional: Add more details about your ${currentLayer.name.toLowerCase()}...`}
                            className="min-h-[120px]"
                        />
                        <Button onClick={handleLayerCompletion} className="w-full" disabled={loading}>
                            {currentLayerIndex < totalLayers - 1 ? (
                                <>Next Topic <ArrowRight className="ml-2 h-4 w-4" /></>
                            ) : (
                                <>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} Next Section</>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full mt-2"
                            onClick={() => setLayerInput("") || handleLayerCompletion()}
                            disabled={loading}
                        >
                            Skip & Continue
                        </Button>
                    </div>
                )}
            </CardContent>

            {!showLayerInput && (
                <CardFooter className="justify-center border-t py-3 bg-muted/10">
                    <p className="text-xs text-center text-muted-foreground">
                        Answering honestly helps AI generate the best career path for you.
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}
