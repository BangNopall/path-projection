import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { personas } from "@/data/personas";

// Mock html-to-image for Keepsake Photo Studio export
vi.mock("html-to-image", () => ({
  toPng: vi.fn().mockResolvedValue("data:image/png;base64,mockPngBase64"),
}));

function renderBoothApp(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return render(<RouterProvider router={router} />);
}

describe("E2E Booth Flow — 4-Tier Opaque-Box Test Suite", () => {
  beforeEach(() => {
    // Mock HTMLMediaElement.play and HTMLAnchorElement.click
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLAnchorElement.prototype.click = vi.fn();

    // Mock Web Audio Context
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
    const mockAudioContext = vi.fn().mockImplementation(function () {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        close: vi.fn().mockResolvedValue(undefined),
      };
    });
    vi.stubGlobal("AudioContext", mockAudioContext);

    // Mock navigator.mediaDevices default behavior (fails with permission denied to trigger safe client fallback)
    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      configurable: true,
      value: {
        getUserMedia: vi
          .fn()
          .mockRejectedValue(new Error("Izin kamera ditolak atau tidak tersedia.")),
      },
    });

    // Mock clipboard
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ==========================================
  // TIER 1: CORE FEATURE & SANITY VERIFICATION
  // ==========================================
  describe("Tier 1: Feature Coverage & Initial Mount", () => {
    it("renders Home Deck with SGE 2026 brand identity and core interactive triggers", async () => {
      renderBoothApp();

      // Brand headers and labels
      await waitFor(() => {
        expect(screen.getAllByText(/GUESS/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/SGE FILKOM UB · 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Student Government Expo 2026/i)).toBeInTheDocument();
      });

      // Main CTA buttons
      expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Scan Kartu Kamera/i })).toBeInTheDocument();

      // Sound toggle exists with accessible label
      const soundBtn = screen.getByRole("button", { name: /Matikan suara/i });
      expect(soundBtn).toBeInTheDocument();

      // Settings button
      expect(screen.getByRole("button", { name: /Pengaturan scanner/i })).toBeInTheDocument();
    });

    it("toggles sound setting and updates accessible state", async () => {
      renderBoothApp();

      const soundBtn = await screen.findByRole("button", { name: /Matikan suara/i });
      fireEvent.click(soundBtn);

      // Label should flip to "Nyalakan suara"
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Nyalakan suara/i })).toBeInTheDocument();
      });

      // Click again to turn sound back on
      fireEvent.click(screen.getByRole("button", { name: /Nyalakan suara/i }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Matikan suara/i })).toBeInTheDocument();
      });
    });

    it("opens and closes scanner configuration modal", async () => {
      renderBoothApp();

      const settingsBtn = await screen.findByRole("button", { name: /Pengaturan scanner/i });
      fireEvent.click(settingsBtn);

      // Modal dialog appears
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/Pengaturan Kamera Scanner/i)).toBeInTheDocument();
      });

      // Close modal
      const closeBtn = screen.getByRole("button", { name: /Tutup pengaturan/i });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY CONDITIONS & FALLBACKS
  // ==========================================
  describe("Tier 2: Boundary Conditions & Error Handling", () => {
    it("handles camera denial gracefully in Scanner HUD and offers manual fallback drawer", async () => {
      renderBoothApp();

      // Navigate to Scanner HUD
      const scanBtn = await screen.findByRole("button", { name: /Scan Kartu Kamera/i });
      fireEvent.click(scanBtn);

      // Scanner HUD mounts
      await waitFor(() => {
        expect(screen.getByText(/02 · Pindai Kartu Persona/i)).toBeInTheDocument();
      });

      // Error banner is presented due to camera denial
      await waitFor(() => {
        expect(screen.getByText(/Izin kamera ditolak atau tidak tersedia/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Pilih Kartu Manual Saja/i }),
        ).toBeInTheDocument();
      });

      // Manual drawer toggle also exists
      expect(screen.getByRole("button", { name: /Buka Pilihan Manual/i })).toBeInTheDocument();
    });

    it("allows manual persona selection when camera is unavailable", async () => {
      renderBoothApp();

      // Go to scanner
      fireEvent.click(await screen.findByRole("button", { name: /Scan Kartu Kamera/i }));

      // Open manual options
      const manualBtn = await screen.findByRole("button", { name: /Buka Pilihan Manual/i });
      fireEvent.click(manualBtn);

      // The 3 persona buttons appear in the manual drawer
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Karier & Kepemimpinan/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Kreativitas & Jiwa/i })).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Petualangan & Batas Baru/i }),
        ).toBeInTheDocument();
      });

      // Select Creative persona manually
      fireEvent.click(screen.getByRole("button", { name: /Kreativitas & Jiwa/i }));

      // Navigates directly to Grand Revelation with Creative persona
      await waitFor(() => {
        expect(screen.getByText(/NO. 02 — CREATIVE & SOUL/i)).toBeInTheDocument();
        expect(screen.getByText(/The Soul Crafter/i)).toBeInTheDocument();
      });
    });

    it("validates and persists custom Teachable Machine model URL in settings modal", async () => {
      renderBoothApp();

      fireEvent.click(await screen.findByRole("button", { name: /Pengaturan scanner/i }));

      const input = await screen.findByLabelText(/URL Model Teachable Machine/i);
      const testUrl = "https://teachablemachine.withgoogle.com/models/test-sge-2026/";
      fireEvent.change(input, { target: { value: testUrl } });

      const saveBtn = screen.getByRole("button", { name: /Simpan Pengaturan/i });
      fireEvent.click(saveBtn);

      // Verify localStorage was updated
      expect(window.localStorage.getItem("sge-teachable-machine-model")).toBe(testUrl);

      // Modal closed
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("sanitizes empty participant name in Keepsake Photo Studio to fallback text", async () => {
      renderBoothApp();

      // Navigate to dilemma -> select career
      fireEvent.click(await screen.findByRole("button", { name: /Mulai Membaca Takdir/i }));
      await screen.findByText(/Tahap 01 · Dilema Refleksi/i);

      const selectButtons = screen.getAllByRole("button", { name: /Pilih Nilai Ini/i });
      fireEvent.click(selectButtons[0]!); // Career

      // Go to photo studio
      const photoBtn = await screen.findByRole("button", { name: /Buat Kartu Fotomu/i });
      fireEvent.click(photoBtn);

      // Keepsake screen mounts
      await screen.findByText(/Tahap 03 · Kartu Dokumentasi Booth/i);

      // Name input should be empty, preview displays default fallback
      const nameInput = screen.getByLabelText(/Nama Kamu/i);
      expect(nameInput).toHaveValue("");
      expect(screen.getByText(/Your Future Self/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE & STATE TRANSITIONS
  // ==========================================
  describe("Tier 3: Cross-Feature Combinations & State Transitions", () => {
    it("completes full sequential loop: Home -> Dilemma -> Scanner -> Revelation -> Photo -> Home", async () => {
      renderBoothApp();

      // 1. Home -> Dilemma
      fireEvent.click(await screen.findByRole("button", { name: /Mulai Membaca Takdir/i }));
      await waitFor(() => {
        expect(screen.getByText(/Tahap 01 · Dilema Refleksi/i)).toBeInTheDocument();
      });

      // 2. Dilemma -> Scanner HUD
      fireEvent.click(screen.getByRole("button", { name: /Gunakan Kamera Scanner/i }));
      await waitFor(() => {
        expect(screen.getByText(/02 · Pindai Kartu Persona/i)).toBeInTheDocument();
      });

      // 3. Scanner HUD -> Revelation (via manual fallback)
      fireEvent.click(await screen.findByRole("button", { name: /Buka Pilihan Manual/i }));
      const adventureBtn = await screen.findByRole("button", { name: /Petualangan & Batas Baru/i });
      fireEvent.click(adventureBtn);

      // 4. Grand Revelation (Adventure)
      await waitFor(() => {
        expect(screen.getByText(/NO. 03 — ADVENTURE & HORIZON/i)).toBeInTheDocument();
        expect(screen.getByText(/The Boundary Breaker/i)).toBeInTheDocument();
      });

      // 5. Revelation -> Photo Studio
      fireEvent.click(screen.getByRole("button", { name: /Buat Kartu Fotomu/i }));
      await waitFor(() => {
        expect(screen.getByText(/Tahap 03 · Kartu Dokumentasi Booth/i)).toBeInTheDocument();
        expect(screen.getByText(/CARD NO. 03/i)).toBeInTheDocument();
      });

      // 6. Photo Studio -> Reset to Home
      fireEvent.click(screen.getByRole("button", { name: /Main Ulang dari Beranda/i }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
      });
    });

    it("allows direct shortcut from Home Deck 3D stacked cards to Grand Revelation", async () => {
      renderBoothApp();

      // Interactive deck cards have titles
      const careerCard = await screen.findByTitle(/Kartu Karier & Kepemimpinan/i);
      fireEvent.click(careerCard);

      // Direct transition to Grand Revelation for Career
      await waitFor(() => {
        expect(screen.getByText(/NO. 01 — CAREER & FOUNDATION/i)).toBeInTheDocument();
        expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
      });
    });

    it("rerolls quote on Grand Revelation screen without losing persona archetype", async () => {
      renderBoothApp();

      // Navigate to Career persona
      fireEvent.click(await screen.findByTitle(/Kartu Karier & Kepemimpinan/i));
      await screen.findByText(/The Foundation Builder/i);

      // Reroll quote
      const rerollBtn = screen.getByRole("button", { name: /Tarik Refleksi Baru/i });
      fireEvent.click(rerollBtn);

      // Archetype remains stable
      expect(screen.getByText(/NO. 01 — CAREER & FOUNDATION/i)).toBeInTheDocument();
      expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
    });

    it("persists muted sound state through all transitions", async () => {
      renderBoothApp();

      // Mute audio at home
      const soundBtn = await screen.findByRole("button", { name: /Matikan suara/i });
      fireEvent.click(soundBtn);
      await screen.findByRole("button", { name: /Nyalakan suara/i });

      // Navigate to Dilemma
      fireEvent.click(screen.getByRole("button", { name: /Mulai Membaca Takdir/i }));
      await screen.findByText(/Tahap 01 · Dilema Refleksi/i);

      // Sound button still shows muted in global header
      expect(screen.getByRole("button", { name: /Nyalakan suara/i })).toBeInTheDocument();

      // Choose a card to go to Revelation
      const selectButtons = screen.getAllByRole("button", { name: /Pilih Nilai Ini/i });
      fireEvent.click(selectButtons[1]!); // Creative
      await screen.findByText(/The Soul Crafter/i);

      // Still muted
      expect(screen.getByRole("button", { name: /Nyalakan suara/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // TIER 4: REAL-WORLD FLOWS & CHAOS STRESS
  // ==========================================
  describe("Tier 4: Real-World User Flows & Chaos Resilience", () => {
    it("completes full personalized photo studio keepsake export flow", async () => {
      renderBoothApp();

      // Jump to Revelation via Interactive Deck
      fireEvent.click(await screen.findByTitle(/Kartu Karier & Kepemimpinan/i));
      await screen.findByText(/The Foundation Builder/i);

      // Open Photo Studio
      fireEvent.click(screen.getByRole("button", { name: /Buat Kartu Fotomu/i }));
      await screen.findByText(/Tahap 03 · Kartu Dokumentasi Booth/i);

      // Personalize with visitor's name
      const nameInput = screen.getByLabelText(/Nama Kamu/i);
      fireEvent.change(nameInput, { target: { value: "Muhammad Budi Santoso" } });

      // Verify name reflects immediately on the Polaroid keepsake card
      await waitFor(() => {
        expect(screen.getByText("Muhammad Budi Santoso")).toBeInTheDocument();
      });

      // Trigger download
      const downloadBtn = screen.getByRole("button", { name: /Unduh Kartu \(PNG\)/i });
      fireEvent.click(downloadBtn);

      // Trigger share button
      const shareBtn = screen.getByRole("button", { name: /Salin Tautan Booth/i });
      fireEvent.click(shareBtn);

      // Feedback for share
      await waitFor(() => {
        expect(screen.getByText(/Tautan Disalin!/i)).toBeInTheDocument();
      });

      // Can navigate back to Revelation to change mind
      const backBtn = screen.getByRole("button", { name: /Kembali ke Hasil/i });
      fireEvent.click(backBtn);
      await waitFor(() => {
        expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
      });
    });

    it("resists rapid button clicking and rapid card rerolls without throwing exceptions", async () => {
      renderBoothApp();

      // Rapidly click shuffle button 10 times on Home Deck
      const shuffleBtn = await screen.findByTitle(/Kocok tumpukan kartu/i);
      for (let i = 0; i < 10; i++) {
        fireEvent.click(shuffleBtn);
      }

      // Transition to Revelation
      fireEvent.click(screen.getByTitle(/Kartu Karier & Kepemimpinan/i));
      await screen.findByText(/The Foundation Builder/i);

      // Rapidly click reroll quote 10 times
      const rerollBtn = screen.getByRole("button", { name: /Tarik Refleksi Baru/i });
      for (let i = 0; i < 10; i++) {
        fireEvent.click(rerollBtn);
      }

      // Verify page is still responsive and healthy
      expect(screen.getByText(/The Foundation Builder/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Buat Kartu Fotomu/i })).toBeEnabled();
    });

    it("handles rapid back-and-forth navigation between screens without state corruption", async () => {
      renderBoothApp();

      // Home -> Dilemma
      fireEvent.click(await screen.findByRole("button", { name: /Mulai Membaca Takdir/i }));
      await screen.findByText(/Tahap 01 · Dilema Refleksi/i);

      // Dilemma -> Back to Home
      fireEvent.click(screen.getByRole("button", { name: /Kembali/i }));
      await screen.findByText(/Siapa kamu/i);

      // Home -> Scanner
      fireEvent.click(screen.getByRole("button", { name: /Scan Kartu Kamera/i }));
      await screen.findByText(/02 · Pindai Kartu Persona/i);

      // Scanner -> Back to Dilemma
      fireEvent.click(screen.getByRole("button", { name: /Kembali/i }));
      await screen.findByText(/Tahap 01 · Dilema Refleksi/i);

      // Dilemma -> Back to Home
      fireEvent.click(screen.getByRole("button", { name: /Kembali/i }));
      await screen.findByText(/Siapa kamu/i);

      // Home Deck header logo click also triggers clean reset
      const brandLogo = screen.getByText(/SGE FILKOM UB · 2026/i).closest(".cursor-pointer");
      if (brandLogo) fireEvent.click(brandLogo);

      expect(screen.getByRole("button", { name: /Mulai Membaca Takdir/i })).toBeInTheDocument();
    });
  });
});
