# 003 — Video embeds & status fix

## Problem
1. `data/youtube.json` and front matter `youtubeId`/`youtubeUrl` for Hồi 1–8 hold stale video IDs; Hồi 9–10 have no video fields at all despite having videos. Front matter (not `data/youtube.json`) is what pages render.
2. Series status/copy says "đang ra" (ongoing) and promises weekly audio, but prose is complete at 52/52 hồi while audio/video exists only for Tập 1–10.
3. Hồi 52 (last hồi, no `next`) shows "Hồi sau đang được chép" — a false promise, since there is no Hồi 53.

## Correct video mapping (verified, keys = hồi/tập number)
| Hồi | ID | Hồi | ID |
|---|---|---|---|
| 1 | FWKbpwQeoBQ | 6 | qnmei0Tz5H8 |
| 2 | pdZJhgGt2PM | 7 | m4xP7Bk8B30 |
| 3 | OlU-SjB4CnE | 8 | GXv3KuJaKgc |
| 4 | Ynvk8P0nu7g | 9 | q_nTgGKhj7Q |
| 5 | yC3HXZLaE10 | 10 | 0ySwvB5r1gk |

Hồi 11–52: no video. Do not add/guess IDs for them.

## Requirements
- R1: `data/youtube.json` has exactly keys "1".."10" with the IDs above. Front matter `youtubeId`/`youtubeUrl` for hoi-001..hoi-010 match the table; hoi-011..hoi-052 have no `youtubeId` field.
- R2: `series.json` status reflects the reading text being complete (not "đang ra"). Home band and/or series page copy distinguishes: prose complete at `{eps.length}` hồi vs. video/audio available for `{videos.length}` hồi — derived from data, not hardcoded. No promise of a weekly audio schedule.
- R3: Hồi 52 (no `next`) shows an end-of-series block ("Hết truyện — trọn N hồi") linking to the TOC (`seriesPath(slug)+'#danh-sach'`) and back to Hồi 1, instead of "Hồi sau đang được chép". Must not link to hoi-53.
- R4: Regression tests cover R1 (data file + front matter) and, where a prior `dist/` build exists, the rendered HTML for hoi-1..10/11/52 and the series listing page. Dist-dependent tests must skip cleanly when `dist/` is absent (CI runs `npm test` before `npm run build`).
- R5: No change to design, layout, TTS, dependencies, astro.config, CI workflow, or story prose.

## Acceptance criteria (W1–W6)
- W1: `data/youtube.json` == table above, no other keys.
- W2: hoi-001..010 front matter `youtubeId` == table; hoi-011..052 front matter has no `youtubeId`.
- W3: No occurrence of the old (pre-fix) video IDs anywhere under `content/`, `data/`, `src/`.
- W4: `series.json` status not "đang ra"; home page facets/band text no longer says "Đang ra" or "mỗi tuần thêm hồi mới"; `truyen/index.astro` no longer says "Hồi mới được chép lên đây cùng lúc…".
- W5: Hồi 52 page has no "đang được chép" text and no link to `hoi-53`; has a link back to `#danh-sach` and to Hồi 1.
- W6: `npm test` and `npm run build` both exit 0 after the fix.
