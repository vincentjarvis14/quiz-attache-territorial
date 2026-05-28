import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getUserProgress,
  getSousThemesWithProgress,
  getTopTenUsers,
} from "@/db/queries";
import {
  GraduationCap,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const userProgress = await getUserProgress();
  const sousThemesList = await getSousThemesWithProgress();
  const topTen = await getTopTenUsers();

  if (!userProgress || !userProgress.activeTheme) {
    redirect("/courses");
  }

  // Calcul des stats globales
  const totalAnswered = sousThemesList.reduce((s, st) => s + st.totalAnswered, 0);
  const totalCorrect = sousThemesList.reduce((s, st) => s + st.correctCount, 0);
  const totalQuestions = sousThemesList.reduce((s, st) => s + st.totalQuestions, 0);
  const globalPercentage = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 0;

  const masteredCount = sousThemesList.filter((st) => st.status === "mastered").length;
  const needsReviewCount = sousThemesList.filter((st) => st.status === "needs_review").length;
  const inProgressCount = sousThemesList.filter((st) => st.status === "in_progress").length;

  // Sous-thèmes à réviser (points faibles)
  const weakThemes = sousThemesList
    .filter((st) => st.status === "needs_review")
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  // Activité récente (sous-thèmes avec progression)
  const recentActivity = sousThemesList
    .filter((st) => st.totalAnswered > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const kpiCards = [
    {
      icon: Target,
      label: "Questions répondues",
      value: `${totalAnswered}/${totalQuestions}`,
      subtext: `${totalQuestions - totalAnswered} restantes`,
      color: "text-navy-600",
      bgColor: "bg-navy-100",
      trend: totalAnswered > 0 ? "up" : "neutral",
    },
    {
      icon: TrendingUp,
      label: "Taux de réussite",
      value: `${globalPercentage}%`,
      subtext: `${totalCorrect} bonnes réponses`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: globalPercentage >= 70 ? "up" : globalPercentage >= 40 ? "neutral" : "down",
    },
    {
      icon: Award,
      label: "Sous-thèmes maîtrisés",
      value: `${masteredCount}/${sousThemesList.length}`,
      subtext: `${inProgressCount} en cours`,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      trend: masteredCount > 0 ? "up" : "neutral",
    },
    {
      icon: Clock,
      label: "Points à réviser",
      value: `${needsReviewCount}`,
      subtext: "sous-thèmes à revoir",
      color: "text-rose-600",
      bgColor: "bg-rose-100",
      trend: needsReviewCount > 0 ? "down" : "up",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-slate-800">
              Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {userProgress.activeTheme.title} — Suivez votre progression
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Continuer l'apprentissage
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  {kpi.trend === "up" && (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  )}
                  {kpi.trend === "down" && (
                    <ArrowUpRight className="w-4 h-4 text-rose-500 rotate-180" />
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-800 mb-1">{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{kpi.subtext}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activité récente */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-navy-600" />
                    Progression par sous-thème
                  </h2>
                  <Link
                    href="/learn"
                    className="text-xs text-navy-600 hover:text-navy-700 font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((st) => (
                      <Link
                        key={st.id}
                        href={`/learn/${st.id}`}
                        className="block p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700 group-hover:text-navy-700 transition-colors">
                            {st.title}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {st.totalAnswered}/{st.totalQuestions}
                          </span>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                              st.percentage >= 80
                                ? "bg-emerald-500"
                                : st.percentage >= 40
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${st.percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-xs font-medium ${
                            st.percentage >= 80
                              ? "text-emerald-600"
                              : st.percentage >= 40
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}>
                            {st.percentage}%
                          </span>
                          <span className="text-xs text-slate-400 capitalize">
                            {st.status === "mastered" ? "Maîtrisé" :
                             st.status === "in_progress" ? "En cours" :
                             st.status === "needs_review" ? "À réviser" : "Non commencé"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      Commencez un quiz pour voir votre progression
                    </p>
                    <Link
                      href="/learn"
                      className="inline-block mt-3 text-sm text-navy-600 hover:text-navy-700 font-medium"
                    >
                      Aller à l'apprentissage →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Points faibles + Classement */}
          <div className="space-y-6">
            {/* Points faibles */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  À améliorer
                </h2>
              </div>
              <div className="p-4">
                {weakThemes.length > 0 ? (
                  <div className="space-y-3">
                    {weakThemes.map((st) => (
                      <Link
                        key={st.id}
                        href={`/learn/${st.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate group-hover:text-navy-700">
                            {st.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {st.correctCount}/{st.totalAnswered} correct
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-rose-500 ml-3">
                          {st.percentage}%
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      Aucun point faible identifié
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Classement */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-navy-600" />
                  Classement
                </h2>
              </div>
              <div className="p-4">
                {topTen.length > 0 ? (
                  <div className="space-y-2">
                    {topTen.map((user, index) => (
                      <div
                        key={user.userId}
                        className="flex items-center gap-3 p-2 rounded-lg"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-amber-100 text-amber-700"
                            : index === 1
                            ? "bg-slate-200 text-slate-600"
                            : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-600 to-burgundy-700 flex items-center justify-center text-white text-xs font-bold">
                          {user.userName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {user.userName || "Anonyme"}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-navy-700">
                          {user.points}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">
                      Soyez le premier à apparaître ici
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
