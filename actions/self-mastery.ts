"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { auth } from "@/lib/auth";
import { userSousThemeProgress } from "@/db/schema";
import type { MasteryLevel } from "@/db/queries";

const LEVELS: MasteryLevel[] = ["a_revoir", "en_cours", "maitrise"];

export async function setSelfMastery(
  sousThemeId: number,
  level: MasteryLevel | null
) {
  const userId = await auth();
  if (!userId) return { error: "unauthorized" as const };

  if (level !== null && !LEVELS.includes(level)) {
    return { error: "invalid" as const };
  }

  const existing = await db
    .select({ id: userSousThemeProgress.id })
    .from(userSousThemeProgress)
    .where(
      and(
        eq(userSousThemeProgress.userId, userId),
        eq(userSousThemeProgress.sousThemeId, sousThemeId)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    await db
      .update(userSousThemeProgress)
      .set({ selfMastery: level })
      .where(eq(userSousThemeProgress.id, existing.id));
  } else {
    await db.insert(userSousThemeProgress).values({
      userId,
      sousThemeId,
      selfMastery: level,
    });
  }

  revalidatePath("/library", "layout");
  return { ok: true as const, level };
}
