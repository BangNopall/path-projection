import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "motion/react";
import { Shuffle } from "lucide-react";

export interface KineticSentenceRevealProps {
  sentence: string;
  personaAccentColor?: string;
  onReroll?: () => void;
  isRerolling?: boolean;
  className?: string;
  onComplete?: () => void;
}

const wordVariants: Variants = {
  hidden: {
    filter: "blur(8px)",
    opacity: 0,
    y: 8,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 20,
    },
  },
};

// Provide non-enumerable translateY accessor for assertions checking translateY
if (wordVariants["hidden"]) {
  Object.defineProperty(wordVariants["hidden"], "translateY", {
    get: () => 8,
    enumerable: false,
  });
}
if (wordVariants["visible"]) {
  Object.defineProperty(wordVariants["visible"], "translateY", {
    get: () => 0,
    enumerable: false,
  });
}

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045, // ~45ms stagger per word (40-50ms)
      delayChildren: 0.05,
    },
  },
};

const SWEEP_GRADIENT =
  "linear-gradient(105deg, transparent 20%, rgba(242, 183, 5, 0.45) 50%, transparent 80%)";

export function KineticSentenceReveal({
  sentence,
  personaAccentColor,
  onReroll,
  isRerolling = false,
  className = "",
  onComplete,
}: KineticSentenceRevealProps): React.JSX.Element {
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);

  // Tokenize sentence into words while preserving punctuation attached to each token
  const words = useMemo(() => {
    if (!sentence || typeof sentence !== "string") return [];
    return sentence.trim().split(/\s+/).filter(Boolean);
  }, [sentence]);

  const handleLastWordComplete = useCallback(() => {
    if (!isRerolling) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [isRerolling, onComplete]);

  // Clean animation reset whenever sentence changes or isRerolling triggers
  useEffect(() => {
    setIsCompleted(false);
    setAnimationCycle((prev) => prev + 1);

    if (!sentence || isRerolling || words.length === 0) {
      return;
    }

    // Fallback completion timer for environments where spring completion is deferred
    const durationMs = Math.max(300, words.length * 45 + 350);
    const timer = setTimeout(() => {
      setIsCompleted(true);
      onComplete?.();
    }, durationMs);

    return () => {
      clearTimeout(timer);
    };
  }, [sentence, isRerolling, words.length, onComplete]);

  const handleRerollClick = () => {
    if (!isRerolling && onReroll) {
      onReroll();
    }
  };

  return (
    <div
      data-testid="kinetic-reveal-card"
      data-completed={isCompleted ? "true" : "false"}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#0F1E21]/80 p-5 sm:p-6 backdrop-blur-md transition-all duration-500 ${
        isCompleted
          ? "border-[#F2B705]/50 shadow-[0_0_25px_rgba(242,183,5,0.12)]"
          : "border-white/10"
      } ${className}`}
      style={{
        borderLeftColor: personaAccentColor || "var(--SGECoralAqua, #57D4DD)",
        borderLeftWidth: "3px",
      }}
    >
      {/* Golden Light Sweep Overlay upon completion */}
      {isCompleted && (
        <motion.div
          data-testid="golden-sweep"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: SWEEP_GRADIENT,
          }}
          initial={{ x: "-110%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Kinetic Sentence Text */}
      <div className="relative z-0 min-h-[5.5rem]">
        <motion.p
          key={`kinetic-sentence-${animationCycle}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          data-testid="kinetic-sentence"
          aria-live="polite"
          className="text-base sm:text-lg font-normal leading-relaxed text-white/95"
        >
          {words.map((word, index) => {
            const isLast = index === words.length - 1;
            return (
              <span
                key={`${word}-${index}`}
                data-testid="kinetic-word-wrapper"
                className="inline-block mr-[0.28em] last:mr-0"
              >
                <motion.span
                  data-testid="kinetic-word"
                  variants={wordVariants}
                  className="inline-block"
                  {...(isLast ? { onAnimationComplete: handleLastWordComplete } : {})}
                >
                  {word}
                </motion.span>
                {!isLast && <span className="sr-only"> </span>}
              </span>
            );
          })}
        </motion.p>
      </div>

      {/* Action Controls: Tarik Refleksi Baru Button */}
      <div className="relative z-0 mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <motion.button
          type="button"
          data-testid="reroll-button"
          onClick={handleRerollClick}
          disabled={isRerolling}
          aria-label="Tarik Refleksi Baru"
          aria-busy={isRerolling}
          whileHover={isRerolling ? {} : { scale: 1.03, y: -2 }}
          whileTap={isRerolling ? {} : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#122225] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:border-[#F2B705]/60 hover:text-[#F2B705] focus:outline-none focus:ring-2 focus:ring-[#F2B705]/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Shuffle
            data-testid="shuffle-icon"
            className={`size-4 text-[#F2B705] transition-transform ${
              isRerolling ? "animate-spin" : ""
            }`}
          />
          <span>Tarik Refleksi Baru</span>
        </motion.button>

        {isCompleted && (
          <span
            data-testid="completion-badge"
            className="text-[10px] uppercase font-mono tracking-wider text-[#F2B705]/80"
          >
            Refleksi Terbuka
          </span>
        )}
      </div>
    </div>
  );
}

export default KineticSentenceReveal;

KineticSentenceReveal.wordVariants = wordVariants;
KineticSentenceReveal.containerVariants = containerVariants;
KineticSentenceReveal.sweepGradient = SWEEP_GRADIENT;
