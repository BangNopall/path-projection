import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { personas, personaKeys, getRandomQuote, type PersonaKey } from "@/data/personas";
import { KeepsakePhotoCard } from "@/components/booth/KeepsakePhotoCard";
import { ScannerHUD } from "@/components/booth/ScannerHUD";
import * as htmlToImage from "html-to-image";

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
  // 1. Keepsake Photo Studio Canvas Export (html-to-image)
  // =========================================================================
  describe("Mission 1: Keepsake Photo Studio Canvas Export (html-to-image)", () => {
    it("calls html-to-image toPng with pixelRatio 2.5, cacheBust, and triggers download with sanitized filename", async () => {
      const toPngSpy = vi
        .spyOn(htmlToImage, "toPng")
        .mockResolvedValue("data:image/png;base64,mockPngContent");
      const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

      const testPersona = personas.career;
      const testQuote = testPersona.quotes[0]!;

      render(
        <KeepsakePhotoCard
          persona={testPersona}
          quote={testQuote}
          soundEnabled={false}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      // Verify Polaroid frame rendered with correct persona content
      expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testQuote.slice(0, 40), "i"))).toBeInTheDocument();
      expect(screen.getByText("Your Future Self")).toBeInTheDocument();

      // Enter a complex name with spaces and special characters
      const nameInput = screen.getByLabelText(/Nama Kamu/i);
      fireEvent.change(nameInput, { target: { value: "Budi Santoso & SGE 2026!" } });

      // Verify immediate reflection on Polaroid
      expect(screen.getByText("Budi Santoso & SGE 2026!")).toBeInTheDocument();

      // Trigger Download
      const downloadBtn = screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(toPngSpy).toHaveBeenCalledTimes(1);
      });

      // Verify toPng arguments: target element, pixelRatio 2.5, cacheBust
      const [targetElement, options] = toPngSpy.mock.calls[0]!;
      expect(targetElement).toBeInstanceOf(HTMLElement);
      expect((targetElement as HTMLElement).classList.contains("photo-card")).toBe(true);
      expect(options).toEqual(
        expect.objectContaining({
          pixelRatio: 2.5,
          cacheBust: true,
          style: { borderRadius: "0" },
        }),
      );

      // Verify anchor click triggered with sanitized filename
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    });

    it("sanitizes empty or whitespace-only name to 'persona' in download filename", async () => {
      const toPngSpy = vi
        .spyOn(htmlToImage, "toPng")
        .mockResolvedValue("data:image/png;base64,mockPngContent");

      let createdAnchor: HTMLAnchorElement | null = null;
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName.toLowerCase() === "a") {
          createdAnchor = el as HTMLAnchorElement;
        }
        return el;
      });

      render(
        <KeepsakePhotoCard
          persona={personas.creative}
          quote={personas.creative.quotes[0]!}
          soundEnabled={false}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      const nameInput = screen.getByLabelText(/Nama Kamu/i);
      fireEvent.change(nameInput, { target: { value: "    " } });

      const downloadBtn = screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(toPngSpy).toHaveBeenCalled();
        expect(createdAnchor).not.toBeNull();
        expect(createdAnchor!.download).toBe("SGE2026-creative-persona.png");
      });
    });

    it("catches toPng failure gracefully and presents alert fallback without crashing UI", async () => {
      vi.spyOn(htmlToImage, "toPng").mockRejectedValue(
        new Error("Canvas tainted by CORS or rendering failure"),
      );
      const alertSpy = vi.spyOn(window, "alert");

      render(
        <KeepsakePhotoCard
          persona={personas.adventure}
          quote={personas.adventure.quotes[0]!}
          soundEnabled={false}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      const downloadBtn = screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            "Gagal menyimpan otomatis. Anda dapat mengambil screenshot frame ini.",
          ),
        );
      });

      // Verify button restores to normal state after failure
      expect(screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i })).toBeEnabled();
    });

    it("copies booth URL to clipboard on share button click and displays success confirmation", async () => {
      render(
        <KeepsakePhotoCard
          persona={personas.career}
          quote={personas.career.quotes[0]!}
          soundEnabled={false}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      const shareBtn = screen.getByRole("button", { name: /Salin Tautan Booth/i });
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
        expect(screen.getByText(/Tautan Disalin!/i)).toBeInTheDocument();
      });
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
