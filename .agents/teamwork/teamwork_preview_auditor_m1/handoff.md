# Forensic Audit Report — Milestone M1: Card Asset Pipeline & Data

**Auditor**: Forensic Auditor (teamwork_preview_auditor_m1)  
**Date**: 2026-10-02T18:29:00Z  
**Work Product**: Milestone M1 deliverables (`src/assets/cards/`, `src/data/personas.ts`, `src/test/card-assets.test.ts`, `src/test/audio.test.ts`)  
**Profile**: General Project (Development Mode per `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**

---

### 1. Observation

1. **Card Binary Authenticity & SHA256 Checksums**:
   Comparison between source files in user-uploaded media and destination files in `src/assets/cards/`:
   - `src/assets/cards/card-front.jpg`:
     - Target SHA256: `fad849c09e0aeae1a60f4d2fa86c5d0d8ef3a8d52602f65bbdc734641bc59511`
     - Source SHA256 (`media_1790964332329.jpg`): `fad849c09e0aeae1a60f4d2fa86c5d0d8ef3a8d52602f65bbdc734641bc59511`
     - Size: 314,262 bytes | Dimensions: 724x1024 | Format: baseline JPEG (JFIF 1.01), 8 bits/sample, 3 components RGB
   - `src/assets/cards/card-career.jpg`:
     - Target SHA256: `00b26556e5fecf4157b658d707e17e65705fb28bd922e3127f811e67dc4d5916`
     - Source SHA256 (`media_1790964332334.jpg`): `00b26556e5fecf4157b658d707e17e65705fb28bd922e3127f811e67dc4d5916`
     - Size: 281,152 bytes | Dimensions: 724x1024 | Format: baseline JPEG (JFIF 1.01)
   - `src/assets/cards/card-adventure.jpg`:
     - Target SHA256: `61bfa7d59aaeb3dc4ee0d1e6d33d65d77f336cc58c4fa9e60264a9f6534acc5e`
     - Source SHA256 (`media_1790964332337.jpg`): `61bfa7d59aaeb3dc4ee0d1e6d33d65d77f336cc58c4fa9e60264a9f6534acc5e`
     - Size: 287,550 bytes | Dimensions: 724x1024 | Format: baseline JPEG (JFIF 1.01)
   - `src/assets/cards/card-creative.jpg`:
     - Target SHA256: `dc7eb38e7a2a2f100fb5d1b296e36f315c0245f6bb7f3e05729b3e63d74e6782`
     - Source SHA256 (`media_1790964332339.jpg`): `dc7eb38e7a2a2f100fb5d1b296e36f315c0245f6bb7f3e05729b3e63d74e6782`
     - Size: 287,755 bytes | Dimensions: 724x1024 | Format: baseline JPEG (JFIF 1.01)

2. **Genuine Test Suite (`src/test/card-assets.test.ts`)**:
   - `fs` is not mocked; it calls `node:fs` directly.
   - Tests assert file existence on disk (`fs.existsSync(filePath)`).
   - Tests assert file sizes > 200,000 bytes.
   - Tests verify JPEG magic bytes (`buffer[0] === 0xff`, `buffer[1] === 0xd8`, `buffer[2] === 0xff`).
   - Tests verify Vite ESM module resolution (`typeof val === "string"`, non-empty URL).
   - Tests verify data bindings in `src/data/personas.ts`.
   - Tests verify exclusion of proxy strings `__l5e`, `assets-v1`, and `.asset.json`.
   - Tests verify single front image and three distinct back images.
   - Tests verify standard CSS token variables (`var(--SGEMustardGold)`, `var(--SGECoralAqua)`, `var(--SGEPacificOcean)`).

3. **Proxy URL Search Results**:
   A repository-wide search for regex `__l5e|assets-v1` returned:
   - 0 matches in application source code, config files, or assets.
   - The only occurrences in `src/` are negative assertions in `src/test/card-assets.test.ts` (lines 67, 68, 71, 72).
   - All 4 legacy metadata files (`src/assets/*.asset.json`) were deleted and 0 `.asset.json` files exist in the repository.

4. **Client-Side Autonomy & External Endpoints Scan**:
   - Search for `fetch|http|socket|analytics|telemetry|backend` in `src/data/personas.ts`, `src/test/card-assets.test.ts`, and `src/test/audio.test.ts` returned 0 matches.
   - No external APIs or telemetry services were introduced.

5. **Independent Test Execution Results**:
   - `npx vitest run src/test/card-assets.test.ts`: 7 passed (7 tests) in 222ms.
   - `npx vitest run src/test/audio.test.ts`: 2 passed (2 tests) in 213ms.
   - `npx vitest run`: 7 passed (7 test files, 41 passed tests) in 7.13s.

6. **Independent Production Build Execution**:
   Running `npm run build` completed successfully (exit code 0) and emitted the hashed card assets into `.output/public/assets/`:
   - `.output/public/assets/card-career-YoO1wtcL.jpg` (281.15 kB)
   - `.output/public/assets/card-adventure-DTnhrvwG.jpg` (287.55 kB)
   - `.output/public/assets/card-creative-BxdXuZ5x.jpg` (287.75 kB)
   - `.output/public/assets/card-front-DXLeQLC3.jpg` (314.26 kB)

---

### 2. Logic Chain

1. **Asset Authenticity**: Comparing target file SHA256 hashes against original user-uploaded files proves identical byte streams (Obs 1). `sips` and `file` commands confirm valid 724x1024 JPEG image formats (Obs 1). Therefore, no dummy files, stubs, or corrupted placeholders exist.
2. **Implementation Authenticity**: Inspecting `src/test/card-assets.test.ts` shows tests rely on live disk reads and real binary inspections rather than mocks (Obs 2). In `src/data/personas.ts`, real ESM imports (`import cardFrontImg from "@/assets/cards/card-front.jpg"`) and rich quote dictionaries (54 quotes total) are implemented. Therefore, the implementation is genuine and not a facade.
3. **Proxy CDN Elimination**: Repo-wide pattern search confirms all references to `/__l5e/` and `assets-v1` were removed from runtime code, and all `.asset.json` files deleted (Obs 3). Therefore, dependency on the Lovable proxy is 100% eliminated.
4. **Client-Side Autonomy**: Codebase searches confirm absence of telemetry, external HTTP endpoints, or remote service dependencies (Obs 4). Therefore, client-side autonomy is strictly maintained.
5. **Reproducibility**: Running `vitest` and `npm run build` independently verifies all test assertions pass and the build pipeline packages the JPEG assets properly (Obs 5, 6).

---

### 3. Caveats

- Milestone M1 does not touch UI screens (Home Deck, Dilemma, Scanner, Revelation, Keepsake), which are scheduled for Milestones M2-M4 per `PROJECT.md`.
- Two pre-existing TypeScript errors in `src/test/e2e-booth-flow.test.tsx` (lines 238 and 345) are owned exclusively by the E2E testing agent track and do not affect M1 assets or data modules.

---

### 4. Conclusion

**Verdict: CLEAN**

Milestone M1 satisfies all requirements of `ORIGINAL_REQUEST.md` §R1 and integrity criteria without violations:
- Physical card assets are authentic, bit-for-bit identical to source uploads.
- Tests in `src/test/card-assets.test.ts` are authentic, non-mocked, and comprehensive.
- Lovable proxy CDN URLs have been completely purged from the codebase.
- Client-side autonomy is intact with zero external network dependencies.
- Production build succeeds and emits all 4 hashed card assets.

---

### 5. Verification Method

To independently reproduce this audit:

1. **Verify Binary Checksums**:
   ```bash
   shasum -a 256 src/assets/cards/*
   ```
   Must yield:
   - `card-front.jpg`: `fad849c09e0aeae1a60f4d2fa86c5d0d8ef3a8d52602f65bbdc734641bc59511`
   - `card-career.jpg`: `00b26556e5fecf4157b658d707e17e65705fb28bd922e3127f811e67dc4d5916`
   - `card-adventure.jpg`: `61bfa7d59aaeb3dc4ee0d1e6d33d65d77f336cc58c4fa9e60264a9f6534acc5e`
   - `card-creative.jpg`: `dc7eb38e7a2a2f100fb5d1b296e36f315c0245f6bb7f3e05729b3e63d74e6782`

2. **Verify Elimination of Proxy URLs**:
   ```bash
   git grep "__l5e" src/
   ```
   Must return only negative assertions in `src/test/card-assets.test.ts`.

3. **Execute Independent Unit Tests**:
   ```bash
   npx vitest run src/test/card-assets.test.ts src/test/audio.test.ts
   ```
   Must report 9 passed tests across 2 files, 0 failures.

4. **Execute Independent Production Build**:
   ```bash
   npm run build
   ```
   Must exit with code 0 and emit `.output/public/assets/card-*.jpg`.
