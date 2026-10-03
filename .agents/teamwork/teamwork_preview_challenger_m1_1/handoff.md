# M1 Challenger Handoff Report: Card Asset Pipeline & Data Integrity

**Challenger**: Challenger 1 (Empirical Challenger)  
**Working Directory**: `/Users/noxval/_PROJECT_/path-projection/.agents/teamwork/teamwork_preview_challenger_m1_1`  
**Date**: 2026-10-02T18:32:00Z  
**Verdict**: **APPROVE** (with notes for subsequent milestones)

---

### 1. Observation

1. **Card Binary Header, Dimension, & Checksum Verification**:
   - `src/assets/cards/card-front.jpg`: 314,262 bytes, SHA256 `fad849c09e0aeae1a60f4d2fa86c5d0d8ef3a8d52602f65bbdc734641bc59511`. Starts with SOI `0xFF 0xD8`, terminates with EOI `0xFF 0xD9`. SOF0 dimensions: 724 x 1024 px, 3 channels, Aspect Ratio 0.7070.
   - `src/assets/cards/card-career.jpg`: 281,152 bytes, SHA256 `00b26556e5fecf4157b658d707e17e65705fb28bd922e3127f811e67dc4d5916`. Starts with SOI `0xFF 0xD8`, terminates with EOI `0xFF 0xD9`. SOF0 dimensions: 724 x 1024 px, 3 channels, Aspect Ratio 0.7070.
   - `src/assets/cards/card-adventure.jpg`: 287,550 bytes, SHA256 `61bfa7d59aaeb3dc4ee0d1e6d33d65d77f336cc58c4fa9e60264a9f6534acc5e`. Starts with SOI `0xFF 0xD8`, terminates with EOI `0xFF 0xD9`. SOF0 dimensions: 724 x 1024 px, 3 channels, Aspect Ratio 0.7070.
   - `src/assets/cards/card-creative.jpg`: 287,755 bytes, SHA256 `dc7eb38e7a2a2f100fb5d1b296e36f315c0245f6bb7f3e05729b3e63d74e6782`. Starts with SOI `0xFF 0xD8`, terminates with EOI `0xFF 0xD9`. SOF0 dimensions: 724 x 1024 px, 3 channels, Aspect Ratio 0.7070.

2. **Production Bundle Verification (`npm run build`)**:
   - Production build command exited with code 0 in 701ms.
   - Assets generated in `.output/public/assets/`:
     - `card-front-DXLeQLC3.jpg` (314.26 kB, SHA256 matches authentic source file bit-for-bit)
     - `card-career-YoO1wtcL.jpg` (281.15 kB, SHA256 matches authentic source file bit-for-bit)
     - `card-adventure-DTnhrvwG.jpg` (287.55 kB, SHA256 matches authentic source file bit-for-bit)
     - `card-creative-BxdXuZ5x.jpg` (287.75 kB, SHA256 matches authentic source file bit-for-bit)
   - `.output/public/assets/routes-BcyCGoW-.js` directly imports and references these bundled card assets:
     `image: "/assets/card-career-YoO1wtcL.jpg"`
     `frontImage: If` (resolves to `/assets/card-front-DXLeQLC3.jpg`)
     `image: "/assets/card-creative-BxdXuZ5x.jpg"`
     `image: "/assets/card-adventure-DTnhrvwG.jpg"`

3. **Lovable Proxy CDN & `__l5e` Elimination**:
   - Deep recursive string scan across all `.output/` files for `__l5e`, `assets-v1`, `belakang1.webp`, `depan.webp` returned 0 matches.
   - Deep scan across all `src/` files (excluding negative test assertions) returned 0 matches.
   - All 4 legacy metadata files (`src/assets/*.webp.asset.json`) are confirmed deleted.

4. **Persona Data & `getRandomQuote` Stress Testing**:
   - `scripts/adversarial-m1-harness.mjs` executed 74 automated assertions, exiting with code 0.
   - Boundary tests for `getRandomQuote`: handled `key: "invalid"`, `excludeIndex: -1`, `9999`, `NaN`, `Infinity`, and float `2.5` without any exceptions or runtime crashes.
   - In 10,000 non-repetition runs across all persona quote pools, zero repetition violations occurred.
   - In a 50,000-trial statistical distribution test with `excludeIndex = 0`:
     - Excluded index 0 received 0 draws.
     - Index 1 received 5,587 draws (11.17%).
     - Indices 2 through 17 received an average of 2,776 draws (5.55%).
     - Finding: Modulo redistribution `(nextIndex + 1) % pool.length` introduces a ~2x statistical weight for the immediately adjacent quote when rerolling.

