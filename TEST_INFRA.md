# PKKMB FILKOM UB — SGE 2026 Booth Game: E2E Test Infrastructure

## 1. Test Philosophy

The SGE 2026 Booth Game ("Guess Who Are You") is designed as an interactive in-person exhibition installation for PKKMB FILKOM UB. The test infrastructure adheres strictly to four core architectural tenets:

1. **Opaque-Box Testing**:
   Tests evaluate the system purely from an end-user and physical booth visitor perspective. Assertions verify observable DOM semantics, accessible ARIA roles, visual text elements, form controls, and user gestures without coupling to private React component state or internal module implementations.

2. **Requirement-Driven Verification**:
   Every test suite maps directly to authoritative specifications established in `ORIGINAL_REQUEST.md` and `PROJECT.md`. Tests validate that actual behavior fulfills domain requirements rather than merely verifying that the current code runs.

3. **100% Client-Side Invariant**:
   The booth game operates entirely client-side without any user accounts, backend databases, or external server round-trips. Camera stream classification and persona readings execute strictly within the visitor's browser sandbox. Test suites enforce that network dependencies are zeroed and local assets resolve correctly.

4. **Progressive Testability & Isolation**:
   All test suites are self-contained and idempotent. Each test initializes its own memory router history, isolates mock states (Web Audio, Camera, Clipboard, Canvas export), and cleans up DOM trees to ensure deterministic execution order and zero test bleed.

---

## 2. Feature Inventory Mapping

The 19 features cataloged in `PROJECT.md` map to the testing tracks and tiers as follows:

| #   | Feature Description               | Target Scope              | Test Track / File                              | Testing Tier    |
| --- | --------------------------------- | ------------------------- | ---------------------------------------------- | --------------- |
| 1   | Local Card Asset Migration        | `src/assets/cards/`       | `card-assets.test.ts` / `personas-e2e.test.ts` | Tier 1          |
| 2   | Vite ESM Asset Integration        | `src/data/personas.ts`    | `personas-e2e.test.ts`                         | Tier 1          |
| 3   | Asset Integrity Automation        | JPEG format & headers     | `card-assets.test.ts`                          | Tier 1          |
| 4   | Persona Data Integrity & Typings  | `getRandomQuote` & types  | `personas-e2e.test.ts`                         | Tier 1, 2       |
| 5   | Kinetic Sentence Reveal           | Blur & fade text reveal   | `e2e-booth-flow.test.tsx`                      | Tier 1, 3       |
| 6   | Golden Sweep Visual Effect        | Post-reveal shine sweep   | `e2e-booth-flow.test.tsx`                      | Tier 1          |
| 7   | Reflection Reroll Button          | "Tarik Refleksi Baru"     | `e2e-booth-flow.test.tsx`                      | Tier 1, 2, 4    |
| 8   | Kinetic Reveal Unit Tests         | Timing & word stream      | `kinetic-reveal.test.tsx`                      | Tier 1          |
| 9   | SGE 2026 Brand Design Tokens      | Palette & CSS variables   | `e2e-booth-flow.test.tsx`                      | Tier 1          |
| 10  | Postage-Stamp Perforations        | Perforated border styling | `e2e-booth-flow.test.tsx`                      | Tier 1          |
| 11  | 3D Card Tilt & Sheen              | Tilt physics & gesture    | `e2e-booth-flow.test.tsx`                      | Tier 1, 4       |
| 12  | ESLint Compliance (0 Errors)      | Static analysis           | `eslint.config.js` (`npm run lint`)            | Tier 1          |
| 13  | Screen 1: Neo-Editorial Home Deck | Bento & interactive deck  | `e2e-booth-flow.test.tsx`                      | Tier 1, 3, 4    |
| 14  | Screen 2: Dilemma Reflection      | 3-Card spread selection   | `e2e-booth-flow.test.tsx`                      | Tier 1, 3, 4    |
| 15  | Screen 3: Scanner HUD             | Camera & manual fallback  | `e2e-booth-flow.test.tsx`                      | Tier 1, 2, 3    |
| 16  | Screen 4: Grand Revelation        | Revealed 3D card & quote  | `e2e-booth-flow.test.tsx`                      | Tier 1, 3, 4    |
| 17  | Screen 5: Keepsake Photo Studio   | Polaroid, name, download  | `e2e-booth-flow.test.tsx`                      | Tier 1, 2, 3, 4 |
| 18  | 4-Tier Opaque-Box E2E Suite       | Multi-tier coverage       | `e2e-booth-flow.test.tsx`                      | Tier 1-4        |
| 19  | Production Build & Verification   | Vite & Nitro bundle       | `npm run build`                                | Tier 4          |

---

## 3. The 4-Tier Test Methodology

