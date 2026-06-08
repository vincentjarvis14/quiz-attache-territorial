"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { auth, getUser } from "@/lib/auth";
import { DEFAULT_EXAM_DATE } from "@/lib/srs";

export type MyProfile = {
  name: string;
  email: string | null;
  examDate: string; // ISO "YYYY-MM-DD"
  avatar: string | null; // emoji choisi, ou null = pastille à initiales
  isGuest: boolean;
};

const DEFAULT_NAME = "Utilisateur";
const DEFAULT_IMAGE = "/mascot.svg";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Profil de l'utilisateur courant (compte connecté ou invité). */
export async function getMyProfile(): Promise<MyProfile | null> {
  const userId = await auth();
  if (!userId) return null;

  const isGuest = userId.startsWith("guest_");

  const row = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { userName: true, examDate: true, userImageSrc: true },
  });

  const user = isGuest ? null : await getUser();

  // userImageSrc stocke soit un chemin (défaut "/mascot.svg"), soit un emoji choisi.
  const img = row?.userImageSrc;
  const avatar = img && !img.startsWith("/") ? img : null;

  return {
    name: row?.userName ?? DEFAULT_NAME,
    email: user?.email ?? null,
    examDate: toISODate(row?.examDate ?? new Date(DEFAULT_EXAM_DATE)),
    avatar,
    isGuest,
  };
}

/** Met à jour le nom d'affichage et/ou la date du concours. */
export async function updateMyProfile(input: {
  name?: string;
  examDate?: string;
  avatar?: string; // emoji, ou "" pour revenir aux initiales
}): Promise<MyProfile> {
  const userId = await auth();
  if (!userId) throw new Error("Non autorisé");

  const name = input.name?.trim();
  const examDate =
    input.examDate && !Number.isNaN(Date.parse(input.examDate))
      ? new Date(input.examDate)
      : undefined;

  const patch: { userName?: string; examDate?: Date; userImageSrc?: string } = {};
  if (name) patch.userName = name;
  if (examDate) patch.examDate = examDate;
  if (input.avatar !== undefined)
    patch.userImageSrc = input.avatar || DEFAULT_IMAGE;

  await db
    .insert(userProgress)
    .values({ userId, ...patch })
    .onConflictDoUpdate({ target: userProgress.userId, set: patch });

  revalidatePath("/learn");

  const profile = await getMyProfile();
  if (!profile) throw new Error("Profil introuvable après mise à jour");
  return profile;
}
