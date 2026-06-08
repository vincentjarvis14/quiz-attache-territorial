import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { pipeline } from "@huggingface/transformers";
import * as fs from "fs";
import * as path from "path";

/**
 * embed-challenges.ts — Pré-calcule les embeddings sémantiques des questions
 * de quiz (table `challenges`) pour la recherche sémantique 100% locale.
 *
 * Le modèle (multilingual-e5-small) tourne en local sur cette machine : aucun
 * appel API facturé. Le résultat est un fichier statique servi au navigateur,
 * où la requête de l'utilisatrice est encodée puis comparée par cosinus.
 *
 * Usage : npx tsx scripts/embed-challenges.ts
 */

const MODEL = "Xenova/multilingual-e5-small";
const OUT_PATH = path.resolve("public/rag/challenge-embeddings.json");
const BATCH = 32;

const sql = neon(process.env.DATABASE_URL!);

type Row = {
  id: number;
  question: string;
  explanation: string;
  source_section_id: string | null;
  sous_theme_id: number;
  sous_theme_title: string;
  theme_title: string;
  matiere: string;
};

async function main() {
  console.log("→ Lecture des questions en base…");
  const rows = (await sql`
    SELECT c.id, c.question, c.explanation, c.source_section_id,
           st.id    AS sous_theme_id,
           st.title AS sous_theme_title,
           t.title  AS theme_title,
           t.matiere
    FROM challenges c
    JOIN lessons     l  ON l.id  = c.lesson_id
    JOIN sous_themes st ON st.id = l.sous_theme_id
    JOIN themes      t  ON t.id  = st.theme_id
    ORDER BY c.id
  `) as Row[];

  console.log(`  ${rows.length} questions trouvées.`);
  if (rows.length === 0) {
    console.error("Aucune question à indexer. Avez-vous seedé la base ?");
    process.exit(1);
  }

  console.log(`→ Chargement du modèle ${MODEL} (local)…`);
  const extractor = await pipeline("feature-extraction", MODEL);

  // e5 demande le préfixe "passage:" pour les documents indexés.
  const texts = rows.map(
    (r) => `passage: ${r.question}\n${r.explanation}`.slice(0, 1200)
  );

  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const output = await extractor(batch, { pooling: "mean", normalize: true });
    vectors.push(...(output.tolist() as number[][]));
    console.log(`  encodé ${Math.min(i + BATCH, texts.length)}/${texts.length}`);
  }

  const dim = vectors[0]?.length ?? 0;
  const items = rows.map((r, i) => ({
    id: r.id,
    question: r.question,
    explanation: r.explanation ?? "",
    sectionId: r.source_section_id,
    sousThemeId: r.sous_theme_id,
    sousTheme: r.sous_theme_title,
    theme: r.theme_title,
    matiere: r.matiere,
    // arrondi à 5 décimales : réduit la taille du fichier sans perte sensible
    vec: vectors[i].map((v) => Number(v.toFixed(5))),
  }));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({ model: MODEL, dim, count: items.length, items })
  );

  const sizeKb = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
  console.log(`✓ ${items.length} embeddings (${dim}d) écrits → ${OUT_PATH} (${sizeKb} Ko)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
