"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitAssessmentFeedback(assessmentId, rating, comment, isAccurate) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // Verify the assessment belongs to the user
        const assessment = await db.careerAssessment.findUnique({
            where: { id: assessmentId },
            include: { user: true },
        });

        if (!assessment || assessment.user.clerkUserId !== userId) {
            throw new Error("Assessment not found or unauthorized");
        }

        // Check if feedback already exists
        const existingFeedback = await db.assessmentFeedback.findUnique({
            where: { assessmentId },
        });

        if (existingFeedback) {
            // Feedback already submitted, cannot update
            throw new Error("Feedback has already been submitted and cannot be changed");
        }

        // Create new feedback
        const feedback = await db.assessmentFeedback.create({
            data: {
                assessmentId,
                rating,
                comment,
                isAccurate,
            },
        });
        revalidatePath("/onboarding/career-path");
        return feedback;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw new Error("Failed to submit feedback: " + error.message);
    }
}

export async function getHappinessIndex() {
    try {
        const feedbacks = await db.assessmentFeedback.findMany({
            select: { rating: true },
        });

        if (feedbacks.length === 0) {
            return null;
        }

        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = totalRating / feedbacks.length;

        // Convert to percentage (5 stars = 100%)
        const happinessIndex = (averageRating / 5) * 100;

        return {
            happinessIndex: Math.round(happinessIndex * 10) / 10, // Round to 1 decimal
            totalFeedbacks: feedbacks.length,
            averageRating: Math.round(averageRating * 10) / 10,
        };
    } catch (error) {
        console.error("Error calculating happiness index:", error);
        return null;
    }
}

export async function getAccuracyPercentage() {
    try {
        const feedbacks = await db.assessmentFeedback.findMany({
            select: { isAccurate: true },
        });

        if (feedbacks.length === 0) {
            return null;
        }

        const accurateCount = feedbacks.filter(f => f.isAccurate).length;
        const accuracyPercentage = (accurateCount / feedbacks.length) * 100;

        return {
            accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
            totalFeedbacks: feedbacks.length,
            accurateCount,
        };
    } catch (error) {
        console.error("Error calculating accuracy percentage:", error);
        return null;
    }
}

export async function getFeedbackStats() {
    try {
        const [happinessData, accuracyData] = await Promise.all([
            getHappinessIndex(),
            getAccuracyPercentage(),
        ]);

        return {
            happiness: happinessData,
            accuracy: accuracyData,
        };
    } catch (error) {
        console.error("Error getting feedback stats:", error);
        return {
            happiness: null,
            accuracy: null,
        };
    }
}

export async function getUserFeedback(assessmentId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const feedback = await db.assessmentFeedback.findUnique({
            where: { assessmentId },
        });

        return feedback;
    } catch (error) {
        console.error("Error getting user feedback:", error);
        return null;
    }
}
