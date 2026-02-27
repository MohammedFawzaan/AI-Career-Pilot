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
import { toast } from "sonner";
import { resumeValidationLayers } from "@/data/resumeValidationLayers";
import { generateValidationQuestions, submitResumeValidation } from "@/actions/resume-validation";
import { Loader2, Send, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ValidationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(true); // Start loading (fetch questions)
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState(null); // AI-generated questions by layer
    const [resumeData, setResumeData] = useState(null);

    // Current position tracking
    const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [answers, setAnswers] = useState([]); // Array of { layerId, question, answer }

    // Layer completion optional input
    const [showLayerInput, setShowLayerInput] = useState(false);
    const [layerInput, setLayerInput] = useState("");

    // Load resume data from sessionStorage and generate questions
    useEffect(() => {
        const loadAndGenerate = async () => {
            try {
                const stored = sessionStorage.getItem("extractedResume");
                if (!stored) {
                    toast.error("No resume data found. Please upload your resume first.");
                    router.push("/onboarding/resume-upload");
                    return;
                }

                const parsed = JSON.parse(stored);
                setResumeData(parsed);

                // Generate validation questions from resume
                const result = await generateValidationQuestions(parsed);
                setQuestions(result.layers);
                setLoading(false);
            } catch (error) {
                console.error("Error loading validation:", error);
                toast.error("Failed to generate validation questions. Please try again.");
                router.push("/onboarding/resume-upload");
            }
        };

        loadAndGenerate();
    }, [router]);

    if (loading || !questions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                    Generating personalized validation questions from your resume...
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                    This may take a few seconds
                </p>
            </div>
        );
    }

    const currentLayer = questions[currentLayerIndex];
    const layerMeta = resumeValidationLayers[currentLayerIndex];
    const totalLayers = questions.length;
    const currentLayerQuestions = currentLayer.questions;
    const currentQuestion = currentLayerQuestions[currentQuestionIndex];

    // Progress calculation
    const totalQuestions = questions.reduce((sum, l) => sum + l.questions.length, 0);
    const questionsAnswered = questions
        .slice(0, currentLayerIndex)
        .reduce((sum, l) => sum + l.questions.length, 0) + currentQuestionIndex;
    const progress = (questionsAnswered / totalQuestions) * 100;

    const handleAnswerSubmit = () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer.");
            return;
        }

        const newAnswer = {
            layerId: currentLayer.id,
            layerName: currentLayer.name,
            question: currentQuestion,
            answer: currentAnswer,
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);
        setCurrentAnswer("");

        // Check if this was the last question in the current layer
        if (currentQuestionIndex >= currentLayerQuestions.length - 1) {
            // Layer complete
            setShowLayerInput(true);
        } else {
            // Next question in same layer
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleLayerCompletion = async () => {
        // Save optional input
        let finalAnswers = [...answers];
        if (layerInput.trim()) {
            finalAnswers = [...finalAnswers, {
                layerId: currentLayer.id,
                layerName: currentLayer.name,
                question: "Additional Context",
                answer: layerInput,
                type: "optional",
            }];
            setAnswers(finalAnswers);
        }

        // Move to next layer or submit
        if (currentLayerIndex < totalLayers - 1) {
            setCurrentLayerIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
            setShowLayerInput(false);
            setLayerInput("");
        } else {
            // Final submission
            await finalSubmit(finalAnswers);
        }
    };

    const finalSubmit = async (finalData) => {
        setSubmitting(true);
        try {
            const result = await submitResumeValidation(resumeData, finalData);
            if (result) {
                // Clean up sessionStorage
                sessionStorage.removeItem("extractedResume");
                toast.success("Validation completed! Generating your career blueprint...");
                router.push("/onboarding/career-path");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit validation. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!submitting && !showLayerInput) handleAnswerSubmit();
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl gradient-title">
                        {currentLayer.name}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Layer {currentLayerIndex + 1} of {totalLayers}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
                <CardDescription className="mt-2 text-base">
                    {showLayerInput
                        ? "Great! Before we move on, is there anything else you'd like to add?"
                        : layerMeta?.description || "Please answer the following question."}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {!showLayerInput ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 bg-muted/30 border rounded-lg">
                            <h3 className="text-lg font-medium leading-relaxed">
                                {currentQuestion}
                            </h3>
                        </div>

                        <div className="relative">
                            <Textarea
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your answer here..."
                                className="min-h-[120px] pr-12 text-base resize-none"
                                disabled={submitting}
                                autoFocus
                            />
                            <Button
                                className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full"
                                onClick={handleAnswerSubmit}
                                disabled={!currentAnswer.trim() || submitting}
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                            Question {currentQuestionIndex + 1} of {currentLayerQuestions.length}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Textarea
                            value={layerInput}
                            onChange={(e) => setLayerInput(e.target.value)}
                            placeholder={`Optional: Add more details about ${currentLayer.name.toLowerCase()}...`}
                            className="min-h-[120px]"
                        />
                        <Button
                            onClick={handleLayerCompletion}
                            className="w-full"
                            disabled={submitting}
                        >
                            {currentLayerIndex < totalLayers - 1 ? (
                                <>Next Layer <ArrowRight className="ml-2 h-4 w-4" /></>
                            ) : (
                                <>
                                    {submitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    )}
                                    Finish Validation
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full mt-2"
                            onClick={() => { setLayerInput(""); handleLayerCompletion(); }}
                            disabled={submitting}
                        >
                            Skip & Continue
                        </Button>
                    </div>
                )}
            </CardContent>

            {!showLayerInput && (
                <CardFooter className="justify-center border-t py-3 bg-muted/10">
                    <p className="text-xs text-center text-muted-foreground">
                        This validation helps verify your skills and map you to the best career growth opportunities.
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}
