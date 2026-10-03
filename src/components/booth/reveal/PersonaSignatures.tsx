import React from "react";
import type { PersonaKey } from "@/data/personas";
import type { QualityTier } from "@/lib/motion/tiers";

interface PersonaSignaturesProps {
  personaKey: PersonaKey;
  tier: QualityTier;
  isActive: boolean;
  accentColor: string;
}

export const PersonaSignatures: React.FC<PersonaSignaturesProps> = ({
  personaKey,
  tier,
  isActive,
  accentColor,
}) => {
  if (tier === "low" || !isActive) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-hidden select-none -z-10"
    >
      {/* 1. CAREER: ARCHITECTURAL BLUEPRINT & FOUNDATION PILLARS */}
      {personaKey === "career" && (
        <div className="absolute inset-0 size-full">
          {/* Blueprint Orthogonal Grid Lines */}
          <svg className="absolute inset-0 size-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="blueprint-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="0.75"
                  strokeOpacity="0.4"
                />
                <circle cx="0" cy="0" r="1.5" fill={accentColor} fillOpacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
          </svg>

          {/* Rising Staggered Foundation Pillars */}
          <div className="absolute inset-x-0 bottom-0 h-48 flex justify-around items-end opacity-25 px-10">
            <div className="w-12 bg-gradient-to-t from-[#F2B705]/40 to-transparent h-36 rounded-t-sm animate-pulse" />
            <div className="w-16 bg-gradient-to-t from-[#F2B705]/60 to-transparent h-48 rounded-t-sm" />
            <div className="w-10 bg-gradient-to-t from-[#F2B705]/30 to-transparent h-28 rounded-t-sm animate-pulse" />
            <div className="w-20 bg-gradient-to-t from-[#F2B705]/50 to-transparent h-40 rounded-t-sm" />
          </div>

          {/* Golden Horizontal Level Beam */}
          <div
            className="absolute left-0 top-1/2 w-full h-px opacity-40"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
          />
        </div>
      )}

      {/* 2. CREATIVE: ORGANIC FLUID BLOOM & AURORA BLOBS */}
      {personaKey === "creative" && (
        <div className="absolute inset-0 size-full">
          {/* Organic Aurora Blobs */}
          <div
            className="absolute left-1/4 top-1/3 size-96 rounded-full blur-3xl opacity-35 animate-pulse"
            style={{
              background: "radial-gradient(circle, #57D4DD 0%, #1F6F78 60%, transparent 80%)",
              animationDuration: "4s",
            }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 size-80 rounded-full blur-3xl opacity-25"
            style={{
              background: "radial-gradient(circle, #FFEFD3 0%, #57D4DD 50%, transparent 80%)",
            }}
          />

          {/* Brush Stroke Curved Wave Overlay */}
          <svg
            className="absolute inset-0 size-full opacity-30"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M -100 300 C 200 150, 400 450, 700 250 C 900 120, 1050 350, 1200 280"
              stroke="#57D4DD"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 8"
              opacity="0.6"
            />
            <path
              d="M -50 360 C 250 200, 450 500, 750 300 C 950 170, 1100 400, 1250 330"
              stroke="#FFEFD3"
              strokeWidth="2"
              opacity="0.4"
            />
          </svg>
        </div>
      )}

      {/* 3. ADVENTURE: COMPASS NAVIGATION & WARP HORIZON */}
      {personaKey === "adventure" && (
        <div className="absolute inset-0 size-full">
          {/* Rotating Compass Ring */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[520px] rounded-full border border-[var(--SGEPacificOcean)]/25 opacity-40 animate-spin"
            style={{ animationDuration: "35s" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 bg-[var(--SGECoralAqua)] rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-2 bg-[var(--SGECoralAqua)] rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2 bg-[var(--SGECoralAqua)] rounded-full" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 size-2 bg-[var(--SGECoralAqua)] rounded-full" />
          </div>

          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[640px] rounded-full border border-dashed border-[var(--SGECoralAqua)]/20 opacity-30 animate-spin"
            style={{ animationDuration: "50s", animationDirection: "reverse" }}
          />

          {/* Horizon Sweep Beam */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] opacity-45"
            style={{
              background: "linear-gradient(90deg, transparent 5%, #57D4DD 50%, transparent 95%)",
              boxShadow: "0 0 16px rgba(87, 212, 221, 0.4)",
            }}
          />

          {/* Radial Warp Vectors */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(58,140,154,0.12)_100%)]" />
        </div>
      )}
    </div>
  );
};
