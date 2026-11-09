# Tasks — 003 video/status fix

1. Write `tests/video-status.test.mjs` (R1 data checks + dist HTML checks, dist tests self-skip if no `dist/`). Run → confirm RED for the right reasons.
2. Fix `data/youtube.json`: replace with correct 10-entry map.
3. Fix front matter `youtubeId`/`youtubeUrl` in hoi-001..008 (correct IDs); add to hoi-009, hoi-010; confirm hoi-011..052 untouched (no field).
4. Fix `content/series/tan-dang-ky/series.json` status.
5. Fix `src/pages/index.astro`: facet label, band paragraph (use `eps.length`/`videos.length`).
6. Fix `src/pages/truyen/index.astro`: shelf-note paragraph.
7. Fix `src/pages/truyen/[series]/[episode].astro`: end-of-series block for `next === null`.
8. `npm test` → GREEN. `npm run build` → GREEN, 57 pages. Re-run dist-dependent tests → GREEN.
9. `git diff --stat` sanity check: only expected files touched.
