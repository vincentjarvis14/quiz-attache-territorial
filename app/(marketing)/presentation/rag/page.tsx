import { PrevNextNav } from "../prev-next-nav"
import { RagPipeline } from "../rag-pipeline"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { CodeWindow, K, S, C, F } from "../code-window"
import { EnClair } from "../plain-box"

const AVANTAGES = [
  { titre: "Qualité maîtrisée", desc: "Chaque question est relisible et corrigeable avant mise en production." },
  { titre: "Coût zéro en prod", desc: "Aucun appel API LLM à la requête. Coût de génération : one-shot à la création." },
  { titre: "Latence SQL", desc: "Une requête base de données remplace un appel API avec délai variable." },
]

const PROMPT_LINES = [
  <><C>{`// scripts/generate-questions.ts`}</C></>,
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

export default function RagPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">06 — Intelligence Artificielle</p>
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
            <SpotlightCard accent="coral" className="h-full border-coral-200 bg-coral-50 p-4">
              <div className="text-xs font-bold text-coral-600">{r.titre}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-ink/55">{r.desc}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Le prompt réel */}
      <div className="mt-10">
        <Reveal>
          <h2 className="mb-2 text-sm font-bold text-ink">Le prompt d'ingénierie</h2>
          <p className="mb-4 text-sm leading-relaxed text-ink/55">
            Le cœur du RAG : un prompt système qui force l'ancrage strict dans le texte source.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <CodeWindow
            filename="generate-questions.ts"
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

      {/* Pipeline animé */}
      <div className="mt-10">
        <Reveal>
          <h2 className="mb-4 text-sm font-bold text-ink">Les 7 étapes du pipeline</h2>
        </Reveal>
        <RagPipeline />
      </div>

      {/* Exemple */}
      <div className="mt-10">
        <Reveal>
          <h2 className="mb-4 text-sm font-bold text-ink">Exemple de question générée</h2>
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

      <PrevNextNav current="/presentation/rag" />
    </div>
  )
}
