"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, useScroll, useSpring } from "framer-motion"

type Item = { id: string; label: string }

/**
 * Sommaire flottant « scroll-spy » de la page courante.
 *
 * - détecte automatiquement les <SectionHeading /> (éléments [data-toc])
 * - suit la section active à l'écran (IntersectionObserver)
 * - une barre verticale se remplit avec la progression de lecture
 *
 * Rendu uniquement sur très grands écrans (xl+), où la colonne centrale
 * laisse de la marge. Sur mobile/tablette, la nav horizontale suffit.
 */
export function TableOfContents() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const { scrollYProgress } = useScroll()
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  // (Re)scan des titres à chaque navigation.
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-toc]"))
    const found = nodes
      .filter((n) => n.id)
      .map((n) => ({ id: n.id, label: n.dataset.tocLabel || n.id }))
    setItems(found)
    setActiveId(found[0]?.id ?? null)

    if (found.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [pathname])

  if (items.length < 2) return null

  return (
    <nav
      aria-label="Sommaire de la page"
      className="fixed right-4 top-1/2 z-30 hidden w-48 -translate-y-1/2 xl:block 2xl:right-[max(1.5rem,calc((100vw-72rem)/2-1rem))]"
    >
      <p className="mb-3 pl-4 text-[10px] font-bold uppercase tracking-widest text-ink/30">
        Sur cette page
      </p>
      <div className="relative">
        {/* rail + remplissage selon la progression de scroll */}
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-ink/10" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute left-[5px] top-1 bottom-1 w-px origin-top bg-coral-500"
        />

        <ul className="space-y-1">
          {items.map((it) => {
            const active = it.id === activeId
            return (
              <li key={it.id} className="relative">
                <a
                  href={`#${it.id}`}
                  className="group flex items-center gap-3 rounded-md py-1 pl-[2px] pr-2"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                    {active && (
                      <motion.span
                        layoutId="toc-active-dot"
                        className="absolute inset-0 rounded-full bg-coral-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative h-1.5 w-1.5 rounded-full transition-colors ${
                        active ? "bg-white" : "bg-ink/25 group-hover:bg-ink/50"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[12.5px] leading-tight transition-colors ${
                      active
                        ? "font-semibold text-ink"
                        : "text-ink/45 group-hover:text-ink/70"
                    }`}
                  >
                    {it.label}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
