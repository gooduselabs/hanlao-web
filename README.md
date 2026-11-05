# Hàn Lão Đọc Truyện

Trang đọc truyện cá nhân của **Hàn Lão** — chỉ đăng truyện nguyên tác của chính tác giả (hiện có *Tàn Đăng Ký — Ngọn Đèn Không Tắt*).
Static site built with [Astro](https://astro.build), hostable free on GitHub Pages or Cloudflare Pages.
Built spec-first with GitHub Spec Kit — see `specs/001-hanlao-reading-site/` and `.specify/memory/constitution.md`.

## Quick start

```bash
npm install
npm run sync      # import episodes from /Users/lab/Projects/han-lao/longform (read-only)
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview   # serve dist on :4321
npm test          # unit tests for markup stripping / front matter
npm run qa        # (with preview running) screenshots + reader checks → qa/
```

## Adding a new episode (hồi)

1. Write `hoiNNN.md` in `han-lao/longform/` as usual (front matter `hoi`, `title`, `series`, `summary`, …).
2. If it has a YouTube video, add `"NNN": "<videoId>"` to `data/youtube.json` (keys are episode numbers).
3. `npm run sync && npm run build` — the episode appears on home, series page, RSS and sitemap.
4. Commit `content/` and `data/` and push; the GitHub Action redeploys.

Sync strips `<!-- … -->` production comments (scene, short1/short2 markers), `[pause]`/`[SFX …]` tags, SFX lines
and timestamps, but keeps every word of prose. Override source paths with `HANLAO_SOURCE=/path` and `HANLAO_CHANNEL=/path`.

## Adding a new story (series)

Give the new files a different `series:` value in front matter (e.g. `series: Kiếm Tâm Ký`). Sync creates
`content/series/kiem-tam-ky/` with a starter `series.json` — edit its `fullTitle`, `tagline`, `synopsis`, `genre`, `status`
(sync never overwrites it). Pages `/truyen/kiem-tam-ky/…` are generated automatically.
For YouTube ids of other series use a nested object in `data/youtube.json`: `"kiem-tam-ky": {"1": "id"}`.

## Deploy

**GitHub Pages** — create a repo, push `main`, then *Settings → Pages → Source: GitHub Actions*.
`.github/workflows/deploy.yml` builds with the correct `SITE_URL`/`BASE_PATH` (works for `user.github.io/repo/`).

**Cloudflare Pages** — connect the repo; build command `npm run build`, output `dist`, env `SITE_URL=https://<your>.pages.dev`
(`BASE_PATH` defaults to `/`). Node 20+.

Regenerate the social preview image with `node scripts/og-image.mjs`.

## Features

Bright xianxia design (SVG art, no photos) · reader with 7 themes, serif/sans, font size / line height / width sliders,
floating toolbar, auto-scroll (S, Space, +/−, tap to pause), immersive full-screen (F), progress bar, resume position,
prev/next (←/→) + TOC (M), Vietnamese TTS via Web Speech API · click-to-load YouTube · RSS · sitemap · Vietnamese SEO/OG.
All preferences live in `localStorage`; no accounts, no tracking.

Footer discloses honestly: stories are original works of Hàn Lão, written with AI assistance.
