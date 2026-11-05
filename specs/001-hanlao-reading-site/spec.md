# Feature Specification: Hàn Lão Đọc Truyện — Personal Reading Site

**Feature Branch**: `main` (single-feature repo; spec dir `001-hanlao-reading-site`)

**Created**: 2026-11-05

**Status**: Clarified

**Input**: User description: "Build a personal Vietnamese fiction website 'Hàn Lão Đọc Truyện' for ONE author's own original stories (see docs/task-web-product.txt): synced from author markdown, home/series/chapter/about pages, rich modern reading mode, YouTube embeds, RSS, sitemap, Vietnamese SEO, bright xianxia design, honest AI-assist footer, free static hosting."

## Clarifications

### Session 2026-11-05

- Q: Which static generator / hosting? → A: Astro static output; GitHub Pages primary (project-site base path configurable via env), Cloudflare Pages compatible (root base).
- Q: Series slug and title? → A: `tan-dang-ky`, "Tàn Đăng Ký — Ngọn Đèn Không Tắt"; series metadata stored in `content/series/<slug>/series.json`.
- Q: What is a "chapter page" — one Hồi or one `## Chương`? → A: One reading page per Hồi (episode); its `## Chương` headings form an in-page table of contents. Episode URL: `/truyen/<series>/hoi-<n>/`.
- Q: Accounts / comments? → A: None. No auth, no comments, no analytics.
- Q: How are YouTube videos embedded? → A: Privacy-friendly click-to-load facade (thumbnail + play) loading `youtube-nocookie.com` iframe; only when an id exists in `data/youtube.json`.
- Q: What does sync do with `next_title`, `yt_title`, `thumb_*`? → A: Preserve them in normalized front matter (optional fields); `next_title` is shown as a teaser only when the next episode is not yet published.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read an episode comfortably (Priority: P1)

A Vietnamese reader opens an episode page from a link or the series list and reads the full prose with comfortable typography, customizing theme/font/size/line height/width, and can continue to the next episode.

**Why this priority**: Reading is the core value of the site.

**Independent Test**: Open `/truyen/tan-dang-ky/hoi-1/`, read prose with correct diacritics, change theme to sepia, reload — preference persists; click "Hồi sau" to reach Hồi 2.

**Acceptance Scenarios**:

1. **Given** a synced episode, **When** the reader opens its page, **Then** all prose appears with `## Chương` headings and no production markup (`<!-- ... -->`, `[pause]`, SFX tags, timestamps).
2. **Given** the reading toolbar, **When** the reader picks any of 7 themes (trắng, giấy/sepia, bạc hà, xanh dịu, hồng phấn, tối, đêm AMOLED), font family (serif/sans), font size, line height or content width, **Then** the change applies instantly and persists in localStorage across pages and reloads.
3. **Given** the reader scrolled halfway and left, **When** they return to the same episode, **Then** they are offered/returned to their last position and the progress bar reflects it.
4. **Given** auto-scroll, **When** the reader presses play (or Space/`S` key), **Then** the page scrolls smoothly at an adjustable speed; tapping the text on mobile or pressing Space pauses it.
5. **Given** immersive mode, **When** toggled (button or `F` key), **Then** chrome hides and the browser enters full-screen where supported; Esc exits.
6. **Given** a browser with Web Speech API, **When** the reader taps "Nghe", **Then** text is read with a vi-VN voice if available, with pause/stop; the button is hidden if unsupported.
7. **Given** an episode with a YouTube id, **When** the page loads, **Then** a video facade appears and the embed loads only after the reader clicks.
8. **Given** an episode, **When** the reader uses prev/next or the TOC (episodes list and in-episode chapters), **Then** navigation works by mouse, touch, keyboard (← / →).

---

### User Story 2 - Discover the author and series (Priority: P2)

A visitor lands on the home page, understands who Hàn Lão is, sees latest episodes and the series list, and opens a series page with cover art, synopsis and chapter list.

**Why this priority**: Entry point and discovery.

**Independent Test**: Load `/`, see hero with Hàn Lão persona, latest 6 episodes, series card; open series page and see all episodes in order with summaries and "đọc tiếp" for the last-read episode.

**Acceptance Scenarios**:

1. **Given** home, **Then** the hero shows brand, persona tagline, CTA to start reading and to the YouTube channel, decorative SVG art (no photos of people).
2. **Given** home, **Then** latest episodes (newest first) and a series list are shown.
3. **Given** a series page, **Then** it shows an SVG cover, title, synopsis, episode count, and full ordered list with titles + summaries, plus a video marker where a video exists.
4. **Given** reading progress exists, **Then** home/series show a "Đọc tiếp" link to the last-read episode.

---

### User Story 3 - Author publishes a new episode (Priority: P2)

The author adds `hoi023.md` in the source folder, runs `npm run sync && npm run build`, and the new episode appears everywhere (series list, home, RSS, sitemap).

**Independent Test**: Run sync; verify `content/series/tan-dang-ky/hoi-022.md` exists with normalized front matter and stripped markup; build output contains page for every episode.

**Acceptance Scenarios**:

