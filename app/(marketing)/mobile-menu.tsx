"use client";

import Link from "next/link";
import { Menu, FileText, LogIn } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MarketingMobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Ouvrir le menu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <Menu className="h-5 w-5" strokeWidth={2.2} />
      </SheetTrigger>
      <SheetContent side="right" className="w-72 bg-cream p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav className="flex flex-col gap-1 px-4 pt-16">
          <SheetClose asChild>
            <Link
              href="/presentation"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-semibold text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <FileText className="h-[18px] w-[18px]" strokeWidth={2} />
              Présentation projet
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/sign-in"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-semibold text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <LogIn className="h-[18px] w-[18px]" strokeWidth={2} />
              Se connecter
            </Link>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
