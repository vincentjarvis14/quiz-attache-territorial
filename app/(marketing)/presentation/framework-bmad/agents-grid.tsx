"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, type LucideIcon } from "lucide-react"
import {
  Search,
  ClipboardList,
  Palette,
  DraftingCompass,
  ListChecks,
  KanbanSquare,
  Code2,
  ShieldCheck,
} from "lucide-react"

import { SpotlightCard } from "../spotlight-card"
import { Stagger, StaggerItem } from "../motion"

type Accent = "coral" | "moss" | "ink"

export type Agent = {
  persona: string
  role: string
  Icon: LucideIcon
  accent: Accent
  mission: string
  projet: string
  // Tâches, missions et modifications concrètes réalisées sur le projet.
  realisations: string[]
}

// Les agents « cœur » du cycle de développement BMAD, chacun avec sa
// responsabilité, sa traduction concrète et le détail de ses réalisations
// sur Quiz Attaché Territorial.
export const AGENTS: Agent[] = [
  {
    persona: "Mary",
    role: "Analyste",
    Icon: Search,
    accent: "coral",
    mission:
      "Point d'entrée du cycle. Recherche le domaine, formalise le besoin et le périmètre, produit le brief initial.",
    projet:
      "Cadrage du concours d'Attaché Territorial : matières visées (urbanisme, environnement territorial), corpus de 17 PDF officiels, cas d'usage priorisés (MoSCoW) et contraintes de l'épreuve.",
    realisations: [
      "Cadrage des épreuves et attendus du jury du concours d'Attaché Territorial.",
      "Identification des matières prioritaires : urbanisme et environnement territorial.",
      "Constitution du corpus source : 17 PDF officiels (dossier Source RAG/).",
      "Priorisation MoSCoW des cas d'usage de révision.",
      "Brief initial : profil mono-utilisateur, contraintes de l'épreuve, objectifs de révision.",
    ],
  },
  {
    persona: "John",
    role: "Product Manager",
    Icon: ClipboardList,
    accent: "ink",
    mission:
      "Traduit le brief en spécification produit : un PRD avec exigences fonctionnelles et non-fonctionnelles, découpé en epics.",
    projet:
      "Périmètre du MVP mono-utilisateur — exclusion assumée de tout module social ou compétitif. Les 6 fonctionnalités livrées : quiz libre / leçon / révision, bibliothèque, recherche, progression.",
    realisations: [
      "Rédaction du PRD : exigences fonctionnelles et non-fonctionnelles.",
      "Définition du périmètre MVP mono-utilisateur.",
      "Exclusion explicite de tout module social ou compétitif (ligues, classements, défis).",
      "Découpage en epics : quiz, bibliothèque, recherche, progression.",
      "Cadrage des 6 fonctionnalités : quiz libre / leçon / révision, bibliothèque, recherche, progression.",
    ],
  },
  {
    persona: "Sally",
    role: "UX Expert",
    Icon: Palette,
    accent: "moss",
    mission:
      "Conçoit les parcours, les écrans et les schémas d'interaction avant le code. Garantit une expérience cohérente.",
    projet:
      "Design system maison — corail #E85C51, cream #FBF1E7, ink — parcours inspiré de Duolingo, lecteur de quiz, tableau de bord et reprise de quiz interrompu.",
    realisations: [
      "Design system maison : corail #E85C51, cream #FBF1E7, ink #1F1D1B.",
      "Parcours d'apprentissage inspiré de Duolingo (thèmes → sous-thèmes → leçons).",
      "Conception du lecteur de quiz et de ses états (réponse, correction, source).",
      "Tableau de bord et bandeau « J-X » avant le concours.",
      "Reprise d'un quiz quitté en cours, profil avec avatar à initiales et nom éditable.",
    ],
  },
  {
    persona: "Winston",
    role: "Architecte",
    Icon: DraftingCompass,
    accent: "ink",
    mission:
      "Pose les fondations techniques : stack, découpage en couches, flux de données, stratégie d'intégration. Produit le document d'architecture.",
    projet:
      "Next.js 16 (App Router), 4 couches applicatives, React Server Components + Server Actions, Neon Postgres via Drizzle, Supabase Auth, et le pipeline RAG offline (génération une fois, servie sans LLM).",
    realisations: [
      "Choix de la stack : Next.js 16 (App Router, Turbopack), React 19, TypeScript.",
      "Découpage en 4 couches : Server Components → Server Actions → requêtes Drizzle → Neon.",
      "Modèle de données inspiré de Duolingo (thèmes → sous-thèmes → leçons → challenges).",
      "Pipeline RAG offline : Code de l'urbanisme, recherche plein-texte BM25, sans LLM en production.",
      "Authentification Supabase (@supabase/ssr) avec fallback invité par cookie.",
    ],
  },
  {
    persona: "Sarah",
    role: "Product Owner",
    Icon: ListChecks,
    accent: "coral",
    mission:
      "Garde la cohérence du backlog : valide les artefacts, découpe (shard) les documents et fixe les critères d'acceptation.",
    projet:
      "Découpage du schéma en 15 tables cohérentes, critères d'acceptation des features (ancrage strict à la source, répétition espacée Leitner) et alignement entre PRD et architecture.",
    realisations: [
      "Validation de la cohérence entre le PRD et l'architecture.",
      "Découpage (sharding) du schéma de données en 15 tables cohérentes.",
      "Critères d'acceptation : ancrage strict à la source, répétition espacée (Leitner).",
      "Règle de révision : se baser sur la dernière réponse par question.",
      "Alignement des artefacts (brief, PRD, architecture) avant tout développement.",
    ],
  },
  {
    persona: "Bob",
    role: "Scrum Master",
    Icon: KanbanSquare,
    accent: "moss",
    mission:
      "Transforme les epics en stories « prêtes pour le dev » : contexte complet, sans ambiguïté, exécutables d'un bloc.",
    projet:
      "Stories autonomes telles que « réviser mes erreurs », « reprendre un quiz quitté en cours » ou « recherche juridique live » — chacune cadrée avant écriture du moindre code.",
    realisations: [
      "Story « réviser mes erreurs » : mode révision qui rejoue en priorité les questions ratées.",
      "Story « reprendre un quiz quitté en cours ».",
      "Story « recherche juridique live » appuyée sur le RAG urbanisme.",
      "Story « profil utilisateur » : avatar, nom éditable, J-X concours, déconnexion.",
      "Chaque story livrée avec son contexte complet et ses critères d'acceptation.",
    ],
  },
  {
    persona: "James",
    role: "Développeur",
    Icon: Code2,
    accent: "ink",
    mission:
      "Implémente une story à la fois, en stricte adhérence au contexte fourni : code et tests, sans interpréter au-delà.",
    projet:
      "Server Components et Server Actions (recordAnswer…), requêtes Drizzle, composants UI, et scripts de génération des ~760 questions via Claude Opus.",
    realisations: [
      "Server Components et Server Actions : recordAnswer, user-progress, self-mastery.",
      "Requêtes Drizzle centralisées (db/queries.ts) avec cache React.",
      "Composants UI : lecteur de quiz, tableau de bord, bibliothèque.",
      "Scripts de génération des ~760 questions via Claude Opus, ancrées sur les PDF.",
      "Migrations Drizzle et seed des thèmes et des questions générées.",
    ],
  },
  {
    persona: "Quinn",
    role: "QA / Test Architect",
    Icon: ShieldCheck,
    accent: "coral",
    mission:
      "Définit la stratégie de test et les portes de qualité (quality gates). Couverture d'abord, fiabilité avant tout.",
    projet:
      "24 tests unitaires, validation automatique du contenu généré (rejet des questions non ancrées) et audit qualité ayant tranché la bascule DeepSeek → Opus.",
    realisations: [
      "24 tests unitaires couvrant la logique de révision et de progression.",
      "Validation automatique du contenu généré : rejet des questions non ancrées à la source.",
      "Audit qualité ayant tranché la bascule DeepSeek → Opus pour la génération.",
      "Quality gates sur le pipeline de génération des questions.",
      "Fiabilisation de l'ancrage strict : chaque réponse cite sa source.",
    ],
  },
]

