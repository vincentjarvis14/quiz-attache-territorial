"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const EASE = [0.21, 0.5, 0.3, 1] as const

const FEATURES = [
  {
    numero: "01",
    titre: "Authentification sécurisée",
    critere: "Créer un compte et se connecter",
    description: "Inscription, connexion email/mot de passe et OAuth via Supabase Auth (@supabase/ssr). Sessions cookies rafraîchies par le middleware Next.js.",
    benefice: "Tu retrouves ta progression à chaque connexion — ou tu commences tout de suite en mode invité.",
    details: [
      "Middleware Next.js rafraîchit la session à chaque requête",
      "userId résolu côté serveur, jamais transmis par le client",
      "Mode invité par cookie (guest_id) pour découverte sans compte",
    ],
  },
  {
    numero: "02",
    titre: "Tableau de bord personnalisé",
    critere: "Accéder à un tableau de bord",
    description: "Page /progression : vue consolidée par matière et sous-thème. Statut d'avancement, taux de réussite et maîtrise auto-déclarée.",
    benefice: "Tu vois d'un coup d'œil ce qui est acquis et ce qu'il reste à travailler.",
    details: [
      "Points cumulés par session",
      "Suivi par sous-thème : not_started / in_progress / needs_review / mastered",
      "Auto-évaluation de maîtrise : à revoir / en cours / maîtrisé",
    ],
  },
  {
    numero: "03",
    titre: "Quiz interactif multi-modes",
    critere: "Effectuer des recherches / interagir avec les données",
    description: "QCM inspiré de Duolingo, trois modes : libre (pool mélangé), leçon (ciblée) et révision (rejoue en priorité les questions ratées).",
    benefice: "Le mode révision te fait retravailler en priorité ce que tu rates : pas de temps perdu sur l'acquis.",
    details: [
      "Mode révision basé sur la dernière réponse par question (user_answers)",
      "Explication détaillée + extrait source officiel après chaque réponse",
      "Confettis et animations de récompense",
    ],
  },
  {
    numero: "04",
    titre: "RAG : questions ancrées + recherche juridique",
    critere: "Réponses contextualisées grâce au RAG",
    description: "Questions générées offline depuis les PDF officiels par Claude Opus (chunk source stocké en DB). En complément, une recherche plein-texte BM25 dans le Code de l'urbanisme, sans appel LLM en production.",
    benefice: "Chaque réponse est justifiée par le texte officiel : tu apprends la bonne information, à la source.",
    details: [
      "sourceChunk : extrait littéral du texte officiel affiché à l'utilisateur",
      "Recherche live d'articles via /api/rag (search · ask · article)",
      "explanation : reformulation pédagogique générée à la création",
    ],
  },
  {
    numero: "05",
    titre: "Bibliothèque de cours",
    critere: "Organiser et consulter des contenus",
    description: "Page /library : cours par section, lecteur PDF intégré, articles-clés du Code de l'urbanisme et glossaire de notions juridiques cliquables.",
    benefice: "Tu relis le cours et les articles de loi sans quitter l'application, en complément des QCM.",
    details: [
      "Sections de cours liées aux articles de loi pertinents",
      "Lecteur PDF (react-pdf) des textes officiels source",
      "Glossaire : définitions de notions juridiques au survol",
    ],
  },
  {
    numero: "06",
    titre: "Progression persistée cross-session",
    critere: "Retrouver l'historique des échanges",
    description: "La progression est sauvegardée en base. Points, réponses et questions complétées survivent à la déconnexion (compte ou invité).",
    benefice: "Tu révises en plusieurs fois : rien n'est perdu entre deux sessions, même plusieurs jours après.",
    details: [
      "user_progress : points, thème actif",
      "user_sous_theme_progress : statut, taux de réussite, maîtrise",
      "user_answers : historique des réponses (alimente la révision)",
    ],
  },
]

export function FeaturesAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)
  const reduce = useReducedMotion()

  return (
    <div className="space-y-2">
      {FEATURES.map((f) => {
        const isOpen = openId === f.numero
        return (
          <div
            key={f.numero}
            className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
              isOpen ? "border-coral-200 bg-white" : "border-ink/8 bg-white"
            } shadow-soft`}
          >
            <button
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
              onClick={() => setOpenId(isOpen ? null : f.numero)}
            >
              <span className="font-display text-2xl font-black text-ink/15 shrink-0">
                {f.numero}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-ink">{f.titre}</div>
                <div className="mt-0.5 text-[11px] text-ink/40 truncate">Critère : {f.critere}</div>
              </div>
              <svg
                className={`h-4 w-4 shrink-0 text-ink/30 transition-transform duration-200 ${isOpen ? "rotate-180 text-coral-400" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-ink/6 px-5 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-ink/65">{f.description}</p>
                    <motion.ul
                      className="mt-3 space-y-1.5"
                      initial="hidden"
                      animate="show"
                      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
                    >
                      {f.details.map((d) => (
                        <motion.li
                          key={d}
                          variants={{
                            hidden: reduce ? {} : { opacity: 0, x: -8 },
                            show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
                          }}
                          className="flex items-start gap-2 text-xs text-ink/50"
                        >
                          <span className="mt-0.5 shrink-0 text-coral-400">·</span>
                          {d}
                        </motion.li>
                      ))}
                    </motion.ul>
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.18, ease: EASE }}
                      className="mt-4 flex items-start gap-2 rounded-xl border border-moss-500/15 bg-moss-50 px-3.5 py-2.5"
                    >
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-moss-700">
                        Pour réviser
                      </span>
                      <span className="text-xs leading-relaxed text-ink/60">{f.benefice}</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
