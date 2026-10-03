# Architecture & Toolchain Survey Report

**Project**: PKKMB FILKOM UB — SGE 2026 Booth Game ("Guess Who Are You")  
**Workspace**: `/Users/noxval/_PROJECT_/path-projection`  
**Explorer**: Explorer 1 (Codebase Toolchain Explorer)  
**Date**: 2026-10-02  

---

## 1. Executive Summary

The project is a high-performance interactive web application built with **TanStack Start (Full-stack SSR / Nitro)**, **React 19**, **Tailwind CSS v4**, **Motion (Framer Motion v13)**, and **Vitest 4**. It runs 100% client-side for booth visitors without requiring a backend database or user authentication.

All foundational toolchains (Vite, Vitest, Nitro, ESLint, TypeScript) are functioning properly:
- **Build**: `npm run build` executes Vite client bundle, Vite SSR bundle, and Nitro Cloudflare module worker compilation cleanly.
- **Unit Tests**: `npm test` runs 13 tests across 4 test files via Vitest in jsdom in ~880ms with 100% pass rate.
- **Linting**: `npm run lint` completes with 0 errors and 6 warnings (originating from React Refresh rules on shadcn UI components).
- **Asset Pipeline**: Currently relies on Lovable CDN proxy JSON pointers (`/__l5e/...`); ready for migration to local Vite ESM card assets.

---

## 2. Configuration & Toolchain Inspection

### 2.1 Package Manifest (`package.json`)
- **Package Name**: `tanstack_start_ts`
- **Module System**: Pure ES Modules (`"type": "module"`)
- **Overrides**: `"rolldown": "1.2.1"`
- **Key Dependencies**:
  - **Framework / Routing**: `@tanstack/react-start: 1.168.60`, `@tanstack/react-router: 1.170.41`, `@tanstack/router-plugin: 1.168.42`, `@tanstack/react-query: ^5.101.1`
  - **UI / Runtime**: `react: ^19.2.0`, `react-dom: ^19.2.0`
  - **Styling**: `tailwindcss: ^4.2.1`, `@tailwindcss/vite: ^4.2.1`, `tw-animate-css: ^1.3.4`, `tailwind-merge: ^3.5.0`, `clsx: ^2.1.1`, `class-variance-authority: ^0.7.1`
  - **Animation**: `motion: ^13.4.6` (imported as `motion/react`)
  - **Icons**: `lucide-react: ^0.575.0`
  - **AI / ML**: `@teachablemachine/image: ^0.8.5`, `@tensorflow/tfjs: ^4.22.0`
  - **Graphics & Utilities**: `html-to-image: ^1.11.13`, `qrcode.react: ^4.2.0`, `zod: ^3.25.76`
- **DevDependencies**:
  - `vite: 8.1.5`
  - `nitro: 3.0.260603-beta`
  - `@lovable.dev/vite-tanstack-config: ^2.24.0`
  - `vitest: ^4.1.10`, `@testing-library/react: ^16.0.0`, `@testing-library/jest-dom: ^6.6.0`, `jsdom: ^20.0.3`
  - `eslint: ^9.32.0`, `typescript-eslint: ^8.56.1`, `globals: ^15.15.0`
  - `typescript: ^5.8.3`

### 2.2 Vite & TanStack Start (`vite.config.ts`)
```typescript
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
```
The config uses `@lovable.dev/vite-tanstack-config` which bundles:
- TanStack router plugin & devtools
- React Vite plugin (`@vitejs/plugin-react`)
- Tailwind CSS v4 compiler (`@tailwindcss/vite`)
- TypeScript path aliases (`@/*` -> `./src/*`)
- Nitro SSR generator targeting Cloudflare module preset
- Duplicate plugins must **not** be added to `vite.config.ts`.

### 2.3 Styling Architecture (`src/styles.css` & Tailwind v4)
- No `tailwind.config.ts` or `postcss.config.js` exists. This is expected: **Tailwind v4 is CSS-first**.
- Direct import in `src/styles.css`:
  - `@import "tailwindcss" source(none);`
  - `@source "../src";`
  - `@import "tw-animate-css";`
  - `@theme inline { ... }` defines SGE 2026 design tokens (`--color-sge-teal`, `--color-sge-ocean`, `--color-sge-aqua`, `--color-sge-gold`, `--color-sge-papaya`, `--color-sge-charcoal`).
  - Dark mode variant: `@custom-variant dark (&:is(.dark *));`.
  - Custom utilities: `font-display`, `font-mono`, `.app-canvas`, `.ambient-grid`, `.glass-surface`, `.tarot-card-3d`, `.hologram-foil`.

