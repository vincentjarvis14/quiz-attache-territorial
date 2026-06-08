import { PrevNextNav } from "../prev-next-nav"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { EnClair } from "../plain-box"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"
import { SectionHeading } from "../section-heading"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

const MOSCOW = [
  {
    tag: "MUST",
    label: "Indispensable",
    badge: "bg-coral-500 text-white",
    items: [
      "Générer des QCM de qualité concours",
      "S'entraîner : quiz libre ou leçon ciblée",
      "Réviser ses erreurs en priorité",
      "Authentification + accès invité sans friction",
    ],
  },
  {
    tag: "SHOULD",
    label: "Important",
    badge: "bg-moss-500 text-white",
    items: ["Suivre sa progression par chapitre", "Consulter le cours (lecteur PDF)"],
  },
  {
    tag: "COULD",
    label: "Bonus différenciant",
    badge: "bg-ink text-white",
    items: ["Rechercher dans le Code de l'urbanisme (RAG juridique)"],
  },
  {
    tag: "WON'T",
    label: "Hors périmètre — par choix",
    badge: "bg-ink/10 text-ink/50",
    items: ["Classements, ligues, défis multijoueur", "Tout module social ou compétitif"],
    muted: true,
  },
]

const INCLUS = [
  "Entraînement actif par QCM ancrés sur le cours",
  "Révision priorisée par répétition espacée",
  "Suivi de progression personnel",
  "Bibliothèque de cours + recherche juridique",
]

const EXCLUS = [
  "Comparaison ou classement entre utilisateurs",
  "Ligues, défis, fonctions multijoueur",
  "Partage social, commentaires, communauté",
  "Gestion d'équipes / multi-tenant",
]

const CONTRAINTES = [
  { c: "Application mono-utilisatrice", r: "Exclusion de tout module social ou compétitif" },
  { c: "Développement solo, délai court", r: "Stack homogène TypeScript + services serverless managés" },
  { c: "Budget proche de 0 €", r: "Offres gratuites ; l'IA tourne en batch, pas en production" },
  { c: "Exigence niveau concours", r: "Génération IA validée automatiquement avant mise en base" },
]

export default function CadragePage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-4xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">02 — Cadrage</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Du besoin<br />à la solution
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60">
          Avant la première ligne de code : identifier le besoin réel, lister les cas d&apos;usage,
          les <strong className="font-semibold text-ink">prioriser</strong>, et délimiter ce que le
          projet fait — et surtout ce qu&apos;il ne fait pas.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6">
          <EnClair>
            « Cadrer » un projet, c&apos;est décider <strong>ce qu&apos;on construit et dans quel
            ordre</strong>, à partir d&apos;un besoin. Ici, tout découle d&apos;un constat simple :
            réviser un concours en relisant des PDF est <strong>passif</strong> — on ne mesure jamais
            ce qu&apos;on maîtrise vraiment.
          </EnClair>
        </div>
      </Reveal>

      {/* Problème → réponse */}
      <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
        <StaggerItem className="h-full">
          <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Le problème</div>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              Les supports classiques (annales, fiches, PDF) sont <strong className="text-ink">passifs</strong> :
              on relit sans retour, sans mesure, et on révise « à l&apos;aveugle » sans cibler ses points faibles.
            </p>
          </HoverBorderGradient>
        </StaggerItem>
        <StaggerItem className="h-full">
          <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-coral-600">La réponse</div>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              Un <strong className="text-ink">entraînement actif</strong> : des QCM ancrés sur le cours,
              une correction immédiate sourcée, et une révision qui <strong className="text-ink">priorise
              automatiquement</strong> les erreurs jusqu&apos;au jour de l&apos;examen.
            </p>
          </HoverBorderGradient>
        </StaggerItem>
      </Stagger>

      {/* MoSCoW */}
      <Reveal>
        <div className="mt-12 mb-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-coral-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-coral-500">Cas d&apos;usage priorisés</span>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-ink/55">
          Méthode <strong className="text-ink">MoSCoW</strong> : tous les cas d&apos;usage ne se valent pas.
          La qualité du contenu et la révision priorisée passent avant le confort.
        </p>
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-2">
        {MOSCOW.map((m) => (
          <StaggerItem key={m.tag} className="h-full">
            <div className={`h-full rounded-2xl border p-5 ${m.muted ? "border-dashed border-ink/15 bg-cream" : "border-ink/8 bg-white shadow-soft"}`}>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-black tracking-wide ${m.badge}`}>{m.tag}</span>
                <span className="text-xs font-semibold text-ink/45">{m.label}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {m.items.map((it) => (
                  <li key={it} className={`text-[12.5px] leading-snug ${m.muted ? "text-ink/35 line-through decoration-ink/20" : "text-ink/65"}`}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Périmètre inclus / exclus */}
      <Reveal>
        <SectionHeading id="perimetre" index="01" toc="Périmètre" className="mt-12 mb-4">Le périmètre, assumé</SectionHeading>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <SpotlightCard accent="moss" className="h-full p-5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-moss-700">Dans le périmètre</div>
            <div className="space-y-2">
              {INCLUS.map((i) => (
                <div key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink/65">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{i}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="h-full rounded-2xl border border-dashed border-ink/15 bg-cream p-5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink/40">Exclu volontairement</div>
            <div className="space-y-2">
              {EXCLUS.map((e) => (
                <div key={e} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink/45">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Contraintes → choix */}
      <Reveal>
        <SectionHeading id="contraintes" index="02" toc="Contraintes" className="mt-12 mb-2">Des contraintes aux choix de conception</SectionHeading>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ink/55">
          Chaque contrainte du projet a dicté une décision concrète — c&apos;est le fil qui mène
          du cahier des charges à l&apos;architecture.
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <SpotlightCard className="overflow-hidden">
          {CONTRAINTES.map((c, i) => (
            <div key={c.c} className={`grid items-center gap-x-4 px-5 py-3.5 md:grid-cols-[1fr_auto_1.4fr] ${i > 0 ? "border-t border-ink/5" : ""}`}>
              <span className="text-[13px] font-semibold text-ink/80">{c.c}</span>
              <span className="hidden text-coral-400 md:block">→</span>
              <span className="text-[12.5px] text-ink/55">{c.r}</span>
            </div>
          ))}
        </SpotlightCard>
      </Reveal>

      <PrevNextNav current="/presentation/cadrage" />
      </TracingBeam>
    </div>
  )
}
