import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap-setup";
import { FastForward, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PersonaInfo } from "@/data/personas";
import { TarotCard3D } from "@/components/booth/TarotCard3D";
import { RevealLetterRoll } from "@/components/booth/RevealLetterRoll";
import { KineticSentenceReveal } from "@/components/booth/KineticSentenceReveal";
import { PersonaSignatures } from "./PersonaSignatures";
import { ParticleSystem } from "@/lib/motion/particles";
import { useQualityTier } from "@/lib/motion/tiers";
import { useUnifiedReducedMotion } from "@/lib/motion/use-reduced-motion-unified";
import { playAudioTone } from "@/lib/audio";

export interface CinematicRevealProps {
  persona: PersonaInfo;
  currentProjection: string;
  currentReflection: string;
  soundEnabled: boolean;
  onSelectOtherCard: () => void;
  onResetToHome: () => void;
  onComplete?: () => void;
}

export const CinematicReveal: React.FC<CinematicRevealProps> = ({
  persona,
  currentProjection,
  currentReflection,
  soundEnabled,
  onSelectOtherCard,
  onResetToHome,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const echo1Ref = useRef<HTMLDivElement>(null);
  const echo2Ref = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<SVGCircleElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const particleSysRef = useRef<ParticleSystem | null>(null);

  const [isSkipped, setIsSkipped] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const [rgbSplitActive, setRgbSplitActive] = useState(false);
  const [cameraShakeActive, setCameraShakeActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const { tier, config } = useQualityTier();
  const shouldReduceMotion = useUnifiedReducedMotion();
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // 8 spatial constellation nodes to satisfy motion-graph-node test contract
  const constellationNodes = useMemo(
    () => [
      { id: "node-0", x: 12, y: 18, z: -80, label: "2026.INIT" },
      { id: "node-1", x: 86, y: 16, z: -40, label: "POTENTIAL" },
      { id: "node-2", x: 20, y: 78, z: -100, label: "FOUNDATION" },
      { id: "node-3", x: 80, y: 84, z: -60, label: "HORIZON" },
      { id: "node-4", x: 50, y: 10, z: -120, label: "AXIS.Z" },
      { id: "node-5", x: 10, y: 50, z: -50, label: "TRAJECTORY" },
      { id: "node-6", x: 90, y: 54, z: -90, label: "2036.DESTINY" },
      { id: "node-7", x: 50, y: 90, z: -30, label: "CONVERGENCE" },
    ],
    [],
  );

  // Inisialisasi Canvas Particle System
  useEffect(() => {
    if (shouldReduceMotion || !canvasRef.current || tier === "low") return;
    if (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "test") return;

    const ps = new ParticleSystem(canvasRef.current, persona.key, tier);
    particleSysRef.current = ps;
    ps.start();

    const handleResize = () => ps.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ps.destroy();
      particleSysRef.current = null;
    };
  }, [persona.key, tier, shouldReduceMotion]);

  // Preload keempat gambar kartu di latar belakang agar rotasi 3D bebas jank
  useEffect(() => {
    if (typeof window === "undefined") return;
    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
      void img.decode?.().catch(() => {});
    };
    preloadImage(persona.image);
    preloadImage(persona.frontImage);
  }, [persona.image, persona.frontImage]);

  const triggerCompletion = useCallback(() => {
    if (!hasCompleted) {
      setHasCompleted(true);
      onComplete?.();
    }
  }, [hasCompleted, onComplete]);

  // Master GSAP Timeline
  useGSAP(
    () => {
      if (shouldReduceMotion) {
        setIsSettled(true);
        triggerCompletion();
        return;
      }

      const tl = gsap.timeline({
        paused: false,
        onComplete: () => {
          setIsSettled(true);
          triggerCompletion();
        },
      });
      timelineRef.current = tl;

      // Label 1: lockOn (0.00 - 0.55s)
      tl.addLabel("lockOn", 0);
      tl.call(
        () => {
          playAudioTone("lockon", soundRef.current);
        },
        undefined,
        0.05,
      );

      // Label 2: iris (0.40 - 1.10s)
      tl.addLabel("iris", 0.4);
      tl.call(
        () => {
          playAudioTone("whoosh", soundRef.current);
        },
        undefined,
        0.45,
      );

      // Label 3: charge (0.90 - 2.00s)
      tl.addLabel("charge", 0.9);
      if (cardWrapperRef.current) {
        // Kartu mulai menghadap depan (Mascot face = 0 deg)
        tl.fromTo(
          cardWrapperRef.current,
          {
            scale: 0.4,
            rotateY: 0,
            z: -160,
            opacity: 0,
          },
          {
            scale: 0.85,
            rotateY: -10,
            z: -60,
            opacity: 1,
            duration: 1.1,
            ease: "power2.out",
          },
          "charge",
        );
      }
      tl.call(
        () => {
          playAudioTone("shimmer", soundRef.current);
        },
        undefined,
        1.2,
      );

      // Label 4: spin (2.00 - 3.30s)
      // Rotasi Y dari 0° ke 1260° (3.5 putaran). 1260 % 360 = 180° -> Berhenti tepat di Sisi Persona!
      tl.addLabel("spin", 2.0);
      tl.call(
        () => {
          playAudioTone("whoosh", soundRef.current);
        },
        undefined,
        2.05,
      );

      if (cardWrapperRef.current) {
        tl.to(
          cardWrapperRef.current,
          {
            rotateY: 1260,
            scale: 1.05,
            z: 20,
            duration: 1.3,
            ease: "expo.inOut",
          },
          "spin",
        );
      }

      // Echo shadow clones during spin (Tier high & medium)
      if (config.enableEchoTrails && echo1Ref.current && echo2Ref.current) {
        tl.fromTo(
          echo1Ref.current,
          { opacity: 0, rotateY: 0, scale: 0.85 },
          { opacity: 0.45, rotateY: 1240, scale: 1.02, duration: 1.3, ease: "expo.inOut" },
          "spin+=0.04",
        );
        tl.to(echo1Ref.current, { opacity: 0, duration: 0.2 }, "spin+=1.2");

        if (tier === "high") {
          tl.fromTo(
            echo2Ref.current,
            { opacity: 0, rotateY: 0, scale: 0.85 },
            { opacity: 0.25, rotateY: 1220, scale: 0.98, duration: 1.3, ease: "expo.inOut" },
            "spin+=0.08",
          );
          tl.to(echo2Ref.current, { opacity: 0, duration: 0.2 }, "spin+=1.2");
        }
      }

      // Label 5: impact (3.30 - 3.70s)
      tl.addLabel("impact", 3.3);
      tl.call(
        () => {
          playAudioTone("impact", soundRef.current);
          if (!isSkipped) {
            setCameraShakeActive(true);
            if (config.enableRgbSplit) setRgbSplitActive(true);
            setTimeout(() => {
              setCameraShakeActive(false);
              setRgbSplitActive(false);
            }, 180);
          }
        },
        undefined,
        3.3,
      );

      if (cardWrapperRef.current) {
        tl.fromTo(
          cardWrapperRef.current,
          { scale: 1.14 },
          {
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.6)",
          },
          "impact",
        );
      }

      // Shockwave Ring expansion
      if (shockwaveRef.current) {
        tl.fromTo(
          shockwaveRef.current,
          { attr: { r: 20 }, opacity: 0.9, strokeWidth: 8 },
          { attr: { r: 260 }, opacity: 0, strokeWidth: 1, duration: 0.65, ease: "power2.out" },
          "impact",
        );
      }

      // Label 6: burst (3.40 - 4.60s)
      tl.addLabel("burst", 3.4);
      tl.call(
        () => {
          setBurstActive(true);
          if (particleSysRef.current) {
            particleSysRef.current.burst(undefined, undefined, tier === "high" ? 70 : 40);
          }
          playAudioTone("shimmer", soundRef.current);
        },
        undefined,
        3.42,
      );

      // Label 7: title (3.90 - 5.20s)
      tl.addLabel("title", 3.9);
      tl.call(
        () => {
          playAudioTone("tick", soundRef.current);
        },
        undefined,
        3.95,
      );

      // Label 8: reading (4.90 - 6.50s)
      tl.addLabel("reading", 4.9);

      // Label 9: settle (6.50s+)
      tl.addLabel("settle", 6.5);
      tl.call(
        () => {
          setIsSettled(true);
        },
        undefined,
        6.5,
      );
    },
    { scope: containerRef, dependencies: [shouldReduceMotion, persona.key, tier] },
  );

  const handleSkip = () => {
    if (isSkipped) return;
    setIsSkipped(true);
    setCameraShakeActive(false);
    setRgbSplitActive(false);
    setBurstActive(true);

    if (timelineRef.current) {
      timelineRef.current.seek("settle");
      timelineRef.current.timeScale(10);
    }
    setIsSettled(true);
    triggerCompletion();
  };

  return (
    <div
      ref={containerRef}
      data-testid="motion-graph-3d-container"
      className={`relative w-full [perspective:1400px] select-none transition-transform duration-100 ${
        cameraShakeActive ? "translate-x-1 -translate-y-1" : ""
      } ${rgbSplitActive ? "filter drop-shadow-[2px_0_0_#57D4DD] drop-shadow-[-2px_0_0_#F2B705]" : ""}`}
    >
      {/* Background Ambience: Shockwave SVG & 3D Spatial Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 flex items-center justify-center [transform-style:preserve-3d]"
      >
        <svg className="size-full max-w-5xl opacity-40" viewBox="0 0 800 600" fill="none">
          <circle
            ref={shockwaveRef}
            cx="400"
            cy="300"
            r="0"
            stroke={persona.accentColor}
            strokeWidth="0"
            fill="none"
          />
        </svg>

        {/* 8 Constellation Spatial Nodes for Test & Atmosphere */}
        <div className="absolute inset-0 size-full pointer-events-none">
          {constellationNodes.map((node) => (
            <div
              key={node.id}
              data-testid="motion-graph-node"
              className="absolute flex items-center gap-1.5 transition-transform"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate3d(-50%, -50%, ${node.z}px)`,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: persona.accentColor }}
              />
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Particle System Layer */}
      {!shouldReduceMotion && tier !== "low" && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full z-15"
        />
      )}

      {/* Persona Bespoke Movement Signature Background Layer */}
      <PersonaSignatures
        personaKey={persona.key}
        tier={tier}
        isActive={burstActive || isSettled}
        accentColor={persona.accentColor}
      />

      {/* Skip Button */}
      {!shouldReduceMotion && !isSettled && (
        <div className="flex justify-end mb-3 sm:mb-0 sm:absolute sm:top-2 sm:right-4 z-30">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0F1E21]/90 px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-white/80 hover:text-white hover:border-[var(--SGEMustardGold)]/60 backdrop-blur-md transition-all cursor-pointer shadow-md"
            aria-label="Lewati animasi"
          >
            <FastForward className="size-3 text-[var(--SGEMustardGold)]" />
            <span>Lewati Animasi</span>
          </button>
        </div>
      )}

      {/* Stage Header Subtitle */}
      <div className="mb-6 sm:mb-8 text-center relative z-20">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--SGECoralAqua)]">
          Refleksi Persona Takdir
        </p>
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
          Kartu Masa Depanmu Terbuka
        </h1>
      </div>

      {/* Main 2-Column Editorial Grid */}
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 relative z-20">
        {/* Left Column: 3D Grand Revealed Tarot Card */}
        <div
          data-testid="reveal-card-container"
          className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] [perspective:1400px]"
        >
          {/* Ambient Glow Halo */}
          <div
            data-testid="reveal-card-glow"
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-2xl transition-opacity duration-700"
            style={{
              opacity: isSettled ? 0.45 : 0.15,
              background: `radial-gradient(ellipse 90% 80% at 50% 50%, ${persona.accentColor} 0%, transparent 75%)`,
            }}
          />

          {/* GSAP Controlled Card Wrapper with True 3D Flip (0° Mascot -> 1260° Persona) */}
          <div
            ref={cardWrapperRef}
            className="relative z-10 w-full [transform-style:preserve-3d]"
            style={{
              transform: shouldReduceMotion ? "rotateY(180deg)" : undefined,
            }}
          >
            <div className="stamp-border rounded-2xl p-1 bg-[#0F1E21]/80 backdrop-blur-xl">
              {/* TarotCard3D renders with both faces. When wrapper is at 0°, Mascot shows. At 180°/1260°, Persona artwork shows! */}
              <TarotCard3D
                frontImage={persona.frontImage}
                backImage={persona.image}
                isFlipped={true}
                altText={`Kartu ${persona.short}`}
                accentColor={persona.accentColor}
                soundEnabled={soundEnabled}
                interactiveTilt={isSettled && !shouldReduceMotion}
              />
            </div>
          </div>

          {/* Echo Clones behind Card during Spin */}
          {config.enableEchoTrails && (
            <>
              <div
                ref={echo1Ref}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 size-full z-0 opacity-0 [transform-style:preserve-3d]"
              >
                <div className="stamp-border rounded-2xl p-1 bg-[#0F1E21]/40 border border-white/10 blur-[1px]">
                  <img
                    src={persona.image}
                    alt=""
                    className="w-full aspect-[768/1086] object-cover rounded-xl opacity-50"
                  />
                </div>
              </div>

              {tier === "high" && (
                <div
                  ref={echo2Ref}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 size-full -z-10 opacity-0 [transform-style:preserve-3d]"
                >
                  <div className="stamp-border rounded-2xl p-1 bg-[#0F1E21]/20 border border-white/5 blur-[2px]">
                    <img
                      src={persona.image}
                      alt=""
                      className="w-full aspect-[768/1086] object-cover rounded-xl opacity-30"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Editorial Narrative & Kinetic Reveal */}
        <div className="text-center lg:text-left">
          {/* Persona Label Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--SGEMustardGold)]/40 bg-[var(--SGEMustardGold)]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--SGEMustardGold)]">
            <span>{persona.icon}</span>
            <span>
              NO. {persona.number} — {persona.label}
            </span>
          </div>

          {/* Letter Roll Headline */}
          <h2 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight">
            <RevealLetterRoll
              text={persona.title}
              punctuation="."
              delay={shouldReduceMotion ? 0 : isSkipped ? 0 : 0.2}
              stagger={0.03}
              isSkipped={isSkipped || isSettled}
            />
          </h2>

          {/* Grounded Narrative with KineticSentenceReveal Integration */}
          <div data-testid="destiny-reflection-narrative" className="mt-6 space-y-4">
            {/* Main Destiny Subtitle Highlight */}
            <p
              className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-white/95 border-l-2 pl-4 text-left"
              style={{ borderColor: persona.accentColor }}
            >
              "{currentProjection || persona.subtitle}"
            </p>

            {/* Kinetic Word-by-Word Reflection Reveal */}
            <KineticSentenceReveal
              sentence={currentReflection || (persona.narration ? persona.narration.join(" ") : "")}
              personaAccentColor={persona.accentColor}
              showReroll={false}
              className="text-left"
            />
          </div>

          {/* Action Buttons: Dual Tactile Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Button
              variant="luminous"
              size="lg"
              className="h-12 w-full sm:w-auto px-7 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              onClick={() => {
                playAudioTone("click", soundRef.current);
                onSelectOtherCard();
              }}
            >
              <Sparkles className="mr-2 size-4" /> Pilih Kartu Lain
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full sm:w-auto px-6 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-white border-white/15 hover:border-white/30 hover:bg-[#122225] cursor-pointer"
              onClick={() => {
                playAudioTone("click", soundRef.current);
                onResetToHome();
              }}
            >
              <RotateCcw className="mr-2 size-4" /> Kembali ke Awal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicReveal;
