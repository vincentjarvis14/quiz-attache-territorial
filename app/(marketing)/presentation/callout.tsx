import type { ReactNode } from "react"
import { Info, AlertTriangle, KeyRound, Lightbulb, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "info" | "warn" | "cle" | "note"

const STYLES: Record<
  Variant,
  { wrap: string; chip: string; icon: LucideIcon; label: string; title: string }
> = {
  info: {
    wrap: "border-coral-200 bg-coral-50/70",
    chip: "bg-coral-500 text-white",
    icon: Info,
    label: "Info",
    title: "text-coral-700",
  },
  warn: {
    wrap: "border-amber-200 bg-amber-50/60",
    chip: "bg-amber-400 text-white",
    icon: AlertTriangle,
    label: "À noter",
    title: "text-amber-700",
  },
  cle: {
    wrap: "border-moss-500/25 bg-moss-50",
    chip: "bg-moss-500 text-white",
    icon: KeyRound,
    label: "Point clé",
    title: "text-moss-700",
  },
  note: {
    wrap: "border-ink/12 bg-white",
    chip: "bg-ink text-cream",
    icon: Lightbulb,
    label: "Note",
    title: "text-ink",
  },
}

/**
 * Encadré d'appel contextuel (info / avertissement / point clé / note).
 * Complète <EnClair /> pour ponctuer un texte long sans casser le rythme.
 */
export function Callout({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: Variant
  title?: string
  children: ReactNode
  className?: string
}) {
  const s = STYLES[variant]
  const Icon = s.icon
  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", s.wrap, className)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", s.chip)}>
          <Icon className="h-3 w-3" strokeWidth={2.5} />
        </span>
        <span className={cn("text-[11px] font-bold uppercase tracking-widest", s.title)}>
          {title ?? s.label}
        </span>
      </div>
      <div className="text-[13px] leading-relaxed text-ink/70 [&_code]:rounded [&_code]:bg-ink/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11px] [&_code]:text-ink/70 [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </div>
  )
}
