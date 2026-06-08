"use client"

import { useEffect, useState } from "react"
import { Clock, AlignLeft } from "lucide-react"

/**
 * Méta de lecture (temps estimé + nombre de mots), mesurée automatiquement
 * à partir du contenu réel de la page. ~200 mots/min (lecture technique FR).
 */
export function ReadingMeta() {
  const [stats, setStats] = useState<{ minutes: number; words: number } | null>(null)

  useEffect(() => {
    const main = document.querySelector("main")
    const text = main?.textContent ?? ""
    const words = text.trim().split(/\s+/).filter(Boolean).length
    setStats({ words, minutes: Math.max(1, Math.round(words / 200)) })
  }, [])

  return (
    <div className="mt-5 flex items-center gap-4 text-[11px] font-medium text-ink/40">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
        {stats ? `${stats.minutes} min de lecture` : "— min de lecture"}
      </span>
      <span className="h-3 w-px bg-ink/15" />
      <span className="inline-flex items-center gap-1.5">
        <AlignLeft className="h-3.5 w-3.5" strokeWidth={2} />
        {stats ? `${stats.words.toLocaleString("fr-FR")} mots` : "…"}
      </span>
    </div>
  )
}
