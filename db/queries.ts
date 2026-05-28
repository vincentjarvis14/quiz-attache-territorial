import { cache } from "react";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

import db from "@/db/drizzle";
import {
  challengeProgress,
  challenges,
  lessons,
  profiles,
  sousThemes,
  themes,
  userProgress,
  userSousThemeProgress,
  quizSessions,
  userAnswers,
} from "@/db/schema";

// ─── Profil utilisateur ─────────────────────────────────────────

export const getProfile = cache(async () => {
  const userId = await auth();
  if (!userId) return null;

  return db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
});

// ─── Progression utilisateur ────────────────────────────────────

export const getUserProgress = cache(async () => {
  const userId = await auth();

  if (!userId) {
    return null;
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeTheme: true,
    },
  });

  return data;
});

// ─── Type pour les sous-thèmes avec progression ─────────────────

export type SousThemeWithProgress = {
  id: number;
  title: string;
  description: string;
  order: number;
  pdfFileName: string;
  pdfPath: string | null;
  themeId: number;
  totalQuestions: number;
  totalAnswered: number;
  correctCount: number;
  percentage: number;
  status: "not_started" | "in_progress" | "needs_review" | "mastered";
};

// ─── Sous-thèmes avec progression (pour la grille Learn) ────────

export const getSousThemesWithProgress = cache(async (): Promise<SousThemeWithProgress[]> => {
  const userId = await auth();
  const userProg = await getUserProgress();

  if (!userId || !userProg?.activeThemeId) {
    return [];
  }

  // Récupérer les sous-thèmes du thème actif
  const sousThemesList = await db.query.sousThemes.findMany({
    orderBy: (sousThemes, { asc }) => [asc(sousThemes.order)],
    where: eq(sousThemes.themeId, userProg.activeThemeId),
  });

  // Récupérer les stats de progression pour tous les sous-thèmes
  const progressList = await db
    .select()
    .from(userSousThemeProgress)
    .where(
      and(
        eq(userSousThemeProgress.userId, userId),
        inArray(
          userSousThemeProgress.sousThemeId,
          sousThemesList.map((st) => st.id)
        )
      )
    );

  // Compter le nombre total de questions par sous-thème
  const questionCounts = await Promise.all(
    sousThemesList.map(async (st) => {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(challenges)
        .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
        .where(eq(lessons.sousThemeId, st.id));
      return { sousThemeId: st.id, count: Number(result?.count || 0) };
    })
  );

  const progressMap = new Map(
    progressList.map((p) => [p.sousThemeId, p])
  );
  const questionCountMap = new Map(
    questionCounts.map((q) => [q.sousThemeId, q.count])
  );

  return sousThemesList.map((st) => {
    const progress = progressMap.get(st.id);
    const totalQuestions = questionCountMap.get(st.id) || 0;
    const totalAnswered = progress?.totalAnswered || 0;
    const correctCount = progress?.correctCount || 0;
    const percentage = totalAnswered > 0
      ? Math.round((correctCount / totalAnswered) * 100)
      : 0;

    return {
      id: st.id,
      title: st.title,
      description: st.description,
      order: st.order,
      pdfFileName: st.pdfFileName,
      pdfPath: st.pdfPath,
      themeId: st.themeId,
      totalQuestions,
      totalAnswered,
      correctCount,
      percentage,
      status: (progress?.status || "not_started") as SousThemeWithProgress["status"],
    };
  });
});

// ─── Stats pour un sous-thème spécifique ─────────────────────────

export const getSousThemeStats = cache(async (sousThemeId: number) => {
  const userId = await auth();

  if (!userId) {
    return null;
  }

  const [progress] = await db
    .select()
    .from(userSousThemeProgress)
    .where(
      and(
        eq(userSousThemeProgress.userId, userId),
        eq(userSousThemeProgress.sousThemeId, sousThemeId)
      )
    )
    .limit(1);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(challenges)
    .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
    .where(eq(lessons.sousThemeId, sousThemeId));

  const totalQuestions = Number(countResult?.count || 0);
  const totalAnswered = progress?.totalAnswered || 0;
  const correctCount = progress?.correctCount || 0;
  const percentage = totalAnswered > 0
    ? Math.round((correctCount / totalAnswered) * 100)
    : 0;

  return {
    totalQuestions,
    totalAnswered,
    correctCount,
    percentage,
    status: (progress?.status || "not_started") as SousThemeWithProgress["status"],
  };
});

// ─── Sous-thèmes (Units) avec leçons et challenges (ancien, conservé) ──

