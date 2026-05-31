"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronDown, Code2 } from "lucide-react"
import { SpotlightCard } from "./spotlight-card"
import { Reveal, Stagger, StaggerItem } from "./motion"
import type { QuerySource } from "@/lib/query-source"

const EASE = [0.21, 0.5, 0.3, 1] as const

type Badge = "req" | "data" | "live" | "write"
type Query = { name: string; role: string; badge: Badge }
type Group = { title: string; accent: "coral" | "moss" | "ink"; items: Query[] }

const GROUPS: Group[] = [
  {
    title: "Contenu & navigation",
    accent: "ink",
    items: [
      { name: "getThemes()", role: "Liste les 2 matières.", badge: "req" },
      { name: "getThemeById(id)", role: "Détail d'une matière.", badge: "req" },
      { name: "getSousThemes()", role: "Liste les sous-thèmes (1 par PDF).", badge: "req" },
      { name: "getSousThemesWithProgress()", role: "Sous-thèmes + statut d'avancement de l'utilisateur.", badge: "req" },
      { name: "getLesson(id?)", role: "Une leçon et ses questions.", badge: "req" },
      { name: "getCourseProgress()", role: "Avancement global, matière par matière.", badge: "req" },
    ],
  },
  {
    title: "Quiz — jouer",
    accent: "coral",
    items: [
      { name: "getQuestionsPool(ids, limit)", role: "Tire un pool mélangé de questions (mode libre).", badge: "req" },
      { name: "getQuestionsForSousTheme(…)", role: "Questions d'un sous-thème précis (mode leçon).", badge: "req" },
      { name: "createQuizSession(…)", role: "Ouvre une nouvelle session de quiz.", badge: "write" },
      { name: "getActiveSession(userId)", role: "Retrouve une session en cours pour la reprendre.", badge: "req" },
      { name: "updateQuizSession(…)", role: "Met à jour l'état de la session.", badge: "write" },
    ],
  },
  {
    title: "Révision — questions ratées",
    accent: "coral",
    items: [
      { name: "getDueCards(limit)", role: "Répétition espacée : renvoie les cartes dues aujourd'hui, complétées par des questions jamais vues.", badge: "req" },
      { name: "getRevisionCount()", role: "Nombre de cartes dues aujourd'hui (badge de navigation).", badge: "req" },
      { name: "getWeaknessQuestions(userId)", role: "Questions tirées des sous-thèmes les plus faibles.", badge: "req" },
      { name: "getMostMissedQuestions()", role: "Les questions le plus souvent ratées.", badge: "req" },
    ],
  },
  {
    title: "Progression & maîtrise",
    accent: "moss",
    items: [
      { name: "getUserProgress()", role: "Points cumulés + thème actif.", badge: "req" },
      { name: "getThemeProgress(userId)", role: "Avancement détaillé par matière.", badge: "req" },
      { name: "getProgressionBySousTheme()", role: "Données du tableau de bord /progression.", badge: "req" },
      { name: "getSousThemeStats(id)", role: "Taux de réussite et nombre de réponses d'un sous-thème.", badge: "req" },
      { name: "getSelfMastery() · getSelfMasteryMap()", role: "Maîtrise auto-déclarée (à revoir / en cours / maîtrisé).", badge: "req" },
    ],
  },
  {
    title: "Bibliothèque & RAG",
    accent: "moss",
    items: [
      { name: "getLibraryCatalog()", role: "Catalogue de la bibliothèque de cours.", badge: "data" },
      { name: "getLibraryTheme(slug)", role: "Sections de cours d'une matière.", badge: "data" },
      { name: "getSousThemeReading(…)", role: "Texte du cours + articles de loi liés.", badge: "data" },
      { name: "searchLegalChunks(query)", role: "Recherche plein-texte (BM25) dans le Code de l'urbanisme.", badge: "live" },
      { name: "searchQuestionsByText(search)", role: "Recherche de questions par mots-clés.", badge: "live" },
    ],
  },
  {
    title: "Écritures — Server Actions",
    accent: "ink",
    items: [
      { name: "recordAnswer(…) → saveUserAnswer(…)", role: "Enregistre chaque réponse et recalcule la maîtrise du sous-thème.", badge: "write" },
      { name: "setSelfMastery(id, niveau)", role: "Enregistre l'auto-évaluation de maîtrise.", badge: "write" },
      { name: "upsertUserProgress(themeId)", role: "Définit le thème actif / initialise la progression.", badge: "write" },
    ],
  },
  {
    title: "Statistiques",
    accent: "ink",
    items: [
      { name: "getMarketingStats()", role: "Compte questions et chapitres par matière (page d'accueil).", badge: "data" },
    ],
  },
]

