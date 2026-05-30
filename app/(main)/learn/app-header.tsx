"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/learn", label: "Apprendre" },
  { href: "/progression", label: "Progression" },
  { href: "/library", label: "Bibliothèque" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-ink/[0.06] bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-coral-500 text-white">
              <BookOpen className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-ink">
              Quiz Territorial
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/learn"
                  ? pathname === "/learn"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-coral-50 text-coral-700"
                      : "text-ink/55 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}