5. **Interface Contract & Reroll Call Site**:
   - `PROJECT.md` line 92 states: `export function getRandomQuote(personaKey: string, currentQuote?: string): string;`
   - `src/data/personas.ts` line 131 implements: `export function getRandomQuote(key: PersonaKey, excludeIndex?: number): string`
   - In `src/routes/index.tsx` line 111: `const newQuote = getRandomQuote(selected);` calls the function without passing any exclusion parameter. Consequently, rerolling has a 1/18 (~5.5%) chance of picking the exact same quote. (Screen 4 integration is assigned to M4).

6. **TypeScript Check (`npx tsc -p tsconfig.json --noEmit`)**:
   - Exited with code 2 due to 2 errors in `src/test/e2e-booth-flow.test.tsx` (lines 238 and 345: `fireEvent.click(selectButtons[0])` where array element could be undefined under `noUncheckedIndexedAccess`).
   - M1-owned files (`src/data/personas.ts`, `src/test/card-assets.test.ts`, `src/test/audio.test.ts`) contain **0 TypeScript errors**.

---

### 2. Logic Chain

1. The 4 card assets on disk match the user uploads bit-for-bit, possess valid JPEG SOI/EOI framing, and share an identical aspect ratio of 0.7070 (724x1024px) (Obs 1). This ensures that 3D card tilt and flipping will never suffer from aspect ratio jumps or distorted scaling.
2. The Vite/Nitro build pipeline copies and hashes the card assets to `.output/public/assets/` without alteration, and the client JavaScript chunk directly references them via local root-relative paths (Obs 2).
3. The build output and source code contain no references to `__l5e` or proxy endpoints (Obs 3). Standalone, offline execution is guaranteed.
4. Stress-testing `src/data/personas.ts` confirmed high resilience against malformed inputs and guarantees that quotes do not repeat when `excludeIndex` is provided (Obs 4).
5. The modulo probability bias in `getRandomQuote` (Obs 4) is non-fatal: it does not break functionality or violate non-repetition, but rather represents a subtle statistical skew.
6. The interface signature mismatch between `PROJECT.md` and `src/data/personas.ts` (Obs 5) does not break existing code, but M4 should be aware to pass the quote index (or update `getRandomQuote` to accept string `currentQuote`) during the Screen 4 reveal overhaul.
7. TypeScript errors found during global `tsc` (Obs 6) reside solely in `src/test/e2e-booth-flow.test.tsx`, which belongs to the E2E testing track (`PROJECT.md` line 68) and is outside M1 worker scope.

---

### 3. Caveats

- **Modulo Redistribution Bias in `getRandomQuote`**: While reroll non-repetition is guaranteed, the quote at `(excludeIndex + 1) % pool.length` has twice the probability of being selected compared to others.
- **Reroll Trigger in `src/routes/index.tsx`**: Currently calls `getRandomQuote(selected)` without an exclusion argument, allowing a ~5.5% chance of rolling the same quote. This is scheduled for overhaul in M4.
- **E2E Test File Type Errors**: `src/test/e2e-booth-flow.test.tsx` contains 2 strict TypeScript errors under `noUncheckedIndexedAccess: true`. This belongs to the E2E milestone track (M5).

---

### 4. Conclusion

**VERDICT: APPROVE**

Milestone M1 satisfies all requirements of R1 and the M1 architecture:
- 4 authentic high-res cards are integrated via Vite ESM with zero broken links.
- Broken Lovable preview CDN URLs (`__l5e`) are 100% eliminated from both source and build artifacts.
- Production build succeeds without errors, outputting bit-exact static card assets.
- Asset integrity and audio mock tests pass cleanly with 0 warnings.
- Adversarial test harness (`scripts/adversarial-m1-harness.mjs`) passed 74/74 assertions.

---

### 5. Verification Method

To independently reproduce and verify this challenger assessment:

1. **Run the Adversarial Test Harness**:
   ```bash
   node scripts/adversarial-m1-harness.mjs
   ```
   *Expected*: Code 0, 74 PASSES, 0 FAILURES, 1 statistical observation note.

2. **Verify M1 Vitest Suites**:
   ```bash
   npx vitest run src/test/card-assets.test.ts src/test/audio.test.ts
   ```
   *Expected*: 2 test files passed, 9 tests passed, 0 warnings.

3. **Verify Production Build & Bundle Content**:
   ```bash
   npm run build
   ls -lh .output/public/assets/card-*.jpg
   ```
   *Expected*: 4 card files present, each between 280KB and 315KB.

4. **Verify No `__l5e` in Source or Output**:
   ```bash
   grep -rn "__l5e" .output/
   ```
   *Expected*: 0 matches.
