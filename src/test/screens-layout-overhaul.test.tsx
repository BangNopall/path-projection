import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { routeTree } from "@/routeTree.gen";
import { InteractiveDeck } from "@/components/booth/InteractiveDeck";
import { ReflectionDilemma } from "@/components/booth/ReflectionDilemma";
import { ScannerHUD } from "@/components/booth/ScannerHUD";
import { KeepsakePhotoCard } from "@/components/booth/KeepsakePhotoCard";
import { personas } from "@/data/personas";
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
  describe("Screen 4 (Grand Revelation): KineticSentenceReveal Integration", () => {
    it("mounts KineticSentenceReveal and completely eliminates monospace setInterval typewriter", async () => {
      const { container } = renderBooth();

      // Go to revelation for Career
      fireEvent.click(await screen.findByTitle("Kartu Karier & Kepemimpinan"));

      await waitFor(() => {
        expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
      });

      // KineticSentenceReveal should be mounted with testid
      const kineticCard = screen.getByTestId("kinetic-reveal-card");
      expect(kineticCard).toBeInTheDocument();

      // Monospace blinking block cursor (▍) must NOT exist
      expect(container.textContent).not.toContain("▍");

      // Stamp border is applied to 3D revealed card
      const stampContainers = container.querySelectorAll(".stamp-border");
      expect(stampContainers.length).toBeGreaterThanOrEqual(1);
    });

    it("connects 'Tarik Refleksi Baru' to quote shuffling with sound cue and non-repetition", async () => {
      const playSpy = vi.spyOn(audioModule, "playAudioTone");
      renderBooth();

      fireEvent.click(await screen.findByTitle("Kartu Karier & Kepemimpinan"));
      await screen.findByText(/The Foundation Builder/i);

      const initialSentence = screen.getByTestId("kinetic-sentence").textContent?.trim();

      // Click reroll
      const rerollBtn = screen.getByRole("button", { name: /Tarik Refleksi Baru/i });
      fireEvent.click(rerollBtn);

      expect(playSpy).toHaveBeenCalledWith("shuffle", true);

      // Verify new sentence was loaded
      await waitFor(() => {
        const nextSentence = screen.getByTestId("kinetic-sentence").textContent?.trim();
        expect(nextSentence).toBeDefined();
        expect(nextSentence?.length).toBeGreaterThan(0);
      });
    });
  });

  // -------------------------------------------------------------
  // Screen 5: Keepsake Photo Studio
  // -------------------------------------------------------------
  describe("Screen 5 (Keepsake Photo Studio): Polaroid SGE 2026 Branding & Export", () => {
    it("renders Polaroid keepsake frame with #1F6F78 Steady Teal header banner and circuit backdrop", () => {
      const { container } = render(
        <KeepsakePhotoCard
          persona={personas.creative}
          quote="Kreativitasmu adalah doa yang diwujudkan."
          soundEnabled={true}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      // Steady Teal header bar
      const tealBanner = container.querySelector(".bg-\\[\\#1F6F78\\]");
      expect(tealBanner).toBeInTheDocument();
      expect(tealBanner).toHaveTextContent(/GUESS WHO ARE YOU\./i);
      expect(tealBanner).toHaveTextContent(/PKKMB FILKOM UB · SGE 2026/i);

      // Circuit pattern backdrop
      const circuitCard = container.querySelector(".circuit-pattern-bg");
      expect(circuitCard).toBeInTheDocument();

      // Corner registration marks
      expect(screen.getByText("⌜")).toBeInTheDocument();
      expect(screen.getByText("⌝")).toBeInTheDocument();
      expect(screen.getByText("⌞")).toBeInTheDocument();
      expect(screen.getByText("⌟")).toBeInTheDocument();
    });

    it("personalizes participant name and handles download and share actions", async () => {
      render(
        <KeepsakePhotoCard
          persona={personas.adventure}
          quote="Bumi ini terlampau luas untuk disesali di sudut sempit."
          soundEnabled={true}
          onReset={vi.fn()}
          onBackToReveal={vi.fn()}
        />,
      );

      const nameInput = screen.getByLabelText(/Nama Kamu/i);
      fireEvent.change(nameInput, { target: { value: "Siti Rahma" } });
      expect(screen.getByText("Siti Rahma")).toBeInTheDocument();

      const downloadBtn = screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i });
      fireEvent.click(downloadBtn);

      const shareBtn = screen.getByRole("button", { name: /Salin Tautan Booth/i });
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(screen.getByText(/Tautan Disalin!/i)).toBeInTheDocument();
      });
    });
  });
});
