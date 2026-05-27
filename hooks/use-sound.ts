"use client";

import { useCallback, useRef } from "react";

export function useSound(url: string, volume = 0.5) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
      }
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if audio can't play (e.g., user hasn't interacted yet)
      });
    } catch {
      // Silently fail if Audio API is not available
    }
  }, [url, volume]);

  return play;
}
