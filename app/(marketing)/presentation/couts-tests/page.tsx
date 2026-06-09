import Link from "next/link"
import { PrevNextNav } from "../prev-next-nav"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { CodeWindow, K, S, C, F, T } from "../code-window"
import { EnClair } from "../plain-box"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"
import { SectionHeading } from "../section-heading"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

/* ---------------- Coûts ---------------- */
const SERVICES = [
  {
    name: "Vercel",
    role: "Hébergement de l'application (Next.js)",
    plan: "Hobby — gratuit",
    accent: "coral" as const,
    limits: [
      "100 Go de bande passante / mois",
      "1 000 000 d'invocations de fonctions / mois",
      "Déploiement automatique à chaque push",
    ],
    usage: "≈ 1000× sous les limites avec une seule utilisatrice",
  },
  {
    name: "Neon",
    role: "Base de données PostgreSQL serverless",
    plan: "Free",
    accent: "moss" as const,
    limits: [
      "0,5 Go de stockage",
      "100 heures de calcul / mois",
      "Scale-to-zero : la base s'endort au repos",
    ],
    usage: "Données < 10 % du quota ; 0 € au repos",
  },
  {
    name: "Supabase",
    role: "Authentification + stockage des PDF",
    plan: "Free",
    accent: "ink" as const,
    limits: [
      "50 000 utilisateurs actifs / mois",
      "500 Mo de base + 1 Go de fichiers",
      "Auth e-mail + OAuth inclus",
    ],
    usage: "1 utilisatrice sur 50 000 autorisées",
  },
]

const PITFALLS = [
  {
    title: "Vercel Hobby = usage non commercial",
    body: "Le plan gratuit est réservé à un usage personnel. Toute monétisation imposerait le plan Pro (20 $/mois) — pour une raison de licence, pas de volume.",
  },
  {
    title: "Supabase Free se met en pause à 7 jours",
    body: "Un projet sans requête pendant 7 jours est suspendu (données conservées). Réactivation manuelle. Le plan Pro (25 $/mois) supprime cette pause.",
  },
  {
    title: "Neon : latence de réveil ~1 s",
    body: "Le scale-to-zero endort la base au repos : le premier accès après une pause attend ~1 s. Invisible en usage normal.",
  },
]

const SCALING = [
  {
    tier: "1 utilisatrice",
    sub: "Usage actuel",
    price: "0 €",
    note: "Offres gratuites, marges de 100× à 1000× avant tout plafond.",
    accent: "coral" as const,
  },
  {
    tier: "~100 utilisateurs",
    sub: "Cohorte / phase de test",
    price: "0 €",
    note: "Les volumes restent sous les plafonds gratuits (Supabase : 100 sur 50 000 ; Vercel : large marge). Au pire ~19 $/mois si on prend de la marge sur le compute Neon (plafond de 100 h/mois).",
    accent: "moss" as const,
  },
  {
    tier: "Grand public",
    sub: "Milliers d'utilisateurs",
    price: "~50 $",
    note: "Vercel Pro 20 $ + Neon Launch ~10 $ + Supabase Pro 25 $, hors dépassements à l'usage.",
    accent: "ink" as const,
  },
]

/* ---------------- Tests ---------------- */
const TEST_TARGETS = [
  {
    file: "lib/srs.ts",
    what: "Répétition espacée",
    why: "Logique 100 % pure : boîtes, échéances, plafond examen. 18 tests passants.",
    done: true,
  },
  {
    file: "lib/rag.ts",
    what: "Construction de requête",
    why: "buildOrTsQuery : transformation déterministe d'une requête en tsquery. 6 tests passants.",
    done: true,
  },
  {
    file: "db/queries.ts",
    what: "Sélection de révision",
    why: "Dernière réponse fausse = question à retravailler. Règle au cœur de l'expérience.",
    done: false,
  },
]

