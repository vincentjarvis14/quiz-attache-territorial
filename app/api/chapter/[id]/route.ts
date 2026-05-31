import { NextResponse } from "next/server";

import { getSousThemeReading } from "@/db/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sousThemeId = Number(id);
  if (!Number.isFinite(sousThemeId)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const data = await getSousThemeReading(sousThemeId);
  if (!data) {
    return NextResponse.json({ error: "Chapitre introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    title: data.sousTheme.title,
    sections: data.sections.map((s) => ({
      id: s.id,
      title: s.title,
      blocks: s.blocks.filter((b) => b.type !== "reference"),
    })),
  });
}
