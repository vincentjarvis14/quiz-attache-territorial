import { PrevNextNav } from "../prev-next-nav"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { Timeline, type TimelineEntry } from "@/components/ui/timeline"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { EnClair } from "../plain-box"
import { Callout } from "../callout"
import { SectionHeading } from "../section-heading"
import { ReadingMeta } from "../reading-meta"
import { AgentsGrid } from "./agents-grid"
import { Workflow, Wand2, type LucideIcon } from "lucide-react"

type Agent = {
  persona: string
  role: string
  Icon: LucideIcon
  accent: "coral" | "moss" | "ink"
  mission: string
  projet: string
}

// Les deux agents « méta » : ils ne portent pas une étape, ils orchestrent.
const META: Agent[] = [
  {
    persona: "BMad Orchestrator",
    role: "Chef d'orchestre",
    Icon: Workflow,
    accent: "coral",
    mission:
      "Coordonne le cycle, aiguille vers le bon agent et peut endosser n'importe quel rôle. Idéal en phase de planification.",
    projet:
      "Le rôle tenu au quotidien : enchaîner cadrage → conception → implémentation → validation, et basculer de casquette selon l'étape en cours.",
  },
  {
    persona: "BMad Master",
    role: "Exécuteur universel",
    Icon: Wand2,
    accent: "ink",
    mission:
      "Couteau suisse capable d'exécuter n'importe quelle tâche sans changer d'agent, pour les actions ponctuelles.",
    projet:
      "Tâches transverses hors cycle : refactorings ciblés, migrations de schéma, scripts de seed, correctifs rapides.",
  },
]

const PHASES: TimelineEntry[] = [
  {
    marker: "01",
    title: "Analyse",
    tag: "Analyste",
    content:
      "Comprendre le concours et le corpus. Besoin métier, matières, cas d'usage priorisés et contraintes deviennent un brief clair. Rien n'est codé tant que le cadre n'est pas posé.",
  },
  {
    marker: "02",
    title: "Planification",
    tag: "PM + UX Expert",
    content:
      "Le brief devient un PRD : périmètre MVP mono-utilisateur, 6 fonctionnalités, exclusions assumées. En parallèle, l'UX définit le design system corail et les parcours.",
  },
  {
    marker: "03",
    title: "Architecture",
    tag: "Architecte + PO",
    content:
      "Choix de la stack et du modèle de données : Next.js, Neon, Drizzle, Supabase, pipeline RAG. Le PO valide la cohérence entre le PRD et l'architecture.",
  },
  {
    marker: "04",
    title: "Stories",
    tag: "Scrum Master",
    content:
      "Les epics sont découpés en stories dev-ready : contexte complet, critères d'acceptation, zéro ambiguïté. Chaque story est exécutable d'un bloc.",
  },
  {
    marker: "05",
    title: "Implémentation",
    tag: "Développeur",
    content:
      "Une story à la fois. Code, Server Actions et requêtes générés avec le contexte du projet, lus et validés fonctionnellement — jamais fusionnés à l'aveugle.",
  },
  {
    marker: "06",
    title: "Qualité",
    tag: "QA",
    content:
      "Tests et portes de qualité : 24 tests unitaires, validation automatique des questions, audit qualité. La boucle 04→06 tourne jusqu'à satisfaction.",
  },
]

