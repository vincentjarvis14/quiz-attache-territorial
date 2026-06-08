import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Accent = "coral" | "moss" | "ink"

const ACCENT_TICK: Record<Accent, string> = {
  coral: "bg-coral-500",
  moss: "bg-moss-500",
  ink: "bg-ink",
}

const ACCENT_NUM: Record<Accent, string> = {
  coral: "text-coral-500",
  moss: "text-moss-700",
  ink: "text-ink/40",
}

/**
 * En-tête de section ancré et repérable par le sommaire (scroll-spy).
 *
 * - pose un `id` + `scroll-mt` pour les liens d'ancre malgré la nav sticky
 * - expose `data-toc` / `data-toc-label` lus par <TableOfContents />
 * - ancre « # » révélée au survol
 */
export function SectionHeading({
  id,
  children,
  toc,
  index,
  eyebrow,
  accent = "coral",
  className,
}: {
  id: string
  children: ReactNode
  /** Libellé court affiché dans le sommaire (défaut : le titre) */
  toc?: string
  /** Numéro de section affiché en pastille (ex. "01") */
  index?: string
  /** Sur-titre optionnel au-dessus du titre */
  eyebrow?: string
  accent?: Accent
  className?: string
}) {
  const label = toc ?? (typeof children === "string" ? children : id)

  return (
    <div
      id={id}
      data-toc=""
      data-toc-label={label}
      className={cn("group scroll-mt-28", className)}
    >
      {eyebrow && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink/35">
          {eyebrow}
        </p>
      )}
      <div className="flex items-center gap-3">
        <span className={cn("h-5 w-[3px] shrink-0 rounded-full", ACCENT_TICK[accent])} />
        {index && (
          <span className={cn("font-mono text-xs font-bold tabular-nums", ACCENT_NUM[accent])}>
            {index}
          </span>
        )}
        <h2 className="font-display text-xl font-black tracking-tight text-ink md:text-2xl">
          {children}
        </h2>
        <a
          href={`#${id}`}
          aria-label="Lien vers cette section"
          className="ml-1 text-ink/20 opacity-0 transition-opacity hover:text-coral-500 group-hover:opacity-100"
        >
          #
        </a>
      </div>
    </div>
  )
}
