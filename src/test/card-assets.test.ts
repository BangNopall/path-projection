import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import cardFrontImg from "@/assets/cards/card-front.jpg";
import cardCareerImg from "@/assets/cards/card-career.jpg";
import cardCreativeImg from "@/assets/cards/card-creative.jpg";
import cardAdventureImg from "@/assets/cards/card-adventure.jpg";
import { personas, personaKeys } from "@/data/personas";

describe("Card Asset Pipeline & Integrity", () => {
  const cardsDir = path.resolve(__dirname, "../assets/cards");

  const expectedCards = [
    { filename: "card-front.jpg", minSize: 200_000, role: "Front Mascot" },
    { filename: "card-career.jpg", minSize: 200_000, role: "Career Card" },
    { filename: "card-creative.jpg", minSize: 200_000, role: "Creative Card" },
    { filename: "card-adventure.jpg", minSize: 200_000, role: "Adventure Card" },
  ];

  it("ensures all 4 physical card files exist on disk with valid sizes (>200KB)", () => {
    expectedCards.forEach(({ filename, minSize }) => {
      const filePath = path.join(cardsDir, filename);
      expect(fs.existsSync(filePath), `Missing asset file on disk: ${filename}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThanOrEqual(minSize);
    });
  });

  it("verifies card files start with JPEG magic bytes (FF D8 FF)", () => {
    expectedCards.forEach(({ filename }) => {
      const filePath = path.join(cardsDir, filename);
      const buffer = fs.readFileSync(filePath);
      expect(buffer[0]).toBe(0xff);
      expect(buffer[1]).toBe(0xd8);
      expect(buffer[2]).toBe(0xff);
    });
  });

  it("resolves all card assets via Vite ESM to valid non-empty string URLs", () => {
    const importedAssets = [
      { name: "cardFrontImg", val: cardFrontImg },
      { name: "cardCareerImg", val: cardCareerImg },
      { name: "cardCreativeImg", val: cardCreativeImg },
      { name: "cardAdventureImg", val: cardAdventureImg },
    ];

    importedAssets.forEach(({ name, val }) => {
      expect(val, `${name} should be truthy`).toBeTruthy();
      expect(typeof val, `${name} should be a string`).toBe("string");
      expect(val.length).toBeGreaterThan(0);
    });
  });

  it("binds persona image and frontImage to direct ESM imports", () => {
    expect(personas.career.image).toBe(cardCareerImg);
    expect(personas.creative.image).toBe(cardCreativeImg);
    expect(personas.adventure.image).toBe(cardAdventureImg);

    expect(personas.career.frontImage).toBe(cardFrontImg);
    expect(personas.creative.frontImage).toBe(cardFrontImg);
    expect(personas.adventure.frontImage).toBe(cardFrontImg);
  });

  it("guarantees elimination of broken Lovable proxy CDN URLs (__l5e)", () => {
    personaKeys.forEach((key) => {
      const persona = personas[key];
      expect(persona.image).not.toContain("__l5e");
      expect(persona.image).not.toContain("assets-v1");
      expect(persona.image).not.toContain(".asset.json");

      expect(persona.frontImage).not.toContain("__l5e");
      expect(persona.frontImage).not.toContain("assets-v1");
      expect(persona.frontImage).not.toContain(".asset.json");
    });
  });

  it("ensures frontImage is identical across all personas and image is distinct per persona", () => {
    const frontImages = new Set(personaKeys.map((key) => personas[key].frontImage));
    expect(frontImages.size).toBe(1);

    const backImages = new Set(personaKeys.map((key) => personas[key].image));
    expect(backImages.size).toBe(3);
  });

  it("validates standard CSS variable names for accentColor across all personas", () => {
    expect(personas.career.accentColor).toBe("var(--SGEMustardGold)");
    expect(personas.creative.accentColor).toBe("var(--SGECoralAqua)");
    expect(personas.adventure.accentColor).toBe("var(--SGEPacificOcean)");
  });
});
