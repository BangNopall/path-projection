import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";
import { TarotCard3D } from "@/components/booth/TarotCard3D";
import * as audioModule from "@/lib/audio";

describe("Brand Design System (M3): SGE 2026 Tokens & Utilities", () => {
  const stylesPath = path.resolve(process.cwd(), "src/styles.css");
  const stylesContent = fs.readFileSync(stylesPath, "utf-8");

  it("declares all 8 official SGE 2026 palette tokens in :root and @theme inline", () => {
    const requiredTokens = [
      { name: "--SGESteadyTeal", hex: "#1F6F78" },
      { name: "--SGEPacificOcean", hex: "#3A8C9A" },
      { name: "--SGECoralAqua", hex: "#57D4DD" },
      { name: "--SGEMustardGold", hex: "#F2B705" },
      { name: "--SGEBackground", hex: "#FFFAF0" },
      { name: "--SGECharcoal", hex: "#393D3F" },
      { name: "--SGEPapayaWhip", hex: "#FFEFD3" },
      { name: "--SGEPutee", hex: "#FDFDFF" },
    ];

    for (const token of requiredTokens) {
      expect(stylesContent).toContain(token.name);
      expect(stylesContent.toUpperCase()).toContain(token.hex.toUpperCase());
    }
  });

  it("declares lowercase aliases in styles.css to prevent CSS variable lookup bugs", () => {
    const requiredAliases = [
      "--sge-steady-teal",
      "--sge-pacific-ocean",
      "--sge-coral-aqua",
      "--sge-mustard-gold",
      "--sge-background",
      "--sge-charcoal",
      "--sge-papaya-whip",
      "--sge-putee",
    ];

    for (const alias of requiredAliases) {
      expect(stylesContent).toContain(alias);
    }
  });

  it("defines .circuit-pattern-bg with soft SVG circuit trace texture", () => {
    expect(stylesContent).toContain(".circuit-pattern-bg");
    expect(stylesContent).toContain("data:image/svg+xml");
  });

  it("defines .stamp-border postage-stamp perforated edging utility", () => {
    expect(stylesContent).toContain(".stamp-border");
    expect(stylesContent).toContain("dashed");
  });

  it("defines .neo-bento-card with 1px subtle border and deep teal #0F1E21 surface", () => {
    expect(stylesContent).toContain(".neo-bento-card");
    expect(stylesContent).toContain("#0F1E21");
    expect(stylesContent).toContain("rgba(255, 255, 255, 0.1)");
  });

  it("has completely eliminated garish AI glowing backgrounds and mix-blend-mode: color-dodge in styles.css", () => {
    expect(stylesContent).not.toContain("mix-blend-mode: color-dodge");
    expect(stylesContent).not.toContain("0 0 40px var(--glow-primary)");
    expect(stylesContent).not.toContain("0 0 45px var(--glow-gold)");
  });
});

describe("Brand Design System (M3): TarotCard3D Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    frontImage: "/src/assets/cards/card-front.jpg",
    backImage: "/src/assets/cards/card-career.jpg",
    altText: "The Foundation Builder",
    badge: "NO. 01 — CAREER",
    accentColor: "var(--SGEMustardGold)",
  };

  it("renders front and back images with stamp-border and accessibility attributes", () => {
    render(<TarotCard3D {...defaultProps} />);

    const frontImg = screen.getByAltText("Mascot Guess Who Are You");
    const backImg = screen.getByAltText("The Foundation Builder");

    expect(frontImg).toBeInTheDocument();
    expect(backImg).toBeInTheDocument();
    expect(screen.getByText("NO. 01 — CAREER")).toBeInTheDocument();

    const card = frontImg.closest(".tarot-card-3d");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("stamp-border");
  });

  it("triggers audio on pointer enter when sound is enabled", () => {
    const playAudioSpy = vi.spyOn(audioModule, "playAudioTone").mockImplementation(() => {});

    render(<TarotCard3D {...defaultProps} soundEnabled={true} />);
    const container = screen
      .getByAltText("Mascot Guess Who Are You")
      .closest(".perspective-container");
    expect(container).toBeInTheDocument();

    fireEvent.pointerEnter(container!);
    expect(playAudioSpy).toHaveBeenCalledWith("hover", true);
  });

  it("does not play audio on pointer enter when sound is disabled", () => {
    const playAudioSpy = vi.spyOn(audioModule, "playAudioTone").mockImplementation(() => {});

    render(<TarotCard3D {...defaultProps} soundEnabled={false} />);
    const container = screen
      .getByAltText("Mascot Guess Who Are You")
      .closest(".perspective-container");

    fireEvent.pointerEnter(container!);
    expect(playAudioSpy).toHaveBeenCalledWith("hover", false);
  });

  it("handles pointer move and pointer leave tilt lifecycle cleanly", () => {
    render(<TarotCard3D {...defaultProps} />);
    const container = screen
      .getByAltText("Mascot Guess Who Are You")
      .closest(".perspective-container");
    const card = screen.getByAltText("Mascot Guess Who Are You").closest(".tarot-card-3d");

    // Mock bounding rect
    if (card) {
      vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
        left: 100,
        top: 100,
        width: 300,
        height: 400,
        right: 400,
        bottom: 500,
        x: 100,
        y: 100,
        toJSON: () => {},
      });
    }

    fireEvent.pointerMove(container!, { clientX: 200, clientY: 250 });
    fireEvent.pointerLeave(container!);
  });

  it("handles touch move and touch end without throwing", () => {
    render(<TarotCard3D {...defaultProps} />);
    const container = screen
      .getByAltText("Mascot Guess Who Are You")
      .closest(".perspective-container");
    const card = screen.getByAltText("Mascot Guess Who Are You").closest(".tarot-card-3d");

    if (card) {
      vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 300,
        height: 400,
        right: 300,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
    }

    fireEvent.touchStart(container!, {
      touches: [{ clientX: 150, clientY: 200 }],
    });
    fireEvent.touchMove(container!, {
      touches: [{ clientX: 180, clientY: 220 }],
    });
    fireEvent.touchEnd(container!);
  });

  it("triggers keyboard enter and space clicks when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<TarotCard3D {...defaultProps} onClick={handleClick} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("renders with isFlipped={true} displaying back artwork properly", () => {
    render(<TarotCard3D {...defaultProps} isFlipped={true} />);
    const backImg = screen.getByAltText("The Foundation Builder");
    expect(backImg).toBeInTheDocument();
  });
});
