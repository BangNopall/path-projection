import React, { useMemo } from "react";
import { motion, type Variants } from "motion/react";

export interface RevealLetterRollProps {
  text: string;
  punctuation?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  isSkipped?: boolean;
  className?: string;
  punctuationClassName?: string;
}

export const RevealLetterRoll: React.FC<RevealLetterRollProps> = ({
  text,
  punctuation = ".",
  delay = 0.85,
  stagger = 0.03,
  duration = 0.4,
  isSkipped = false,
  className = "",
  punctuationClassName = "text-[var(--SGECoralAqua)]",
}) => {
  // Tokenize into words and characters to prevent word breaks mid-word on line wraps
  const words = useMemo(() => {
    return text.split(" ").map((word) => word.split(""));
  }, [text]);

  const letterVariants: Variants = {
    hidden: {
      y: "115%",
      rotateX: 40,
      opacity: 0,
    },
    visible: (customIndex: number) => ({
      y: "0%",
      rotateX: 0,
      opacity: 1,
      transition: isSkipped
        ? { duration: 0 }
        : {
            duration,
            delay: delay + customIndex * stagger,
            ease: [0.22, 1, 0.36, 1],
          },
    }),
  };

  let globalCharIndex = 0;

  return (
    <span
      data-testid="reveal-letter-roll"
      className={`relative inline-block ${className}`}
      aria-label={`${text}${punctuation}`}
    >
      {/* Screen Reader accessible full text */}
      <span className="sr-only">{`${text}${punctuation}`}</span>

      {/* Visual Animated Characters masked inside overflow-hidden containers */}
      <span aria-hidden="true" className="inline [perspective:600px]">
        {words.map((chars, wordIdx) => (
          <span
            key={`word-${wordIdx}`}
            className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0"
          >
            {chars.map((char, charIdx) => {
              const currentIndex = globalCharIndex++;
              return (
                <span
                  key={`char-${wordIdx}-${charIdx}`}
                  className="inline-block overflow-hidden align-top leading-tight"
                >
                  <motion.span
                    custom={currentIndex}
                    variants={letterVariants}
                    initial={isSkipped ? "visible" : "hidden"}
                    animate="visible"
                    className="inline-block will-change-transform"
                    style={{ transformOrigin: "50% 100%" }}
                  >
                    {char}
                  </motion.span>
                </span>
              );
            })}
          </span>
        ))}

        {punctuation && (
          <span className="inline-block overflow-hidden align-top leading-tight">
            <motion.span
              custom={globalCharIndex++}
              variants={letterVariants}
              initial={isSkipped ? "visible" : "hidden"}
              animate="visible"
              className={`inline-block will-change-transform ${punctuationClassName}`}
              style={{ transformOrigin: "50% 100%" }}
            >
              {punctuation}
            </motion.span>
          </span>
        )}
      </span>
    </span>
  );
};

export default RevealLetterRoll;
