import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CinematicReveal } from "@/components/booth/reveal/CinematicReveal";
import { personas } from "@/data/personas";

describe("CinematicReveal Component Contract & Visual Choreography", () => {
  const dummyProjection = "Sepuluh tahun ke depan, kamu membangun fondasi kokoh.";
  const dummyReflection = "Langkah pertamamu hari ini menentukan langkah besarmu esok.";

  const defaultProps = {
    persona: personas.career,
    currentProjection: dummyProjection,
    currentReflection: dummyReflection,
    soundEnabled: false,
    onSelectOtherCard: vi.fn(),
    onResetToHome: vi.fn(),
    onComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("satisfies all 6 mandatory test contracts & data-testids", () => {
    render(<CinematicReveal {...defaultProps} />);

    // 1. motion-graph-3d-container
    expect(screen.getByTestId("motion-graph-3d-container")).toBeInTheDocument();

    // 2. motion-graph-node (8 constellation nodes)
    const nodes = screen.getAllByTestId("motion-graph-node");
    expect(nodes.length).toBe(8);

    // 3. reveal-card-container
    expect(screen.getByTestId("reveal-card-container")).toBeInTheDocument();

    // 4. reveal-card-glow
    expect(screen.getByTestId("reveal-card-glow")).toBeInTheDocument();

    // 5. reveal-letter-roll
    expect(screen.getByTestId("reveal-letter-roll")).toBeInTheDocument();

    // 6. destiny-reflection-narrative
    expect(screen.getByTestId("destiny-reflection-narrative")).toBeInTheDocument();
  });

  it("strictly omits 'Tarik Refleksi Baru' button to satisfy e2e contract", () => {
    render(<CinematicReveal {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /Tarik Refleksi Baru/i })).not.toBeInTheDocument();
  });

  it("handles skip animation interaction cleanly", () => {
    render(<CinematicReveal {...defaultProps} />);
    const skipBtn = screen.getByRole("button", { name: /Lewati Animasi/i });
    expect(skipBtn).toBeInTheDocument();

    fireEvent.click(skipBtn);
    // After skip, skip button exits from the view
    expect(screen.queryByRole("button", { name: /Lewati Animasi/i })).not.toBeInTheDocument();
  });

  it("renders dual action buttons and triggers callbacks", () => {
    render(<CinematicReveal {...defaultProps} />);

    const otherCardBtn = screen.getByRole("button", { name: /Pilih Kartu Lain/i });
    const resetBtn = screen.getByRole("button", { name: /Kembali ke Awal/i });

    expect(otherCardBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(otherCardBtn);
    expect(defaultProps.onSelectOtherCard).toHaveBeenCalledTimes(1);

    fireEvent.click(resetBtn);
    expect(defaultProps.onResetToHome).toHaveBeenCalledTimes(1);
  });

  it("renders bespoke persona signatures for all 3 personas without errors", () => {
    const { unmount: unmountCareer } = render(
      <CinematicReveal {...defaultProps} persona={personas.career} />,
    );
    expect(screen.getByText(/NO\. 01 — CAREER & FOUNDATION/i)).toBeInTheDocument();
    unmountCareer();

    const { unmount: unmountCreative } = render(
      <CinematicReveal {...defaultProps} persona={personas.creative} />,
    );
    expect(screen.getByText(/NO\. 02 — CREATIVE & SOUL/i)).toBeInTheDocument();
    unmountCreative();

    const { unmount: unmountAdventure } = render(
      <CinematicReveal {...defaultProps} persona={personas.adventure} />,
    );
    expect(screen.getByText(/NO\. 03 — ADVENTURE & HORIZON/i)).toBeInTheDocument();
    unmountAdventure();
  });
});
