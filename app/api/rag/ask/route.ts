import { NextResponse } from "next/server";
import { searchLegalChunks } from "@/lib/rag";

export async function POST(req: Request) {
  let query: string;

  try {
    const body = await req.json();
    query = body.query?.trim();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!query || query.length < 3) {
    return NextResponse.json({ error: "Requête trop courte" }, { status: 400 });
  }

  try {
    const found = await searchLegalChunks(query, 3);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        const send = (obj: unknown) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        const sources = found
          .filter((c) => c.articleRef)
          .map((c) => c.articleRef as string);

        send({ type: "sources", sources });

        if (found.length === 0) {
          send({
            type: "delta",
            text: "Je n'ai trouvé aucun article pertinent dans le Code de l'urbanisme pour cette question.",
          });
          send({ type: "done" });
          controller.close();
          return;
        }

        // Réponse construite uniquement à partir des extraits locaux
        const text = found
          .map((c) => {
            const header = c.articleRef
              ? `Article ${c.articleRef}`
              : c.title ?? "Extrait";
            return `${header}\n${c.content.slice(0, 800).trim()}`;
          })
          .join("\n\n———\n\n");

        send({ type: "delta", text });
        send({ type: "done" });
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("[rag/ask]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