The testing architecture organizes verification across four hierarchical tiers:

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 4: Real-World Flows & Chaos (End-to-End Walkthrough) │
├─────────────────────────────────────────────────────────────┤
│  Tier 3: Cross-Feature State Transitions & Continuities     │
├─────────────────────────────────────────────────────────────┤
│  Tier 2: Boundary Conditions, Error Paths & Fallbacks       │
├─────────────────────────────────────────────────────────────┤
│  Tier 1: Core Feature Verification & Data Contracts         │
└─────────────────────────────────────────────────────────────┘
```

### Tier 1: Core Feature Verification (Sanity & Contracts)

- **Objective**: Ensure all foundational components, data contracts, and primary UI elements exist, render cleanly, and adhere to TypeScript specifications.
- **Scope**:
  - Persona Data Invariants: Verify keys (`career`, `creative`, `adventure`), distinct titles, numbers (`01`, `02`, `03`), tags, and rich quote pools (>= 15 quotes each).
  - Screen Mounts: Verify initial render of the TanStack router index route (`/`) and 404 handler.
  - Sound Control: Verify mute/unmute toggle updates the audio state and renders corresponding iconography (`Volume2` vs `VolumeX`).
  - Interactive Deck: Verify initial presence of 3 stacked 3D cards and shuffle trigger button.

### Tier 2: Boundary Conditions & Edge Handling

- **Objective**: Test system resilience against hostile, missing, or irregular environmental conditions.
- **Scope**:
  - **Camera Hardware Unavailable**: When `navigator.mediaDevices.getUserMedia` is missing or rejects with an error, Scanner HUD must display an error alert and immediately expose the manual card selection drawer.
  - **Permission Denials**: Simulated browser camera permission rejections must not throw unhandled exceptions or freeze the booth interface.
  - **Input Sanitization**: Keepsake Photo Studio participant name input must handle edge cases (empty name defaults to fallback, long strings clamped to maxLength 28, special characters and spaces sanitized during PNG filename construction).
  - **Quote Reroll Exclusions**: Consecutive quote generations must not immediately repeat identical reflections when alternatives exist.
  - **Settings Modal Bounds**: Custom model URL configuration handles empty inputs, protocol validation (`https://`), and cancellation gracefully.

### Tier 3: Cross-Feature Combinations & State Transitions

- **Objective**: Verify seamless multi-step transitions and state continuity across the 5 screens.
- **Scope**:
  - **Linear Booth Journey**: Home Deck -> Dilemma Reflection -> Scanner HUD (Manual Fallback) -> Grand Revelation -> Keepsake Photo Studio.
  - **Shortcut Journey**: Direct card selection on Home Deck 3D interactive stack skips dilemma and transitions directly to Grand Revelation with matching persona.
  - **Audio Continuity**: Toggling sound off on the Home Screen persists sound suppression through subsequent screen transitions and action cues.
  - **State Memory**: Changing participant name in Keepsake Photo Studio dynamically updates the preview card; navigating back to Revelation and re-entering preserves or resets cleanly.
  - **Reroll & Sound Synergy**: Invoking "Tarik Refleksi Baru" triggers shuffle audio cue, updates the typewriter sentence, and retains persona archetype.

### Tier 4: Real-World User Flows & Chaos Resilience

- **Objective**: Simulate rapid, erratic, and complete physical booth interactions from actual university freshmen.
- **Scope**:
  - **Full Visitor Cycle**: Freshmen approaches booth -> explores Home Deck -> selects dilemma value -> views revelation -> types their name -> downloads PNG keepsake -> copies booth link -> clicks "Main Ulang dari Beranda" to reset state for the next visitor.
  - **Rapid-Click Stress (Debounce & Idempotence)**: Rapid multi-clicking on buttons ("Mulai Membaca Takdir", "Kocok Kartu", "Tarik Refleksi Baru") executes without uncaught runtime errors, memory leaks, or corrupted DOM states.
  - **Back-Navigation Loops**: Traversal back and forth across screens (Home -> Dilemma -> Scanner -> Dilemma -> Home) maintains consistent header state and responsive action triggers.

---

## 4. Test Architecture & Runner Setup

### Technology Stack

- **Test Runner**: Vitest 4 (`vitest run`)
- **DOM Environment**: JSDOM 20
- **Testing Utilities**: `@testing-library/react` (v16), `@testing-library/jest-dom` (v6)
- **Router Mocking**: `@tanstack/react-router` with `createMemoryHistory` and `routeTree`

### Browser API Polyfills & Isolation

Because tests execute inside JSDOM without a physical display, camera, or sound card, the test harness provides opaque-box mocks for external Web APIs:

1. **Web Audio API (`window.AudioContext`)**:
   Mocked to record oscillator and gain node invocations, verifying that sound triggers execute without attempting audio hardware playback.
2. **Media Devices (`navigator.mediaDevices.getUserMedia`)**:
   Controllable mock capable of resolving mock video streams or rejecting with `NotAllowedError` / `NotFoundError` to trigger hardware fallbacks.
3. **Canvas Image Export (`html-to-image`)**:
   Mocked to return deterministic base64 PNG data URLs, verifying the download link generator and filename sanitizer without requiring headless WebGL canvas rendering.
4. **Clipboard API (`navigator.clipboard.writeText`)**:
   Mocked to verify URL copying with visual feedback ("Tautan Disalin!").

### Execution Commands

| Target Command  | Description                             | Expected Output                              |
| --------------- | --------------------------------------- | -------------------------------------------- |
| `npm test`      | Run complete Vitest suite               | 100% test files and test cases passing       |
| `npm run lint`  | Run ESLint across codebase              | 0 errors, 0 warnings                         |
| `npm run build` | Full production bundle via Vite & Nitro | Production artifacts generated in `.output/` |

---

_Maintained by PKKMB FILKOM UB SGE 2026 E2E Test Architect Track._
