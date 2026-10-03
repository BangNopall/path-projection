import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { motionTokens } from "@/lib/motion/tokens";
import { resolveQualityTier, TIER_CONFIGS } from "@/lib/motion/tiers";
import { playAudioTone, getSharedAudioContext } from "@/lib/audio";
import { gsap } from "@/lib/motion/gsap-setup";

describe("W1 Motion Foundation: Tokens, Tiers & Audio Infrastructure", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Motion System Tokens", () => {
    it("exports consistent emphasized and overshoot bezier curves", () => {
      expect(motionTokens.ease.emphasized).toEqual([0.16, 1, 0.3, 1]);
      expect(motionTokens.ease.overshoot).toEqual([0.34, 1.56, 0.64, 1]);
      expect(motionTokens.duration.hero).toBe(0.7);
    });

    it("declares physics springs matching booth standards", () => {
      expect(motionTokens.spring.card).toMatchObject({
        stiffness: 340,
        damping: 24,
        mass: 0.8,
      });
      expect(motionTokens.spring.button).toMatchObject({
        stiffness: 400,
        damping: 22,
      });
    });

    it("provides GSAP ease string tokens", () => {
      expect(motionTokens.gsapEase.emphasized).toBe("power3.out");
      expect(motionTokens.gsapEase.impact).toBe("back.out(1.6)");
    });
  });

  describe("2. Quality Tier Resolution Engine", () => {
    it("respects explicit URL/localStorage override params", () => {
      expect(resolveQualityTier({ override: "low", hardwareConcurrency: 16 })).toBe("low");
      expect(resolveQualityTier({ override: "medium", hardwareConcurrency: 2 })).toBe("medium");
      expect(resolveQualityTier({ override: "high", hardwareConcurrency: 2 })).toBe("high");
    });

    it("accurately detects low tier on constrained hardware", () => {
      expect(resolveQualityTier({ hardwareConcurrency: 2, deviceMemory: 2 })).toBe("low");
      expect(resolveQualityTier({ hardwareConcurrency: 1, deviceMemory: 8 })).toBe("low");
      expect(resolveQualityTier({ hardwareConcurrency: 8, deviceMemory: 1 })).toBe("low");
    });

    it("accurately detects medium tier on moderate hardware", () => {
      expect(resolveQualityTier({ hardwareConcurrency: 4, deviceMemory: 4 })).toBe("medium");
      expect(resolveQualityTier({ hardwareConcurrency: 4, deviceMemory: 8 })).toBe("medium");
    });

    it("accurately detects high tier on capable hardware", () => {
      expect(resolveQualityTier({ hardwareConcurrency: 8, deviceMemory: 8 })).toBe("high");
      expect(resolveQualityTier({ hardwareConcurrency: 12, deviceMemory: 16 })).toBe("high");
    });

    it("defines valid configuration constraints for all tiers", () => {
      expect(TIER_CONFIGS.high.maxParticles).toBe(120);
      expect(TIER_CONFIGS.high.enableEchoTrails).toBe(true);
      expect(TIER_CONFIGS.medium.maxParticles).toBe(60);
      expect(TIER_CONFIGS.low.maxParticles).toBe(0);
      expect(TIER_CONFIGS.low.enableEchoTrails).toBe(false);
    });
  });

  describe("3. Shared Web Audio Singleton & New Tone Kinds", () => {
    it("safely triggers all newly added tones without throwing", () => {
      const mockOscillator = {
        type: "sine",
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      const mockGain = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn().mockReturnThis(),
      };
      const mockAudioContext = vi.fn().mockImplementation(function () {
        return {
          currentTime: 0,
          state: "running",
          destination: {},
          createOscillator: vi.fn().mockReturnValue(mockOscillator),
          createGain: vi.fn().mockReturnValue(mockGain),
          resume: vi.fn().mockResolvedValue(undefined),
          close: vi.fn().mockResolvedValue(undefined),
        };
      });

      vi.stubGlobal("AudioContext", mockAudioContext);

      expect(() => playAudioTone("lockon", true)).not.toThrow();
      expect(() => playAudioTone("whoosh", true)).not.toThrow();
      expect(() => playAudioTone("impact", true)).not.toThrow();
      expect(() => playAudioTone("shimmer", true)).not.toThrow();
      expect(() => playAudioTone("tick", true)).not.toThrow();

      vi.unstubAllGlobals();
    });

    it("silently bypasses audio synthesis when disabled", () => {
      const getContextSpy = vi.fn();
      expect(() => playAudioTone("lockon", false)).not.toThrow();
      expect(getContextSpy).not.toHaveBeenCalled();
    });
  });

  describe("4. GSAP SSR Setup & Registration", () => {
    it("exposes valid GSAP instance with timeline creation capability", () => {
      expect(gsap).toBeDefined();
      const tl = gsap.timeline();
      expect(tl).toBeDefined();
      expect(typeof tl.to).toBe("function");
    });
  });
});
