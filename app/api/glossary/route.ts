import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { unstable_cache } from "next/cache";

const sql = neon(process.env.DATABASE_URL!);

const searchGlossary = unstable_cache(
  async (term: string) => {
    const rows = await sql`
      SELECT
        id,
        title,
        source_pdf,
        page_start,
        ts_headline(
          'french',
          content,
          plainto_tsquery('french', ${term}),
          'MaxWords=40, MinWords=20, StartSel=<mark>, StopSel=</mark>, HighlightAll=false'
        ) AS snippet,
        ts_rank(to_tsvector('french', content), plainto_tsquery('french', ${term})) AS rank
      FROM sections
      WHERE to_tsvector('french', content) @@ plainto_tsquery('french', ${term})
      ORDER BY rank DESC
      LIMIT 5
    `;

    // Fallback ILIKE pour les acronymes (PLU, EPCI…) non reconnus par le stemmer
    if (rows.length === 0) {
      const fallback = await sql`
        SELECT
          id,
          title,
          source_pdf,
          page_start,
          content AS snippet
        FROM sections
        WHERE content ILIKE ${'%' + term + '%'}
        ORDER BY LENGTH(content)
        LIMIT 5
      `;
      return fallback.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        sourcePdf: r.source_pdf as string,
        pageStart: (r.page_start as number) ?? 1,
        snippet: (r.snippet as string).slice(0, 300) + "…",
      }));
    }

    return rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      sourcePdf: r.source_pdf as string,
      pageStart: (r.page_start as number) ?? 1,
      snippet: r.snippet as string,
    }));
  },
  ["glossary"],
  { revalidate: 3600 },
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term")?.trim();

  if (!term || term.length < 2) {
    return NextResponse.json({ error: "Terme invalide" }, { status: 400 });
  }

  try {
    const results = await searchGlossary(term);
    return NextResponse.json({ term, results });
  } catch (e) {
    console.error("[glossary]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
