"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import confetti from "canvas-confetti";
import {
  X,
  Check,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  ChevronLeft,
  FileText,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GLOSSARY_TERMS, GLOSSARY_MAP } from "@/lib/glossary-terms";
import { getCategoryMeta } from "@/lib/category-icons";
import { recordAnswer } from "@/actions/answers";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppHeader } from "@/app/(main)/learn/app-header";

const PdfViewerModal = dynamic(
  () => import("@/components/pdf-viewer-modal").then((m) => m.PdfViewerModal),
  { ssr: false },
);

// Retrouve la position de l'extrait dans le contenu de section malgré les
// variantes d'apostrophes/guillemets, la casse et les espaces.
function normChar(c: string): string {
  if (/['’‘`]/.test(c)) return "'";
  if (/["“”«»]/.test(c)) return '"';
  return c.toLowerCase();
}

function findExcerptRange(
  content: string,
  excerpt: string,
): [number, number] | null {
  let norm = "";
  const map: number[] = [];
  let prevSpace = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (/\s/.test(c)) {
      if (!prevSpace) {
        norm += " ";
        map.push(i);
        prevSpace = true;
      }
      continue;
    }
    prevSpace = false;
    norm += normChar(c);
    map.push(i);
  }

  let nEx = "";
  let ps = false;
  for (const c of excerpt) {
    if (/\s/.test(c)) {
      if (!ps) {
        nEx += " ";
        ps = true;
      }
      continue;
    }
    ps = false;
    nEx += normChar(c);
  }
  nEx = nEx.trim();
  if (!nEx) return null;

  const idx = norm.indexOf(nEx);
  if (idx === -1) return null;
  return [map[idx], map[idx + nEx.length - 1] + 1];
}

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type SectionData = {
  id: string;
  title: string;
  blocks: Block[];
  sourcePdf: string | null;
  libraryHref: string | null;
  sousThemeId: number | null;
};

type ChapterData = {
  title: string;
  sections: { id: string; title: string; blocks: Block[] }[];
};

// Regex de détection des termes du glossaire (du plus long au plus court).
// Lookarounds Unicode pour exiger des limites de mots (évite "SPA" dans
// "espace", "CAP" dans "capacité"…). \b ne fonctionne pas avec les accents.
const GLOSSARY_RE = new RegExp(
  "(?<![\\p{L}\\p{N}])(" +
    [...GLOSSARY_TERMS]
      .sort((a, b) => b.length - a.length)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|") +
    ")(?![\\p{L}\\p{N}])",
  "giu",
);

type GlossaryResult = {
  id: string;
  title: string;
  sourcePdf: string;
  pageStart: number;
  snippet: string;
};

// Met en relief les montants (150 €) et références d'articles (article 131-3).
const EMPHASIS =
  /(\d[\d   ]*\s?€|articles?\s+[LRDlrd]?\.?\s?\d+(?:[-–]\d+)*)/g;

function emphasize(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(EMPHASIS);
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <strong key={`${keyBase}-${m.index}`} className="font-semibold text-ink">
        {m[0]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// Injecte les termes du glossaire cliquables dans un segment de texte déjà rendu.
function withGlossaryTerms(
  nodes: React.ReactNode[],
  rawText: string,
  onTermClick: ((term: string) => void) | undefined,
): React.ReactNode[] {
  if (!onTermClick) return nodes;
  // Re-split the raw text by glossary terms, then map back to nodes
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = new RegExp(GLOSSARY_RE.source, "giu");
  let m: RegExpExecArray | null;
  const spans: { start: number; end: number; match: string }[] = [];
  while ((m = re.exec(rawText)) !== null) {
    // m[1] = terme capturé (les lookarounds sont à largeur nulle)
    const matched = m[1];
    spans.push({ start: m.index, end: m.index + matched.length, match: matched });
  }
  if (spans.length === 0) return nodes;
  for (const span of spans) {
    if (span.start > last) parts.push(rawText.slice(last, span.start));
    const term = span.match;
    parts.push(
      <button
        key={`g-${span.start}`}
        type="button"
        onClick={() => onTermClick(term.toLowerCase())}
        className="cursor-pointer border-b border-dashed border-amber-500 text-amber-700 transition-colors hover:border-amber-700 hover:text-amber-900"
        title={`Chercher « ${term} » dans les documents`}
      >
        {term}
      </button>,
    );
    last = span.end;
  }
  if (last < rawText.length) parts.push(rawText.slice(last));
  return parts;
}

// Rend un texte avec l'extrait surligné + la mise en relief des chiffres-clés.
function renderText(
  text: string,
  excerpt: string,
  onTermClick?: (term: string) => void,
): React.ReactNode {
  const range = findExcerptRange(text, excerpt);
  if (!range) return <>{withGlossaryTerms(emphasize(text, "e"), text, onTermClick)}</>;
  const [s, e] = range;
  return (
    <>
      {withGlossaryTerms(emphasize(text.slice(0, s), "b"), text.slice(0, s), onTermClick)}
      <mark className="box-decoration-clone rounded bg-coral-100/80 px-1 py-0.5 font-medium text-ink">
        {text.slice(s, e)}
      </mark>
      {withGlossaryTerms(emphasize(text.slice(e), "a"), text.slice(e), onTermClick)}
    </>
  );
}

// Rend un bloc typé. Le bloc contenant l'extrait reçoit le traitement « source ».
function BlockView({
  block,
  excerpt,
  dropCap,
  isMark,
  blockRef,
  onTermClick,
}: {
  block: Block;
  excerpt: string;
  dropCap?: boolean;
  isMark?: boolean;
  blockRef?: React.Ref<HTMLElement>;
  onTermClick?: (term: string) => void;
}) {
  if (block.type === "heading") {
    return (
      <h3
        ref={blockRef as React.Ref<HTMLHeadingElement>}
        className="scroll-mt-28 pt-2 font-display text-lg font-black leading-tight tracking-tight text-ink"
      >
        {renderText(block.text, excerpt, onTermClick)}
      </h3>
    );
  }

  if (block.type === "list") {
    return (
      <ul
        ref={blockRef as React.Ref<HTMLUListElement>}
        className="scroll-mt-28 list-disc space-y-1.5 pl-6 marker:text-coral-400"
      >
        {block.items.map((it, i) => (
          <li key={i}>{renderText(it, excerpt, onTermClick)}</li>
        ))}
      </ul>
    );
  }

  const dropCapCls = dropCap
    ? "first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-black first-letter:leading-[0.78] first-letter:text-coral-600"
    : "";

  if (isMark) {
    return (
      <p
        ref={blockRef as React.Ref<HTMLParagraphElement>}
        className="-ml-1.5 scroll-mt-28 rounded-r-lg border-l-2 border-coral-500 bg-coral-50/50 py-3 pl-5 pr-3"
      >
        {renderText(block.text, excerpt, onTermClick)}
      </p>
    );
  }

  return (
    <p ref={blockRef as React.Ref<HTMLParagraphElement>} className={dropCapCls}>
      {renderText(block.text, excerpt, onTermClick)}
    </p>
  );
}

function SourceSkeleton() {
  const widths = ["w-full", "w-[94%]", "w-[88%]", "w-[72%]"];
  return (
    <div className="mx-auto max-w-[68ch] animate-pulse">
      <div className="mb-6 h-5 w-2/5 rounded-full bg-ink/[0.08]" />
      <div className="space-y-3.5">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className={cn("h-3 rounded-full bg-ink/[0.08]", widths[i % widths.length])}
          />
        ))}
      </div>
    </div>
  );
}

function SourceError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-20 text-center">
      <XCircle className="h-7 w-7 text-ink/30" strokeWidth={1.5} />
      <p className="text-sm text-ink/60">Source indisponible pour le moment.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-cream"
      >
        Réessayer
      </button>
    </div>
  );
}

