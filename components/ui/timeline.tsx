"use client"

// Adapté d'Aceternity UI (Timeline) — palette corail, framer-motion, thème clair,
// espacement resserré pour un usage intégré dans une page de rapport.

import { useScroll, useTransform, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"

export type TimelineEntry = {
  /** Repère court (ex. "01") affiché dans la pastille */
  marker: string
  /** Titre sticky à gauche */
  title: string
  /** Sous-titre optionnel (tag) */
  tag?: string
  content: React.ReactNode
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const measure = () => setHeight(ref.current?.getBoundingClientRect().height ?? 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 30%", "end 60%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div ref={containerRef} className="relative w-full">
      <div ref={ref} className="relative mx-auto pb-4">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start gap-6 pt-8 md:gap-8 md:pt-12 first:pt-0">
            {/* Colonne gauche sticky : pastille + titre */}
            <div className="sticky top-28 z-30 flex max-w-[40px] flex-col items-center self-start md:max-w-[180px] md:flex-row md:items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-coral-200 bg-white shadow-soft">
                <span className="font-mono text-[11px] font-bold text-coral-500">{item.marker}</span>
              </div>
              <h3 className="hidden text-base font-black leading-tight text-ink md:block md:pl-4">
                {item.title}
              </h3>
            </div>

            {/* Colonne droite : contenu */}
            <div className="relative w-full pb-2">
              <div className="mb-2 md:hidden">
                <span className="text-base font-black text-ink">{item.title}</span>
              </div>
              {item.tag && (
                <span className="mb-2 inline-block rounded-full border border-ink/8 bg-cream px-2 py-0.5 font-mono text-[10px] text-ink/45">
                  {item.tag}
                </span>
              )}
              <div className="text-sm leading-relaxed text-ink/65">{item.content}</div>
            </div>
          </div>
        ))}

        {/* Rail + faisceau qui se remplit au scroll */}
        <div
          style={{ height: height + "px" }}
          className="absolute left-5 top-0 w-[2px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)] bg-gradient-to-b from-transparent via-ink/12 to-transparent"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-coral-500 via-coral-400 to-transparent"
          />
        </div>
      </div>
    </div>
  )
}
