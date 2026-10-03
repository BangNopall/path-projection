import { describe, expect, it } from "vitest";
import { personas, personaKeys, getRandomQuote, type PersonaKey } from "@/data/personas";

describe("Tier 1 & Tier 2: Persona Data Integrity & Archetype Invariants", () => {
  it("defines exactly three canonical personas: career, creative, adventure", () => {
    expect(personaKeys).toEqual(["career", "creative", "adventure"]);
    expect(Object.keys(personas).sort()).toEqual(["adventure", "career", "creative"]);
  });

  it("contains complete metadata for each persona (labels, icons, colors, numbers)", () => {
    const expectedNumbers: Record<PersonaKey, string> = {
      career: "01",
      creative: "02",
      adventure: "03",
    };

    const expectedIcons: Record<PersonaKey, string> = {
      career: "💼",
      creative: "🎨",
      adventure: "🌎",
    };

    personaKeys.forEach((key) => {
      const p = personas[key];
      expect(p.key).toBe(key);
      expect(p.number).toBe(expectedNumbers[key]);
      expect(p.icon).toBe(expectedIcons[key]);
      expect(p.title).toBeTruthy();
      expect(p.subtitle).toBeTruthy();
      expect(p.short).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.accentColor).toBeTruthy();
      expect(p.glowColor).toBeTruthy();
      expect(p.image).toBeTruthy();
      expect(p.frontImage).toBeTruthy();
    });
  });

  it("each persona contains an extensive pool of quotes (>= 15) and #SGE2026 tag", () => {
    personaKeys.forEach((key) => {
      const p = personas[key];
      expect(p.quotes.length).toBeGreaterThanOrEqual(15);
      expect(p.tags).toContain("#SGE2026");

      // Verify every quote is a meaningful sentence
      p.quotes.forEach((quote) => {
        expect(typeof quote).toBe("string");
        expect(quote.trim().length).toBeGreaterThan(20);
      });
    });
  });

  it("ensures zero duplicate quotes across all persona collections (global uniqueness)", () => {
    const allQuotes: string[] = [];
    personaKeys.forEach((key) => {
      personas[key].quotes.forEach((quote) => {
        allQuotes.push(quote.trim());
      });
    });

    const uniqueQuotes = new Set(allQuotes);
    expect(uniqueQuotes.size).toBe(allQuotes.length);
  });

  describe("getRandomQuote logic and boundary conditions", () => {
    it("returns quotes belonging to the requested persona pool", () => {
      personaKeys.forEach((key) => {
        const quote = getRandomQuote(key);
        expect(personas[key].quotes).toContain(quote);
      });
    });

    it("respects excludeIndex to avoid immediate repetition when pool has multiple quotes", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].quotes;
        for (let i = 0; i < Math.min(pool.length, 5); i++) {
          const selected = getRandomQuote(key, i);
          expect(selected).not.toBe(pool[i]);
          expect(pool).toContain(selected);
        }
      });
    });

    it("handles non-existent or invalid persona keys safely without crashing", () => {
      // @ts-expect-error testing invalid key boundary
      const invalidQuote = getRandomQuote("non_existent_key");
      expect(invalidQuote).toBe("");
    });
  });
});
