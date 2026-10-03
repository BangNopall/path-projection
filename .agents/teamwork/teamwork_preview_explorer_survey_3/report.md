# Explorer 3 Survey Report: UI Screens, Kinetic Text Reveal & SGE 2026 Brand Identity

**Target Project**: `/Users/noxval/_PROJECT_/path-projection`  
**Brand Reference Project**: `/Users/noxval/_PROJECT_/websge2026`  
**Date**: 2026-10-02  
**Status**: Investigation Complete  

---

## 1. Executive Summary

This report provides an exhaustive mapping of the visual design system, the 5 active interactive screens in the SGE 2026 booth application ("Guess Who Are You"), the current typewriter text display mechanics, and the official Student Government Executive (SGE 2026) FILKOM UB brand identity.

Key findings:
1. **Screen Flow & Locations**: The 5 screens are orchestrated cleanly in `src/routes/index.tsx` via state `screen: "home" | "dilemma" | "scan" | "reveal" | "photo"`. However, the visual aesthetics rely on heavy generic cyberpunk glows (`blur-[75px]`, `mix-blend-mode: color-dodge`, electric laser scanline shadows, and bright neon teal borders) rather than the clean, sophisticated neo-editorial aesthetic of SGE 2026.
2. **Current Text Reveal Flaw**: The reflection quote in Grand Revelation (`routes/index.tsx:79-97`) is implemented as an imperative character-by-character `setInterval` slice with a blinking block cursor (`▍`) in monospace font, which causes jumpy word-wrapping and contradicts the modern kinetic blur-to-focus editorial brief.
3. **Official SGE 2026 Brand Identity**: Deep inspection of `/Users/noxval/_PROJECT_/websge2026` reveals a mature design language:
   - Authentic color palette: `#1F6F78` (Steady Teal), `#3A8C9A` (Pacific Ocean), `#57D4DD` (Coral Aqua), `#F2B705` (Mustard Gold), `#FFFAF0` (Warm Background), `#393D3F` (Charcoal), `#FFEFD3` (Papaya Whip), `#FDFDFF` (White).
   - Authentic circuit textures (`PatternTeal.svg`, `PatternTopTeal.svg`) featuring PCB trace geometry matching the physical cards.
   - Design patterns: Polaroid photo frames (`CabinetCard.tsx`), gold light sweeps (`CabValueCard.tsx`), folder tab cards (`EventCard.tsx`), and stamp perforations.
4. **CSS Token Bug Uncovered**: In `src/data/personas.ts`, `accentColor` references `var(--sge-mustard-gold)` and `var(--sge-coral-aqua)`, but `src/styles.css` only declares `var(--SGEMustardGold)` and `var(--SGECoralAqua)` in `:root`. As a result, CSS variable lookups fail silently.
5. **Technical Specifications Formulated**: Rigorous specifications for **R2** (Neo-Editorial Bento Grid, 1px border-white/10, circuit backdrop, postage-stamp perforated borders, spring physics) and **R3** (Kinetic word-by-word reveal with `filter: blur(8px) -> blur(0px)`, golden sweep sheen, and reroll button).

---

## 2. Comprehensive Screen-by-Screen Visual Architecture & Glow Effects

The application operates as a single-page interactive booth experience under `src/routes/index.tsx`, switching between 5 discrete screen states wrapped in `<AnimatePresence mode="wait">`.

### Screen 1: Home Deck (Landing Page)
- **Primary Source**: `src/routes/index.tsx` (lines 187–260) and `src/components/booth/InteractiveDeck.tsx` (lines 1–150).
- **Layout Structure**:
  - Two-column responsive hero (`lg:grid-cols-[1.1fr_0.9fr] lg:gap-14`).
  - Left column:
    - Status capsule: "Student Government Expo 2026" with glowing pulsing dot (`shadow-[0_0_12px_var(--SGECoralAqua)]`).
    - Subhead: "✦ TAROT REFLEKSI MASA DEPAN ✦" in `text-[var(--SGEMustardGold)] font-display`.
    - Main display headline: "Siapa kamu di masa depan?" with `.shine-text` gradient fill.
    - Two primary CTAs: "Mulai Membaca Takdir" (Button `variant="luminous"` with `shadow-[0_8px_30px_rgba(87,212,221,0.25)]`) and "Scan Kartu Kamera" (outline button).
    - Helper card at bottom: gold icon badge with `HelpCircle` explaining physical card pickup.
  - Right column (`InteractiveDeck.tsx`):
    - Ambient rings: `bg-[var(--SGECoralAqua)]/15 blur-[75px]` and a 60-second spinning dashed gold circle (`animate-[spin_60s_linear_infinite]`).
    - Floating particles: `animate-pulse`, `animate-ping opacity-60`.
    - 3-card fanned deck: Career card (-20° left), Adventure card (+18° right), and Creative/Mascot card (0° center).
    - Shuffle button at bottom: "Kocok Kartu ✦ SGE 2026".
