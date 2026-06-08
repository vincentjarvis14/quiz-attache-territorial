import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Reveal } from "../motion"
import { QueriesSection } from "../queries-section"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"

export default function RequetesPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-4xl">
      <Reveal>
        <Link
          href="/presentation/architecture"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/45 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Architecture
        </Link>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-coral-500">
          Annexe — Architecture
        </p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Les requêtes en coulisses
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60">
          L&apos;application ne parle jamais directement à la base. Toutes les demandes passent
          par des fonctions centralisées dans{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[13px] text-ink/70">db/queries.ts</code>.
          Chaque fonction = une question précise posée à la base, réutilisable partout. En voici
          le fonctionnement et le catalogue complet.
        </p>
        <ReadingMeta />
      </Reveal>

      <div className="mt-8">
        <QueriesSection />
      </div>

      <div className="mt-16 flex items-center justify-between border-t border-ink/8 pt-8">
        <Link href="/presentation/architecture" className="group flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Retour</span>
          <span className="text-sm font-semibold text-ink/60 transition-colors group-hover:text-ink">
            ← Architecture
          </span>
        </Link>
        <Link href="/presentation/base-de-donnees" className="group flex flex-col gap-0.5 text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Suivant</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink/60 transition-colors group-hover:text-ink">
            Base de données <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
      </TracingBeam>
    </div>
  )
}
