# Implementation Plan: Hàn Lão Đọc Truyện — Personal Reading Site

**Branch**: `main` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-hanlao-reading-site/spec.md`

## Summary

Astro static site. A Node sync script normalizes the author's `hoiNNN.md` files into
`content/series/<slug>/`, an Astro content collection (glob loader) exposes episodes, and pages
render home / series / episode / about plus RSS & sitemap. The reading experience is a single
vanilla-JS island (`reader.ts`) driven by CSS custom properties and localStorage.

## Technical Context

**Language/Version**: TypeScript/JavaScript, Node 20+ (local 24)
**Primary Dependencies**: astro 5+, @astrojs/rss, @astrojs/sitemap, gray-matter (sync), playwright (QA, dev)
**Storage**: Markdown files in repo; browser localStorage for prefs/progress
**Testing**: `node --test` for sync stripping; build check; Playwright screenshot QA
**Target Platform**: Static hosting — GitHub Pages (primary), Cloudflare Pages
**Project Type**: Static web site
**Performance Goals**: < 60 KB JS gz per page; self-hosted-free fonts via Google Fonts with `display=swap` and Vietnamese subset
**Constraints**: No server, no auth, no tracking; JS optional for reading
**Scale/Scope**: 1 series, 22 episodes (~350 lines each), growing

## Constitution Check

| Principle | Gate | Status |
|---|---|---|
| I Single-author | No accounts/comments/submissions | ✅ |
| II Vietnamese-first | `lang=vi`, vi_VN OG, Vietnamese UI copy, Be Vietnam Pro / Noto Serif fonts with vietnamese subset | ✅ |
| III Beauty | Bright sunrise/jade/gold palette, SVG art, reduced-motion | ✅ |
| IV Accessibility | Labeled controls, keyboard shortcuts, focus styles, contrast per theme | ✅ |
| V Performance/static | Astro static output, YouTube facade, one small script | ✅ |
| VI AI disclosure | Footer component on all layouts | ✅ |
| VII Source-of-truth | Sync read-only, prose preserved, tests | ✅ |

Post-design re-check: ✅ no violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-hanlao-reading-site/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/ (content-schema.md, storage.md, routes.md)
└── tasks.md
```

### Source Code (repository root)

```text
scripts/sync.mjs            # npm run sync
scripts/strip.mjs           # pure stripping functions (tested)
scripts/screenshots.mjs     # QA screenshots
tests/strip.test.mjs
content/series/<slug>/series.json, hoi-NNN.md
content/about.json
data/youtube.json
src/content.config.ts
src/lib/{site.ts,episodes.ts}
src/layouts/BaseLayout.astro
src/components/{Header,Footer,SeriesCover,HeroArt,EpisodeCard,YouTubeFacade,ReaderToolbar}.astro
src/pages/index.astro, gioi-thieu.astro, 404.astro, rss.xml.ts, robots.txt.ts
src/pages/truyen/index.astro, [series]/index.astro, [series]/[episode].astro
src/scripts/{reader.ts,prefs.ts,continue.ts}
src/styles/global.css
public/favicon.svg, og-default.svg/png
.github/workflows/deploy.yml
qa/
```

**Structure Decision**: Single Astro project at repo root.

## Complexity Tracking

None.
