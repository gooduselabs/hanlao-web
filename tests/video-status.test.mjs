import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.join(import.meta.dirname, '..');
const SERIES_DIR = path.join(ROOT, 'content/series/tan-dang-ky');

const VIDEO_IDS = {
  1: 'FWKbpwQeoBQ', 2: 'pdZJhgGt2PM', 3: 'OlU-SjB4CnE', 4: 'Ynvk8P0nu7g', 5: 'yC3HXZLaE10',
  6: 'qnmei0Tz5H8', 7: 'm4xP7Bk8B30', 8: 'GXv3KuJaKgc', 9: 'q_nTgGKhj7Q', 10: '0ySwvB5r1gk',
};
const OLD_IDS = ['Gd1I-vNHMg8', 'CfHdXcYEIVY', 'C_iRKYe7FFM', 'KzBKkKwPyW8', 'Br5A7cUQB-M', 'AT3UMqpAaLc', 'ks-i0mFb_k4', 'pD12G4hRqY4'];

function frontMatter(n) {
  const file = path.join(SERIES_DIR, `hoi-${String(n).padStart(3, '0')}.md`);
  return matter(fs.readFileSync(file, 'utf8')).data;
}

test('data/youtube.json has exactly the 10 correct video ids', () => {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/youtube.json'), 'utf8'));
  assert.deepEqual(Object.keys(data).map(Number).sort((a, b) => a - b), Object.keys(VIDEO_IDS).map(Number));
  for (const [n, id] of Object.entries(VIDEO_IDS)) assert.equal(data[n], id, `key ${n}`);
});

test('hoi-001..010 front matter carries the correct youtubeId/youtubeUrl', () => {
  for (const [n, id] of Object.entries(VIDEO_IDS)) {
    const fm = frontMatter(n);
    assert.equal(fm.youtubeId, id, `hoi-${n} youtubeId`);
    assert.equal(fm.youtubeUrl, `https://www.youtube.com/watch?v=${id}`, `hoi-${n} youtubeUrl`);
  }
});

test('hoi-011..052 front matter has no youtubeId', () => {
  for (let n = 11; n <= 52; n++) {
    const fm = frontMatter(n);
    assert.equal(fm.youtubeId, undefined, `hoi-${n} should not have youtubeId`);
  }
});

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, onFile);
    else onFile(p);
  }
}

test('no stale video ids remain under content/, data/, src/', () => {
  const offenders = [];
  for (const d of ['content', 'data', 'src']) {
    walk(path.join(ROOT, d), (p) => {
      if (!/\.(md|json|astro|ts|mjs)$/.test(p)) return;
      const text = fs.readFileSync(p, 'utf8');
      for (const old of OLD_IDS) if (text.includes(old)) offenders.push(`${p}: ${old}`);
    });
  }
  assert.deepEqual(offenders, []);
});

test('series.json status no longer says "đang ra"', () => {
  const s = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, 'series.json'), 'utf8'));
  assert.notEqual(s.status, 'đang ra');
});

test('home/series-list copy drops the ongoing-schedule promises', () => {
  const home = fs.readFileSync(path.join(ROOT, 'src/pages/index.astro'), 'utf8');
  assert.ok(!home.includes("label: 'Đang ra'"), 'index.astro facet still says Đang ra');
  assert.ok(!home.includes('mỗi tuần thêm hồi mới'), 'index.astro band still promises weekly updates');

  const list = fs.readFileSync(path.join(ROOT, 'src/pages/truyen/index.astro'), 'utf8');
  assert.ok(!list.includes('cùng lúc với bản kể trên kênh YouTube'), 'truyen/index.astro still implies text+audio ship together');
});

test('episode page has no "Hồi sau đang được chép" fallback text', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/pages/truyen/[series]/[episode].astro'), 'utf8');
  assert.ok(!src.includes('Hồi sau đang được chép'));
});

// --- dist/ checks: only run when a prior `npm run build` produced output ---
const DIST = path.join(ROOT, 'dist');
const hasDist = fs.existsSync(DIST);
const distTest = hasDist ? test : test.skip;

distTest('dist hoi-1..10 embed the correct youtube id; hoi-11 has no facade', () => {
  for (const [n, id] of Object.entries(VIDEO_IDS)) {
    const html = fs.readFileSync(path.join(DIST, `truyen/tan-dang-ky/hoi-${n}/index.html`), 'utf8');
    assert.ok(html.includes(id), `dist hoi-${n} missing id ${id}`);
  }
  const hoi11 = fs.readFileSync(path.join(DIST, 'truyen/tan-dang-ky/hoi-11/index.html'), 'utf8');
  assert.ok(!hoi11.includes('yt-facade'), 'hoi-11 should not render a video facade');
});

distTest('dist hoi-52 has no "đang được chép" and no link to hoi-53', () => {
  const html = fs.readFileSync(path.join(DIST, 'truyen/tan-dang-ky/hoi-52/index.html'), 'utf8');
  assert.ok(!html.includes('đang được chép'));
  assert.ok(!html.includes('hoi-53'));
});

distTest('dist series page no longer shows "đang ra"', () => {
  const html = fs.readFileSync(path.join(DIST, 'truyen/tan-dang-ky/index.html'), 'utf8');
  assert.ok(!html.includes('đang ra'));
});
