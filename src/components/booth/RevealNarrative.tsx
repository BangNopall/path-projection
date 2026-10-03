import React from "react";
import { motion, type Variants } from "motion/react";
import { Sparkles, Heart } from "lucide-react";
import type { PersonaInfo } from "@/data/personas";

export interface RevealNarrativeProps {
  persona: PersonaInfo;
  delay?: number;
  isSkipped?: boolean;
  className?: string;
}

export const RevealNarrative: React.FC<RevealNarrativeProps> = ({
  persona,
  delay = 1.4,
  isSkipped = false,
  className = "",
}) => {
  const lineVariants: Variants = {
    hidden: {
      y: "100%",
      opacity: 0,
    },
    visible: (customIndex: number) => ({
      y: "0%",
      opacity: 1,
      transition: isSkipped
        ? { duration: 0 }
        : {
            duration: 0.5,
            delay: delay + customIndex * 0.08,
            ease: [0.16, 1, 0.3, 1],
          },
    }),
  };

  const momentVariants: Variants = {
    hidden: {
      x: -18,
      opacity: 0,
    },
    visible: (customIndex: number) => ({
      x: 0,
      opacity: 1,
      transition: isSkipped
        ? { duration: 0 }
        : {
            duration: 0.45,
            delay: delay + 0.55 + customIndex * 0.14,
            ease: [0.22, 1, 0.36, 1],
          },
    }),
  };

  const closingVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.98,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: isSkipped
        ? { duration: 0 }
        : {
            duration: 0.55,
            delay: delay + 1.1,
            ease: "easeOut",
          },
    },
  };

  return (
    <div data-testid="reveal-narrative-section" className={`space-y-5 text-left ${className}`}>
      {/* 1. Tagline Satu Kalimat Menyentuh Perasaan */}
      {persona.subtitle && (
        <div className="overflow-hidden">
          <motion.p
            custom={0}
            variants={lineVariants}
            initial={isSkipped ? "visible" : "hidden"}
            animate="visible"
            className="font-serif italic text-base sm:text-lg text-[var(--SGEPapayaWhip)]/90 leading-relaxed border-l-2 pl-3.5"
            style={{ borderColor: persona.accentColor }}
          >
            "{persona.subtitle}"
          </motion.p>
        </div>
      )}

      {/* 2. Narasi 2-3 Kalimat: Siapa kamu saat kuliah dimulai */}
      {persona.narration && persona.narration.length > 0 && (
        <div className="space-y-1.5 text-sm sm:text-base text-white/80 leading-relaxed">
          {persona.narration.map((sentence, idx) => (
            <div key={`narrative-${idx}`} className="overflow-hidden">
              <motion.p
                custom={idx + 1}
                variants={lineVariants}
                initial={isSkipped ? "visible" : "hidden"}
                animate="visible"
              >
                {sentence}
              </motion.p>
            </div>
          ))}
        </div>
      )}

      {/* 3. Momen yang Mungkin Kamu Rasakan (3 Butir Masuk Satu per Satu) */}
      {persona.feelings && persona.feelings.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#0F1E21]/60 p-4 backdrop-blur-sm">
          <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">
            <Heart className="size-3.5" style={{ color: persona.accentColor }} />
            <span>Momen yang Mungkin Kamu Rasakan</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-white/85">
            {persona.feelings.map((feeling, idx) => (
              <motion.li
                key={`moment-${idx}`}
                custom={idx}
                variants={momentVariants}
                initial={isSkipped ? "visible" : "hidden"}
                animate="visible"
                className="flex items-start gap-2.5"
              >
                <span
                  className="mt-1 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: persona.accentColor }}
                />
                <span>{feeling}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Pesan Penutup Hangat Sebagai Bekal Memulai Kuliah */}
      {persona.closingMessage && (
        <motion.div
          variants={closingVariants}
          initial={isSkipped ? "visible" : "hidden"}
          animate="visible"
          className="relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-[#122225] to-[#0F1E21] p-4 text-xs sm:text-sm font-medium text-white/90 shadow-sm"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 size-4 shrink-0" style={{ color: persona.accentColor }} />
            <p className="leading-snug">{persona.closingMessage}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RevealNarrative;