const toneFor = (accent: Accent) =>
  accent === "coral"
    ? "bg-coral-50 text-coral-500"
    : accent === "moss"
    ? "bg-moss-50 text-moss-700"
    : "bg-ink/8 text-ink/60"

export function AgentsGrid() {
  const [selected, setSelected] = useState<Agent | null>(null)

  // Fermeture au clavier (Échap) + verrouillage du scroll de fond.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [selected])

  return (
    <>
      <Stagger className="grid gap-3 sm:grid-cols-2">
        {AGENTS.map((a) => {
          const Icon = a.Icon
          return (
            <StaggerItem key={a.persona} className="h-full">
              <button
                type="button"
                onClick={() => setSelected(a)}
                aria-label={`Voir le détail de l'agent ${a.role}`}
                className="block h-full w-full text-left"
              >
                <SpotlightCard
                  accent={a.accent}
                  className="flex h-full flex-col p-5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneFor(a.accent)}`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-ink">{a.role}</div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink/35">
                        {a.persona}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-ink/60">{a.mission}</p>
                  <div className="mt-3 rounded-xl bg-cream p-3">
                    <div className="mb-1 text-[9.5px] font-bold uppercase tracking-widest text-coral-500">
                      Sur ce projet
                    </div>
                    <p className="text-[12px] leading-relaxed text-ink/60">{a.projet}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-coral-500">
                    Voir les réalisations
                    <span aria-hidden>→</span>
                  </div>
                </SpotlightCard>
              </button>
            </StaggerItem>
          )
        })}
      </Stagger>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label={`Réalisations de l'agent ${selected.role}`}
              className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
            >
              {/* En-tête */}
              <div className="flex items-start gap-4 border-b border-ink/10 bg-white/60 p-6 pr-14 sm:p-8 sm:pr-16">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${toneFor(selected.accent)}`}
                >
                  <selected.Icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink/35">
                    {selected.persona}
                  </div>
                  <h3 className="font-display text-2xl font-black leading-tight text-ink sm:text-3xl">
                    {selected.role}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-ink sm:right-6 sm:top-6"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Corps défilable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-coral-500">
                  Mission dans la méthode
                </div>
                <p className="text-sm leading-relaxed text-ink/70">{selected.mission}</p>

                <div className="mt-6 rounded-2xl bg-white p-5">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-coral-500">
                    Sur ce projet
                  </div>
                  <p className="text-sm leading-relaxed text-ink/70">{selected.projet}</p>
                </div>

                <div className="mt-6 mb-3 text-[10px] font-bold uppercase tracking-widest text-coral-500">
                  Tâches &amp; réalisations
                </div>
                <ul className="space-y-2.5">
                  {selected.realisations.map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-[18px] w-[18px] shrink-0 text-coral-500"
                        strokeWidth={2}
                      />
                      <span className="text-[13.5px] leading-relaxed text-ink/75">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
