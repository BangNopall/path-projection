# Asset Pipeline & Persona Data Architectural Report

**Explorer**: Explorer 2 (Asset Pipeline Explorer)  
**Date**: 2026-10-02  
**Target Application**: PKKMB FILKOM UB — SGE 2026 Booth Game ("Guess Who Are You")  
**Project Path**: `/Users/noxval/_PROJECT_/path-projection`

---

## Executive Summary

This report establishes the technical blueprint for migrating the 4 authentic physical card assets into the local repository pipeline, replacing broken Lovable CDN proxy dependencies (`/__l5e/...`), and establishing a robust Vite ESM asset resolution mechanism backed by an automated Vitest asset integrity test suite.

All 4 user-uploaded card images were inspected and verified on the local filesystem. They are high-resolution 724×1024 JPEG images (~275 KB – 307 KB) with an exact 1:1.414 aspect ratio that matches the physical booth tarot cards and the application's `aspect-[768/1086]` card viewport.

Currently, the target directory `src/assets/cards/` does not exist, and `src/data/personas.ts` imports 4 Lovable proxy JSON metadata files (`*.webp.asset.json`) which contain `/__l5e/assets-v1/...` URLs. In standalone development, SSR, and production builds, these URLs fail (404 / connection error) and break DOM canvas export via `html-to-image` in `KeepsakePhotoCard`.

---

## 1. Verification of User-Uploaded High-Resolution Card Images

The 4 source image files uploaded by the user were inspected using system utilities (`file`, `ls -lh`, `sips`, `python3`, `shasum -a 256`):

| Card Role                 | Source File Path                                                                                                      | Size (Bytes / KB)        | Dimensions    | Format                      | SHA-256 Checksum                                                   | Target Destination in Repo            |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------- | :----------------------- | :------------ | :-------------------------- | :----------------------------------------------------------------- | :------------------------------------ |
| **Front Mascot**          | `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332329.jpg` | 314,262 bytes (306.9 KB) | 724 × 1024 px | JPEG (JFIF 1.01, 8-bit RGB) | `fad849c09e0aeae1a60f4d2fa86c5d0d8ef3a8d52602f65bbdc734641bc59511` | `src/assets/cards/card-front.jpg`     |
| **Career (Briefcase 💼)** | `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332334.jpg` | 281,152 bytes (274.6 KB) | 724 × 1024 px | JPEG (JFIF 1.01, 8-bit RGB) | `00b26556e5fecf4157b658d707e17e65705fb28bd922e3127f811e67dc4d5916` | `src/assets/cards/card-career.jpg`    |
| **Adventure (Globe 🌎)**  | `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332337.jpg` | 287,550 bytes (280.8 KB) | 724 × 1024 px | JPEG (JFIF 1.01, 8-bit RGB) | `61bfa7d59aaeb3dc4ee0d1e6d33d65d77f336cc58c4fa9e60264a9f6534acc5e` | `src/assets/cards/card-adventure.jpg` |
| **Creative (Palette 🎨)** | `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332339.jpg` | 287,755 bytes (281.0 KB) | 724 × 1024 px | JPEG (JFIF 1.01, 8-bit RGB) | `dc7eb38e7a2a2f100fb5d1b296e36f315c0245f6bb7f3e05729b3e63d74e6782` | `src/assets/cards/card-creative.jpg`  |

### Key Findings on Source Assets

1. **Aspect Ratio Consistency**: All 4 images share an identical aspect ratio of $724 / 1024 \approx 0.70703$. This directly matches the ISO A-series paper ratio ($1/\sqrt{2} \approx 0.70711$) and aligns with the UI CSS class `aspect-[768/1086]` ($768/1086 \approx 0.70718$). No clipping or distortion will occur when rendered inside the existing `TarotCard3D` containers.
2. **File Permissions & Readability**: All 4 files are directly readable (`readable=True`) on the local filesystem.
3. **High Resolution**: At 724×1024, the cards provide clean visual fidelity for high-DPI smartphone screens and photo card downloads without excessive bundle bloat (total size for all 4 cards is ~1.14 MB).

---

## 2. Target Directory & Current Asset State

### Examination of `src/assets/`

The target directory `src/assets/cards/` **does not yet exist**:

```bash
ls: src/assets/cards: No such file or directory
```

Currently, `src/assets/` contains only 4 legacy Lovable `.asset.json` files:

1. `src/assets/depan.webp.asset.json`
2. `src/assets/belakang1.webp.asset.json`
3. `src/assets/belakang2.webp.asset.json`
4. `src/assets/belakang3.webp.asset.json`

