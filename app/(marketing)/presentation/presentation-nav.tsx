"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_PAGES } from "./nav-config"

export function PresentationNav() {
  const pathname = usePathname()

  return (
    <nav
      className="sticky top-[56px] z-40 border-b border-ink/8 bg-cream/95 backdrop-blur-sm"
      aria-label="Navigation rapport technique"
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="no-scrollbar flex gap-1 overflow-x-auto py-2 sm:flex-wrap sm:overflow-visible">
          {NAV_PAGES.map((item, i) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-ink text-cream"
                    : "text-ink/50 hover:bg-ink/6 hover:text-ink"
                }`}
              >
                <span className={`font-mono text-[10px] ${isActive ? "text-cream/40" : "text-ink/20"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.short}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
