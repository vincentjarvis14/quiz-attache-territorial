"use client"

// Adapté de « Scroll Navigation Menu » (21st.dev / spaceboydavey) — palette corail/cream/ink,
// piloté par NAV_PAGES, état actif via usePathname. La barre inline se replie au scroll
// en un bouton flottant qui ouvre un menu animé pour sauter entre les thématiques.

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "framer-motion"
import {
  Menu,
  X,
  LayoutGrid,
  Compass,
  Target,
  Sparkles,
  Layers,
  Network,
  Search,
  Database,
  BrainCircuit,
  Wallet,
  Award,
  type LucideIcon,
} from "lucide-react"
import { NAV_PAGES } from "./nav-config"

const ICONS: Record<string, LucideIcon> = {
  "/presentation": LayoutGrid,
  "/presentation/comment-ca-marche": Compass,
  "/presentation/cadrage": Target,
  "/presentation/vibe-coding": Sparkles,
  "/presentation/stack": Layers,
  "/presentation/architecture": Network,
  "/presentation/requetes": Search,
  "/presentation/base-de-donnees": Database,
  "/presentation/rag": BrainCircuit,
  "/presentation/fonctionnalites": LayoutGrid,
  "/presentation/couts-tests": Wallet,
  "/presentation/synthese": Award,
}

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    scale: 0.85,
    y: -30,
    transition: { type: "spring", stiffness: 300, damping: 30, when: "afterChildren", staggerChildren: 0.04, staggerDirection: -1 },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, when: "beforeChildren", staggerChildren: 0.05 },
  },
}

const itemVariants: Variants = {
  closed: { y: 16, opacity: 0 },
  open: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
}

export function ScrollNavMenu() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 140))

  return (
    <>
      {/* Barre inline — se replie au scroll */}
      <motion.nav
        aria-label="Navigation rapport technique"
        initial={false}
        animate={{ y: isScrolled ? -80 : 0, opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ pointerEvents: isScrolled ? "none" : "auto" }}
        className="sticky top-[56px] z-40 border-b border-ink/8 bg-cream/95 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="no-scrollbar flex gap-1 overflow-x-auto py-2 sm:flex-wrap sm:overflow-visible">
            {NAV_PAGES.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active ? "bg-ink text-cream" : "text-ink/50 hover:bg-ink/6 hover:text-ink"
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.short}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </motion.nav>

      {/* Bouton flottant — apparaît au scroll */}
      <motion.button
        type="button"
        aria-label="Naviguer entre les thématiques"
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.25, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-white shadow-[0_12px_30px_-8px_rgba(232,92,81,0.6)]"
      >
        <Menu className="h-6 w-6" strokeWidth={2} />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-coral-500/40" />
      </motion.button>

      {/* Menu flottant animé */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              role="dialog"
              aria-label="Sommaire du rapport"
              className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative rounded-3xl border border-ink/10 bg-cream p-5 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
                    Naviguer
                  </span>
                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/6 hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                  {NAV_PAGES.map((item) => {
                    const active = pathname === item.href
                    const Icon = ICONS[item.href] ?? Compass
                    return (
                      <motion.div key={item.href} variants={itemVariants}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                            active ? "bg-ink text-cream" : "text-ink/70 hover:bg-coral-50"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              active ? "bg-cream/15 text-cream" : "bg-white text-coral-500"
                            }`}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span className="text-sm font-semibold">{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
