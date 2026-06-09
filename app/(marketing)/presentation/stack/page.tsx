import { StackTabs } from "../stack-tabs"
import { PrevNextNav } from "../prev-next-nav"
import { Reveal } from "../motion"
import { EnClair } from "../plain-box"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { ReadingMeta } from "../reading-meta"

export default function StackPage() {
  return (
    <div className="px-6 py-12 md:py-16">
      <TracingBeam className="max-w-3xl">

      <Reveal>
        <p className="text-[10px] font-bold uppercase tracking-widest text-coral-500">05 — Stack technique</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-ink md:text-5xl">
          Pourquoi ces outils<br />et pas d'autres
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/60">
          Chaque technologie a été choisie pour une raison précise.
          Ce n'est pas une stack "par défaut" — c'est le résultat d'arbitrages conscients
          entre contrôle, performance, coût de maintenance et adéquation au projet.
        </p>
        <ReadingMeta />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6">
          <EnClair>
            Une « stack », ce sont les <strong>outils utilisés pour construire le site</strong> —
            un peu comme les matériaux et machines d&apos;un chantier. Chaque case ci-dessous donne
            l&apos;outil, son rôle et, surtout, <strong>pourquoi il a été choisi</strong>.
          </EnClair>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10">
          <StackTabs />
        </div>
      </Reveal>

      <PrevNextNav current="/presentation/stack" />
      </TracingBeam>
    </div>
  )
}
