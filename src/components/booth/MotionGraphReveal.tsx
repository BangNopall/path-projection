import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import type { PersonaInfo } from "@/data/personas";

export interface MotionGraphRevealProps {
  persona: PersonaInfo;
  onComplete?: () => void;
  children?: React.ReactNode;
  isSkipped?: boolean;
  className?: string;
}

export const MotionGraphReveal: React.FC<MotionGraphRevealProps> = ({
  persona,
  onComplete,
  children,
  isSkipped = false,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);

  // Generate 8 3D spatial constellation data nodes
  const nodes = [
    { id: "node-0", x: 15, y: 20, z: -80, label: "2026.INIT" },
    { id: "node-1", x: 82, y: 18, z: -40, label: "POTENTIAL" },
    { id: "node-2", x: 25, y: 75, z: -100, label: "FOUNDATION" },
    { id: "node-3", x: 78, y: 82, z: -60, label: "HORIZON" },
    { id: "node-4", x: 50, y: 12, z: -120, label: "AXIS.Z" },
    { id: "node-5", x: 10, y: 48, z: -50, label: "TRAJECTORY" },
    { id: "node-6", x: 90, y: 52, z: -90, label: "2036.DESTINY" },
    { id: "node-7", x: 50, y: 88, z: -30, label: "CONVERGENCE" },
  ];

  useEffect(() => {
    if (isSkipped || shouldReduceMotion) {
      if (onComplete) onComplete();
      return;
    }

    let called = false;
    const triggerComplete = () => {
      if (!called) {
        called = true;
        if (onComplete) onComplete();
      }
    };

    const completionTimer = setTimeout(triggerComplete, 1000);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: triggerComplete,
      });

      // 1. Grid lines expansion
      if (gridRef.current) {
        tl.fromTo(
          gridRef.current,
          { opacity: 0, scale: 0.85, rotateX: 25 },
          { opacity: 0.6, scale: 1, rotateX: 0, duration: 0.6, ease: "power2.out" },
          0,
        );
      }

      // 2. Data nodes converge towards center
      if (nodesRef.current) {
        const nodeEls = nodesRef.current.querySelectorAll("[data-testid='motion-graph-node']");
        tl.fromTo(
          nodeEls,
          { opacity: 0, scale: 0.4 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.04,
            ease: "back.out(1.7)",
          },
          0.1,
        );

        // Soft pulse and settle
        tl.to(
          nodeEls,
          {
            opacity: 0.35,
            duration: 0.5,
            ease: "power1.inOut",
          },
          0.7,
        );
      }
    }, containerRef);

    return () => {
      clearTimeout(completionTimer);
      ctx.revert();
    };
  }, [isSkipped, shouldReduceMotion, onComplete]);

  return (
    <div
      ref={containerRef}
      data-testid="motion-graph-3d-container"
      className={`relative w-full [perspective:1200px] overflow-hidden ${className}`}
    >
      {/* 3D Spatial Coordinate Grid Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center [transform-style:preserve-3d]"
      >
        <svg
          ref={gridRef}
          className="size-full max-w-4xl opacity-40 transition-opacity"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="meshGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={persona.accentColor} stopOpacity="0.35" />
              <stop offset="60%" stopColor={persona.accentColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Radial Spatial Field */}
          <circle cx="400" cy="300" r="260" fill="url(#meshGradient)" />

          {/* Coordinate Axes */}
          <line
            x1="100"
            y1="300"
            x2="700"
            y2="300"
            stroke={persona.accentColor}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          <line
            x1="400"
            y1="80"
            x2="400"
            y2="520"
            stroke={persona.accentColor}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* Perspective Coordinate Rings */}
          <ellipse
            cx="400"
            cy="300"
            rx="340"
            ry="170"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <ellipse
            cx="400"
            cy="300"
            rx="220"
            ry="110"
            stroke={persona.accentColor}
            strokeWidth="1"
            opacity="0.3"
          />
          <ellipse
            cx="400"
            cy="300"
            rx="100"
            ry="50"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* Geometric Vectors */}
          <line
            x1="120"
            y1="120"
            x2="400"
            y2="300"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          <line
            x1="680"
            y1="120"
            x2="400"
            y2="300"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          <line
            x1="120"
            y1="480"
            x2="400"
            y2="300"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          <line
            x1="680"
            y1="480"
            x2="400"
            y2="300"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        </svg>

        {/* 3D Coordinate Constellation Nodes */}
        <div ref={nodesRef} className="absolute inset-0 size-full pointer-events-none">
          {nodes.map((node) => (
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
                className="size-2 rounded-full animate-ping"
                style={{ backgroundColor: persona.accentColor, animationDuration: "3s" }}
              />
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: persona.accentColor }}
              />
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Layer */}
      <motion.div
        initial={
          shouldReduceMotion || isSkipped
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.94, z: -60 }
        }
        animate={{ opacity: 1, scale: 1, z: 0 }}
        transition={
          shouldReduceMotion || isSkipped
            ? { duration: 0.15 }
            : { duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }
        }
        className="relative z-10 w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MotionGraphReveal;
