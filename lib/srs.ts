// Répétition espacée (Leitner) — logique PURE, sans I/O, testable unitairement.
// Aucun appel base ni LLM : uniquement de l'arithmétique de dates.

// Échelle de boîtes : intervalle en jours avant la prochaine révision.
// Plafonnée à 30 j (concours dans ~3 mois → une carte maîtrisée repasse ~2-3×).
export const BOX_INTERVALS_DAYS = [0, 1, 2, 4, 8, 16, 30] as const;
export const MAX_BOX = BOX_INTERVALS_DAYS.length - 1; // 6

// Date du concours par défaut (réglable par utilisateur via user_progress.examDate).
export const DEFAULT_EXAM_DATE = "2026-09-15";

// Decay du statut de sous-thème (affichage uniquement).
export const DECAY_OVERDUE_THRESHOLD = 3; // nb de cartes en retard
export const DECAY_DAYS = 14; // jours sans révision

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

// Nouvelle boîte après une réponse : +1 si juste (plafond MAX_BOX), retour à 0 si faux.
export function nextBox(currentBox: number, correct: boolean): number {
  if (!correct) return 0;
  return Math.min(currentBox + 1, MAX_BOX);
}

// Prochaine date due, normalisée à minuit (granularité = jour), plafonnée à la
// veille du concours au plus tard. Jamais antérieure à aujourd'hui.
export function computeDueAt(box: number, now: Date, examDate: Date | null): Date {
  const idx = Math.max(0, Math.min(box, MAX_BOX));
  let due = startOfDay(addDays(now, BOX_INTERVALS_DAYS[idx]));

  if (examDate) {
    const cap = startOfDay(addDays(examDate, -1)); // au plus tard la veille
    const today = startOfDay(now);
    if (due > cap) due = cap;
    if (due < today) due = today;
  }
  return due;
}

export type SrsState = { box: number; dueAt: Date; lapses: number };

// État SRS après une réponse. prev = null pour une carte neuve.
export function reviewCard(
  prev: { box: number; lapses: number } | null,
  correct: boolean,
  now: Date,
  examDate: Date | null
): SrsState {
  const currentBox = prev?.box ?? 0;
  const box = nextBox(currentBox, correct);
  const lapses = (prev?.lapses ?? 0) + (correct ? 0 : 1);
  return { box, dueAt: computeDueAt(box, now, examDate), lapses };
}

// Decay (affichage) : un sous-thème "mastered" repasse "à revoir" s'il a trop de
// cartes en retard ou s'il n'a pas été revu depuis longtemps.
export function isSousThemeDecayed(
  overdueCount: number,
  lastReviewedAt: Date | null,
  now: Date
): boolean {
  if (overdueCount >= DECAY_OVERDUE_THRESHOLD) return true;
  if (lastReviewedAt && diffInDays(now, lastReviewedAt) >= DECAY_DAYS) return true;
  return false;
}
