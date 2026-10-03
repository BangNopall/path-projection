import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shuffle } from "lucide-react";
import { personas, type PersonaKey } from "@/data/personas";
import { playAudioTone } from "@/lib/audio";
import { useUnifiedReducedMotion } from "@/lib/motion/use-reduced-motion-unified";
import { useQualityTier } from "@/lib/motion/tiers";

interface InteractiveDeckProps {
  soundEnabled: boolean;
  onSelectPersona?: (key: PersonaKey) => void;
}

interface DeckCardConfig {
  key: PersonaKey;
  label: string;
  badgeAccent: string;
  isFrontMascot?: boolean;
}

const INITIAL_CARDS: DeckCardConfig[] = [
  {
    key: "career",
    label: "01 · Karier",
    badgeAccent: "border-[var(--SGEMustardGold)]/35 text-[var(--SGEMustardGold)]",
  },
  {
    key: "adventure",
    label: "03 · Petualangan",
    badgeAccent: "border-[var(--SGEPacificOcean)]/40 text-[var(--SGECoralAqua)]",
  },
  {
    key: "creative",
    label: "02 · Kreativitas",
    badgeAccent: "border-[var(--SGECoralAqua)]/40 text-[var(--SGECoralAqua)]",
    isFrontMascot: true,
  },
];

