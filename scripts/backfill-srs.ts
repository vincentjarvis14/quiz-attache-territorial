// Backfill SRS (Phase 1) — amorce user_question_srs depuis l'historique user_answers.
// Pour chaque (utilisateur, question) déjà répondu, crée une carte d'après la
// DERNIÈRE réponse : correcte → boîte 1 (due +1 j), fausse → boîte 0 (due aujourd'hui).
// Idempotent : onConflictDoNothing ne touche pas les cartes déjà planifiées.
//
// Usage : npx tsx scripts/backfill-srs.ts

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../db/schema";
import { userAnswers, userProgress, userQuestionSrs } from "../db/schema";
import { reviewCard, DEFAULT_EXAM_DATE } from "../lib/srs";

// Connexion créée APRÈS le chargement de l'env (évite le hoisting de db/drizzle).
const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

async function main() {
  // Dernière réponse par (utilisateur, question).
  const rows = await db
    .select({
      userId: userAnswers.userId,
      questionId: userAnswers.questionId,
      lastCorrect: sql<boolean>`(array_agg(${userAnswers.correct} ORDER BY ${userAnswers.createdAt} DESC, ${userAnswers.id} DESC))[1]`,
    })
    .from(userAnswers)
    .groupBy(userAnswers.userId, userAnswers.questionId);

  console.log(`→ ${rows.length} couples (utilisateur, question) trouvés.`);
  if (rows.length === 0) {
    console.log("Rien à amorcer.");
    return;
  }

  // Date de concours par utilisateur (sinon défaut).
  const progs = await db
    .select({ userId: userProgress.userId, examDate: userProgress.examDate })
    .from(userProgress);
  const examMap = new Map(progs.map((p) => [p.userId, p.examDate]));

  const now = new Date();
  const values = rows.map((r) => {
    const exam = examMap.get(r.userId) ?? new Date(DEFAULT_EXAM_DATE);
    const next = reviewCard(null, r.lastCorrect === true, now, exam);
    return {
      userId: r.userId,
      questionId: r.questionId,
      box: next.box,
      dueAt: next.dueAt,
      lastReviewedAt: now,
      lapses: next.lapses,
    };
  });

  // Insertion par lots (onConflictDoNothing = ne réécrit pas l'existant).
  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < values.length; i += CHUNK) {
    const chunk = values.slice(i, i + CHUNK);
    await db.insert(userQuestionSrs).values(chunk).onConflictDoNothing({
      target: [userQuestionSrs.userId, userQuestionSrs.questionId],
    });
    inserted += chunk.length;
    console.log(`  …${inserted}/${values.length}`);
  }

  console.log("✓ Backfill terminé (cartes existantes préservées).");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗ Échec backfill :", e);
    process.exit(1);
  });