export default function FrameworkBmadPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">04 — Méthode</p>
          <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
            Le framework BMAD
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            BMAD — <em>Breakthrough Method of Agile AI-Driven Development</em> — structure le{" "}
            <strong className="font-semibold text-ink">Vibe Coding</strong> en une équipe d&apos;agents
            spécialisés. Là où le chapitre précédent décrit la posture d&apos;orchestrateur, BMAD lui
            donne un cadre : chaque rôle d&apos;une équipe agile (analyste, PM, architecte, dev, QA…)
            devient un agent IA dédié, avec sa mission et ses livrables.
          </p>
          <ReadingMeta />
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-6">
            <EnClair>
              En clair : plutôt qu&apos;une seule IA à qui l&apos;on demande tout, BMAD répartit le travail
              entre des <strong>spécialistes</strong>, comme dans une vraie équipe. Un agent cadre le
              besoin, un autre conçoit, un autre code, un dernier teste. Chacun se concentre sur{" "}
              <strong>son métier</strong> — et le résultat est plus fiable.
            </EnClair>
          </div>
        </Reveal>

        {/* Deux temps */}
        <div className="mt-10">
          <Reveal>
            <SectionHeading id="deux-temps" index="01" toc="Deux temps" className="mb-2">
              Deux temps : planifier, puis exécuter
            </SectionHeading>
            <p className="mb-4 text-sm leading-relaxed text-ink/55">
              BMAD sépare nettement la <strong className="text-ink">planification agentique</strong>{" "}
              (analyste, PM, architecte produisent des documents validés) de l&apos;
              <strong className="text-ink">implémentation contextualisée</strong> (le dev reçoit des
              stories autoportantes, sans perte de contexte). C&apos;est ce découpage qui évite le
              « code à l&apos;aveugle ».
            </p>
          </Reveal>
          <Stagger className="grid gap-3 sm:grid-cols-2">
            <StaggerItem className="h-full">
              <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
                <div className="text-xs font-bold text-coral-600">1 · Planification agentique</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/55">
                  Analyste, PM et architecte transforment une idée en brief, PRD et architecture
                  relisibles et validés avant tout code.
                </p>
              </HoverBorderGradient>
            </StaggerItem>
            <StaggerItem className="h-full">
              <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
                <div className="text-xs font-bold text-coral-600">2 · Développement contextualisé</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/55">
                  Le Scrum Master injecte tout le contexte dans chaque story ; le dev l&apos;implémente
                  sans avoir à deviner les décisions prises en amont.
                </p>
              </HoverBorderGradient>
            </StaggerItem>
          </Stagger>
        </div>

        {/* Le rôle de chaque agent */}
        <div className="mt-12">
          <Reveal>
            <SectionHeading id="agents" index="02" toc="Les agents" className="mb-2">
              Le rôle de chaque agent sur le projet
            </SectionHeading>
            <p className="mb-5 text-sm leading-relaxed text-ink/55">
              Huit agents couvrent le cycle complet. Pour chacun : sa mission dans la méthode, et sa
              traduction concrète sur <strong className="text-ink">Quiz Attaché Territorial</strong>.
            </p>
          </Reveal>
          <AgentsGrid />
        </div>

        {/* Le flux de travail */}
        <div className="mt-12">
          <Reveal>
            <SectionHeading id="flux" index="03" toc="Le flux" accent="moss" className="mb-4">
              Le flux de travail, étape par étape
            </SectionHeading>
          </Reveal>
          <Timeline data={PHASES} />
        </div>

        {/* Agents méta */}
        <div className="mt-12">
          <Reveal>
            <SectionHeading id="meta" index="04" toc="Orchestration" className="mb-2">
              Deux agents au-dessus du cycle
            </SectionHeading>
            <p className="mb-5 text-sm leading-relaxed text-ink/55">
              Deux agents ne portent pas une étape précise : ils <strong className="text-ink">orchestrent</strong>.
              C&apos;est la posture réellement adoptée sur ce projet — endosser tour à tour chaque
              casquette selon l&apos;étape en cours.
            </p>
          </Reveal>
          <Stagger className="grid gap-3 sm:grid-cols-2">
            {META.map((a) => {
              const Icon = a.Icon
              const tone =
                a.accent === "coral" ? "bg-coral-50 text-coral-500" : "bg-ink/8 text-ink/60"
              return (
                <StaggerItem key={a.persona} className="h-full">
                  <SpotlightCard accent={a.accent} topAccent className="flex h-full flex-col p-5">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </span>
                      <div className="text-sm font-bold text-ink">{a.persona}</div>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink/35">
                      {a.role}
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink/60">{a.mission}</p>
                    <p className="mt-2 text-[12px] leading-relaxed text-ink/45">{a.projet}</p>
                  </SpotlightCard>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>

        <Reveal>
          <div className="mt-12">
            <Callout variant="cle" title="Ce que BMAD apporte ici">
              Le projet n&apos;a pas mobilisé huit IA distinctes : un même orchestrateur a endossé
              successivement chaque rôle. Mais la <strong>discipline des rôles</strong> — cadrer avant
              de coder, séparer conception et implémentation, ne livrer qu&apos;après validation — est
              exactement ce qui a permis de passer d&apos;un prototype vanilla à une application
              full-stack déployée, sans dette ni code à l&apos;aveugle.
            </Callout>
          </div>
        </Reveal>

        <PrevNextNav current="/presentation/framework-bmad" />
      </TracingBeam>
    </div>
  )
}
