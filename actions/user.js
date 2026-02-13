"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { checkUser } from "@/lib/checkUser";

export async function getUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  return user;
}

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    try {
      user = await checkUser();
    } catch (error) {
      console.error("Error syncing user inside updateUser:", error);
    }
  }

  if (!user) throw new Error("User not found");

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function updateUserType(userType) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.update({
      where: { clerkUserId: userId },
      data: { userType },
    });

    revalidatePath("/");
    return user;
  } catch (error) {
    console.error("Error updating user type:", error);
    throw new Error("Failed to update user type");
  }
}


export async function updateUserPath(industry, bio) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // 1. Check if IndustryInsight exists OUTSIDE the transaction for speed
    // If not, we generate it first.
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: industry },
    });

    if (!industryInsight) {
      // This AI call takes time (1-3s), so we do it outside transaction
      const insights = await generateAIInsights(industry);

      // Now create it. It's okay if race condition happens, we handle it or just let it fail/retry
      // But for simplicity, we just create it. 
      // Using upsert in transaction is safer but we want to avoid long transactions.
      await db.industryInsight.create({
        data: {
          industry: industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }).catch(() => {
        // Ignore unique constraint error if created by another req in parallel
        console.log("Industry insight creation race condition - ignoring");
      });
    }

    // 2. Transaction to update User (fast)
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          industry: industry,
          bio: bio,
          skills: [],
        },
      });
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating user path:", error);
    throw new Error("Failed to update career path: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    try {
      const syncedUser = await checkUser();
      if (syncedUser) {
        return {
          isOnboarded: !!syncedUser.industry,
        };
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
    return { isOnboarded: false };
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
