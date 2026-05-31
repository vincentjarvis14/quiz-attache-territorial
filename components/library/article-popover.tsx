"use client";

import { useState } from "react";
import { Scale, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";

// Lignes de hiérarchie (Titre/Chapitre/Section…) qui « fuitent » parfois en
// fin de chunk : redondantes avec le fil d'Ariane, on les retire.
const LEAKED_HEADING =
  /^(Titre|Chapitre|Section|Sous-section|Paragraphe)\b[^:\n]*:/i;

// Début d'item d'énumération juridique : « 1° », « a) », « - », « • », « II. ».
const ENUM_MARKER = /^(?:\d+°|[a-z]\)|[ivx]+\)|[-–—•]\s|\d+\.\s)/i;

/**
 * Reflow du texte brut d'un article issu du PDF (même logique que le drawer) :
 * - retire la ligne d'en-tête redondante « Article Lxxx » (déjà dans le header) ;
 * - recolle les faux sauts de ligne PDF en milieu de phrase ;
 * - préserve les sauts logiques avant chaque item d'énumération (1°, a), …) ;
 * - écrase les séparateurs « page » parasites (lignes ne contenant qu'un espace) ;
 * - supprime les intitulés de hiérarchie qui ont fuité dans le contenu.
 */
function cleanArticle(raw: string): string {
  const lines = raw
    .replace(/\r/g, "")
    .replace(/^\s*Article\s+[LRDA]\.?\s*\*?\s*\d+(?:[-–]\d+)*\s*/i, "")
    .split("\n")
    .map((l) => l.replace(/ /g, " ").replace(/[ \t]+/g, " ").trim());

  const paragraphs: string[] = [];
  let buf = "";
  const flush = () => {
    const t = buf.replace(/\s+/g, " ").trim();
    if (t) paragraphs.push(t);
    buf = "";
  };

  for (const line of lines) {
    if (line === "") {
      flush(); // ligne vide / « page break » → fin de paragraphe
      continue;
    }
    if (LEAKED_HEADING.test(line)) {
      flush(); // intitulé hiérarchique parasite → on l'ignore
      continue;
    }
    if (ENUM_MARKER.test(line)) {
      flush(); // nouvel item d'énumération → nouveau bloc
      buf = line;
      continue;
    }
    buf = buf ? `${buf} ${line}` : line; // recolle un faux saut PDF
  }
  flush();

  return paragraphs.join("\n").trim();
}

/** Découpe le fil d'Ariane "A › B › C" en segments propres. */
function crumbs(path: string | null | undefined): string[] {
  if (!path) return [];
  return path
    .split("›")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Puce cliquable d'un article du Code de l'urbanisme → ouvre un drawer latéral
 * de lecture (grande surface, typographie aérée).
 * - `content` fourni : affichage immédiat (mapping pré-calculé).
 * - sinon : récupération à la demande via /api/rag/article (réfs inline du cours).
 *
 * Le fil d'Ariane (Titre › Chapitre › Section) donne un « nom » à l'article.
 */
export function ArticlePopover({
  articleRef,
  content,
  headingPath,
  className,
}: {
  articleRef: string;
  content?: string;
  headingPath?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(
    content ? cleanArticle(content) : null,
  );
  const [path, setPath] = useState<string | null>(headingPath ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && text === null && !loading) {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/rag/article?ref=${encodeURIComponent(articleRef)}`,
        );
        const data = await res.json();
        if (data.found && data.content) {
          setText(cleanArticle(data.content));
          if (data.headingPath) setPath(data.headingPath);
        } else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
  }

  const isEmpty = !loading && !error && (!text || text.length === 0);
  const trail = crumbs(path);
  const articleName = trail.length ? trail[trail.length - 1] : null;
  const ancestors = trail.slice(0, -1);
  // Découpe le texte reflowé en blocs pour un rendu aéré (1 bloc = 1 alinéa/item).
  const blocks = text ? text.split("\n").filter(Boolean) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-md bg-ink/[0.04] px-2 py-0.5 font-mono text-[12.5px] font-medium text-ink/75 ring-1 ring-inset ring-ink/10 transition-colors hover:bg-coral-50 hover:text-coral-700 hover:ring-coral-200",
            open && "bg-coral-500 text-white ring-coral-500",
            className,
          )}
        >
          <Scale className="h-3 w-3" strokeWidth={2} />
          Art. {articleRef}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full max-w-xl flex-col gap-0 overflow-hidden bg-white p-0 sm:max-w-xl"
      >
        {/* Fond quadrillage type cahier (papier millimétré) — même calque que le drawer source */}
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

        {/* ── Panneau article ──────────────────────────────────────── */}
        <div className="absolute inset-0 z-10 flex flex-col">
          <SheetHeader className="relative shrink-0 border-b border-ink/[0.06] bg-white/85 px-7 py-5 text-left backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-coral-500">
              <Scale className="h-3 w-3" strokeWidth={2.5} />
              Code de l&apos;urbanisme
            </span>
            <SheetTitle className="pr-8 font-display text-xl font-black leading-tight tracking-tight text-ink">
              {articleName ?? `Article ${articleRef}`}
            </SheetTitle>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] font-medium text-ink/45">
                Article {articleRef}
              </span>
            </div>
            {ancestors.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-1 text-[12px] font-medium leading-tight text-ink/45">
                {ancestors.map((c, i) => (
                  <span key={i} className="flex items-center gap-x-1">
                    {i > 0 && (
                      <ChevronRight
                        className="h-3.5 w-3.5 shrink-0 text-ink/25"
                        strokeWidth={2.5}
                      />
                    )}
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-7 py-7">
            {loading && (
              <div className="mx-auto max-w-[68ch] animate-pulse space-y-3" aria-hidden>
                <div className="h-4 w-full rounded bg-ink/10" />
                <div className="h-4 w-[94%] rounded bg-ink/10" />
                <div className="h-4 w-[88%] rounded bg-ink/10" />
                <div className="h-4 w-[91%] rounded bg-ink/10" />
                <div className="h-4 w-[70%] rounded bg-ink/10" />
              </div>
            )}

            {error && !loading && (
              <p className="mx-auto max-w-[68ch] text-[15px] italic text-ink/55">
                Cet article n&apos;est pas présent dans le Code indexé.
              </p>
            )}

            {isEmpty && (
              <p className="mx-auto max-w-[68ch] text-[15px] italic text-ink/55">
                Article abrogé ou sans texte disponible.
              </p>
            )}

            {!loading && !error && !isEmpty && (
              <div className="mx-auto max-w-[68ch] space-y-4 rounded-2xl bg-white/80 px-6 py-7 text-[15px] leading-[1.75] text-ink/85 shadow-sm ring-1 ring-ink/[0.04] backdrop-blur-[2px] md:text-base [overflow-wrap:anywhere]">
                {blocks.map((b, i) => (
                  <p key={i} className={cn(ENUM_MARKER.test(b) && "pl-4 text-ink/80")}>
                    {b}
                  </p>
                ))}
                <p className="mt-4 text-[11px] text-ink/30">
                  Extrait du Code de l&apos;urbanisme — source primaire.
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
