import React, { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { playAudioTone } from "@/lib/audio";

interface TarotCard3DProps {
  frontImage: string;
  backImage: string;
  isFlipped?: boolean;
  altText: string;
  soundEnabled?: boolean;
  accentColor?: string;
  className?: string;
  badge?: string;
  onClick?: () => void;
  interactiveTilt?: boolean;
}

export const TarotCard3D: React.FC<TarotCard3DProps> = ({
  frontImage,
  backImage,
  isFlipped = false,
  altText,
  soundEnabled = true,
  accentColor = "var(--SGECoralAqua)",
  className = "",
  badge,
  onClick,
  interactiveTilt = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const effectiveTilt = shouldReduceMotion ? false : interactiveTilt;
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const calculateTilt = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalizing tilt between -12 and 12 degrees
    const rotX = Math.max(-12, Math.min(12, ((y - centerY) / centerY) * -12));
    const rotY = Math.max(-12, Math.min(12, ((x - centerX) / centerX) * 12));

    setRotateX(rotX);
    setRotateY(rotY);
    setSheenPos({
      x: Math.max(0, Math.min(100, Math.round((x / rect.width) * 100))),
      y: Math.max(0, Math.min(100, Math.round((y / rect.height) * 100))),
    });
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!effectiveTilt) return;
      calculateTilt(e.clientX, e.clientY);
    },
    [effectiveTilt, calculateTilt],
  );

  const handlePointerEnter = () => {
    setIsHovered(true);
    playAudioTone("hover", soundEnabled);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsActive(false);
    setRotateX(0);
    setRotateY(0);
    setSheenPos({ x: 50, y: 50 });
  };

  const handlePointerDown = () => {
    setIsActive(true);
  };

  const handlePointerUp = () => {
    setIsActive(false);
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!effectiveTilt || e.touches.length === 0) return;
      const touch = e.touches[0];
      if (touch) {
        calculateTilt(touch.clientX, touch.clientY);
      }
    },
    [effectiveTilt, calculateTilt],
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsHovered(true);
    setIsActive(true);
    if (effectiveTilt && e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        calculateTilt(touch.clientX, touch.clientY);
      }
    }
    playAudioTone("hover", soundEnabled);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    setIsActive(false);
    setRotateX(0);
    setRotateY(0);
    setSheenPos({ x: 50, y: 50 });
  };

  return (
    <div
      className={`perspective-container relative select-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <motion.div
        ref={cardRef}
        className="tarot-card-3d stamp-border relative w-full aspect-[768/1086] rounded-2xl cursor-pointer"
        animate={{
          rotateX: shouldReduceMotion ? 0 : isHovered ? rotateX : 0,
          rotateY:
            (isFlipped ? 180 : 0) +
            (shouldReduceMotion ? 0 : isHovered ? (isFlipped ? -rotateY : rotateY) : 0),
          scale: shouldReduceMotion ? 1 : isActive ? 0.98 : isHovered ? 1.025 : 1,
          y: shouldReduceMotion ? 0 : isHovered ? -5 : 0,
        }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.2 }
            : {
                type: "spring",
                stiffness: 340,
                damping: 24,
                mass: 0.8,
              }
        }
        style={{
          boxShadow: isHovered
            ? "0 20px 50px rgba(0, 0, 0, 0.65), 0 0 24px rgba(87, 212, 221, 0.2)"
            : "0 12px 30px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* FRONT SIDE (Face Down Mascot) */}
        <div
          className="absolute inset-0 size-full rounded-2xl overflow-hidden border p-1 bg-[#0F1E21]"
          style={{
            borderColor: isHovered ? accentColor : "rgba(255, 255, 255, 0.12)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Perforated Postage-Stamp Inset Frame */}
          <div
            className="pointer-events-none absolute inset-2 rounded-xl border border-dashed z-20 transition-colors duration-300"
            style={{
              borderColor: isHovered ? accentColor : "rgba(255, 255, 255, 0.2)",
            }}
          />

          {/* Corner stamp registration ticks */}
          <div className="pointer-events-none absolute top-1.5 left-1.5 size-2 border-t border-l border-white/30 z-20" />
          <div className="pointer-events-none absolute top-1.5 right-1.5 size-2 border-t border-r border-white/30 z-20" />
          <div className="pointer-events-none absolute bottom-1.5 left-1.5 size-2 border-b border-l border-white/30 z-20" />
          <div className="pointer-events-none absolute bottom-1.5 right-1.5 size-2 border-b border-r border-white/30 z-20" />

          <img
            src={frontImage}
            alt="Mascot Guess Who Are You"
            className="w-full h-full object-cover rounded-xl"
            loading="eager"
          />

          {/* Specular Highlight Sheen tracking pointer */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 z-10"
            style={{
              opacity: isHovered ? 0.75 : 0.15,
              background: `radial-gradient(circle 280px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 239, 211, 0.16) 35%, rgba(87, 212, 221, 0.08) 60%, transparent 80%)`,
            }}
          />
          {/* Refractive angle sheen */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 z-10"
            style={{
              opacity: isHovered ? 0.45 : 0,
              background: `linear-gradient(${115 + (rotateX * 2.5 + rotateY * 2.5)}deg, transparent 35%, rgba(242, 183, 5, 0.14) 48%, rgba(255, 239, 211, 0.22) 52%, transparent 65%)`,
            }}
          />

          {badge && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-background/90 border border-border/80 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-foreground z-30">
              {badge}
            </div>
          )}
        </div>

        {/* BACK SIDE (Persona Revealed Artwork) */}
        <div
          className="absolute inset-0 size-full rounded-2xl overflow-hidden border p-1 bg-[#0F1E21]"
          style={{
            borderColor: accentColor,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Perforated Postage-Stamp Inset Frame */}
          <div
            className="pointer-events-none absolute inset-2 rounded-xl border border-dashed z-20 transition-colors duration-300"
            style={{
              borderColor: accentColor,
            }}
          />

          {/* Corner stamp registration ticks */}
          <div className="pointer-events-none absolute top-1.5 left-1.5 size-2 border-t border-l border-white/30 z-20" />
          <div className="pointer-events-none absolute top-1.5 right-1.5 size-2 border-t border-r border-white/30 z-20" />
          <div className="pointer-events-none absolute bottom-1.5 left-1.5 size-2 border-b border-l border-white/30 z-20" />
          <div className="pointer-events-none absolute bottom-1.5 right-1.5 size-2 border-b border-r border-white/30 z-20" />

          <img
            src={backImage}
            alt={altText}
            className="w-full h-full object-cover rounded-xl"
            loading="eager"
          />

          {/* Specular Highlight Sheen tracking pointer */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 z-10"
            style={{
              opacity: isHovered ? 0.8 : 0.18,
              background: `radial-gradient(circle 280px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.3) 0%, rgba(242, 183, 5, 0.2) 35%, rgba(87, 212, 221, 0.1) 60%, transparent 80%)`,
            }}
          />
          {/* Refractive angle sheen */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 z-10"
            style={{
              opacity: isHovered ? 0.5 : 0,
              background: `linear-gradient(${115 + (rotateX * 2.5 + rotateY * 2.5)}deg, transparent 35%, rgba(242, 183, 5, 0.18) 48%, rgba(255, 239, 211, 0.25) 52%, transparent 65%)`,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};
