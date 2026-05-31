"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SpotlightCard } from "./spotlight-card"

const CATEGORIES = [
  {
    id: "frontend",
    label: "Frontend",
    items: [
      { name: "Next.js 16", role: "Boîte à outils du site", why: "Sert à fabriquer tout le site, pages visibles comme coulisses, sans repartir de zéro (framework full-stack, App Router + Turbopack)." },
      { name: "React 19", role: "Construction des pages", why: "Permet de bâtir l'interface à partir de petits blocs réutilisables ; une bonne partie est préparée sur le serveur, donc l'affichage est plus rapide." },
      { name: "Tailwind CSS", role: "Mise en forme", why: "Donne un style cohérent sur tout le site et n'envoie au navigateur que le strict nécessaire (pages plus légères)." },
      { name: "shadcn/ui", role: "Composants prêts", why: "Des boutons, fenêtres et menus prêts à l'emploi, dont le code nous appartient : 100 % personnalisables." },
      { name: "Framer Motion", role: "Animations", why: "Anime les transitions de façon fluide, sans ralentir le site." },
    ],
  },
  {
    id: "database",
    label: "Base de données",
    items: [
      { name: "Neon (PostgreSQL)", role: "Le classeur des données", why: "Conserve durablement questions, réponses et progression. Elle se met en veille quand personne ne l'utilise : aucun coût à vide (serverless)." },
      { name: "Drizzle ORM", role: "Traducteur code ↔ données", why: "Évite d'écrire des requêtes compliquées à la main et limite les erreurs (ORM typé)." },
    ],
  },
  {
    id: "auth",
    label: "Auth",
    items: [
      { name: "Supabase Auth", role: "Comptes & connexion", why: "Gère l'inscription, le mot de passe et la connexion Google, en gardant la session active automatiquement." },
      { name: "Mode invité", role: "Essayer sans compte", why: "Un simple cookie permet de tester immédiatement et de conserver sa progression, même sans inscription." },
    ],
  },
  {
    id: "ai",
    label: "IA & Vibe Coding",
    items: [
      { name: "Claude Opus (Anthropic)", role: "Rédige les questions", why: "L'IA qui lit les documents officiels et rédige les QCM en s'appuyant strictement sur le texte source (pas d'invention)." },
      { name: "Claude Code CLI", role: "Assistant de construction", why: "L'outil avec lequel le site a été construit : il lit le projet, écrit le code, corrige et teste, sur instructions." },
      { name: "OpenAI API", role: "Génération V1 (ancienne)", why: "Utilisée lors de la première version, avant de passer à Claude Opus pour une meilleure qualité." },
    ],
  },
  {
    id: "infra",
    label: "Hébergement",
    items: [
      { name: "Vercel", role: "Met le site en ligne", why: "Publie le site sur internet et le met à jour automatiquement à chaque modification." },
      { name: "pdf-parse", role: "Lit les PDF", why: "Extrait le texte des documents officiels pour permettre à l'IA de rédiger les questions." },
    ],
  },
]

const REJECTED = [
  { outil: "Lovable / Bolt", raison: "Moins de contrôle sur l'architecture DB et le pipeline RAG offline" },
  { outil: "Supabase Postgres", raison: "Neon pour la DB (branches natives, Drizzle + PostgreSQL pur) ; Supabase conservé uniquement pour l'auth" },
  { outil: "Clerk", raison: "Supabase Auth : déjà dans la stack, sessions cookies SSR natives App Router, pas de service tiers supplémentaire" },
  { outil: "Prisma ORM", raison: "Drizzle : bundle plus léger, meilleure compatibilité Edge/serverless" },
  { outil: "GPT-4 pour les questions", raison: "Claude Opus : meilleure qualité sur les textes juridiques français" },
  { outil: "RAG génératif en prod", raison: "Génération offline + recherche plein-texte BM25 : zéro coût LLM par requête, qualité maîtrisée" },
]

export function StackTabs() {
  const [active, setActive] = useState("frontend")
  const [showRejected, setShowRejected] = useState(false)

  const current = CATEGORIES.find((c) => c.id === active)!

  return (
    <div>
      {/* Tab pills avec indicateur glissant */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                isActive ? "text-cream" : "border border-ink/10 bg-white text-ink/55 hover:border-ink/20 hover:text-ink"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="stackTabIndicator"
                  className="absolute inset-0 -z-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Items */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.21, 0.5, 0.3, 1] }}
      >
        <SpotlightCard className="overflow-hidden">
          {current.items.map((item, i) => (
            <div key={item.name} className={`p-5 ${i > 0 ? "border-t border-ink/5" : ""}`}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-6">
                <div className="sm:w-44 shrink-0">
                  <div className="text-sm font-bold text-ink">{item.name}</div>
                  <div className="mt-0.5 text-[11px] text-ink/40">{item.role}</div>
                </div>
                <p className="text-sm leading-relaxed text-ink/60">
                  <span className="font-semibold text-coral-500">Pourquoi : </span>
                  {item.why}
                </p>
              </div>
            </div>
          ))}
        </SpotlightCard>
      </motion.div>

      {/* Alternatives rejetées — accordion */}
      <div className="mt-3">
        <button
          onClick={() => setShowRejected(!showRejected)}
          className="flex w-full items-center justify-between rounded-xl border border-ink/8 bg-white px-5 py-3.5 text-sm font-semibold text-ink shadow-soft transition-colors hover:bg-ink/2"
        >
          <span>Alternatives considérées et rejetées</span>
          <svg
            className={`h-4 w-4 text-ink/30 transition-transform duration-200 ${showRejected ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showRejected && (
          <div className="rounded-b-xl border border-t-0 border-ink/8 bg-white px-5 pb-5 shadow-soft">
            <div className="grid gap-2 pt-4 sm:grid-cols-2">
              {REJECTED.map((a) => (
                <div key={a.outil} className="rounded-xl bg-ink/[0.03] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink/25">✕</span>
                    <span className="text-sm font-semibold text-ink">{a.outil}</span>
                  </div>
                  <p className="mt-1 pl-4 text-[12px] leading-relaxed text-ink/50">{a.raison}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
