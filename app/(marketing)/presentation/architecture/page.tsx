import { SimpleFileTree } from "../simple-file-tree"
import { PrevNextNav } from "../prev-next-nav"
import { ArchitectureBeams } from "../architecture-beams"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { EnClair } from "../plain-box"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"
import { SectionHeading } from "../section-heading"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

const ROUTE_GROUPS = [
  {
    groupe: "(marketing)",
    routes: "/ · /presentation",
    description: "Pages publiques accessibles sans authentification. Stats de l'app chargées dynamiquement.",
  },
  {
    groupe: "(auth)",
    routes: "/sign-in · /sign-up",
    description: "Formulaires d'authentification Supabase. Layout centré dédié, différent du layout principal.",
  },
  {
    groupe: "(main)",
    routes: "/learn · /progression · /courses · /library",
    description: "Interface authentifiée (ou invité). Navigation, état de progression, bibliothèque de cours, données personnalisées.",
  },
]

export default function ArchitecturePage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">06 — Architecture</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Structure applicative
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          L'application est organisée en 4 couches distinctes qui séparent clairement
          la présentation, la logique métier, l'authentification et la persistance.
          Les données circulent de haut en bas.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6">
          <EnClair>
            Un site web fonctionne un peu comme un <strong>restaurant</strong> : la{" "}
            <strong>salle</strong> (ce que voit le client), la <strong>cuisine</strong>{" "}
            (qui prépare les commandes), le <strong>videur</strong> (qui vérifie qui entre)
            et le <strong>garde-manger</strong> (où tout est stocké). Ce sont les 4 couches
            ci-dessous : Présentation, Logique, Authentification et Persistance.
          </EnClair>
        </div>
      </Reveal>

      {/* Couches avec beams */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="couches" index="01" toc="Les 4 couches" className="mb-4">Les 4 couches</SectionHeading>
        </Reveal>
        <ArchitectureBeams />
      </div>

      {/* Route Groups */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="route-groups" index="02" toc="Route Groups" className="mb-2">Route Groups Next.js</SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            L'App Router organise les pages en groupes logiques qui partagent un layout
            sans modifier l'URL. Les parenthèses dans le nom du dossier indiquent un groupe.
          </p>
        </Reveal>
        <Stagger className="space-y-2">
          {ROUTE_GROUPS.map((g) => (
            <StaggerItem key={g.groupe}>
              <HoverBorderGradient containerClassName="h-full" className="h-full p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                  <code className="w-fit shrink-0 rounded-lg bg-coral-50 px-2.5 py-1 text-xs font-mono font-bold text-coral-500">
                    {g.groupe}
                  </code>
                  <div>
                    <div className="text-[11px] font-semibold text-ink/45">{g.routes}</div>
                    <p className="mt-0.5 text-sm text-ink/60">{g.description}</p>
                  </div>
                </div>
              </HoverBorderGradient>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* RSC */}
      <div className="mt-12">
        <Reveal>
          <SpotlightCard className="p-5">
            <SectionHeading id="rsc" index="03" toc="RSC" accent="ink" className="mb-2">React Server Components (RSC)</SectionHeading>
            <p className="text-sm leading-relaxed text-ink/60">
              Par défaut dans Next.js 16, tous les composants sont des Server Components :
              ils s'exécutent côté serveur, interrogent la DB directement, et n'envoient aucun
              JavaScript au navigateur. Le HTML arrive pré-rendu — meilleures performances et SEO.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { label: "Server Component (défaut)", desc: "Rendu serveur, accès DB direct, zéro JS client" },
                { label: "Client Component ('use client')", desc: "Rendu client, interactivité, hooks React" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-cream p-3">
                  <div className="text-[11px] font-bold text-ink">{item.label}</div>
                  <p className="mt-0.5 text-[11px] text-ink/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* Server Actions */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="server-actions" index="04" toc="Server Actions" className="mb-2">
            Mutations : les Server Actions
          </SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Les écritures (répondre à une question, mettre à jour la progression) passent par des
            Server Actions — des fonctions «&nbsp;use server&nbsp;» appelées directement depuis les
            composants, sans API REST à maintenir.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <SpotlightCard className="p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { fn: "recordAnswer()", file: "actions/answers.ts", desc: "Enregistre la réponse dans user_answers — base du mode révision." },
                { fn: "setSelfMastery()", file: "actions/self-mastery.ts", desc: "Maîtrise auto-déclarée d'un sous-thème." },
                { fn: "upsertUserProgress()", file: "actions/user-progress.ts", desc: "Points et thème actif de l'utilisateur." },
              ].map((a) => (
                <div key={a.fn} className="rounded-xl bg-cream p-3">
                  <code className="font-mono text-[11px] font-bold text-coral-500">{a.fn}</code>
                  <div className="mt-0.5 font-mono text-[10px] text-ink/35">{a.file}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink/55">{a.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-moss-500/20 bg-moss-50 p-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-moss-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[12px] leading-relaxed text-ink/65">
                <strong className="text-ink">Sécurité :</strong> l&apos;identité est résolue côté serveur via{" "}
                <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[11px] text-ink/70">auth()</code>{" "}
                (lib/auth.ts) — utilisateur Supabase, sinon invité par cookie.{" "}
                <strong className="text-ink">Le userId ne vient jamais du client.</strong>
              </p>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* File Tree */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="fichiers" index="05" toc="Fichiers" className="mb-2">Structure des fichiers</SectionHeading>
          <p className="mb-4 text-sm text-ink/55">Cliquez sur un dossier pour l'explorer.</p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="rounded-2xl border border-ink/8 bg-white shadow-soft">
            <SimpleFileTree />
          </div>
        </Reveal>
      </div>

      {/* Lien vers l'annexe : catalogue des requêtes */}
      <div className="mt-12">
        <Reveal>
          <Link href="/presentation/requetes" className="block">
            <SpotlightCard topAccent className="flex items-center gap-4 p-5">
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-coral-500">
                  Annexe
                </div>
                <div className="mt-1 text-base font-bold text-ink transition-colors group-hover:text-coral-600">
                  Les requêtes en coulisses
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink/55">
                  Comment l&apos;app interroge la base, et le catalogue complet des requêtes
                  (db/queries.ts) avec leur rôle.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-coral-500 transition-transform group-hover:translate-x-1" />
            </SpotlightCard>
          </Link>
        </Reveal>
      </div>

      <PrevNextNav current="/presentation/architecture" />

      </TracingBeam>
    </div>
  )
}
