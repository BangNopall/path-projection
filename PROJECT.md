# Project: PKKMB FILKOM UB - SGE 2026 Booth Game ("Guess Who Are You") Refactor

## Architecture

- **Framework & Runtime**: TanStack Start (`@tanstack/react-start` + `@tanstack/react-router`), React 19, Vite 8, Nitro 3 SSR.
- **Styling**: Tailwind CSS v4 CSS-first configuration via `@tailwindcss/vite` in `src/styles.css`. No legacy config files.
- **Brand Identity**: PKKMB FILKOM UB SGE 2026 brand palette (`#1F6F78`, `#3A8C9A`, `#57D4DD`, `#F2B705`, `#FFFAF0`, `#393D3F`) from `websge2026`.
- **Aesthetic**: Refined Neo-Editorial Bento grid, 1px subtle `border-white/10`, circuit texture backdrop, postage-stamp perforated edging, spring micro-interactions (`motion/react`), 3D card tilt with specular sheen.
- **Interactive Flow (5 Screens in `src/routes/index.tsx`)**:
  1. `home`: Home Deck with 3D stacked cards, neo-editorial hero banner, and start trigger.
  2. `dilemma`: Dilemma Reflection modal presenting 3 path cards.
  3. `scan`: Scanner HUD with client-side webcam classifier and manual fallback drawer.
  4. `reveal`: Grand Revelation featuring 3D revealed card, KineticSentenceReveal (blur & fade word reveal, golden sweep, reroll button).
  5. `photo`: Keepsake Photo Studio with Polaroid frame, local card art, and reliable PNG export (`html-to-image`).
- **Asset Pipeline**: 4 high-res JPEG card assets stored locally in `src/assets/cards/` imported via Vite ESM into `src/data/personas.ts`. 100% elimination of Lovable preview proxy CDN (`/__l5e/...`).
- **Operation Mode**: 100% client-side execution (no backend server or account authentication required).

---

## Feature Inventory

Every feature identified during Survey is assigned to a milestone below:

| #   | Feature                                  | Description                                                                                                                       | Milestone | Source                   |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------ |
| 1   | Local Card Asset Migration               | Copy 4 high-res card JPGs to `src/assets/cards/` (`card-front.jpg`, `card-career.jpg`, `card-creative.jpg`, `card-adventure.jpg`) | M1        | ORIGINAL_REQUEST §R1     |
| 2   | Vite ESM Asset Integration               | Replace Lovable proxy CDN imports in `src/data/personas.ts` with direct Vite ESM imports                                          | M1        | ORIGINAL_REQUEST §R1     |
| 3   | Asset Integrity Automation               | Automated unit test verifying asset existence, JPEG headers, and ESM resolution                                                   | M1        | ORIGINAL_REQUEST §R1, R4 |
| 4   | Persona Data Bugfixes                    | Fix TS2322 array indexing in `getRandomQuote` and align CSS variable names                                                        | M1        | Survey (Explorer 2 & 3)  |
| 5   | Kinetic Sentence Reveal                  | Component with word-by-word `filter: blur(8px) -> blur(0px)`, `opacity: 0 -> 1`, `translateY: 8px -> 0px`                         | M2        | ORIGINAL_REQUEST §R3     |
| 6   | Golden Sweep Effect                      | Post-reveal warm golden beam shine sweep across the completed reflection sentence                                                 | M2        | ORIGINAL_REQUEST §R3     |
| 7   | Reflection Reroll Button                 | Interactive "Tarik Refleksi Baru" button shuffling persona reflection quotes with sound cue                                       | M2        | ORIGINAL_REQUEST §R3     |
| 8   | Kinetic Reveal Unit Tests                | Vitest suite for word tokenization, stagger timing, sweep callback, and reroll resetting                                          | M2        | ORIGINAL_REQUEST §R4     |
| 9   | SGE 2026 Brand Tokens                    | Implement SGE 2026 palette, circuit textures, and clean editorial theme in `src/styles.css`                                       | M3        | ORIGINAL_REQUEST §R2     |
| 10  | Postage-Stamp Perforated Edges           | Perforated border styling on tarot card components                                                                                | M3        | ORIGINAL_REQUEST §R2     |
| 11  | 3D Card Tilt & Micro-Interactions        | Specular sheen highlight, smooth pointer/touch tracking, and spring hover animations                                              | M3        | ORIGINAL_REQUEST §R2     |
| 12  | ESLint Warning Elimination               | Configure `eslint.config.js` to silence shadcn fast-refresh warnings, achieving 0 errors/0 warnings                               | M3        | ORIGINAL_REQUEST §R4     |
| 13  | Screen 1: Neo-Editorial Home Deck        | Bento layout, clean editorial typography, removed generic cyber glow in `InteractiveDeck.tsx`                                     | M4        | ORIGINAL_REQUEST §R2     |
| 14  | Screen 2: Dilemma Reflection Overhaul    | Editorial card grid, spring buttons, clean dilemma presentation in `ReflectionDilemma.tsx`                                        | M4        | ORIGINAL_REQUEST §R2     |
| 15  | Screen 3: Scanner HUD Overhaul           | Clean editorial scanner frame, reticle, 100% client-side fallback drawer in `ScannerHUD.tsx`                                      | M4        | ORIGINAL_REQUEST §R2     |
| 16  | Screen 4: Grand Revelation Integration   | Embed `KineticSentenceReveal.tsx`, 3D revealed card, and reroll trigger in `src/routes/index.tsx`                                 | M4        | ORIGINAL_REQUEST §R2, R3 |
| 17  | Screen 5: Keepsake Photo Studio Overhaul | Editorial Polaroid styling, CORS-free local image canvas capture (`html-to-image`)                                                | M4        | ORIGINAL_REQUEST §R2     |
| 18  | 4-Tier Opaque-Box E2E Test Suite         | Comprehensive unit/integration tests covering all 4 tiers derived from requirements                                               | M5        | ORIGINAL_REQUEST §R4     |
| 19  | Production Build & Full Verification     | Verify 100% Vitest pass, 0 ESLint issues, successful Vite/Nitro production build                                                  | M5        | ORIGINAL_REQUEST §R4     |

