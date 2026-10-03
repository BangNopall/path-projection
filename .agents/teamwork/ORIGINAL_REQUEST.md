# Original User Request

## Initial Request — 2026-10-02T18:08:48Z

Refactor and modernize the PKKMB FILKOM UB - SGE 2026 Booth Game ("Guess Who Are You") web application into a sleek, clean, modern editorial interactive experience. Integrate the 4 authentic physical card assets locally, replace the generic AI glowing aesthetic with a refined neo-editorial bento and circuit texture design, implement a kinetic word-by-word blur-to-focus sentence reveal animation, and guarantee zero bugs using a rigorous Test-Driven Development (TDD) workflow.

Working directory: /Users/noxval/_PROJECT_/path-projection
Integrity mode: development

## Requirements

### R1. Authentic Physical Card Asset Pipeline

Migrate the 4 user-uploaded high-resolution card images into `src/assets/cards/` (`card-front.jpg`, `card-career.jpg`, `card-creative.jpg`, `card-adventure.jpg`). Update `src/data/personas.ts` to import these assets directly via Vite ESM, completely eliminating the broken/external Lovable proxy CDN (`/__l5e/...`). Write an automated asset integrity test to verify asset presence and bundle resolution.
User-uploaded images locations:

- Front Mascot: `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332329.jpg`
- Career (Briefcase): `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332334.jpg`
- Adventure (Globe): `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332337.jpg`
- Creative (Palette): `/Users/noxval/.gemini/antigravity/brain/4920c1c7-b59e-464c-b81e-0f4e333bf35e/.user_uploaded/media_1790964332339.jpg`

### R2. Refined Neo-Editorial Bento & Modern Trend Layout Overhaul

Overhaul the visual design across all 5 screens (Home Deck, Dilemma Reflection, Scanner HUD, Grand Revelation, Keepsake Photo Studio):

- Adopt the official SGE 2026 brand identity from `/Users/noxval/_PROJECT_/websge2026` (`#1F6F78`, `#3A8C9A`, `#57D4DD`, `#F2B705`, `#FFFAF0`, `#393D3F`).
- Strip away garish AI-looking cyber glow and replace with clean, breathable modern web editorial aesthetics (1px subtle border-white/10, soft circuit texture backdrop matching the physical cards, postage-stamp perforated card borders).
- Implement responsive spring hover micro-interactions on all cards, buttons, and badges.

### R3. Kinetic Word-by-Word Blur & Fade Sentence Reveal

Replace the basic monospace typewriter effect with a kinetic word-by-word reveal component:

- Words transition sequentially with `filter: blur(8px) -> blur(0px)`, `opacity: 0 -> 1`, and subtle `translateY: 8px -> 0px` with spring easing.
- Accentuate with a warm golden sweep effect upon sentence completion and an interactive "Tarik Refleksi Baru" reroll button.

### R4. Test-Driven Development (TDD) & Quality Assurance

- Implement unit tests covering asset resolution, the kinetic sentence reveal logic, persona quote distribution, classifier accuracy, and router mounting.
- Ensure 100% test pass rate in Vitest, 0 ESLint errors/warnings, and successful production build with Vite and Nitro SSR.

## Acceptance Criteria

### Asset & Visual Verification

- [ ] 4 physical card assets imported directly in `src/assets/cards/` and rendered with zero broken links
- [ ] Visual style reflects clean modern editorial aesthetics with SGE 2026 palette and circuit textures
- [ ] Kinetic word blur-in animation runs smoothly without layout thrashing
- [ ] 3D physical card tilt responds cleanly to pointer and touch coordinates

### Robustness & Code Quality

- [ ] All Vitest unit tests pass (`npm test`)
- [ ] ESLint check reports 0 errors (`npm run lint`)
- [ ] Production build succeeds without errors (`npm run build`)
- [ ] 100% Client-side operation (no accounts or backend server required)
