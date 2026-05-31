"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { LibraryThemeSummary } from "@/db/queries";

type Props = {
  themes: LibraryThemeSummary[];
  activeSlug: string;
};

export function ThemeToggle({ themes, activeSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const select = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", slug);
    router.push(`/library?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center rounded-full bg-white p-1 shadow-soft border border-ink/8">
      {themes.map((t) => (
        <button
          key={t.slug}
          onClick={() => select(t.slug)}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
            t.slug === activeSlug
              ? "bg-coral-500 text-white shadow-sm"
              : "text-ink/50 hover:text-ink",
          ].join(" ")}
        >
          {t.title}
        </button>
      ))}
    </div>
  );
}
