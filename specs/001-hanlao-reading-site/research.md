# Research

- **Astro vs 11ty** → Astro: content collections w/ schema validation, built-in RSS/sitemap integrations, zero-JS by default. Already installed.
- **Content loading** → `glob()` loader over `content/series/**/hoi-*.md`; series.json read via `file`-less JSON import (`import.meta.glob`).
- **Base path** → `BASE_PATH` env (e.g. `/hanlao-web` for project pages); all links via `withBase()` helper. Cloudflare uses `/`.
- **Fonts** → Google Fonts: "Be Vietnam Pro" (sans, UI), "Noto Serif" (reading serif), "Playfair"-like display not Vietnamese-safe → use "Noto Serif Display"? Chosen: Noto Serif (700) for headings. Both have Vietnamese subsets.
- **YouTube** → facade with `i.ytimg.com/vi/<id>/hqdefault.jpg`, iframe `youtube-nocookie.com/embed/<id>?autoplay=1` inserted on click; `<noscript>`/link fallback.
- **TTS** → `speechSynthesis` with voice `lang.startsWith('vi')`; chunk by paragraph to avoid Chrome 15s cutoff.
- **Auto-scroll** → `requestAnimationFrame` accumulating fractional px; speed 1–10 mapped to 10–120 px/s.
- **Full-screen** → `document.documentElement.requestFullscreen()` guarded; immersive class hides chrome regardless.
- **OG image** → static `public/og-default.png` rendered from SVG via Playwright at QA/setup time (also committed SVG).
- **Stripping rules** → `<!--[\s\S]*?-->` removed; `[pause]`, `[SFX: ...]`, `[mm:ss]` bracket tokens; lines `SFX:`; timestamps like `(00:12)`; collapse 3+ newlines.
