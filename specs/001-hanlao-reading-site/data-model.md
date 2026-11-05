# Data Model

## Series (`content/series/<slug>/series.json`)
| field | type | notes |
|---|---|---|
| slug | string | ASCII folder name |
| title | string | "Tàn Đăng Ký" |
| fullTitle | string | "Tàn Đăng Ký — Ngọn Đèn Không Tắt" |
| tagline | string | short hook |
| synopsis | string | paragraph(s) |
| genre | string[] | e.g. ["Tiên hiệp"] |
| status | "đang ra" \| "hoàn thành" | |
| youtubeChannel | url | |

## Episode (`content/series/<slug>/hoi-NNN.md` front matter)
| field | type | req |
|---|---|---|
| series | string | ✔ |
| seriesSlug | string | ✔ |
| episode | int ≥ 1 | ✔ |
| title | string | ✔ |
| summary | string | ✔ (may be empty) |
| youtubeId | string | optional |
| youtubeUrl | url | optional |
| nextTitle, ytTitle, thumbTitle, thumbHook | string | optional |
| sourceFile | string | provenance |
| updated | ISO date | from source mtime |

Derived: chapters = `## ` headings (id slugified), readingMinutes = words/220.

## Client state — see contracts/storage.md