export const InteractiveDeck: React.FC<InteractiveDeckProps> = ({
  soundEnabled,
  onSelectPersona,
}) => {
  const [cards, setCards] = useState<DeckCardConfig[]>(INITIAL_CARDS);
  const [isShuffling, setIsShuffling] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useUnifiedReducedMotion();
  const { tier } = useQualityTier();

  // Mouse tilt physics for subtle deck parallax (Tier high & medium)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || tier === "low" || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        rotateX: -y * 8,
        rotateY: x * 10,
      });
    },
    [shouldReduceMotion, tier],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  // Coordinated tactile shuffle
  const handleShuffle = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    playAudioTone("shuffle", soundEnabled);

    // Rotate cards order: top becomes bottom, middle rises
    setTimeout(() => {
      setCards((prev) => {
        const next = [...prev];
        const last = next.pop();
        if (last) next.unshift(last);
        return next;
      });
      setIsShuffling(false);
      playAudioTone("whoosh", soundEnabled);
    }, 280);
  };

  // Card slot positions (Slot 0: Left Fan, Slot 1: Right Fan, Slot 2: Center Stage)
  const getSlotStyle = (slotIndex: number) => {
    if (slotIndex === 0) {
      // Left Fan
      return {
        x: "-72%",
        y: "-46%",
        rotate: -18,
        scale: 0.94,
        zIndex: 1,
      };
    }
    if (slotIndex === 1) {
      // Right Fan
      return {
        x: "-22%",
        y: "-45%",
        rotate: 18,
        scale: 0.94,
        zIndex: 2,
      };
    }
    // Center Stage
    return {
      x: "-50%",
      y: "-53%",
      rotate: 0,
      scale: 1,
      zIndex: 4,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[460px] w-full max-w-[620px] items-center justify-center sm:h-[540px] lg:h-[600px] [perspective:1200px]"
      aria-label="Tumpukan tiga kartu persona interaktif SGE 2026"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Tilted Inner Rig */}
      <motion.div
        className="relative size-full flex items-center justify-center [transform-style:preserve-3d]"
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: "spring", stiffness: 240, damping: 25 }}
      >
        {/* Neo-Editorial Bento Circuit Texture Backdrop */}
        <div className="circuit-pattern-bg absolute left-1/2 top-1/2 size-[380px] sm:size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-35 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 size-[310px] sm:size-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--SGEMustardGold)]/25 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 size-[250px] sm:size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none" />

        {/* Ambient Halo Behind Center Card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(circle, var(--SGECoralAqua) 0%, var(--SGEMustardGold) 45%, transparent 70%)",
          }}
        />

        {/* Editorial Registration Marks */}
        <div className="absolute top-4 left-6 text-[10px] font-mono tracking-widest text-[var(--SGECoralAqua)]/40 pointer-events-none select-none">
          ⌜ DECK.SGE.2026 // TR-01
        </div>
        <div className="absolute bottom-4 right-6 text-[10px] font-mono tracking-widest text-[var(--SGEMustardGold)]/40 pointer-events-none select-none">
          ARCHETYPE.SYSTEM // 03 ⌟
        </div>

        {/* Coordinated 3 Cards Stack */}
        {cards.map((card, slotIndex) => {
          const item = personas[card.key];
          const slot = getSlotStyle(slotIndex);
          const isCenter = slotIndex === 2;

          return (
            <motion.div
              key={card.key}
              layout={!shouldReduceMotion}
              className={`deck-card left-1/2 top-1/2 cursor-pointer ${
                isCenter ? "shadow-[0_24px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/15" : ""
              }`}
              style={{
                transformOrigin: "bottom center",
                zIndex: isShuffling ? (slotIndex === 2 ? 1 : slot.zIndex + 1) : slot.zIndex,
              }}
              animate={
                shouldReduceMotion
                  ? {
                      x: slot.x,
                      y: slot.y,
                      rotate: slot.rotate,
                      scale: slot.scale,
                    }
                  : isShuffling
                    ? {
                        x: slotIndex === 0 ? "-95%" : slotIndex === 1 ? "5%" : "-50%",
                        y: "-40%",
                        scale: 0.9,
                        rotate: slotIndex === 0 ? -30 : slotIndex === 1 ? 30 : 0,
                      }
                    : {
                        x: slot.x,
                        y: slot.y,
                        rotate: slot.rotate,
                        scale: slot.scale,
                      }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.05 }
                  : { type: "spring", stiffness: 320, damping: 26 }
              }
              whileHover={{
                scale: slot.scale * 1.05,
                y: isCenter ? "-57%" : "-50%",
                zIndex: 10,
                transition: { type: "spring", stiffness: 400, damping: 22 },
              }}
              whileTap={{ scale: slot.scale * 0.97 }}
              onClick={() => {
                playAudioTone("click", soundEnabled);
                onSelectPersona?.(card.key);
              }}
              title={
                card.isFrontMascot ? "Maskot Guess Who Are You · SGE 2026" : `Kartu ${item.short}`
              }
            >
              <img
                src={card.isFrontMascot ? item.frontImage : item.image}
                alt={card.isFrontMascot ? "Maskot Guess Who Are You" : `Kartu ${item.short}`}
              />

              {card.isFrontMascot ? (
                <>
                  <div className="hologram-foil absolute inset-0 opacity-40 hover:opacity-75 transition-opacity" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#081113]/85 border border-[var(--SGECoralAqua)]/40 text-[9px] font-bold text-[var(--SGECoralAqua)] backdrop-blur-sm">
                    <Sparkles size={11} /> GUESS WHO
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-[#081113]/85 via-transparent to-transparent flex items-end p-3">
                  <span
                    className={`rounded-md border bg-[#081113]/85 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm ${card.badgeAccent}`}
                  >
                    {card.label}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Interactive Shuffle Trigger Button */}
        <motion.button
          type="button"
          className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0F1E21]/95 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--SGEPapayaWhip)] backdrop-blur-xl shadow-lg hover:border-[var(--SGEMustardGold)] hover:text-white transition-colors cursor-pointer"
          whileHover={{
            scale: 1.05,
            y: -2,
            transition: { type: "spring", stiffness: 400, damping: 22 },
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShuffle}
          disabled={isShuffling}
          title="Kocok tumpukan kartu"
        >
          <motion.span
            animate={isShuffling ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex"
          >
            <Shuffle size={13} className="text-[var(--SGECoralAqua)]" />
          </motion.span>
          <span>Kocok Kartu &nbsp;✦&nbsp; SGE 2026</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
