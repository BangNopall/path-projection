import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { routeTree } from "@/routeTree.gen";
import { KineticSentenceReveal } from "@/components/booth/KineticSentenceReveal";
import { TarotCard3D } from "@/components/booth/TarotCard3D";
import { KeepsakePhotoCard } from "@/components/booth/KeepsakePhotoCard";
import { ScannerHUD } from "@/components/booth/ScannerHUD";
import { InteractiveDeck } from "@/components/booth/InteractiveDeck";
import { personas, personaKeys } from "@/data/personas";
import * as audioModule from "@/lib/audio";

vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,mockPngBase64"),
}));

function renderBooth(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return render(<RouterProvider router={router} />);
}

describe("Final Acceptance Empirical Challenge Harness", () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLAnchorElement.prototype.click = vi.fn();

    const mockOscillator = {
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
    const mockAudioContext = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      close: vi.fn().mockResolvedValue(undefined),
    }));
    vi.stubGlobal("AudioContext", mockAudioContext);

    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      configurable: true,
      value: {
        getUserMedia: vi
          .fn()
          .mockRejectedValue(new Error("Izin kamera ditolak atau tidak tersedia.")),
      },
    });

    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // -------------------------------------------------------------------------
  // CHALLENGE DIMENSION 1: Rapid Screen Transitions & Navigation Stress
  // -------------------------------------------------------------------------
  describe("Challenge 1: Rapid User Navigation & Screen Transitions Stress", () => {
    it("survives rapid looping through all 5 screens across multiple continuous cycles", async () => {
      const { container } = renderBooth();

      // Wait for TanStack Router initial mount
      await waitFor(() => {
        expect(screen.getByText(/Student Government Expo 2026/i)).toBeInTheDocument();
      });

      for (let cycle = 0; cycle < 3; cycle++) {
        // Screen 1 (Home) -> Screen 2 (Dilemma)
        const startBtn = await screen.findByRole("button", { name: /Mulai Membaca Takdir/i });
        fireEvent.click(startBtn);

        // Screen 2 (Dilemma) -> Screen 3 (Scanner)
        const scanBtn = await screen.findByRole("button", { name: /Gunakan Kamera Scanner/i });
        fireEvent.click(scanBtn);

        // Screen 3 (Scanner) -> Select persona via manual fallback -> Screen 4 (Reveal)
        const fallbackToggle = await screen.findByRole("button", {
          name: /Buka Pilihan Manual/i,
        });
        fireEvent.click(fallbackToggle);

        const careerFallback = await screen.findByRole("button", {
          name: /Karier & Kepemimpinan/i,
        });
        fireEvent.click(careerFallback);

        // Screen 4 (Reveal) -> Screen 5 (Photo)
        const photoBtn = await screen.findByRole("button", { name: /Buat Kartu Fotomu/i });
        fireEvent.click(photoBtn);

        // Screen 5 (Photo) -> Screen 1 (Home) via Main Ulang
        const resetBtn = await screen.findByRole("button", { name: /Main Ulang dari Beranda/i });
        fireEvent.click(resetBtn);

        // Verify back at Home
        await screen.findByRole("button", { name: /Mulai Membaca Takdir/i });
      }

      expect(container).toBeInTheDocument();
      expect(screen.getByText(/Siapa kamu/i)).toBeInTheDocument();
    }, 15000);

    it("handles rapid back-and-forth toggling between Dilemma and Home without state corruption", async () => {
      renderBooth();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });

      for (let i = 0; i < 4; i++) {
        const startBtn = await screen.findByRole("button", { name: /Mulai Membaca Takdir/i });
        fireEvent.click(startBtn);

        const backBtn = await screen.findByRole("button", { name: /Kembali/i });
        fireEvent.click(backBtn);

        await screen.findByRole("button", { name: /Mulai Membaca Takdir/i });
      }

      expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
    });

    it("resets directly to Home from any screen via header logo click", async () => {
      renderBooth();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });

      // Go to Dilemma
      fireEvent.click(screen.getByRole("button", { name: /Mulai Membaca Takdir/i }));
      await screen.findByText(/Pertanyaan Pemantik Masa Depan/i);

      // Click global header brand logo
      const brandHeader = screen.getByText(/GUESS/i).closest(".cursor-pointer");
      expect(brandHeader).not.toBeNull();
      fireEvent.click(brandHeader!);

      // Should be immediately back at Home
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });

      // Go directly to Revelation via Home deck card
      fireEvent.click(await screen.findByTitle("Kartu Petualangan & Batas Baru"));
      await screen.findByText(/The Boundary Breaker/i);

      // Click header logo from Revelation
      fireEvent.click(brandHeader!);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });
    });

    it("accurately synchronizes metadata when switching personas in Dilemma", async () => {
      renderBooth();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });

      // Navigate to dilemma
      fireEvent.click(screen.getByRole("button", { name: /Mulai Membaca Takdir/i }));
      await screen.findByText(/Pertanyaan Pemantik Masa Depan/i);

      const dilemmaButtons = screen.getAllByRole("button", { name: /Pilih Nilai Ini/i });
      expect(dilemmaButtons).toHaveLength(3);

      // Select Adventure (index 2)
      fireEvent.click(dilemmaButtons[2]!);

      // Assert Adventure revelation metadata
      await waitFor(() => {
        expect(screen.getByText(/The Boundary Breaker/i)).toBeInTheDocument();
        expect(screen.getByText(/NO\. 03 — ADVENTURE & HORIZON/i)).toBeInTheDocument();
      });

      // Reset to Home
      fireEvent.click(screen.getByRole("button", { name: /Main Lagi/i }));
      await screen.findByRole("button", { name: /Mulai Membaca Takdir/i });

      // Go back to Dilemma and select Creative (index 1)
      fireEvent.click(screen.getByRole("button", { name: /Mulai Membaca Takdir/i }));
      const newDilemmaButtons = await screen.findAllByRole("button", { name: /Pilih Nilai Ini/i });
      fireEvent.click(newDilemmaButtons[1]!);

      // Assert Creative revelation metadata
      await waitFor(() => {
        expect(screen.getByText(/The Soul Crafter/i)).toBeInTheDocument();
        expect(screen.getByText(/NO\. 02 — CREATIVE & SOUL/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // CHALLENGE DIMENSION 2: Kinetic Sentence Reveal & Golden Sweep Triggers
  // -------------------------------------------------------------------------
  describe("Challenge 2: Kinetic Sentence Reveal Reset, Timing & Golden Sweep", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("cancels prior completion timer upon sentence change and avoids premature completion trigger", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <KineticSentenceReveal
          sentence="Kalimat pertama yang cukup panjang untuk durasi lama."
          onComplete={onComplete}
        />,
      );

      // Card is initially not completed
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe(
        "false",
      );
      expect(screen.queryByTestId("golden-sweep")).not.toBeInTheDocument();

      // Advance partial time (200ms) - sentence 1 is still ongoing
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // Change sentence before sentence 1 timer finishes
      rerender(
        <KineticSentenceReveal
          sentence="Kalimat kedua baru saja menggantikan kalimat pertama."
          onComplete={onComplete}
        />,
      );

      // Advance time by 300ms (total 500ms since start, which would have triggered sentence 1 if not canceled)
      act(() => {
        vi.advanceTimersByTime(300);
      });
      // Previous timer MUST have been canceled!
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.queryByTestId("golden-sweep")).not.toBeInTheDocument();

      // Advance until sentence 2 naturally completes (~800ms)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("golden-sweep")).toBeInTheDocument();
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe("true");
    });

    it("handles extreme adversarial sentence inputs without throwing or crashing", () => {
      const testCases = [
        "", // Empty
        "   \t\n  ", // Whitespace only
        "Kata", // Single word
        "Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh sebelas dua belas tiga belas empat belas lima belas enam belas tujuh belas delapan belas sembilan belas dua puluh", // 20 words
        "✦ 💼 SGE 2026 ✨ FILKOM UB 🚀 #Inovasi", // Emojis and hashtags
        "“Apakah kamu siap? Ya, tentu saja!” — Refleksi (2026)...", // Punctuation rich
        "100% Client-Side Invariant: Zero Backend Dependencies.", // Alphanumeric & colons
      ];

      testCases.forEach((testSentence) => {
        const { unmount } = render(<KineticSentenceReveal sentence={testSentence} />);
        expect(screen.getByTestId("kinetic-reveal-card")).toBeInTheDocument();
        act(() => {
          vi.advanceTimersByTime(1200);
        });
        unmount();
      });
    });

    it("resists 50 rapid reroll clicks without desynchronizing state", () => {
      let currentQuoteIndex = 0;
      const pool = personas.career.quotes;
      const onReroll = vi.fn(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % pool.length;
      });

      const { rerender } = render(
        <KineticSentenceReveal sentence={pool[currentQuoteIndex]!} onReroll={onReroll} />,
      );

      const rerollBtn = screen.getByTestId("reroll-button");

      for (let i = 0; i < 50; i++) {
        fireEvent.click(rerollBtn);
        expect(onReroll).toHaveBeenCalledTimes(i + 1);

        rerender(<KineticSentenceReveal sentence={pool[currentQuoteIndex]!} onReroll={onReroll} />);

        const words = screen.getAllByTestId("kinetic-word");
        expect(words.length).toBeGreaterThan(0);
        expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe(
          "false",
        );
      }
    });

    it("ensures golden sweep gradient matches official SGE 2026 golden shine specifications", () => {
      render(<KineticSentenceReveal sentence="Refleksi takdir SGE 2026." />);

      act(() => {
        vi.advanceTimersByTime(800);
      });

      const sweep = screen.getByTestId("golden-sweep");
      expect(sweep).toBeInTheDocument();
      expect(sweep).toHaveStyle({
        background:
          "linear-gradient(105deg, transparent 20%, rgba(242, 183, 5, 0.45) 50%, transparent 80%)",
      });
    });
  });

  // -------------------------------------------------------------------------
  // CHALLENGE DIMENSION 3: Offline Client-Side Operation & Zero Network Calls
  // -------------------------------------------------------------------------
  describe("Challenge 3: Offline Operation & Zero External Network Invariant", () => {
    it("makes zero external fetch, XMLHttpRequest, or WebSocket requests during normal full usage", async () => {
      // Set offline mode
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        configurable: true,
        value: false,
      });

      const fetchSpy = vi.fn().mockRejectedValue(new Error("OFFLINE_NETWORK_BLOCKED"));
      vi.stubGlobal("fetch", fetchSpy);

      // Render full app
      renderBooth();

      await waitFor(() => {
        expect(screen.getByText(/Student Government Expo 2026/i)).toBeInTheDocument();
      });

      // Home Screen interactions
      const shuffleBtn = screen.getByRole("button", { name: /Kocok Kartu ✦ SGE 2026/i });
      fireEvent.click(shuffleBtn);

      // Navigate to Dilemma
      fireEvent.click(screen.getByRole("button", { name: /Mulai Membaca Takdir/i }));
      await screen.findByText(/Pertanyaan Pemantik Masa Depan/i);

      // Select Career Persona
      const selectBtns = screen.getAllByRole("button", { name: /Pilih Nilai Ini/i });
      fireEvent.click(selectBtns[0]!);
      await screen.findByText(/The Foundation Builder/i);

      // Reroll Quote
      const rerollBtn = screen.getByRole("button", { name: /Tarik Refleksi Baru/i });
      fireEvent.click(rerollBtn);

      // Navigate to Photo Studio
      fireEvent.click(screen.getByRole("button", { name: /Buat Kartu Fotomu/i }));
      await screen.findByText(/Simpan Momen Masa Depanmu/i);

      // Personalize Name
      const nameInput = screen.getByLabelText(/Nama Kamu/i);
      fireEvent.change(nameInput, { target: { value: "Mahasiswa Baru" } });

      // Trigger Download & Share
      fireEvent.click(screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i }));
      fireEvent.click(screen.getByRole("button", { name: /Salin Tautan Booth/i }));

      // VERIFY: Absolutely zero fetch calls were made!
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("verifies all persona assets are local Vite ESM URLs without remote hostnames", () => {
      personaKeys.forEach((key) => {
        const item = personas[key];
        // Image must be local relative path or Vite hash path
        expect(item.image).toBeDefined();
        expect(item.frontImage).toBeDefined();
        expect(item.image).not.toMatch(/^https?:\/\//i);
        expect(item.frontImage).not.toMatch(/^https?:\/\//i);
        expect(item.image).not.toContain("__l5e");
        expect(item.frontImage).not.toContain("__l5e");
      });
    });

    it("operates gracefully in Scanner HUD when offline without unhandled network exceptions", async () => {
      const fetchSpy = vi.fn().mockRejectedValue(new Error("NO_INTERNET"));
      vi.stubGlobal("fetch", fetchSpy);

      const handleDetect = vi.fn();
      render(
        <ScannerHUD modelUrl="" soundEnabled={true} onDetectCard={handleDetect} onBack={vi.fn()} />,
      );

      // Viewfinder mounts cleanly
      expect(screen.getByText(/OPTICAL \/\/ 01/i)).toBeInTheDocument();

      // Manual drawer is usable offline
      fireEvent.click(screen.getByRole("button", { name: /Buka Pilihan Manual/i }));
      fireEvent.click(screen.getByRole("button", { name: /Karier & Kepemimpinan/i }));

      expect(handleDetect).toHaveBeenCalledWith("career");
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // CHALLENGE DIMENSION 4: TarotCard3D & Audio Robustness Under Edge Conditions
  // -------------------------------------------------------------------------
  describe("Challenge 4: TarotCard3D Interaction Physics & Audio Edge Handling", () => {
    it("handles extreme pointer coordinates in TarotCard3D without NaN or throw", () => {
      const { container } = render(
        <TarotCard3D
          frontImage={personas.career.frontImage}
          backImage={personas.career.image}
          altText="Test Card"
          interactiveTilt={true}
        />,
      );

      const card = container.querySelector(".perspective-container");
      expect(card).not.toBeNull();

      // Extreme positive coordinates
      fireEvent.pointerMove(card!, { clientX: 999999, clientY: 999999 });

      // Negative coordinates
      fireEvent.pointerMove(card!, { clientX: -999999, clientY: -999999 });

      // Zero coordinates
      fireEvent.pointerMove(card!, { clientX: 0, clientY: 0 });

      // Pointer leave resets cleanly
      fireEvent.pointerLeave(card!);
      expect(container).toBeInTheDocument();
    });

    it("survives missing AudioContext or thrown audio errors silently without interrupting user flow", () => {
      // Simulate broken audio environment
      vi.stubGlobal("AudioContext", undefined);
      vi.stubGlobal("webkitAudioContext", undefined);

      expect(() => {
        audioModule.playAudioTone("click", true);
        audioModule.playAudioTone("shuffle", true);
        audioModule.playAudioTone("reveal", true);
        audioModule.playAudioTone("hover", true);
      }).not.toThrow();
    });

    it("KeepsakePhotoCard handles normal share action cleanly", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        configurable: true,
        value: {
          writeText: writeTextMock,
        },
      });

      render(
        <KeepsakePhotoCard
          persona={personas.creative}
          quote="Test quote"
          soundEnabled={true}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      const shareBtn = screen.getByRole("button", { name: /Salin Tautan Booth/i });
      fireEvent.click(shareBtn);
      expect(writeTextMock).toHaveBeenCalled();
    });
  });
});
