import Link from "next/link"
import { PrevNextNav } from "../prev-next-nav"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"

const COMPETENCES = [
  { titre: "Compréhension du besoin métier", detail: "Transformer \"préparer un concours\" en architecture précise : hiérarchie de données, flux utilisateur, gestion de la progression, types de quiz." },
  { titre: "Stack cohérent et justifié", detail: "Next.js 16 + Neon + Supabase Auth + Drizzle ORM + Claude Opus : chaque outil choisi pour une raison précise, avec alternatives considérées et rejetées documentées." },
  { titre: "Maîtrise du Vibe Coding", detail: "Claude Code comme outil central d'orchestration. Chaque fonctionnalité = dialogue structuré, prompt précis, validation fonctionnelle, itération." },
  { titre: "Intégration RAG réelle", detail: "17 PDFs officiels → extraction → génération Claude Opus → validation → seed DB. Chaque question cite sa source. ~760 QCM ancrées dans les textes officiels, plus une recherche juridique live." },
  { titre: "Supervision de la qualité", detail: "Questions filtrées et validées avant seed. Format JSON contrôlé. Tests manuels des flux quiz. Design system cohérent sur toutes les pages." },
  { titre: "MVP crédible et déployé", detail: "Application en production sur Vercel. Authentification réelle (Supabase) + mode invité, base de données persistée (Neon), quiz fonctionnel, progression cross-session." },
]

const RECAP = [
  { label: "Framework", value: "Next.js 16 (App Router, Turbopack)" },
  { label: "Base de données", value: "Neon PostgreSQL serverless" },
  { label: "ORM", value: "Drizzle ORM" },
  { label: "Authentification", value: "Supabase Auth + mode invité" },
  { label: "Génération IA", value: "Claude Opus (Anthropic)" },
  { label: "Vibe Coding", value: "Claude Code CLI" },
  { label: "Déploiement", value: "Vercel (Edge)" },
  { label: "Questions générées", value: "~760 QCM (17 PDFs)" },
]

export default function SynthesePage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">11 — Bilan</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">Synthèse</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Ce projet répond aux critères d'évaluation du challenge Vibe Coding.
          Voici ce qu'il démontre concrètement.
        </p>
        <ReadingMeta />
      </Reveal>

      <Stagger className="mt-10 space-y-3">
        {COMPETENCES.map((c, i) => (
          <StaggerItem key={c.titre}>
            <SpotlightCard topAccent className="p-5">
              <div className="flex gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-50 font-mono text-[10px] font-bold text-coral-500">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{c.titre}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{c.detail}</p>
                </div>
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Récap technique */}
      <Reveal>
        <SpotlightCard className="mt-10 p-6">
          <div className="mb-4 text-xs font-bold text-ink">Récapitulatif technique</div>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {RECAP.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 border-b border-ink/5 pb-3">
                <span className="text-xs text-ink/45">{item.label}</span>
                <span className="text-xs font-semibold text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <div className="mt-10 overflow-hidden rounded-2xl bg-ink p-8 text-center">
          <p className="font-display text-2xl font-black text-cream">Voir l'application en live</p>
          <p className="mt-1.5 text-sm text-cream/45">Créez un compte ou continuez en mode invité</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-coral-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-coral-600">
              Créer un compte →
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-cream/15 px-5 py-2.5 text-sm font-semibold text-cream/70 transition-colors hover:border-cream/35">
              Accueil
            </Link>
          </div>
        </div>
      </Reveal>

      <PrevNextNav current="/presentation/synthese" />
      </TracingBeam>
    </div>
  )
}
