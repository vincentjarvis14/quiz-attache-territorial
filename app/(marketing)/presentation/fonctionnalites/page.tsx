import { FeaturesAccordion } from "../features-accordion"
import { PrevNextNav } from "../prev-next-nav"
import { Reveal } from "../motion"
import { EnClair } from "../plain-box"
import { CoverageMeter } from "../coverage-meter"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"

export default function FonctionnalitesPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">09 — Produit</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Fonctionnalités MVP
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Six fonctionnalités constituent le MVP livré. Chaque item est mis en regard
          du critère correspondant du cahier des charges. Cliquez pour voir les détails d'implémentation.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-8">
          <EnClair>
            « MVP » veut dire <strong>version minimale mais complète</strong> : l&apos;essentiel
            pour que le site soit vraiment utile. Pour chaque fonctionnalité, on indique aussi{" "}
            <strong>en quoi elle aide à réviser</strong>.
          </EnClair>
        </div>
      </Reveal>

      <div className="mt-8">
        <CoverageMeter />
      </div>

      <Reveal delay={0.12}>
        <div className="mt-8">
          <FeaturesAccordion />
        </div>
      </Reveal>

      <PrevNextNav current="/presentation/fonctionnalites" />
      </TracingBeam>
    </div>
  )
}
