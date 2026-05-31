"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { List } from "lucide-react";
import Link from "next/link";

type Section = { id: string; title: string };

type Props = {
  sections: Section[];
  /** URL de base de la fiche : /library/[slug]/[sousThemeId] */
  href: string;
  children: React.ReactNode;
};

export function SectionPreview({ sections, href, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => setMounted(true), []);

  const handleEnter = () => {
    timer.current = setTimeout(() => setVisible(true), 1000);
  };

  const handleLeave = () => {
    clearTimeout(timer.current);
    setVisible(false);
  };

  const overlay =
    mounted
      ? createPortal(
          <div
            aria-hidden={!visible}
            onClick={() => setVisible(false)}
            className={[
              "fixed inset-0 z-50 flex items-center justify-center p-6",
              "transition-all duration-300",
              visible
                ? "opacity-100 backdrop-blur-[3px] [background:rgba(31,29,27,0.18)]"
                : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={[
                "w-full max-w-xl rounded-2xl border border-ink/8 bg-white p-6",
                "shadow-[0_24px_64px_-12px_rgba(31,29,27,0.28)]",
                "transition-all duration-300",
                visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
              ].join(" ")}
            >
              <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/35">
                <List className="h-3.5 w-3.5" strokeWidth={2.5} />
                {sections.length} sections
              </p>
              <ul className="grid max-h-[60vh] grid-cols-2 gap-x-6 gap-y-2 overflow-y-auto pr-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <Link
                      href={`${href}#${s.id}`}
                      onClick={() => setVisible(false)}
                      className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium leading-snug text-ink transition-colors hover:bg-coral-50 hover:text-coral-600"
                    >
                      <span className="mt-px shrink-0 text-[10px] font-black text-coral-400 transition-colors group-hover:text-coral-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {overlay}
    </div>
  );
}
