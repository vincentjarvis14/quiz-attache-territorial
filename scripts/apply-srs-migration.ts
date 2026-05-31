// Migration SRS (Phase 1) — additive et idempotente.
// Applique UNIQUEMENT les ajouts de la répétition espacée, sans toucher au reste.
// (db:migrate est inutilisable : l'historique de migrations est désynchronisé de
//  la base live, construite via db:push.)
//
// Usage : npx tsx scripts/apply-srs-migration.ts

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("→ Création table user_question_srs (si absente)…");
  await sql`
    CREATE TABLE IF NOT EXISTS "user_question_srs" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "question_id" integer NOT NULL REFERENCES "challenges"("id") ON DELETE cascade,
      "box" integer DEFAULT 0 NOT NULL,
      "due_at" timestamp NOT NULL,
      "last_reviewed_at" timestamp DEFAULT now() NOT NULL,
      "lapses" integer DEFAULT 0 NOT NULL
    )
  `;

  console.log("→ Index unique (user_id, question_id)…");
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "uqs_user_question_unique"
    ON "user_question_srs" ("user_id", "question_id")
  `;

  console.log("→ Index (user_id, due_at)…");
  await sql`
    CREATE INDEX IF NOT EXISTS "uqs_user_due_idx"
    ON "user_question_srs" ("user_id", "due_at")
  `;

  console.log("→ Colonne user_progress.exam_date (si absente)…");
  await sql`
    ALTER TABLE "user_progress" ADD COLUMN IF NOT EXISTS "exam_date" timestamp
  `;

  // Vérifications
  const [{ exists }] = await sql`
    SELECT to_regclass('public.user_question_srs') IS NOT NULL AS exists
  `;
  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'exam_date'
  `;

  console.log("");
  console.log("✓ user_question_srs présente :", exists);
  console.log("✓ user_progress.exam_date présente :", cols.length === 1);
  console.log("Migration SRS appliquée.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗ Échec migration SRS :", e);
    process.exit(1);
  });
