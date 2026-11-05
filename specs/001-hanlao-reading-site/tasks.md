# Tasks: Hàn Lão Đọc Truyện — Personal Reading Site

**Input**: Design documents from `/specs/001-hanlao-reading-site/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup

- [ ] T001 Configure package.json scripts (dev, build, preview, sync, test, qa) and ESM type in package.json
- [ ] T002 Create astro.config.mjs with site/base env, sitemap integration, static output
- [ ] T003 [P] Add tsconfig.json and .gitignore (node_modules, dist, .astro)

## Phase 2: Foundational

- [ ] T004 Implement pure stripping + slugify functions in scripts/strip.mjs
- [ ] T005 [P] Unit tests for stripping in tests/strip.test.mjs
- [ ] T006 Implement sync in scripts/sync.mjs (read-only source, writes content/series/<slug>/hoi-NNN.md, series.json if absent, content/about.json)
- [ ] T007 Run `npm run sync`; commit synced content and data/youtube.json
- [ ] T008 Define content collection schema in src/content.config.ts
- [ ] T009 [P] Site config + base-path helpers in src/lib/site.ts; episode/series queries in src/lib/episodes.ts
- [ ] T010 Global design system (palette, typography, themes, animations, reduced motion) in src/styles/global.css
- [ ] T011 BaseLayout with SEO/OG/Twitter/canonical/JSON-LD in src/layouts/BaseLayout.astro; Header and Footer (AI disclosure) components

## Phase 3: User Story 1 — Read an episode (P1) 🎯 MVP

- [ ] T012 [US1] Episode page src/pages/truyen/[series]/[episode].astro with prose, chapter TOC, prev/next, episodes drawer; next_title teaser when no next episode; works without JS
- [ ] T013 [P] [US1] YouTubeFacade component src/components/YouTubeFacade.astro
- [ ] T014 [US1] ReaderToolbar component (themes ×7, font, size/line-height/width sliders, auto-scroll, immersive, TTS, TOC) src/components/ReaderToolbar.astro
- [ ] T015 [US1] Reader client logic src/scripts/reader.ts (prefs persistence, progress bar, resume position, auto-scroll + keyboard + tap-to-pause, fullscreen, TTS vi-VN, ←/→ navigation; all storage in try/catch)
- [ ] T016 [US1] Early inline prefs bootstrap to avoid theme flash (src/scripts/prefs.ts inline in layout)

## Phase 4: User Story 2 — Discover (P2)

- [ ] T017 [P] [US2] HeroArt and SeriesCover SVG components in src/components/
- [ ] T018 [US2] Home page src/pages/index.astro (hero, continue reading, latest episodes, series list, channel CTA)
- [ ] T019 [US2] Series page src/pages/truyen/[series]/index.astro and series index src/pages/truyen/index.astro
- [ ] T020 [P] [US2] "Đọc tiếp" client snippet src/scripts/continue.ts

## Phase 5: User Story 3 — Publish new episode (P2)

- [ ] T021 [US3] Verify idempotent sync (run twice, `git diff --exit-code content/`) and document workflow in README.md

## Phase 6: User Story 4 — About, feeds, sharing (P3)

- [ ] T022 [P] [US4] About page src/pages/gioi-thieu.astro from content/about.json
- [ ] T023 [P] [US4] RSS src/pages/rss.xml.ts; robots src/pages/robots.txt.ts; 404 page
- [ ] T024 [P] [US4] favicon.svg, og-default.svg and og-default.png in public/

## Phase 7: Polish & Cross-Cutting

- [ ] T025 GitHub Pages workflow .github/workflows/deploy.yml (+ Cloudflare notes in README)
- [ ] T026 `npm run build` passes; grep dist for leftover `<!--`/`[pause]` production markers; measure JS gz size per page (< 60 KB)
- [ ] T027 Screenshot QA script scripts/screenshots.mjs; capture home/series/chapter × mobile/desktop into qa/
- [ ] T028 [P] README.md (add story/episode, deploy GitHub/Cloudflare)
- [ ] T029 docs/web-progress.md final status; local milestone commits

## Dependencies

Setup → Foundational (T004–T011) → US1 → US2 → US3/US4 (parallel) → Polish.
