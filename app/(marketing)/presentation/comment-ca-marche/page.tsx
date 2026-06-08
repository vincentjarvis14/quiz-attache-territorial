import {
  UserPlus,
  Layers3,
  RotateCcw,
  TrendingUp,
  MousePointerClick,
  CheckCircle2,
  Save,
  BookOpenCheck,
  Monitor,
  Server,
  Database,
  type LucideIcon,
} from "lucide-react"
import { PrevNextNav } from "../prev-next-nav"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { EnClair } from "../plain-box"
import { Terme } from "../term"
import { TECH_GLOSSARY } from "../tech-glossary"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"
import { SectionHeading } from "../section-heading"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

const PARCOURS: { Icon: LucideIcon; titre: string; desc: string }[] = [
  { Icon: UserPlus, titre: "Je m'inscris (ou j'entre en invité)", desc: "Création de compte en quelques secondes, ou accès direct sans compte pour essayer." },
  { Icon: Layers3, titre: "Je choisis une matière", desc: "Environnement territorial ou Urbanisme, puis un sous-thème (chaque sous-thème vient d'un document officiel)." },
  { Icon: RotateCcw, titre: "Je révise avec des QCM", desc: "Je réponds aux questions ; après chaque réponse, l'extrait de loi qui justifie la bonne réponse s'affiche." },
  { Icon: TrendingUp, titre: "Je suis ma progression", desc: "Le site retient mes résultats, met en avant ce que je rate, et me le repropose au prochain passage." },
]

const FLUX: { Icon: LucideIcon; titre: string; desc: string }[] = [
  { Icon: MousePointerClick, titre: "Je clique sur une réponse", desc: "Mon choix part vers les coulisses du site." },
  { Icon: CheckCircle2, titre: "Le site vérifie", desc: "Il compare ma réponse à la bonne réponse et me montre l'explication + l'extrait officiel." },
  { Icon: Save, titre: "Il enregistre mon résultat", desc: "Bonne ou mauvaise, ma réponse est conservée pour plus tard." },
  { Icon: BookOpenCheck, titre: "Il ajuste ma révision", desc: "Une question ratée sera reproposée en priorité dans le mode révision." },
]

const LIEUX: { Icon: LucideIcon; k: keyof typeof TECH_GLOSSARY; titre: string; desc: string }[] = [
  { Icon: Monitor, k: "frontend", titre: "Mon écran", desc: "Ce que je vois et touche : pages, boutons, animations. C'est le frontend." },
  { Icon: Server, k: "serveur", titre: "Les coulisses", desc: "Un serveur prépare les pages, vérifie les réponses et fait le lien. C'est le backend." },
  { Icon: Database, k: "base_de_donnees", titre: "La mémoire", desc: "Une base de données conserve durablement les questions et ma progression." },
]

// Quelques termes clés affichés en lexique compact.
const LEXIQUE_KEYS: (keyof typeof TECH_GLOSSARY)[] = [
  "qcm",
  "base_de_donnees",
  "serveur",
  "rag",
  "llm",
  "authentification",
  "serverless",
  "api",
]

export default function CommentCaMarchePage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">
      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">01 — Comprendre</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Comprendre le site
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Avant la technique, l'essentiel en une page : à quoi sert le site, ce qui se passe
          quand on l'utilise, et où vivent les informations. Sans jargon.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-8">
          <EnClair>
            Ce site est un <strong>cahier de révision intelligent</strong> pour le concours
            d&apos;Attaché Territorial. On choisit une matière, on répond à des questions
            tirées des <strong>textes officiels</strong>, et le site <strong>retient
            automatiquement ce qu&apos;on rate</strong> pour nous le reproposer. Objectif :
            réviser efficacement, sans se disperser.
          </EnClair>
        </div>
      </Reveal>

      {/* Parcours en 4 étapes */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="parcours" index="01" toc="Le parcours" className="mb-4">Le parcours, en 4 étapes</SectionHeading>
        </Reveal>
        <Stagger className="space-y-3">
          {PARCOURS.map((e, i) => {
            const Icon = e.Icon
            return (
              <StaggerItem key={e.titre}>
                <SpotlightCard topAccent className="p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-ink/25">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-bold text-ink">{e.titre}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink/60">{e.desc}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>

      {/* Que se passe-t-il quand je réponds */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="reponse" index="02" toc="Quand je réponds" className="mb-1">
            Que se passe-t-il quand je réponds à une question ?
          </SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Tout se déroule en une fraction de seconde. Décomposé, voici le trajet de ma réponse.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <SpotlightCard accent="ink" className="p-5 sm:p-6">
            <ol className="space-y-4">
              {FLUX.map((f, i) => {
                const Icon = f.Icon
                return (
                  <li key={f.titre} className="flex items-start gap-4">
                    <span className="relative flex flex-col items-center">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-bold text-cream">
                        {i + 1}
                      </span>
                      {i < FLUX.length - 1 && <span className="mt-1 h-6 w-px bg-ink/15" />}
                    </span>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-coral-500" strokeWidth={1.75} />
                        <span className="text-sm font-bold text-ink">{f.titre}</span>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink/60">{f.desc}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* Où vivent les informations */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="lieux" index="03" toc="Où vivent les infos" className="mb-1">Où vivent les informations ?</SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Un site web répartit le travail entre trois espaces complémentaires.
            (Passe la souris sur les mots soulignés pour leur définition.)
          </p>
        </Reveal>
        <Stagger className="grid gap-3 sm:grid-cols-3">
          {LIEUX.map((l) => {
            const Icon = l.Icon
            return (
              <StaggerItem key={l.titre} className="h-full">
                <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/8 text-ink/60">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="mt-3 text-sm font-bold text-ink">{l.titre}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink/60">{l.desc}</p>
                  <div className="mt-2 text-xs">
                    <Terme k={l.k} />
                  </div>
                </HoverBorderGradient>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>

      {/* Mini-lexique */}
      <div className="mt-12">
        <Reveal>
          <SectionHeading id="lexique" index="04" toc="Vocabulaire" className="mb-1">Le vocabulaire, en une phrase</SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Les quelques mots techniques qui reviennent dans le reste du rapport.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <SpotlightCard className="divide-y divide-ink/5">
            {LEXIQUE_KEYS.map((k) => {
              const t = TECH_GLOSSARY[k]
              return (
                <div key={k} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-5">
                  <div className="shrink-0 text-sm font-bold text-ink sm:w-44">{t.term}</div>
                  <p className="text-[13px] leading-relaxed text-ink/60">{t.def}</p>
                </div>
              )
            })}
          </SpotlightCard>
        </Reveal>
      </div>

      <PrevNextNav current="/presentation/comment-ca-marche" />
      </TracingBeam>
    </div>
  )
}
