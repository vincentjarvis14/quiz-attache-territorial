import { PrevNextNav } from "../prev-next-nav"
import { SpotlightCard } from "../spotlight-card"
import { Reveal, Stagger, StaggerItem } from "../motion"
import { CodeWindow, K, S, C, T, F } from "../code-window"
import { EnClair } from "../plain-box"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"
import { SectionHeading } from "../section-heading"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"

const DB_CONTENU = [
  { table: "themes", role: "Matières (Urbanisme, Env. territorial)", cols: "id, title, description, matiere, order" },
  { table: "sous_themes", role: "Sous-thèmes = PDFs sources", cols: "id, themeId, title, pdfFileName, order" },
  { table: "lessons", role: "Groupes de questions", cols: "id, sousThemeId, title, order" },
  { table: "sections", role: "Sections de cours (bibliothèque)", cols: "id, sousThemeId, title, content, order" },
  { table: "challenges", role: "Questions QCM avec source citée", cols: "id, lessonId, question, explanation, sourceChunk, difficulty" },
  { table: "challenge_options", role: "Options par question", cols: "id, challengeId, text, correct" },
]

const DB_PROGRESSION = [
  { table: "user_progress", role: "Points, thème actif", cols: "userId, points, activeThemeId" },
  { table: "user_sous_theme_progress", role: "Avancement + maîtrise auto-déclarée", cols: "userId, sousThemeId, status, selfMastery, correctCount" },
  { table: "challenge_progress", role: "Questions complétées", cols: "userId, challengeId, completed" },
  { table: "quiz_sessions", role: "Sessions de quiz (libre/leçon/révision)", cols: "id, userId, sousThemeId, mode, questionIds" },
  { table: "user_answers", role: "Réponses détaillées (base du mode révision)", cols: "id, userId, questionId, sessionId, selectedAnswer, correct" },
  { table: "user_question_srs", role: "Répétition espacée (boîtes Leitner)", cols: "userId, questionId, box, dueAt, lapses" },
  { table: "profiles", role: "Profils utilisateurs", cols: "id, userId, ..." },
]

const DB_RAG = [
  { table: "legal_chunks", role: "Articles du Code de l'urbanisme (recherche BM25)", cols: "id, articleRef, title, content" },
  { table: "section_legal_refs", role: "Mapping section de cours → articles", cols: "sectionId, articleRef" },
]

