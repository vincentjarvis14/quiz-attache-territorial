import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingMobileMenu } from "./mobile-menu";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-coral-500 transition-transform group-hover:scale-105">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <span className="text-sm font-bold text-ink">Quiz Territorial</span>
        </Link>
        {/* Nav desktop */}
        <nav className="hidden items-center gap-2 sm:flex">
          <Link href="/presentation" className="rounded-md px-3 py-1.5 text-sm font-medium text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink">
            Rapport technique
          </Link>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" size="sm">
              Commencer
            </Button>
          </Link>
        </nav>

        {/* Nav mobile : CTA principal + burger (Rapport technique, Se connecter) */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <Link href="/sign-up">
            <Button variant="primary" size="sm">
              Commencer
            </Button>
          </Link>
          <MarketingMobileMenu />
        </div>
      </div>
    </header>
  );
};
