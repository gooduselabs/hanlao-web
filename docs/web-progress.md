# Web progress — Hàn Lão Đọc Truyện

## Redesign v2 — 2026-11-05 ✅
Owner feedback: v1 colours/layout "chưa đẹp" → use webnovel.vn as the colour reference. v1 sunrise jade/gold/cream
palette replaced entirely. Inspiration only: no logo, brand, images, copy or code taken from the reference.

- **Spec Kit (light):** `specs/002-redesign/` — `spec.md`, `plan.md`, `tasks.md` (T001–T023 done + review log).
- **Design system** (`src/styles/global.css`): white `#fff`, grey `#f5f5f5` panels/zebra/footer, borders `#eee`, blue
  `#0866ff` (hover `#2563eb`, tints `#eff6ff`/`#b8d4ff`, gradient `#eaf1ff→#f5f7ff`), orange `#ff7e42` badges, ink
  `#161925`, navy `#2e2e5d`, body `#585858`; Be Vietnam Pro; radius 10/20/999; shadow `0 3px 4px rgba(0,0,0,.15)`;
  container 1200px; header 64px.
- **Header:** sticky white bar, original lantern-tile logo + "Hàn Lão / ĐỌC TRUYỆN" wordmark, nav (Trang chủ, Truyện,
  Mới cập nhật, Giới thiệu), client-side search (`/search.json`: 22 hồi + chương headings, diacritic-insensitive,
  keyboard ↑/↓/Enter/Esc), YouTube pill, mobile hamburger drawer + search toggle.
- **Home:** featured banner (cover, synopsis, tags, "Đọc từ đầu" / "Đọc tiếp" / "Mục lục", "Hồi mới nhất" card);
  "Mới cập nhật" zebra table; "Đọc theo hồi" thumbnail grid; sidebar "Hồi nổi bật" ranked list (curated, video hồi
  first; **no fake view counts**, since there are no analytics) + "Thể loại"; blue YouTube CTA band; grey footer with link
  columns + AI-assist disclosure.
- **Series page:** cover left + info right (tác giả, cập nhật, tags, stats: hồi/chương/video/trạng thái, buttons),
  Giới thiệu, 2-column chapter grid with thumbnails, sticky sidebar (video hồi, reading features).
- **Chapter page:** white reading column on a grey surround, breadcrumbs, centred title, Hồi trước / Mục lục / Hồi sau
  pills top & bottom, quick chips (Cấu hình, DS chương, Tự cuộn, Nghe đọc) that open the existing toolbar, compact
  media card (thumbnail + summary; expands into the YouTube player on click), next-hồi teaser card.
  Reading default is now sans (Be Vietnam Pro) 20px/1.9; serif is still in settings; saved prefs are respected.
- **Art (`npm run media`, `scripts/media.mjs`):** original 2:3 lantern cover (`scripts/assets/cover.html` →
  `public/images/covers/tan-dang-ky.webp`); chapter thumbnails copied **read-only** from
  `han-lao/out/long/hoiNNN_thumb.jpg` → 640×360 WebP; hồi 21–22 had none → matching fallbacks generated from
  `scripts/assets/thumb.html`; new OG image + favicon. 432 KB of images in total.
- **Unchanged behaviour:** 7 reading themes (now with a per-theme surround colour), font/size/line-height/width,
  auto-scroll + speed, TTS vi-VN, fullscreen, progress/resume, YouTube facade, RSS/sitemap/robots/JSON-LD, disclosure.
- **Verification:** `npm test` 6/6 · `npm run build` 27 pages · `npm run qa` 37/37 checks, 0 errors. New checks cover
  every image being loaded (lazy images are scrolled into view first), search, the mobile menu and the settings panel.
  Screenshots in `qa/`: `home|series|chapter|about|list × desktop|mobile`, `chapter-{desktop,mobile}-settings.png`,
  `search-*`, `*-settings-sepia`, `*-resume`, `*-dark-toc`. JS shipped ≈ 3.6 KB gzipped.
- **Self-review:** two rounds against the reference screenshots; findings and fixes are in `specs/002-redesign/tasks.md`.

---

## v1

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