---

## Milestones

| #   | Name                                 | Scope                                                                                                              | Dependencies | Status |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------ | ------ |
| M1  | Authentic Card Asset Pipeline & Data | Migrate 4 card images, ESM imports in `personas.ts`, asset test `card-assets.test.ts`, fix audio mock              | none         | DONE   |
| M2  | Kinetic Sentence Reveal Component    | Build `KineticSentenceReveal.tsx` with blur/fade, golden sweep, reroll button, and tests `kinetic-reveal.test.tsx` | none         | DONE   |
| M3  | SGE 2026 Brand Design System         | Update `src/styles.css`, circuit textures, stamp perforations, 3D tilt in `TarotCard3D.tsx`, `eslint.config.js`    | none         | DONE   |
| M4  | 5-Screen Layout & Flow Overhaul      | Modern editorial bento across all 5 screens, integrating M1 assets, M2 kinetic reveal, and M3 design tokens        | M1, M2, M3   | DONE   |
| M5  | E2E Testing Suite & Final Acceptance | 4-tier requirement-driven test suite (`TEST_READY.md`), full Vitest, ESLint, production build, forensic audit      | M4           | DONE   |

---

## Code Layout & File Ownership

To prevent concurrency conflicts during parallel worker execution:

| Milestone / Agent | Exclusively Owned Files                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 Worker         | `src/assets/cards/*`, `src/data/personas.ts`, `src/assets/*.asset.json`, `src/test/card-assets.test.ts`, `src/test/audio.test.ts`                                                                     |
| M2 Worker         | `src/components/booth/KineticSentenceReveal.tsx`, `src/test/kinetic-reveal.test.tsx`                                                                                                                  |
| M3 Worker         | `src/styles.css`, `src/components/booth/TarotCard3D.tsx`, `eslint.config.js`, `src/assets/patterns/*`                                                                                                 |
| M4 Worker         | `src/routes/index.tsx`, `src/components/booth/InteractiveDeck.tsx`, `src/components/booth/ReflectionDilemma.tsx`, `src/components/booth/ScannerHUD.tsx`, `src/components/booth/KeepsakePhotoCard.tsx` |
| E2E Testing Track | `TEST_INFRA.md`, `TEST_READY.md`, `src/test/e2e-booth-flow.test.tsx`, `src/test/personas-e2e.test.ts`                                                                                                 |

---

## Interface Contracts

### 1. `src/data/personas.ts` (M1) ↔ Components (M4)

```ts
export interface Persona {
  id: "career" | "creative" | "adventure";
  name: string;
  badge: string;
  tagline: string;
  dilemma: string;
  theme: string;
  accentColor: string; // e.g. "var(--SGEMustardGold)"
  image: string; // Vite ESM asset string pointing to card back JPG
  frontImage: string; // Vite ESM asset string pointing to card front JPG
  archetype: string;
  element: string;
  filkomKeywords: string[];
  reflections: string[];
}

export function getRandomQuote(personaKey: string, currentQuote?: string): string;
```

### 2. `KineticSentenceReveal.tsx` (M2) ↔ Grand Revelation Screen (M4)

```tsx
export interface KineticSentenceRevealProps {
  sentence: string;
  personaAccentColor?: string;
  onReroll?: () => void;
  isRerolling?: boolean;
  className?: string;
}

export function KineticSentenceReveal(props: KineticSentenceRevealProps): JSX.Element;
```

### 3. SGE 2026 CSS Tokens (M3) ↔ All Screens (M4)

- Variables defined in `:root` and `@theme inline`:
  - `--SGESteadyTeal`: `#1F6F78`
  - `--SGEPacificOcean`: `#3A8C9A`
  - `--SGECoralAqua`: `#57D4DD`
  - `--SGEMustardGold`: `#F2B705`
  - `--SGEBackground`: `#FFFAF0`
  - `--SGECharcoal`: `#393D3F`
  - `--SGEPapayaWhip`: `#FFEFD3`
  - `--SGEPutee`: `#FDFDFF`
- Utility classes:
  - `.circuit-pattern-bg`: Soft SVG circuit trace backdrop
  - `.stamp-border`: Perforated postage-stamp edging
  - `.neo-bento-card`: 1px subtle `border-white/10` with deep teal backdrop `#0F1E21`
