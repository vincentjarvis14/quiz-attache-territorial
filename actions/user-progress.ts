"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

import db from "@/db/drizzle";
import { getThemeById, getUserProgress } from "@/db/queries";
import { userProgress } from "@/db/schema";

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
    }).where(eq(userProgress.userId, userId));

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
