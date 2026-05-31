import { cache } from "react";
import { eq, and, desc, sql, inArray, lte, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  reviewCard,
  DEFAULT_EXAM_DATE,
  isSousThemeDecayed,
  startOfDay,
} from "@/lib/srs";

import db from "@/db/drizzle";
import {
  challengeProgress,
  challenges,
  lessons,
  matiereEnum,
  profiles,
  sections,
  sousThemes,
  themes,
  userProgress,
  userSousThemeProgress,
  quizSessions,
  userAnswers,
  userQuestionSrs,
  sectionLegalRefs,
  legalChunks,
} from "@/db/schema";
import type { Block } from "@/lib/clean-section";

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

  // Oubli simulé : nombre de cartes EN RETARD (dueAt < aujourd'hui) par sous-thème.
  const now = new Date();
  const overdueRows = await db
    .select({
      sousThemeId: lessons.sousThemeId,
      count: sql<number>`count(*)`,
    })
    .from(userQuestionSrs)
    .innerJoin(challenges, eq(userQuestionSrs.questionId, challenges.id))
    .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
    .where(
      and(
        eq(userQuestionSrs.userId, userId),
        lt(userQuestionSrs.dueAt, startOfDay(now))
      )
    )
    .groupBy(lessons.sousThemeId);
  const overdueMap = new Map(
    overdueRows.map((r) => [r.sousThemeId, Number(r.count)])
  );

  return sousThemesList.map((st) => {
    const progress = progressMap.get(st.id);
    const totalQuestions = questionCountMap.get(st.id) || 0;
    const totalAnswered = progress?.totalAnswered || 0;
    const correctCount = progress?.correctCount || 0;
    const percentage = totalAnswered > 0
      ? Math.round((correctCount / totalAnswered) * 100)
      : 0;

    let status = (progress?.status || "not_started") as SousThemeWithProgress["status"];
    // Decay (affichage) : un sous-thème "mastered" repasse "needs_review" s'il a
    // trop de cartes en retard ou n'a pas été revu depuis longtemps.
    if (
      status === "mastered" &&
      isSousThemeDecayed(overdueMap.get(st.id) || 0, progress?.lastReviewedAt ?? null, now)
    ) {
      status = "needs_review";
    }

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
      status,
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

// ─── Pool de questions pour plusieurs sous-thèmes ───────────────

export async function getQuestionsPool(sousThemeIds: number[], limit = 20) {
  const userId = await auth();
  if (!userId) return null;

  // 1. Récupère les IDs de leçons appartenant à ces sous-thèmes
  const lessonRows = await db
    .select({ id: lessons.id, sousThemeId: lessons.sousThemeId })
    .from(lessons)
    .where(inArray(lessons.sousThemeId, sousThemeIds));

  if (lessonRows.length === 0) return [];

  const lessonIds = lessonRows.map((l) => l.id);

  // 2. Récupère les challenges avec leurs options, mélangés
  const rows = await db.query.challenges.findMany({
    where: inArray(challenges.lessonId, lessonIds),
    with: { challengeOptions: true },
    orderBy: sql`RANDOM()`,
    limit,
  });

  return rows;
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

  const weakSousThemeIds = weakProgress.map((p) => p.sousThemeId);

  // challenges.lessonId référence lessons.id, pas sousThemes.id : on passe par
  // la jointure lessons.sousThemeId pour retrouver les questions du sous-thème.
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
    .where(inArray(lessons.sousThemeId, weakSousThemeIds))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

// ─── Mode révision : cartes dues (répétition espacée) ───────────
// Une "carte due" = dont dueAt <= fin de journée. Complété par des questions
// jamais vues (sans ligne SRS). Renvoie challenges + options (même forme qu'avant).

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getRevisionCount(): Promise<number> {
  const userId = await auth();
  if (!userId) return 0;
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userQuestionSrs)
    .where(
      and(
        eq(userQuestionSrs.userId, userId),
        lte(userQuestionSrs.dueAt, endOfToday())
      )
    );
  return Number(row?.count ?? 0);
}

export async function getDueCards(limit = 20) {
  const userId = await auth();
  if (!userId) return null;

  const loadChallenges = (ids: number[]) =>
    db.query.challenges.findMany({
      where: inArray(challenges.id, ids),
      with: { challengeOptions: true },
      orderBy: sql`RANDOM()`,
      limit,
    });

  // 1. Cartes dues, les plus en retard d'abord.
  const due = await db
    .select({ id: userQuestionSrs.questionId })
    .from(userQuestionSrs)
    .where(
      and(
        eq(userQuestionSrs.userId, userId),
        lte(userQuestionSrs.dueAt, endOfToday())
      )
    )
    .orderBy(userQuestionSrs.dueAt)
    .limit(limit);
  const collected = new Set<number>(due.map((d) => d.id));

  // 2. Complément : questions jamais vues (aucune ligne SRS pour l'utilisateur).
  if (collected.size < limit) {
    const seen = await db
      .select({ questionId: userQuestionSrs.questionId })
      .from(userQuestionSrs)
      .where(eq(userQuestionSrs.userId, userId));
    const seenIds = new Set(seen.map((s) => s.questionId));

    const freshRows = await db
      .select({ id: challenges.id })
      .from(challenges)
      .orderBy(sql`RANDOM()`)
      .limit(limit * 3);
    for (const r of freshRows) {
      if (collected.size >= limit) break;
      if (!seenIds.has(r.id)) collected.add(r.id);
    }
  }

  if (collected.size === 0) return [];
  return loadChallenges([...collected]);
}

// ─── Tableau de bord : progression par sous-thème ───────────────
// Source de vérité = user_answers (dernière réponse par question), et non
// les compteurs cumulés de user_sous_theme_progress (qui sur-comptent en
// mode révision). Deux requêtes seulement, agrégation en mémoire :
// app mono-utilisatrice, ~quelques centaines de challenges → coût négligeable.

export type ProgressionRow = {
  sousThemeId: number;
  title: string;
  matiere: string;
  totalQuestions: number;
  answered: number; // questions distinctes répondues au moins une fois
  correctLast: number; // questions dont la DERNIÈRE réponse est correcte
  coverage: number; // answered / totalQuestions (%)
  accuracy: number; // correctLast / answered (%)
};

export const getProgressionBySousTheme = cache(
  async (): Promise<ProgressionRow[]> => {
    const userId = await auth();
    if (!userId) return [];
    const userProg = await getUserProgress();

    // 1. Dernière réponse par question (même motif que le mode révision).
    const lastAnswers = await db
      .select({
        questionId: userAnswers.questionId,
        lastCorrect: sql<boolean>`(array_agg(${userAnswers.correct} ORDER BY ${userAnswers.createdAt} DESC, ${userAnswers.id} DESC))[1]`,
      })
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId))
      .groupBy(userAnswers.questionId);

    const lastMap = new Map(
      lastAnswers.map((r) => [r.questionId, r.lastCorrect]),
    );

    // 2. Périmètre des sous-thèmes : le thème actif s'il est défini (couverture
    //    de la matière en cours), sinon les sous-thèmes effectivement
    //    travaillés (la navigation par pool /learn ne fixe pas de thème actif).
    let scope;
    if (userProg?.activeThemeId) {
      scope = eq(sousThemes.themeId, userProg.activeThemeId);
    } else {
      if (lastMap.size === 0) return [];
      const answeredIds = [...lastMap.keys()];
      const stRows = await db
        .select({ id: lessons.sousThemeId })
        .from(challenges)
        .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
        .where(inArray(challenges.id, answeredIds));
      const stIds = [...new Set(stRows.map((r) => r.id))];
      if (stIds.length === 0) return [];
      scope = inArray(sousThemes.id, stIds);
    }

    // 3. Tous les challenges du périmètre, rattachés à leur sous-thème.
    const challengeRows = await db
      .select({
        challengeId: challenges.id,
        sousThemeId: sousThemes.id,
        sousThemeTitle: sousThemes.title,
        sousThemeOrder: sousThemes.order,
        matiere: themes.matiere,
      })
      .from(challenges)
      .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
      .innerJoin(sousThemes, eq(lessons.sousThemeId, sousThemes.id))
      .innerJoin(themes, eq(sousThemes.themeId, themes.id))
      .where(scope);

    if (challengeRows.length === 0) return [];

    // 3. Agrégation par sous-thème (ordre stable via sousThemes.order).
    const acc = new Map<number, ProgressionRow & { order: number }>();
    for (const c of challengeRows) {
      let row = acc.get(c.sousThemeId);
      if (!row) {
        row = {
          sousThemeId: c.sousThemeId,
          title: c.sousThemeTitle,
          matiere: c.matiere,
          totalQuestions: 0,
          answered: 0,
          correctLast: 0,
          coverage: 0,
          accuracy: 0,
          order: c.sousThemeOrder,
        };
        acc.set(c.sousThemeId, row);
      }
      row.totalQuestions += 1;
      if (lastMap.has(c.challengeId)) {
        row.answered += 1;
        if (lastMap.get(c.challengeId) === true) row.correctLast += 1;
      }
    }

    return [...acc.values()]
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...r }) => ({
        ...r,
        coverage:
          r.totalQuestions > 0
            ? Math.round((r.answered / r.totalQuestions) * 100)
            : 0,
        accuracy:
          r.answered > 0 ? Math.round((r.correctLast / r.answered) * 100) : 0,
      }));
  },
);

