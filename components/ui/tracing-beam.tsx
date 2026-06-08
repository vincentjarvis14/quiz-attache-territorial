"use client"

// Adapté d'Aceternity UI (Tracing Beam) — palette corail, framer-motion, thème clair.
// Un faisceau SVG suit la progression de lecture le long du contenu.

import React, { useEffect, useRef, useState } from "react"
import { motion, useTransform, useScroll, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export function TracingBeam({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const contentRef = useRef<HTMLDivElement>(null)
  const [svgHeight, setSvgHeight] = useState(0)

  useEffect(() => {
    if (!contentRef.current) return
    const measure = () => setSvgHeight(contentRef.current?.offsetHeight ?? 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [])

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), {
    stiffness: 500,
    damping: 90,
  })
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]), {
    stiffness: 500,
    damping: 90,
  })

  return (
    <motion.div ref={ref} className={cn("relative mx-auto h-full w-full max-w-4xl", className)}>
      <div className="absolute top-3 -left-4 md:-left-20">
        <motion.div
          transition={{ duration: 0.2, delay: 0.5 }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0 ? "none" : "rgba(31,29,27,0.18) 0px 3px 8px",
          }}
          className="ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border border-ink/15 bg-white shadow-sm"
        >
          <motion.div
            transition={{ duration: 0.2, delay: 0.5 }}
            animate={{
              backgroundColor: scrollYProgress.get() > 0 ? "#ffffff" : "#E85C51",
              borderColor: scrollYProgress.get() > 0 ? "#ffffff" : "#C8453B",
            }}
            className="h-2 w-2 rounded-full border border-ink/20 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#1F1D1B"
            strokeOpacity="0.12"
            transition={{ duration: 10 }}
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#beam-gradient)"
            strokeWidth="1.5"
            className="motion-reduce:hidden"
            transition={{ duration: 10 }}
          />
          <defs>
            <motion.linearGradient
              id="beam-gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#E85C51" stopOpacity="0" />
              <stop stopColor="#E85C51" />
              <stop offset="0.325" stopColor="#C8453B" />
              <stop offset="1" stopColor="#3F7D5C" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  )
}
