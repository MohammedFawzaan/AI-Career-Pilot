import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import { getRoadmap } from "@/actions/roadmap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MapIcon, Target, CheckCircle2, Circle, Info, Sparkles } from "lucide-react";
import DurationSelector from "./_components/duration-selector";
import RoadmapDisplay from "./_components/roadmap-display";

export default async function RoadmapPage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    if (!user.userType) {
        redirect("/onboarding/selection");
    }

    const roadmap = await getRoadmap();

    // Get assessment data for showing roadmap basis
    const assessment = user.careerAssessment;
    const hasAssessment = assessment && assessment.analysis;

    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6 text-center mb-10">
                <h1 className="gradient-title text-4xl md:text-5xl font-bold">
                    Your Career Roadmap
                </h1>
                <p className="text-muted-foreground text-lg mx-auto max-w-2xl">
                    AI-generated personalized roadmap to achieve your career goals
                    according to your profile.
                </p>
            </div>

            {/* Roadmap Generation Basis */}
            {hasAssessment && (
                <Card className="mb-6 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5 text-blue-500" />
                            Roadmap Based On Your Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assessment.primaryRole && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1.5">Target Role</p>
                                <Badge variant="secondary" className="text-sm font-medium">
                                    {assessment.primaryRole}
                                </Badge>
                            </div>
                        )}
                        {assessment.analysis?.identifiedSkills?.length > 0 && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1.5">Current Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {assessment.analysis.identifiedSkills.slice(0, 6).map((skill, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {assessment.analysis.identifiedSkills.length > 6 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{assessment.analysis.identifiedSkills.length - 6}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                        {assessment.analysis?.recommendedSkills?.length > 0 && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1.5">Skills to Learn</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {assessment.analysis.recommendedSkills.slice(0, 6).map((skill, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {assessment.analysis.recommendedSkills.length > 6 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{assessment.analysis.recommendedSkills.length - 6}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {!roadmap ? (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapIcon className="h-6 w-6 text-blue-500" />
                            Generate Your Roadmap
                        </CardTitle>
                        <CardDescription>
                            Select a duration to create a personalized career roadmap tailored to your goals
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DurationSelector />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-green-500" />
                                        {roadmap.duration}-Month Career Plan
                                    </CardTitle>
                                    <CardDescription>
                                        Track your progress and stay on course
                                    </CardDescription>
                                </div>
                                <DurationSelector currentDuration={roadmap.duration} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <RoadmapDisplay roadmap={roadmap} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}
