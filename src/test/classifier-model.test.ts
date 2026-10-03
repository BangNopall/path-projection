import { describe, expect, it } from "vitest";
import { classifyLabel } from "@/lib/classifier";

describe("Teachable Machine Label Classifier", () => {
  it("accurately classifies career-related labels", () => {
    const inputs = [
      "career",
      "Career",
      "KARIER",
      "karier",
      "tech",
      "Teknologi",
      "briefcase",
      "1",
      "Class 1",
      "💼",
    ];
    inputs.forEach((input) => {
      expect(classifyLabel(input)).toBe("career");
    });
  });

  it("accurately classifies creative-related labels", () => {
    const inputs = [
      "creative",
      "Creative",
      "kreatif",
      "KREATIVITAS",
      "design",
      "Desain",
      "art",
      "palette",
      "2",
      "Class 2",
      "🎨",
    ];
    inputs.forEach((input) => {
      expect(classifyLabel(input)).toBe("creative");
    });
  });

  it("accurately classifies adventure-related labels", () => {
    const inputs = [
      "adventure",
      "Adventure",
      "petualangan",
      "PETUALANGAN",
      "impact",
      "Dampak",
      "global",
      "world",
      "earth",
      "globe",
      "bumi",
      "3",
      "Class 3",
      "🌎",
    ];
    inputs.forEach((input) => {
      expect(classifyLabel(input)).toBe("adventure");
    });
  });

  it("returns null for unknown, background, or noise classes", () => {
    const unknownInputs = [
      "background",
      "empty",
      "noise",
      "meja",
      "tangan",
      "",
      "   ",
      "random 99",
    ];
    unknownInputs.forEach((input) => {
      expect(classifyLabel(input)).toBeNull();
    });
  });
});
