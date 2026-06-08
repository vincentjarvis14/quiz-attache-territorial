import { eq, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  challenges,
  lessons,
  userProgress,
  userSousThemeProgress,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getRevisionCount } from "@/db/queries";
import { DEFAULT_EXAM_DATE } from "@/lib/srs";

import { GuestWelcomeModal } from "@/components/modals/guest-welcome-modal";

import { AppHeader } from "./app-header";
import { Dashboard, type DashMatiere } from "./dashboard";

const LearnPage = async () => {
  const userId = await auth();
  const isGuest = userId?.startsWith("guest_") ?? false;

  // Toutes les matières + leurs sous-thèmes (pour les onglets)
  const themesList = await db.query.themes.findMany({
    orderBy: (t, { asc }) => [asc(t.order)],
    with: {
      sousThemes: {
        orderBy: (s, { asc }) => [asc(s.order)],
      },
    },
  });

  // Nombre de questions par sous-thème
  const counts = await db
    .select({
      sousThemeId: lessons.sousThemeId,
      count: sql<number>`count(*)`,
    })
    .from(challenges)
    .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
    .groupBy(lessons.sousThemeId);
  const countMap = new Map(counts.map((c) => [c.sousThemeId, Number(c.count)]));

  // Progression de l'utilisateur courant
  const progress = userId
    ? await db
        .select()
        .from(userSousThemeProgress)
        .where(eq(userSousThemeProgress.userId, userId))
    : [];
  const doneMap = new Map(
    progress.map((p) => [p.sousThemeId, p.totalAnswered ?? 0]),
  );

  const revisionCount = await getRevisionCount();

  // Date du concours (réglage utilisateur) → bandeau J-X
  const progRow = userId
    ? await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        columns: { examDate: true },
      })
    : null;
  const examDate = (progRow?.examDate ?? new Date(DEFAULT_EXAM_DATE))
    .toISOString()
    .slice(0, 10);

  const matieres: DashMatiere[] = themesList.map((theme) => ({
    id: theme.id,
    title: theme.title,
    sousThemes: theme.sousThemes.map((st) => ({
      id: st.id,
      number: String(st.order).padStart(2, "0"),
      title: st.title,
      blurb: st.description,
      total: countMap.get(st.id) ?? 0,
      done: doneMap.get(st.id) ?? 0,
    })),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <Dashboard
        matieres={matieres}
        revisionCount={revisionCount}
        examDate={examDate}
      />
      <GuestWelcomeModal isGuest={isGuest} />
    </div>
  );
};

export default LearnPage;
