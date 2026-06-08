import Link from "next/link"
import {
  Sparkles,
  Layers,
  Network,
  Database,
  BrainCircuit,
  LayoutGrid,
  Award,
  Compass,
  Target,
  Wallet,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { SpotlightCard } from "./spotlight-card"
import { NumberTicker } from "./number-ticker"
import { Reveal, Stagger, StaggerItem } from "./motion"
import { ScrambleText } from "./hero-title"
import { TechNetwork } from "./tech-network"

type Section = {
  numero: string
  href: string
  titre: string
  description: string
  tag: string
  Icon: LucideIcon
  span: string
  accent: "coral" | "moss" | "ink"
}

const SECTIONS: Section[] = [
  { numero: "01", href: "/presentation/comment-ca-marche", titre: "Comprendre le site", tag: "Pour commencer", Icon: Compass, accent: "coral", span: "lg:col-span-6", description: "À lire en premier, sans jargon : à quoi sert le site, ce qui se passe quand on l'utilise, et où vivent les informations. Avec un mini-lexique des termes techniques." },
  { numero: "02", href: "/presentation/cadrage", titre: "Cadrage & cas d'usage", tag: "Analyse", Icon: Target, accent: "ink", span: "lg:col-span-3", description: "Du besoin à la solution : cas d'usage priorisés (MoSCoW), périmètre assumé, et contraintes traduites en choix de conception." },
  { numero: "03", href: "/presentation/vibe-coding", titre: "Vibe Coding", tag: "Démarche", Icon: Sparkles, accent: "coral", span: "lg:col-span-3", description: "Comment Claude Code a orchestré la construction du projet. Méthode en 3 temps, itérations V1→V2, posture de concepteur-orchestrateur." },
  { numero: "04", href: "/presentation/stack", titre: "Stack technique", tag: "Technologie", Icon: Layers, accent: "ink", span: "lg:col-span-2", description: "Next.js 16, Neon, Supabase Auth, Drizzle ORM, Tailwind. Pourquoi ces outils — avec les alternatives considérées et rejetées." },
  { numero: "05", href: "/presentation/architecture", titre: "Architecture", tag: "Technique", Icon: Network, accent: "moss", span: "lg:col-span-2", description: "4 couches applicatives, Route Groups, React Server Components, Server Actions et structure des fichiers explorable." },
  { numero: "06", href: "/presentation/base-de-donnees", titre: "Base de données", tag: "Données", Icon: Database, accent: "ink", span: "lg:col-span-2", description: "15 tables PostgreSQL, schéma Drizzle : contenu pédagogique, progression et RAG urbanisme." },
  { numero: "07", href: "/presentation/rag", titre: "Pipeline RAG", tag: "Intelligence Artificielle", Icon: BrainCircuit, accent: "coral", span: "lg:col-span-3", description: "De 17 PDFs officiels à ~760 questions QCM. Génération Claude Opus offline, plus une recherche juridique live dans le Code de l'urbanisme." },
  { numero: "08", href: "/presentation/fonctionnalites", titre: "Fonctionnalités MVP", tag: "Produit", Icon: LayoutGrid, accent: "ink", span: "lg:col-span-3", description: "Les 6 fonctionnalités livrées et leur correspondance au cahier des charges." },
  { numero: "09", href: "/presentation/couts-tests", titre: "Coûts & tests", tag: "Fiabilité", Icon: Wallet, accent: "moss", span: "lg:col-span-3", description: "Hébergement à 0 €/mois sur offres gratuites (pièges anticipés) et qualité fiabilisée : validation du contenu + 24 tests unitaires." },
  { numero: "10", href: "/presentation/synthese", titre: "Synthèse", tag: "Bilan", Icon: Award, accent: "coral", span: "lg:col-span-3", description: "Ce que ce projet démontre : compétences et MVP déployé." },
]

const METRIQUES = [
  { value: 760, suffix: "+", label: "Questions QCM" },
  { value: 17, suffix: "", label: "PDFs officiels" },
  { value: 2, suffix: "", label: "Matières" },
  { value: 100, suffix: "%", label: "Ancrage source" },
]

export default function PresentationOverviewPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Aurora subtil */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-coral-200/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-moss-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">

        {/* Hero */}
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-coral-50 px-3 py-1 text-xs font-semibold text-coral-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral-500" />
            Livrable de formation — Rapport technique
          </div>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.92] tracking-tight text-ink md:text-7xl">
            <ScrambleText text="Quiz Attaché" /><br />
            <ScrambleText text="Territorial" className="text-coral-500" delay={520} />
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/60 md:text-lg">
            Application web de préparation au concours, construite par orchestration IA.
            Ce rapport documente les choix techniques, la démarche Vibe Coding et le pipeline RAG.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="group inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-ink/80 hover:gap-2.5">
              Voir l'application
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/presentation/comment-ca-marche" className="inline-flex items-center gap-2 rounded-xl border border-ink/12 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink backdrop-blur transition-colors hover:border-ink/25">
              Lire le rapport
            </Link>
          </div>
        </Reveal>

        {/* Métriques avec ticker */}
        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {METRIQUES.map((m) => (
            <StaggerItem key={m.label}>
              <SpotlightCard topAccent className="px-5 py-4">
                <div className="font-display text-3xl font-black text-ink md:text-4xl">
                  <NumberTicker value={m.value} suffix={m.suffix} />
                </div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/35">{m.label}</div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Écosystème technique — réseau animé des relations */}
        <div className="mt-16">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/35">Vue d'ensemble technique</p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-ink md:text-3xl">
              Un écosystème, des briques qui dialoguent
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55">
              Tout est écrit en <span className="font-semibold text-ink">TypeScript</span> sur{" "}
              <span className="font-semibold text-ink">Next.js / React</span>, parle à{" "}
              <span className="font-semibold text-ink">Neon Postgres</span> via{" "}
              <span className="font-semibold text-ink">Drizzle</span>, s'authentifie avec{" "}
              <span className="font-semibold text-ink">Supabase</span>, se style avec{" "}
              <span className="font-semibold text-ink">Tailwind</span> — et son contenu est produit hors-ligne par{" "}
              <span className="font-semibold text-ink">Claude Opus</span>. Survolez une brique pour révéler ses liens.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <TechNetwork />
          </Reveal>
        </div>

        {/* Bento sections */}
        <div className="mt-16">
          <Reveal>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-widest text-ink/35">Explorer le rapport</p>
          </Reveal>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {SECTIONS.map((s) => {
              const Icon = s.Icon
              const iconTone =
                s.accent === "coral"
                  ? "bg-coral-50 text-coral-500"
                  : s.accent === "moss"
                  ? "bg-moss-50 text-moss-700"
                  : "bg-ink/8 text-ink/60"
              return (
                <StaggerItem key={s.href} className={s.span}>
                  <Link href={s.href} className="block h-full">
                    <SpotlightCard topAccent accent={s.accent} className="h-full p-5">
                      <div className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconTone}`}>
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                          </span>
                          <span className="font-mono text-[10px] font-bold text-ink/20">{s.numero}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/45">
                            {s.tag}
                          </span>
                        </div>
                        <div className="mt-2 text-base font-bold text-ink transition-colors group-hover:text-coral-600">
                          {s.titre}
                        </div>
                        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink/50">{s.description}</p>
                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-coral-500 opacity-0 transition-all duration-200 group-hover:opacity-100">
                          Explorer
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>

      </div>
    </div>
  )
}
