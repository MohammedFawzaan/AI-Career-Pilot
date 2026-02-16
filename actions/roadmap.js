"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

export async function generateRoadmap(duration) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                careerAssessment: true,
            },
        });

        if (!user) throw new Error("User not found");
        if (!user.careerAssessment) {
            throw new Error("Please complete your career assessment first");
        }

        const { primaryRole, analysis } = user.careerAssessment;

        if (!analysis) {
            throw new Error("Please complete your career assessment first");
        }

        if (!primaryRole) {
            throw new Error("Please select a role at the career path page");
        }

        // Generate AI roadmap
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a career development expert. Create a detailed ${duration}-month career roadmap for someone pursuing a career as a ${primaryRole}.
            
            User Profile:
            - Primary Role: ${primaryRole}
            - Profile: ${analysis.primaryProfile}
            - Current Skills: ${analysis.identifiedSkills?.join(", ") || "None specified"}
            - Skills to Learn: ${analysis.recommendedSkills?.join(", ") || "None specified"}
            
            Create a structured roadmap with the following format (JSON only, no markdown):
            {
                "months": [
                    {
                        "month": 1,
                        "title": "Month title",
                        "goals": ["Goal 1", "Goal 2"],
                        "tasks": [
                            {
                                "id": "unique-id",
                                "title": "Task title",
                                "description": "Task description",
                                "priority": "High/Medium/Low"
                            }
                        ],
                        "milestones": ["Milestone 1", "Milestone 2"]
                    }
                ]
            }
            
            Make it practical, actionable, and progressive. Include learning resources, projects, networking, and skill-building activities.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const roadmapData = JSON.parse(text);

        // Initialize progress (all tasks unchecked)
        const progress = {};
        roadmapData.months.forEach(month => {
            month.tasks.forEach(task => {
                progress[task.id] = false;
            });
        });

        // Save or update roadmap
        const roadmap = await db.careerRoadmap.upsert({
            where: { userId: user.id },
            update: {
                duration,
                roadmapData,
                progress,
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                duration,
                roadmapData,
                progress,
            },
        });

        revalidatePath("/roadmap");
        return roadmap;
    } catch (error) {
        console.error("Error generating roadmap:", error);
        throw new Error("Failed to generate roadmap: " + error.message);
    }
}

export async function getRoadmap() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                careerRoadmap: true,
            },
        });

        return user?.careerRoadmap || null;
    } catch (error) {
        console.error("Error getting roadmap:", error);
        return null;
    }
}

export async function updateRoadmapProgress(taskId, completed) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                careerRoadmap: true,
            },
        });

        if (!user?.careerRoadmap) {
            throw new Error("Roadmap not found");
        }

        const updatedProgress = {
            ...user.careerRoadmap.progress,
            [taskId]: completed,
        };

        const roadmap = await db.careerRoadmap.update({
            where: { id: user.careerRoadmap.id },
            data: {
                progress: updatedProgress,
            },
        });

        revalidatePath("/roadmap");
        return roadmap;
    } catch (error) {
        console.error("Error updating roadmap progress:", error);
        throw new Error("Failed to update progress: " + error.message);
    }
}
