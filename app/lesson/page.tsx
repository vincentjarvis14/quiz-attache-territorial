import { redirect } from "next/navigation";
import {
  getLesson,
  getQuestionsPool,
  getRevisionQuestions,
} from "@/db/queries";
import { QuizPlayer, type QuizQuestion } from "./quiz-player";

function toQuizQuestion(ch: {
  id: number;
  question: string;
  sourceChunk: string;
  sourceSection: string | null;
  sourceSectionId: string | null;
  explanation: string;
  challengeOptions: { id: number; text: string; correct: boolean }[];
}, sousThemeTitle?: string): QuizQuestion {
  const opts = [...ch.challengeOptions].sort((a, b) => a.id - b.id);
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
  }>;
}) => {
  const { lessonId, sousThemeId, sousThemeIds, mode } = await searchParams;
  const isRevision = mode === "revision";

  // Accepte sousThemeIds (pluriel, depuis le dashboard) ou sousThemeId (singulier, depuis la page chapitre)
  const idsParam = sousThemeIds ?? sousThemeId;

  let questions: QuizQuestion[] = [];

  if (isRevision) {
    const rows = await getRevisionQuestions(20);
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
