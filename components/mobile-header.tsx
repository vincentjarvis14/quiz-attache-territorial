"use client";

import { Menu, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export const MobileHeader = () => {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-[56px] w-full items-center border-b border-purple-100/60 bg-white/90 backdrop-blur-xl px-4 lg:hidden">
      <Sheet>
        <SheetTrigger>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 shadow-md shadow-purple-200">
            <Menu className="h-5 w-5 text-white" />
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <Link href="/learn" className="ml-3 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-purple-600" />
        <span className="text-base font-bold bg-gradient-to-r from-purple-700 to-emerald-600 bg-clip-text text-transparent">
          Quiz Territorial
        </span>
      </Link>
    </header>
  );
};
