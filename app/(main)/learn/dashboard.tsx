"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type DashSousTheme = {
  id: number;
  number: string;
  title: string;
  blurb: string;
  total: number;
  done: number;
};
export type DashMatiere = {
  id: number;
  title: string;
  sousThemes: DashSousTheme[];
};

export function Dashboard({
  matieres,
  revisionCount = 0,
}: {
  matieres: DashMatiere[];
  revisionCount?: number;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(matieres[0]?.id);
  const [selected, setSelected] = useState<number[]>([]);

  const current = matieres.find((m) => m.id === activeId) ?? matieres[0];
  if (!current) return null;

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const clear = () => setSelected([]);
  const switchMatiere = (id: number) => {
    if (id === activeId) return;
    setActiveId(id);
    setSelected([]); // pool reste dans une seule matière
  };
  const start = () => {
    if (!selected.length) return;
    router.push(`/lesson?sousThemeIds=${selected.join(",")}&mode=free`);
  };

  const selectedST = current.sousThemes.filter((s) => selected.includes(s.id));
  const totalQ = selectedST.reduce((a, s) => a + s.total, 0);

  // Titre matière : dernier mot sur sa propre ligne + point (style CD)
  const words = current.title.split(" ");
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];

  return (
    <main className="flex-1 px-6 pb-40 pt-8">
      <div className="mx-auto max-w-5xl">

        {/* Encart révision : questions ratées à retravailler */}
        {revisionCount > 0 && (
          <button
            onClick={() => router.push("/lesson?mode=revision")}
            className="group mb-8 flex w-full items-center justify-between gap-4 rounded-2xl border border-coral-200 bg-coral-50 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgba(232,92,81,0.25)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral-500 text-white">
                <RotateCcw className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <div className="font-display text-lg font-black leading-tight text-ink">
                  Réviser mes erreurs
                </div>
                <div className="text-[13px] text-ink/55">
                  {revisionCount} question{revisionCount > 1 ? "s" : ""} à
                  retravailler
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral-600 transition-colors group-hover:text-coral-700">
              Démarrer
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        )}

        {/* Onglets matières */}
        <div
          role="tablist"
          aria-label="Matière"
          className="mb-8 inline-flex items-center gap-1 rounded-full border border-ink/8 bg-white p-1 shadow-soft"
        >
          {matieres.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={m.id === activeId}
              onClick={() => switchMatiere(m.id)}
              className={cn(
                "rounded-full px-[18px] py-2 text-[13px] font-semibold transition-all duration-200",
                m.id === activeId
                  ? "bg-coral-500 text-white"
                  : "text-ink/55 hover:text-ink",
              )}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* En-tête de page */}
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

        {/* Grille de sous-thèmes */}
        <div className="grid gap-5 md:grid-cols-2">
          {current.sousThemes.map((st) => {
            const isSel = selected.includes(st.id);
            const started = st.done > 0;
            const pct = st.total > 0 ? Math.round((st.done / st.total) * 100) : 0;
            return (
              <button
                key={st.id}
                onClick={() => toggle(st.id)}
                aria-pressed={isSel}
                className={cn(
                  "group flex flex-col gap-3.5 rounded-2xl border bg-white p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_rgba(31,29,27,0.12)]",
                  isSel
                    ? "border-coral-500 bg-coral-50 shadow-[inset_0_0_0_1px_#E85C51,0_12px_40px_-8px_rgba(31,29,27,0.12)]"
                    : "border-ink/8 hover:border-ink/15",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-3xl font-black leading-none tracking-tight text-coral-500">
                    {st.number}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      started
                        ? "bg-coral-50 text-coral-700"
                        : isSel
                          ? "bg-white text-coral-700"
                          : "bg-ink/5 text-ink/55",
                    )}
                  >
                    {started ? `${st.done} / ${st.total}` : "À commencer"}
                  </span>
                </div>

                <div className="font-display text-xl font-black leading-tight text-ink">
                  {st.title}
                </div>
                <div className="text-[13px] leading-relaxed text-ink/55">
                  {st.blurb}
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-coral-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-ink/40">
                    {started ? `${pct} % couvert` : `${st.total} questions`}
                  </span>
                  <span
                    className={cn(
                      "font-semibold transition-colors",
                      isSel ? "text-coral-500" : "text-ink group-hover:text-coral-500",
                    )}
                  >
                    {isSel ? "Sélectionné" : "Sélectionner"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre de sélection flottante */}
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink/8 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_-8px_rgba(31,29,27,0.08)]">
          <div className="mx-auto flex max-w-5xl flex-col items-stretch gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-[18px]">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-3xl font-black leading-none tracking-tight text-ink">
                  {selected.length}
                </span>
                <span className="text-[13px] text-ink/55">
                  sous-thème{selected.length > 1 ? "s" : ""} sélectionné
                  {selected.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-7 w-px bg-ink/8" />
              <div className="text-sm font-semibold text-ink">
                ~{totalQ} questions{" "}
                <span className="font-medium text-ink/55">· pool mélangé</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="default" onClick={clear}>
                Réinitialiser
              </Button>
              <Button variant="primary" size="default" onClick={start}>
                Démarrer le quiz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
