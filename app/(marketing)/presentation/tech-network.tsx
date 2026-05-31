"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Code2,
  Layers,
  Atom,
  Palette,
  ShieldCheck,
  Boxes,
  Database,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

type Accent = "coral" | "moss" | "ink"

type Node = {
  id: string
  label: string
  role: string
  x: number // % horizontal (0–100)
  y: number // % vertical (0–100)
  accent: Accent
  Icon: LucideIcon
}

// viewBox de référence partagé entre le SVG (liens) et les nœuds HTML
const VB_W = 1000
const VB_H = 620
const px = (n: Node) => ({ x: (n.x / 100) * VB_W, y: (n.y / 100) * VB_H })

const CENTER: Node = {
  id: "app",
  label: "Application",
  role: "Quiz Attaché Territorial",
  x: 50,
  y: 50,
  accent: "coral",
  Icon: Atom,
}

const NODES: Node[] = [
  { id: "ts", label: "TypeScript", role: "Langage", x: 50, y: 10, accent: "ink", Icon: Code2 },
  { id: "next", label: "Next.js 16", role: "Framework", x: 76.9, y: 21.7, accent: "ink", Icon: Layers },
  { id: "react", label: "React 19", role: "Interface", x: 88, y: 50, accent: "coral", Icon: Atom },
  { id: "tailwind", label: "Tailwind", role: "Style", x: 76.9, y: 78.3, accent: "moss", Icon: Palette },
  { id: "supabase", label: "Supabase", role: "Authentification", x: 50, y: 90, accent: "moss", Icon: ShieldCheck },
  { id: "drizzle", label: "Drizzle ORM", role: "Requêtes typées", x: 23.1, y: 78.3, accent: "ink", Icon: Boxes },
  { id: "neon", label: "Neon Postgres", role: "Base de données", x: 12, y: 50, accent: "coral", Icon: Database },
  { id: "opus", label: "Claude Opus", role: "Génération QCM", x: 23.1, y: 21.7, accent: "coral", Icon: Sparkles },
]

const ALL = [CENTER, ...NODES]
const byId = Object.fromEntries(ALL.map((n) => [n.id, n]))

// Liens : rayons depuis l'app + chaînes de relation réelles
type Link = { from: string; to: string }
const LINKS: Link[] = [
  // l'application s'appuie sur chaque brique
  ...NODES.map((n) => ({ from: "app", to: n.id })),
  // relations directes entre briques
  { from: "ts", to: "next" },
  { from: "next", to: "react" },
  { from: "react", to: "tailwind" },
  { from: "drizzle", to: "neon" },
  { from: "neon", to: "opus" },
]

const ACCENT_TEXT: Record<Accent, string> = {
  coral: "text-coral-500",
  moss: "text-moss-700",
  ink: "text-ink/70",
}
const ACCENT_CHIP: Record<Accent, string> = {
  coral: "bg-coral-50 text-coral-500",
  moss: "bg-moss-50 text-moss-700",
  ink: "bg-ink/8 text-ink/60",
}

export function TechNetwork() {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<string | null>(null)

  const isLit = (id: string) => hover === null || hover === "app" || hover === id
  const linkLit = (l: Link) =>
    hover === null || hover === l.from || hover === l.to || (hover === "app" && l.from === "app")

  return (
    <div className="relative mx-auto aspect-[1000/620] w-full max-w-3xl">
      {/* Couche liens (SVG) — statique, mise en évidence au survol (event-driven) */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden
      >
        {LINKS.map((l) => {
          const a = px(byId[l.from])
          const b = px(byId[l.to])
          const lit = linkLit(l)
          return (
            <line
              key={`${l.from}-${l.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={lit ? "rgba(232,92,81,0.45)" : "rgba(31,29,27,0.18)"}
              strokeWidth={lit ? 2 : 1.25}
              strokeLinecap="round"
              style={{ transition: "stroke .25s, stroke-width .25s" }}
            />
          )
        })}
      </svg>

      {/* Couche nœuds (HTML) — apparition douce une seule fois, pas d'animation continue */}
      {ALL.map((n, i) => {
        const center = n.id === "app"
        const lit = isLit(n.id)
        const Icon = n.Icon
        return (
          <motion.div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%`, zIndex: center ? 20 : 10 }}
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: center ? 0 : 0.1 + i * 0.05, ease: [0.21, 0.5, 0.3, 1] }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
          >
            {center ? (
              <div className="flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-cream shadow-[0_12px_40px_-12px_rgba(31,29,27,0.45)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-coral-500">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <span className="font-display text-sm font-black leading-tight">{n.label}</span>
              </div>
            ) : (
              <div
                className="flex select-none items-center gap-2 rounded-xl border border-ink/8 bg-white/90 px-2.5 py-1.5 shadow-soft backdrop-blur transition-[opacity,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(31,29,27,0.18)]"
                style={{ opacity: lit ? 1 : 0.4 }}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CHIP[n.accent]}`}>
                  <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-bold text-ink">{n.label}</span>
                  <span className={`block text-[10px] font-semibold ${ACCENT_TEXT[n.accent]}`}>{n.role}</span>
                </span>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
