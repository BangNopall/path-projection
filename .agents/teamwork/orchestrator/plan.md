# Execution Plan: PKKMB FILKOM UB - SGE 2026 Booth Game Refactor

## Phase 0: Survey & Codebase Exploration

- Spawn 3 parallel `teamwork_preview_explorer` agents to map:
  1. Explorer 1: Project structure, dependencies, build/test toolchain (Vite, Vitest, ESLint, Tailwind, Lucide, Framer Motion / animations), and current test suite status.
  2. Explorer 2: Asset pipeline, current persona definitions (`src/data/personas.ts`), Lovable CDN usages (`/__l5e/...`), and image file destinations (`src/assets/cards/`).
  3. Explorer 3: Screen architectures (Home Deck, Dilemma Reflection, Scanner HUD, Grand Revelation, Keepsake Photo Studio), SGE 2026 brand design cues in `/Users/noxval/_PROJECT_/websge2026`, and typewriter/kinetic reveal components.
- Aggregate reports into `PROJECT.md` Feature Inventory & Architecture.

## Phase 1: Dual Track Launch

- Track A: E2E Testing Track (spawning E2E Test Writer / Orchestrator for 4-tier opaque-box test suite -> `TEST_READY.md`).
- Track B: Implementation Track (decomposed milestones).

## Phase 2: Milestone Decomposition

- M1: Authentic Card Asset Pipeline (migration, Vite ESM imports, asset integrity tests)
- M2: Kinetic Word-by-Word Reveal Component (blur & fade, golden sweep, reroll)
- M3: SGE 2026 Brand Design System & Micro-Interactions (color scheme, circuit textures, perforated borders, 3D card tilt)
- M4: 5-Screen Layout & Flow Overhaul (Bento grid, responsiveness, camera scanner HUD, keepsake photo studio)
- M5: Full Suite Integration & Pass 100% E2E tests + Adversarial coverage

## Phase 3: Verification & Sentinel Reporting

- Run Vitest, ESLint, Build via workers/auditors.
- Forensic Auditor integrity pass.
- Human report to Sentinel.
