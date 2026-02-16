"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { assessmentLayers } from "@/data/assessmentDetails";
import { toast } from "sonner";
import { submitAssessment, generateNextQuestion } from "@/actions/assessment";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";

export default function AssessmentForm() {
    const router = useRouter();
    const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
    const [questionCountInLayer, setQuestionCountInLayer] = useState(0);
    const [history, setHistory] = useState([]); // Stores all { layerId, question, answer }
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    // For the optional input at end of layer
    const [showLayerInput, setShowLayerInput] = useState(false);
    const [layerInput, setLayerInput] = useState("");

    const currentLayer = assessmentLayers[currentLayerIndex];
    const totalLayers = assessmentLayers.length;

    // Initialize first question
    useEffect(() => {
        if (assessmentLayers.length > 0 && !currentQuestion) {
            setCurrentQuestion(assessmentLayers[0].initialQuestion);
        }
    }, []);

    // Progress: (Layers Completed * 4 + Questions in Current Layer) / (Total Layers * 4)
    // Each layer has 4 questions (1 static + 3 dynamic)
    const totalQuestions = totalLayers * 4;
    const questionsAnswered = (currentLayerIndex * 4) + questionCountInLayer;
    const progress = (questionsAnswered / totalQuestions) * 100;

    const handleAnswerSubmit = async () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer.");
            return;
        }

        setLoading(true);

        // Save current Q&A to history
        const newHistoryItem = {
            layerId: currentLayer.id,
            question: currentQuestion,
            answer: currentAnswer
        };
        const updatedHistory = [...history, newHistoryItem];
        setHistory(updatedHistory);
        setCurrentAnswer(""); // Clear input

        // Check if we reached 4 questions for this layer (0 to 3)
        if (questionCountInLayer >= 3) {
            // Layer complete, show optional input
            setShowLayerInput(true);
            setLoading(false);
        } else {
            // Fetch next dynamic question with timeout/fallback logic
            try {
                const layerHistory = updatedHistory.filter(h => h.layerId === currentLayer.id);

                // Add a simple timeout to prevent indefinite loading
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
                // Fallback to keep the flow moving instead of stalling
                setCurrentQuestion("Can you provide more details on that?");
                setQuestionCountInLayer(prev => prev + 1);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLayerCompletion = async () => {
        // Save optional input if any
        if (layerInput.trim()) {
            setHistory(prev => [...prev, {
                layerId: currentLayer.id,
                question: "Additional Context",
                answer: layerInput,
                type: "optional"
            }]);
        }

        // Move to next layer or submit if last layer
        if (currentLayerIndex < totalLayers - 1) {
            const nextLayerIndex = currentLayerIndex + 1;
            setCurrentLayerIndex(nextLayerIndex);
            setCurrentQuestion(assessmentLayers[nextLayerIndex].initialQuestion);
            setQuestionCountInLayer(0);
            setShowLayerInput(false);
            setLayerInput("");
        } else {
            // Final Submission
            await finalSubmit([...history, ...(layerInput.trim() ? [{
                layerId: currentLayer.id,
                question: "Additional Context",
                answer: layerInput,
                type: "optional"
            }] : [])]);
        }
    };

    const finalSubmit = async (finalData) => {
        setLoading(true);
        try {
            const result = await submitAssessment(finalData);
            if (result) {
                toast.success("Assessment completed!");
                router.push("/onboarding/career-path");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit assessment. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Allow Enter key to submit answer
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new lines
            e.preventDefault();
            if (!loading && !showLayerInput) handleAnswerSubmit();
        }
    }

    if (loading && questionCountInLayer === 0 && currentLayerIndex === 0 && !currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Initializing interview...</p>
            </div>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl gradient-title">{currentLayer.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Layer {currentLayerIndex + 1} of {totalLayers}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
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
                                <>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} Finish Assessment</>
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
