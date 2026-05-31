"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useReducedMotion, animate } from "framer-motion"
import { SpotlightCard } from "./spotlight-card"

// Animation signature de la page "Fonctionnalités MVP" :
// les critères du cahier des charges se cochent un à un (tracé SVG)
// pendant qu'un anneau de progression se remplit de 0 à 100 %.
// Déclenchée au scroll, neutralisée si prefers-reduced-motion.

const CRITERES = [
  "Créer un compte et se connecter de manière sécurisée",
  "Accéder à un tableau de bord",
  "Ajouter, organiser ou consulter des contenus",
  "Effectuer des recherches dans les ressources disponibles",
  "Obtenir des réponses contextualisées grâce à un mécanisme de RAG",
  "Retrouver l'historique des échanges ou recherches",
]

const EASE = [0.21, 0.5, 0.3, 1] as const
const TOTAL = CRITERES.length

// Géométrie de l'anneau
const SIZE = 132
const STROKE = 10
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export function CoverageMeter() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const [val, setVal] = useState(0) // 0 → TOTAL (flottant)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setVal(TOTAL)
      return
    }
    const controls = animate(0, TOTAL, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    })
    return () => controls.stop()
  }, [inView, reduce])

  const pct = Math.round((val / TOTAL) * 100)
  const checked = Math.floor(val + 1e-6)
  const complete = checked >= TOTAL

  return (
    <div ref={ref}>
    <SpotlightCard topAccent className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-ink">Couverture du cahier des charges</div>
        <motion.span
          initial={false}
          animate={{
            opacity: complete ? 1 : 0,
            scale: complete ? 1 : 0.8,
            y: complete ? 0 : 4,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="rounded-full bg-moss-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
        >
          100 % couvert
        </motion.span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Anneau de progression */}
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              className="text-ink/8"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - val / TOTAL)}
              className={complete ? "text-moss-500" : "text-coral-500"}
              style={{ transition: "stroke 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-black tabular-nums text-ink">{pct}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink/35">
              {checked}/{TOTAL} critères
            </span>
          </div>
        </div>

        {/* Liste des critères cochés un à un */}
        <ul className="flex-1 space-y-2.5">
          {CRITERES.map((critere, i) => {
            const on = reduce ? inView : i < checked
            return (
              <li key={critere} className="flex items-start gap-3">
                <motion.span
                  initial={false}
                  animate={{
                    backgroundColor: on ? "rgb(63,125,92)" : "rgba(31,29,27,0.06)",
                    scale: on ? [1, 1.18, 1] : 1,
                  }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: on ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  </svg>
                </motion.span>
                <motion.span
                  initial={false}
                  animate={{ color: on ? "rgba(31,29,27,0.75)" : "rgba(31,29,27,0.4)" }}
                  transition={{ duration: 0.3 }}
                  className="text-sm leading-snug"
                >
                  {critere}
                </motion.span>
              </li>
            )
          })}
        </ul>
      </div>
    </SpotlightCard>
    </div>
  )
}
