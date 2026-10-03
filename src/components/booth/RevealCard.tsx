import React, { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { TarotCard3D } from "./TarotCard3D";

export interface RevealCardProps {
  frontImage: string;
  backImage: string;
  altText: string;
  accentColor?: string;
  soundEnabled?: boolean;
  interactiveTilt?: boolean;
  delay?: number;
  duration?: number;
  isSkipped?: boolean;
  className?: string;
}

export const RevealCard: React.FC<RevealCardProps> = ({
  frontImage,
  backImage,
  altText,
  accentColor = "var(--SGECoralAqua, #57D4DD)",
  soundEnabled = true,
  interactiveTilt = true,
  delay = 0.2,
  duration = 0.7,
  isSkipped = false,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Derive soft glow RGBA from accent color or hex fallback
  const glowStyle = useMemo(() => {
    return {
      background: `radial-gradient(ellipse 90% 80% at 50% 50%, ${accentColor} 0%, transparent 75%)`,
    };
  }, [accentColor]);

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.88,
      rotateY: shouldReduceMotion ? 0 : -20,
      y: shouldReduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      y: 0,
      transition:
        isSkipped || shouldReduceMotion
          ? { duration: shouldReduceMotion ? 0.2 : 0 }
          : {
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay,
              duration,
            },
    },
  };

  const glowVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.9,
    },
    visible: {
      opacity: 0.42,
      scale: shouldReduceMotion ? 1 : 1.04,
      transition:
        isSkipped || shouldReduceMotion
          ? { duration: shouldReduceMotion ? 0.2 : 0 }
          : {
              duration: 0.65,
              delay: delay + 0.45,
              ease: "easeOut",
            },
    },
  };

  return (
    <div
      data-testid="reveal-card-container"
      className={`relative mx-auto w-full max-w-[320px] sm:max-w-[360px] [perspective:1200px] ${className}`}
    >
      {/* Soft Ambient Glow Halo behind the card */}
      <motion.div
        data-testid="reveal-card-glow"
        aria-hidden="true"
        variants={glowVariants}
        initial={isSkipped ? "visible" : "hidden"}
        animate="visible"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-2xl transition-transform"
        style={glowStyle}
      />

      {/* 3D Entering Card Container */}
      <motion.div
        variants={cardVariants}
        initial={isSkipped ? "visible" : "hidden"}
        animate="visible"
        className="relative z-10 w-full"
      >
        <div className="stamp-border rounded-2xl p-1 bg-[#0F1E21]/80 backdrop-blur-xl">
          <TarotCard3D
            frontImage={frontImage}
            backImage={backImage}
            isFlipped={true}
            altText={altText}
            accentColor={accentColor}
            soundEnabled={soundEnabled}
            interactiveTilt={shouldReduceMotion ? false : interactiveTilt}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default RevealCard;
