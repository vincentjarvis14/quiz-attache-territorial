import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookOpen, Clock, FileText } from "lucide-react";

import { getLibraryCatalog, getLibraryTheme } from "@/db/queries";
import { AppHeader } from "@/app/(main)/learn/app-header";
import { ThemeToggle } from "./theme-toggle";
import { SectionPreview } from "@/components/library/section-preview";

export const metadata: Metadata = {
  title: "Bibliothèque · Quiz Territorial",
};

type Props = {
  searchParams: Promise<{ theme?: string }>;
};

const LibraryPage = async ({ searchParams }: Props) => {
  const { theme: themeParam } = await searchParams;

  const catalog = await getLibraryCatalog();
  const defaultSlug = catalog[0]?.slug ?? "";
  const activeSlug = catalog.some((t) => t.slug === themeParam)
    ? (themeParam as string)
    : defaultSlug;

  const theme = await getLibraryTheme(activeSlug);

  const words = theme?.title.split(" ") ?? [];
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1] ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <main className="flex-1 px-6 pb-40 pt-8">
        <div className="mx-auto max-w-5xl">
          {/* Toggle thème */}
          <div className="mb-8">
            <Suspense>
              <ThemeToggle themes={catalog} activeSlug={activeSlug} />
            </Suspense>
          </div>

          {/* Titre matière */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-[3px] w-12 shrink-0 rounded-full bg-coral-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-coral-500">
                Matière en cours
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

          {/* Grille chapitres */}
          {theme && (
            <div className="grid gap-5 md:grid-cols-2">
              {theme.sousThemes.map((st) => (
                <SectionPreview key={st.id} sections={st.sectionTitles} href={`/library/${activeSlug}/${st.id}`}>
                <Link
                  href={`/library/${activeSlug}/${st.id}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-ink/8 bg-white p-6 shadow-soft outline-none transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/15 hover:shadow-[0_12px_40px_-8px_rgba(31,29,27,0.12)] focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
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

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ink/40">
                      <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                      {st.sectionCount} sections
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink transition-colors group-hover:text-coral-500">
                      <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                      Lire
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
                </SectionPreview>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LibraryPage;
