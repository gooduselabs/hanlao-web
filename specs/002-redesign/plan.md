# Plan 002 — Redesign v2

## Approach
Keep the Astro static architecture, content collections, reader script and storage contracts from 001.
Replace the **visual layer** (tokens, global CSS, components, page markup) and add three small capabilities:
search index, media pipeline, header menu script.

## Files
| Area | Change |
|---|---|
| `src/styles/global.css` | Rewritten: v2 tokens, base, header, footer, buttons/pills, banner, table, cards, sidebar panels, series detail, about/prose |
| `src/styles/reader.css` | Re-skinned: grey surround + column, pill nav, chips; theme variables kept (`--r-*`), new `--r-surround` |
| `src/components/` | New `Logo`, `Icon`, `SearchBox`, `BookCover`, `EpisodeThumb`, `SectionHead`; rewritten `Header`, `Footer`, `EpisodeCard`, `ContinueCard`; removed `HeroArt`, `SeriesCover`, `BrandMark` |
| `src/pages/*` | Home, truyện list, series detail, chapter, giới thiệu, 404 re-laid out; new `search.json.ts`; `#moi-cap-nhat` anchor |
| `src/lib/media.ts` | `thumbFor(series, ep)` / `coverFor(series)` → URL if the asset exists in `public/` |
| `scripts/media.mjs` | `npm run media`: read-only copy of `hoiNNN_thumb.jpg` → `public/images/thumbs/<slug>/hoi-N.webp` (640×360, cwebp), renders fallbacks + cover (600×900) + OG via Playwright from `scripts/assets/*.html` |
| `scripts/screenshots.mjs` | Waits for lazy images (scroll + `img.complete`), adds `chapter-desktop-settings.png`, search check |

## Design decisions
- **Palette**: exactly the reference tokens (FR-01). Blue = primary actions/links/active; orange = badges ("Mới",
  "Hồi N", ranking top-3), never for body text. Navy `#2e2e5d` for card titles, ink `#161925` for headings.
- **Reading default** switches to the sans family (Be Vietnam Pro) at 20px / 1.9 in `#3f3f46`-ish ink — matches the
  reference's calm look; serif remains one tap away. Existing saved prefs are respected.
- **Ranking honesty**: no analytics exist, so the sidebar is "Hồi nổi bật" (curated: hồi with videos first), styled as
  a ranking list. No invented numbers.
- **Images**: WebP, explicit width/height, `loading="lazy"` except above-the-fold (banner cover, first row).
- **No new runtime deps**; cwebp (Homebrew) + Playwright (dev) only for the media script; generated assets are committed
  so CI does not need the author's machine.

## Risks
- Theme-colour mixing in the reader (surround vs column) for dark themes → define `--r-surround` per theme.
- Header search on chapter page must not trigger reader keyboard shortcuts → reader already ignores INPUT targets.
