import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, FileText } from "lucide-react";

import { getLibraryTheme, getSelfMasteryMap } from "@/db/queries";
import { AppHeader } from "@/app/(main)/learn/app-header";
import { MasteryControl } from "@/components/library/mastery";
import { SectionPreview } from "@/components/library/section-preview";
import { MASTERY_META } from "@/lib/mastery";
import { cn } from "@/lib/utils";

export default async function LibraryThemePage({
  params,
}: {
  params: Promise<{ matiereSlug: string }>;
}) {
  const { matiereSlug } = await params;
  const theme = await getLibraryTheme(matiereSlug);
  if (!theme) notFound();

  const masteryMap = await getSelfMasteryMap(theme.sousThemes.map((st) => st.id));

  const words = theme.title.split(" ");
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <main className="flex-1 px-6 pb-40 pt-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/library?theme=${matiereSlug}`}
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink/50 transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Bibliothèque
          </Link>

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-[3px] w-12 shrink-0 rounded-full bg-coral-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-coral-500">
                Chapitres
              </span>
            </div>
            <h1 className="font-display font-black leading-[0.88] tracking-tight text-ink text-[2.6rem] md:text-[4.5rem]">
              {head ? (
                <>
                  {head}
                  <br />
                  {tail}.
                </>
              ) : (
                <>{tail}.</>
              )}
            </h1>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {theme.sousThemes.map((st) => {
              const level = masteryMap.get(st.id) ?? null;
              const bar = level ? MASTERY_META[level].bar : null;
              return (
                <SectionPreview key={st.id} sections={st.sectionTitles} href={`/library/${theme.slug}/${st.id}`}>
                <article
                  className="group relative flex flex-col gap-4 rounded-2xl border border-ink/8 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/15 hover:shadow-[0_12px_40px_-8px_rgba(31,29,27,0.12)]"
                >
                  {bar && (
                    <span
                      className={cn(
                        "pointer-events-none absolute bottom-5 left-0 top-5 w-1.5 rounded-r-full",
                        bar,
                      )}
                    />
                  )}

                  <Link
                    href={`/library/${theme.slug}/${st.id}`}
                    aria-label={st.title}
                    className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-3xl font-black leading-none tracking-tight text-coral-500">
                      {String(st.order).padStart(2, "0")}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-semibold text-ink/55">
                      <Clock className="h-3 w-3" strokeWidth={2} />
                      {st.readingMinutes} min
                    </span>
                  </div>

                  <div className="font-display text-xl font-black leading-tight text-ink">
                    {st.title}
                  </div>
                  <div className="line-clamp-2 text-[13px] leading-relaxed text-ink/55">
                    {st.description}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ink/40">
                      <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                      {st.sectionCount} sections
                    </span>
                    <MasteryControl sousThemeId={st.id} initial={level} />
                  </div>
                </article>
                </SectionPreview>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
