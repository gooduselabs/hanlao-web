# Feature Spec 002 — Redesign v2 (webnovel-style palette & layout)

**Status:** Implemented · **Date:** 2026-11-05 · **Supersedes:** visual layer of spec 001 (behaviour of 001 unchanged)

## Why
Owner feedback (verbatim): *"Thực sự nó chưa đẹp bạn ơi, về màu sắc bố cục điều không đẹp gì cả nhé. Em tham khảo màu sắc ở trang này nhé https://webnovel.vn/"*.
The v1 sunrise jade/gold/cream look is **rejected**. v2 must read as a clean, professional Vietnamese web-novel
platform: white surfaces, soft greys, one confident blue, an orange accent — calm and familiar to Vietnamese readers.

## Reference
`docs/reference/webnovel/` (screenshots + `palette.md`). **Inspiration only** — no logo, brand, images, copy or code
copied. Brand stays **Hàn Lão Đọc Truyện**; only the author's own story (*Tàn Đăng Ký*) is shown.

## User stories
1. **US1 – First impression (P1).** A visitor landing on `/` immediately sees a polished featured banner for
   *Tàn Đăng Ký* (cover, synopsis, tags, "Đọc từ đầu"), a "Mới cập nhật" table, image cards per hồi, a sidebar
   panel, and a tidy grey footer. Colors feel white/blue/orange like the reference.
2. **US2 – Find something (P1).** From any page the reader can use the sticky header: nav (Trang chủ, Truyện, Mới
   cập nhật, Giới thiệu) and a search box that finds hồi/chương titles instantly (diacritic-insensitive). On mobile
   a hamburger opens the nav and the search.
3. **US3 – Series detail (P1).** `/truyen/tan-dang-ky/` shows cover left + info right (tác giả, trạng thái, số hồi,
   số chương, thể loại pills, buttons), the description, and a 2–3 column chapter grid with thumbnails.
4. **US4 – Calm reading (P1).** A chapter page is a white reading column on a soft grey page with breadcrumbs,
   centred title, and prev / mục lục / next pill buttons at top and bottom. Every v1 reading feature keeps working.
5. **US5 – Resume (P2).** If the reader has progress, the home banner and series page show "Đọc tiếp".

## Functional requirements
- **FR-01 Tokens.** CSS custom properties: `--blue #0866ff`, `--blue-hover #2563eb`, `--blue-tint #eff6ff`,
  `--blue-soft #b8d4ff`, soft gradient `#eaf1ff→#f5f7ff`, `--orange #ff7e42` (`#e85d20` hover), `--ink #161925`,
  `--navy #2e2e5d`, `--text #585858`, `--muted #6b7280`, `--bg #fff`, `--grey #f5f5f5`, `--line #eeeeee`;
  radius 10 / 20 / 999; shadow `0 3px 4px rgba(0,0,0,.15)`; container 1200px; header 64px; font Be Vietnam Pro.
- **FR-02 Header.** Sticky white 64px, 1px `#eee` bottom border; original lantern icon + wordmark; nav; search;
  YouTube button; hamburger ≤ 900px.
- **FR-03 Search.** Static JSON index (hồi titles + chương headings) built at compile time; client-side filter,
  keyboard accessible (↑/↓/Enter/Esc), no network beyond the index file.
- **FR-04 Home.** Featured banner; "Mới cập nhật" zebra table (Hồi | Tiêu đề | Chương | Thời gian); hồi card grid
  with thumbnails; sidebar "Hồi nổi bật" ranked list (curated — no fake view counts) + "Thể loại" pills; YouTube CTA
  band in brand blue; footer `#f5f5f5` with link columns + AI-assist disclosure.
- **FR-05 Art.** Original 2:3 cover for *Tàn Đăng Ký* (lantern motif) rendered to WebP; chapter thumbnails from the
  author's own YouTube thumbnails (`han-lao/out/long/hoiNNN_thumb.jpg`, read-only copy, resized to WebP); matching
  generated fallback thumbnails for hồi without one. New favicon + OG image in the v2 palette.
- **FR-06 Series page** per US3, with sidebar panel of video hồi.
- **FR-07 Chapter page** per US4: grey surround + reader-theme column, pill nav (disabled state for first/last),
  quick chips (Cấu hình / Mục lục / Nghe) that open the existing toolbar panels.
- **FR-08 Regression.** 7 themes, font family/size/line-height/width, auto-scroll + speed, TTS vi-VN, fullscreen,
  progress memory/resume, YouTube facade, RSS/sitemap/SEO/JSON-LD, AI-assist disclosure all keep working.

## Success criteria
- `npm test`, `npm run build`, `npm run qa` pass; QA screenshots `home|series|chapter × desktop(1440)|mobile(390)`
  + `chapter-desktop-settings.png` regenerated with no blank/lazy images and no horizontal overflow.
- Side-by-side review vs. reference: same colour feel (white/grey/blue/orange), comparable density and alignment.
- No v1 colour tokens (jade/gold/cream/vermilion) remain in the shipped CSS.

## Out of scope
Accounts, comments, ratings, real view statistics, dark site theme outside the reader.
