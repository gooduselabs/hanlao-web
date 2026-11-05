#!/usr/bin/env node
// npm run media — builds the site's images. READ-ONLY with respect to the author's repo.
//  • chapter thumbnails: han-lao/out/long/hoiNNN_thumb.jpg → public/images/thumbs/<slug>/hoi-N.webp (640×360)
//    (hồi without a thumbnail get a matching generated fallback from scripts/assets/thumb.html)
//  • series cover: scripts/assets/cover.html → public/images/covers/<slug>.webp (600×900, 2:3)
//  • OG image: scripts/assets/og.html → public/og-default.png (1200×630)
// Requires: cwebp (brew install webp) and Playwright's Chromium.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THUMBS = process.env.HANLAO_THUMBS || '/Users/lab/Projects/han-lao/out/long';
const CONTENT = path.join(ROOT, 'content', 'series');
const PUB = path.join(ROOT, 'public');
const FORCE = process.argv.includes('--force');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hanlao-media-'));
const webp = (src, out, w, h, q = 80) => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('cwebp', ['-quiet', '-q', String(q), '-resize', String(w), String(h), src, '-o', out]);
};
const fresh = (out, src) => !FORCE && fs.existsSync(out) && (!src || fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs);

const browser = await chromium.launch();
async function render(file, query, w, h, out, scale = 2) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(path.join(ROOT, 'scripts/assets', file)).href + (query ? `?${query}` : ''), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: out });
  await page.close();
}

let made = 0;
for (const slug of fs.readdirSync(CONTENT)) {
  const dir = path.join(CONTENT, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const series = JSON.parse(fs.readFileSync(path.join(dir, 'series.json'), 'utf8'));

  // cover
  const cover = path.join(PUB, 'images/covers', `${slug}.webp`);
  if (!fresh(cover, path.join(ROOT, 'scripts/assets/cover.html'))) {
    const png = path.join(tmp, `${slug}-cover.png`);
    await render('cover.html', '', 600, 900, png);
    webp(png, cover, 600, 900, 86);
    made++;
  }

  // thumbnails
  for (const f of fs.readdirSync(dir).filter((x) => /^hoi-\d+\.md$/.test(x))) {
    const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
    const n = data.episode;
    const out = path.join(PUB, 'images/thumbs', slug, `hoi-${n}.webp`);
    const src = path.join(THUMBS, `hoi${String(n).padStart(3, '0')}_thumb.jpg`);
    if (fs.existsSync(src)) {
      if (fresh(out, src)) continue;
      webp(src, out, 640, 360);
    } else {
      if (fresh(out)) continue;
      const png = path.join(tmp, `${slug}-${n}.png`);
      const q = new URLSearchParams({ n: String(n), title: data.thumbTitle || data.title, hook: data.thumbHook || '', series: series.title });
      await render('thumb.html', q.toString(), 640, 360, png);
      webp(png, out, 640, 360);
      console.log(`  · hồi ${n}: generated fallback thumbnail`);
    }
    made++;
  }
}

// OG image (uses the rendered cover)
const og = path.join(PUB, 'og-default.png');
if (!fresh(og, path.join(ROOT, 'scripts/assets/og.html')) || made) await render('og.html', '', 1200, 630, og, 1);

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✔ media: ${made} image(s) written`);
