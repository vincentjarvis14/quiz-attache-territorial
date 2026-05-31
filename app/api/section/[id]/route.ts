import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { sections, sousThemes } from "@/db/schema";
import { matiereToSlug } from "@/db/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const section = await db.query.sections.findFirst({
    where: eq(sections.id, id),
    columns: {
      id: true,
      title: true,
      content: true,
      contentClean: true,
      sourcePdf: true,
    },
  });

  if (!section) {
    return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
  }

  // Blocs typés (titre/liste/paragraphe) si dispo, sinon fallback brut.
  // Les blocs « reference » (articles de loi) ne sont pas rendus par le drawer.
  const blocks = (
    section.contentClean && section.contentClean.length > 0
      ? section.contentClean
      : section.content
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((text) => ({ type: "paragraph" as const, text }))
  ).filter((b) => b.type !== "reference");

  // Lien vers la bibliothèque : sourcePdf → sous-thème → matière.
  let libraryHref: string | null = null;
  let sousThemeId: number | null = null;
  if (section.sourcePdf) {
    const sousTheme = await db.query.sousThemes.findFirst({
      where: eq(sousThemes.pdfFileName, `${section.sourcePdf}.pdf`),
      with: { theme: { columns: { matiere: true } } },
    });
    if (sousTheme) {
      sousThemeId = sousTheme.id;
      libraryHref = `/library/${matiereToSlug(sousTheme.theme.matiere)}/${sousTheme.id}#${section.id}`;
    }
  }

  return NextResponse.json({
    id: section.id,
    title: section.title,
    sourcePdf: section.sourcePdf,
    blocks,
    libraryHref,
    sousThemeId,
  });
}
