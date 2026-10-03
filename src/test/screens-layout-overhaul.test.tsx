import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { routeTree } from "@/routeTree.gen";
import { InteractiveDeck } from "@/components/booth/InteractiveDeck";
import { ReflectionDilemma } from "@/components/booth/ReflectionDilemma";
import { ScannerHUD } from "@/components/booth/ScannerHUD";
import { personas } from "@/data/personas";
import * as audioModule from "@/lib/audio";

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

describe("Milestone M4: 5-Screen Layout Overhaul", () => {
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

  // -------------------------------------------------------------
  // Screen 1: Home Deck & InteractiveDeck
  // -------------------------------------------------------------
  describe("Screen 1 (Home Deck): Neo-Editorial Bento & Circuit Aesthetics", () => {
    it("renders InteractiveDeck with circuit texture backdrop and editorial registration marks", () => {
      const { container } = render(
        <InteractiveDeck soundEnabled={true} onSelectPersona={vi.fn()} />,
      );

      const circuitBg = container.querySelector(".circuit-pattern-bg");
      expect(circuitBg).toBeInTheDocument();

      expect(screen.getByText(/DECK\.SGE\.2026 \/\/ TR-01/i)).toBeInTheDocument();
      expect(screen.getByText(/ARCHETYPE\.SYSTEM \/\/ 03/i)).toBeInTheDocument();

      // Ensure generic cyber glow blob was removed
      expect(container.querySelector(".blur-\\[75px\\]")).not.toBeInTheDocument();
    });

    it("renders all 3 fan cards with accessible titles, SGE badges, and shuffle trigger", () => {
      const handleSelect = vi.fn();
      render(<InteractiveDeck soundEnabled={true} onSelectPersona={handleSelect} />);

      const careerCard = screen.getByTitle("Kartu Karier & Kepemimpinan");
      const adventureCard = screen.getByTitle("Kartu Petualangan & Batas Baru");
      const mascotCard = screen.getByTitle("Maskot Guess Who Are You · SGE 2026");

      expect(careerCard).toBeInTheDocument();
      expect(adventureCard).toBeInTheDocument();
      expect(mascotCard).toBeInTheDocument();

      fireEvent.click(careerCard);
      expect(handleSelect).toHaveBeenCalledWith("career");

      const shuffleBtn = screen.getByRole("button", { name: /Kocok Kartu ✦ SGE 2026/i });
      expect(shuffleBtn).toBeInTheDocument();
      fireEvent.click(shuffleBtn);
    });

    it("renders Home Deck hero with SGE 2026 palette and clean modern typography", async () => {
      renderBooth();

      await waitFor(() => {
        expect(screen.getByText(/Student Government Expo 2026/i)).toBeInTheDocument();
        expect(
          screen.getByText(
            /Tiga kartu persona\. Satu nilai yang kamu bawa melangkah di FILKOM UB\./i,
          ),
        ).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Scan Kartu Kamera/i })).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // Screen 2: Dilemma Reflection
  // -------------------------------------------------------------
  describe("Screen 2 (Dilemma Reflection): Bento Cards & Stamp Edging", () => {
    it("renders 3 path cards styled with neo-bento-card and stamp-border", () => {
      const { container } = render(
        <ReflectionDilemma
          soundEnabled={true}
          onSelectPersona={vi.fn()}
          onOpenScanner={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      const bentoCards = container.querySelectorAll(".neo-bento-card");
      expect(bentoCards.length).toBeGreaterThanOrEqual(4); // 1 banner + 3 cards

      const stampCards = container.querySelectorAll(".stamp-border");
      expect(stampCards.length).toBeGreaterThanOrEqual(3);

      expect(screen.getByText(/EDITION 2026 \/\/ SGE-001/i)).toBeInTheDocument();
      expect(screen.getByText(/EDITION 2026 \/\/ SGE-002/i)).toBeInTheDocument();
      expect(screen.getByText(/EDITION 2026 \/\/ SGE-003/i)).toBeInTheDocument();
    });

    it("triggers onSelectPersona and audio when choosing a value", () => {
      const handleSelect = vi.fn();
      const playSpy = vi.spyOn(audioModule, "playAudioTone");

      render(
        <ReflectionDilemma
          soundEnabled={true}
          onSelectPersona={handleSelect}
          onOpenScanner={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button", { name: /Pilih Nilai Ini/i });
      expect(buttons).toHaveLength(3);

      fireEvent.click(buttons[1]!); // Creative
      expect(handleSelect).toHaveBeenCalledWith("creative");
      expect(playSpy).toHaveBeenCalledWith("click", true);
    });
  });

  // -------------------------------------------------------------
  // Screen 3: Scanner HUD
  // -------------------------------------------------------------
  describe("Screen 3 (Scanner HUD): Optical Frame & Accessible Fallback", () => {
    it("renders optical viewfinder frame with circuit texture backdrop and telemetry", () => {
      const { container } = render(
        <ScannerHUD
          modelUrl="https://teachablemachine.withgoogle.com/models/test/"
          soundEnabled={true}
          onDetectCard={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      const circuitBg = container.querySelector(".circuit-pattern-bg");
      expect(circuitBg).toBeInTheDocument();

      expect(screen.getByText(/OPTICAL \/\/ 01/i)).toBeInTheDocument();
      expect(screen.getByText("768×1086")).toBeInTheDocument();
      expect(screen.getByText(/LIVE SCAN/i)).toBeInTheDocument();
      expect(screen.getByText(/Prediksi Realtime/i)).toBeInTheDocument();
    });

    it("ensures manual fallback drawer is 100% accessible offline", () => {
      const handleDetect = vi.fn();
      render(
        <ScannerHUD modelUrl="" soundEnabled={true} onDetectCard={handleDetect} onBack={vi.fn()} />,
      );

      const toggleBtn = screen.getByRole("button", { name: /Buka Pilihan Manual/i });
      fireEvent.click(toggleBtn);

      const adventureBtn = screen.getByRole("button", { name: /Petualangan & Batas Baru/i });
      expect(adventureBtn).toBeInTheDocument();

      fireEvent.click(adventureBtn);
      expect(handleDetect).toHaveBeenCalledWith("adventure");
    });
  });

  // -------------------------------------------------------------
  // Screen 4: Grand Revelation & KineticSentenceReveal
  // -------------------------------------------------------------
  describe("Screen 4 (Grand Revelation): Editorial Narrative & 3D Motion Integration", () => {
    it("mounts overhauled editorial destiny narrative and completely eliminates monospace setInterval typewriter", async () => {
      const { container } = renderBooth();

      // Go to revelation for Career
      fireEvent.click(await screen.findByTitle("Kartu Karier & Kepemimpinan"));

      await waitFor(() => {
        expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
      });

      // Overhauled editorial destiny reflection should be mounted with testid
      const reflectionNarrative = screen.getByTestId("destiny-reflection-narrative");
      expect(reflectionNarrative).toBeInTheDocument();

      // Monospace blinking block cursor (▍) must NOT exist
      expect(container.textContent).not.toContain("▍");

      // Stamp border is applied to 3D revealed card
      const stampContainers = container.querySelectorAll(".stamp-border");
      expect(stampContainers.length).toBeGreaterThanOrEqual(1);
    });

    it("renders clean 2-column editorial layout with dual action buttons", async () => {
      renderBooth();

      fireEvent.click(await screen.findByTitle("Kartu Karier & Kepemimpinan"));
      await screen.findByText(/The Foundation Builder/i);

      // Editorial 2-column elements
      expect(screen.getByText(/NO. 01 — CAREER & FOUNDATION/i)).toBeInTheDocument();
      expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();

      // Dual action buttons are present and interactive
      const pickOtherBtn = screen.getByRole("button", { name: /Pilih Kartu Lain/i });
      const resetBtn = screen.getByRole("button", { name: /Kembali ke Awal/i });
      expect(pickOtherBtn).toBeInTheDocument();
      expect(resetBtn).toBeInTheDocument();

      // "Buat Kartu Fotomu" is completely absent
      expect(screen.queryByRole("button", { name: /Buat Kartu Fotomu/i })).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // Navigation & Photo Studio Excision Verification
  // -------------------------------------------------------------
  describe("Navigation & Photo Studio Excision Verification", () => {
    it("navigates back to Dilemma on 'Pilih Kartu Lain' and to Home on 'Kembali ke Awal'", async () => {
      renderBooth();

      // Jump to revelation
      fireEvent.click(await screen.findByTitle("Kartu Karier & Kepemimpinan"));
      await screen.findByText(/The Foundation Builder/i);

      // Click "Pilih Kartu Lain" -> Dilemma
      fireEvent.click(screen.getByRole("button", { name: /Pilih Kartu Lain/i }));
      await waitFor(() => {
        expect(screen.getByText(/Tahap 01 · Dilema Refleksi/i)).toBeInTheDocument();
      });

      // Select Adventure
      const selectButtons = screen.getAllByRole("button", { name: /Pilih Nilai Ini/i });
      fireEvent.click(selectButtons[2]!);
      await waitFor(() => {
        expect(screen.getByText(/The Boundary Breaker/i)).toBeInTheDocument();
      });

      // Click "Kembali ke Awal" -> Home
      fireEvent.click(screen.getByRole("button", { name: /Kembali ke Awal/i }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });
    });
  });
});
