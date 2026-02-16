"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function checkUserType() {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { userType: true },
        });

        return user?.userType || null;
    } catch (error) {
        console.error("Error checking user type:", error);
        return null;
    }
}