- **Styling & Cyber-Glow Assessment**:
  - Uses `.deck-card` from `styles.css:189-204` with loud multi-color gradients: `linear-gradient(145deg, rgba(87, 212, 221, 0.65), rgba(31, 111, 120, 0.4), rgba(242, 183, 5, 0.5))`.
  - Uses `.hologram-foil` with `mix-blend-mode: color-dodge` which looks like a disco overlay.
  - Ambient `blur-[75px]` blob and `animate-ping` stardust particles feel like generic Web3/crypto templates rather than an academic expo tarot reading.
- **R2 Modernization Strategy**:
  - Replace the multi-color gradient border on cards with a crisp 1px subtle `border-white/10` or gold micro-border (`border-[#F2B705]/20`).
  - Replace spinning cyber rings with an elegant, soft circuit texture backdrop matching the physical tarot card backings.
  - Retain the interactive shuffle physics and card fan fanning, but refine hover states to use organic spring transitions.

---

### Screen 2: Dilemma Reflection
- **Primary Source**: `src/components/booth/ReflectionDilemma.tsx` (lines 1–153).
- **Layout Structure**:
  - Header: Back button, breadcrumb "Tahap 01 · Dilema Refleksi" (`text-[var(--SGECoralAqua)]`), and "Gunakan Kamera Scanner" secondary CTA.
  - Dilemma Banner: `.notched-box` with `border border-[var(--SGEMustardGold)]/30 bg-[#0F1E21]/80 backdrop-blur-md` posing the core question: *“Jika kamu hanya diizinkan membawa satu hal ini ke masa depanmu, mana yang akan kamu pilih?”*.
  - 3-Card Selection Grid: `grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10`.
    - Each column features a `TarotCard3D` preview with `isFlipped={true}`.
    - Below the card: Category capsule badge (`NO. 01`, `NO. 02`, `NO. 03`), title (`Karier & Kepemimpinan`, `Kreativitas & Jiwa`, `Petualangan & Batas Baru`), subtitle, and "Pilih Nilai Ini" button.
- **Styling & Cyber-Glow Assessment**:
  - Card containers use heavy hover shadows: `hover:shadow-[0_15px_45px_rgba(87,212,221,0.15)]` and `hover:border-[var(--SGECoralAqua)]/60`.
- **R2 Modernization Strategy**:
  - Redesign into a **Neo-Editorial Bento Grid**:
    - Give each persona card a distinct editorial character: postage-stamp perforated outer edges, elegant ticket notch cutouts, clean 1px `border-white/10`.
    - Add tactile spring hover elevation (`whileHover={{ y: -6, scale: 1.015 }}`).
    - Typography refinement: Use `Space Grotesk` for numbers and titles, `Courier Prime` for serial/edition badges (`EDITION 2026 // SGE-01`), and `Inter` for descriptive subtitles.

---

### Screen 3: Scanner HUD
- **Primary Source**: `src/components/booth/ScannerHUD.tsx` (lines 1–358).
- **Layout Structure**:
  - Asymmetric 2-column layout (`lg:grid-cols-[minmax(0,1.2fr)_360px]`).
  - Left column (Viewfinder):
    - Video camera stream container with `.glass-surface` and `.glass-edge` (`box-shadow: 0 0 40px var(--glow-primary)`).
    - Center reticle: Aspect ratio `[768/1086]`, 4 corner brackets, and a moving laser beam (`.scan-line`).
    - Status readouts: "LIVE SCAN" badge, bottom floating status bar.
  - Right column (Telemetry & Manual Fallback):
    - Real-time classification confidence bar (0–100%).
    - Lock hold indicator (1400ms hold threshold) with gold progress bar.
    - Manual card selector drawer ("Pencahayaan Booth Kurang Bagus?") for camera fallback.
