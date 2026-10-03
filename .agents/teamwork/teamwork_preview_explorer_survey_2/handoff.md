# Handoff Report: Asset Pipeline & Persona Data Investigation

**Author**: Explorer 2 (Asset Pipeline Explorer)  
**Date**: 2026-10-02  
**Working Directory**: `/Users/noxval/_PROJECT_/path-projection/.agents/teamwork/teamwork_preview_explorer_survey_2`  
**Handoff Type**: Hard (Task complete)

---

## 1. Observation

1. **Source Uploaded Assets**:
   Command `sips -g pixelWidth -g pixelHeight -g format /Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332*.jpg` confirmed all 4 files exist, are format `jpeg`, and have resolution `724x1024`:
   - `media_1790964332329.jpg` (314,262 bytes, SHA-256: `fad849c0...`): Front Mascot
   - `media_1790964332334.jpg` (281,152 bytes, SHA-256: `00b26556...`): Career (Briefcase)
   - `media_1790964332337.jpg` (287,550 bytes, SHA-256: `61bfa7d5...`): Adventure (Globe)
   - `media_1790964332339.jpg` (287,755 bytes, SHA-256: `dc7eb38e...`): Creative (Palette)
     Python command `os.access(path, os.R_OK)` confirmed all 4 are readable.

2. **Target Directory**:
   `ls -la src/assets src/assets/cards` returned `ls: src/assets/cards: No such file or directory`. `src/assets` currently contains only 4 legacy files:
   - `belakang1.webp.asset.json`
   - `belakang2.webp.asset.json`
   - `belakang3.webp.asset.json`
   - `depan.webp.asset.json`

3. **Broken Lovable Proxy CDN Usage**:
   Grep search for `__l5e` found exact URLs inside each `.asset.json` (e.g. `src/assets/depan.webp.asset.json:5`):
   `"url": "/__l5e/assets-v1/c3189018-a444-4e36-8697-04923fe7878c/depan.webp"`.
   In `src/data/personas.ts:1-4`:

   ```ts
   import careerArt from "@/assets/belakang1.webp.asset.json";
   import creativeArt from "@/assets/belakang2.webp.asset.json";
   import adventureArt from "@/assets/belakang3.webp.asset.json";
   import frontArt from "@/assets/depan.webp.asset.json";
   ```

   And lines 33, 34, 67, 68, 101, 102 use `.url` from these JSON objects.
   Inspection of `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js` showed `ASSET_RE = /^\/__l5e\/assets-v1\//` only forwards requests when running inside Lovable's preview proxy. In standalone production builds (`npm run build`), these assets are omitted from `.output/public`, returning 404.

4. **Persona Structure & Existing TypeScript Error**:
   `src/data/personas.ts` exports `personas` (Record with `career`, `creative`, `adventure`), `personaKeys`, and `getRandomQuote`.
   Command `npx tsc --noEmit` produced:
   `src/data/personas.ts:134:26 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.`
   `src/data/personas.ts:140:3 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.`
   Caused by `tsconfig.json` `"noUncheckedIndexedAccess": true`.

5. **Component Image Consumers**:
   - `InteractiveDeck.tsx`: Lines 65, 98, 129 consume `personas.career.image`, `personas.adventure.image`, `personas.creative.frontImage`.
   - `ReflectionDilemma.tsx`: Line 101-104 renders `TarotCard3D` with `frontImage={item.frontImage}` and `backImage={item.image}` for all 3 cards.
   - `TarotCard3D.tsx`: Line 118, 151 renders `frontImage` and `backImage` inside a 3D tilt card with aspect ratio `aspect-[768/1086]`.
   - `routes/index.tsx`: Line 304, 305 passes `persona.frontImage` and `persona.image` to `TarotCard3D` in the Grand Revelation screen.
   - `KeepsakePhotoCard.tsx`: Lines 116, 141 render `persona.frontImage` and `persona.image` inside the printable keepsake frame, which uses `html-to-image` `toPng` (canvas-based). External/broken proxy URLs break canvas rendering due to CORS and 404s.

---

## 2. Logic Chain

1. From Observation 1, the 4 high-resolution JPEG files exist and are verified intact, with a 724×1024 dimension that matches the ISO ratio ($1/\sqrt{2}$) and the UI's `768/1086` aspect ratio within <0.02% tolerance.
2. From Observation 2, `src/assets/cards/` must be created by the implementer, and the 4 files copied to:
   - `card-front.jpg`
   - `card-career.jpg`
   - `card-creative.jpg`
   - `card-adventure.jpg`
3. From Observation 3, the current app is dependent on Lovable preview proxy URLs (`/__l5e/...`). In production and offline operation, these images fail. Switching to Vite ESM imports (`import cardFront from "@/assets/cards/card-front.jpg"`) enables Vite to hash, bundle, and serve them locally from `.output/public`.
4. From Observation 5, `KeepsakePhotoCard` uses `html-to-image` (`toPng`). Moving to local bundled assets guarantees that canvas capture will not suffer CORS tainting or 404 network failures when users click "Unduh Kartu (PNG)".
5. From Observation 4, resolving `getRandomQuote` array indexing with nullish coalescing (`pool[0] ?? ""` and `pool[nextIndex] ?? ""`) resolves the `tsc` compiler errors when `personas.ts` is updated.
6. A dedicated Vitest test suite (`src/test/card-assets.test.ts`) can verify:
   - Disk existence of all 4 files with size > 200 KB
   - Binary JPEG header validation (`FF D8 FF`)
   - Vite ESM resolution to non-empty strings
   - Absence of any `__l5e` strings in persona image properties
   - 1 front image shared by all 3 personas, and 3 distinct back images.

---

## 3. Caveats

- **Investigation Boundary**: We inspected code, assets, build logs, and types in read-only mode. We did not copy files or modify `personas.ts` as that is delegated to the implementation agent.
- **Teachable Machine Models**: `ScannerHUD.tsx` classifies cards using Teachable Machine classes (`Career`, `Creative`, `Adventure`), which map directly to `classifyLabel` in `src/lib/classifier.ts`. It does not rely on image file paths.

---

## 4. Conclusion

The asset migration path is completely clear and low-risk:

1. Create `src/assets/cards/` and copy the 4 uploaded JPEGs with normalized filenames.
2. Update `src/data/personas.ts` to import them directly via Vite ESM, assign them to `image` and `frontImage`, and fix the `noUncheckedIndexedAccess` return statements.
3. Delete the 4 legacy `.asset.json` files in `src/assets/`.
4. Implement `src/test/card-assets.test.ts` to enforce asset presence and bundle integrity via `npm test`.

---

## 5. Verification Method

1. **Verify Asset Presence & Resolution**:
   ```bash
   ls -lh src/assets/cards/*.jpg
   ```
2. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   (Should return 0 errors after `getRandomQuote` fix).
3. **Verify Vitest Test Suite**:
   ```bash
   npm test
   ```
   (All tests including new `card-assets.test.ts` should pass).
4. **Verify Vite & Nitro Production Build**:
   ```bash
   npm run build
   ```
   (Should bundle the 4 card assets into `.output/public/assets/` without warnings).
