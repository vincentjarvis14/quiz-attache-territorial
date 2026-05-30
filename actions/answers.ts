"use server";

import { auth } from "@/lib/auth";
import { saveUserAnswer } from "@/db/queries";

// Enregistre une réponse au quiz. Le userId vient de auth() côté serveur —
// jamais du client. En mode révision, on n'altère pas la maîtrise du sous-thème.
export async function recordAnswer({
  questionId,
  selectedAnswer,
  correct,
  revision = false,
}: {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
  revision?: boolean;
}) {
  const userId = await auth();
  if (!userId) return;

  await saveUserAnswer(
    userId,
    questionId,
    selectedAnswer,
    correct,
    undefined,
    !revision
  );
}
