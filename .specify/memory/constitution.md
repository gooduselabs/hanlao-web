<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Added principles: I. Single-Author Original Works; II. Vietnamese-First; III. Beauty & Craft;
  IV. Accessibility; V. Performance & Static Simplicity; VI. Honest AI Disclosure; VII. Source-of-Truth Content
- Added sections: Technical Constraints, Development Workflow & Quality Gates, Governance
- Templates: plan-template.md ✅ (Constitution Check reads gates from this file), spec-template.md ✅, tasks-template.md ✅ — no edits required
- Follow-up TODOs: none
-->
# Hàn Lão Đọc Truyện — Web Constitution

## Core Principles

### I. Single-Author Original Works (NON-NEGOTIABLE)
The site publishes ONLY the original stories of the author persona Hàn Lão. There MUST NOT be
multi-author features, submissions, marketplaces, user accounts, logins, comments backends or
paywalls. Content MUST NOT be invented by tooling: story prose comes exclusively from the author's
own markdown sources.

### II. Vietnamese-First
All UI copy, metadata, SEO/Open Graph tags, dates and feeds MUST be in Vietnamese (`lang="vi"`,
`og:locale=vi_VN`). Vietnamese diacritics MUST render correctly everywhere (UTF-8, fonts with full
Vietnamese subsets). Slugs MUST be ASCII, diacritic-free.

### III. Beauty & Craft
The default look MUST be bright, luminous and polished (sunrise gradients, jade/teal, gold — a
modern xianxia mood). Dark is an optional reading theme, never the default. Decorative art MUST be
SVG/CSS; no fake photographs of people. Animations MUST be subtle and honor `prefers-reduced-motion`.

### IV. Accessibility
Pages MUST meet WCAG 2.1 AA intent: semantic landmarks, keyboard operability for every control
(including the reading toolbar), visible focus, sufficient contrast in every reading theme, labels
for all form controls, alt text/aria for decorative vs meaningful graphics.

### V. Performance & Static Simplicity
The site MUST be a fully static build hostable for free (GitHub Pages primary, Cloudflare Pages
compatible), mobile-first, shipping minimal JavaScript (progressive enhancement: prose readable
without JS). YouTube embeds MUST be lazy (click-to-load facade). No server runtime, no database.

### VI. Honest AI Disclosure
Every page footer MUST state that stories are original works of Hàn Lão written with AI
assistance. Disclosure MUST NOT be hidden or softened.

### VII. Source-of-Truth Content
Story text is synced from `/Users/lab/Projects/han-lao/longform` by a deterministic, read-only sync
script that strips production markup while keeping every word of prose. The sync MUST never write
into the source repository.

## Technical Constraints
- Static site generator: Astro; Node ≥ 20; content under `content/series/<slug>/`.
- Multiple series supported by directory convention; no hard-coded single-series assumptions in
  routing.
- Reader preferences and progress persist only in `localStorage` (no tracking, no cookies).
- No secrets in the repository. No pushing or remote creation by automation.

## Development Workflow & Quality Gates
- Spec-driven: constitution → spec → clarify → plan → tasks → analyze → implement (GitHub Spec Kit).
- Gates before completion: `npm run sync` succeeds, `npm run build` passes, screenshot QA of home,
  series and chapter pages at mobile and desktop widths stored in `qa/`.
- Commit locally at milestones with clear messages.

## Governance
This constitution supersedes other practices for this repository. Amendments require updating this
file with a version bump (semantic versioning: MAJOR for principle removal/redefinition, MINOR for
additions, PATCH for wording) and a Sync Impact Report. Every plan MUST include a Constitution Check
against Principles I–VII.

**Version**: 1.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