- **Styling & Cyber-Glow Assessment**:
  - Heavy laser scanline animation: `box-shadow: 0 0 26px var(--SGECoralAqua)` with `@keyframes scan`.
  - Reticle shadow: `shadow-[0_0_50px_rgba(87,212,221,0.2)]`.
- **R2 Modernization Strategy**:
  - Modernize from "sci-fi combat HUD" to "high-precision editorial optical frame":
    - Thin 1px subtle crosshairs and corner alignment markers in muted aqua (`rgba(87, 212, 221, 0.4)`).
    - Replace the blinding cyan laser bar with a soft golden/aqua optical alignment scanline (`opacity: 0.6`).
    - Use `Courier Prime` for telemetry readouts (aspect ratio, sensor status, confidence score `CONF: 94.2%`).
    - Retain 100% of the robust Teachable Machine classifier and manual bypass logic.

---

### Screen 4: Grand Revelation
- **Primary Source**: `src/routes/index.tsx` (lines 281–394) and `src/components/booth/TarotCard3D.tsx` (lines 1–171).
- **Layout Structure**:
  - Top header: "Tahap 02 · Pembacaan Persona Takdir", "Kartu Masa Depanmu Terbuka".
  - Two-column layout (`lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)]`):
    - Left: Full interactive `TarotCard3D` revealing the authentic persona card artwork with 3D pointer tilt.
    - Right: Persona header (`YOUR FUTURE PERSONA`, `NO. 01 — CAREER & FOUNDATION`), Persona title (`The Foundation Builder`), quote box, persona tag pills, and 3 action buttons ("Buat Kartu Fotomu", "Tarik Refleksi Baru", "Main Lagi").
- **Current Text Display Analysis**:
  - Quote box (`routes/index.tsx:331-341`):
    ```tsx
    <div className="mt-6 border-l-2 border-[var(--SGECoralAqua)] bg-[#0F1E21]/60 p-5 rounded-r-xl text-left backdrop-blur-sm">
      <p className="min-h-24 font-mono text-sm sm:text-lg leading-relaxed text-white/95">
        “{displayedText}
        {isTypewriting && (
          <span className="animate-pulse text-[var(--SGECoralAqua)] font-bold">▍</span>
        )}
        ”
      </p>
    </div>
    ```
  - Mechanism: An effect (`routes/index.tsx:79-97`) running `setInterval` every 28ms, adding 2 characters per tick to `displayedText`.
  - Problems:
    1. Cuts words in half during rendering, resulting in erratic line breaks on multi-line quotes.
    2. Uses a retro monospace typewriter cursor (`▍`) that conflicts with an editorial tarot narrative.
    3. No visual crescendo or celebratory completion feedback when the prophetic sentence finishes.

---

### Screen 5: Keepsake Photo Studio
- **Primary Source**: `src/components/booth/KeepsakePhotoCard.tsx` (lines 1–262).
- **Layout Structure**:
  - Two-column layout (`lg:grid-cols-[minmax(0,1fr)_380px]`):
    - Left: Exportable `9:16` portrait keepsake frame captured via `html-to-image` (`toPng`). Contains:
      - Header: Mascot logo, `GUESS WHO ARE YOU.`, `PKKMB FILKOM UB · SGE 2026`, `CARD NO. 01`.
      - Center: Tarot card artwork in gold frame, title badge, and reflection quote in italics.
      - Footer: Participant's custom name ("FUTURE BELONGS TO: Budi Santoso"), tags, and SGE QR Code (`QRCodeSVG`).
    - Right: Name input, "Unduh Kartu (PNG)" CTA, "Salin Tautan Booth", "Main Ulang dari Beranda".
