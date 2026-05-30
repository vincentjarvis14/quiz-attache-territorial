import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  BookOpen,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import {
  getUserProgress,
  getProgressionBySousTheme,
  getMostMissedQuestions,
} from "@/db/queries";
import { cn } from "@/lib/utils";

import { AppHeader } from "../learn/app-header";

export const metadata: Metadata = { title: "Progression" };

// Couleur de la barre selon le taux de réussite (palette coral / ambre / vert).
function toneFor(pct: number) {
  if (pct >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-coral-500", text: "text-coral-600" };
}

export default async function ProgressionPage() {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.activeThemeId) {
    redirect("/courses");
  }

  const [rows, missed] = await Promise.all([
    getProgressionBySousTheme(),
    getMostMissedQuestions(10),
  ]);

  // Agrégats globaux.
  const totalQuestions = rows.reduce((s, r) => s + r.totalQuestions, 0);
  const totalAnswered = rows.reduce((s, r) => s + r.answered, 0);
  const totalCorrect = rows.reduce((s, r) => s + r.correctLast, 0);
  const globalCoverage =
    totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  const globalAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const hasActivity = totalAnswered > 0;
  const accuracyTone = toneFor(globalAccuracy);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />

      <main className="flex-1 px-6 pb-24 pt-8">
        <div className="mx-auto max-w-5xl">
          {/* En-tête */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-[3px] w-12 shrink-0 rounded-full bg-coral-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-coral-500">
                {userProgress.activeTheme?.title ?? "Progression"}
              </span>
            </div>
            <h1 className="font-display text-[2.6rem] font-black leading-[0.9] tracking-tight text-ink md:text-[3.5rem]">
              Ma progression.
            </h1>
          </div>

          {!hasActivity ? (
            /* État vide : aucune réponse enregistrée */
            <div className="rounded-2xl border border-ink/8 bg-white p-10 text-center shadow-soft">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-ink/20" />
              <p className="font-display text-xl font-black text-ink">
                Pas encore de données
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink/55">
                Lancez un premier quiz pour voir apparaître votre couverture du
                programme et vos points faibles.
              </p>
              <Link
                href="/learn"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-600"
              >
                Commencer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Section 1 — Bandeau global */}
              <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon={Target}
                  label="Questions couvertes"
                  value={`${totalAnswered}/${totalQuestions}`}
                  subtext={`${globalCoverage}% du programme`}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Taux de réussite"
                  value={`${globalAccuracy}%`}
                  subtext={`${totalCorrect} bonnes réponses`}
                  valueClass={accuracyTone.text}
                />
                <StatCard
                  icon={AlertCircle}
                  label="À retravailler"
                  value={`${missed.length}`}
                  subtext="questions ratées"
                  valueClass={missed.length > 0 ? "text-coral-600" : "text-emerald-600"}
                />
              </div>

              {/* Section 2 — Couverture par sous-thème */}
              <section className="mb-10">
                <h2 className="mb-4 font-display text-xl font-black text-ink">
                  Couverture par sous-thème
                </h2>
                <div className="space-y-3">
                  {rows.map((r) => {
                    const tone = toneFor(r.accuracy);
                    return (
                      <Link
                        key={r.sousThemeId}
                        href={`/learn/${r.sousThemeId}`}
                        className="group block rounded-2xl border border-ink/8 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[0_12px_40px_-8px_rgba(31,29,27,0.12)]"
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-3">
                          <span className="font-display text-[15px] font-black leading-tight text-ink transition-colors group-hover:text-coral-600">
                            {r.title}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-ink/45">
                            {r.answered}/{r.totalQuestions}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-ink/5">
                          <div
                            className={cn("h-full rounded-full", tone.bar)}
                            style={{ width: `${r.coverage}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-semibold uppercase tracking-wider text-ink/40">
                            {r.coverage}% couvert
                          </span>
                          {r.answered > 0 ? (
                            <span className={cn("font-semibold", tone.text)}>
                              {r.accuracy}% de réussite
                            </span>
                          ) : (
                            <span className="font-semibold text-ink/40">
                              À commencer
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Section 3 — Questions les plus ratées */}
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-black text-ink">
                    Questions à retravailler
                  </h2>
                  {missed.length > 0 && (
                    <Link
                      href="/lesson?mode=revision"
                      className="inline-flex items-center gap-1.5 rounded-full bg-coral-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-coral-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Réviser mes erreurs
                    </Link>
                  )}
                </div>

                {missed.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-soft">
                    {missed.map((q, i) => (
                      <div
                        key={q.questionId}
                        className={cn(
                          "flex items-start gap-4 p-4 sm:p-5",
                          i > 0 && "border-t border-ink/[0.06]",
                        )}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-50 text-xs font-bold text-coral-700">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium leading-snug text-ink">
                            {q.question}
                          </p>
                          <p className="mt-1 text-xs text-ink/45">
                            {q.sousThemeTitle}
                          </p>
                        </div>
                        <span className="mt-0.5 shrink-0 whitespace-nowrap rounded-full bg-coral-50 px-2.5 py-1 text-[11px] font-semibold text-coral-700">
                          {q.wrongCount} erreur{q.wrongCount > 1 ? "s" : ""}
                          {q.attempts > q.wrongCount && (
                            <span className="text-coral-400">
                              {" "}
                              / {q.attempts}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
                    <div>
                      <p className="font-display text-lg font-black text-ink">
                        Aucune erreur en attente
                      </p>
                      <p className="text-[13px] text-ink/55">
                        Votre dernière réponse était correcte sur toutes les
                        questions répondues.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Lien retour apprentissage */}
              <div className="mt-10 flex justify-center">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors hover:text-coral-600"
                >
                  <BookOpen className="h-4 w-4" />
                  Continuer l'apprentissage
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50">
        <Icon className="h-5 w-5 text-coral-500" />
      </div>
      <p className={cn("font-display text-2xl font-black text-ink", valueClass)}>
        {value}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-ink/70">{label}</p>
      <p className="text-xs text-ink/45">{subtext}</p>
    </div>
  );
}
