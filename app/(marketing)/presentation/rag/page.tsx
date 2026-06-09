import { PrevNextNav } from "../prev-next-nav"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { Timeline, type TimelineEntry } from "@/components/ui/timeline"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { CodeWindow, K, S, C, F } from "../code-window"
import { EnClair } from "../plain-box"
import { SectionHeading } from "../section-heading"
import { ReadingMeta } from "../reading-meta"

const AVANTAGES = [
  { titre: "Qualité maîtrisée", desc: "Chaque question est relisible et corrigeable avant mise en production." },
  { titre: "Coût zéro en prod", desc: "Aucun appel API LLM à la requête. Coût de génération : one-shot à la création." },
  { titre: "Latence SQL", desc: "Une requête base de données remplace un appel API avec délai variable." },
]

const PROMPT_LINES = [
  <><C>{`// extrait illustratif — prompt système`}</C></>,
  <><K>const</K> systemPrompt = <S>{'`Tu es un expert des concours'}</S></>,
  <>{"  "}<S>{'de la fonction publique territoriale.'}</S></>,
  <>{"  "}<S>{''}</S></>,
  <>{"  "}<S>{'CONTRAINTE ABSOLUE : génère des QCM'}</S></>,
  <>{"  "}<S>{'uniquement à partir du CONTEXTE fourni.'}</S></>,
  <>{"  "}<S>{'Ne jamais inventer hors du texte source.'}</S></>,
  <>{"  "}<S>{''}</S></>,
  <>{"  "}<S>{'FORMAT : JSON strict { question, options[4],'}</S></>,
  <>{"  "}<S>{'correctIndex, explanation, sourceChunk }`'}</S>;</>,
  <></>,
  <><K>const</K> res = <K>await</K> anthropic.messages.<F>create</F>({`{`}</>,
  <>{"  "}model: <S>{'"claude-opus-4"'}</S>,</>,
  <>{"  "}system: systemPrompt,</>,
  <>{"  "}messages: [{`{`} role: <S>{'"user"'}</S>, content: chunk {`}`}],</>,
  <>{`})`}</>,
]

const GARDE_FOUS = [
  "sourceText copié mot pour mot depuis le cours — ancrage vérifiable",
  "Aucune date ni chiffre absent du texte source",
  "Aucune jurisprudence (CE, CAA…) non citée littéralement",
  "Aucune question de repérage visuel (« en quelle année… »)",
  "Exactement 4 options distinctes, une seule correcte",
  "Couverture de la taxonomie de Bloom (rappel → cas pratique)",
]

const AUDIT = [
  { metric: "Score qualité moyen", before: "32 / 100", after: "84 / 100" },
  { metric: "Niveau concours (≥ 70)", before: "8 %", after: "85 %" },
  { metric: "Questions critiques (< 40)", before: "72 %", after: "0 %" },
  { metric: "sourceText tronqué", before: "78 %", after: "0 %" },
]

const CASCADE = [
  { n: "1", titre: "Précision", code: "plainto_tsquery", desc: "Tous les termes requis (ET logique). Le résultat le plus pertinent en premier." },
  { n: "2", titre: "Rappel", code: "to_tsquery · OR", desc: "Au moins un terme. Se déclenche si le niveau 1 ne renvoie rien." },
  { n: "3", titre: "Filet", code: "ILIKE", desc: "Références exactes (« L151-1 »), acronymes. Dernier recours." },
]

const PIPELINE: TimelineEntry[] = [
  { marker: "01", title: "Sources documentaires", tag: "Input", content: "17 PDFs officiels : Code de l'Urbanisme, CGCT, textes réglementaires. 2 matières de concours couvertes." },
  { marker: "02", title: "Extraction du texte", tag: "pdf-parse", content: "pdf-parse extrait le texte brut. Découpage en sections thématiques : 1 chunk = 1 concept juridique." },
  { marker: "03", title: "Construction du prompt", tag: "Prompt engineering", content: "Rôle expert concours, format JSON strict, instruction d'ancrage littéral dans le chunk fourni." },
  { marker: "04", title: "Génération Claude Opus", tag: "LLM Anthropic", content: "Chaque chunk → API Anthropic. Opus génère 5–10 QCM : question, 4 options, bonne réponse, explication, source." },
  { marker: "05", title: "Validation & JSON", tag: "data/", content: "Output validé (structure, longueur, unicité). Chaque PDF produit un fichier generated_*.json." },
  { marker: "06", title: "Seed base de données", tag: "scripts/", content: "Script TypeScript (tsx) insère dans Neon via Drizzle ORM en respectant la hiérarchie complète." },
  { marker: "07", title: "Lecture en production", tag: "Runtime", content: "L'app interroge Neon via Server Components. Zéro appel LLM en prod : qualité garantie, coût nul, latence SQL." },
]

export default function RagPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">08 — Intelligence Artificielle</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Pipeline RAG
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          RAG signifie Retrieval-Augmented Generation : générer du contenu en injectant
          du contexte documentaire dans le prompt. Dans ce projet, la génération des questions est{" "}
          <strong className="font-semibold text-ink">offline</strong> — produite une fois,
          stockée en base, servie sans appel LLM en production. En complément, la bibliothèque
          expose une <strong className="font-semibold text-ink">recherche juridique live</strong>{" "}
          (plein-texte BM25) dans le Code de l'urbanisme — elle aussi sans appel LLM.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6">
          <EnClair>
            En clair : on a demandé à une <strong>IA (Claude Opus)</strong> de rédiger les
            questions, mais <strong>uniquement à partir des documents officiels</strong> —
            elle n&apos;a pas le droit d&apos;inventer. Les questions sont créées{" "}
            <strong>une seule fois</strong> puis rangées en base. Quand tu joues, le site
            les sert directement : <strong>aucune IA ne tourne en arrière-plan</strong>,
            donc c&apos;est rapide et gratuit.
          </EnClair>
        </div>
      </Reveal>

      {/* Avantages offline */}
      <Stagger className="mt-6 grid gap-3 sm:grid-cols-3">
        {AVANTAGES.map((r) => (
          <StaggerItem key={r.titre} className="h-full">
            <HoverBorderGradient containerClassName="h-full" className="h-full p-4">
              <div className="text-xs font-bold text-coral-600">{r.titre}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink/55">{r.desc}</p>
            </HoverBorderGradient>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Le prompt réel */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="prompt" index="01" toc="Le prompt" className="mb-2">
            Le prompt d&apos;ingénierie
          </SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Le cœur du RAG : un prompt système qui force l&apos;ancrage strict dans le texte source.
            Extrait illustratif — la génération réelle s&apos;exécute via des scripts Python appelant l&apos;API Anthropic.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <CodeWindow
            filename="prompt-systeme.ts — illustratif"
            lang="ts"
            lines={PROMPT_LINES}
            caption={
              <>
                Ce texte est la <strong>consigne donnée à l&apos;IA</strong> : « tu es un
                expert des concours, génère des QCM <strong>uniquement</strong> à partir du
                texte fourni, sans rien inventer, au format imposé ». C&apos;est ce qui garantit
                des questions fiables et sourcées.
              </>
            }
          />
        </Reveal>
      </div>

      {/* Garde-fous anti-hallucination */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="garde-fous" index="02" toc="Garde-fous" className="mb-2">
            Les garde-fous anti-hallucination
          </SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Le prompt impose des règles strictes, et un script de validation
            (<code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[11px] text-ink/70">validate_generated.py</code>){" "}
            <strong className="text-ink">rejette automatiquement</strong> toute question non conforme avant la mise en base.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <SpotlightCard accent="moss" className="p-5">
            <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {GARDE_FOUS.map((g) => (
                <div key={g} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink/65">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* De DeepSeek à Opus */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="deepseek-opus" index="03" toc="DeepSeek → Opus" className="mb-2">
            Un choix mesuré : de DeepSeek à Claude Opus
          </SectionHeading>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            La première version générait les questions avec <strong className="text-ink">DeepSeek</strong> (moins cher).
            Un audit qualité a tranché : le niveau était insuffisant pour un concours. Résultat —{" "}
            <strong className="text-ink">420 questions supprimées</strong> et migration vers Opus.
            Les chiffres ci-dessous sont une évaluation interne <strong className="text-ink">indicative</strong>, sur un échantillon.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <SpotlightCard className="overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-5 border-b border-ink/8 px-5 py-3 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-ink/40">Métrique</span>
              <span className="text-right text-ink/40">DeepSeek</span>
              <span className="text-right text-moss-700">Opus</span>
            </div>
            {AUDIT.map((r, i) => (
              <div key={r.metric} className={`grid grid-cols-[1fr_auto_auto] items-center gap-x-5 px-5 py-2.5 ${i > 0 ? "border-t border-ink/5" : ""}`}>
                <span className="text-[13px] text-ink/70">{r.metric}</span>
                <span className="text-right font-mono text-sm text-ink/40">{r.before}</span>
                <span className="text-right font-mono text-sm font-bold text-moss-700">{r.after}</span>
              </div>
            ))}
          </SpotlightCard>
          <p className="mt-2 text-[11px] italic leading-relaxed text-ink/45">
            Audit qualitatif de bascule (échantillon). La fiabilité en production repose surtout sur les
            règles de validation automatiques ci-dessus, appliquées aux ~760 questions.
          </p>
        </Reveal>
      </div>

      {/* Pipeline animé */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="pipeline" index="04" toc="Les 7 étapes" className="mb-4">
            Les 7 étapes du pipeline
          </SectionHeading>
        </Reveal>
        <Timeline data={PIPELINE} />
      </div>

      {/* Exemple */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="exemple" index="05" toc="Exemple généré" className="mb-4">
            Exemple de question générée
          </SectionHeading>
        </Reveal>
        <Reveal delay={0.05}>
          <SpotlightCard className="p-6">
            <p className="text-sm font-semibold text-ink">
              Selon le Code de l'Urbanisme, quel document fixe les règles générales d'utilisation du sol au niveau communal ?
            </p>
            <div className="mt-4 space-y-2">
              {[
                { l: "A", t: "Le Schéma de Cohérence Territoriale (SCoT)", ok: false },
                { l: "B", t: "Le Plan Local d'Urbanisme (PLU)", ok: true },
                { l: "C", t: "Le Règlement National d'Urbanisme (RNU)", ok: false },
                { l: "D", t: "La carte communale", ok: false },
              ].map((opt) => (
                <div
                  key={opt.l}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                    opt.ok ? "border-moss-500/25 bg-moss-50" : "border-ink/6 bg-cream"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${opt.ok ? "bg-moss-500 text-white" : "bg-ink/8 text-ink/45"}`}>
                    {opt.l}
                  </span>
                  <span className="text-sm text-ink/75">{opt.t}</span>
                  {opt.ok && <span className="ml-auto text-[10px] font-bold text-moss-700">✓</span>}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-cream p-4">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/35">
                sourceChunk — stocké en base, affiché à l'utilisateur
              </div>
              <p className="text-xs leading-relaxed italic text-ink/50">
                "Le plan local d'urbanisme comprend un rapport de présentation, un projet d'aménagement
                et de développement durables, des orientations d'aménagement et de programmation et un règlement…"
              </p>
              <div className="mt-2 text-[10px] font-semibold text-coral-500">
                Code de l'Urbanisme — Art. L151-2
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-moss-500/15 bg-moss-50 p-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-moss-700">explanation</div>
              <p className="text-xs leading-relaxed text-ink/60">
                Le PLU est le principal document d'urbanisme communal. Il détermine les règles générales
                d'utilisation du sol, les zones constructibles, les gabarits autorisés. C'est une compétence
                communale ou intercommunale.
              </p>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* Recherche juridique live — cascade BM25 */}
      <div className="mt-12">
        <Reveal>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-ink/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Recherche juridique live</span>
          </div>
          <SectionHeading id="cascade-bm25" index="06" toc="Recherche live" className="mb-2">
            Le seul RAG « en direct » : une cascade BM25
          </SectionHeading>
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ink/55">
            Pour retrouver un article du Code de l&apos;urbanisme, la bibliothèque interroge la base en
            plein-texte (<code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[11px] text-ink/70">tsvector</code> français),
            via une cascade à trois niveaux — <strong className="text-ink">sans LLM ni embeddings</strong>.
          </p>
        </Reveal>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {CASCADE.map((c) => (
            <StaggerItem key={c.n} className="h-full">
              <div className="h-full rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-coral-500 text-[11px] font-bold text-white">{c.n}</span>
                  <span className="text-sm font-bold text-ink">{c.titre}</span>
                </div>
                <code className="mt-3 inline-block rounded bg-ink/5 px-2 py-1 font-mono text-[11px] text-ink/70">{c.code}</code>
                <p className="mt-2 text-[11px] leading-relaxed text-ink/50">{c.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-ink/45">
            Choix assumé : sur un corpus juridique, le lexical (BM25) est plus fidèle aux références exactes
            qu&apos;une recherche sémantique par embeddings — et il est gratuit, sans dépendance externe.
          </p>
        </Reveal>
      </div>

      <PrevNextNav current="/presentation/rag" />
      </TracingBeam>
    </div>
  )
}
