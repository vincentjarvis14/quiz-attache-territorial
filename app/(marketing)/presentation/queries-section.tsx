import { SpotlightCard } from "./spotlight-card"
import { Reveal, Stagger, StaggerItem } from "./motion"
import { CodeWindow, K, C, F } from "./code-window"
import { EnClair } from "./plain-box"
import { QueryCatalog } from "./query-catalog"
import { getQuerySource } from "@/lib/query-source"

// Section "Les requêtes en coulisses" : explication du fonctionnement + flux,
// puis catalogue interactif (clic = code source réel, extrait au build).

const FLUX = [
  { n: "1", titre: "Une page appelle la fonction", desc: "Un composant serveur écrit simplement await getThemeProgress(userId)." },
  { n: "2", titre: "Drizzle interroge Neon", desc: "La fonction traduit la demande en SQL typé et l'envoie à la base PostgreSQL." },
  { n: "3", titre: "Le résultat est mis en cache", desc: "Mémorisé le temps de la requête (cache requête) ou entre visites (cache données), puis renvoyé prêt à afficher." },
]

const EXEMPLE_LINES = [
  <><C>{`// app/(main)/progression/page.tsx (extrait)`}</C></>,
  <><K>export default async function</K> <F>Page</F>() {`{`}</>,
  <>{"  "}<C>{`// 1 appel = 1 requête centralisée, déjà typée`}</C></>,
  <>{"  "}<K>const</K> rows = <K>await</K> <F>getProgressionBySousTheme</F>()</>,
  <>{"  "}<K>return</K> &lt;<F>Dashboard</F> rows={`{`}rows{`}`} /&gt;</>,
  <>{`}`}</>,
]

export function QueriesSection() {
  const code = getQuerySource()

  return (
    <div>
      <Reveal delay={0.06}>
        <div>
          <EnClair>
            Imagine un <strong>guichet unique</strong> : au lieu que chaque page bricole sa
            propre demande, elles appellent toutes les mêmes fonctions prêtes à l&apos;emploi
            (« donne-moi la progression », « tire 20 questions »…). C&apos;est plus sûr,
            cohérent, et <strong>mis en cache</strong> automatiquement.
          </EnClair>
        </div>
      </Reveal>

      {/* Comment c'est branché */}
      <div className="mt-8">
        <Reveal>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
            Comment c&apos;est branché
          </h3>
        </Reveal>
        <Stagger className="grid gap-3 sm:grid-cols-3">
          {FLUX.map((f) => (
            <StaggerItem key={f.n} className="h-full">
              <SpotlightCard className="h-full p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral-500 font-mono text-[11px] font-bold text-white">
                  {f.n}
                </span>
                <div className="mt-2.5 text-sm font-bold text-ink">{f.titre}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/55">{f.desc}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.05}>
          <div className="mt-4">
            <CodeWindow
              filename="progression/page.tsx"
              lang="tsx"
              lines={EXEMPLE_LINES}
              caption={
                <>
                  Pas de SQL dans la page : un simple appel de fonction renvoie des données
                  <strong> déjà typées</strong>, prêtes à afficher. Toute la logique vit dans la requête.
                </>
              }
            />
          </div>
        </Reveal>
      </div>

      {/* Catalogue interactif */}
      <div className="mt-10">
        <QueryCatalog code={code} />
      </div>
    </div>
  )
}
