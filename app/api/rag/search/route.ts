import { NextResponse } from "next/server";
import { searchLegalChunks } from "@/lib/rag";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Requête trop courte" }, { status: 400 });
  }

  try {
    const chunks = await searchLegalChunks(q, 5);
    return NextResponse.json({
      query: q,
      results: chunks.map((c) => ({
        id: c.id,
        articleRef: c.articleRef,
        title: c.title,
        snippet: c.snippet,
        rank: c.rank,
      })),
    });
  } catch (e) {
    console.error("[rag/search]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
