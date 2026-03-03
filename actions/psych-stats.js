"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Save psychological game stats to the database.
 * Upserts into the PsychologicalStats model.
 */
export async function savePsychStats({ archetype, strength, riskProfile, traitScores }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: { careerAssessment: true },
    });

    if (!user) throw new Error("User not found");

    const stats = await db.psychologicalStats.upsert({
        where: { userId: user.id },
        update: {
            archetype,
            strength,
            riskProfile,
            traitScores,
            assessmentId: user.careerAssessment?.id || null,
            updatedAt: new Date(),
        },
        create: {
            userId: user.id,
            archetype,
            strength,
            riskProfile,
            traitScores,
            assessmentId: user.careerAssessment?.id || null,
        },
    });

    return stats;
}

/**
 * Get psychological stats for the current user.
 */
export async function getPsychStats() {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) return null;

    return db.psychologicalStats.findUnique({
        where: { userId: user.id },
    });
}
