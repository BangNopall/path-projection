import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Hook terpadu untuk memeriksa preferensi reduced motion dari sistem operasi/browser.
 * Menggabungkan `useReducedMotion` dari motion/react dengan media query browser langsung.
 */
export function useUnifiedReducedMotion(): boolean {
  const motionReduced = useReducedMotion();
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setSystemReduced(event.matches);
    };

    mediaQuery.addEventListener?.("change", handler);
    return () => {
      mediaQuery.removeEventListener?.("change", handler);
    };
  }, []);

  return Boolean(motionReduced || systemReduced);
}
