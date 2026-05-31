"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"

// Animation signature de la page "Vue d'ensemble" : hero typographique.
// Le texte se "décode" caractère par caractère à l'arrivée (effet scramble),
// puis se verrouille de gauche à droite. Respecte prefers-reduced-motion.

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ@#%&$/\\<>*+=".split("")
const TICK_MS = 38 // cadence de rafraîchissement du scramble
const STEP_MS = 62 // temps de verrouillage d'un caractère

export function ScrambleText({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  // État initial = texte complet → HTML serveur correct (SEO + pas de mismatch).
  const [display, setDisplay] = useState<string>(text)
  const seedRef = useRef(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(text)
      return
    }
    const chars = Array.from(text)
    const scramble = (n: number) =>
      chars.map((c, i) => (c === " " ? " " : GLYPHS[(i * 31 + n * 17) % GLYPHS.length])).join("")
    // On brouille immédiatement après le 1er paint pour amorcer le décodage.
    setDisplay(scramble(0))
    let elapsed = 0
    const id = setInterval(() => {
      elapsed += TICK_MS
      seedRef.current += 1
      const revealed = Math.floor((elapsed - delay) / STEP_MS)

      const out = chars
        .map((c, i) => {
          if (c === " ") return " "
          if (i < revealed) return c
          if (elapsed < delay) return ""
          // caractère encore brouillé : glyphe pseudo-aléatoire
          const r = (i * 31 + seedRef.current * 17) % GLYPHS.length
          return GLYPHS[r]
        })
        .join("")

      setDisplay(out)
      if (revealed >= chars.length) clearInterval(id)
    }, TICK_MS)

    return () => clearInterval(id)
  }, [text, delay, reduce])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
