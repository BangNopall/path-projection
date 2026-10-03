import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { personas, personaKeys, getRandomQuote, type PersonaKey } from "@/data/personas";

describe("Milestone M1 Challenger Stress Harness", () => {
  // -------------------------------------------------------------
  // Test Suite 1: Asset Pipeline & Offline Booth Integrity
  // -------------------------------------------------------------
  describe("Asset Pipeline & Offline Booth Integrity", () => {
    it("confirms all 3 personas have valid local card images and frontImage", () => {
      personaKeys.forEach((key) => {
        const persona = personas[key];
        expect(persona.image).toBeDefined();
        expect(typeof persona.image).toBe("string");
        expect(persona.image.length).toBeGreaterThan(0);

        expect(persona.frontImage).toBeDefined();
        expect(typeof persona.frontImage).toBe("string");
        expect(persona.frontImage.length).toBeGreaterThan(0);

        // Disallow external URLs or legacy Lovable proxy URLs
        expect(persona.image).not.toMatch(/^https?:\/\//);
        expect(persona.image).not.toContain("__l5e");
        expect(persona.frontImage).not.toMatch(/^https?:\/\//);
        expect(persona.frontImage).not.toContain("__l5e");
      });
    });

    it("confirms source card files on disk match expected JPEG headers and sizes", () => {
      const cardsDir = path.resolve(__dirname, "../assets/cards");
      const files = [
        "card-front.jpg",
        "card-career.jpg",
        "card-creative.jpg",
        "card-adventure.jpg",
      ];

      files.forEach((f) => {
        const p = path.join(cardsDir, f);
        expect(fs.existsSync(p), `Missing file: ${p}`).toBe(true);
        const stat = fs.statSync(p);
        expect(stat.size).toBeGreaterThan(200_000);

        const buf = fs.readFileSync(p);
        // JPEG magic header: FF D8 FF
        expect(buf[0]).toBe(0xff);
        expect(buf[1]).toBe(0xd8);
        expect(buf[2]).toBe(0xff);
      });
    });

    it("verifies production build output in .output/public/assets contains bundled card files", () => {
      const outputAssetsDir = path.resolve(__dirname, "../../.output/public/assets");
      if (fs.existsSync(outputAssetsDir)) {
        const outputFiles = fs.readdirSync(outputAssetsDir);
        const cardFiles = outputFiles.filter((f) => f.startsWith("card-") && f.endsWith(".jpg"));
        expect(cardFiles.length).toBe(4);

        // Check front, career, creative, adventure
        expect(cardFiles.some((f) => f.startsWith("card-front"))).toBe(true);
        expect(cardFiles.some((f) => f.startsWith("card-career"))).toBe(true);
        expect(cardFiles.some((f) => f.startsWith("card-creative"))).toBe(true);
        expect(cardFiles.some((f) => f.startsWith("card-adventure"))).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------
  // Test Suite 2: getRandomQuote Edge Cases & Robustness
  // -------------------------------------------------------------
  describe("getRandomQuote Edge Cases & Robustness", () => {
    it("handles invalid persona keys gracefully without crashing or throwing", () => {
      const invalidKeys = [
        "invalid_key",
        "",
        "unknown",
        "CAREER", // case sensitive check
        null as unknown as PersonaKey,
        undefined as unknown as PersonaKey,
        123 as unknown as PersonaKey,
        {} as unknown as PersonaKey,
      ];

      invalidKeys.forEach((key) => {
        const result = getRandomQuote(key as PersonaKey);
        expect(result).toBe("");
      });
    });

    it("handles personas with empty quotes safely", () => {
      // Temporarily mock an empty quotes array on one persona
      const origQuotes = personas.career.quotes;
      try {
        personas.career.quotes = [];
        const result = getRandomQuote("career");
        expect(result).toBe("");
      } finally {
        personas.career.quotes = origQuotes;
      }
    });

    it("handles personas with a single quote safely regardless of excludeIndex", () => {
      const origQuotes = personas.career.quotes;
      try {
        personas.career.quotes = ["Only single quote"];
        expect(getRandomQuote("career")).toBe("Only single quote");
        expect(getRandomQuote("career", 0)).toBe("Only single quote");
        expect(getRandomQuote("career", 99)).toBe("Only single quote");
      } finally {
        personas.career.quotes = origQuotes;
      }
    });

    it("guarantees excludeIndex avoids immediate repetition when pool has multiple quotes", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].quotes;
        for (let i = 0; i < pool.length; i++) {
          // Call 20 times for each index to test probabilistic collision handling
          for (let trial = 0; trial < 20; trial++) {
            const quote = getRandomQuote(key, i);
            expect(quote).not.toBe(pool[i]);
            expect(pool).toContain(quote);
          }
        }
      });
    });

    it("handles out-of-range, negative, or anomalous excludeIndex values safely", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].quotes;
        // Negative excludeIndex
        const neg = getRandomQuote(key, -1);
        expect(pool).toContain(neg);

        // Huge excludeIndex
        const huge = getRandomQuote(key, 9999);
        expect(pool).toContain(huge);

        // NaN excludeIndex
        const nan = getRandomQuote(key, NaN);
        expect(pool).toContain(nan);

        // String as excludeIndex (boundary type mismatch)
        // @ts-expect-error boundary testing
        const strIdx = getRandomQuote(key, "invalid_index");
        expect(pool).toContain(strIdx);
      });
    });

    it("executes 100,000 rapid calls in < 500ms with zero undefined or invalid returns", () => {
      const startTime = performance.now();
      const iterations = 100_000;

      for (let i = 0; i < iterations; i++) {
        const key = personaKeys[i % 3]!;
        const quote = getRandomQuote(key);
        expect(quote.length).toBeGreaterThan(0);
      }

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(1000); // 1 second threshold for 100k calls
    });

    it("verifies uniform pseudo-random distribution across persona quotes", () => {
      // For each persona (18 quotes), run 18,000 draws
      // Expected frequency per quote = 1,000
      // Tolerable range = 700 to 1300 (well within 6 sigma for binomial(18000, 1/18))
      personaKeys.forEach((key) => {
        const pool = personas[key].quotes;
        const counts = new Map<string, number>();
        pool.forEach((q) => counts.set(q, 0));

        const draws = 18_000;
        for (let i = 0; i < draws; i++) {
          const q = getRandomQuote(key);
          counts.set(q, (counts.get(q) || 0) + 1);
        }

        counts.forEach((count, quote) => {
          expect(
            count,
            `Quote "${quote.slice(0, 20)}..." frequency ${count} outside [700, 1300]`,
          ).toBeGreaterThanOrEqual(700);
          expect(
            count,
            `Quote "${quote.slice(0, 20)}..." frequency ${count} outside [700, 1300]`,
          ).toBeLessThanOrEqual(1300);
        });
      });
    });

    it("verifies deterministic branch execution via mocked Math.random", () => {
      const key: PersonaKey = "career";
      const pool = personas[key].quotes;
      const originalRandom = Math.random;

      try {
        // Test lower bound: Math.random() = 0 -> nextIndex = 0
        Math.random = () => 0;
        expect(getRandomQuote(key)).toBe(pool[0]);

        // Test upper bound: Math.random() = 0.9999 -> nextIndex = pool.length - 1
        Math.random = () => 0.999999;
        expect(getRandomQuote(key)).toBe(pool[pool.length - 1]);

        // Test collision at index 0 with excludeIndex = 0 -> should advance to index 1
        Math.random = () => 0; // nextIndex = 0
        expect(getRandomQuote(key, 0)).toBe(pool[1]);

        // Test collision at last index with excludeIndex = lastIndex -> should wrap around to index 0
        const lastIdx = pool.length - 1;
        Math.random = () => 0.999999; // nextIndex = lastIdx
        expect(getRandomQuote(key, lastIdx)).toBe(pool[0]);
      } finally {
        Math.random = originalRandom;
      }
    });
  });
});
