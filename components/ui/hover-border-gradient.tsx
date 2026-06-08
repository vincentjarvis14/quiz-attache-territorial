"use client"

// Adapté d'Aceternity UI (Hover Border Gradient) — version carte claire,
// liseré corail qui tourne autour du bloc et s'intensifie au survol.

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "div",
  duration = 1.4,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType
    containerClassName?: string
    className?: string
    duration?: number
    clockwise?: boolean
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState(false)
  const [direction, setDirection] = useState<Direction>("TOP")

  const rotateDirection = (current: Direction): Direction => {
    const dirs: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]
    const i = dirs.indexOf(current)
    const next = clockwise ? (i - 1 + dirs.length) % dirs.length : (i + 1) % dirs.length
    return dirs[next]
  }

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(22% 50% at 50% 0%, rgba(232,92,81,0.7) 0%, rgba(232,92,81,0) 100%)",
    LEFT: "radial-gradient(18% 43% at 0% 50%, rgba(232,92,81,0.7) 0%, rgba(232,92,81,0) 100%)",
    BOTTOM: "radial-gradient(22% 50% at 50% 100%, rgba(232,92,81,0.7) 0%, rgba(232,92,81,0) 100%)",
    RIGHT: "radial-gradient(18% 43% at 100% 50%, rgba(232,92,81,0.7) 0%, rgba(232,92,81,0) 100%)",
  }
  const highlight =
    "radial-gradient(80% 180% at 50% 50%, #E85C51 0%, #3F7D5C 45%, rgba(255,255,255,0) 100%)"

  useEffect(() => {
    if (hovered) return
    const interval = setInterval(() => {
      setDirection((prev) => rotateDirection(prev))
    }, duration * 1000)
    return () => clearInterval(interval)
  }, [hovered, duration])

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex w-full items-center justify-center overflow-visible rounded-2xl bg-ink/[0.06] p-[1.5px]",
        containerClassName
      )}
      {...props}
    >
      <div className={cn("relative z-10 w-full rounded-[inherit] bg-white", className)}>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)", width: "100%", height: "100%" }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: "linear", duration }}
      />
    </Tag>
  )
}
