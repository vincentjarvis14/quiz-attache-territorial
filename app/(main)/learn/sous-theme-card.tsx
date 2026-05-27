"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SousThemeWithProgress } from "@/db/queries";
import {
  BookOpen,
  Landmark,
  Building2,
  Scale,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  ChevronRight,
} from "lucide-react";

const themeIcons = [
  BookOpen,
  Landmark,
  Building2,
  Scale,
  FileText,
];

const statusConfig = {
  not_started: {
    label: "Pas commencé",
    icon: Circle,
    badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    progressColor: "#94A3B8",
    accentColor: "border-t-slate-300",
    iconBg: "from-slate-400 to-slate-500",
  },
  in_progress: {
    label: "En cours",
    icon: Clock,
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    progressColor: "#7C3AED",
    accentColor: "border-t-violet-500",
    iconBg: "from-violet-500 to-violet-600",
  },
  needs_review: {
    label: "À réviser",
    icon: AlertTriangle,
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    progressColor: "#F59E0B",
    accentColor: "border-t-amber-500",
    iconBg: "from-amber-500 to-amber-600",
  },
  mastered: {
    label: "Maîtrisé",
    icon: CheckCircle2,
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    progressColor: "#10B981",
    accentColor: "border-t-emerald-500",
    iconBg: "from-emerald-500 to-emerald-600",
  },
};

type Props = {
  sousTheme: SousThemeWithProgress;
  index?: number;
};

export const SousThemeCard = ({ sousTheme, index = 0 }: Props) => {
  const config = statusConfig[sousTheme.status];
  const hasProgress = sousTheme.totalAnswered > 0;
  const StatusIcon = config.icon;
  const ThemeIcon = themeIcons[index % themeIcons.length];

  return (
    <Link href={`/learn/${sousTheme.id}`} className="block group">
      <div
        className={cn(
          "relative flex flex-col rounded-2xl bg-white p-6 transition-all duration-200",
          "border border-[rgba(124,58,237,0.1)]",
          "shadow-sm hover:shadow-lg",
          "hover:scale-[1.02]",
          "border-t-4",
          config.accentColor,
          "backdrop-blur-sm"
        )}
      >
        {/* En-tête avec icône et badge */}
        <div className="flex items-start justify-between mb-4">
          {/* Cercle icône */}
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md",
              config.iconBg
            )}
          >
            <ThemeIcon className="h-6 w-6 text-white" />
          </div>

          {/* Badge statut */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              config.badgeColor
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{config.label}</span>
          </span>
        </div>

        {/* Titre et description */}
        <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-base text-slate-800 mb-1.5 group-hover:text-violet-600 transition-colors">
          {sousTheme.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {sousTheme.description}
        </p>

        {/* Barre de progression */}
        {hasProgress && (
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Progression</span>
              <span className="font-semibold text-slate-600">
                {sousTheme.correctCount}/{sousTheme.totalAnswered}
                <span className="text-slate-400 ml-1">
                  ({sousTheme.percentage}%)
                </span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${sousTheme.percentage}%`,
                  backgroundColor: config.progressColor,
                }}
              />
            </div>
          </div>
        )}

        {/* État pas commencé */}
        {!hasProgress && (
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {sousTheme.totalQuestions} questions
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        )}

        {/* Nombre de questions quand il y a de la progression */}
        {hasProgress && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {sousTheme.totalQuestions} questions
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        )}
      </div>
    </Link>
  );
};
