import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
    Trophy, Target, BookOpen, Lightbulb, RefreshCw, ShieldCheck,
    Brain, CheckCircle2, Award, Rocket, FileText, Globe,
    TrendingUp, TrendingDown, Minus, ArrowRight, Star, Zap
} from "lucide-react";
import Link from "next/link";
import RoleCard from "./_components/role-card";
import FeedbackForm from "./_components/feedback-form";
import FeedbackStats from "./_components/feedback-stats";
import Footer from "@/components/footer";

export default async function AssessmentResultPage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    // Unified Onboarding Guard System
    if (!user.userType) {
        redirect("/onboarding/selection");
    }

    // If assessment isn't done, force them back
    const assessment = await db.careerAssessment.findUnique({ where: { userId: user.id }, include: { feedback: true } });
    if (!assessment) {
        if (user.userType === "EXPERIENCED") {
            redirect("/onboarding/resume-upload");
        } else {
            redirect("/onboarding/assessment");
        }
    }

    const { analysis } = assessment;
    const isExperienced = analysis.userType === "EXPERIENCED";
    const psychProfile = analysis.psychologicalProfile || null;

    const overallPsychScore = psychProfile?.cognitive
        ? Math.round((psychProfile.cognitive.overall + psychProfile.focusPrecision.overall + psychProfile.curiosityLearning.overall) / 3)
        : null;

    const getFeasibilityColor = (f = "") => {
        if (f.includes("High")) return { bg: "from-green-500/10 to-emerald-500/5", border: "border-green-500/30", text: "text-green-400", badge: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" };
        if (f.includes("Moderate")) return { bg: "from-yellow-500/10 to-amber-500/5", border: "border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", dot: "bg-yellow-500" };
        return { bg: "from-red-500/10 to-rose-500/5", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/10 text-red-500 border-red-500/20", dot: "bg-red-500" };
    };

    const getDemandStyle = (d) => {
        if (d === "High") return { icon: TrendingUp, cls: "text-green-400 bg-green-500/10 border-green-500/20" };
        if (d === "Low") return { icon: TrendingDown, cls: "text-red-400 bg-red-500/10 border-red-500/20" };
        return { icon: Minus, cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    };

    const targetFeasibility = analysis.targetRoleCareerPath?.feasibility
        ? getFeasibilityColor(analysis.targetRoleCareerPath.feasibility)
        : null;

    return (
        <>
            <div className="container mx-auto px-4 pt-10 pb-4 max-w-6xl space-y-12">
                {/* Header */}
                <div className="space-y-3 text-center">
                    <h1 className="gradient-title text-4xl md:text-5xl font-bold">
                        Your Career Blueprint
                    </h1>
                    <p className="text-muted-foreground text-lg mx-auto">
                        {isExperienced
                            ? "Based on your resume and validation, here are your personalized growth opportunities."
                            : "Based on your unique traits, we've designed a personalized career path for you."}
                    </p>
                </div>

                {/* Primary Profile Card */}
                <div className="flex items-stretch gap-0 rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
                    <div className="w-1.5 shrink-0 bg-gradient-to-b from-primary via-primary/60 to-transparent" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 flex-1 min-w-0">
                        <div className="min-w-0 flex-1">
                            <p className="text-base sm:text-xl font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                                <Trophy className="h-4 w-4 text-primary shrink-0" />
                                {analysis.primaryProfile}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{analysis.summary}</p>
                        </div>
                    </div>
                </div>

                {/* ── VALIDATION SCORE (Experienced only) ── */}
                {isExperienced && analysis.validationScore && (
                    <section>
                        <SectionLabel icon={ShieldCheck} color="text-green-500" label="Resume Validation" />
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Skill Authenticity", val: analysis.validationScore.skillAuthenticity },
                                { label: "Practical Ability", val: analysis.validationScore.practicalAbility },
                                { label: "Cross-Skill Reasoning", val: analysis.validationScore.crossSkillReasoning },
                                { label: "Confidence Alignment", val: analysis.validationScore.confidenceAlignment },
                            ].map(({ label, val }) => (
                                <div key={label} className="relative overflow-hidden rounded-2xl border border-green-500/15 bg-gradient-to-br from-green-500/5 to-transparent p-5 text-center">
                                    <div className="text-3xl font-black text-green-400">{val}</div>
                                    <div className="text-[11px] text-muted-foreground mt-1 font-medium">{label}</div>
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-green-500/10">
                                        <div className="h-full bg-green-500/60 rounded-r-full" style={{ width: `${val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── PSYCHOLOGICAL PROFILE ── */}
                {psychProfile && psychProfile.cognitive && (
                    <section>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <SectionLabel icon={Brain} color="text-purple-500" label="Psychological Profile" />
                            {overallPsychScore !== null && (
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                    <span className="text-xs text-muted-foreground font-medium">Overall Score</span>
                                    <span className="font-black text-purple-400 text-lg">{overallPsychScore}</span>
                                    <span className="text-xs text-muted-foreground">/ 100</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5 overflow-hidden">
                            {/* Summary */}
                            {psychProfile.summary && (
                                <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
                                    <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{psychProfile.summary}&rdquo;</p>
                                </div>
                            )}

                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Cognitive */}
                                <PsychPanel
                                    label="Cognitive Intelligence"
                                    icon={<Brain className="h-4 w-4" />}
                                    overall={psychProfile.cognitive.overall}
                                    color={{ bar: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/15", bg: "bg-indigo-500/5", track: "bg-indigo-500/10" }}
                                    items={[
                                        { label: "Analytical Thinking", val: psychProfile.cognitive.analyticalThinking },
                                        { label: "Logical Reasoning", val: psychProfile.cognitive.logicalReasoning },
                                        { label: "Problem Solving", val: psychProfile.cognitive.problemSolving },
                                        { label: "Decision Making", val: psychProfile.cognitive.decisionMaking },
                                    ]}
                                />
                                {/* Focus */}
                                <PsychPanel
                                    label="Focus & Precision"
                                    icon={<Target className="h-4 w-4" />}
                                    overall={psychProfile.focusPrecision.overall}
                                    color={{ bar: "bg-teal-500", text: "text-teal-400", border: "border-teal-500/15", bg: "bg-teal-500/5", track: "bg-teal-500/10" }}
                                    items={[
                                        { label: "Accuracy", val: psychProfile.focusPrecision.accuracy },
                                        { label: "Persistence", val: psychProfile.focusPrecision.persistence },
                                    ]}
                                />
                                {/* Curiosity */}
                                <PsychPanel
                                    label="Curiosity & Learning"
                                    icon={<Lightbulb className="h-4 w-4" />}
                                    overall={psychProfile.curiosityLearning.overall}
                                    color={{ bar: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/15", bg: "bg-amber-500/5", track: "bg-amber-500/10" }}
                                    items={[
                                        { label: "Curiosity", val: psychProfile.curiosityLearning.curiosity },
                                        { label: "Adaptability", val: psychProfile.curiosityLearning.adaptability },
                                        { label: "Learning Initiative", val: psychProfile.curiosityLearning.learningInitiative },
                                    ]}
                                />
                            </div>

                            {/* Dominant Traits */}
                            {psychProfile.dominantTraits?.length > 0 && (
                                <div className="px-6 pb-6 flex flex-wrap gap-2 items-center">
                                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mr-2">Dominant Traits:</span>
                                    {psychProfile.dominantTraits.map((trait, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
                                            <Star className="h-3 w-3" />
                                            {typeof trait === "string" ? trait : trait.trait}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── TARGET ROLE ── */}
                {analysis.targetRoleCareerPath && targetFeasibility && (
                    <section>
                        <SectionLabel icon={Rocket} color="text-purple-500" label="Your Target Role" />

                        <div className={`mt-4 rounded-2xl border ${targetFeasibility.border} bg-gradient-to-br ${targetFeasibility.bg} overflow-hidden`}>
                            <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/50">
                                {/* Left: RoleCard column */}
                                <div className="md:col-span-2 p-5 bg-muted/10">
                                    {/* Feasibility Badge */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4 ${targetFeasibility.badge}`}>
                                        <span className="relative flex h-2 w-2">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${targetFeasibility.dot}`} />
                                            <span className={`relative inline-flex h-2 w-2 rounded-full ${targetFeasibility.dot}`} />
                                        </span>
                                        {analysis.targetRoleCareerPath.feasibility}
                                    </div>
                                    <RoleCard
                                        role={analysis.targetRoleCareerPath}
                                        analysis={analysis}
                                        selectedRole={assessment.primaryRole}
                                        userIndustry={user.industry}
                                    />
                                </div>

                                {/* Right: Details */}
                                <div className="md:col-span-3 p-6 space-y-7">
                                    {/* Feasibility Reason */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Brain className="h-4 w-4" /> AI Feasibility Analysis
                                        </h3>
                                        <p className="text-sm text-foreground/80 leading-relaxed">{analysis.targetRoleCareerPath.feasibilityReason}</p>
                                    </div>

                                    {/* Career Ladder */}
                                    {analysis.targetRoleCareerPath.careerLadder?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Award className="h-4 w-4" /> Career Progression
                                            </h3>
                                            <div className="space-y-2">
                                                {analysis.targetRoleCareerPath.careerLadder.map((step, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 group">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${targetFeasibility.border} ${targetFeasibility.text} bg-background`}>
                                                            {step.level}
                                                        </div>
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                                        <div className="flex-1 flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl border border-border/50 bg-card/60 group-hover:border-primary/30 transition-colors">
                                                            <span className="font-medium text-sm">{step.title}</span>
                                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{step.timeframe}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key Milestones */}
                                    {analysis.targetRoleCareerPath.keyMilestones?.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Target className="h-4 w-4" /> Key Milestones
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysis.targetRoleCareerPath.keyMilestones.map((m, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                                                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                                        {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── RECOMMENDED ROLES ── */}
                <section>
                    <SectionLabel icon={Target} color="text-blue-500" label={isExperienced ? "Future Growth Roles" : "Top Recommended Roles"} />
                    <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {analysis.recommendedRoles?.map((role, index) => (
                            <RoleCard
                                key={index}
                                role={role}
                                index={index}
                                analysis={analysis}
                                selectedRole={assessment.primaryRole}
                                userIndustry={user.industry}
                            />
                        ))}
                    </div>
                </section>

                {/* ── SKILLS ANALYSIS ── */}
                <section>
                    <SectionLabel icon={FileText} color="text-indigo-500" label="Skills Analysis" />
                    <div className="mt-4 grid md:grid-cols-2 gap-5">
                        {/* Skills You Have */}
                        <div className="rounded-2xl border border-green-500/15 bg-gradient-to-br from-green-500/5 to-transparent overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-muted/20">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="font-semibold text-sm">Skills You Have</p>
                                    <p className="text-xs text-muted-foreground">Verified strengths &amp; competencies</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                {!analysis.identifiedSkills || analysis.identifiedSkills.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4 bg-card/60 rounded-xl border border-border/50">No specific skills identified.</p>
                                ) : (
                                    analysis.identifiedSkills.map((skill, i) => {
                                        const name = typeof skill === "string" ? skill : skill.skill;
                                        const prof = typeof skill === "string" ? "Demonstrated" : skill.proficiency;
                                        const profColor = prof === "Strong"
                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                            : prof === "Moderate"
                                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20";
                                        return (
                                            <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card/60 hover:bg-muted/40 transition-colors">
                                                <span className="text-sm font-medium">{name}</span>
                                                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${profColor}`}>{prof}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Skills to Learn */}
                        <div className="rounded-2xl border border-orange-500/15 bg-gradient-to-br from-orange-500/5 to-transparent overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50 bg-orange-50/20 dark:bg-orange-950/10">
                                <BookOpen className="h-5 w-5 text-orange-400" />
                                <div>
                                    <p className="font-semibold text-sm">Skills to Learn</p>
                                    <p className="text-xs text-muted-foreground">Focus areas to reach your goals</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                {(!analysis.recommendedSkills || analysis.recommendedSkills.length === 0) && (!analysis.skillGap || analysis.skillGap.length === 0) ? (
                                    <p className="text-sm text-muted-foreground text-center py-4 bg-card/60 rounded-xl border border-border/50">No new skills recommended at this time.</p>
                                ) : (
                                    (analysis.recommendedSkills?.length > 0 ? analysis.recommendedSkills : analysis.skillGap)?.map((item, i) => {
                                        const name = typeof item === "string" ? item : item.skill;
                                        const priority = item.priority || "Medium";
                                        const reason = item.reason || null;
                                        const priColor = priority === "High"
                                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                            : priority === "Medium"
                                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
                                        return (
                                            <div key={i} className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border border-border/50 bg-card/60 hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm font-medium">{name}</span>
                                                    <span className={`text-[10px] uppercase tracking-wide px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${priColor}`}>{priority}</span>
                                                </div>
                                                {reason && <p className="text-xs text-muted-foreground line-clamp-2">{reason}</p>}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── COUNTRIES ── */}
                {analysis.recommendedCountries?.length > 0 && (
                    <section>
                        <SectionLabel icon={Globe} color="text-sky-500" label="Top Countries for Your Career" />
                        <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {analysis.recommendedCountries.map((c, i) => {
                                const d = getDemandStyle(c.demandLevel);
                                const DemandIcon = d.icon;
                                return (
                                    <div key={i} className="group rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{c.country}</span>
                                            </div>
                                            <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${d.cls}`}>
                                                <DemandIcon className="h-3 w-3" />
                                                {c.demandLevel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{c.reason}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── GROWTH TIPS ── */}
                {analysis.personalDevelopment?.length > 0 && (
                    <section>
                        <SectionLabel icon={Lightbulb} color="text-yellow-500" label="Growth Tips" />
                        <div className="mt-4 grid sm:grid-cols-2 gap-3">
                            {analysis.personalDevelopment.map((tip, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Zap className="h-3 w-3 text-yellow-500" />
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── STRENGTHS & CONCERNS (Experienced) ── */}
                {isExperienced && (analysis.currentStrengths?.length > 0 || analysis.areasOfConcern?.length > 0) && (
                    <section>
                        <SectionLabel icon={ShieldCheck} color="text-green-500" label="Strengths &amp; Areas to Watch" />
                        <div className="mt-4 grid md:grid-cols-2 gap-5">
                            {analysis.currentStrengths?.length > 0 && (
                                <div className="rounded-2xl border border-green-500/15 bg-green-500/5 p-5 space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-400">✓ Confirmed Strengths</p>
                                    {analysis.currentStrengths.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {analysis.areasOfConcern?.length > 0 && (
                                <div className="rounded-2xl border border-orange-500/15 bg-orange-500/5 p-5 space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">⚠ Areas of Concern</p>
                                    {analysis.areasOfConcern.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <ArrowRight className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── FEEDBACK ── */}
                <section className="space-y-6">
                    <FeedbackStats />
                    <FeedbackForm assessmentId={assessment.id} existingFeedback={assessment.feedback} />
                </section>

                {/* ── FOOTER ACTIONS ── */}
                <div className="flex justify-between items-center">
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href={isExperienced ? "/onboarding/resume-upload" : "/onboarding/assessment"}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {isExperienced ? "Re-upload Resume" : "Retake Assessment"}
                        </Link>
                    </Button>
                </div>
            </div>
            <Footer />
        </>
    );
}

/** Reusable section label */
function SectionLabel({ icon: Icon, color, label }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg bg-muted/60 border border-border/50 ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{label}</h2>
        </div>
    );
}

/** Reusable psychological panel */
function PsychPanel({ label, icon, overall, color, items }) {
    return (
        <div className={`rounded-xl border ${color.border} ${color.bg} p-5 space-y-4`}>
            <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold flex items-center gap-1.5 ${color.text}`}>
                    {icon} {label}
                </p>
                <div className={`text-2xl font-black ${color.text}`}>{overall}</div>
            </div>
            {/* Overall bar */}
            <div className={`h-1 rounded-full ${color.track} overflow-hidden`}>
                <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${overall}%` }} />
            </div>
            <div className="space-y-2.5 pt-1">
                {items.map(it => (
                    <div key={it.label} className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{it.label}</span>
                            <span className={`font-semibold ${color.text}`}>{it.val}</span>
                        </div>
                        <div className={`h-1 rounded-full ${color.track} overflow-hidden`}>
                            <div className={`h-full rounded-full ${color.bar} opacity-60`} style={{ width: `${it.val}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
