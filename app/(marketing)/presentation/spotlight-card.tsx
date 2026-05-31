"use client"

import { useRef, useState, type ReactNode, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

export function SpotlightCard({
  children,
  className,
  accent = "coral",
  topAccent = false,
}: {
  children: ReactNode
  className?: string
  accent?: "coral" | "moss" | "ink"
  topAccent?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  const glow =
    accent === "moss"
      ? "rgba(63,125,92,0.14)"
      : accent === "ink"
      ? "rgba(31,29,27,0.10)"
      : "rgba(232,92,81,0.16)"

  const topLine =
    accent === "moss" ? "bg-moss-500" : accent === "ink" ? "bg-ink" : "bg-coral-500"

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-soft transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-ink/12 hover:shadow-[0_12px_40px_-12px_rgba(31,29,27,0.18)]",
        className
      )}
    >
      {/* halo qui suit le curseur */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, ${glow}, transparent 60%)`,
        }}
      />
      {/* ligne d'accent en haut */}
      {topAccent && (
        <div
          className={cn(
            "absolute left-0 right-0 top-0 z-10 h-[2px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
            topLine
          )}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
