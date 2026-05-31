import Link from "next/link"
import { NAV_PAGES } from "./nav-config"

export function PrevNextNav({ current }: { current: string }) {
  const idx = NAV_PAGES.findIndex((p) => p.href === current)
  const prev = idx > 0 ? NAV_PAGES[idx - 1] : null
  const next = idx < NAV_PAGES.length - 1 ? NAV_PAGES[idx + 1] : null

  return (
    <div className="mt-16 flex items-center justify-between border-t border-ink/8 pt-8">
      <div>
        {prev && (
          <Link href={prev.href} className="group flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Précédent</span>
            <span className="text-sm font-semibold text-ink/60 transition-colors group-hover:text-ink">
              ← {prev.label}
            </span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link href={next.href} className="group flex flex-col gap-0.5 text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Suivant</span>
            <span className="text-sm font-semibold text-ink/60 transition-colors group-hover:text-ink">
              {next.label} →
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
