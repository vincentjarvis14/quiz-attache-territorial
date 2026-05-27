"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-20 w-full border-b border-purple-100/60 bg-white/80 backdrop-blur-xl px-4">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-200">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-emerald-600 bg-clip-text text-transparent">
            Quiz Territorial
          </h1>
        </Link>
      </div>
    </header>
  );
};
