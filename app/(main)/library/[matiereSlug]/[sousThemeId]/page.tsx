import { notFound } from "next/navigation";

import { getSelfMastery, getSousThemeReading } from "@/db/queries";
import { AppHeader } from "@/app/(main)/learn/app-header";

import { ReadingClient } from "./reading-client";

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ matiereSlug: string; sousThemeId: string }>;
}) {
  const { matiereSlug, sousThemeId } = await params;
  const id = Number(sousThemeId);
  if (!Number.isFinite(id)) notFound();

  const data = await getSousThemeReading(id);
  if (!data || data.theme.slug !== matiereSlug) notFound();

  const selfMastery = await getSelfMastery(id);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <ReadingClient
        matiereSlug={matiereSlug}
        themeTitle={data.theme.title}
        sousTheme={data.sousTheme}
        sections={data.sections}
        keyArticles={data.keyArticles}
        prev={data.prev}
        next={data.next}
        questionCount={data.questionCount}
        selfMastery={selfMastery}
      />
    </div>
  );
}
