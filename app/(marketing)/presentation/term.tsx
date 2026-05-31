import type { ReactNode } from "react"
import { TECH_GLOSSARY } from "./tech-glossary"

// Mot technique souligné qui affiche sa définition grand public au survol / focus.
// Aucune dépendance JS : tooltip en CSS pur (group-hover / group-focus-within),
// accessible au clavier (tabIndex + focus).
export function Terme({
  k,
  children,
}: {
  k: keyof typeof TECH_GLOSSARY
  children?: ReactNode
}) {
  const entry = TECH_GLOSSARY[k]
  const label = children ?? entry?.term ?? String(k)
  if (!entry) return <>{label}</>

  return (
    <span className="group/term relative inline-block">
      <span
        tabIndex={0}
        className="cursor-help font-semibold text-coral-600 underline decoration-coral-300 decoration-dotted underline-offset-2 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-coral-400"
      >
        {label}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 translate-y-1 rounded-xl border border-ink/10 bg-white p-3 text-left text-xs leading-relaxed text-ink/70 opacity-0 shadow-[0_12px_40px_-12px_rgba(31,29,27,0.3)] transition-all duration-150 group-hover/term:translate-y-0 group-hover/term:opacity-100 group-focus-within/term:translate-y-0 group-focus-within/term:opacity-100"
      >
        <span className="mb-1 block text-[11px] font-bold text-ink">{entry.term}</span>
        {entry.def}
      </span>
    </span>
  )
}
