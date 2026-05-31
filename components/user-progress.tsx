import Image from "next/image";
import Link from "next/link";
import { Heart, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { themes } from "@/db/schema";

type Props = {
  activeTheme: typeof themes.$inferSelect;
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  avatarUrl?: string | null;
  userName?: string | null;
};

export const UserProgress = ({
  activeTheme,
  hearts,
  points,
  hasActiveSubscription,
  avatarUrl,
  userName,
}: Props) => {
  return (
    <div className="flex flex-col gap-y-4 w-full">
      {avatarUrl && (
        <div className="flex items-center gap-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <Image
            src={avatarUrl}
            alt={userName ?? "Avatar"}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700 leading-tight">
              {userName ?? "Utilisateur"}
            </span>
            <span className="text-xs text-slate-400">Mon profil</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-x-2 w-full">
        <Link href="/courses">
          <Button variant="ghost">
            <span className="text-lg mr-2">
              {activeTheme.matiere === "environnement_territorial" ? "🏛️" : "🏗️"}
            </span>
            <span className="font-bold text-sm text-slate-700">
              {activeTheme.matiere === "environnement_territorial"
                ? "Environnement Territorial"
                : "Urbanisme"}
            </span>
          </Button>
        </Link>
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1 text-rose-500">
            <Heart className="h-5 w-5 fill-rose-500" />
            <span className="font-bold text-sm">{hearts}</span>
          </div>
          <div className="flex items-center gap-x-1 text-orange-500">
            <Zap className="h-5 w-5 fill-orange-500" />
            <span className="font-bold text-sm">{points}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