- **R2 Modernization Strategy**:
  - Upgrade the keepsake frame to match the official SGE Polaroid card style seen in `websge2026/components/Cabinet/CabinetCard.tsx`:
    - Authentic dual-tone frame: outer cream border (`#FFFAF0` / `#FFEFD3`), Steady Teal header capsule (`#1F6F78`), gold foiled accents (`#F2B705`).
    - Perforated stamp edge border or ticket notches on the exportable image.
    - Soft circuit watermark texture in the background.

---

## 3. Inspection of the Official SGE 2026 Brand Identity (`websge2026`)

We thoroughly inspected the companion repository at `/Users/noxval/_PROJECT_/websge2026`.

### 3.1 Color Palette Tokens
From `websge2026/app/globals.css` (lines 6–14):
| Token Name | Hex Code | Role in SGE 2026 Brand |
|---|---|---|
| `--SGESteadyTeal` | `#1F6F78` | Primary brand anchor, header bars, folder tabs, scrollbar thumbs |
| `--SGEPacificOcean` | `#3A8C9A` | Secondary oceanic teal, category badges, supporting contrast |
| `--SGECoralAqua` | `#57D4DD` | Electric aqua accent, active highlights, glowing indicator dots |
| `--SGEMustardGold` | `#F2B705` | Warm gold, star badges, celebratory light sweeps, key highlights |
| `--SGEPapayaWhip` | `#FFEFD3` | Warm cream/papaya tint, scrollbar track, card backings |
| `--SGEBackground` | `#FFFAF0` | Warm cream canvas base, paper texture surface |
| `--SGECharcoal` | `#393D3F` | Dark charcoal neutral, dark typography, stamp outlines |
| `--SGEPutee` | `#FDFDFF` | Crisp pure white, clean text, high-contrast highlights |
| Booth Dark Canvas | `#081113` | Deep cosmic teal-charcoal (tailored for dark booth projection) |
| Booth Card Surface | `#0F1E21` | Deep teal-panel surface (1px subtle border-white/10) |

### 3.2 Typography Hierarchy
From `websge2026/app/layout.tsx` (lines 6–34):
- **Display / Headlines**: `Space Grotesk` (`--font-space-grotesk` / `--font-grotesk`). Geometric, humanist, modern editorial.
- **Body & Microcopy**: `Inter` (`--font-inter`). Extremely legible at all scales, used for UI controls.
- **Editorial / Serial / Telemetry**: `Courier Prime` (`--font-courier-prime`). Used for card roles, ticket badges, participant names, and serial numbers.
- **Mono Fallback**: `Geist Mono` (`--font-geist-mono`).

*Verification*: In `src/routes/__root.tsx` (lines 94–95), Google Fonts for `Courier Prime`, `Inter`, and `Space Grotesk` are already linked in the HTML `<head>`.

### 3.3 Authentic Circuit Textures & SVG Assets
From `websge2026/public/`:
- `PatternTeal.svg` & `PatternTopTeal.svg`: 3447×1142 high-resolution circuit board trace vectors with micro-vias and bus lines in Steady Teal and Coral Aqua. Used across headers and section dividers with `opacity-30`.
- `PaperTexture.svg`: Subtle organic paper grain overlay (`opacity: 0.12`).
- `LogoSGE.svg` & `LogoSGE1.svg`: Official SGE flame-and-book emblem with FILKOM UB insignia.
- `OverlaySGE.webp`: Atmospheric layered backdrop.

### 3.4 Key UI Component Patterns from `websge2026`
1. **Polaroid / Keepsake Card Flip (`CabinetCard.tsx`)**:
   - 3D CSS perspective flip (`perspective: 1000px`, `transformStyle: "preserve-3d"`).
   - Steady Teal header tab: `bg-[#1F6F78] h-[36px] flex items-center justify-center font-courier-prime text-white uppercase text-[11px]`.
   - Dual-tone borders: outer `#F9C673`, inner `#E5C391`, card face `#FEF5DF`.
2. **Light Sweep Effect (`CabValueCard.tsx`)**:
   - Diagonal shine bar:
     `background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)"`,
     `transform: "translateX(-110%) -> translateX(110%)"`.
3. **Folder Tab & Capsule Badges (`EventCard.tsx`)**:
   - Distinctive notched tab: `rounded-tl-2xl rounded-tr-md bg-[#1F6F78]`.
   - Circle arrow icon: `w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md`.

