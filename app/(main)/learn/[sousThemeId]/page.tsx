import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { sousThemes } from "@/db/schema";
import { getSousThemeStats } from "@/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, BookOpen, Sparkles, CheckCircle2, AlertTriangle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function SousThemePage({
  params,
}: {
  params: Promise<{ sousThemeId: string }>;
}) {
  const { sousThemeId: rawId } = await params;
  const sousThemeId = parseInt(rawId);

  if (isNaN(sousThemeId)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">❌</p>
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            ID de sous-thème invalide
          </h2>
          <Link href="/learn">
            <Button variant="primaryOutline" className="mt-6">
              Retour
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const [sousTheme] = await db
    .select()
    .from(sousThemes)
    .where(eq(sousThemes.id, sousThemeId))
    .limit(1);

  if (!sousTheme) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-4xl">📚</p>
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Sous-thème non trouvé
          </h2>
          <Link href="/learn">
            <Button variant="primaryOutline" className="mt-6">
              Retour
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = await getSousThemeStats(sousThemeId);
  const hasProgress = stats && stats.totalAnswered > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Retour */}
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-purple-50 hover:text-purple-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux thèmes
      </Link>

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-200">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {sousTheme.title}
            </h1>
            <p className="mt-1 text-slate-500">{sousTheme.description}</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm text-purple-600">
          <BookOpen className="h-4 w-4" />
          {stats?.totalQuestions || 0} questions disponibles
        </div>
      </div>

      {/* Modes de jeu */}
      <div className="grid gap-4">
        {/* Mode Libre */}
        <Link href={`/lesson?sousThemeId=${sousThemeId}&mode=free`}>
          <div className="group cursor-pointer rounded-2xl border-2 border-purple-200/60 bg-gradient-to-br from-white to-purple-50/40 p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-200">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">
                  Mode Libre
                </h3>
                <p className="text-sm text-slate-500">
                  Réponds à ton rythme, sans limite de vies. Idéal pour
                  apprendre.
                </p>
              </div>
              <ArrowLeft className="h-6 w-6 rotate-180 text-purple-300 transition-all group-hover:text-purple-500" />
            </div>
          </div>
        </Link>

        {/* Mode Challenge */}
        <Link href={`/lesson?sousThemeId=${sousThemeId}&mode=challenge`}>
          <div className="group cursor-pointer rounded-2xl border-2 border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-200">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">
                  Mode Challenge
                </h3>
                <p className="text-sm text-slate-500">
                  5 cœurs, 10 questions. Teste-toi en conditions réelles !
                </p>
              </div>
              <ArrowLeft className="h-6 w-6 rotate-180 text-emerald-300 transition-all group-hover:text-emerald-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Progression */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-700 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Ta progression
        </h3>

        {hasProgress ? (
          <div className="space-y-4">
            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Score global</span>
                <span className="font-bold text-slate-700">
                  {stats!.correctCount}/{stats!.totalAnswered} bonnes réponses
                </span>
              </div>
              <Progress value={stats!.percentage} className="h-3" />
              <p className="text-xs text-slate-400 text-right">
                {stats!.percentage}% de réussite
              </p>
            </div>

            {/* Statut */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-100/80 px-4 py-3">
              {stats!.status === "mastered" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">
                    Thème maîtrisé ! 🎉
                  </span>
                </>
              )}
              {stats!.status === "in_progress" && (
                <>
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Continue comme ça, tu progresses bien !
                  </span>
                </>
              )}
              {stats!.status === "needs_review" && (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">
                    Ce thème a besoin d'être révisé
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Commence un quiz pour voir ta progression apparaître ici.
          </p>
        )}
      </div>
    </div>
  );
}
