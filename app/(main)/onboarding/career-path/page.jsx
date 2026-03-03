
import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, BookOpen, Lightbulb, RefreshCw, ShieldCheck, Brain, Zap, Shield } from "lucide-react";
import Link from "next/link";
import RoleCard from "./_components/role-card";
import CountryRecommendations from "./_components/country-recommendations";
import FeedbackForm from "./_components/feedback-form";
import FeedbackStats from "./_components/feedback-stats";
import { getPsychStats } from "@/actions/psych-stats";

export default async function AssessmentResultPage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    // Fetch the latest assessment
    const assessment = await db.careerAssessment.findUnique({
        where: { userId: user.id },
        include: { feedback: true },
    });

    if (!assessment) {
        redirect("/onboarding/selection");
    }

    const { analysis } = assessment;
    const isExperienced = analysis.userType === "EXPERIENCED";

    // Fetch psychological stats
    const psychStats = await getPsychStats();

    return (
        <main className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="space-y-6 text-center mb-10">
                <h1 className="gradient-title text-4xl md:text-5xl font-bold">
                    Your Career Blueprint
                </h1>
                <p className="text-muted-foreground text-lg mx-auto">
                    {isExperienced
                        ? "Based on your resume and validation, here are your personalized growth opportunities."
                        : "Based on your unique traits, we've designed a personalized career path for you."}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Primary Profile Card */}
                <Card className="col-span-full border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                            <Trophy className="h-6 w-6" />
                            {analysis.primaryProfile}
                        </CardTitle>
                        <CardDescription className="text-lg text-foreground/80">
                            {analysis.summary}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Psychological Stats Card */}
                {psychStats && (
                    <Card className="col-span-full border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Brain className="h-5 w-5 text-purple-500" />
                                Psychological Profile
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Based on your cognitive mini-games assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Archetype & Stats Row */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Brain Type</p>
                                    <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mt-1">{psychStats.archetype}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 text-center">
                                    <Zap className="h-4 w-4 text-orange-400 mx-auto mb-1" />
                                    <p className="text-[10px] text-muted-foreground uppercase">Strength</p>
                                    <p className="text-xs font-semibold mt-0.5">{psychStats.strength}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 text-center">
                                    <Shield className="h-4 w-4 text-red-400 mx-auto mb-1" />
                                    <p className="text-[10px] text-muted-foreground uppercase">Risk Profile</p>
                                    <p className="text-xs font-semibold mt-0.5">{psychStats.riskProfile}</p>
                                </div>
                            </div>

                            {/* Trait Bars */}
                            {psychStats.traitScores && (() => {
                                const traits = psychStats.traitScores;
                                const bars = [
                                    { label: "Analytical Depth", value: traits.decisionGame?.traits?.analytical || 50, color: "bg-orange-400" },
                                    { label: "Risk Appetite", value: traits.decisionGame?.traits?.riskAppetite || 50, color: "bg-red-400" },
                                    { label: "Pattern Recognition", value: traits.patternGame?.traits?.abstraction || 50, color: "bg-blue-400" },
                                    { label: "Bug Detection", value: traits.patternGame?.traits?.anomalyDetection || 50, color: "bg-cyan-400" },
                                    { label: "Empathy", value: traits.personaGame?.bigFive?.A || 50, color: "bg-purple-400" },
                                    { label: "Conscientiousness", value: traits.personaGame?.bigFive?.C || 50, color: "bg-green-400" },
                                ];
                                return (
                                    <div className="space-y-2.5">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trait Breakdown</p>
                                        <div className="grid gap-2.5 md:grid-cols-2">
                                            {bars.map(bar => (
                                                <div key={bar.label} className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">{bar.label}</span>
                                                        <span className="font-bold">{bar.value}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                                                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                )}

                {/* Validation Score (Experienced users only) */}
                {isExperienced && analysis.validationScore && (
                    <Card className="col-span-full border-green-500/20 bg-green-50/30 dark:bg-green-950/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                Resume Validation Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{analysis.validationScore.skillAuthenticity}%</p>
                                    <p className="text-xs text-muted-foreground">Skill Authenticity</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{analysis.validationScore.practicalAbility}%</p>
                                    <p className="text-xs text-muted-foreground">Practical Ability</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{analysis.validationScore.crossSkillReasoning}%</p>
                                    <p className="text-xs text-muted-foreground">Cross-Skill</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{analysis.validationScore.confidenceAlignment}%</p>
                                    <p className="text-xs text-muted-foreground">Confidence</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Top Recommended / Future Growth Roles */}
                <div className="col-span-full space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="h-6 w-6 text-blue-500" />
                        {isExperienced ? "Future Growth Roles" : "Top Recommended Roles"}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {analysis.recommendedRoles.map((role, index) => (
                            <RoleCard
                                key={index}
                                role={role}
                                index={index}
                                analysis={analysis}
                                selectedRole={assessment.primaryRole}
                            />
                        ))}
                    </div>
                </div>

                {/* Country Recommendations */}
                <CountryRecommendations countries={analysis.recommendedCountries} />

                {/* Skills Gap */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-orange-500" />
                            Recommended Skills
                        </CardTitle>
                        <CardDescription>Skills you should consider learning to excel in these roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.skillGap.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md text-sm bg-muted/50">
                                    <span>{item.skill}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.priority === 'High' ? 'bg-red-100 text-red-700' :
                                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {item.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Development */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Growth Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                            {analysis.personalDevelopment.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Stats */}
            <div className="grid gap-6 mb-8">
                <FeedbackStats />
            </div>

            {/* Feedback Form */}
            <div className="grid gap-6 mb-8">
                <FeedbackForm assessmentId={assessment.id} existingFeedback={assessment.feedback} />
            </div>

            <div className="flex justify-between items-center mb-6">
                <Button asChild variant="outline">
                    <Link href={isExperienced ? "/onboarding/resume-upload" : "/onboarding/assessment"}>
                        <RefreshCw className="mr-2 h-4 w-4" /> {isExperienced ? "Re-upload Resume" : "Retake Assessment"}
                    </Link>
                </Button>
            </div>
        </main>
    );
}
