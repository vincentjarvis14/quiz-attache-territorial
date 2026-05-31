import Link from "next/link";
import { ArrowRight, Landmark, Building2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Footer } from "./footer";
import { MorphingAccent } from "./morphing-accent";
import { GuestButton } from "./guest-button";
import { getMarketingStats } from "@/db/queries";

const MATIERE_ICONS: Record<string, LucideIcon> = {
  environnement_territorial: Landmark,
  urbanisme: Building2,
};

export default async function MarketingPage() {
  const stats = await getMarketingStats();
  const dynamicStats = [
    {
      value: stats.totalQuestions >= 400 ? `${Math.floor(stats.totalQuestions / 100) * 100}+` : String(stats.totalQuestions),
      label: "questions",
    },
    { value: String(stats.totalDocs), label: "docs officiels" },
    { value: String(stats.totalMatieres), label: "matières" },
    { value: "100%", label: "gratuit" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />

      <main className="flex-1">

        {/* ── HERO (plein écran, hero-only 2 colonnes) ──────────── */}
        <section className="relative flex min-h-[calc(100dvh-56px)] items-center overflow-hidden px-6 py-10">
          {/* Texture dot-grid */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-2/3 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #1F1D1B 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="mx-auto w-full max-w-5xl">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px]">

              {/* ── Colonne gauche : texte + CTAs ── */}
              <div>
                {/* Titre */}
                <h1 className="anim-fade-up font-display font-black leading-[0.9] tracking-tight text-ink text-[2.8rem] md:text-[4.5rem] lg:text-[5.5rem]">
                  Préparez votre<br /><span className="text-coral-500">concours,</span>
                </h1>

                {/* Hook corail + morphing */}
                <div className="anim-fade-up anim-delay-1 mt-4 flex items-center gap-4">
                  <div className="h-[3px] w-12 shrink-0 rounded-full bg-coral-500" />
                  <MorphingAccent />
                </div>

                {/* Sous-titre */}
                <p className="anim-fade-up anim-delay-2 mt-6 max-w-md text-sm leading-relaxed text-ink/55 md:text-base">
                  {stats.totalQuestions}+ QCM générées à partir des textes officiels.
                  Chaque réponse cite sa source.
                </p>

                {/* CTAs */}
                <div className="anim-fade-up anim-delay-3 mt-6 flex flex-wrap gap-3">
                  <Link href="/sign-up">
                    <Button variant="primary" size="lg" className="min-w-[200px]">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="primaryOutline" size="lg">
                      J'ai déjà un compte
                    </Button>
                  </Link>
                  <GuestButton />
                </div>

                {/* Stats mobile (sous CTAs) */}
                <div className="anim-fade-up anim-delay-4 mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-ink/8 pt-6 md:hidden">
                  {dynamicStats.map((s) => (
                    <div key={s.label}>
                      <div className="font-display text-2xl font-black text-ink">{s.value}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Colonne droite : panneau info ── */}
              <div className="anim-fade-up anim-delay-2 hidden md:block">
                <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">

                  {/* Stats 2×2 */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {dynamicStats.map((s) => (
                      <div key={s.label} className="group relative cursor-default overflow-hidden rounded-xl bg-cream px-4 py-3 transition-shadow duration-200 hover:shadow-sm">
                        <div className="absolute inset-0 origin-bottom scale-y-0 bg-coral-50 transition-transform duration-300 ease-out group-hover:scale-y-100" />
                        <div className="relative font-display text-2xl font-black text-ink transition-colors duration-300 group-hover:text-coral-500">{s.value}</div>
                        <div className="relative mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/40 transition-colors duration-300 group-hover:text-coral-400">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Aperçu programme */}
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-coral-500">
                    Programme
                  </p>
                  <div className="space-y-2">
                    {stats.themes.map((theme) => {
                      const Icon = MATIERE_ICONS[theme.matiere] ?? Landmark;
                      return (
                        <div
                          key={theme.id}
                          className="group flex cursor-default items-center gap-3 rounded-xl border border-ink/6 bg-cream/60 px-3 py-2.5 transition-all duration-200 hover:border-coral-200 hover:bg-coral-50/50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coral-50 text-coral-500 transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-ink">{theme.title}</div>
                            <div className="text-[10px] text-ink/40">
                              {theme.chapitreCount} chapitres · {theme.questionCount} questions
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
