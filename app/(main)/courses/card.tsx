"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Props = {
  id: number;
  title: string;
  imageSrc: string | null;
  onClick: (id: number) => void;
  disabled?: boolean;
  active?: boolean;
  matiere?: string;
};

export const Card = ({
  id,
  title,
  imageSrc,
  onClick,
  disabled,
  active,
  matiere,
}: Props) => {
  const isEnvTerritorial = matiere === "environnement_territorial";

  const displayTitle = title;
  const emoji = isEnvTerritorial ? "🏛️" : "🏗️";
  const color = isEnvTerritorial
    ? "from-purple-500 to-purple-600"
    : "from-emerald-500 to-emerald-600";

  return (
    <button
      onClick={() => onClick(id)}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center justify-center h-full min-h-[200px] rounded-xl border-2 border-b-4 hover:bg-black/5 active:border-b-2 cursor-pointer",
        "p-4 pb-6",
        active && "ring-2 ring-green-500 border-green-500",
      )}
    >
      {active && (
        <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1">
          <Check className="h-4 w-4 text-white stroke-[3]" />
        </div>
      )}
      <div className={cn(
        "flex items-center justify-center rounded-full w-16 h-16 mb-3 bg-gradient-to-br shadow-md",
        color,
      )}>
        <span className="text-2xl">{emoji}</span>
      </div>
      <span className="font-bold text-sm text-slate-700 text-center">
        {displayTitle}
      </span>
    </button>
  );
};
