import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import { cleanToBlocks } from "@/lib/clean-section";

/**
 * seed-sections.ts — Charge le texte intégral des sections (source des extraits)
 * et relie chaque challenge à sa section d'origine.
 *
 * 1. Crée la table `sections` + la colonne `challenges.source_section_id`
 * 2. Seed les sections depuis data/sections_*.json
 * 3. Backfill challenges.source_section_id via le texte de la question → sectionId
 *
 * Usage : npx tsx scripts/seed-sections.ts
 */

const sql = neon(process.env.DATABASE_URL!);

type Section = { id: string; title: string; content: string; source_pdf?: string };

async function main() {
  // ── 1. DDL (idempotent) ──────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source_pdf TEXT
    )
  `;
  await sql`ALTER TABLE sections ADD COLUMN IF NOT EXISTS content_clean JSONB`;
  await sql`
    ALTER TABLE challenges
    ADD COLUMN IF NOT EXISTS source_section_id TEXT REFERENCES sections(id) ON DELETE SET NULL
  `;
  console.log("✅ Schéma à jour (table sections + content_clean + source_section_id)");

  // ── 2. Seed des sections ─────────────────────────────────────────
  const dataDir = path.resolve("data");
  const sectionFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.startsWith("sections_") && f.endsWith(".json"));

  const sections = new Map<string, Section>();
  for (const f of sectionFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf-8"));
    for (const s of Object.values(raw.sections) as Section[]) {
      sections.set(s.id, s);
    }
  }
  console.log(`📚 ${sections.size} sections à insérer (${sectionFiles.length} fichiers)`);

  for (const s of sections.values()) {
    const clean = cleanToBlocks(s.content, { title: s.title });
    await sql`
      INSERT INTO sections (id, title, content, content_clean, source_pdf)
      VALUES (${s.id}, ${s.title}, ${s.content}, ${JSON.stringify(clean)}, ${s.source_pdf ?? null})
      ON CONFLICT (id) DO UPDATE
        SET title = EXCLUDED.title,
            content = EXCLUDED.content,
            content_clean = EXCLUDED.content_clean,
            source_pdf = EXCLUDED.source_pdf
    `;
  }
  console.log("✅ Sections insérées (avec content_clean)");

  // ── 3. Backfill challenges.source_section_id ─────────────────────
  // Clé fiable : texte de la question → sectionId (depuis les generated_*.json)
  const genFiles = fs
    .readdirSync(dataDir)
    .filter((f) => f.startsWith("generated_") && f.endsWith(".json"));

  const questionToSection = new Map<string, string>();
  for (const f of genFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf-8"));
    const qs = raw.questions ?? raw;
    for (const q of qs) questionToSection.set(q.q, q.sectionId);
  }

  const challenges = await sql`SELECT id, question FROM challenges`;
  let updated = 0;
  let missing = 0;
  for (const ch of challenges) {
    const sectionId = questionToSection.get(ch.question);
    if (!sectionId || !sections.has(sectionId)) {
      missing++;
      continue;
    }
    await sql`UPDATE challenges SET source_section_id = ${sectionId} WHERE id = ${ch.id}`;
    updated++;
  }
  console.log(`🔗 Backfill : ${updated} challenges reliés, ${missing} sans section`);

  console.log("\n🎉 Terminé");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
