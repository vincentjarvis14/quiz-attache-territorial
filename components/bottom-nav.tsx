"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, TrendingUp, Library, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/learn", label: "Quizz", icon: GraduationCap },
  { href: "/progression", label: "Progression", icon: TrendingUp },
  { href: "/library", label: "Bibliothèque", icon: Library },
  { href: "/recherche-ia", label: "Recherche", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/[0.06] bg-cream/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/learn"
              ? pathname === "/learn"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                active ? "text-coral-600" : "text-ink/45 hover:text-ink/70",
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