const SCHEMA_LINES = [
  <><C>{`// db/schema.ts — extrait`}</C></>,
  <><K>export const</K> <F>challenges</F> = <F>pgTable</F>(<S>{'"challenges"'}</S>, {`{`}</>,
  <>{"  "}id: <F>serial</F>(<S>{'"id"'}</S>).<F>primaryKey</F>(),</>,
  <>{"  "}lessonId: <F>integer</F>(<S>{'"lesson_id"'}</S>)</>,
  <>{"    "}.<F>references</F>(() =&gt; lessons.id),</>,
  <>{"  "}question: <F>text</F>(<S>{'"question"'}</S>).<F>notNull</F>(),</>,
  <>{"  "}explanation: <F>text</F>(<S>{'"explanation"'}</S>).<F>notNull</F>(),</>,
  <>{"  "}sourceChunk: <F>text</F>(<S>{'"source_chunk"'}</S>).<F>notNull</F>(),</>,
  <>{"  "}difficulty: <F>integer</F>(<S>{'"difficulty"'}</S>).<F>default</F>(<T>2</T>),</>,
  <>{`})`}</>,
  <></>,
  <><C>{`// Type inféré automatiquement — zéro duplication`}</C></>,
  <><K>type</K> <T>Challenge</T> = <T>typeof</T> challenges.$inferSelect</>,
]

function TableRow({ t, i }: { t: { table: string; role: string; cols: string }; i: number }) {
  return (
    <div className={`p-4 ${i > 0 ? "border-t border-ink/5" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <code className="text-xs font-mono font-bold text-ink">{t.table}</code>
        <span className="text-[10px] text-ink/25">—</span>
        <span className="text-xs text-ink/50">{t.role}</span>
      </div>
      <div className="mt-1 font-mono text-[10px] leading-relaxed text-ink/25">{t.cols}</div>
    </div>
  )
}

export default function BaseDeDonneesPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-4xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">07 — Base de données</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Schéma PostgreSQL
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60">
          15 tables organisées en trois domaines : contenu pédagogique, progression utilisateur
          et RAG urbanisme. Le schéma est défini en TypeScript via Drizzle ORM —
          la source de vérité qui génère automatiquement les migrations SQL.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6">
          <EnClair>
            Une base de données, c&apos;est un <strong>grand classeur numérique</strong> :
            chaque « table » est un tiroir (les questions, les réponses, la progression…) et
            les tiroirs sont <strong>reliés entre eux</strong>. Tout y est conservé d&apos;une
            visite à l&apos;autre.
          </EnClair>
        </div>
      </Reveal>

      {/* Code window schema */}
      <div className="mt-10">
        <Reveal>
          <SectionHeading id="schema" index="01" toc="Le schéma" className="mb-4">
            Le schéma en TypeScript
          </SectionHeading>
        </Reveal>
        <Reveal>
          <CodeWindow
            filename="db/schema.ts"
            lang="ts"
            lines={SCHEMA_LINES}
            caption={
              <>
                Ce code décrit simplement le tiroir « questions » : chaque question a un{" "}
                <strong>texte</strong>, une <strong>explication</strong>, un{" "}
                <strong>extrait source</strong> et une difficulté. Écrit une fois, il sert de
                plan officiel pour toute la base.
              </>
            }
          />
        </Reveal>
      </div>

      {/* Schéma 2 colonnes */}
      <Reveal>
        <SectionHeading id="tables" index="02" toc="Les tables" className="mt-10 mb-4">
          Les 15 tables, par domaine
        </SectionHeading>
      </Reveal>
      <div className="mt-2 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-coral-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-coral-500">Contenu pédagogique</span>
          </div>
          <SpotlightCard className="overflow-hidden">
            {DB_CONTENU.map((t, i) => <TableRow key={t.table} t={t} i={i} />)}
          </SpotlightCard>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-moss-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-moss-700">Progression utilisateur</span>
          </div>
          <SpotlightCard accent="moss" className="overflow-hidden">
            {DB_PROGRESSION.map((t, i) => <TableRow key={t.table} t={t} i={i} />)}
          </SpotlightCard>
        </Reveal>
      </div>

      {/* RAG urbanisme */}
      <Reveal>
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-ink/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45">RAG urbanisme</span>
          </div>
          <SpotlightCard className="overflow-hidden">
            {DB_RAG.map((t, i) => <TableRow key={t.table} t={t} i={i} />)}
          </SpotlightCard>
        </div>
      </Reveal>

      {/* Hiérarchie + statuts */}
      <Reveal>
        <SectionHeading id="structure" index="03" toc="Hiérarchie & statuts" className="mt-10 mb-4">
          Hiérarchie &amp; statuts
        </SectionHeading>
      </Reveal>
      <Stagger className="mt-2 grid gap-4 md:grid-cols-2">
        <StaggerItem className="h-full">
          <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
            <div className="mb-3 text-xs font-bold text-coral-600">Hiérarchie du contenu</div>
            <div className="space-y-1 font-mono text-xs text-ink/70">
              <div>themes</div>
              <div className="ml-4 text-ink/50">└── sous_themes</div>
              <div className="ml-8 text-ink/40">└── lessons</div>
              <div className="ml-12 text-ink/30">└── challenges</div>
              <div className="ml-16 text-ink/25">└── challenge_options</div>
            </div>
            <p className="mt-3 text-[11px] text-ink/45">
              Cascade delete : supprimer un thème supprime toute sa hiérarchie descendante.
            </p>
          </HoverBorderGradient>
        </StaggerItem>

        <StaggerItem className="h-full">
          <HoverBorderGradient containerClassName="h-full" className="h-full p-5">
            <div className="mb-3 text-xs font-bold text-moss-700">Statuts de progression</div>
            <div className="space-y-2">
              {[
                { status: "not_started", desc: "Sous-thème non commencé" },
                { status: "in_progress", desc: "Quiz démarré, non terminé" },
                { status: "needs_review", desc: "Score insuffisant" },
                { status: "mastered", desc: "Maîtrisé — score élevé" },
              ].map((s) => (
                <div key={s.status} className="flex items-center gap-2">
                  <code className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-mono text-moss-700">{s.status}</code>
                  <span className="text-[11px] text-ink/50">{s.desc}</span>
                </div>
              ))}
            </div>
          </HoverBorderGradient>
        </StaggerItem>
      </Stagger>

      <PrevNextNav current="/presentation/base-de-donnees" />
      </TracingBeam>
    </div>
  )
}
