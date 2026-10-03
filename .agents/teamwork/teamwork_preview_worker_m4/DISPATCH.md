## 2026-10-02T18:44:49Z
[Message] timestamp=2026-10-02T18:44:49Z sender=2fe0454e-5ca7-4848-bb32-5dc93b7a2d5f priority=MESSAGE_PRIORITY_HIGH content=You are Worker M4 (5-Screen Layout Overhaul Implementer).
Your working directory is:
/Users/noxval/_PROJECT_/path-projection/.agents/teamwork/teamwork_preview_worker_m4

MANDATORY FIRST STEP: Read the original user requirements in:
/Users/noxval/_PROJECT_/path-projection/.agents/teamwork/ORIGINAL_REQUEST.md
Also read the project architecture in:
/Users/noxval/_PROJECT_/path-projection/PROJECT.md
Review Explorer 3's findings:
/Users/noxval/_PROJECT_/path-projection/.agents/teamwork/teamwork_preview_explorer_survey_3/report.md
And review worker deliverables:
- KineticSentenceReveal: /Users/noxval/_PROJECT_/path-projection/.agents/teamwork/teamwork_preview_worker_m2/handoff.md
- Brand Design System: /Users/noxval/_PROJECT_/path-projection/.agents/teamwork/teamwork_preview_worker_m3/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your scope of work (M4):
Overhaul all 5 screens across the application:
1. Screen 1 (Home Deck) in `src/components/booth/InteractiveDeck.tsx` and `src/routes/index.tsx`:
   - Replace generic cyberpunk glow blobs with refined Neo-Editorial Bento styling.
   - Use SGE 2026 palette (`#1F6F78`, `#3A8C9A`, `#57D4DD`, `#F2B705`, `#FFFAF0`), subtle 1px `border-white/10`, `.circuit-pattern-bg`.
   - Responsive spring hover micro-interactions on cards, badges, and CTA buttons.
2. Screen 2 (Dilemma Reflection) in `src/components/booth/ReflectionDilemma.tsx`:
   - Clean editorial bento layout for the 3 path cards.
   - SGE 2026 color scheme with postage-stamp perforated edging and clean typography.
   - Responsive spring micro-interactions on cards and buttons.
3. Screen 3 (Scanner HUD) in `src/components/booth/ScannerHUD.tsx`:
   - Modern editorial camera frame, subtle circuit texture borders, clean reticle.
   - Ensure manual fallback drawer remains 100% accessible, responsive, and client-side offline.
4. Screen 4 (Grand Revelation) in `src/routes/index.tsx`:
   - Import and integrate `KineticSentenceReveal` from `@/components/booth/KineticSentenceReveal`.
   - Eliminate the old monospace `setInterval` typewriter and blinking cursor.
   - Connect the "Tarik Refleksi Baru" reroll button to quote shuffling with sound cue and proper non-repetition via `getRandomQuote(selected, currentQuote)`.
   - Mount the 3D revealed card with `.stamp-border`, specular highlight sheen, and SGE 2026 color palette.
5. Screen 5 (Keepsake Photo Studio) in `src/components/booth/KeepsakePhotoCard.tsx`:
   - Polaroid editorial styling with SGE 2026 branding (`#1F6F78` header banner, subtle circuit texture backdrop, corner registration marks).
   - Local card assets ensure 100% reliable canvas export (`html-to-image` `toPng`) with zero CORS canvas tainting or network failures.
   - Polish download and share actions with spring micro-interactions.
6. Verification:
   - Run `npx tsc --noEmit` -> 0 errors.
   - Run `npm run lint` -> 0 errors, 0 warnings.
   - Run `npm test` -> 100% pass across all test suites.
   - Run `npm run build` -> Exit code 0.
7. Write detailed report in `report.md` and handoff in `handoff.md` in your working directory.
8. Send message back to parent via `send_message`.
