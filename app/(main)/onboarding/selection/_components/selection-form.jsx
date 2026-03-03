"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserType } from "@/actions/user";

export default function SelectionForm() {
    const router = useRouter();
    const [loadingType, setLoadingType] = useState(null);

    const handleSelect = async (type) => {
        if (loadingType) return;
        setLoadingType(type);
        try {
            await updateUserType(type);
            if (type === "EXPERIENCED") {
                router.replace("/onboarding/resume-upload");
            } else {
                router.replace("/onboarding/assessment");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
            setLoadingType(null);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card
                className={`hover:border-primary transition-all cursor-pointer group relative overflow-hidden ${loadingType === "FRESHER" ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => handleSelect("FRESHER")}
            >
                <div className={`absolute inset-0 bg-primary/5 transition-opacity ${loadingType === "FRESHER" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                {loadingType === "FRESHER" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Student / Explorer</h3>
                        <p className="text-muted-foreground">
                            I am a student or looking to start my career. I need help identifying the right path for me.
                        </p>
                    </div>
                    <Button
                        disabled={!!loadingType}
                        variant={loadingType === "FRESHER" ? "default" : "outline"}
                        className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                        {loadingType === "FRESHER" ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            "Start Assessment"
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Card
                className={`hover:border-primary transition-all cursor-pointer group relative overflow-hidden ${loadingType === "EXPERIENCED" ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => handleSelect("EXPERIENCED")}
            >
                <div className={`absolute inset-0 bg-primary/5 transition-opacity ${loadingType === "EXPERIENCED" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                {loadingType === "EXPERIENCED" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Dedicated to a Specific Field</h3>
                        <p className="text-muted-foreground">
                            I have expertise in some specific domain and want to advance my career, gain skills, or get salary insights.
                        </p>
                    </div>
                    <Button
                        disabled={!!loadingType}
                        variant={loadingType === "EXPERIENCED" ? "default" : "outline"}
                        className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                        {loadingType === "EXPERIENCED" ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            "Upload Resume"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
