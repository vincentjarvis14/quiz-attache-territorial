import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as schema from "@/db/schema";

/**
 * seed-opus.ts — Charge les questions rédigées par Opus (validées) dans la base.
 *
 * Pipeline propre : data/generated_*.json → base Neon (lessons → challenges → options).
 *
 * Usage:
 *   npx tsx scripts/seed-opus.ts --all             # charge tous les generated_*.json
 *   npx tsx scripts/seed-opus.ts --wipe --all      # vide lessons/challenges puis charge tout
 *   npx tsx scripts/seed-opus.ts --questions data/generated_urbanisme.json
 */

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const BLOOM_DIFFICULTY: Record<string, number> = {
  rappel: 1,
  comprehension: 2,
  application: 3,
};

const LESSON_SIZE = 8;

type GenQuestion = {
  bloom: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
  id: string;
  sectionTitle: string;
  sourceText: string;
  sectionId: string;
};

function arg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : "true";
}

async function main() {
  const wipe = process.argv.includes("--wipe");
  const all = process.argv.includes("--all");

  let questions: GenQuestion[];

  if (all) {
    const dataDir = path.resolve("data");
    const files = fs
      .readdirSync(dataDir)
      .filter((f) => f.startsWith("generated_") && f.endsWith(".json") && f !== "generated_urbanisme.json")
      .sort()
      .map((f) => path.join(dataDir, f));
    console.log(`📚 Chargement de ${files.length} fichiers…`);
    questions = files.flatMap((f: string) => {
      const raw = JSON.parse(fs.readFileSync(f, "utf-8"));
      const qs: GenQuestion[] = raw.questions ?? raw;
      console.log(`   ${path.basename(f)}: ${qs.length} questions`);
      return qs;
    });
    console.log(`📄 ${questions.length} questions au total`);
  } else {
    const qPath = arg("questions", "data/generated_urbanisme.json")!;
    const raw = JSON.parse(fs.readFileSync(path.resolve(qPath), "utf-8"));
    questions = raw.questions ?? raw;
    console.log(`📄 ${questions.length} questions chargées depuis ${qPath}`);
  }

  // ── Nettoyage optionnel ──────────────────────────────────────────
  if (wipe) {
    // Supprime tout le contenu (les lessons cascadent vers challenges/options)
    await sql`DELETE FROM lessons`;
    console.log("🧹 Contenu existant vidé (lessons + challenges + options)");
    // Supprime le sous-thème Carte communale (PDF retiré du projet)
    const del = await sql`DELETE FROM sous_themes WHERE pdf_file_name = '97-carte-communale.pdf' RETURNING id`;
    if (del.length) console.log(`🗑️  Sous-thème Carte communale supprimé (id ${del[0].id})`);
  }

  // ── Mapping pdf → sousThemeId ────────────────────────────────────
  const sousThemesList = await db.select().from(schema.sousThemes);
  const byPdf = new Map(sousThemesList.map((st) => [st.pdfFileName, st]));

  // ── Regroupement par PDF ─────────────────────────────────────────
  const groups = new Map<string, GenQuestion[]>();
  for (const q of questions) {
    const prefix = q.sectionId.split("__")[0]; // ex: 100-loi-littoral
    groups.get(prefix)?.push(q) ?? groups.set(prefix, [q]);
  }

  let totalCh = 0;
  for (const [prefix, qs] of groups) {
    const pdfName = `${prefix}.pdf`;
    const st = byPdf.get(pdfName);
    if (!st) {
      console.warn(`⚠️  Sous-thème introuvable pour ${pdfName} — ${qs.length} questions ignorées`);
      continue;
    }

    // Leçon de départ : suite après les leçons existantes du sous-thème
    const existing = await db.select().from(schema.lessons).where(eq(schema.lessons.sousThemeId, st.id));
    let lessonOrder = existing.length;

    for (let i = 0; i < qs.length; i += LESSON_SIZE) {
      const slice = qs.slice(i, i + LESSON_SIZE);
      lessonOrder += 1;
      const [lesson] = await db
        .insert(schema.lessons)
        .values({ title: `Leçon ${lessonOrder}`, sousThemeId: st.id, order: lessonOrder })
        .returning();

      let chOrder = 0;
      for (const q of slice) {
        chOrder += 1;
        const [ch] = await db
          .insert(schema.challenges)
          .values({
            lessonId: lesson.id,
            type: "SELECT",
            question: q.q,
            order: chOrder,
            explanation: q.explanation,
            sourceChunk: q.sourceText,
            sourceSection: q.sectionTitle,
            difficulty: BLOOM_DIFFICULTY[q.bloom] ?? 2,
          })
          .returning();

        await db.insert(schema.challengeOptions).values(
          q.options.map((text, idx) => ({
            challengeId: ch.id,
            text,
            correct: idx === q.answer,
          }))
        );
        totalCh += 1;
      }
    }
    console.log(`✅ ${st.title}: +${qs.length} questions`);
  }

  console.log(`\n🎉 Seed terminé : ${totalCh} questions insérées`);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