### 2.4 TypeScript Configuration (`tsconfig.json`)
- Target: `ES2022`, Module: `ESNext`, `jsx: "react-jsx"`, `moduleResolution: "Bundler"`.
- Types included: `["vite/client", "vitest/globals"]`.
  - Notice `vite/client` provides ambient declarations for static asset imports (`*.jpg`, `*.png`, `*.webp`, `*.svg`).
- Path alias: `"@/*": ["./src/*"]`.
- Strict checking: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`.

### 2.5 Linter Configuration (`eslint.config.js`)
- ESLint 9 Flat Config using `typescript-eslint`.
- Ignored paths: `dist`, `.output`, `.vinxi`.
- Plugins: `react-hooks`, `react-refresh`, `prettier`.
- Custom rule: prevents accidental import of `server-only`.
- Current audit status: **0 errors, 6 warnings**.
  - All 6 warnings stem from `react-refresh/only-export-components` in shadcn UI components (`badge.tsx`, `button.tsx`, `form.tsx`, `navigation-menu.tsx`, `sidebar.tsx`, `toggle.tsx`) because they export both variant definitions and React components from the same file.
  - *Recommendation for R4 zero-warning compliance*: Add an ignore rule for `src/components/ui/**` in `eslint.config.js` or add disable comments.

---

## 3. Application Architecture & Entry Points

Unlike traditional SPAs (which have `index.html` and `src/main.tsx`), this application uses **TanStack Start**:

```
src/
├── routes/
│   ├── __root.tsx       # Root document shell (HTML/Head/Body in prod, fragment in test)
│   └── index.tsx        # Single-page game flow (5 distinct interactive screens)
├── routeTree.gen.ts     # TanStack Router auto-generated route tree
├── router.tsx           # Router instance factory (QueryClient + createRouter)
├── start.ts             # TanStack Start instance + CSRF & Error middleware
├── server.ts            # Nitro SSR entry point & error boundary
├── data/
│   └── personas.ts      # Persona definitions (career, creative, adventure), quotes & asset paths
├── lib/
│   ├── audio.ts         # Web Audio API sound generator (click, hover, shuffle, reveal)
│   ├── classifier.ts    # Label normalizer for Teachable Machine camera predictions
│   ├── error-capture.ts # Error tracking utilities
│   └── error-page.ts    # Fallback 500 error page
├── components/
│   ├── booth/
│   │   ├── InteractiveDeck.tsx  # Hero 3D interactive fanned deck
│   │   ├── ReflectionDilemma.tsx # Dilemma selection screen
│   │   ├── ScannerHUD.tsx        # Camera Teachable Machine vision HUD
│   │   ├── TarotCard3D.tsx       # 3D flippable card with mouse/touch tilt & holographic foil
│   │   └── KeepsakePhotoCard.tsx # Downloadable Polaroid keepsake card generator
│   └── ui/              # Shadcn UI primitives
└── test/
    ├── setup.ts                 # Vitest jsdom mocks (scrollTo, matchMedia)
    ├── app-routing.test.tsx      # Route mounting tests
    ├── audio.test.ts            # Web Audio API unit tests
    ├── classifier-model.test.ts # Classifier label normalization tests
    └── persona-content.test.ts  # Quote integrity, count, and jargon tests
```

### 3.1 Screen State Machine (`src/routes/index.tsx`)
The booth flow is managed as a client-side state machine:
1. `home`: Landing deck with interactive 3D fanned cards and booth instructions.
2. `dilemma`: 3-card dilemma picker with reflection themes.
3. `scan`: Real-time camera scanner with Teachable Machine image classification.
4. `reveal`: 3D card flip revelation, persona reading, and sentence reveal.
5. `photo`: Keepsake Polaroid card customizer with client-side canvas generation (`html-to-image`).

---

## 4. Test Infrastructure & Coverage Analysis

### 4.1 Vitest Configuration (`vitest.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### 4.2 Existing Test Suite
| Test File | Tests | Status | Scope |
|---|---|---|---|
| `src/test/app-routing.test.tsx` | 2 | Passing | Mounts index route `/` and 404 route with `createMemoryHistory` |
| `src/test/audio.test.ts` | 2 | Passing | Synthesizer safety when sound disabled or `AudioContext` mocked |
| `src/test/classifier-model.test.ts` | 4 | Passing | Keyword/emoji normalization for career, creative, adventure, noise |
| `src/test/persona-content.test.ts` | 5 | Passing | Validates 3 personas, >=15 unique quotes each, no computer jargon, random picker |
| **Total** | **13** | **100% Pass** | Execution time: ~880ms |

---

## 5. Requirements for R4 Automated Testing

Requirement **R4** demands automated tests covering:
1. **Asset resolution**
2. **Kinetic sentence reveal**
3. **Persona quotes**
4. **Classifier accuracy**
5. **Router mounting**
6. **100% test pass rate, 0 ESLint errors/warnings, and clean production build**

### 5.1 Gap Analysis & Test Plan for R4

#### Gap 1: Asset Resolution Test (Missing — Needs implementation)
- **Current State**: `src/data/personas.ts` uses `.webp.asset.json` pointing to remote URLs.
- **R1 Requirement**: 4 physical card assets (`card-front.jpg`, `card-career.jpg`, `card-creative.jpg`, `card-adventure.jpg`) stored in `src/assets/cards/` and imported directly via Vite ESM.
- **New Test Required**: `src/test/card-assets.test.ts`
  - Verify that `card-front.jpg`, `card-career.jpg`, `card-creative.jpg`, `card-adventure.jpg` exist on disk.
  - Verify that `personas[key].image` and `personas[key].frontImage` resolve to valid non-empty string URLs/paths.
  - Verify that NO persona image URL contains `/__l5e/` or `.asset.json`.
  - Verify that each persona has distinct, valid images mapped.

#### Gap 2: Kinetic Sentence Reveal Test (Missing — Needs implementation)
- **Current State**: `src/routes/index.tsx` uses a naive string slice `setInterval` typewriter effect.
- **R3 Requirement**: Replace with a kinetic word-by-word reveal component (`filter: blur(8px) -> blur(0px)`, `opacity: 0 -> 1`, `translateY: 8px -> 0px`), spring easing, golden sweep on completion, and "Tarik Refleksi Baru" reroll support.
- **New Test Required**: `src/test/kinetic-reveal.test.tsx`
  - Tokenization / word splitting: preserves words and spacing correctly.
  - Component rendering: renders all words into the DOM.
  - Sequential delay attributes: words receive staggered animation timing.
  - Completion trigger: triggers golden sweep / completion callback upon reaching the final word.
  - Reroll handling: updating the sentence resets animation states cleanly.

#### Existing Items Meeting R4:
- **Persona Quotes**: Covered by `src/test/persona-content.test.ts` (verifies quote count >=15, uniqueness, jargon filtering, random selection).
- **Classifier Accuracy**: Covered by `src/test/classifier-model.test.ts` (verifies multilingual keywords, numbers, emojis, noise filtering).
- **Router Mounting**: Covered by `src/test/app-routing.test.tsx` (verifies `/` and 404 route mounting).

#### Quality & Toolchain Checklist for R4:
- **Vitest**: All existing + new tests must pass (`npm test`).
- **ESLint**: 6 warnings in `src/components/ui/` need to be resolved or ignored in `eslint.config.js` to hit 0 warnings (`npm run lint`).
- **Production Build**: `npm run build` must build client, SSR, and Nitro worker without errors.

---

## 6. Actionable Recommendations for Implementation

1. **Card Asset Migration (R1)**:
   - Copy 4 source JPGs from `.user_uploaded/` into `src/assets/cards/`:
     - Front Mascot -> `card-front.jpg`
     - Career Briefcase -> `card-career.jpg`
     - Creative Palette -> `card-creative.jpg`
     - Adventure Globe -> `card-adventure.jpg`
   - Update `src/data/personas.ts` to direct ESM imports:
     ```typescript
     import cardFront from "@/assets/cards/card-front.jpg";
     import cardCareer from "@/assets/cards/card-career.jpg";
     import cardCreative from "@/assets/cards/card-creative.jpg";
     import cardAdventure from "@/assets/cards/card-adventure.jpg";
     ```
2. **Kinetic Reveal Component (R3)**:
   - Extract sentence reveal logic into a dedicated component (e.g. `src/components/booth/KineticSentenceReveal.tsx`) utilizing `motion/react`.
   - Implement `filter: blur(8px) -> 0`, `opacity: 0 -> 1`, and completion shimmer.
3. **Automated Tests (R4)**:
   - Add `src/test/card-assets.test.ts`.
   - Add `src/test/kinetic-reveal.test.tsx`.
   - Fix audio test mock implementation in `src/test/audio.test.ts` to silence Vitest mock warning.
4. **ESLint Cleanliness (R4)**:
   - Update `eslint.config.js` to exclude shadcn UI components from `react-refresh/only-export-components`, ensuring `npm run lint` yields 0 problems.
