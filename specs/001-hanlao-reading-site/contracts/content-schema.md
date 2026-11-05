# Sync contract
Input: `$HANLAO_SOURCE/hoi*.md` (default /Users/lab/Projects/han-lao/longform), `$HANLAO_CHANNEL/{about,intro}.md`.
Output: `content/series/<slugify(series)>/hoi-NNN.md` (episode zero-padded 3), `series.json` (created if absent, never overwritten), `content/about.json`.
Exit codes: 0 ok; 1 source missing / zero files / invalid front matter. Writes nothing outside this repo.
