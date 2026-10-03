import { describe, expect, it } from "vitest";
import { personas, personaKeys, getRandomQuote, type PersonaKey } from "@/data/personas";

describe("Persona Content & Quotes Integrity", () => {
  it("contains all three required personas: career, creative, and adventure", () => {
    expect(personaKeys).toEqual(["career", "creative", "adventure"]);
    personaKeys.forEach((key) => {
      expect(personas[key]).toBeDefined();
      expect(personas[key].number).toMatch(/0[1-3]/);
      expect(personas[key].title).toBeTruthy();
      expect(personas[key].short).toBeTruthy();
      expect(personas[key].icon).toBeTruthy();
      expect(personas[key].tags.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("provides at least 18 reflection quotes per persona", () => {
    personaKeys.forEach((key) => {
      expect(personas[key].quotes.length).toBeGreaterThanOrEqual(18);
    });
  });

  it("ensures all quotes are unique and non-empty across all categories", () => {
    const allQuotes: string[] = [];
    personaKeys.forEach((key) => {
      const set = new Set(personas[key].quotes);
      expect(set.size).toBe(personas[key].quotes.length);
      personas[key].quotes.forEach((q) => {
        expect(q.trim().length).toBeGreaterThanOrEqual(30);
        allQuotes.push(q.trim());
      });
    });
    const uniqueAll = new Set(allQuotes);
    expect(uniqueAll.size).toBe(allQuotes.length);
  });

  it("does not start with repetitive AI formula patterns (e.g. 'Sepuluh tahun ke depan, kamu...')", () => {
    const aiFormulaPatterns = [
      /^Sepuluh tahun ke depan,\s*kamu adalah/i,
      /^Sepuluh tahun ke depan,\s*kamu akan/i,
      /^Sepuluh tahun ke depan,\s*namamu/i,
      /^Sepuluh tahun ke depan,\s*langkahmu/i,
    ];

    personaKeys.forEach((key) => {
      personas[key].quotes.forEach((quote) => {
        aiFormulaPatterns.forEach((pattern) => {
          expect(quote).not.toMatch(pattern);
        });
      });
    });
  });

  it("does not contain narrow technical computer jargon in reflection quotes", () => {
    const forbiddenJargon = [
      /\bbug\b/i,
      /\bsyntax\b/i,
      /\balgoritma\b/i,
      /\bbackend\b/i,
      /\bcoding\b/i,
      /baris kode/i,
      /semester depan/i,
    ];

    personaKeys.forEach((key) => {
      personas[key].quotes.forEach((quote) => {
        forbiddenJargon.forEach((pattern) => {
          expect(pattern.test(quote)).toBe(false);
        });
      });
    });
  });

  it("picks random quotes reliably without out-of-bound errors", () => {
    personaKeys.forEach((key) => {
      for (let i = 0; i < 20; i++) {
        const quote = getRandomQuote(key);
        expect(personas[key].quotes).toContain(quote);
      }
    });
  });
});