### 3.5 Critical Bug Discovered in Existing Codebase
In `src/data/personas.ts`:
- Line 35: `accentColor: "var(--sge-mustard-gold)"` (lowercase kebab-case)
- Line 69: `accentColor: "var(--sge-coral-aqua)"`
- Line 103: `accentColor: "var(--sge-pacific-ocean)"`

However, in `src/styles.css`:
- Lines 58–65 define CSS variables as `--SGEMustardGold`, `--SGECoralAqua`, `--SGEPacificOcean`!
- Tailwind v4 `@theme inline` exposes them as `--color-sge-gold`, `--color-sge-aqua`, etc.
- **Result**: `var(--sge-mustard-gold)` does NOT exist in CSS, causing browser styles referencing `accentColor` to fail or resolve to transparent/fallback!
- **Fix**: Align CSS variable definitions so both `--SGEMustardGold` and `--sge-mustard-gold` (or direct hex constants) resolve accurately.

---

## 4. Technical Specification: Requirement R2 (Neo-Editorial Bento Grid & Modern Layout Overhaul)

### 4.1 Layout System & Bento Architecture
- **Grid Layout**: Implement CSS Grid with asymmetric bento cell proportions:
  - Desktop: `grid grid-cols-12 gap-6`.
  - Mobile/Tablet: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4`.
- **Card Surfaces**:
  - Background: `bg-[#0F1E21]/80 backdrop-blur-xl`.
  - Border: Clean 1px subtle `border border-white/10` (no neon glow).
  - Inner Padding: `p-6 sm:p-8`.
  - Corner Radius: `rounded-2xl`.
- **Editorial Micro-Accents**:
  - Monospace Stamp Capsule: `font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--SGEPapayaWhip)]/70`.
  - Serial Metadata: e.g. `// FILKOM.UB.SGE.2026 · REF.01`.
  - Corner Tick Accents: Subtle 1px corner markers on bento cards.

### 4.2 Soft Circuit Texture Backdrop
- Instead of high-blur neon circles, introduce a subtle SVG circuit trace backdrop:
  ```css
  .circuit-backdrop {
    background-image: 
      radial-gradient(circle at 50% 10%, rgba(31, 111, 120, 0.18), transparent 70%),
      url("data:image/svg+xml,..."); /* SVG circuit PCB trace pattern */
    background-size: cover, 480px 480px;
    background-repeat: no-repeat, repeat;
    opacity: 0.12;
  }
  ```
- Positioned absolutely as a non-interactive backdrop layer (`pointer-events-none`).

### 4.3 Postage-Stamp Perforated Card Borders
For tarot cards and the keepsake photo card, introduce authentic postage-stamp perforated edging:
- **CSS Perforation Mask Method**:
  ```css
  .stamp-perforated {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .stamp-perforated::before {
    content: "";
    position: absolute;
    inset: -4px;
    background: radial-gradient(circle at 4px 4px, transparent 3px, currentColor 3.5px);
    background-size: 16px 16px;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    pointer-events-none;
    opacity: 0.25;
  }
  ```
- Alternatively, ticket-notch cutouts on the sides with a dashed divider line (`border-t border-dashed border-white/15`).

### 4.4 Responsive Spring Hover Micro-Interactions
Using `motion/react` spring physics:
```tsx
const springHover = {
  whileHover: { y: -5, scale: 1.015 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
};
```
Applied to:
- Interactive cards in `InteractiveDeck.tsx` and `ReflectionDilemma.tsx`.
- CTAs and buttons.
- Category badge capsules.

### 4.5 3D Physical Card Tilt (`TarotCard3D.tsx`)
Enhance the existing tilt calculation:
- Max tilt angle: ±12° X/Y.
- Perspective: `1200px`.
- Dynamic Specular Sheen: Radial gradient following pointer coordinates:
  `background: radial-gradient(circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 239, 211, 0.35) 0%, rgba(87, 212, 221, 0.15) 45%, transparent 70%)`.
- Graceful return: On `pointerLeave`, reset to `0deg` using a smooth spring transition.

---

## 5. Technical Specification: Requirement R3 (Kinetic Word-by-Word Blur & Fade Sentence Reveal)

### 5.1 Component Architecture: `KineticSentenceReveal.tsx`
Create a new standalone component `src/components/booth/KineticSentenceReveal.tsx`.

```tsx
interface KineticSentenceRevealProps {
  quote: string;
  accentColor?: string;
  onComplete?: () => void;
  className?: string;
}
```

### 5.2 Word-by-Word Blur & Fade Animation
- **Text Splitting**: Split quote string into words: `const words = quote.trim().split(/\s+/);`.
- **Framer Motion Container & Children**:
  - Container variant:
    ```tsx
    const containerVariants = {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.045, // 45ms per word
          delayChildren: 0.1,
        },
      },
    };
    ```
  - Word child variant:
    ```tsx
    const wordVariants = {
      hidden: {
        filter: "blur(8px)",
        opacity: 0,
        y: 8,
      },
      visible: {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 160,
          damping: 20,
        },
      },
    };
    ```
- **Markup**:
  Each word rendered as:
  ```tsx
  <span className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
    <motion.span variants={wordVariants} className="inline-block">
      {word}
    </motion.span>
  </span>
  ```

### 5.3 Golden Sweep Effect
Upon sentence completion (calculated as `words.length * 0.045s + 0.35s` or via `onAnimationComplete` of the final word):
- Trigger golden shine sweep overlay across the quote box:
  ```tsx
  <motion.div
    initial={{ x: "-120%", opacity: 0 }}
    animate={{ x: "130%", opacity: [0, 0.8, 0.8, 0] }}
    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: totalWordTime }}
    className="pointer-events-none absolute inset-0 z-10"
    style={{
      background:
        "linear-gradient(105deg, transparent 20%, rgba(242, 183, 5, 0.3) 48%, rgba(255, 239, 211, 0.6) 52%, transparent 80%)",
    }}
  />
  ```
- Highlight border briefly with a subtle golden glow border pulse (`border-[var(--SGEMustardGold)]/50`).

### 5.4 "Tarik Refleksi Baru" Reroll Button
- **Placement**: Placed directly alongside "Buat Kartu Fotomu" in Grand Revelation.
- **Interaction**:
  - User clicks "Tarik Refleksi Baru".
  - Audio tone plays: `playAudioTone("shuffle", sound)`.
  - Icon rotates 360° smoothly.
  - New quote is retrieved: `getRandomQuote(selected, currentQuoteIndex)`.
  - Quote key increments (`key={`${selected}-${quoteIndex}-${rerollKey}`}`), which unmounts the previous quote and triggers the kinetic blur-to-focus animation cleanly from word 1 without layout shifts.

---

## 6. Verification & Implementation Checklist

| Requirement | Proposed Change | Verification Command / Target |
|---|---|---|
| R2: Palette & Tokens | Fix CSS variable casing in `src/styles.css` & `src/data/personas.ts` | Verify computed styles in browser & tests |
| R2: Glow Removal | Remove `blur-[75px]`, `mix-blend-mode: color-dodge` & replace with 1px `border-white/10` | Visual inspection across all 5 screens |
| R2: Circuit Backdrop | Add soft circuit backdrop SVG overlay in `src/styles.css` & `InteractiveDeck.tsx` | Visual check in dev server |
| R2: Stamp Borders | Implement postage-stamp perforated edging on tarot & photo cards | Verify in `TarotCard3D.tsx` & `KeepsakePhotoCard.tsx` |
| R3: Kinetic Reveal | Build `KineticSentenceReveal.tsx` with `filter: blur(8px) -> blur(0px)` | Mount in `routes/index.tsx` screen="reveal" |
| R3: Golden Sweep | Implement sweep animation overlay triggered post-reveal | Verify visual sweep timing |
| R3: Reroll Button | Connect "Tarik Refleksi Baru" button with reroll quote state & shuffle tone | Click test & Vitest unit tests |
| Quality Gates | Run full Vitest suite, ESLint check, and Vite build | `npm test`, `npm run lint`, `npm run build` |

---

*Report prepared by Explorer 3 (UI Screens and Brand Explorer)*
