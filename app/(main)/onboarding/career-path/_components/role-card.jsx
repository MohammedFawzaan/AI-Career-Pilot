"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
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
import { industries } from "@/data/industries";

export default function RoleCard({ role, index, analysis, selectedRole, userIndustry }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isCurrentPath = selectedRole === role.role;

    const handleSelectPath = async () => {
        setLoading(true);
        const toastId = toast.loading("Preparing your flight...", {
            description: `Setting course for ${role.role}...`,
        });

        try {
            await updatePrimaryRole(role.role);

            const skillsStr = analysis.identifiedSkills?.length > 0
                ? analysis.identifiedSkills.map(s => typeof s === "string" ? s : s.skill).join(",")
                : analysis.skillGap?.map(s => s.skill).join(",") || "";

            const isExperienced = analysis.userType === "EXPERIENCED";
            const bio = isExperienced
                ? `I am an experienced professional looking to grow into ${role.role}. ${analysis.summary}`
                : `I am aspiring to be a ${role.role}. ${analysis.summary}`;

            // Parse userIndustry slug back to sub-industry name for preselection
            let subIndustryName = "";
            if (userIndustry) {
                const [industryId, ...subParts] = userIndustry.split("-");
                const targetSubSlug = subParts.join("-");

                const indObj = industries.find(i => i.id === industryId);
                subIndustryName = indObj?.subIndustries.find(
                    s => s.toLowerCase().replace(/ /g, "-") === targetSubSlug
                ) || "";
            }

            toast.success("Flight path confirmed! Redirecting...", { id: toastId });

            router.replace(`/onboarding?industry=${encodeURIComponent(subIndustryName)}&skills=${encodeURIComponent(skillsStr)}&bio=${encodeURIComponent(bio)}&selectedRole=${encodeURIComponent(role.role)}`);
        } catch (error) {
            console.error(error);
            toast.error("Navigation failed. Please check your connection.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const matchScore = role.matchScore;
    const matchColor =
        matchScore >= 80 ? "text-green-400 bg-green-500/10 border-green-500/20"
            : matchScore >= 60 ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                : "text-muted-foreground bg-muted border-border";

    return (
        <div className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden
            ${isCurrentPath
                ? "border-green-500/50 bg-green-500/5 shadow-md shadow-green-500/5"
                : "border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            }`}
        >
            {/* Top accent line */}
            <div className={`h-0.5 w-full ${isCurrentPath ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"}`} />

            <div className="flex flex-col flex-1 p-5 space-y-4">
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground font-medium">
                            {index !== undefined ? `#${index + 1} Recommendation` : "Target Role"}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {matchScore && (
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${matchColor}`}>
                                    {matchScore}% Match
                                </span>
                            )}
                            {isCurrentPath && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                                    ✓ Selected
                                </span>
                            )}
                        </div>
                    </div>
                    <h3 className="font-bold text-base leading-snug">{role.role}</h3>
                    {role.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
                    )}
                </div>

                {/* Match Reason */}
                {role.matchReason && (
                    <div className="flex-1 rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
                        <p className="text-xs text-foreground/70 leading-relaxed italic">&ldquo;{role.matchReason}&rdquo;</p>
                    </div>
                )}

                {/* Action */}
                <div className="mt-auto pt-1">
                    {isCurrentPath ? (
                        <Button className="w-full rounded-xl" variant="secondary" disabled>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Currently Selected
                        </Button>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="w-full rounded-xl group-hover:bg-primary/90 transition-colors"
                                    variant="default"
                                    disabled={loading}
                                >
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                                        : <><ArrowRight className="mr-2 h-4 w-4" /> Select This Path</>
                                    }
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Select &ldquo;{role.role}&rdquo;?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will take you to your profile setup pre-filled with this role. You can review and refine your details before saving.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleSelectPath}
                                        disabled={loading}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        Proceed to Profile
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </div>
    );
}