// ─── Tableau de bord : questions les plus ratées ────────────────
// Questions dont la DERNIÈRE réponse est incorrecte, triées par nombre
// d'erreurs cumulées puis par nombre de tentatives. Top `limit`.

export type MissedQuestion = {
  questionId: number;
  question: string;
  sousThemeTitle: string;
  attempts: number;
  wrongCount: number;
};

export const getMostMissedQuestions = cache(
  async (limit = 10): Promise<MissedQuestion[]> => {
    const userId = await auth();
    if (!userId) return [];

    const rows = await db
      .select({
        questionId: userAnswers.questionId,
        attempts: sql<number>`count(*)`,
        wrongCount: sql<number>`count(*) filter (where ${userAnswers.correct} = false)`,
        lastCorrect: sql<boolean>`(array_agg(${userAnswers.correct} ORDER BY ${userAnswers.createdAt} DESC, ${userAnswers.id} DESC))[1]`,
      })
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId))
      .groupBy(userAnswers.questionId);

    const missed = rows.filter((r) => r.lastCorrect === false);
    if (missed.length === 0) return [];

    missed.sort(
      (a, b) =>
        Number(b.wrongCount) - Number(a.wrongCount) ||
        Number(b.attempts) - Number(a.attempts),
    );
    const top = missed.slice(0, limit);
    const ids = top.map((r) => r.questionId);

    // Textes + sous-thème pour les questions retenues (une seule requête).
    const meta = await db
      .select({
        id: challenges.id,
        question: challenges.question,
        sousThemeTitle: sousThemes.title,
      })
      .from(challenges)
      .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
      .innerJoin(sousThemes, eq(lessons.sousThemeId, sousThemes.id))
      .where(inArray(challenges.id, ids));

    const metaMap = new Map(meta.map((m) => [m.id, m]));

    return top.map((r) => ({
      questionId: r.questionId,
      question: metaMap.get(r.questionId)?.question ?? "Question indisponible",
      sousThemeTitle: metaMap.get(r.questionId)?.sousThemeTitle ?? "—",
      attempts: Number(r.attempts),
      wrongCount: Number(r.wrongCount),
    }));
  },
);

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
  sessionId?: number,
  // En mode révision, les questions ratées sont sur-échantillonnées : on
  // enregistre la réponse (suivi ratée→réussie) sans recompter la maîtrise
  // du sous-thème, sinon le ratio s'effondre artificiellement.
  updateProgress: boolean = true
) {
  await db.insert(userAnswers).values({
    userId,
    questionId,
    selectedAnswer,
    correct,
    sessionId,
  });

  // ── Répétition espacée : planifie la carte. TOUJOURS exécuté (mode normal ET
  // révision) — c'est l'inverse de updateProgress, donc AVANT le return ci-dessous. ──
  {
    const prevSrs = await db
      .select({ box: userQuestionSrs.box, lapses: userQuestionSrs.lapses })
      .from(userQuestionSrs)
      .where(
        and(
          eq(userQuestionSrs.userId, userId),
          eq(userQuestionSrs.questionId, questionId)
        )
      )
      .limit(1)
      .then((r) => r[0]);

    const examRow = await db
      .select({ examDate: userProgress.examDate })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1)
      .then((r) => r[0]);
    const examDate = examRow?.examDate ?? new Date(DEFAULT_EXAM_DATE);

    const now = new Date();
    const next = reviewCard(prevSrs ?? null, correct, now, examDate);

    await db
      .insert(userQuestionSrs)
      .values({
        userId,
        questionId,
        box: next.box,
        dueAt: next.dueAt,
        lastReviewedAt: now,
        lapses: next.lapses,
      })
      .onConflictDoUpdate({
        target: [userQuestionSrs.userId, userQuestionSrs.questionId],
        set: {
          box: next.box,
          dueAt: next.dueAt,
          lastReviewedAt: now,
          lapses: next.lapses,
        },
      });
  }

  if (!updateProgress) return;

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

