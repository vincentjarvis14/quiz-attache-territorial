import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
// pdf-parse n'a pas de types officiels
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

/**
 * seed-code-urbanisme.ts — Parse et indexe le Code de l'urbanisme (LEGITEXT000006074075.pdf)
 * dans la table `legal_chunks` pour alimenter le RAG BM25.
 *
 * Usage : npx tsx scripts/seed-code-urbanisme.ts
 *         npx tsx scripts/seed-code-urbanisme.ts --wipe  # repart de zéro
 */

const sql = neon(process.env.DATABASE_URL!);

const PDF_PATH = path.resolve(
  "Source RAG/LEGITEXT000006074075.pdf"
);

// Regex pour découper le texte par article
const ARTICLE_SPLIT_RE =
  /(?=(?:^|\n)(?:Article\s+)?(?:L|R|D|A)\.?\s*\*?\s*\d+(?:[-]\d+)*)/gm;

// Taille minimale d'un chunk (caractères) — les chunks plus courts sont fusionnés
const MIN_CHUNK_SIZE = 200;
// Taille maximale d'un chunk
const MAX_CHUNK_SIZE = 3000;

type Chunk = {
  articleRef: string | null;
  title: string | null;
  headingPath: string | null;
  content: string;
  chunkIndex: number;
};

/**
 * Parcourt le texte normalisé et construit, pour chaque référence d'article,
 * son fil d'Ariane hiérarchique (Titre › Chapitre › Section › …).
 * Les niveaux génériques (Partie/Livre) sont volontairement omis : on garde
 * les intitulés thématiques qui « nomment » l'article.
 */
function buildHeadingMap(normalized: string): Map<string, string> {
  const map = new Map<string, string>();
  const levels = { titre: "", chapitre: "", section: "", sousSection: "" };

  // Intitulé après le " : " du heading. Le texte des codes étant toujours
  // sous la forme « Titre V : Plan local d'urbanisme », on coupe au colon
  // (robuste aux numéros romains, « Ier », « préliminaire »…).
  const HEADING_RE =
    /^(Titre|Chapitre|Section|Sous-section|Paragraphe)\b[^:\n]*:\s*(.*)$/i;

  const isHeading = (l: string) => HEADING_RE.test(l);
  const isArticle = (l: string) => extractArticleRef(l) !== null;
  const clean = (s: string) => s.replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();

  const lines = normalized.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const m = line.match(HEADING_RE);
    if (m) {
      const kind = m[1].toLowerCase();
      // Fusionne les lignes de continuation (titre coupé par le PDF) :
      // tant que la suite n'est ni vide, ni un article, ni un autre heading.
      let label = m[2];
      let j = i + 1;
      while (
        j < lines.length &&
        lines[j].trim() &&
        !isArticle(lines[j].trim()) &&
        !isHeading(lines[j].trim()) &&
        label.length < 120
      ) {
        label += " " + lines[j].trim();
        j++;
      }
      i = j - 1;
      label = clean(label);

      if (kind === "titre") {
        levels.titre = label;
        levels.chapitre = levels.section = levels.sousSection = "";
      } else if (kind === "chapitre") {
        levels.chapitre = label;
        levels.section = levels.sousSection = "";
      } else if (kind === "section") {
        levels.section = label;
        levels.sousSection = "";
      } else if (kind === "sous-section") {
        levels.sousSection = label;
      }
      continue;
    }

    const ref = extractArticleRef(line);
    if (ref && !map.has(ref)) {
      const path = [
        levels.titre,
        levels.chapitre,
        levels.section,
        levels.sousSection,
      ]
        .filter(Boolean)
        .join(" › ");
      if (path) map.set(ref, path);
    }
  }
  return map;
}