### Content of the Legacy Asset Metadata Files

Each file has the following JSON structure (e.g. `depan.webp.asset.json`):

```json
{
  "version": 1,
  "asset_id": "c3189018-a444-4e36-8697-04923fe7878c",
  "project_id": "b3d2be27-e1e2-48bb-b149-d70fb8ec1d19",
  "url": "/__l5e/assets-v1/c3189018-a444-4e36-8697-04923fe7878c/depan.webp",
  "r2_key": "a/v1/b3d2be27-e1e2-48bb-b149-d70fb8ec1d19/c3189018-a444-4e36-8697-04923fe7878c/depan.webp",
  "original_filename": "depan.webp",
  "size": 71048,
  "content_type": "image/webp",
  "created_at": "2026-10-02T11:15:02Z"
}
```

### Analysis of the Broken Lovable Proxy CDN

Inspection of `@lovable.dev/vite-tanstack-config` (`dist/index.js`) revealed the mechanism:

```javascript
//#region src/assetsProxyPlugin.ts
const ASSET_RE = /^\/__l5e\/assets-v1\//;
// Forwards '/__l5e/assets-v1/*' requests from the Vite dev server to the
// Lovable preview proxy so assets resolve when the page is loaded directly
name: "lovable:assets-proxy";
```

**Why this breaks in the current project**:

- In production (`npm run build` with Nitro), the `__l5e` assets are **not bundled** into `.output/public`. The client tries to request `/__l5e/assets-v1/...` from Nitro, which returns a 404 Not Found.
- In Vitest or standalone offline operation at the event booth, the proxy server is unreachable.
- In `KeepsakePhotoCard`, attempting to snapshot the card with `html-to-image` fails with CORS or broken image errors.

---

## 3. Persona Data Architecture (`src/data/personas.ts`)

### Current Imports and Data Structures

In `src/data/personas.ts`:

```typescript
import careerArt from "@/assets/belakang1.webp.asset.json";
import creativeArt from "@/assets/belakang2.webp.asset.json";
import adventureArt from "@/assets/belakang3.webp.asset.json";
import frontArt from "@/assets/depan.webp.asset.json";

export type PersonaKey = "career" | "creative" | "adventure";

export interface PersonaInfo {
  key: PersonaKey;
  number: string;
  label: string;
  short: string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
  frontImage: string;
  accentColor: string;
  glowColor: string;
  tags: string[];
  quotes: string[];
}
```

### Persona Mapping & Metadata

1. **Career (`personas.career`)**:
   - `number`: `"01"`
   - `label`: `"CAREER & FOUNDATION"`
   - `short`: `"Karier & Kepemimpinan"`
   - `title`: `"The Foundation Builder"`
   - `icon`: `"💼"`
   - `image`: Currently `careerArt.url` (`/__l5e/.../belakang1.webp`)
   - `frontImage`: Currently `frontArt.url` (`/__l5e/.../depan.webp`)
   - `accentColor`: `"var(--sge-mustard-gold)"`
   - `quotes`: 18 unique quotes
2. **Creative (`personas.creative`)**:
   - `number`: `"02"`
   - `label`: `"CREATIVE & SOUL"`
   - `short`: `"Kreativitas & Jiwa"`
   - `title`: `"The Soul Crafter"`
   - `icon`: `"🎨"`
   - `image`: Currently `creativeArt.url` (`/__l5e/.../belakang2.webp`)
   - `frontImage`: Currently `frontArt.url` (`/__l5e/.../depan.webp`)
   - `accentColor`: `"var(--sge-coral-aqua)"`
   - `quotes`: 18 unique quotes
3. **Adventure (`personas.adventure`)**:
   - `number`: `"03"`
   - `label`: `"ADVENTURE & HORIZON"`
   - `short`: `"Petualangan & Batas Baru"`
   - `title`: `"The Boundary Breaker"`
   - `icon`: `"🌎"`
   - `image`: Currently `adventureArt.url` (`/__l5e/.../belakang3.webp`)
   - `frontImage`: Currently `frontArt.url` (`/__l5e/.../depan.webp`)
   - `accentColor`: `"var(--sge-pacific-ocean)"`
   - `quotes`: 18 unique quotes

### Existing TypeScript Bug Uncovered

Running `npx tsc --noEmit` identified 2 type errors in `src/data/personas.ts`:

```
src/data/personas.ts:134:26 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
134   if (pool.length === 1) return pool[0];
src/data/personas.ts:140:3 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
140   return pool[nextIndex];
```

