import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { searchLegalChunks } from "../lib/rag";

/**
 * map-sections-to-law.ts — Pré-calcule, pour chaque section de cours
 * relevant de la matière « urbanisme », les articles du Code de l'urbanisme
 * les plus pertinents (via le RAG BM25). Alimente la table section_legal_refs.
 *
 * Usage : npx tsx scripts/map-sections-to-law.ts
 *
 * Idempotent : purge puis recalcule l'ensemble du mapping urbanisme.
 */

const sql = neon(process.env.DATABASE_URL!);

// Nombre d'articles rattachés par section
const TOP_K = 3;

async function main() {
  // ── DDL idempotent ────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS section_legal_refs (
      id SERIAL PRIMARY KEY,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      chunk_id INTEGER NOT NULL REFERENCES legal_chunks(id) ON DELETE CASCADE,
      article_ref TEXT,
      position INTEGER NOT NULL
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS section_legal_refs_section_idx
    ON section_legal_refs (section_id)
  `;
  console.log("✅ Table section_legal_refs prête");

  // ── Sections relevant de l'urbanisme ──────────────────────────
  // sections.source_pdf = nom du PDF sans extension = pdf_file_name du sous-thème.
  const rows = await sql`
    SELECT s.id, s.title, s.content, st.title AS chapter
    FROM sections s
    JOIN sous_themes st
      ON regexp_replace(st.pdf_file_name, '\\.pdf$', '') = s.source_pdf
    JOIN themes t ON t.id = st.theme_id
    WHERE t.matiere = 'urbanisme'
  ` as { id: string; title: string; content: string; chapter: string }[];

  console.log(`📚 ${rows.length} sections urbanisme à mapper`);

  // ── Purge du mapping existant pour ces sections ───────────────
  await sql`
    DELETE FROM section_legal_refs
    WHERE section_id IN (
      SELECT s.id FROM sections s
      JOIN sous_themes st
        ON regexp_replace(st.pdf_file_name, '\\.pdf$', '') = s.source_pdf
      JOIN themes t ON t.id = st.theme_id
      WHERE t.matiere = 'urbanisme'
    )
  `;

  let mapped = 0;
  let empty = 0;

  for (const sec of rows) {
    // Le titre du chapitre + le titre de section donnent le contexte ;
    // on enrichit d'un extrait du contenu pour affiner le rappel.
    const queryText = `${sec.chapter} ${sec.title} ${(sec.content ?? "").slice(0, 600)}`.trim();
    const found = await searchLegalChunks(queryText, TOP_K);

    if (found.length === 0) {
      empty++;
      continue;
    }

    let pos = 0;
    for (const c of found) {
      await sql`
        INSERT INTO section_legal_refs (section_id, chunk_id, article_ref, position)
        VALUES (${sec.id}, ${c.id}, ${c.articleRef}, ${pos})
      `;
      pos++;
    }
    mapped++;
    if (mapped % 25 === 0) {
      process.stdout.write(`\r   ⏳ ${mapped}/${rows.length} sections mappées…`);
    }
  }

  console.log(
    `\n✅ ${mapped} sections mappées, ${empty} sans article pertinent`
  );
  console.log("🎉 Mapping section → Code de l'urbanisme terminé");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
