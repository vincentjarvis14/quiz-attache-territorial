import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type LegalChunk = {
  id: number;
  articleRef: string | null;
  title: string | null;
  content: string;
  snippet?: string;
  rank?: number;
};

/**
 * Construit une tsquery OR à partir d'une requête en langage naturel.
 * "plan local urbanisme PLU" → "plan | local | urbanisme | plu"
 * Permet le rappel quand plainto_tsquery (logique AND) échoue.
 */
function buildOrTsQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3)
    .map((t) => t.replace(/'/g, "''"))
    .join(" | ");
}

/**
 * Recherche BM25 dans le Code de l'urbanisme.
 * Cascade : plainto_tsquery (précis, AND) → to_tsquery OR (rappel) → ILIKE (refs).
 */
export async function searchLegalChunks(
  query: string,
  limit = 5
): Promise<LegalChunk[]> {
  // ── Niveau 1 : plainto_tsquery (tous les termes, le plus précis) ──
  const exact = await sql`
    SELECT id, article_ref, title, content,
      ts_headline('french', content, plainto_tsquery('french', ${query}),
        'MaxWords=60, MinWords=30, StartSel=<mark>, StopSel=</mark>, HighlightAll=false') AS snippet,
      ts_rank(to_tsvector('french', content), plainto_tsquery('french', ${query})) AS rank
    FROM legal_chunks
    WHERE to_tsvector('french', content) @@ plainto_tsquery('french', ${query})
    ORDER BY rank DESC
    LIMIT ${limit}
  `;
  if (exact.length > 0) return exact.map(mapRow);

  // ── Niveau 2 : to_tsquery OR (au moins un terme) ──
  const orQuery = buildOrTsQuery(query);
  if (orQuery) {
    const loose = await sql`
      SELECT id, article_ref, title, content,
        ts_headline('french', content, to_tsquery('french', ${orQuery}),
          'MaxWords=60, MinWords=30, StartSel=<mark>, StopSel=</mark>, HighlightAll=false') AS snippet,
        ts_rank(to_tsvector('french', content), to_tsquery('french', ${orQuery})) AS rank
      FROM legal_chunks
      WHERE to_tsvector('french', content) @@ to_tsquery('french', ${orQuery})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;
    if (loose.length > 0) return loose.map(mapRow);
  }

  // ── Niveau 3 : ILIKE (références d'articles, acronymes) ──
  const ilike = await sql`
    SELECT id, article_ref, title, content,
      LEFT(content, 400) AS snippet
    FROM legal_chunks
    WHERE content ILIKE ${"%" + query + "%"}
       OR article_ref ILIKE ${"%" + query + "%"}
    ORDER BY LENGTH(content)
    LIMIT ${limit}
  `;
  return ilike.map((r) => ({ ...mapRow(r), snippet: (r.snippet as string) + "…" }));
}

function mapRow(r: Record<string, unknown>): LegalChunk {
  return {
    id: r.id as number,
    articleRef: (r.article_ref as string) ?? null,
    title: (r.title as string) ?? null,
    content: (r.content as string) ?? "",
    snippet: r.snippet as string | undefined,
    rank: r.rank as number | undefined,
  };
}
