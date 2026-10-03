import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  KineticSentenceReveal,
  type KineticSentenceRevealProps,
} from "@/components/booth/KineticSentenceReveal";

describe("KineticSentenceReveal Component", () => {
  describe("1. Word Tokenization & DOM Rendering", () => {
    it("splits sentence into discrete word elements preserving attached punctuation", () => {
      const sentence = "Karier bukan perlombaan, tapi maraton nilai.";
      render(<KineticSentenceReveal sentence={sentence} />);

      const words = screen.getAllByTestId("kinetic-word");
      expect(words).toHaveLength(6);

      const wordTexts = words.map((el) => el.textContent);
      expect(wordTexts).toEqual(["Karier", "bukan", "perlombaan,", "tapi", "maraton", "nilai."]);

      // Confirm punctuation preservation
      expect(wordTexts[2]).toBe("perlombaan,");
      expect(wordTexts[5]).toBe("nilai.");
    });

    it("preserves spaces between words in textContent for screen readers and DOM queries", () => {
      const sentence = "Karier bukan perlombaan, tapi maraton nilai.";
      render(<KineticSentenceReveal sentence={sentence} />);

      const sentenceEl = screen.getByTestId("kinetic-sentence");
      expect(sentenceEl.textContent).toBe(sentence);
    });

    it("handles sentences with multiple irregular spaces and newlines cleanly", () => {
      const sentence = "  Teknologi   adalah   alat, \n  manusia adalah jiwa.  ";
      render(<KineticSentenceReveal sentence={sentence} />);

      const words = screen.getAllByTestId("kinetic-word");
      expect(words).toHaveLength(6);
      expect(words.map((w) => w.textContent)).toEqual([
        "Teknologi",
        "adalah",
        "alat,",
        "manusia",
        "adalah",
        "jiwa.",
      ]);
    });

    it("handles single-word sentences and empty strings gracefully without throwing", () => {
      const { rerender } = render(<KineticSentenceReveal sentence="" />);
      expect(screen.queryAllByTestId("kinetic-word")).toHaveLength(0);

      rerender(<KineticSentenceReveal sentence="Inspirasi!" />);
      const words = screen.getAllByTestId("kinetic-word");
      expect(words).toHaveLength(1);
      expect(words[0]!.textContent).toBe("Inspirasi!");
    });
  });

  describe("2. Animation Transition Styles & Classes", () => {
    it("configures word variants with filter blur(8px)->blur(0px), opacity 0->1, and vertical translation with spring", () => {
      const wordVariants = KineticSentenceReveal.wordVariants;
      expect(wordVariants).toBeDefined();

      const hidden = wordVariants["hidden"] as {
        filter: string;
        opacity: number;
        y: number;
        translateY?: number;
      };
      const visible = wordVariants["visible"] as {
        filter: string;
        opacity: number;
        y: number;
        translateY?: number;
        transition: { type: string; stiffness: number; damping: number };
      };

      expect(hidden.filter).toBe("blur(8px)");
      expect(hidden.opacity).toBe(0);
      expect(hidden.y).toBe(8);
      expect(hidden.translateY).toBe(8);

      expect(visible.filter).toBe("blur(0px)");
      expect(visible.opacity).toBe(1);
      expect(visible.y).toBe(0);
      expect(visible.translateY).toBe(0);
      expect(visible.transition.type).toBe("spring");
    });

    it("configures container stagger delay in the ~40-50ms range per word", () => {
      const containerVariants = KineticSentenceReveal.containerVariants;
      expect(containerVariants).toBeDefined();

      const visible = containerVariants["visible"] as {
        transition: { staggerChildren: number };
      };
      expect(visible.transition.staggerChildren).toBeGreaterThanOrEqual(0.04);
      expect(visible.transition.staggerChildren).toBeLessThanOrEqual(0.05);
    });

    it("applies personaAccentColor to the card left accent border", () => {
      render(<KineticSentenceReveal sentence="Test aksen warna" personaAccentColor="#57D4DD" />);

      const card = screen.getByTestId("kinetic-reveal-card");
      expect(card).toHaveStyle({ borderLeftColor: "#57D4DD" });
    });

    it("applies custom className to the card wrapper", () => {
      render(
        <KineticSentenceReveal sentence="Test custom class" className="custom-bento-reveal-box" />,
      );

      const card = screen.getByTestId("kinetic-reveal-card");
      expect(card).toHaveClass("custom-bento-reveal-box");
    });
  });

  describe("3. Golden Sweep Trigger Upon Sentence Completion", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not render golden sweep initially, but triggers it upon sentence completion with required gradient", () => {
      render(<KineticSentenceReveal sentence="Refleksi singkat takdir." />);

      // Initially, golden sweep is not present
      expect(screen.queryByTestId("golden-sweep")).not.toBeInTheDocument();
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe(
        "false",
      );

      // Advance timers to trigger completion
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Golden sweep is now rendered
      const sweep = screen.getByTestId("golden-sweep");
      expect(sweep).toBeInTheDocument();
      expect(sweep).toHaveStyle({
        background:
          "linear-gradient(105deg, transparent 20%, rgba(242, 183, 5, 0.45) 50%, transparent 80%)",
      });

      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe("true");
      expect(screen.getByTestId("completion-badge")).toBeInTheDocument();
    });

    it("calls onComplete callback when sentence animation finishes", () => {
      const onComplete = vi.fn();
      render(
        <KineticSentenceReveal sentence="Refleksi dengan callback." onComplete={onComplete} />,
      );

      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("4. 'Tarik Refleksi Baru' Button & onReroll Handler", () => {
    it("renders interactive button with Shuffle icon and 'Tarik Refleksi Baru' text", () => {
      render(<KineticSentenceReveal sentence="Kutipan uji coba." />);

      const button = screen.getByTestId("reroll-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Tarik Refleksi Baru");

      const icon = screen.getByTestId("shuffle-icon");
      expect(icon).toBeInTheDocument();
    });

    it("calls onReroll handler when clicked", () => {
      const onReroll = vi.fn();
      render(<KineticSentenceReveal sentence="Kutipan uji coba." onReroll={onReroll} />);

      const button = screen.getByTestId("reroll-button");
      fireEvent.click(button);
      expect(onReroll).toHaveBeenCalledTimes(1);

      fireEvent.click(button);
      expect(onReroll).toHaveBeenCalledTimes(2);
    });

    it("disables button, spins icon, and prevents onReroll invocation when isRerolling is true", () => {
      const onReroll = vi.fn();
      render(
        <KineticSentenceReveal
          sentence="Kutipan uji coba."
          onReroll={onReroll}
          isRerolling={true}
        />,
      );

      const button = screen.getByTestId("reroll-button");
      expect(button).toBeDisabled();
      expect(button.getAttribute("aria-busy")).toBe("true");

      const icon = screen.getByTestId("shuffle-icon");
      expect(icon).toHaveClass("animate-spin");

      fireEvent.click(button);
      expect(onReroll).not.toHaveBeenCalled();
    });

    it("tolerates undefined onReroll safely when clicked", () => {
      render(<KineticSentenceReveal sentence="Kutipan tanpa onReroll." />);
      const button = screen.getByTestId("reroll-button");
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe("5. Clean Re-Animation upon Prop Change", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("resets golden sweep and animates fresh words when sentence prop changes", () => {
      const { rerender } = render(
        <KineticSentenceReveal sentence="Langkah pertama adalah keberanian." />,
      );

      // Advance to complete first sentence
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(screen.getByTestId("golden-sweep")).toBeInTheDocument();
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe("true");

      // Rerender with completely new sentence
      rerender(<KineticSentenceReveal sentence="Masa depan dibangun hari ini." />);

      // Immediately upon sentence change, golden sweep must be reset/removed
      expect(screen.queryByTestId("golden-sweep")).not.toBeInTheDocument();
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe(
        "false",
      );

      // Verify DOM now has the new tokens
      const words = screen.getAllByTestId("kinetic-word");
      expect(words.map((w) => w.textContent)).toEqual([
        "Masa",
        "depan",
        "dibangun",
        "hari",
        "ini.",
      ]);

      // Old words should no longer be in the sentence
      expect(screen.queryByText("keberanian.")).not.toBeInTheDocument();

      // Advance timers to complete new sentence
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Golden sweep triggers for the new sentence
      expect(screen.getByTestId("golden-sweep")).toBeInTheDocument();
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe("true");
    });

    it("resets completion status when isRerolling transitions to true, and restarts upon false", () => {
      const props: KineticSentenceRevealProps = {
        sentence: "Kutipan stabil.",
        isRerolling: false,
      };

      const { rerender } = render(<KineticSentenceReveal {...props} />);

      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(screen.getByTestId("golden-sweep")).toBeInTheDocument();

      // Trigger isRerolling = true
      rerender(<KineticSentenceReveal {...props} isRerolling={true} />);

      // Golden sweep should be removed during reroll
      expect(screen.queryByTestId("golden-sweep")).not.toBeInTheDocument();
      expect(screen.getByTestId("kinetic-reveal-card").getAttribute("data-completed")).toBe(
        "false",
      );

      // Timers advance while isRerolling - should NOT trigger sweep
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(screen.queryByTestId("golden-sweep")).not.toBeInTheDocument();

      // Finish reroll with new sentence
      rerender(
        <KineticSentenceReveal sentence="Kutipan baru setelah reroll." isRerolling={false} />,
      );

      // Advance timers for new sentence completion
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(screen.getByTestId("golden-sweep")).toBeInTheDocument();
    });
  });
});
