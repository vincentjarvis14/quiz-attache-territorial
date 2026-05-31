"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { Monitor, Workflow, ShieldCheck, Database, type LucideIcon } from "lucide-react"

type Layer = {
  label: string
  metaphore: string
  techno: string
  detail: string
  Icon: LucideIcon
  accent: "coral" | "moss" | "neutral"
}

const LAYERS: Layer[] = [
  {
    label: "Présentation",
    metaphore: "≈ la salle",
    techno: "Next.js App Router — React Server Components",
    detail: "Ce que voit l'utilisateur : pages et boutons. Rendu serveur par défaut, HTML pré-calculé pour un affichage rapide.",
    Icon: Monitor,
    accent: "coral",
  },
  {
    label: "Logique",
    metaphore: "≈ la cuisine",
    techno: "Server Actions — API Routes",
    detail: "Le travail en coulisses : vérifier une réponse, enregistrer la progression, charger les questions du quiz.",
    Icon: Workflow,
    accent: "moss",
  },
  {
    label: "Authentification",
    metaphore: "≈ le videur",
    techno: "Supabase Auth (@supabase/ssr) — Middleware Next.js",
    detail: "Vérifie qui se connecte et garde la session active. L'identité est gérée côté serveur, jamais par le navigateur (+ mode invité).",
    Icon: ShieldCheck,
    accent: "neutral",
  },
  {
    label: "Persistance",
    metaphore: "≈ le garde-manger",
    techno: "Drizzle ORM — Neon PostgreSQL serverless",
    detail: "Où tout est conservé durablement : questions, réponses, progression. Rien ne se perd entre deux visites.",
    Icon: Database,
    accent: "neutral",
  },
]

const EASE = [0.21, 0.5, 0.3, 1] as const

const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

function Beam({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="relative mx-auto h-7 w-px bg-ink/10">
      {!reduce && (
        <motion.div
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-coral-500 shadow-[0_0_12px_2px_rgba(232,92,81,0.5)]"
          initial={{ top: "-6px", opacity: 0 }}
          animate={{ top: ["-6px", "28px"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
        />
      )}
    </div>
  )
}

export function ArchitectureBeams() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.12 } } }}
    >
      {LAYERS.map((layer, i) => {
        const Icon = layer.Icon
        const tone =
          layer.accent === "coral"
            ? "border-coral-200 bg-coral-50"
            : layer.accent === "moss"
            ? "border-moss-500/20 bg-moss-50"
            : "border-ink/8 bg-white shadow-soft"
        const iconTone =
          layer.accent === "coral"
            ? "bg-coral-100 text-coral-600"
            : layer.accent === "moss"
            ? "bg-moss-50 text-moss-700 border border-moss-500/20"
            : "bg-ink/8 text-ink/55"
        return (
          <div key={layer.label}>
            <motion.div variants={card} className={`rounded-2xl border p-5 ${tone}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
                      Couche {i + 1}
                    </span>
                    <span className="text-sm font-bold text-ink">{layer.label}</span>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold italic text-ink/45">
                      {layer.metaphore}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-ink/80">{layer.techno}</div>
                  <p className="mt-1 text-sm leading-relaxed text-ink/55">{layer.detail}</p>
                </div>
              </div>
            </motion.div>
            {i < LAYERS.length - 1 && <Beam reduce={reduce} />}
          </div>
        )
      })}
    </motion.div>
  )
}