1. **Given** source files `hoiNNN.md`, **When** `npm run sync` runs, **Then** each is written to `content/series/<slug>/hoi-NNN.md` with front matter: series, seriesSlug, episode, title, summary, youtubeId (if known), plus preserved optional fields.
2. **Given** a front-matter `series` value, **Then** the slug is derived (diacritics removed) so future series land in their own folder automatically.
3. **Given** sync runs twice, **Then** output is identical (idempotent) and the source repo is never modified.

---

### User Story 4 - About, feeds and sharing (Priority: P3)

Visitors read the About page (from channel about/intro copy), subscribe via RSS, and shared links show Vietnamese Open Graph previews.

**Acceptance Scenarios**:

1. `/gioi-thieu/` shows About copy derived from channel texts and the YouTube channel link.
2. `/rss.xml` lists episodes newest first with Vietnamese titles and summaries.
3. `sitemap-index.xml` lists all pages.
4. Every page has unique `<title>`, description, canonical, `og:*` (vi_VN), Twitter card, and an OG image.

### Edge Cases

- Episode with no YouTube id → no video block.
- First / last episode → prev / next disabled with a teaser of `next_title` on the last.
- Source missing or unreadable → sync exits non-zero with clear message; existing content untouched.
- localStorage unavailable (private mode) → site works with defaults, no errors.
- JavaScript disabled → prose, navigation and TOC still work; toolbar hidden.
- `prefers-reduced-motion` → no decorative animations; auto-scroll still user-controlled.
- Very long Vietnamese words/headings on 320px screens → no horizontal overflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sync command reads `hoi*.md` from the configured source dir (default `/Users/lab/Projects/han-lao/longform`, overridable by env `HANLAO_SOURCE`) read-only.
- **FR-002**: Sync strips HTML comments (scene, short1/short2 markers, any other), `[pause]`/`[...]` bracketed production tags, SFX lines, and timestamp tokens, while keeping all prose; collapses excess blank lines.
- **FR-003**: Sync writes normalized markdown to `content/series/<slug>/hoi-NNN.md` and creates/updates `series.json` without overwriting hand-edited fields.
- **FR-004**: YouTube ids come from `data/youtube.json` keyed by episode number (per series default `tan-dang-ky`).
- **FR-005**: Home page: hero (persona Hàn Lão), "Đọc tiếp" when progress exists, latest episodes, series list, channel CTA.
- **FR-006**: Series page: SVG cover, title, synopsis, stats, ordered episode list.
- **FR-007**: Episode page: prose, chapter TOC, prev/next, episodes drawer, YouTube facade, floating reading toolbar with 7 themes, serif/sans, font size, line height, width sliders, auto-scroll (play/pause, speed, keyboard, tap-to-pause), immersive full-screen, progress bar, last position memory, TTS (vi-VN) when supported.
- **FR-008**: All reading preferences (theme, font, size, line height, width, scroll speed) persist in localStorage under a single versioned key; progress per episode stored separately.
- **FR-009**: About page from channel `about.md`/`intro.md` texts (copied at sync time into `content/about.json`).
- **FR-010**: RSS feed, sitemap, robots.txt, Vietnamese SEO + Open Graph meta, default OG image (SVG-derived PNG or SVG).
- **FR-011**: Footer on every page: "Truyện là tác phẩm nguyên tác của Hàn Lão, được viết với sự hỗ trợ của AI." plus channel link.
- **FR-012**: GitHub Actions workflow deploys the built site to GitHub Pages (no push performed by automation).
- **FR-013**: Bright default visual identity; dark only as optional reading theme; subtle animations respecting reduced-motion.
- **FR-014**: Routing is series-agnostic: any folder under `content/series/` produces its series and episode pages.

### Key Entities

- **Series**: slug, title, fullTitle, synopsis, status, youtubePlaylist?, palette hint.
- **Episode**: seriesSlug, episode (number), title, summary, youtubeId?, nextTitle?, ytTitle?, thumbTitle?, thumbHook?, body (markdown), chapters (derived headings).
- **ReaderPrefs** (client): theme, font, size, lineHeight, width, scrollSpeed.
- **ReadingProgress** (client): per episode key → ratio, updatedAt; plus lastRead pointer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of source episodes (currently 22) produce a page; zero production markers remain in built HTML.
- **SC-002**: Episode page is readable at 320px width with no horizontal scroll; Lighthouse-style performance budget: < 60 KB JS gzipped per page excluding YouTube.
- **SC-003**: Reader preferences survive reload in 100% of tested cases.
- **SC-004**: Every page passes build and has Vietnamese title/description/OG tags.
- **SC-005**: A new episode can be published with 2 commands (`npm run sync`, `npm run build`).

## Assumptions

- Single author; series currently one (`tan-dang-ky`); more may come.
- No channel images exist → typographic brand + SVG art.
- Site URL defaults to `https://hanlaodoctruyen.github.io` with base `/`; overridable via `SITE_URL` / `BASE_PATH` env for project pages.
- Episodes are dated by sync order (no publish dates in source); RSS uses a stable date derived from file mtime.