// ─── Bibliothèque de révision ───────────────────────────────────
// Le join sections ↔ sous_themes se fait par valeur : sous_themes.pdf_file_name
// porte l'extension ".pdf" alors que sections.source_pdf ne l'a pas. On normalise.

const stripPdf = (name: string) => name.replace(/\.pdf$/i, "");

// L'enum matiere ("environnement_territorial") ↔ slug URL ("environnement-territorial").
export const matiereToSlug = (matiere: string) => matiere.replace(/_/g, "-");
export const slugToMatiere = (slug: string) => slug.replace(/-/g, "_");

// Ordre naturel des sections via le suffixe d'id ("…__4_1" → [4, 1]).
function sectionOrderKey(id: string): number[] {
  const suffix = id.split("__")[1] ?? "";
  return suffix.split("_").map((n) => parseInt(n, 10) || 0);
}
function compareSectionIds(a: string, b: string): number {
  const ka = sectionOrderKey(a);
  const kb = sectionOrderKey(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
    const diff = (ka[i] ?? 0) - (kb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function sectionToBlocks(s: { contentClean: Block[] | null; content: string }): Block[] {
  if (s.contentClean && s.contentClean.length > 0) return s.contentClean;
  return s.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph" as const, text }));
}

export type LibraryThemeSummary = {
  id: number;
  title: string;
  matiere: string;
  slug: string;
  sousThemeCount: number;
  sectionCount: number;
};

export const getLibraryCatalog = unstable_cache(
  async (): Promise<LibraryThemeSummary[]> => {
    const allThemes = await db.query.themes.findMany({
      orderBy: (t, { asc }) => [asc(t.order)],
      with: { sousThemes: { columns: { pdfFileName: true } } },
    });

    return Promise.all(
      allThemes.map(async (theme) => {
        const slugs = theme.sousThemes.map((st) => stripPdf(st.pdfFileName));
        const [row] = slugs.length
          ? await db
              .select({ n: sql<number>`count(*)` })
              .from(sections)
              .where(inArray(sections.sourcePdf, slugs))
          : [{ n: 0 }];
        return {
          id: theme.id,
          title: theme.title,
          matiere: theme.matiere,
          slug: matiereToSlug(theme.matiere),
          sousThemeCount: theme.sousThemes.length,
          sectionCount: Number(row.n),
        };
      })
    );
  },
  ["library-catalog"],
  { revalidate: 3600, tags: ["sections"] }
);

export const getLibraryTheme = unstable_cache(
  async (matiereSlug: string) => {
    const matiere = slugToMatiere(matiereSlug);
    if (!matiereEnum.enumValues.includes(matiere as never)) return null;
    const theme = await db.query.themes.findFirst({
      where: eq(themes.matiere, matiere as typeof themes.$inferSelect.matiere),
      with: { sousThemes: { orderBy: (s, { asc }) => [asc(s.order)] } },
    });
    if (!theme) return null;

    const sousThemesWithCounts = await Promise.all(
      theme.sousThemes.map(async (st) => {
        const slug = stripPdf(st.pdfFileName);
        const [secRow] = await db
          .select({
            n: sql<number>`count(*)`,
            chars: sql<number>`coalesce(sum(char_length(${sections.content})), 0)`,
          })
          .from(sections)
          .where(eq(sections.sourcePdf, slug));
        const sectionTitleRows = await db
          .select({ id: sections.id, title: sections.title })
          .from(sections)
          .where(eq(sections.sourcePdf, slug))
          .orderBy(sections.pageStart);
        const [qRow] = await db
          .select({ n: sql<number>`count(*)` })
          .from(challenges)
          .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
          .where(eq(lessons.sousThemeId, st.id));
        return {
          id: st.id,
          title: st.title,
          description: st.description,
          order: st.order,
          sectionCount: Number(secRow.n),
          questionCount: Number(qRow.n),
          sectionTitles: sectionTitleRows.map((r) => ({ id: r.id, title: r.title })),
          // ~5 car./mot, lecture ~200 mots/min → minutes = car. / 1000.
          readingMinutes: Math.max(1, Math.round(Number(secRow.chars) / 1000)),
        };
      })
    );

    return {
      id: theme.id,
      title: theme.title,
      matiere: theme.matiere,
      slug: matiereToSlug(theme.matiere),
      sousThemes: sousThemesWithCounts,
    };
  },
  ["library-theme"],
  { revalidate: 3600, tags: ["sections"] }
);

export type LegalRef = {
  articleRef: string | null;
  content: string;
  headingPath: string | null;
  position: number;
};

export type LibrarySection = {
  id: string;
  title: string;
  blocks: Block[];
  pageStart: number | null;
  legalRefs: LegalRef[];
};

export const getSousThemeReading = unstable_cache(
  async (sousThemeId: number) => {
    const sousTheme = await db.query.sousThemes.findFirst({
      where: eq(sousThemes.id, sousThemeId),
      with: { theme: true },
    });
    if (!sousTheme) return null;

    const slug = stripPdf(sousTheme.pdfFileName);
    const rawSections = await db
      .select({
        id: sections.id,
        title: sections.title,
        content: sections.content,
        contentClean: sections.contentClean,
        pageStart: sections.pageStart,
      })
      .from(sections)
      .where(eq(sections.sourcePdf, slug));

    // Articles du Code de l'urbanisme rattachés aux sections (RAG pré-calculé).
    // Uniquement pour la matière « urbanisme » — sinon hors-sujet.
    const sectionIds = rawSections.map((s) => s.id);
    const legalBySection = new Map<string, LegalRef[]>();
    if (sousTheme.theme.matiere === "urbanisme" && sectionIds.length > 0) {
      const refRows = await db
        .select({
          sectionId: sectionLegalRefs.sectionId,
          articleRef: sectionLegalRefs.articleRef,
          position: sectionLegalRefs.position,
          content: legalChunks.content,
          headingPath: legalChunks.headingPath,
        })
        .from(sectionLegalRefs)
        .innerJoin(legalChunks, eq(sectionLegalRefs.chunkId, legalChunks.id))
        .where(inArray(sectionLegalRefs.sectionId, sectionIds))
        .orderBy(sectionLegalRefs.position);
      for (const r of refRows) {
        const list = legalBySection.get(r.sectionId) ?? [];
        list.push({
          articleRef: r.articleRef,
          content: r.content,
          headingPath: r.headingPath,
          position: r.position,
        });
        legalBySection.set(r.sectionId, list);
      }
    }

    const orderedSections: LibrarySection[] = rawSections
      .sort((a, b) => compareSectionIds(a.id, b.id))
      .map((s) => ({
        id: s.id,
        title: s.title,
        pageStart: s.pageStart,
        blocks: sectionToBlocks(s),
        legalRefs: legalBySection.get(s.id) ?? [],
      }));

    // Articles-clés du chapitre : dédupliqués, 1ʳᵉ occurrence (position la plus basse).
    const keyArticlesMap = new Map<string, LegalRef>();
    for (const sec of orderedSections) {
      for (const ref of sec.legalRefs) {
        if (!ref.articleRef) continue;
        if (!keyArticlesMap.has(ref.articleRef)) {
          keyArticlesMap.set(ref.articleRef, ref);
        }
      }
    }
    const keyArticles = [...keyArticlesMap.values()].slice(0, 12);

    const siblings = await db
      .select({ id: sousThemes.id, title: sousThemes.title })
      .from(sousThemes)
      .where(eq(sousThemes.themeId, sousTheme.themeId))
      .orderBy(sousThemes.order);
    const idx = siblings.findIndex((s) => s.id === sousThemeId);

    const [qRow] = await db
      .select({ n: sql<number>`count(*)` })
      .from(challenges)
      .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
      .where(eq(lessons.sousThemeId, sousThemeId));

    return {
      sousTheme: {
        id: sousTheme.id,
        title: sousTheme.title,
        description: sousTheme.description,
        pdfSlug: slug,
      },
      theme: {
        id: sousTheme.theme.id,
        title: sousTheme.theme.title,
        matiere: sousTheme.theme.matiere,
        slug: matiereToSlug(sousTheme.theme.matiere),
      },
      sections: orderedSections,
      keyArticles,
      prev: idx > 0 ? siblings[idx - 1] : null,
      next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
      questionCount: Number(qRow.n),
    };
  },
  ["library-reading"],
  { revalidate: 3600, tags: ["sections"] }
);

// ─── Niveau de maîtrise auto-déclaré ────────────────────────────
// Par utilisateur → jamais mis en cache (dépend de auth()/cookies).

import type { MasteryLevel } from "@/lib/mastery";
export type { MasteryLevel };

export async function getSelfMasteryMap(
  sousThemeIds: number[]
): Promise<Map<number, MasteryLevel>> {
  const result = new Map<number, MasteryLevel>();
  if (sousThemeIds.length === 0) return result;

  const userId = await auth();
  if (!userId) return result;

  const rows = await db
    .select({
      sousThemeId: userSousThemeProgress.sousThemeId,
      selfMastery: userSousThemeProgress.selfMastery,
    })
    .from(userSousThemeProgress)
    .where(
      and(
        eq(userSousThemeProgress.userId, userId),
        inArray(userSousThemeProgress.sousThemeId, sousThemeIds)
      )
    );

  for (const row of rows) {
    if (row.selfMastery) result.set(row.sousThemeId, row.selfMastery);
  }
  return result;
}

export async function getSelfMastery(
  sousThemeId: number
): Promise<MasteryLevel | null> {
  const map = await getSelfMasteryMap([sousThemeId]);
  return map.get(sousThemeId) ?? null;
}
