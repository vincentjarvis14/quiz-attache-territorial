"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  List,
} from "lucide-react";

import type { LibrarySection, LegalRef } from "@/db/queries";
import type { Block } from "@/lib/clean-section";
import type { MasteryLevel } from "@/lib/mastery";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { pdfUrl } from "@/lib/pdf-url";
import { SectionContent } from "@/app/(main)/library/section-content";
import { MasteryPicker } from "@/components/library/mastery";
import { KeyArticles } from "@/components/library/key-articles";
import { AvatarBot } from "@/components/avatar-bot";

type Sibling = { id: number; title: string } | null;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Compte les mots d'un bloc typé pour estimer le temps de lecture.
function blockWords(b: Block): number {
  if (b.type === "list") return b.items.join(" ").split(/\s+/).filter(Boolean).length;
  if (b.type === "reference") return b.articles.join(" ").split(/\s+/).filter(Boolean).length;
  return b.text.split(/\s+/).filter(Boolean).length;
}

export function ReadingClient({
  matiereSlug,
  themeTitle,
  sousTheme,
  sections,
  keyArticles,
  prev,
  next,
  questionCount,
  selfMastery,
}: {
  matiereSlug: string;
  themeTitle: string;
  sousTheme: { id: number; title: string; description: string; pdfSlug: string };
  sections: LibrarySection[];
  keyArticles: LegalRef[];
  prev: Sibling;
  next: Sibling;
  questionCount: number;
  selfMastery: MasteryLevel | null;
}) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const readingMinutes = useMemo(() => {
    const words = sections.reduce(
      (acc, sec) => acc + sec.blocks.reduce((a, b) => a + blockWords(b), 0),
      0,
    );
    return Math.max(1, Math.round(words / 200));
  }, [sections]);

  // Progression de lecture (barre supérieure).
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section active dans la TOC via IntersectionObserver.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    sectionRefs.current.get(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    setMobileTocOpen(false);
  };

  return (
    <>
      {/* Barre de progression de lecture */}
      <div
        className="fixed inset-x-0 top-14 z-40 h-[2px] bg-transparent"
        role="progressbar"
        aria-label="Progression de lecture"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-coral-500 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 px-6 pb-40 pt-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_260px]">
          {/* Colonne lecture */}
          <div className="min-w-0">
            <Link
              href={`/library/${matiereSlug}`}
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink/50 transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {themeTitle}
            </Link>

            <div className="mb-10">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-[3px] w-12 shrink-0 rounded-full bg-coral-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-coral-500">
                  Chapitre
                </span>
              </div>
              <h1 className="font-display font-black leading-[0.95] tracking-tight text-ink text-[2.2rem] md:text-[3.2rem]">
                {sousTheme.title}
              </h1>
              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-ink/55">
                {sousTheme.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink/40">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                  {readingMinutes} min de lecture
                </span>
                <span className="text-ink/20">·</span>
                <span>
                  {sections.length} section{sections.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {questionCount > 0 && (
                  <Link href={`/lesson?sousThemeIds=${sousTheme.id}&mode=free`}>
                    <Button variant="primary" size="default">
                      S'entraîner ({questionCount} questions)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <a
                  href={pdfUrl(sousTheme.pdfSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-ink/12 px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:bg-white hover:text-ink"
                >
                  <FileText className="h-4 w-4" strokeWidth={2} />
                  PDF source
                </a>
              </div>
            </div>

            {/* Articles-clés du chapitre (RAG urbanisme) */}
            <KeyArticles articles={keyArticles} />

            {/* Sommaire repliable (mobile / tablette) */}
            {sections.length > 1 && (
              <div className="mb-10 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileTocOpen((o) => !o)}
                  aria-expanded={mobileTocOpen}
                  className="flex w-full items-center justify-between rounded-xl border border-ink/8 bg-white px-4 py-3 text-left shadow-soft outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <List className="h-4 w-4 text-ink/50" strokeWidth={2} />
                    Sommaire · {sections.length} sections
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-ink/40 transition-transform",
                      mobileTocOpen && "rotate-180",
                    )}
                  />
                </button>
                {mobileTocOpen && (
                  <ul className="mt-2 space-y-0.5 rounded-xl border border-ink/8 bg-white p-2 shadow-soft">
                    {sections.map((sec) => (
                      <li key={sec.id}>
                        <button
                          type="button"
                          onClick={() => scrollTo(sec.id)}
                          className={cn(
                            "block w-full rounded-lg px-3 py-2 text-left text-[13px] leading-snug outline-none transition-colors focus-visible:ring-2 focus-visible:ring-coral-500",
                            activeId === sec.id
                              ? "bg-coral-50 font-semibold text-coral-700"
                              : "text-ink/65 hover:bg-cream",
                          )}
                        >
                          {sec.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Sections — flux de lecture continu (style drawer) */}
            {sections.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white/60 py-20 text-center backdrop-blur-[2px]">
                <BookOpen className="h-8 w-8 text-ink/25" strokeWidth={1.5} />
                <p className="text-sm font-medium text-ink/55">
                  Ce chapitre est en préparation.
                </p>
                <p className="max-w-xs text-[13px] text-ink/40">
                  Le contenu de lecture sera bientôt disponible. Vous pouvez déjà
                  consulter le PDF source.
                </p>
              </div>
            ) : (
              <article className="space-y-14 rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-ink/[0.06] md:px-14 md:py-16">
                {sections.map((sec, idx) => (
                  <section
                    key={sec.id}
                    id={sec.id}
                    ref={(el) => {
                      if (el) sectionRefs.current.set(sec.id, el);
                      else sectionRefs.current.delete(sec.id);
                    }}
                    className="scroll-mt-24 first:pt-0 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-ink/[0.07] [&:not(:first-child)]:pt-12"
                  >
                    <div className="mb-6 flex items-start gap-4">
                      {sections.length > 1 && (
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-500 font-mono text-[13px] font-black text-white">
                          {idx + 1}
                        </span>
                      )}
                      <h2 className="font-display text-[1.6rem] font-black leading-tight tracking-tight text-ink">
                        {sec.title}
                      </h2>
                    </div>
                    <SectionContent blocks={sec.blocks} />
                  </section>
                ))}
              </article>
            )}

            {/* Auto-évaluation du niveau de maîtrise */}
            {sections.length > 0 && (
              <MasteryPicker sousThemeId={sousTheme.id} initial={selfMastery} />
            )}

            {/* Rappel du CTA d'entraînement après la lecture */}
            {sections.length > 0 && questionCount > 0 && (
              <div className="mt-14 flex flex-col items-center gap-3 rounded-2xl border border-coral-100 bg-coral-50/60 px-6 py-8 text-center">
                <p className="font-display text-xl font-black leading-tight text-ink">
                  Prêt à vous tester sur ce chapitre ?
                </p>
                <Link href={`/lesson?sousThemeIds=${sousTheme.id}&mode=free`}>
                  <Button variant="primary" size="lg">
                    S'entraîner ({questionCount} questions)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Navigation chapitres précédent / suivant */}
            <nav className="mt-12 grid gap-4 border-t border-ink/8 pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/library/${matiereSlug}/${prev.id}`}
                  className="group flex flex-col gap-1 rounded-xl border border-ink/8 bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-ink/15"
                >
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                    <ChevronLeft className="h-3 w-3" />
                    Précédent
                  </span>
                  <span className="font-display font-black text-ink transition-colors group-hover:text-coral-500">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/library/${matiereSlug}/${next.id}`}
                  className="group flex flex-col gap-1 rounded-xl border border-ink/8 bg-white p-5 text-right shadow-soft transition-all hover:-translate-y-0.5 hover:border-ink/15 sm:items-end"
                >
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                    Suivant
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  <span className="font-display font-black text-ink transition-colors group-hover:text-coral-500">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </div>

          {/* TOC latérale (desktop) */}
          {sections.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col">
                <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                  <List className="h-3.5 w-3.5" strokeWidth={2} />
                  Sommaire
                </div>
                <ul className="no-scrollbar space-y-1 overflow-y-auto overscroll-contain border-l border-ink/8 pr-1">
                  {sections.map((sec) => (
                    <li key={sec.id}>
                      <button
                        type="button"
                        onClick={() => scrollTo(sec.id)}
                        aria-current={activeId === sec.id ? "true" : undefined}
                        className={cn(
                          "-ml-px block w-full border-l-2 py-1.5 pl-3 text-left text-[13px] leading-snug outline-none transition-colors rounded-r focus-visible:ring-2 focus-visible:ring-coral-500",
                          activeId === sec.id
                            ? "border-coral-500 font-semibold text-ink"
                            : "border-transparent text-ink/50 hover:text-ink",
                        )}
                      >
                        {sec.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Bot contextuel « Lex » — seulement sur les chapitres d'urbanisme */}
      {matiereSlug === "urbanisme" && (
        <AvatarBot
          questionContext={sousTheme.title}
          placeholder={`Une question sur « ${sousTheme.title} » ?`}
        />
      )}
    </>
  );
}
