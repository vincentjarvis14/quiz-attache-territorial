"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import {
  FileText,
  Scissors,
  Terminal,
  Sparkles,
  Braces,
  Database,
  Zap,
  type LucideIcon,
} from "lucide-react"

type Step = {
  n: string
  titre: string
  tag: string
  description: string
  Icon: LucideIcon
}

const STEPS: Step[] = [
  { n: "01", titre: "Sources documentaires", tag: "Input", Icon: FileText, description: "17 PDFs officiels : Code de l'Urbanisme, CGCT, textes réglementaires. 2 matières de concours couvertes." },
  { n: "02", titre: "Extraction du texte", tag: "pdf-parse", Icon: Scissors, description: "pdf-parse extrait le texte brut. Découpage en sections thématiques : 1 chunk = 1 concept juridique." },
  { n: "03", titre: "Construction du prompt", tag: "Prompt engineering", Icon: Terminal, description: "Rôle expert concours, format JSON strict, instruction d'ancrage littéral dans le chunk fourni." },
  { n: "04", titre: "Génération Claude Opus", tag: "LLM Anthropic", Icon: Sparkles, description: "Chaque chunk → API Anthropic. Opus génère 5–10 QCM : question, 4 options, bonne réponse, explication, source." },
  { n: "05", titre: "Validation & JSON", tag: "data/", Icon: Braces, description: "Output validé (structure, longueur, unicité). Chaque PDF produit un fichier generated_*.json." },
  { n: "06", titre: "Seed base de données", tag: "scripts/", Icon: Database, description: "Script TypeScript (tsx) insère dans Neon via Drizzle ORM en respectant la hiérarchie complète." },
  { n: "07", titre: "Lecture en production", tag: "Runtime", Icon: Zap, description: "L'app interroge Neon via Server Components. Zéro appel LLM en prod : qualité garantie, coût nul, latence SQL." },
]

const EASE = [0.21, 0.5, 0.3, 1] as const

const item: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
}

export function RagPipeline() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="relative"
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: 0.13 } } }}
    >
      {/* Ligne verticale qui se dessine */}
      <motion.div
        className="absolute left-[19px] top-3 bottom-3 w-px origin-top bg-gradient-to-b from-coral-400 via-coral-300 to-coral-100"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={reduce ? undefined : { scaleY: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.3, ease: EASE }}
      />

      <div className="space-y-3">
        {STEPS.map((step) => {
          const Icon = step.Icon
          return (
            <motion.div key={step.n} variants={item} className="relative flex gap-4">
              {/* Pastille icône */}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-coral-200 bg-white shadow-soft">
                <Icon className="h-[18px] w-[18px] text-coral-500" strokeWidth={1.75} />
              </div>
              {/* Contenu */}
              <div className="flex-1 rounded-2xl border border-ink/8 bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(31,29,27,0.16)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-ink/25">{step.n}</span>
                  <span className="text-sm font-bold text-ink">{step.titre}</span>
                  <span className="rounded-full border border-ink/8 bg-cream px-2 py-0.5 font-mono text-[10px] text-ink/40">
                    {step.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
