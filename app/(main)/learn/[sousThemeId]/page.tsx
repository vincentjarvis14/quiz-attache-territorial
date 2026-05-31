import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Target,
} from "lucide-react";

import db from "@/db/drizzle";
import { sousThemes } from "@/db/schema";
import { getSousThemeStats } from "@/db/queries";
import { cn } from "@/lib/utils";

import { AppHeader } from "../app-header";

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="rounded-2xl border border-ink/8 bg-white p-10 text-center shadow-soft">
          <p className="text-4xl">{emoji}</p>
          <h2 className="mt-4 font-display text-xl font-black text-ink">
            {message}
          </h2>
          <Link
            href="/learn"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </main>
    </div>
  );
}

export default async function SousThemePage({
  params,
}: {
  params: Promise<{ sousThemeId: string }>;
}) {
  const { sousThemeId: rawId } = await params;
  const sousThemeId = parseInt(rawId);

  if (isNaN(sousThemeId)) {
    return <EmptyState emoji="❌" message="ID de sous-thème invalide" />;
  }

  const [sousTheme] = await db
    .select()
    .from(sousThemes)
    .where(eq(sousThemes.id, sousThemeId))
    .limit(1);

  if (!sousTheme) {
    return <EmptyState emoji="📚" message="Sous-thème non trouvé" />;
  }

  const stats = await getSousThemeStats(sousThemeId);
  const hasProgress = stats && stats.totalAnswered > 0;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AppHeader />

      <main className="flex-1 px-6 pb-24 pt-8">
        <div className="mx-auto max-w-3xl">
          {/* Retour */}
          <Link
            href="/learn"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition-colors hover:text-coral-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux thèmes
          </Link>

          {/* En-tête */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-[3px] w-12 shrink-0 rounded-full bg-coral-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-coral-500">
                {stats?.totalQuestions || 0} questions disponibles
              </span>
            </div>
            <h1 className="font-display text-[2.2rem] font-black leading-[0.95] tracking-tight text-ink md:text-[2.8rem]">
              {sousTheme.title}
            </h1>
            {sousTheme.description && (
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink/55">
                {sousTheme.description}
              </p>
            )}
          </div>

          {/* Lancer le quiz */}
          <Link
            href={`/lesson?sousThemeId=${sousThemeId}`}
            className="group block rounded-2xl border border-ink/8 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[0_12px_40px_-8px_rgba(31,29,27,0.12)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-coral-50">
                <BookOpen className="h-7 w-7 text-coral-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-black text-ink transition-colors group-hover:text-coral-600">
                  Commencer le quiz
                </h3>
                <p className="text-sm text-ink/55">
                  Réponds à ton rythme, sans limite. Idéal pour apprendre.
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-coral-300 transition-all group-hover:translate-x-0.5 group-hover:text-coral-500" />
            </div>
          </Link>

          {/* Progression */}
          <div className="mt-8 rounded-2xl border border-ink/8 bg-white p-6 shadow-soft">
            <h3 className="mb-4 flex items-center gap-2 font-display text-base font-black text-ink">
              <Target className="h-5 w-5 text-coral-500" />
              Ta progression
            </h3>

            {hasProgress ? (
              <div className="space-y-4">
                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/55">Score global</span>
                    <span className="font-bold text-ink">
                      {stats!.correctCount}/{stats!.totalAnswered} bonnes réponses
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink/5">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        stats!.percentage >= 80
                          ? "bg-emerald-500"
                          : stats!.percentage >= 50
                            ? "bg-amber-500"
                            : "bg-coral-500",
                      )}
                      style={{ width: `${stats!.percentage}%` }}
                    />
                  </div>
                  <p className="text-right text-xs font-semibold text-ink/40">
                    {stats!.percentage}% de réussite
                  </p>
                </div>

                {/* Statut */}
                <div className="flex items-center gap-2 rounded-xl bg-cream px-4 py-3">
                  {stats!.status === "mastered" && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-700">
                        Thème maîtrisé ! 🎉
                      </span>
                    </>
                  )}
                  {stats!.status === "in_progress" && (
                    <>
                      <Target className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-semibold text-amber-700">
                        Continue comme ça, tu progresses bien !
                      </span>
                    </>
                  )}
                  {stats!.status === "needs_review" && (
                    <>
                      <AlertTriangle className="h-5 w-5 text-coral-500" />
                      <span className="text-sm font-semibold text-coral-700">
                        Ce thème a besoin d'être révisé
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/55">
                Commence un quiz pour voir ta progression apparaître ici.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
