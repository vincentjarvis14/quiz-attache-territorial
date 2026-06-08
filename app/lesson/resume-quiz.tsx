"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizPlayer } from "./quiz-player";
import { loadQuizSession, type SavedQuizSession } from "@/lib/quiz-session";

// Reprend le quiz sauvegardé en localStorage. Rendu côté client car la page
// serveur n'a pas accès au localStorage. Si aucune session n'existe (déjà
// terminée, autre appareil…), on renvoie vers /learn.
export function ResumeQuiz() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedQuizSession | null>(null);

  useEffect(() => {
    const session = loadQuizSession();
    if (!session) {
      router.replace("/learn");
      return;
    }
    setSaved(session);
  }, [router]);

  if (!saved) return null;

  return (
    <QuizPlayer
      questions={saved.questions}
      revision={saved.revision}
      initial={saved}
    />
  );
}
