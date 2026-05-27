"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

import db from "@/db/drizzle";
import { getThemeById, getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";

export const upsertUserProgress = async (themeId: number) => {
  const userId = await auth();

  if (!userId) {
    throw new Error("Non autorisé");
  }

  const theme = await getThemeById(themeId);

  if (!theme) {
    throw new Error("Thème non trouvé");
  }

  if (!theme.sousThemes.length || !theme.sousThemes[0].lessons.length) {
    throw new Error("Ce thème est vide");
  }

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeThemeId: themeId,
    });

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await db.insert(userProgress).values({
    userId,
    activeThemeId: themeId,
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const userId = await auth();

  if (!userId) {
    throw new Error("Non autorisé");
  }

  const currentUserProgress = await getUserProgress();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge non trouvé");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: eq(challengeProgress.challengeId, challengeId),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    return { error: "practice" };
  }

  if (!currentUserProgress) {
    throw new Error("Progression non trouvée");
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db.update(userProgress).set({
    hearts: Math.max(currentUserProgress.hearts - 1, 0),
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("Progression non trouvée");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Les coeurs sont déjà pleins");
  }

  await db.update(userProgress).set({
    hearts: 5,
  }).where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