function normalizeText(text: string): string {
  return text
    .replace(/ﬀ/g, "ff")
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl")
    .replace(/ﬃ/g, "ffi")
    .replace(/ﬄ/g, "ffl")
    .replace(/ /g, " ")
    .replace(/­/g, "") // soft hyphen
    .replace(/(\w)-\n(\w)/g, "$1$2") // césure
    // Bruit Légifrance : "Code de l'urbanisme - Dernière modification le … - Document généré le …"
    .replace(
      /Code de l['’]urbanisme\s*-\s*Dernière modification le[^-]*-\s*Document généré le[^\n]*/gi,
      " "
    )
    .replace(/[ \t]{2,}/g, " ") // espaces multiples laissés par le retrait
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractArticleRef(line: string): string | null {
  const m = line.match(
    /(?:Article\s+)?(L|R|D|A)\.?\s*\*?\s*(\d+(?:[-]\d+)*)/i
  );
  if (!m) return null;
  return `${m[1]}${m[2]}`;
}

function chunkText(rawText: string): Chunk[] {
  const normalized = normalizeText(rawText);
  const parts = normalized.split(ARTICLE_SPLIT_RE).filter((p) => p.trim());

  const chunks: Chunk[] = [];
  let buffer = "";
  let bufferRef: string | null = null;
  let index = 0;

  const flush = () => {
    if (buffer.trim().length >= MIN_CHUNK_SIZE) {
      const firstLine = buffer.trim().split("\n")[0];
      chunks.push({
        articleRef: bufferRef,
        title: firstLine.slice(0, 120) || null,
        headingPath: null,
        content: buffer.trim(),
        chunkIndex: index++,
      });
    }
    buffer = "";
    bufferRef = null;
  };

  for (const part of parts) {
    const ref = extractArticleRef(part.trim().split("\n")[0]);

    // Si le chunk est trop long, on le subdivise par paragraphe
    if (part.length > MAX_CHUNK_SIZE) {
      flush();
      // Réf de l'article portée par TOUS les sous-chunks (sinon ref=null)
      const partRef = ref;

      const pushSub = (raw: string) => {
        const txt = raw.trim();
        if (txt.length < MIN_CHUNK_SIZE) return;
        // Coupe dure si un paragraphe seul dépasse encore la borne max
        for (let off = 0; off < txt.length; off += MAX_CHUNK_SIZE) {
          const piece = txt.slice(off, off + MAX_CHUNK_SIZE).trim();
          if (piece.length < MIN_CHUNK_SIZE && off > 0) continue;
          chunks.push({
            articleRef: partRef,
            title: piece.split("\n")[0].slice(0, 120) || null,
            headingPath: null,
            content: piece,
            chunkIndex: index++,
          });
        }
      };

      const paragraphs = part.split(/\n{2,}/);
      let sub = "";
      for (const para of paragraphs) {
        if ((sub + para).length > MAX_CHUNK_SIZE && sub.length >= MIN_CHUNK_SIZE) {
          pushSub(sub);
          sub = para + "\n\n";
        } else {
          sub += para + "\n\n";
        }
      }
      pushSub(sub);
      continue;
    }

    // Fusion des petits chunks consécutifs
    if (buffer.length + part.length < MIN_CHUNK_SIZE * 2) {
      if (!bufferRef) bufferRef = ref;
      buffer += part + "\n\n";
    } else {
      flush();
      bufferRef = ref;
      buffer = part + "\n\n";
    }
  }
  flush();

  // Attache le fil d'Ariane à chaque chunk via sa référence d'article.
  const headingMap = buildHeadingMap(normalized);
  for (const c of chunks) {
    c.headingPath = c.articleRef ? headingMap.get(c.articleRef) ?? null : null;
  }

  return chunks;
}

async function main() {
  const wipe = process.argv.includes("--wipe");

  // ── DDL (idempotent) ──────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS legal_chunks (
      id SERIAL PRIMARY KEY,
      source_doc TEXT NOT NULL DEFAULT 'code_urbanisme',
      article_ref TEXT,
      title TEXT,
      heading_path TEXT,
      content TEXT NOT NULL,
      page_number INTEGER,
      chunk_index INTEGER
    )
  `;
  // Ajout idempotent de la colonne pour les bases déjà créées
  await sql`ALTER TABLE legal_chunks ADD COLUMN IF NOT EXISTS heading_path TEXT`;
  await sql`
    CREATE INDEX IF NOT EXISTS legal_chunks_tsv_idx
    ON legal_chunks USING GIN (to_tsvector('french', content))
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS legal_chunks_article_ref_idx
    ON legal_chunks (article_ref)
  `;
  console.log("✅ Table legal_chunks prête");

  if (wipe) {
    await sql`DELETE FROM legal_chunks WHERE source_doc = 'code_urbanisme'`;
    console.log("🗑️  Chunks précédents supprimés");
  }

  // ── Parse du PDF ──────────────────────────────────────────────
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF introuvable : ${PDF_PATH}`);
    process.exit(1);
  }

  console.log(`📄 Lecture de ${PDF_PATH}…`);
  const buffer = fs.readFileSync(PDF_PATH);
  const parsed = await pdfParse(buffer);
  console.log(`   → ${parsed.numpages} pages, ${parsed.text.length} caractères extraits`);

  // ── Chunking ──────────────────────────────────────────────────
  const chunks = chunkText(parsed.text);
  console.log(`✂️  ${chunks.length} chunks générés`);

  // ── Seed ─────────────────────────────────────────────────────
  let inserted = 0;
  const BATCH = 50;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    for (const chunk of batch) {
      await sql`
        INSERT INTO legal_chunks (source_doc, article_ref, title, heading_path, content, chunk_index)
        VALUES (
          'code_urbanisme',
          ${chunk.articleRef},
          ${chunk.title},
          ${chunk.headingPath},
          ${chunk.content},
          ${chunk.chunkIndex}
        )
      `;
      inserted++;
    }
    process.stdout.write(`\r   ⏳ ${inserted}/${chunks.length} chunks insérés…`);
  }

  console.log(`\n✅ ${inserted} chunks insérés dans legal_chunks`);
  console.log("\n🎉 Code de l'urbanisme indexé — RAG BM25 prêt");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
