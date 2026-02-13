"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserPath } from "@/actions/user";
import { useRouter } from "next/navigation";

export default function RoleCard({ role, index, analysis }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSelectPath = () => {
        const industry = analysis.recommendedIndustries[0]?.industry || "";
        const skills = analysis.identifiedSkills?.length > 0
            ? analysis.identifiedSkills.join(",")
            : analysis.skillGap.map(s => s.skill).join(",");
        const bio = `I am aspiring to be a ${role.role}. ${analysis.summary}`;

        router.push(`/onboarding?industry=${encodeURIComponent(industry)}&skills=${encodeURIComponent(skills)}&bio=${encodeURIComponent(bio)}`);
    };

    return (
        <Card className={`flex flex-col border-primary shadow-md`}>
            <CardHeader>
                <CardTitle>
                    {index + 1}. {role.role}
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="p-3 bg-muted rounded-md text-sm italic">
                    "{role.matchReason}"
                </div>
                <div className="mt-auto pt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" variant={"default"} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} Select Path
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will take you to your profile setup. You can review and refine your details before saving.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSelectPath} disabled={loading} className="bg-primary hover:bg-primary/90">
                                    Proceed to Profile
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