function SourceDrawer({
  open,
  onOpenChange,
  loading,
  error,
  section,
  excerpt,
  fallbackTitle,
  fallbackPdf,
  onRetry,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  loading: boolean;
  error: boolean;
  section: SectionData | null;
  excerpt: string;
  fallbackTitle: string;
  fallbackPdf: string;
  onRetry: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  // État glossaire — réinitialisé à chaque fermeture du drawer
  const [glossaryTerm, setGlossaryTerm] = useState<string | null>(null);
  const [glossaryResults, setGlossaryResults] = useState<GlossaryResult[]>([]);
  const [glossaryLoading, setGlossaryLoading] = useState(false);

  // État viewer PDF
  const [pdfView, setPdfView] = useState<{
    slug: string;
    page: number;
    title: string;
    highlight: string | null;
  } | null>(null);

  // État panneau chapitre (lecture complète sans quitter le quiz)
  const [chapterOpen, setChapterOpen] = useState(false);
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState(false);
  const chapterScrollRef = useRef<HTMLDivElement>(null);
  const currentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setGlossaryTerm(null);
      setGlossaryResults([]);
      setPdfView(null);
      setChapterOpen(false);
      setChapter(null);
      setChapterError(false);
    }
  }, [open]);

  const openChapter = useCallback(async (sousThemeId: number) => {
    setChapterOpen(true);
    setChapter(null);
    setChapterError(false);
    setChapterLoading(true);
    try {
      const res = await fetch(`/api/chapter/${sousThemeId}`);
      if (!res.ok) throw new Error();
      setChapter((await res.json()) as ChapterData);
    } catch {
      setChapterError(true);
    } finally {
      setChapterLoading(false);
    }
  }, []);

  const closeChapter = useCallback(() => setChapterOpen(false), []);

  const openGlossary = useCallback(async (term: string) => {
    setGlossaryTerm(term);
    setGlossaryLoading(true);
    setGlossaryResults([]);
    try {
      const res = await fetch(`/api/glossary?term=${encodeURIComponent(term)}`);
      const data = await res.json();
      setGlossaryResults(data.results ?? []);
    } catch {
      setGlossaryResults([]);
    } finally {
      setGlossaryLoading(false);
    }
  }, []);

  const closeGlossary = useCallback(() => {
    setGlossaryTerm(null);
    setGlossaryResults([]);
  }, []);

  const blocks = useMemo(() => section?.blocks ?? [], [section]);
  const markIdx = useMemo(() => {
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const texts = b.type === "list" ? b.items : [b.text];
      if (texts.some((t) => findExcerptRange(t, excerpt))) return i;
    }
    return -1;
  }, [blocks, excerpt]);

  const isShort =
    blocks.length === 1 &&
    blocks[0].type === "paragraph" &&
    blocks[0].text.length < 280;

  // Défile jusqu'à l'extrait surligné dès que la section est chargée.
  useEffect(() => {
    if (!section || markIdx < 0) return;
    const t = setTimeout(() => {
      markRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 140);
    return () => clearTimeout(t);
  }, [section, markIdx]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
  };

  // Défile jusqu'à la section d'origine dès que le chapitre est chargé.
  useEffect(() => {
    if (!chapter || !currentSectionRef.current) return;
    const t = setTimeout(() => {
      currentSectionRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    }, 120);
    return () => clearTimeout(t);
  }, [chapter]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-xl flex-col gap-0 overflow-hidden bg-white p-0 sm:max-w-xl"
      >
        {/* Fond quadrillage type cahier (papier millimétré) */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundColor: "#f8fafc",
            backgroundImage: `
              linear-gradient(90deg, #cdd7e5 1px, transparent 1px),
              linear-gradient(180deg, #cdd7e5 1px, transparent 1px),
              linear-gradient(90deg, #e9eef5 1px, transparent 1px),
              linear-gradient(180deg, #e9eef5 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
          }}
        />

        {/* ── Panneau source ───────────────────────────────────────── */}
        <div
          className={cn(
            "absolute inset-0 z-10 flex flex-col transition-transform duration-300 ease-in-out",
            glossaryTerm || chapterOpen ? "-translate-x-full" : "translate-x-0",
          )}
        >
          <SheetHeader className="relative shrink-0 border-b border-ink/[0.06] bg-white/85 px-7 py-5 text-left backdrop-blur-sm">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-coral-500">
              Source originale
            </span>
            <SheetTitle className="pr-8 font-display text-xl font-black leading-tight tracking-tight text-ink">
              {section?.title ?? fallbackTitle}
            </SheetTitle>
            <div className="flex items-center gap-2.5">
              {(section?.sourcePdf || fallbackPdf) && (
                <span className="text-[11px] font-medium text-ink/45">
                  {section?.sourcePdf ?? fallbackPdf}
                </span>
              )}
              {isShort && (
                <span className="rounded-full bg-moss-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-moss-700">
                  Section complète
                </span>
              )}
            </div>
            {section?.sousThemeId != null && (
              <button
                type="button"
                onClick={() => openChapter(section.sousThemeId!)}
                className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-coral-600 transition-colors hover:text-coral-700"
              >
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                Lire le chapitre dans la bibliothèque
              </button>
            )}
            <span
              className="absolute inset-x-0 bottom-0 h-[2px] bg-coral-500 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </SheetHeader>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex-1 overflow-y-auto px-7 py-7"
          >
            {loading && <SourceSkeleton />}
            {error && !loading && <SourceError onRetry={onRetry} />}
            {section && !loading && !error && (
              <div className="mx-auto max-w-[68ch] space-y-4 rounded-2xl bg-white/80 px-6 py-7 text-[15px] leading-[1.75] text-ink/85 shadow-sm ring-1 ring-ink/[0.04] backdrop-blur-[2px] md:text-base">
                {blocks.map((b, i) => (
                  <BlockView
                    key={i}
                    block={b}
                    excerpt={excerpt}
                    isMark={i === markIdx}
                    dropCap={
                      i === 0 &&
                      i !== markIdx &&
                      !isShort &&
                      b.type === "paragraph" &&
                      b.text.length > 160
                    }
                    blockRef={i === markIdx ? markRef : undefined}
                    onTermClick={openGlossary}
                  />
                ))}
                <p className="mt-4 text-[11px] text-ink/30">
                  Cliquez sur un terme souligné pour explorer sa définition dans les documents.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Panneau glossaire ────────────────────────────────────── */}
        <div
          className={cn(
            "absolute inset-0 z-10 flex flex-col bg-white/95 backdrop-blur-sm transition-transform duration-300 ease-in-out",
            glossaryTerm ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="relative shrink-0 border-b border-ink/[0.06] bg-white/85 px-5 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={closeGlossary}
              className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink/50 transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Retour à la source
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" />
              <span className="font-display text-lg font-black capitalize text-ink">
                {glossaryTerm}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-ink/40">
              Occurrences dans les documents officiels
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Définition synthétique */}
            {glossaryTerm && GLOSSARY_MAP.has(glossaryTerm) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-600">
                  Définition
                </p>
                <p className="text-[14px] leading-relaxed text-ink/85">
                  {GLOSSARY_MAP.get(glossaryTerm)}
                </p>
              </div>
            )}

            {/* Extraits des documents */}
            {glossaryResults.length > 0 && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/30">
                Dans les documents officiels
              </p>
            )}

            {glossaryLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-ink/[0.04] p-4">
                    <div className="mb-2 h-3 w-1/3 rounded-full bg-ink/[0.08]" />
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full rounded-full bg-ink/[0.06]" />
                      <div className="h-2.5 w-4/5 rounded-full bg-ink/[0.06]" />
                      <div className="h-2.5 w-3/5 rounded-full bg-ink/[0.06]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!glossaryLoading && glossaryResults.length === 0 && !GLOSSARY_MAP.has(glossaryTerm ?? "") && (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <BookOpen className="h-8 w-8 text-ink/20" strokeWidth={1.5} />
                <p className="text-sm text-ink/40">
                  Aucune occurrence trouvée dans les documents.
                </p>
              </div>
            )}

            {!glossaryLoading && glossaryResults.length > 0 && (
              <div className="space-y-3">
                {glossaryResults.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-ink/[0.07] bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-[13px] font-semibold leading-snug text-ink">
                        {r.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        {r.sourcePdf}
                      </span>
                    </div>
                    <p
                      className="text-[13px] leading-relaxed text-ink/65 [&_mark]:rounded [&_mark]:bg-amber-100 [&_mark]:px-0.5 [&_mark]:font-medium [&_mark]:text-amber-900"
                      dangerouslySetInnerHTML={{ __html: r.snippet }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPdfView({
                          slug: r.sourcePdf,
                          page: r.pageStart,
                          title: r.title,
                          highlight: glossaryTerm,
                        })
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700 transition-colors hover:text-amber-900"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Lire dans le PDF (p.{r.pageStart})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Panneau chapitre (lecture complète in-quiz) ──────────── */}
        <div
          className={cn(
            "absolute inset-0 z-20 flex flex-col transition-transform duration-300 ease-in-out",
            chapterOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="relative shrink-0 border-b border-ink/[0.06] bg-white/85 px-7 py-5 text-left backdrop-blur-sm">
            <button
              type="button"
              onClick={closeChapter}
              className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink/50 transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Retour à la source
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-coral-500">
              Chapitre complet
            </span>
            <p className="pr-8 font-display text-xl font-black leading-tight tracking-tight text-ink">
              {chapter?.title ?? "Chapitre"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-ink/45">
              Le quiz reprend en fermant ce volet
            </p>
          </div>

          <div ref={chapterScrollRef} className="flex-1 overflow-y-auto px-7 py-7">
            {chapterLoading && <SourceSkeleton />}
            {chapterError && !chapterLoading && <SourceError onRetry={() => section?.sousThemeId != null && openChapter(section.sousThemeId)} />}
            {chapter && !chapterLoading && !chapterError && (
              <div className="mx-auto max-w-[68ch] space-y-6">
                {chapter.sections.map((sec) => {
                  const isCurrent = sec.id === section?.id;
                  return (
                    <section
                      key={sec.id}
                      ref={isCurrent ? currentSectionRef : undefined}
                      className={cn(
                        "scroll-mt-4 rounded-2xl bg-white/80 px-6 py-7 text-[15px] leading-[1.75] text-ink/85 shadow-sm ring-1 backdrop-blur-[2px] md:text-base",
                        isCurrent ? "ring-2 ring-coral-300" : "ring-ink/[0.04]",
                      )}
                    >
                      {isCurrent && (
                        <span className="mb-3 inline-block rounded-full bg-coral-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-coral-700">
                          Source de la question
                        </span>
                      )}
                      <h3 className="mb-4 font-display text-lg font-black leading-tight tracking-tight text-ink">
                        {sec.title}
                      </h3>
                      <div className="space-y-4">
                        {sec.blocks.map((b, i) => (
                          <BlockView key={i} block={b} excerpt="" />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Viewer PDF (modal plein écran) */}
        {pdfView && (
          <PdfViewerModal
            open={!!pdfView}
            onOpenChange={(o) => !o && setPdfView(null)}
            slug={pdfView.slug}
            page={pdfView.page}
            title={pdfView.title}
            highlight={pdfView.highlight}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type Source = {
  pdf: string;
  section: string;
  excerpt: string;
  sectionId: string | null;
};
export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  source: Source;
};

const LETTERS = ["A", "B", "C", "D"];

export function QuizPlayer({
  questions,
  revision = false,
}: {
  questions: QuizQuestion[];
  revision?: boolean;
}) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Réponses en cours d'enregistrement — flushées avant toute navigation
  // pour ne perdre aucune donnée de révision (la donnée la plus précieuse).
  const pending = useRef<Promise<unknown>[]>([]);
  const flush = useCallback(() => Promise.allSettled(pending.current), []);
  const goLearn = useCallback(async () => {
    await flush();
    router.push("/learn");
  }, [flush, router]);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [section, setSection] = useState<SectionData | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState(false);

  const q = questions[activeIdx];
  const total = questions.length;
  const pct = ((activeIdx + (status !== "none" ? 1 : 0)) / total) * 100;
  const revealed = status !== "none";

  const reset = () => {
    setActiveIdx(0);
    setSelectedIdx(undefined);
    setStatus("none");
    setCorrectCount(0);
    setFinished(false);
  };

  const onSelect = (i: number) => {
    if (status !== "none") return;
    setSelectedIdx(i);
  };

  const openSource = async () => {
    const id = q.source.sectionId;
    if (!id) return;
    setSourceOpen(true);
    setSection(null);
    setSectionError(false);
    setSectionLoading(true);
    try {
      const res = await fetch(`/api/section/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error();
      setSection((await res.json()) as SectionData);
    } catch {
      setSectionError(true);
    } finally {
      setSectionLoading(false);
    }
  };

  const onCheck = () => {
    if (status === "none") {
      if (selectedIdx === undefined) return;
      const correct = selectedIdx === q.correctIndex;
      setStatus(correct ? "correct" : "wrong");
      if (correct) setCorrectCount((c) => c + 1);
      pending.current.push(
        recordAnswer({
          questionId: q.id,
          selectedAnswer: selectedIdx,
          correct,
          revision,
        }).catch((e) => console.error("recordAnswer a échoué", e)),
      );
      return;
    }
    if (activeIdx === total - 1) {
      void flush();
      setFinished(true);
      return;
    }
    setActiveIdx((i) => i + 1);
    setSelectedIdx(undefined);
    setStatus("none");
  };

  if (finished) {
    return (
      <ResultView
        correct={correctCount}
        total={total}
        revision={revision}
        onBack={goLearn}
        onRetry={
          revision
            ? async () => {
                // Flush des réponses, reset de l'UI puis refetch du RSC :
                // les questions désormais réussies sortent du nouveau lot.
                await flush();
                reset();
                router.refresh();
              }
            : reset
        }
      />
    );
  }

  const cta =
    status === "none" ? "Vérifier" : status === "correct" ? "Suivant" : "Continuer";

  return (
    <div className="flex min-h-screen flex-col bg-cream">

      {/* Header in-quiz : quitter + progression */}
      <header className="sticky top-0 z-50 h-14 border-b border-ink/[0.06] bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto grid h-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
          <button
            onClick={goLearn}
            aria-label="Quitter"
            className="flex h-9 w-9 items-center justify-center justify-self-start rounded-[10px] text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="flex w-full max-w-[460px] items-center gap-3.5">
            <span className="shrink-0 text-xs tabular-nums text-ink/55">
              <span className="font-bold text-ink">{activeIdx + 1}</span> / {total}
            </span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
              <div
                className="h-full rounded-full bg-coral-500 transition-[width] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {revision ? (
            <div className="inline-flex items-center gap-1.5 justify-self-end rounded-full bg-coral-50 px-3 py-1.5">
              <RotateCcw className="h-4 w-4 text-coral-600" strokeWidth={1.75} />
              <span className="text-[13px] font-bold text-coral-700">Révision</span>
            </div>
          ) : (
            <div aria-hidden className="justify-self-end" />
          )}
        </div>
      </header>

      {/* Question + options */}
      <main className="flex-1 px-6 pt-8 pb-36">
        <div className="mx-auto max-w-[720px]">
          {(() => {
            const cat = getCategoryMeta(q.source);
            const Icon = cat.Icon;
            return (
              <div className="mb-5 flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5", cat.color)} strokeWidth={1.75} />
                <span className={cn("text-[11px] font-medium uppercase tracking-widest", cat.color)}>
                  {cat.label}
                </span>
              </div>
            );
          })()}

          <h2 className="mb-7 text-balance font-display text-[26px] font-black leading-tight tracking-tight text-ink md:text-[34px]">
            {q.question}
          </h2>

          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const isUserPick = selectedIdx === i;
              const isCorrect = i === q.correctIndex;
              let state: "" | "sel" | "correct" | "wrong" | "dim" = "";
              if (!revealed) {
                if (isUserPick) state = "sel";
              } else if (isCorrect) {
                state = "correct";
              } else if (isUserPick) {
                state = "wrong";
              } else {
                state = "dim";
              }

              return (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  disabled={revealed}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-xl border bg-white px-[18px] py-4 text-left text-[15px] shadow-soft transition-all duration-200",
                    !revealed && "hover:-translate-y-px hover:border-ink/15",
                    state === "" && "border-ink/8 text-ink",
                    state === "sel" && "border-coral-500 bg-coral-50 text-ink",
                    state === "correct" && "border-moss-500 bg-moss-50",
                    state === "wrong" && "border-coral-700 bg-coral-50",
                    state === "dim" && "border-ink/8 opacity-55",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-[13px] font-bold transition-all",
                      state === "sel" && "bg-coral-500 text-white",
                      state === "correct" && "bg-moss-500 text-white",
                      state === "wrong" && "bg-coral-700 text-white",
                      (state === "" || state === "dim") && "bg-ink/[0.06] text-ink/55",
                    )}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className={cn("flex-1", state === "correct" && "font-semibold text-moss-700")}>
                    {opt}
                  </span>
                  {revealed && isCorrect && (
                    <Check className="ml-auto h-4 w-4 shrink-0 text-moss-500" strokeWidth={2.5} />
                  )}
                  {revealed && isUserPick && !isCorrect && (
                    <X className="ml-auto h-4 w-4 shrink-0 text-coral-700" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer de validation */}
      <footer
        className={cn(
          "fixed inset-x-0 bottom-0 border-t bg-white shadow-[0_-8px_32px_-8px_rgba(31,29,27,0.06)] transition-all duration-300",
          status === "correct" && "border-moss-500 bg-moss-50",
          status === "wrong" && "border-coral-700 bg-coral-50",
          status === "none" && "border-ink/8",
        )}
      >
        <div className="mx-auto flex max-w-[720px] flex-col gap-3 px-6 py-4">
          {revealed && (
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-2 text-[15px] font-bold leading-none",
                  status === "correct" ? "text-moss-700" : "text-coral-700",
                )}
              >
                {status === "correct" ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <XCircle className="h-4 w-4" strokeWidth={2} />
                )}
                {status === "correct" ? "Bonne réponse" : "Mauvaise réponse"}
              </div>

              <blockquote
                className={cn(
                  "border-l-2 pl-3.5 text-[13px] leading-relaxed text-ink/70 line-clamp-2",
                  status === "correct" ? "border-moss-400" : "border-coral-400",
                )}
              >
                «&nbsp;{q.source.excerpt}&nbsp;»
              </blockquote>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                <span>{q.source.pdf}</span>
                <span className="text-ink/20">·</span>
                <span>{q.source.section}</span>
                {q.source.sectionId && (
                  <button
                    type="button"
                    onClick={openSource}
                    className={cn(
                      "inline-flex items-center gap-1 normal-case tracking-normal transition-opacity hover:opacity-70",
                      status === "correct" ? "text-moss-600" : "text-coral-600",
                    )}
                  >
                    <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                    Consulter la source
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={onCheck}
              disabled={status === "none" && selectedIdx === undefined}
              className="w-full sm:w-auto sm:min-w-[200px]"
            >
              {cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>

      {/* Drawer : source originale (section nettoyée, extrait surligné) */}
      <SourceDrawer
        open={sourceOpen}
        onOpenChange={setSourceOpen}
        loading={sectionLoading}
        error={sectionError}
        section={section}
        excerpt={q.source.excerpt}
        fallbackTitle={q.source.section || "Section"}
        fallbackPdf={q.source.pdf}
        onRetry={openSource}
      />
    </div>
  );
}

// ── Écran de résultat (inline pour éviter une frontière client) ──
function ResultView({
  correct,
  total,
  revision = false,
  onBack,
  onRetry,
}: {
  correct: number;
  total: number;
  revision?: boolean;
  onBack: () => void;
  onRetry: () => void;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const verdict =
    pct >= 80 ? "Excellent" : pct >= 60 ? "Solide" : pct >= 40 ? "À reprendre" : "Recommencer";
  const isCelebrating = pct >= 80;

  useEffect(() => {
    if (!isCelebrating) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#E85C51", "#D94E43", "#3F7D5C", "#FBF1E7", "#1F1D1B"];
    const end = Date.now() + 2500;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, startVelocity: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, startVelocity: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [isCelebrating]);

  const stats = [
    { v: String(correct), l: "Bonnes" },
    { v: String(total - correct), l: "Ratées" },
    { v: `${pct} %`, l: "Score" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <main className="flex-1 px-6 py-20">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-4 flex items-center gap-4">
            <span className="h-[3px] w-12 rounded-full bg-coral-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-coral-500">
              Quiz terminé
            </span>
          </div>

          <h1 className="font-display font-black leading-[0.88] tracking-tight text-ink text-[3.25rem] md:text-[5.5rem]">
            {verdict}.
            <br />
            <span className="italic text-coral-500">
              {correct} sur {total}.
            </span>
          </h1>

          <p className="mt-7 max-w-[32rem] text-base leading-relaxed text-ink/55">
            Vous avez répondu correctement à{" "}
            <strong className="font-bold text-ink">{pct} %</strong> des questions.
            Reprenez celles que vous avez ratées pour consolider — chaque réponse
            cite sa source.
          </p>

          <div className="mt-9 flex gap-12 border-t border-ink/8 pt-7">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-[40px] font-black leading-none tracking-tight tabular-nums text-ink">
                  {s.v}
                </div>
                <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={onBack}>
              Retour à l'apprentissage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="primaryOutline" size="lg" onClick={onRetry}>
              {revision ? "Réviser encore" : "Recommencer"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
