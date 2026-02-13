
import { redirect } from "next/navigation";
import { getUser } from "@/actions/user";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trophy, Target, BookOpen, Lightbulb, RefreshCw } from "lucide-react";
import Link from "next/link";
import RoleCard from "./_components/role-card";

export default async function AssessmentResultPage() {
    const user = await getUser();
    if (!user) redirect("/sign-in");

    // Fetch the latest assessment
    const assessment = await db.careerAssessment.findUnique({
        where: { userId: user.id },
    });

    if (!assessment) {
        redirect("/onboarding/assessment");
    }

    const { analysis } = assessment;

    return (
        <main className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="space-y-6 text-center mb-10">
                <h1 className="gradient-title text-4xl md:text-5xl font-bold">
                    Your Career Blueprint
                </h1>
                <p className="text-muted-foreground text-lg mx-auto">
                    Based on your unique traits, we've designed a personalized career path for you.
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

                {/* Top 3 Recommended Roles */}
                <div className="col-span-full space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="h-6 w-6 text-blue-500" />
                        Top Recommended Roles
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {analysis.recommendedRoles.map((role, index) => (
                            <RoleCard key={index} role={role} index={index} analysis={analysis} />
                        ))}
                    </div>
                </div>

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

            <div className="flex justify-between items-center mb-6">
                <Button asChild variant="outline">
                    <Link href="/onboarding/assessment">
                        <RefreshCw className="mr-2 h-4 w-4" /> Retake Assessment
                    </Link>
                </Button>
            </div>
        </main>
    );
}
