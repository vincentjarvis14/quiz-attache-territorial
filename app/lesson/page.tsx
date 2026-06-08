import { redirect } from "next/navigation";
import {
  getLesson,
  getQuestionsPool,
  getDueCards,
} from "@/db/queries";
import { QuizPlayer, type QuizQuestion } from "./quiz-player";
import { ResumeQuiz } from "./resume-quiz";

// Mélange (Fisher-Yates) — copie sans muter l'entrée.
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toQuizQuestion(ch: {
  id: number;
  question: string;
  sourceChunk: string;
  sourceSection: string | null;
  sourceSectionId: string | null;
  explanation: string;
  challengeOptions: { id: number; text: string; correct: boolean }[];
}, sousThemeTitle?: string): QuizQuestion {
  // Les options sont seedées avec la bonne réponse en premier : sans mélange,
  // la bonne réponse tomberait toujours en position A. On mélange à l'affichage
  // et on recalcule l'index de la bonne option après coup.
  const opts = shuffle(ch.challengeOptions);
  return {
    id: ch.id,
    question: ch.question,
    options: opts.map((o) => o.text),
    correctIndex: opts.findIndex((o) => o.correct),
    source: {
      pdf: sousThemeTitle ?? "Cours",
      section: ch.sourceSection ?? "",
      excerpt: ch.sourceChunk,
      sectionId: ch.sourceSectionId,
    },
  };
}

const LessonPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    lessonId?: string;
    sousThemeId?: string;
    sousThemeIds?: string;
    mode?: string;
    resume?: string;
  }>;
}) => {
  const { lessonId, sousThemeId, sousThemeIds, mode, resume } =
    await searchParams;

  // Reprise d'un quiz quitté en cours : l'état (questions, position, score) est
  // restauré depuis le localStorage, on court-circuite donc tout chargement.
  if (resume === "1") return <ResumeQuiz />;

  const isRevision = mode === "revision";

  // Accepte sousThemeIds (pluriel, depuis le dashboard) ou sousThemeId (singulier, depuis la page chapitre)
  const idsParam = sousThemeIds ?? sousThemeId;

  let questions: QuizQuestion[] = [];

  if (isRevision) {
    const rows = await getDueCards(20);
    if (!rows) redirect("/learn");
    questions = (rows ?? []).map((ch) => toQuizQuestion(ch));
  } else if (idsParam) {
    const ids = idsParam.split(",").map(Number).filter(Boolean);
    const rows = await getQuestionsPool(ids, 20);
    if (!rows) redirect("/learn");
    questions = (rows ?? []).map((ch) => toQuizQuestion(ch));
  } else {
    // Mode leçon : leçon spécifique ou leçon active
    const lesson = await getLesson(lessonId ? Number(lessonId) : undefined);
    if (!lesson) redirect("/learn");
    questions = lesson!.challenges.map((ch) =>
      toQuizQuestion(ch, lesson!.sousTheme?.title)
    );
  }

  if (questions.length === 0) redirect("/learn");

  return <QuizPlayer questions={questions} revision={isRevision} />;
};

export default LessonPage;
