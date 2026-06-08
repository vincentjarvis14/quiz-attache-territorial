import type { QuizQuestion } from "@/app/lesson/quiz-player";

// Sauvegarde locale du quiz en cours : permet de quitter puis « reprendre
// exactement le quiz qui était en cours ». On stocke les questions elles-mêmes
// (déjà mélangées) pour restituer le même lot dans le même ordre, sans dépendre
// d'un rechargement serveur qui re-tirerait des questions différentes.
export type SavedQuizSession = {
  questions: QuizQuestion[];
  revision: boolean;
  activeIdx: number;
  selectedIdx?: number;
  status: "none" | "correct" | "wrong";
  correctCount: number;
  streak: number;
  savedAt: number;
};

const KEY = "quiz-in-progress";

export function saveQuizSession(session: SavedQuizSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // localStorage indisponible (mode privé, quota) — on ignore silencieusement.
  }
}

export function loadQuizSession(): SavedQuizSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SavedQuizSession;
    if (!session?.questions?.length) return null;
    return session;
  } catch {
    return null;
  }
}

export function clearQuizSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // idem
  }
}
