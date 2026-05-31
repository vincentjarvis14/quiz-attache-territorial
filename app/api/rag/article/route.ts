import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/rag/article?ref=L151-1
 * Renvoie le texte de l'article du Code de l'urbanisme (lecture locale, sans LLM).
 * Normalise la référence ("L. 151-1", "article L151-1" → "L151-1").
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ref")?.trim();

  if (!raw) {
    return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
  }

  // Normalisation : retire "article", espaces, points, étoiles
  const m = raw.match(/(L|R|D|A)\.?\s*\*?\s*(\d+(?:[-–]\d+)*)/i);
  if (!m) {
    return NextResponse.json({ error: "Référence invalide" }, { status: 400 });
  }
  const ref = `${m[1].toUpperCase()}${m[2].replace(/–/g, "-")}`;

  try {
    const rows = (await sql`
      SELECT article_ref, content, heading_path
      FROM legal_chunks
      WHERE article_ref = ${ref}
      ORDER BY chunk_index
      LIMIT 1
    `) as { article_ref: string; content: string; heading_path: string | null }[];

    if (rows.length === 0) {
      return NextResponse.json({ ref, found: false, content: null, headingPath: null });
    }

    return NextResponse.json({
      ref: rows[0].article_ref,
      found: true,
      content: rows[0].content,
      headingPath: rows[0].heading_path ?? null,
    });
  } catch (e) {
    console.error("[rag/article]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