const BADGE_META: Record<Badge, { label: string; cls: string }> = {
  req: { label: "cache requête", cls: "bg-ink/8 text-ink/55" },
  data: { label: "cache données", cls: "bg-moss-50 text-moss-700" },
  live: { label: "temps réel", cls: "bg-coral-50 text-coral-600" },
  write: { label: "écriture", cls: "bg-amber-100 text-amber-700" },
}

export function QueryCatalog({ code }: { code: Record<string, QuerySource> }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div>
      <Reveal>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40">
            Catalogue des requêtes
          </h3>
          <span className="text-[11px] text-ink/40">Clique sur une requête pour voir son code exact.</span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(BADGE_META) as Badge[]).map((b) => (
              <span key={b} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_META[b].cls}`}>
                {BADGE_META[b].label}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Stagger className="grid gap-3 md:grid-cols-2">
        {GROUPS.map((g) => (
          <StaggerItem key={g.title} className="h-full">
            <SpotlightCard accent={g.accent} className="h-full overflow-hidden">
              <div className="border-b border-ink/5 px-4 py-3">
                <span className="text-xs font-bold text-ink">{g.title}</span>
                <span className="ml-2 font-mono text-[10px] text-ink/30">{g.items.length}</span>
              </div>
              <ul>
                {g.items.map((q) => {
                  const src = code[q.name]
                  const isOpen = open === q.name
                  return (
                    <li key={q.name} className="border-t border-ink/5 first:border-t-0">
                      <button
                        type="button"
                        onClick={() => src && setOpen(isOpen ? null : q.name)}
                        aria-expanded={isOpen}
                        className={`flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors ${
                          src ? "cursor-pointer hover:bg-ink/[0.03]" : "cursor-default"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <code className="flex items-center gap-1.5 font-mono text-[12px] font-semibold text-ink">
                            {src && (
                              <Code2
                                className={`h-3.5 w-3.5 shrink-0 transition-colors ${isOpen ? "text-coral-500" : "text-ink/25"}`}
                                strokeWidth={2}
                              />
                            )}
                            {q.name}
                          </code>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${BADGE_META[q.badge].cls}`}>
                              {BADGE_META[q.badge].label}
                            </span>
                            {src && (
                              <ChevronDown
                                className={`h-3.5 w-3.5 text-ink/30 transition-transform duration-200 ${isOpen ? "rotate-180 text-coral-400" : ""}`}
                              />
                            )}
                          </div>
                        </div>
                        <p className="pl-0 text-[12px] leading-relaxed text-ink/55">{q.role}</p>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && src && (
                          <motion.div
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3">
                              <div className="overflow-hidden rounded-xl border border-ink/15 bg-[#1c1a18]">
                                <div className="flex items-center justify-between border-b border-white/8 bg-[#252220] px-3 py-1.5">
                                  <span className="font-mono text-[10px] text-cream/55">{src.file}</span>
                                  <span className="font-mono text-[9px] uppercase tracking-wider text-cream/30">
                                    code source
                                  </span>
                                </div>
                                <pre className="max-h-[420px] overflow-auto px-3 py-3 text-[11.5px] leading-[1.6]">
                                  <code className="font-mono text-cream/85">{src.code}</code>
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                })}
              </ul>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
