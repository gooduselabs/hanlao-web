# Web progress — Hàn Lão Đọc Truyện

**Status: ✅ complete (v1), 2026-11-05.** Local commits only; no remote created/pushed.

## Spec Kit
| Step | Artifact |
|---|---|
| constitution | `.specify/memory/constitution.md` v1.0.0 (7 principles) |
| specify + clarify | `specs/001-hanlao-reading-site/spec.md` (6 clarifications self-answered), `checklists/requirements.md` |
| plan | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` |
| tasks | `tasks.md` (T001–T029, all done) |
| analyze | `analysis.md` (5 findings, all resolved before coding) |
| implement | this repo |

## Verification
- `npm test`: 6/6 pass · `npm run sync`: 22 hồi, idempotent (2nd run 0 changes)
- `npm run build`: 27 pages, sitemap, RSS, robots, 404 — no production markers in `dist/`
- JS shipped: ~3.6 KB gzipped (budget 60 KB)
- `npm run qa`: 20/20 checks pass, 0 console errors (no horizontal overflow, prefs persist, auto-scroll, resume toast, theme survives reload, YouTube facade, markup stripped) — `qa/report.json`
- Screenshots in `qa/`: home/series/chapter/about × mobile (iPhone 13) / desktop (1440), plus settings-sepia, resume, dark-TOC.

## Notes / follow-ups
- No channel images existed → typographic brand + SVG art (no people).
- Source front matter isn't strict YAML (unquoted colons) → lenient parser in `scripts/strip.mjs`.
- RSS dates are derived (source has no publish dates).
- To go live: create GitHub repo, push, enable Pages (GitHub Actions). Set a custom domain via `SITE_URL` if desired.
- TTS quality depends on an installed vi-VN voice in the reader's OS/browser.
