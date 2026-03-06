"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { generateRoleFitQuestions } from "@/actions/role-targeting";
import { Target, ChevronRight, Loader2, Send, CheckCircle2, SkipForward } from "lucide-react";
import { toast } from "sonner";

/**
 * Section 2: Role Targeting — evaluates LEARNING CAPABILITY for target role.
 * Uses Section 1 context to personalize questions about learning ability.
 * 
 * @param {{ skipLabel: string, section1Context: Array, onComplete: (data: object|null) => void }} props
 */
export default function RoleTargetingSection({ skipLabel, section1Context = [], onComplete }) {
    const [step, setStep] = useState("ask"); // 'ask' | 'loading' | 'questions'
    const [targetRole, setTargetRole] = useState("");
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleRoleSubmit = async () => {
        if (!targetRole.trim()) {
            toast.error("Please enter a target role or domain.");
            return;
        }

        setStep("loading");
        setLoading(true);
        try {
            const result = await generateRoleFitQuestions(targetRole.trim(), section1Context);
            setQuestions(result.questions);
            setStep("questions");
        } catch (error) {
            console.error("Error generating role-fit questions:", error);
            toast.error("Failed to generate questions. Please try again.");
            setStep("ask");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer.");
            return;
        }

        const newAnswer = {
            question: questions[currentQIndex],
            answer: currentAnswer.trim(),
        };
        const updated = [...answers, newAnswer];
        setAnswers(updated);
        setCurrentAnswer("");

        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            // All 7 questions answered
            onComplete({ targetRole: targetRole.trim(), answers: updated });
        }
    };

    const handleSkip = () => {
        onComplete(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (step === "ask" && targetRole.trim()) handleRoleSubmit();
            else if (step === "questions" && currentAnswer.trim()) handleAnswerSubmit();
        }
    };

    // Step 1: Ask for target role
    if (step === "ask") {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">What role or domain are you targeting?</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Tell us the career role or domain you&apos;re interested in. We&apos;ll evaluate whether you have the learning capability to transition into it.
                    </p>
                </div>

                <div className="space-y-3">
                    <Input
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Product Manager, Data Scientist, UX Designer..."
                        className="text-base h-12"
                        autoFocus
                    />
                    <Button onClick={handleRoleSubmit} className="w-full" size="lg" disabled={!targetRole.trim()}>
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={handleSkip} variant="ghost" className="w-full text-muted-foreground" size="sm">
                        <SkipForward className="mr-2 h-3.5 w-3.5" />{skipLabel}
                    </Button>
                </div>
            </div>
        );
    }

    // Loading state
    if (step === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                    <Target className="h-12 w-12 text-primary animate-pulse" />
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground absolute -bottom-1 -right-1" />
                </div>
                <div className="text-center space-y-1">
                    <p className="font-semibold">Evaluating your learning potential...</p>
                    <p className="text-sm text-muted-foreground">Preparing questions for &quot;{targetRole}&quot;</p>
                </div>
            </div>
        );
    }

    // Step 2: Show questions one by one
    if (step === "questions") {
        const progress = ((currentQIndex + 1) / questions.length) * 100;
        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        Learning Readiness: {targetRole}
                    </span>
                    <span>Question {currentQIndex + 1} of {questions.length}</span>
                </div>

                <Progress value={progress} className="h-1.5" />

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                    <h3 className="text-base font-medium leading-relaxed">{questions[currentQIndex]}</h3>
                </div>

                <div className="relative">
                    <Textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer here..."
                        className="min-h-[100px] pr-12 text-base resize-none"
                        autoFocus
                    />
                    <Button
                        className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full"
                        onClick={handleAnswerSubmit}
                        disabled={!currentAnswer.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