**Cause**: `tsconfig.json` enables `"noUncheckedIndexedAccess": true`. Array indexing produces `string | undefined`, which fails the `string` return type of `getRandomQuote`.  
**Remedy**: Change lines 134 and 140 to return `pool[0] ?? ""` and `pool[nextIndex] ?? ""`.

---

## 4. Trace of Component & Hook Consumers of Persona Images

We systematically traced every file in `src/` that accesses `image` and `frontImage`:

```
                    ┌─────────────────────────┐
                    │  src/data/personas.ts   │
                    │ (exports personas data) │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
┌───────────────┐     ┌───────────────────┐    ┌─────────────────────┐
│InteractiveDeck│     │ ReflectionDilemma │    │   routes/index.tsx  │
│  (Home Fan)   │     │ (3-Card Selection)│    │ (Grand Revelation)  │
└───────┬───────┘     └─────────┬─────────┘    └──────────┬──────────┘
        │                       │                         │
        │                       ▼                         │
        │             ┌───────────────────┐               │
        └────────────►│    TarotCard3D    │◄──────────────┘
                      │ (Perspective Tilt)│
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │ KeepsakePhotoCard │
                      │ (html-to-image)   │
                      └───────────────────┘
```

### Component Details

1. **`src/components/booth/TarotCard3D.tsx`**:
   - Props: `frontImage: string; backImage: string; isFlipped?: boolean; altText: string; accentColor?: string;`
   - Line 118: `<img src={frontImage} alt="Mascot Guess Who Are You" className="w-full h-full object-cover rounded-xl" loading="eager" />`
   - Line 151: `<img src={backImage} alt={altText} className="w-full h-full object-cover rounded-xl" loading="eager" />`
   - Features: CSS 3D perspective (`preserve-3d`), pointer hover tilt physics, and specular sheen holographic foil overlay (`.hologram-foil`).
2. **`src/components/booth/InteractiveDeck.tsx` (Screen: Home)**:
   - Line 65: `<img src={personas.career.image} alt="Kartu Karier & Kepemimpinan" />` (Left card)
   - Line 98: `<img src={personas.adventure.image} alt="Kartu Petualangan & Batas Baru" />` (Right card)
   - Line 129: `<img src={personas.creative.frontImage} alt="Maskot Guess Who Are You" />` (Center stage mascot card)
   - Features: Animated card fan, floating hover effects, and shuffle trigger.
3. **`src/components/booth/ReflectionDilemma.tsx` (Screen: Dilemma)**:
   - Line 101–114: Iterates over `personaKeys` and instantiates `<TarotCard3D frontImage={item.frontImage} backImage={item.image} isFlipped={true} ... />` for all 3 cards in a side-by-side bento layout.
4. **`src/routes/index.tsx` (Screen: Grand Revelation)**:
   - Line 303–311: Renders the revealed card:
     ```tsx
     <TarotCard3D
       frontImage={persona.frontImage}
       backImage={persona.image}
       isFlipped={true}
       altText={`Kartu ${persona.short}`}
       accentColor={persona.accentColor}
       soundEnabled={sound}
       interactiveTilt={true}
     />
     ```
5. **`src/components/booth/KeepsakePhotoCard.tsx` (Screen: Keepsake Photo Studio)**:
   - Line 115: `<img src={persona.frontImage} alt="Maskot Guess Who Are You" crossOrigin="anonymous" className="size-11 rounded-lg border border-[var(--SGECoralAqua)]/40 object-cover shadow-sm" />`
   - Line 140: `<img src={persona.image} alt={persona.title} crossOrigin="anonymous" className="w-full h-full object-cover" />`
   - Export logic: Calls `toPng(photoCardRef.current, { pixelRatio: 2.5, cacheBust: true })` from `html-to-image`.
   - **Critical Vulnerability with Proxy CDN**: Because `html-to-image` renders elements into an HTML5 `<canvas>`, external URLs or broken proxy paths cause CORS canvas tainting or 404 render failures. Local ESM-imported assets eliminate this problem completely.
6. **`src/components/booth/ScannerHUD.tsx` (Screen: Scanner HUD)**:
   - Does not render image elements directly, but displays `personas[key].icon` and `personas[key].short` during live card detection and in the manual fallback selector.

---

## 5. Migration & Vite ESM Import Strategy

### Step 1: Create Directory and Copy Assets

Copy the 4 uploaded assets to the target location:

