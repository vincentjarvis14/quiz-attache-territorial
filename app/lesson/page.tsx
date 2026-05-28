import { redirect } from "next/navigation";
import { getLesson } from "@/db/queries";
import { QuizPlayer, type QuizQuestion } from "./quiz-player";

const LessonPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string }>;
}) => {
  const { lessonId } = await searchParams;
  const lesson = await getLesson(lessonId ? Number(lessonId) : undefined);

  if (!lesson) {
    redirect("/learn");
  }

  const questions: QuizQuestion[] = lesson.challenges.map((ch) => {
    const opts = [...ch.challengeOptions].sort((a, b) => a.id - b.id);
    return {
      question: ch.question,
      options: opts.map((o) => o.text),
      correctIndex: opts.findIndex((o) => o.correct),
      source: {
        pdf: lesson.sousTheme?.title ?? "Cours",
        section: ch.sourceSection ?? "",
        excerpt: ch.sourceChunk,
      },
    };
  });

  if (questions.length === 0) {
    redirect("/learn");
  }

  return <QuizPlayer questions={questions} />;
};

export default LessonPage;
