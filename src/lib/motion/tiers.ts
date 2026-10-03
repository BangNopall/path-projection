import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

export type QualityTier = "high" | "medium" | "low";

export const QUALITY_TIER_STORAGE_KEY = "sge-quality-tier";

export interface QualityTierConfig {
  maxParticles: number;
  enableEchoTrails: boolean;
  enableRgbSplit: boolean;
  enableDofBlur: boolean;
  enableInteractiveTilt: boolean;
  dprLimit: number;
}

export const TIER_CONFIGS: Record<QualityTier, QualityTierConfig> = {
  high: {
    maxParticles: 120,
    enableEchoTrails: true,
    enableRgbSplit: true,
    enableDofBlur: true,
    enableInteractiveTilt: true,
    dprLimit: 2.0,
  },
  medium: {
    maxParticles: 60,
    enableEchoTrails: true,
    enableRgbSplit: false,
    enableDofBlur: false,
    enableInteractiveTilt: true,
    dprLimit: 1.75,
  },
  low: {
    maxParticles: 0,
    enableEchoTrails: false,
    enableRgbSplit: false,
    enableDofBlur: false,
    enableInteractiveTilt: false,
    dprLimit: 1.5,
  },
};

/**
 * Fungsi murni untuk menentukan tingkat kualitas grafis berdasarkan parameter perangkat atau override manual.
 */
export function resolveQualityTier(params: {
  override?: string | null | undefined;
  hardwareConcurrency?: number | undefined;
  deviceMemory?: number | undefined;
}): QualityTier {
  const normOverride = params.override?.toLowerCase().trim();
  if (normOverride === "low" || normOverride === "medium" || normOverride === "high") {
    return normOverride;
  }

  const cores = params.hardwareConcurrency ?? 4;
  const memory = params.deviceMemory ?? 4;

  if (cores <= 2 || memory <= 2) {
    return "low";
  }

  if (cores <= 4 || memory <= 4) {
    return "medium";
  }

  return "high";
}

function getStoredTier(): QualityTier | null {
  if (typeof window === "undefined") return null;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const fxParam = searchParams.get("fx");
    if (fxParam === "low" || fxParam === "medium" || fxParam === "high") {
      return fxParam;
    }
    const saved = window.localStorage.getItem(QUALITY_TIER_STORAGE_KEY);
    if (saved === "low" || saved === "medium" || saved === "high") {
      return saved;
    }
  } catch {
    // Abaikan jika localStorage atau URL dibatasi
  }
  return null;
}

function getHardwareTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const cores = nav?.hardwareConcurrency;
  const memory =
    nav && "deviceMemory" in nav ? (nav as { deviceMemory?: number }).deviceMemory : undefined;
  return resolveQualityTier({ hardwareConcurrency: cores, deviceMemory: memory });
}

export function useQualityTier(): {
  tier: QualityTier;
  setTier: (tier: QualityTier) => void;
  config: QualityTierConfig;
  isHigh: boolean;
  isMedium: boolean;
  isLow: boolean;
} {
  const [tier, setTierState] = useState<QualityTier>(() => {
    return getStoredTier() ?? getHardwareTier();
  });

  const setTier = useCallback((newTier: QualityTier) => {
    setTierState(newTier);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(QUALITY_TIER_STORAGE_KEY, newTier);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  return {
    tier,
    setTier,
    config: TIER_CONFIGS[tier],
    isHigh: tier === "high",
    isMedium: tier === "medium",
    isLow: tier === "low",
  };
}
