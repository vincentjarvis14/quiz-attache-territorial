"use client"

import { useState, type ReactNode } from "react"

// Encadré "En clair" : résumé grand public, toujours visible.
export function EnClair({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-coral-200 bg-coral-50 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[11px] font-bold text-white">
          ✦
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-coral-600">
          En clair
        </span>
      </div>
      <div className="text-sm leading-relaxed text-ink/75 [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </div>
  )
}

// Bloc "Pour les curieux" : détail technique replié par défaut.
export function PourLesCurieux({
  children,
  label = "Pour les curieux",
}: {
  children: ReactNode
  label?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex items-center gap-1.5 text-xs font-semibold text-ink/45 transition-colors hover:text-ink/70"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {label}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-ink/8 bg-white/70 p-4 text-sm leading-relaxed text-ink/60 [&_code]:rounded [&_code]:bg-ink/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-ink/70">
          {children}
        </div>
      )}
    </div>
  )
}
