import { Landmark } from "lucide-react";
import type { LegalRef } from "@/db/queries";
import { ArticlePopover } from "./article-popover";

/**
 * Feature #3 — « Articles-clés du chapitre »
 * Carte de synthèse en tête de lecture : la liste dédupliquée des articles
 * du Code de l'urbanisme couvrant l'ensemble du chapitre. Chaque puce ouvre
 * l'extrait correspondant.
 */
export function KeyArticles({ articles }: { articles: LegalRef[] }) {
  const items = articles.filter((a) => a.articleRef);
  if (items.length === 0) return null;

  return (
    <section className="mb-10 rounded-2xl border border-ink/8 bg-white px-5 py-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Landmark className="h-4 w-4 text-coral-500" strokeWidth={2} />
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-ink/55">
          Articles-clés du chapitre
        </h2>
      </div>
      <p className="mb-3 max-w-[60ch] text-[13px] leading-relaxed text-ink/50">
        Les articles du Code de l&apos;urbanisme à connaître pour ce chapitre.
        Cliquez sur une référence pour lire l&apos;extrait.
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((a, i) => (
          <ArticlePopover
            key={`${a.articleRef}-${i}`}
            articleRef={a.articleRef as string}
            content={a.content}
            headingPath={a.headingPath}
          />
        ))}
      </div>
    </section>
  );
}
