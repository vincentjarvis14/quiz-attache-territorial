"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { supabase } from "@/lib/supabase";
import { LogOut, GraduationCap } from "lucide-react";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-purple-100/60 bg-white/80 backdrop-blur-xl px-4 lg:fixed lg:left-0 lg:top-0 lg:w-[256px]",
        className
      )}
    >
      {/* Logo */}
      <Link href="/learn">
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-200">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-emerald-600 bg-clip-text text-transparent">
            Quiz Territorial
          </h1>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-y-1">
        <SidebarItem label="Apprendre" href="/learn" iconSrc="/learn.svg" />
        <SidebarItem label="Thèmes" href="/courses" iconSrc="/courses.svg" />
      </div>

      {/* Déconnexion */}
      <div className="border-t border-purple-100/60 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-purple-400 transition hover:bg-purple-50 hover:text-purple-600"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};
