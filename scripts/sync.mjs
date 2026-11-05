#!/usr/bin/env node
// npm run sync — READ-ONLY import of the author's longform markdown into content/series/<slug>/.
// Never writes into the source repository.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripProduction, slugify, chapters, parseFrontMatter } from './strip.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = process.env.HANLAO_SOURCE || '/Users/lab/Projects/han-lao/longform';
const CHANNEL = process.env.HANLAO_CHANNEL || '/Users/lab/Projects/han-lao/channel';
const OUT = path.join(ROOT, 'content', 'series');
const YT_FILE = path.join(ROOT, 'data', 'youtube.json');
const DEFAULT_SERIES = 'tan-dang-ky';

// Known series metadata (used only when series.json does not yet exist).
const SERIES_DEFAULTS = {
  'tan-dang-ky': {
    title: 'Tàn Đăng Ký',
    fullTitle: 'Tàn Đăng Ký — Ngọn Đèn Không Tắt',
    tagline: 'Cả làng tắt đèn. Chỉ ngọn đèn đồng của cậu bé bấc ẩm còn cháy.',
    synopsis:
      'Ba mươi năm nay, Thiên Đăng trên đỉnh Hàm Vân Sơn mờ dần, kéo theo mùa đông dài và ruộng đồng bạc màu khắp Cửu Lĩnh. Ở thôn Thạch Khê dưới chân núi, Trình Ngộ — cậu bé làm đèn lồng bị gọi là “bấc ẩm”, không thể thắp nổi tâm đăng — sống cùng người mẹ mù khéo tay. Một đêm Thiên Đăng chớp tắt, cả làng chìm trong bóng tối, chỉ chiếc đèn đồng sứt quai của Ngộ còn cháy. Từ đó, ngọn đèn nhỏ ấy trở thành thứ mà cả tông môn trên núi lẫn những kẻ trong bóng tối đều muốn tìm.',
    genre: ['Tiên hiệp', 'Tu tiên', 'Nguyên tác'],
    status: 'đang ra',
  },
};

function die(msg) {
  console.error(`✖ sync: ${msg}`);
  process.exit(1);
}

function readYoutube() {
  try {
    return JSON.parse(fs.readFileSync(YT_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function yamlEscape(v) {
  return JSON.stringify(String(v)); // JSON strings are valid YAML double-quoted scalars
}

function main() {
  if (!fs.existsSync(SOURCE)) die(`source not found: ${SOURCE}`);
  const files = fs
    .readdirSync(SOURCE)
    .filter((f) => /^hoi\d+\.md$/i.test(f))
    .sort();
  if (!files.length) die(`no hoi*.md files in ${SOURCE}`);

  const yt = readYoutube();
  const parsed = [];
  for (const f of files) {
    const full = path.join(SOURCE, f);
    const raw = fs.readFileSync(full, 'utf8');
    const fm = parseFrontMatter(raw);
    const d = fm.data || {};
    const episode = Number(d.hoi ?? d.episode ?? f.match(/\d+/)[0]);
    if (!Number.isInteger(episode) || episode < 1) die(`bad episode number in ${f}`);
    const seriesName = String(d.series || 'Tàn Đăng Ký').trim();
    const seriesSlug = slugify(seriesName) || DEFAULT_SERIES;
    const body = stripProduction(fm.content);
    if (!body.trim()) die(`empty body after stripping in ${f}`);
    parsed.push({ f, full, d, episode, seriesName, seriesSlug, body });
  }

  const bySeries = new Map();
  for (const p of parsed) {
    if (!bySeries.has(p.seriesSlug)) bySeries.set(p.seriesSlug, []);
    bySeries.get(p.seriesSlug).push(p);
  }

  let written = 0;
  for (const [slug, eps] of bySeries) {
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    // series.json: create once; preserve hand edits afterwards.
    const sj = path.join(dir, 'series.json');
    if (!fs.existsSync(sj)) {
      const meta = { slug, ...(SERIES_DEFAULTS[slug] || { title: eps[0].seriesName, fullTitle: eps[0].seriesName, tagline: '', synopsis: '', genre: ['Tiên hiệp'], status: 'đang ra' }) };
      meta.youtubeChannel = 'https://www.youtube.com/@hanlaodoctruyen';
      fs.writeFileSync(sj, JSON.stringify(meta, null, 2) + '\n');
    }
    const ytMap = slug === DEFAULT_SERIES ? yt : yt[slug] && typeof yt[slug] === 'object' ? yt[slug] : {};
    const keep = new Set(['series.json']);
    for (const p of eps.sort((a, b) => a.episode - b.episode)) {
      const name = `hoi-${String(p.episode).padStart(3, '0')}.md`;
      keep.add(name);
      const id = typeof ytMap[String(p.episode)] === 'string' ? ytMap[String(p.episode)] : '';
      const lines = [
        '---',
        `series: ${yamlEscape(p.seriesName)}`,
        `seriesSlug: ${yamlEscape(slug)}`,
        `episode: ${p.episode}`,
        `title: ${yamlEscape(p.d.title || `Hồi ${p.episode}`)}`,
        `summary: ${yamlEscape(p.d.summary || '')}`,
      ];
      if (id) {
        lines.push(`youtubeId: ${yamlEscape(id)}`, `youtubeUrl: ${yamlEscape(`https://www.youtube.com/watch?v=${id}`)}`);
      }
      for (const [k, out] of [['next_title', 'nextTitle'], ['yt_title', 'ytTitle'], ['thumb_title', 'thumbTitle'], ['thumb_hook', 'thumbHook']]) {
        if (p.d[k]) lines.push(`${out}: ${yamlEscape(p.d[k])}`);
      }
      lines.push(`chapterCount: ${chapters(p.body).length}`);
      lines.push(`updated: ${yamlEscape(fs.statSync(p.full).mtime.toISOString().slice(0, 10))}`);
      lines.push(`sourceFile: ${yamlEscape(p.f)}`, '---', '');
      const out = lines.join('\n') + p.body;
      const target = path.join(dir, name);
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== out) {
        fs.writeFileSync(target, out);
        written++;
      }
    }
    // Remove episodes that disappeared from source.
    for (const f of fs.readdirSync(dir)) if (!keep.has(f) && /^hoi-\d+\.md$/.test(f)) fs.rmSync(path.join(dir, f));
    console.log(`✔ ${slug}: ${eps.length} hồi`);
  }

  // About copy from channel texts (read-only).
  const about = { aboutMd: '', introMd: '' };
  for (const [k, f] of [['aboutMd', 'about.md'], ['introMd', 'intro.md']]) {
    const p = path.join(CHANNEL, f);
    if (fs.existsSync(p)) about[k] = parseFrontMatter(fs.readFileSync(p, 'utf8')).content.trim();
  }
  fs.writeFileSync(path.join(ROOT, 'content', 'about.json'), JSON.stringify(about, null, 2) + '\n');
  console.log(`✔ sync done (${written} file(s) changed)`);
}

main();
