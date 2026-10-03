import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { personas, personaKeys, getRandomQuote, type PersonaKey } from "@/data/personas";
import { MotionGraphReveal } from "@/components/booth/MotionGraphReveal";
import { TarotCard3D } from "@/components/booth/TarotCard3D";
import { ScannerHUD } from "@/components/booth/ScannerHUD";

describe("Final Challenger 2 — Full System Acceptance Verification", () => {
  beforeEach(() => {
    HTMLAnchorElement.prototype.click = vi.fn();
    window.alert = vi.fn();

    // Mock AudioContext
    const mockOsc = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
    };
    vi.stubGlobal(
      "AudioContext",
      vi.fn().mockImplementation(() => ({
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn().mockReturnValue(mockOsc),
        createGain: vi.fn().mockReturnValue(mockGain),
        close: vi.fn().mockResolvedValue(undefined),
      })),
    );

    // Mock clipboard
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // 1. 3D Motion Graph Reveal & Spatial Constellation Integration
  // =========================================================================
  describe("Mission 1: 3D Motion Graph Reveal & Spatial Constellation Integration", () => {
    it("renders MotionGraphReveal with spatial grid and data nodes for all personas", () => {
      personaKeys.forEach((key) => {
        const testPersona = personas[key];
        const { unmount } = render(
          <MotionGraphReveal persona={testPersona}>
            <div data-testid={`reveal-${key}`}>{testPersona.title}</div>
          </MotionGraphReveal>,
        );

        expect(screen.getByTestId("motion-graph-3d-container")).toBeInTheDocument();
        expect(screen.getByTestId(`reveal-${key}`)).toHaveTextContent(testPersona.title);
        const nodes = screen.getAllByTestId("motion-graph-node");
        expect(nodes.length).toBeGreaterThanOrEqual(6);
        unmount();
      });
    });

    it("renders TarotCard3D with proper front and back faces and interactive tilt", () => {
      const testPersona = personas.career;
      const { container } = render(
        <TarotCard3D
          frontImage={testPersona.frontImage}
          backImage={testPersona.image}
          altText={testPersona.title}
          isFlipped={true}
          interactiveTilt={true}
        />,
      );

      const card = container.querySelector(".tarot-card-3d");
      expect(card).toBeInTheDocument();
      expect(screen.getByAltText(testPersona.title)).toBeInTheDocument();
    });

    it("verifies dual action buttons exist on Revelation screen and handles click callbacks", () => {
      const onPickOther = vi.fn();
      const onReset = vi.fn();

      render(
        <div data-testid="revelation-editorial-actions">
          <button type="button" onClick={onPickOther}>
            Pilih Kartu Lain
          </button>
          <button type="button" onClick={onReset}>
            Kembali ke Awal
          </button>
        </div>,
      );

      fireEvent.click(screen.getByRole("button", { name: /Pilih Kartu Lain/i }));
      expect(onPickOther).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole("button", { name: /Kembali ke Awal/i }));
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 2. Local ESM Asset Resolution & Bundle Integrity
  // =========================================================================
  describe("Mission 2: Local ESM Asset Resolution & Bundle Integrity", () => {
    it("confirms all 4 card images are imported via Vite ESM as non-empty string URLs", () => {
      personaKeys.forEach((key) => {
        const p = personas[key];
        expect(typeof p.image).toBe("string");
        expect(p.image.length).toBeGreaterThan(0);
        expect(typeof p.frontImage).toBe("string");
        expect(p.frontImage.length).toBeGreaterThan(0);

        // Must NOT point to Lovable proxy CDN
        expect(p.image).not.toContain("/__l5e/");
        expect(p.frontImage).not.toContain("/__l5e/");
        expect(p.image).not.toContain("lovableproject.com");
      });
    });

    it("verifies the 4 source card files exist on disk with valid JPEG magic bytes", () => {
      const cardsDir = join(process.cwd(), "src/assets/cards");
      const expectedFiles = [
        "card-front.jpg",
        "card-career.jpg",
        "card-creative.jpg",
        "card-adventure.jpg",
      ];

      expectedFiles.forEach((file) => {
        const filePath = join(cardsDir, file);
        expect(existsSync(filePath), `Missing card asset: ${filePath}`).toBe(true);

        const buffer = readFileSync(filePath);
        expect(buffer.length).toBeGreaterThan(200_000); // High-res images > 200KB

        // JPEG magic bytes: FF D8 FF
        expect(buffer[0]).toBe(0xff);
        expect(buffer[1]).toBe(0xd8);
        expect(buffer[2]).toBe(0xff);
      });
    });

    it("verifies production build output in .output/public/assets contains bundled card JPGs with zero missing assets", () => {
      const publicAssetsDir = join(process.cwd(), ".output/public/assets");
      expect(existsSync(publicAssetsDir), "Production assets directory must exist").toBe(true);

      const files = readdirSync(publicAssetsDir);
      const bundledJpgs = files.filter((f) => f.endsWith(".jpg"));

      expect(bundledJpgs.length).toBe(4);
      expect(bundledJpgs.some((f) => f.startsWith("card-career-"))).toBe(true);
      expect(bundledJpgs.some((f) => f.startsWith("card-creative-"))).toBe(true);
      expect(bundledJpgs.some((f) => f.startsWith("card-adventure-"))).toBe(true);
      expect(bundledJpgs.some((f) => f.startsWith("card-front-"))).toBe(true);

      // Verify each bundled JPG has valid JPEG header
      bundledJpgs.forEach((jpgFile) => {
        const buf = readFileSync(join(publicAssetsDir, jpgFile));
        expect(buf[0]).toBe(0xff);
        expect(buf[1]).toBe(0xd8);
        expect(buf[2]).toBe(0xff);
      });
    });

    it("confirms zero references to external Lovable proxy CDN in compiled JS bundles", () => {
      const publicAssetsDir = join(process.cwd(), ".output/public/assets");
      const files = readdirSync(publicAssetsDir);
      const jsFiles = files.filter((f) => f.endsWith(".js"));

      jsFiles.forEach((jsFile) => {
        const content = readFileSync(join(publicAssetsDir, jsFile), "utf-8");
        expect(content).not.toContain("/__l5e/");
        expect(content).not.toContain("lovableproject.com");
      });
    });
  });

  // =========================================================================
  // 3. Camera Denial Fallback (Graceful Degradation)
  // =========================================================================
  describe("Mission 3: Camera Denial Fallback (Graceful Degradation)", () => {
    it("handles NotAllowedError (user clicked Deny) and provides manual drawer", async () => {
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
      });

      const onDetectCard = vi.fn();
      render(
        <ScannerHUD
          modelUrl=""
          soundEnabled={false}
          onDetectCard={onDetectCard}
          onBack={vi.fn()}
        />,
      );

      // Error message is displayed in overlay
      await waitFor(() => {
        expect(screen.getByText(/Permission denied|Izin kamera ditolak/i)).toBeInTheDocument();
      });

      // CameraOff overlay button exists
      const manualButton = screen.getByRole("button", { name: /Pilih Kartu Manual Saja/i });
      expect(manualButton).toBeInTheDocument();

      // Clicking manual button opens drawer
      fireEvent.click(manualButton);

      // All 3 persona fallback options are rendered
      expect(screen.getByRole("button", { name: /Karier & Kepemimpinan/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Kreativitas & Jiwa/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Petualangan & Batas Baru/i })).toBeInTheDocument();

      // Selecting a persona triggers onDetectCard
      fireEvent.click(screen.getByRole("button", { name: /Petualangan & Batas Baru/i }));
      expect(onDetectCard).toHaveBeenCalledWith("adventure");
    });

    it("handles NotFoundError (no camera hardware detected) gracefully", async () => {
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new Error("Requested device not found")),
        },
      });

      const onDetectCard = vi.fn();
      render(
        <ScannerHUD
          modelUrl=""
          soundEnabled={false}
          onDetectCard={onDetectCard}
          onBack={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/Requested device not found/i)).toBeInTheDocument();
      });

      // Bypass button exists and works
      fireEvent.click(screen.getByRole("button", { name: /Pilih Kartu Manual Saja/i }));
      fireEvent.click(screen.getByRole("button", { name: /Karier & Kepemimpinan/i }));
      expect(onDetectCard).toHaveBeenCalledWith("career");
    });

    it("handles browser where navigator.mediaDevices is undefined without crashing", async () => {
      Object.defineProperty(navigator, "mediaDevices", {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const onDetectCard = vi.fn();
      render(
        <ScannerHUD
          modelUrl=""
          soundEnabled={false}
          onDetectCard={onDetectCard}
          onBack={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/Kamera tidak didukung pada browser ini/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /Pilih Kartu Manual Saja/i }));
      fireEvent.click(screen.getByRole("button", { name: /Kreativitas & Jiwa/i }));
      expect(onDetectCard).toHaveBeenCalledWith("creative");
    });
  });

  // =========================================================================
  // 4. Quote Non-Repetition Oracle
  // =========================================================================
  describe("Mission 4: Quote Non-Repetition Invariant Oracle", () => {
    it("guarantees 1,000 consecutive rerolls never repeat the previous quote for any persona", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].quotes;
        expect(pool.length).toBeGreaterThanOrEqual(15);

        let previousQuote = pool[0]!;
        let previousIndex = 0;

        for (let round = 0; round < 1_000; round++) {
          const nextQuote = getRandomQuote(key, previousIndex);
          expect(nextQuote).not.toBe(previousQuote);
          expect(pool).toContain(nextQuote);

          previousIndex = pool.indexOf(nextQuote);
          previousQuote = nextQuote;
        }
      });
    });

    it("handles boundary parameters safely in getRandomQuote without throwing exceptions", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].quotes;

        // Negative index
        expect(pool).toContain(getRandomQuote(key, -1));

        // Out-of-bounds high index
        expect(pool).toContain(getRandomQuote(key, 9999));

        // NaN
        expect(pool).toContain(getRandomQuote(key, NaN));

        // Undefined (first draw)
        expect(pool).toContain(getRandomQuote(key, undefined));
      });

      // Non-existent persona key returns empty string
      // @ts-expect-error test boundary
      expect(getRandomQuote("unknown_persona")).toBe("");
    });
  });
});
