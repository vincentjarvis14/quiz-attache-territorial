"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MASTERY_LEVELS,
  MASTERY_META,
  type MasteryLevel,
} from "@/lib/mastery";
import { setSelfMastery } from "@/actions/self-mastery";

// ─── Pastille + popover (cards de la grille chapitre) ───────────

export function MasteryControl({
  sousThemeId,
  initial,
}: {
  sousThemeId: number;
  initial: MasteryLevel | null;
}) {
  const [level, setLevel] = useState<MasteryLevel | null>(initial);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = (next: MasteryLevel | null) => {
    setLevel(next);
    setOpen(false);
    startTransition(async () => {
      await setSelfMastery(sousThemeId, next);
      router.refresh();
    });
  };

  const meta = level ? MASTERY_META[level] : null;

  return (
    <div ref={ref} className="relative z-10">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          meta ? `Niveau : ${meta.label}. Modifier` : "Définir votre niveau de maîtrise"
        }
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-coral-500",
          meta
            ? cn("border-ink/8 bg-white", meta.text)
            : "border-dashed border-ink/20 bg-white/70 text-ink/45 hover:text-ink/70",
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            meta ? meta.dot : "bg-ink/25",
          )}
        />
        {meta ? meta.short : "Évaluer"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-ink/10 bg-white p-1 shadow-[0_12px_40px_-8px_rgba(31,29,27,0.18)]"
        >
          {MASTERY_LEVELS.map((lvl) => {
            const m = MASTERY_META[lvl];
            const active = level === lvl;
            return (
              <button
                key={lvl}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  choose(lvl);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                  active ? cn(m.activeBg, m.text) : "text-ink/70 hover:bg-cream",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", m.dot)} />
                  {m.label}
                </span>
                {active && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
            );
          })}
          {level && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                choose(null);
              }}
              className="mt-0.5 flex w-full items-center gap-2 rounded-lg border-t border-ink/5 px-2.5 py-2 text-left text-[12px] font-medium text-ink/45 transition-colors hover:bg-cream hover:text-ink/70"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              Retirer l'évaluation
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Encart segmenté (bas de la page de lecture) ────────────────

export function MasteryPicker({
  sousThemeId,
  initial,
}: {
  sousThemeId: number;
  initial: MasteryLevel | null;
}) {
  const [level, setLevel] = useState<MasteryLevel | null>(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const choose = (lvl: MasteryLevel) => {
    const next = level === lvl ? null : lvl;
    setLevel(next);
    startTransition(async () => {
      await setSelfMastery(sousThemeId, next);
      router.refresh();
    });
  };

  return (
    <div className="mt-14 rounded-2xl border border-ink/8 bg-white px-6 py-7 shadow-soft">
      <p className="font-display text-lg font-black leading-tight text-ink">
        Où en êtes-vous sur ce chapitre ?
      </p>
      <p className="mt-1 text-[13px] text-ink/50">
        Évaluez votre maîtrise — elle s'affichera sur la fiche du chapitre.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {MASTERY_LEVELS.map((lvl) => {
          const m = MASTERY_META[lvl];
          const active = level === lvl;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => choose(lvl)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-[13px] font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-coral-500",
                active
                  ? cn(m.activeBg, m.text, "ring-2", m.ring, "border-transparent")
                  : "border-ink/10 text-ink/55 hover:border-ink/20 hover:text-ink/80",
              )}
            >
              <span className={cn("h-3 w-3 rounded-full", m.dot)} />
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
