import { PrevNextNav } from "../prev-next-nav"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"
import { SectionHeading } from "../section-heading"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

const ETAPES = [
  { n: "01", titre: "Cadrer", description: "Transformer un besoin métier en spec technique. L'IA aide à formaliser les contraintes : hiérarchie des données, routes, schéma DB, pipeline RAG. Rien n'est codé tant que l'architecture n'est pas claire." },
  { n: "02", titre: "Générer", description: "Chaque module demandé avec son contexte complet (fichiers existants, conventions du projet, contraintes). Claude Code génère, je lis, comprends et valide fonctionnellement. Pas de merge aveugle." },
  { n: "03", titre: "Itérer", description: "Bugs identifiés → prompt de correction précis (état observé vs attendu). Nouvelle feature → prompt d'extension en cohérence avec l'existant. La boucle tourne jusqu'à satisfaction." },
]

const ITERATIONS = [
  { tag: "V1", titre: "Prototype vanilla", periode: "Semaine 1–2", description: "HTML/CSS/JS pur, aucun framework. Quiz fonctionnel en SPA avec questions dans un JSON local. Aucune persistance, aucune authentification. Objectif : valider le concept rapidement.", note: "Résultat : le concept fonctionne. Limite : pas de RAG, pas de back-end, pas de scalabilité.", coral: false },
  { tag: "V2", titre: "Migration Next.js full-stack", periode: "Semaine 3–5", description: "Réécriture complète orchestrée par Claude Code. App Router, Neon DB, Supabase Auth, pipeline RAG offline + recherche live, bibliothèque de cours. ~760 questions générées depuis 17 PDFs officiels et chargées en base.", note: "Résultat : stack production, architecture propre, pipeline IA documenté, app déployée.", coral: true },
]

export default function VibeCodingPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">03 — Démarche</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">Vibe Coding</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Ce projet n'a pas été construit ligne par ligne. Il a été <strong className="font-semibold text-ink">orchestré</strong> :
          chaque fonctionnalité est le résultat d'un dialogue structuré avec une IA, d'une validation
          fonctionnelle, et d'une itération sur le résultat obtenu.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-8 rounded-2xl border border-coral-200 bg-coral-50 p-6">
          <p className="text-sm font-bold text-ink">Le Vibe Coding en pratique</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/65">
            La posture n'est pas celle d'un développeur qui écrit du code, mais d'un
            <strong className="font-semibold text-ink"> concepteur-orchestrateur</strong> qui transforme
            un besoin métier en produit numérique en pilotant l'IA avec les bons prompts,
            les bonnes itérations et les bonnes validations.
          </p>
        </div>
      </Reveal>

      {/* 3 étapes */}
      <div className="mt-10">
        <Reveal><SectionHeading id="methode" index="01" toc="Méthode 3 temps" className="mb-4">La méthode en 3 temps</SectionHeading></Reveal>
        <Stagger className="space-y-3">
          {ETAPES.map((e) => (
            <StaggerItem key={e.n}>
              <SpotlightCard topAccent className="p-5">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral-500 font-mono text-[10px] font-bold text-white">
                    {e.n}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink">{e.titre}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{e.description}</p>
                  </div>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* Claude Code */}
      <div className="mt-10">
        <Reveal><SectionHeading id="claude-code" index="02" toc="Claude Code" className="mb-4">L'outil central : Claude Code</SectionHeading></Reveal>
        <Reveal delay={0.05}>
          <SpotlightCard accent="ink" className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-black text-cream">AI</div>
              <div>
                <div className="text-sm font-bold text-ink">Claude Code — CLI Anthropic</div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                  Interface en ligne de commande avec accès complet aux fichiers du projet.
                  Capable de lire le codebase, écrire du code, refactoriser, déboguer et tester
                  dans le contexte réel. Chaque session commence par une description du besoin,
                  pas par l'ouverture d'un éditeur.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Lecture fichiers", "Écriture code", "Refactoring", "Debug", "Git", "Tests"].map((t) => (
                    <span key={t} className="rounded-full border border-ink/10 bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-ink/60">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* Chronologie */}
      <div className="mt-10">
        <Reveal><SectionHeading id="chronologie" index="03" toc="Chronologie" className="mb-4">Chronologie des itérations</SectionHeading></Reveal>
        <Stagger className="space-y-3">
          {ITERATIONS.map((it) => (
            <StaggerItem key={it.tag}>
              <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-black text-ink shadow-soft">{it.tag}</span>
                  <div>
                    <div className="text-sm font-bold text-ink">{it.titre}</div>
                    <div className="text-[11px] text-ink/40">{it.periode}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-ink/65">{it.description}</p>
                <p className="mt-2.5 text-[12px] italic text-ink/40">{it.note}</p>
              </HoverBorderGradient>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <PrevNextNav current="/presentation/vibe-coding" />
      </TracingBeam>
    </div>
  )
}
