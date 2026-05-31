"use client";

import { useEffect, useState } from "react";

const PHRASES = ["Tranquillement.", "À votre rythme.", "Sans stress."] as const;

const VISIBLE_MS = 3600;
const FADE_MS = 900;

export function MorphingAccent() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const interval = setInterval(() => {
      if (reduce) {
        setIndex((i) => (i + 1) % PHRASES.length);
        return;
      }
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, FADE_MS);
    }, VISIBLE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="font-display italic font-black leading-tight text-ink/80 text-[1.4rem] transition-opacity md:text-[2.2rem] lg:text-[2.8rem]"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${FADE_MS}ms`,
        transitionTimingFunction: "ease-in-out",
      }}
    >
      {PHRASES[index]}
    </span>
  );
}
