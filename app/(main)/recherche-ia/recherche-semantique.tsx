"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight } from "lucide-react";

import { search, type SearchResult } from "@/lib/semantic-search";
import { TypingPlaceholder } from "@/components/ui/typing-placeholder";
import { cn } from "@/lib/utils";

const EXEMPLES = [
  "Qui élabore le PLU ?",
  "Les conditions du permis de construire",
  "Différence entre commune et EPCI",
  "Le contrôle de légalité du préfet",
  "La procédure de révision du PLU",
  "Le rôle du maire dans l'urbanisme",
  "Les compétences du conseil départemental",
  "Comment fonctionne le certificat d'urbanisme ?",
];

// matiere ("environnement_territorial") → slug de route ("environnement-territorial")
const matiereToSlug = (m: string) => m.replace(/_/g, "-");

export function RechercheSemantique() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = useRef(false);

  async function runSearch(q: string) {
    const term = q.trim();
    if (term.length < 3 || busy) return;
    setBusy(true);
    setResults(null);

    try {
      const found = await search(term, 8);
      ready.current = true;
      setResults(found);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink/30" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") setResults(null);
            }}
            className="w-full rounded-xl border border-ink/10 bg-white py-3 pl-10 pr-3 text-ink shadow-sm outline-none transition focus:border-coral-400 focus:ring-2 focus:ring-coral-200"
          />
          {query === "" && (
            <TypingPlaceholder
              phrases={EXEMPLES}
              className="pointer-events-none absolute left-10 right-3 top-1/2 -translate-y-1/2 text-ink/30"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={busy || query.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-xl bg-coral-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : "Chercher"}
        </button>
      </form>

      {/* Recherche en cours */}
      {busy && (
        <div className="flex items-center gap-2 text-sm text-ink/50">
          <Loader2 className="size-4 animate-spin" />
          {ready.current ? "Recherche…" : "Préparation…"}
        </div>
      )}

      {/* Résultats */}
      {results && !busy && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-ink/50">Aucun résultat.</p>
          ) : (
            results.map((r) => <ResultCard key={r.id} r={r} />)
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ r }: { r: SearchResult }) {
  const pct = Math.round(r.score * 100);
  return (
    <article className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="truncate text-xs font-medium text-ink/40">
          {r.theme} · {r.sousTheme}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
            pct >= 85
              ? "bg-emerald-100 text-emerald-700"
              : pct >= 80
                ? "bg-amber-100 text-amber-700"
                : "bg-ink/5 text-ink/50"
          )}
        >
          {pct} %
        </span>
      </div>
      <p className="font-semibold text-ink">{r.question}</p>
      {r.explanation && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
          {r.explanation}
        </p>
      )}
      <Link
        href={`/library/${matiereToSlug(r.matiere)}/${r.sousThemeId}${
          r.sectionId ? `#${r.sectionId}` : ""
        }`}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-coral-600 hover:text-coral-700"
      >
        Lire le cours <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}
