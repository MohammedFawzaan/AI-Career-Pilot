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
    include: {
      careerAssessment: true,
    },
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
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

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

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
            country: data.country,
            city: data.city,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
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

    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: industry },
    });

    if (!industryInsight) {
      const insights = await generateAIInsights(industry);

      await db.industryInsight.create({
        data: {
          industry: industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }).catch(() => {
        console.log("Industry insight creation race condition - ignoring");
      });
    }

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

export async function updatePrimaryRole(selectedRole) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const assessment = await db.careerAssessment.update({
      where: { userId: user.id },
      data: { primaryRole: selectedRole },
    });

    revalidatePath("/");
    return assessment;
  } catch (error) {
    console.error("Error updating primary role:", error);
    throw new Error("Failed to update primary role: " + error.message);
  }
}
