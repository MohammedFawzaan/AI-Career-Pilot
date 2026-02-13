"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { updateUserType } from "@/actions/user";

const userTypeSchema = z.object({
    type: z.enum(["EXPERIENCED", "FRESHER"]),
});

export default function SelectionForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSelect = async (type) => {
        setLoading(true);
        try {
            await updateUserType(type);
            if (type === "EXPERIENCED") {
                router.push("/onboarding");
            } else {
                router.push("/onboarding/assessment");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card
                className="hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => handleSelect("FRESHER")}
            >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <Button disabled={loading} variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                        Start Assessment
                    </Button>
                </CardContent>
            </Card>

            <Card
                className="hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => handleSelect("EXPERIENCED")}
            >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Dedicated to a specific field</h3>
                        <p className="text-muted-foreground">
                            I have expertise in some specific domain and want to advance my career, gain skills, or get salary insights.
                        </p>
                    </div>
                    <Button disabled={loading} variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                        Select Path
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
