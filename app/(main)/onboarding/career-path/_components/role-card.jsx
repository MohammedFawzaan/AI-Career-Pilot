"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { updatePrimaryRole } from "@/actions/user";
import { useRouter } from "next/navigation";

export default function RoleCard({ role, index, analysis, selectedRole }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isCurrentPath = selectedRole === role.role;

    const handleSelectPath = async () => {
        setLoading(true);
        try {
            // Update the primaryRole in the database
            await updatePrimaryRole(role.role);

            const industry = analysis.recommendedIndustries[0]?.industry || "";
            const skills = analysis.identifiedSkills?.length > 0
                ? analysis.identifiedSkills.join(",")
                : analysis.skillGap.map(s => s.skill).join(",");
            const bio = `I am aspiring to be a ${role.role}. ${analysis.summary}`;

            router.push(`/onboarding?industry=${encodeURIComponent(industry)}&skills=${encodeURIComponent(skills)}&bio=${encodeURIComponent(bio)}&selectedRole=${encodeURIComponent(role.role)}`);
        } catch (error) {
            toast.error("Failed to select role. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`flex flex-col ${isCurrentPath ? 'border-green-500 border-2 bg-green-50/50' : 'border-primary shadow-md'}`}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{index + 1}. {role.role}</span>
                    {isCurrentPath && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                            Current Path
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="p-3 bg-muted rounded-md text-sm italic">
                    "{role.matchReason}"
                </div>
                <div className="mt-auto pt-4">
                    {isCurrentPath ? (
                        <Button className="w-full" variant="secondary" disabled>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Selected
                        </Button>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" variant="default" disabled={loading}>
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
