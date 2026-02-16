import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Users } from "lucide-react";
import { getFeedbackStats } from "@/actions/feedback";

export default async function FeedbackStats() {
    const stats = await getFeedbackStats();

    if (!stats.happiness && !stats.accuracy) {
        return null;
    }

    return (
        <div className="col-span-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Community Insights
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {/* Happiness Index */}
                {stats.happiness && (
                    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                                Happiness Index
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-indigo-600">
                                    {stats.happiness.happinessIndex}%
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    ({stats.happiness.averageRating}/5 ⭐)
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Based on {stats.happiness.totalFeedbacks} user{stats.happiness.totalFeedbacks !== 1 ? 's' : ''}
                            </p>
                            <div className="mt-3 bg-indigo-100 rounded-full h-2">
                                <div
                                    className="bg-indigo-500 h-2 rounded-full transition-all"
                                    style={{ width: `${stats.happiness.happinessIndex}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Accuracy Percentage */}
                {stats.accuracy && (
                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" />
                                Accuracy Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-green-600">
                                    {stats.accuracy.accuracyPercentage}%
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    ({stats.accuracy.accurateCount}/{stats.accuracy.totalFeedbacks})
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Users found their assessment accurate
                            </p>
                            <div className="mt-3 bg-green-100 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${stats.accuracy.accuracyPercentage}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
