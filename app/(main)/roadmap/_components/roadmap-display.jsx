"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target, ListTodo } from "lucide-react";
import { updateRoadmapProgress } from "@/actions/roadmap";
import { toast } from "sonner";

export default function RoadmapDisplay({ roadmap }) {
    const [progress, setProgress] = useState(roadmap.progress || {});
    const { roadmapData } = roadmap;

    const handleTaskToggle = async (taskId, checked) => {
        try {
            await updateRoadmapProgress(taskId, checked);
            setProgress(prev => ({ ...prev, [taskId]: checked }));
            toast.success(checked ? "Task completed!" : "Task unchecked");
        } catch (error) {
            toast.error("Failed to update progress");
        }
    };

    const calculateProgress = () => {
        const totalTasks = Object.keys(progress).length;
        const completedTasks = Object.values(progress).filter(Boolean).length;
        return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    };

    const progressPercentage = calculateProgress();

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        Overall Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="bg-green-100 rounded-full h-4">
                                <div
                                    className="bg-green-500 h-4 rounded-full transition-all"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{progressPercentage}%</span>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Roadmap */}
            <div className="space-y-6">
                {roadmapData.months.map((month, index) => {
                    const monthTasks = month.tasks || [];
                    const completedInMonth = monthTasks.filter(task => progress[task.id]).length;
                    const monthProgress = monthTasks.length > 0
                        ? Math.round((completedInMonth / monthTasks.length) * 100)
                        : 0;

                    return (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Month {month.month}: {month.title}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            {month.goals?.join(" • ")}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Progress</div>
                                        <div className="text-2xl font-bold text-blue-600">{monthProgress}%</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Tasks */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <ListTodo className="h-4 w-4" />
                                        Tasks
                                    </h4>
                                    {monthTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <Checkbox
                                                checked={progress[task.id] || false}
                                                onCheckedChange={(checked) => handleTaskToggle(task.id, checked)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className={`font-medium ${progress[task.id] ? "line-through text-muted-foreground" : ""}`}>
                                                        {task.title}
                                                    </h5>
                                                    <Badge variant={
                                                        task.priority === "High" ? "destructive" :
                                                            task.priority === "Medium" ? "default" : "secondary"
                                                    }>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {task.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Milestones */}
                                {month.milestones && month.milestones.length > 0 && (
                                    <div className="space-y-2 pt-4 border-t">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            Milestones
                                        </h4>
                                        <ul className="space-y-1">
                                            {month.milestones.map((milestone, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                                                    {milestone}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