export const getSousThemes = cache(async () => {
  const userId = await auth();
  const userProg = await getUserProgress();

  if (!userId || !userProg?.activeThemeId) {
    return [];
  }

  const data = await db.query.sousThemes.findMany({
    orderBy: (sousThemes, { asc }) => [asc(sousThemes.order)],
    where: eq(sousThemes.themeId, userProg.activeThemeId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((sousTheme) => {
    const lessonsWithCompletedStatus = sousTheme.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...sousTheme, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

// ─── Thèmes ─────────────────────────────────────────────────────

export const getThemes = cache(async () => {
  const data = await db.query.themes.findMany();

  return data;
});

export const getThemeById = cache(async (themeId: number) => {
  const data = await db.query.themes.findFirst({
    where: eq(themes.id, themeId),
    with: {
      sousThemes: {
        orderBy: (sousThemes, { asc }) => [asc(sousThemes.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

// ─── Progression du cours ───────────────────────────────────────

export const getCourseProgress = cache(async () => {
  const userId = await auth();
  const userProg = await getUserProgress();

  if (!userId || !userProg?.activeThemeId) {
    return null;
  }

  const sousThemesInActiveTheme = await db.query.sousThemes.findMany({
    orderBy: (sousThemes, { asc }) => [asc(sousThemes.order)],
    where: eq(sousThemes.themeId, userProg.activeThemeId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = sousThemesInActiveTheme
    .flatMap((st) => st.lessons)
    .find((lesson) => {
      return (
        lesson.challenges.length === 0 ||
        lesson.challenges.some((challenge) => {
          return (
            !challenge.challengeProgress ||
            challenge.challengeProgress.length === 0 ||
            challenge.challengeProgress.some(
              (progress) => progress.completed === false
            )
          );
        })
      );
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

// ─── Récupérer une leçon avec ses challenges ────────────────────

export const getLesson = cache(async (id?: number) => {
  const userId = await auth();

  if (!userId) {
    return null;
  }

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      sousTheme: true,
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

// ─── Pourcentage de progression d'une leçon ─────────────────────

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

// ─── Top 10 utilisateurs (classement) ───────────────────────────

export const getTopTenUsers = cache(async () => {
  const userId = await auth();

  if (!userId) {
    return [];
  }

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

// ─── Progression par thème (pour l'ancienne page) ───────────────

export async function getThemeProgress(userId: string) {
  const allThemes = await db
    .select()
    .from(themes)
    .orderBy(themes.order);

  const result = [];

  for (const theme of allThemes) {
    const sts = await db
      .select()
      .from(sousThemes)
      .where(eq(sousThemes.themeId, theme.id))
      .orderBy(sousThemes.order);

    const sousThemesWithProgress = [];

    for (const st of sts) {
      const [progress] = await db
        .select()
        .from(userSousThemeProgress)
        .where(
          and(
            eq(userSousThemeProgress.userId, userId),
            eq(userSousThemeProgress.sousThemeId, st.id)
          )
        )
        .limit(1);

      sousThemesWithProgress.push({
        id: st.id,
        title: st.title,
        description: st.description,
        order: st.order,
        status: progress?.status || "not_started",
        totalAnswered: progress?.totalAnswered || 0,
        correctCount: progress?.correctCount || 0,
      });
    }

    const totalAnswered = sousThemesWithProgress.reduce(
      (sum, st) => sum + st.totalAnswered,
      0
    );
    const totalCorrect = sousThemesWithProgress.reduce(
      (sum, st) => sum + st.correctCount,
      0
    );
    const percentage =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    result.push({
      id: theme.id,
      title: theme.matiere,
      percentage,
      sousThemes: sousThemesWithProgress,
    });
  }

  return result;
}

// ─── Questions pour un sous-thème (mode libre) ──────────────────

export async function getQuestionsForSousTheme(
  sousThemeId: number,
  limit: number = 10
) {
  return await db
    .select({
      id: challenges.id,
      lessonId: challenges.lessonId,
      question: challenges.question,
      explanation: challenges.explanation,
      sourceChunk: challenges.sourceChunk,
      sourceSection: challenges.sourceSection,
      difficulty: challenges.difficulty,
    })
    .from(challenges)
    .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
    .where(eq(lessons.sousThemeId, sousThemeId))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

// ─── Questions pour les points faibles ──────────────────────────

export async function getWeaknessQuestions(userId: string, limit: number = 10) {
  const weakProgress = await db
    .select()
    .from(userSousThemeProgress)
    .where(
      and(
        eq(userSousThemeProgress.userId, userId),
        eq(userSousThemeProgress.status, "needs_review")
      )
    )
    .orderBy(
      sql`${userSousThemeProgress.correctCount}::float / NULLIF(${userSousThemeProgress.totalAnswered}, 0)`
    )
    .limit(3);

  if (weakProgress.length === 0) return [];

  const weakIds = weakProgress.map((p) => p.sousThemeId);

  return await db
    .select()
    .from(challenges)
    .where(inArray(challenges.lessonId, weakIds))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

// ─── Session de quiz ────────────────────────────────────────────

export async function createQuizSession(
  userId: string,
  sousThemeId: number,
  mode: "free" | "challenge",
  questionIds: number[]
) {
  const [session] = await db
    .insert(quizSessions)
    .values({
      userId,
      sousThemeId,
      mode,
      heartsRemaining: mode === "challenge" ? 5 : null,
      totalQuestions: questionIds.length,
      questionIds,
    })
    .returning();

  return session;
}

export async function getActiveSession(userId: string) {
  const [session] = await db
    .select()
    .from(quizSessions)
    .where(
      and(
        eq(quizSessions.userId, userId),
        eq(quizSessions.completed, false)
      )
    )
    .orderBy(desc(quizSessions.updatedAt))
    .limit(1);

  return session || null;
}

export async function updateQuizSession(
  sessionId: number,
  data: Partial<typeof quizSessions.$inferInsert>
) {
  await db
    .update(quizSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quizSessions.id, sessionId));
}

// ─── Réponses utilisateur ───────────────────────────────────────

export async function saveUserAnswer(
  userId: string,
  questionId: number,
  selectedAnswer: number,
  correct: boolean,
  sessionId?: number
) {
  await db.insert(userAnswers).values({
    userId,
    questionId,
    selectedAnswer,
    correct,
    sessionId,
  });

  const question = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, questionId))
    .limit(1)
    .then((r) => r[0]);

  if (question) {
    // Récupérer le sousThemeId via la leçon
    const lessonRow = await db.query.lessons.findFirst({
      where: eq(lessons.id, question.lessonId),
      columns: { sousThemeId: true },
    });
    const sousThemeId = lessonRow?.sousThemeId;
    if (!sousThemeId) return;

    const existing = await db
      .select()
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
      const newTotal = (existing.totalAnswered || 0) + 1;
      const newCorrect = (existing.correctCount || 0) + (correct ? 1 : 0);
      const ratio = newCorrect / newTotal;

      let status: string;
      if (newTotal >= 10 && ratio >= 0.8) {
        status = "mastered";
      } else if (ratio < 0.4) {
        status = "needs_review";
      } else {
        status = "in_progress";
      }

      await db
        .update(userSousThemeProgress)
        .set({
          totalAnswered: newTotal,
          correctCount: newCorrect,
          lastReviewedAt: new Date(),
          status: status as any,
        })
        .where(eq(userSousThemeProgress.id, existing.id));
    } else {
      await db.insert(userSousThemeProgress).values({
        userId,
        sousThemeId,
        totalAnswered: 1,
        correctCount: correct ? 1 : 0,
        lastReviewedAt: new Date(),
        status: correct ? "in_progress" : "needs_review",
      });
    }
  }
}

// ─── Stats page marketing ───────────────────────────────────────

import { unstable_cache } from "next/cache";

export const getMarketingStats = unstable_cache(
  async () => {
    const allThemes = await db
      .select({
        id: themes.id,
        title: themes.title,
        matiere: themes.matiere,
        imageSrc: themes.imageSrc,
      })
      .from(themes)
      .orderBy(themes.order);

    const themesWithStats = await Promise.all(
      allThemes.map(async (theme) => {
        const [{ chapitreCount }] = await db
          .select({ chapitreCount: sql<number>`count(*)` })
          .from(sousThemes)
          .where(eq(sousThemes.themeId, theme.id));

        const [{ questionCount }] = await db
          .select({ questionCount: sql<number>`count(*)` })
          .from(challenges)
          .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
          .innerJoin(sousThemes, eq(lessons.sousThemeId, sousThemes.id))
          .where(eq(sousThemes.themeId, theme.id));

        return {
          ...theme,
          chapitreCount: Number(chapitreCount),
          questionCount: Number(questionCount),
        };
      })
    );

    const [{ totalQuestions }] = await db
      .select({ totalQuestions: sql<number>`count(*)` })
      .from(challenges);

    const [{ totalDocs }] = await db
      .select({ totalDocs: sql<number>`count(*)` })
      .from(sousThemes);

    return {
      totalQuestions: Number(totalQuestions),
      totalDocs: Number(totalDocs),
      totalMatieres: allThemes.length,
      themes: themesWithStats,
    };
  },
  ["marketing-stats"],
  { revalidate: 3600 }
);

// ─── Assistant IA (RAG) ─────────────────────────────────────────

export async function searchQuestionsByText(search: string) {
  return await db
    .select()
    .from(challenges)
    .where(
      sql`to_tsvector('french', ${challenges.question}) @@ plainto_tsquery('french', ${search})`
    )
    .limit(5);
}