const SRS_TEST_LINES = [
  <><C>{`// lib/srs.test.ts — Vitest`}</C></>,
  <><K>import</K> {`{ describe, it, expect }`} <K>from</K> <S>{'"vitest"'}</S></>,
  <><K>import</K> {`{ reviewCard }`} <K>from</K> <S>{'"./srs"'}</S></>,
  <></>,
  <><F>describe</F>(<S>{'"répétition espacée"'}</S>, () =&gt; {`{`}</>,
  <>{"  "}<F>it</F>(<S>{'"monte d\'une boîte si la réponse est correcte"'}</S>, () =&gt; {`{`}</>,
  <>{"    "}<K>const</K> next = <F>reviewCard</F>({`{ box: `}<T>2</T>{`, lapses: `}<T>0</T>{` }`}, <T>true</T>, now, examDate)</>,
  <>{"    "}<F>expect</F>(next.box).<F>toBe</F>(<T>3</T>)</>,
  <>{"  })"}</>,
  <></>,
  <>{"  "}<F>it</F>(<S>{'"retombe en boîte 0 si la réponse est fausse"'}</S>, () =&gt; {`{`}</>,
  <>{"    "}<K>const</K> next = <F>reviewCard</F>({`{ box: `}<T>4</T>{`, lapses: `}<T>1</T>{` }`}, <T>false</T>, now, examDate)</>,
  <>{"    "}<F>expect</F>(next.box).<F>toBe</F>(<T>0</T>)</>,
  <>{"  })"}</>,
  <>{"})"}</>,
]

function Check() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function CoutsTestsPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-4xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">10 — Coûts &amp; tests</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Combien ça coûte,<br />comment c&apos;est fiabilisé
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60">
          Deux exigences d&apos;un projet sérieux : un coût d&apos;exploitation maîtrisé et une
          qualité garantie. Ici, l&apos;hébergement tient sur des offres gratuites, et la qualité
          repose sur une validation automatisée du contenu doublée de tests unitaires ciblés.
        </p>
        <ReadingMeta />
      </Reveal>

      {/* ============ COÛTS ============ */}
      <Reveal delay={0.06}>
        <SectionHeading id="couts" index="01" toc="Coûts d'hébergement" className="mt-10 mb-3">
          Coûts d&apos;hébergement
        </SectionHeading>
        <EnClair>
          Le projet tourne sur trois services <strong>« serverless »</strong> : on ne paie que ce
          qu&apos;on consomme, et les offres gratuites suffisent largement pour une application
          mono-utilisatrice. Résultat : <strong>0 € par mois</strong>.
        </EnClair>
      </Reveal>

      <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
        {SERVICES.map((s) => (
          <StaggerItem key={s.name} className="h-full">
            <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-black text-ink">{s.name}</span>
                <span className="rounded-full bg-moss-50 px-2 py-0.5 text-[10px] font-bold text-moss-700">{s.plan}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink/50">{s.role}</p>
              <div className="mt-4 space-y-1.5">
                {s.limits.map((l) => (
                  <div key={l} className="flex items-start gap-1.5 text-[11px] leading-snug text-ink/60">
                    <Check />
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-ink/5 pt-3 text-[11px] italic text-ink/45">{s.usage}</p>
            </HoverBorderGradient>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Total */}
      <Reveal>
        <div className="mt-6 flex flex-col items-center justify-center gap-1 rounded-2xl border border-coral-100 bg-coral-50 py-7 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-coral-600">Coût d&apos;exploitation réel</span>
          <span className="font-display text-5xl font-black text-coral-500">0 € <span className="text-2xl">/ mois</span></span>
          <span className="text-xs text-ink/50">avec des marges de 100× à 1000× avant tout dépassement</span>
        </div>
      </Reveal>

      {/* Pièges */}
      <Reveal>
        <p className="mt-10 mb-3 text-sm font-bold text-ink">Les pièges des offres gratuites <span className="font-normal text-ink/45">— à connaître, anticipés</span></p>
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-3">
        {PITFALLS.map((p) => (
          <StaggerItem key={p.title} className="h-full">
            <div className="h-full rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-white">!</span>
                <span className="text-xs font-bold text-amber-700">{p.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-ink/55">{p.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Scalabilité des coûts */}
      <Reveal>
        <p className="mt-10 mb-1 text-sm font-bold text-ink">Comment le coût évolue avec les utilisateurs</p>
        <p className="mb-4 text-xs text-ink/50">
          De 1 à 100 utilisateurs, le coût ne bouge quasiment pas — c&apos;est tout l&apos;intérêt du serverless.
        </p>
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-3">
        {SCALING.map((s) => (
          <StaggerItem key={s.tier} className="h-full">
            <SpotlightCard accent={s.accent} topAccent className="h-full p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{s.sub}</p>
              <p className="mt-1 text-sm font-bold text-ink">{s.tier}</p>
              <p className="mt-3 font-display text-3xl font-black text-coral-500">
                {s.price}<span className="text-sm font-bold text-ink/40"> / mois</span>
              </p>
              <p className="mt-3 border-t border-ink/5 pt-3 text-[11px] leading-relaxed text-ink/50">{s.note}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal>
        <div className="mt-5 rounded-2xl border border-ink/8 bg-white p-4 shadow-soft">
          <p className="text-[13px] leading-relaxed text-ink/60">
            <strong className="text-ink">Le coût ne suit pas le nombre d&apos;utilisateurs.</strong> L&apos;architecture
            serverless absorbe les 100 premiers utilisateurs sans surcoût notable : on reste dans les offres
            gratuites. Le vrai déclencheur n&apos;est pas le trafic, mais{" "}
            <strong className="text-ink">l&apos;usage commercial</strong> (la licence Vercel Hobby impose alors le
            plan Pro) et la <strong className="text-ink">fiabilité 24/7</strong> (compute Neon garanti).
          </p>
        </div>
      </Reveal>

      {/* ============ TESTS ============ */}
      <Reveal>
        <SectionHeading id="tests" index="02" toc="Tests & qualité" accent="moss" className="mt-16 mb-3">
          Tests &amp; qualité
        </SectionHeading>
        <EnClair>
          La qualité se joue à <strong>deux niveaux</strong> : on vérifie automatiquement que
          chaque question générée est <strong>fidèle au cours</strong>, et on teste la
          <strong> logique critique</strong> du code (révision, recherche) avec des tests unitaires.
        </EnClair>
      </Reveal>

      {/* Niveau 1 : validation contenu */}
      <Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Niveau 1 — en place</p>
            <p className="mt-1 text-sm font-bold text-ink">Validation automatique du contenu</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
              Avant d&apos;entrer en base, chaque question passe un contrôle automatisé
              (<code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[11px] text-ink/70">validate_generated.py</code>).
              Toute question non conforme est <strong>rejetée</strong>. C&apos;est un test de données,
              exécuté à chaque génération.
            </p>
          </div>
          <SpotlightCard accent="moss" className="p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-moss-700">Ce qui est vérifié</p>
            <p className="text-[12.5px] leading-relaxed text-ink/65">
              Ancrage littéral dans le cours, sourceText non tronqué, exactement 4 options
              distinctes, aucune référence juridique ni date absente du texte source.
            </p>
            <Link
              href="/presentation/rag#garde-fous"
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-coral-500 transition-colors hover:text-coral-600"
            >
              Voir les garde-fous détaillés →
            </Link>
          </SpotlightCard>
        </div>
      </Reveal>

      {/* Niveau 2 : tests unitaires */}
      <Reveal>
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Niveau 2 — logique du code</p>
            <span className="rounded-full bg-moss-50 px-2.5 py-0.5 text-[10px] font-bold text-moss-700">24 tests · 100 % passants</span>
          </div>
          <p className="mt-1 text-sm font-bold text-ink">Tests unitaires (Vitest)</p>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink/55">
            La logique <strong>pure et déterministe</strong> se teste vite et sans dépendance. La suite
            tourne via <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[11px] text-ink/70">npm&nbsp;test</code> —
            l&apos;algorithme de révision est déjà couvert, les requêtes suivent.
          </p>
        </div>
      </Reveal>

      <Stagger className="mt-5 grid gap-4 md:grid-cols-3">
        {TEST_TARGETS.map((t) => (
          <StaggerItem key={t.file} className="h-full">
            <div className="h-full rounded-2xl border border-ink/8 bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-coral-500">{t.file}</code>
                {t.done ? (
                  <span className="shrink-0 rounded bg-moss-50 px-1.5 py-0.5 text-[9px] font-bold text-moss-700">✓ couvert</span>
                ) : (
                  <span className="shrink-0 rounded bg-ink/5 px-1.5 py-0.5 text-[9px] font-bold text-ink/40">à venir</span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{t.what}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink/50">{t.why}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-6">
        <Reveal>
          <CodeWindow
            filename="lib/srs.test.ts"
            lang="ts"
            lines={SRS_TEST_LINES}
            caption={
              <>
                Exemple concret : on vérifie que l&apos;algorithme de révision <strong>monte
                une question d&apos;un niveau</strong> en cas de réussite et la <strong>remet à
                zéro</strong> en cas d&apos;erreur. Une logique déterministe, donc testable au
                caractère près.
              </>
            }
          />
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-moss-500/20 bg-moss-50 px-4 py-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss-500 text-[11px] font-bold text-white">✓</span>
          <span className="font-mono text-[12px] text-ink/65">npm test → <strong className="text-moss-700">24 tests passants</strong> (Vitest), 0 échec</span>
        </div>
      </Reveal>

      <PrevNextNav current="/presentation/couts-tests" />
      </TracingBeam>
    </div>
  )
}
