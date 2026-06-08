"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Faux placeholder « machine à écrire » : tape une phrase, la laisse affichée,
 * l'efface, puis passe à une autre (ordre aléatoire). À superposer sur un input
 * vide (pointer-events-none). Cycle ~5 s par phrase.
 */
export function TypingPlaceholder({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let active = true;
    const order = [...phrases].sort(() => Math.random() - 0.5);
    let i = 0;

    const wait = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    async function loop() {
      while (active) {
        const phrase = order[i % order.length];
        for (let c = 1; c <= phrase.length && active; c++) {
          setDisplay(phrase.slice(0, c));
          await wait(45);
        }
        await wait(2500);
        for (let c = phrase.length; c >= 0 && active; c--) {
          setDisplay(phrase.slice(0, c));
          await wait(20);
        }
        await wait(300);
        i++;
      }
    }

    loop();
    return () => {
      active = false;
    };
  }, [phrases]);

  return (
    <span className={cn("truncate", className)}>
      {display}
      <span className="animate-pulse">|</span>
    </span>
  );
}
