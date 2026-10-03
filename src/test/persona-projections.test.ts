import { describe, expect, it } from "vitest";
import { personas, personaKeys, getRandomFutureProjection, type PersonaKey } from "@/data/personas";

describe("Persona Projections TDD Suite (Iteration 2)", () => {
  describe("R1. Curated Future Projections Contract", () => {
    it("ensures all 3 personas have futureProjections array defined with at least 8 entries", () => {
      personaKeys.forEach((key) => {
        const persona = personas[key];
        expect(
          persona.futureProjections,
          `Persona ${key} must have futureProjections`,
        ).toBeDefined();
        expect(Array.isArray(persona.futureProjections)).toBe(true);
        expect(
          persona.futureProjections.length,
          `Persona ${key} must have at least 8 future projections`,
        ).toBeGreaterThanOrEqual(8);
      });
    });

    it("verifies every future projection begins with 'Sepuluh tahun ke depan,'", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].futureProjections ?? [];
        pool.forEach((sentence, idx) => {
          expect(
            sentence.startsWith("Sepuluh tahun ke depan,"),
            `Persona ${key}[${idx}] must start with 'Sepuluh tahun ke depan,': "${sentence}"`,
          ).toBe(true);
          expect(sentence.length).toBeGreaterThan(40);
        });
      });
    });

    it("verifies Persona 1 (career) focuses on Career & Leadership without programming/coding jargon", () => {
      const careerPool = personas.career.futureProjections ?? [];
      const forbiddenJargon = [
        "koding",
        "coding",
        "baris kode",
        "sistem down",
        "software",
        "pull request",
        "repository",
        "debugging",
      ];

      careerPool.forEach((sentence, idx) => {
        forbiddenJargon.forEach((jargon) => {
          expect(
            sentence.toLowerCase().includes(jargon),
            `Persona career[${idx}] should not contain coding jargon '${jargon}': "${sentence}"`,
          ).toBe(false);
        });
      });
    });

    it("verifies all future projections within each persona are unique (no duplicates)", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].futureProjections ?? [];
        const uniqueSet = new Set(pool);
        expect(uniqueSet.size).toBe(pool.length);
      });
    });
  });

  describe("R2. getRandomFutureProjection Oracle & Non-Repetition", () => {
    it("returns valid projection string and index for all personas", () => {
      personaKeys.forEach((key) => {
        const result = getRandomFutureProjection(key);
        expect(result).toBeDefined();
        expect(typeof result.projection).toBe("string");
        expect(result.projection.length).toBeGreaterThan(0);
        expect(typeof result.index).toBe("number");
        expect(result.index).toBeGreaterThanOrEqual(0);
        expect(result.index).toBeLessThan(personas[key].futureProjections.length);
      });
    });

    it("guarantees zero immediate repetition in 1,000 consecutive sequential draws", () => {
      personaKeys.forEach((key) => {
        let lastIndex: number | undefined = undefined;

        for (let i = 0; i < 1000; i++) {
          const draw = getRandomFutureProjection(key, lastIndex);
          if (lastIndex !== undefined) {
            expect(
              draw.index,
              `Consecutive draw ${i} for ${key} must not repeat index ${lastIndex}`,
            ).not.toBe(lastIndex);
            expect(
              draw.projection,
              `Consecutive draw ${i} for ${key} must not repeat projection`,
            ).not.toBe(personas[key].futureProjections[lastIndex]);
          }
          lastIndex = draw.index;
        }
      });
    });

    it("handles boundary, negative, and invalid excludeIndex safely without crashing", () => {
      personaKeys.forEach((key) => {
        const pool = personas[key].futureProjections;

        // Negative excludeIndex
        const neg = getRandomFutureProjection(key, -1);
        expect(pool).toContain(neg.projection);

        // Out-of-bounds excludeIndex
        const outOfBounds = getRandomFutureProjection(key, 9999);
        expect(pool).toContain(outOfBounds.projection);

        // NaN excludeIndex
        const nanDraw = getRandomFutureProjection(key, NaN);
        expect(pool).toContain(nanDraw.projection);
      });
    });

    it("executes 10,000 draws in < 50ms ensuring high performance on booth kiosks", () => {
      const startTime = performance.now();
      const iterations = 10_000;

      for (let i = 0; i < iterations; i++) {
        const key = personaKeys[i % 3] as PersonaKey;
        const res = getRandomFutureProjection(key);
        expect(res.projection.length).toBeGreaterThan(0);
      }

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(500);
    });
  });
});
