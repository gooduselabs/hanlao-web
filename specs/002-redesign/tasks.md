# Tasks 002 — Redesign v2

## Phase 1 — Setup & assets
- [x] T001 Spec Kit light docs: spec.md, plan.md, tasks.md (this file)
- [x] T002 `scripts/assets/cover.html` original lantern cover (2:3) + `thumb.html` fallback template + new `og.html`
- [x] T003 `scripts/media.mjs` + `npm run media`: thumbs (read-only copy → WebP 640×360), fallbacks, cover WebP, OG PNG
- [x] T004 New favicon (lantern icon, v2 palette)

## Phase 2 — Foundation
- [x] T005 Rewrite `global.css` with v2 tokens + base typography + components
- [x] T006 `Logo` (original lantern icon + wordmark), `Icon` set
- [x] T007 Header: sticky 64px, nav, search box, YouTube button, mobile hamburger (+ menu script)
- [x] T008 Search: `search.json` index endpoint + client search dropdown (diacritic-insensitive, keyboard)
- [x] T009 Footer `#f5f5f5`: brand column, link columns, AI-assist disclosure, ©
- [x] T010 `src/lib/media.ts` (thumbFor / coverFor)

## Phase 3 — Pages (US1, US3, US4, US5)
- [x] T011 [US1] Home: featured banner (cover, synopsis, tags, Đọc từ đầu / Đọc tiếp / Mục lục) + latest video card
- [x] T012 [US1] Home: "Mới cập nhật" zebra table
- [x] T013 [US1] Home: hồi card grid with thumbnails + "Hồi nổi bật" ranking + "Thể loại" pills sidebar
- [x] T014 [US1] Home: YouTube CTA band (brand blue)
- [x] T015 [US3] Series detail: cover left + info right, tabs, description, 3-col chapter grid, sidebar video hồi
- [x] T016 [US4] Chapter page: grey surround + column, breadcrumbs, centred title, pill nav top & bottom, chips
- [x] T017 [US4] Re-skin reader.css (themes keep working; `--r-surround`; toolbar/panels in v2 style)
- [x] T018 Truyện list page (book card grid), Giới thiệu, 404 in v2 style
- [x] T019 [US5] "Đọc tiếp" pill + read markers wired to existing progress storage

## Phase 4 — Verification & polish
- [x] T020 QA script: wait for lazy images, `chapter-desktop-settings.png`, search check; `npm test`, `npm run build`, `npm run qa` green
- [x] T021 Self-review round 1 vs reference screenshots → fixes
- [x] T022 Self-review round 2 → fixes
- [x] T023 Remove v1 leftovers (unused components/tokens); docs/web-progress.md "Redesign v2"; commit

## Review log
- **Round 1** (vs `docs/reference/webnovel/*`): thumbnail badges doubled the art's own "HỒI N" label → removed;
  "Mới cập nhật" table had dead columns (repeated series name, mostly-empty Video) → replaced with a one-line summary
  + inline YouTube icon; mobile hero kicker pills stacked and "Hồi mới nhất" card took a whole screen → compacted;
  chapter video filled the first viewport → compact media card (thumb + summary, expands on play); series sidebar left
  a tall empty column → sticky; truyện list "Sắp ra mắt" placeholder implied an unconfirmed story → honest note card.
- **Round 2**: chapter chips wrapped 3+1 on mobile → 4-column grid; mobile media card still tall → 136px thumb +
  clamped summary; series action buttons wrapped → single row; cover badge hid cover text on mobile → hidden;
  disabled pill too bright in dark themes → muted; "Đọc tiếp 0%" → percentage hidden under 1%.