```bash
mkdir -p src/assets/cards
cp /Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332329.jpg src/assets/cards/card-front.jpg
cp /Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332334.jpg src/assets/cards/card-career.jpg
cp /Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332339.jpg src/assets/cards/card-creative.jpg
cp /Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332337.jpg src/assets/cards/card-adventure.jpg
```

### Step 2: Update `src/data/personas.ts`

Replace the `.asset.json` imports with direct ESM image imports:

```typescript
import cardCareer from "@/assets/cards/card-career.jpg";
import cardCreative from "@/assets/cards/card-creative.jpg";
import cardAdventure from "@/assets/cards/card-adventure.jpg";
import cardFront from "@/assets/cards/card-front.jpg";

export const personas: Record<PersonaKey, PersonaInfo> = {
  career: {
    // ...
    image: cardCareer,
    frontImage: cardFront,
    // ...
  },
  creative: {
    // ...
    image: cardCreative,
    frontImage: cardFront,
    // ...
  },
  adventure: {
    // ...
    image: cardAdventure,
    frontImage: cardFront,
    // ...
  },
};
```

### Step 3: Deprecate Legacy Metadata Files

Remove the 4 obsolete JSON files from `src/assets/`:

- `src/assets/depan.webp.asset.json`
- `src/assets/belakang1.webp.asset.json`
- `src/assets/belakang2.webp.asset.json`
- `src/assets/belakang3.webp.asset.json`

---

## 6. Automated Asset Integrity Test Specification

Create a dedicated test file `src/test/card-assets.test.ts` to guarantee zero broken links, verify filesystem presence, and validate ESM bundle resolution.

### Proposed Test Implementation (`src/test/card-assets.test.ts`)

```typescript
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { personas, personaKeys } from "@/data/personas";

describe("Card Asset Pipeline & Integrity", () => {
  const cardsDir = path.resolve(__dirname, "../assets/cards");

  const expectedCards = [
    { filename: "card-front.jpg", minSize: 200_000, role: "Front Mascot" },
    { filename: "card-career.jpg", minSize: 200_000, role: "Career Card" },
    { filename: "card-creative.jpg", minSize: 200_000, role: "Creative Card" },
    { filename: "card-adventure.jpg", minSize: 200_000, role: "Adventure Card" },
  ];

  it("ensures all 4 physical card files exist on disk with valid sizes", () => {
    expectedCards.forEach(({ filename, minSize }) => {
      const filePath = path.join(cardsDir, filename);
      expect(fs.existsSync(filePath), `Missing asset: ${filename}`).toBe(true);
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

  it("verifies personas export non-empty string URLs for image and frontImage", () => {
    personaKeys.forEach((key) => {
      const persona = personas[key];
      expect(persona.image).toBeTruthy();
      expect(typeof persona.image).toBe("string");
      expect(persona.frontImage).toBeTruthy();
      expect(typeof persona.frontImage).toBe("string");
    });
  });

  it("guarantees elimination of broken Lovable proxy CDN URLs", () => {
    personaKeys.forEach((key) => {
      const persona = personas[key];
      expect(persona.image).not.toContain("__l5e");
      expect(persona.image).not.toContain("assets-v1");
      expect(persona.frontImage).not.toContain("__l5e");
      expect(persona.frontImage).not.toContain("assets-v1");
    });
  });

  it("ensures frontImage is consistent across all personas and unique per persona for back image", () => {
    const frontImages = new Set(personaKeys.map((key) => personas[key].frontImage));
    expect(frontImages.size).toBe(1); // All personas share the same mascot front

    const backImages = new Set(personaKeys.map((key) => personas[key].image));
    expect(backImages.size).toBe(3); // Career, Creative, Adventure have distinct back artworks
  });
});
```

---

## 7. Actionable Implementation Checklist for Subsequent Agents

- [ ] Execute file migration: create `src/assets/cards/` and copy 4 `.jpg` assets with exact target naming.
- [ ] Update `src/data/personas.ts` to import the `.jpg` assets and assign them to `image` and `frontImage`.
- [ ] Fix the TypeScript `TS2322` `noUncheckedIndexedAccess` errors in `getRandomQuote` (`pool[0] ?? ""` and `pool[nextIndex] ?? ""`).
- [ ] Remove `src/assets/*.webp.asset.json`.
- [ ] Add `src/test/card-assets.test.ts` to Vitest test suite.
- [ ] Verify test suite passes (`npm test`).
- [ ] Verify type checking passes (`npx tsc --noEmit`).
- [ ] Verify production build succeeds (`npm run build`).
