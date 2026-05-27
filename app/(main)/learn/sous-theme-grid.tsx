import { SousThemeWithProgress } from "@/db/queries";
import { SousThemeCard } from "./sous-theme-card";
import { BookOpen } from "lucide-react";

type Props = {
  sousThemes: SousThemeWithProgress[];
};

export const SousThemeGrid = ({ sousThemes }: Props) => {
  if (sousThemes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 shadow-sm mb-6">
          <BookOpen className="h-8 w-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Aucun sous-thème disponible
        </h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          Ce thème ne contient pas encore de sous-thèmes. Reviens plus tard !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
      {sousThemes.map((sousTheme, index) => (
        <SousThemeCard key={sousTheme.id} sousTheme={sousTheme} index={index} />
      ))}
    </div>
  );
};
