// QA: screenshots of home / series / chapter at mobile + desktop, plus reader-mode checks.
// Requires `npm run preview` running (default http://localhost:4321). Output: qa/*.png, qa/report.json
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const BASE = (process.env.QA_URL || 'http://localhost:4321').replace(/\/$/, '');
const pages = { home: '/', series: '/truyen/tan-dang-ky/', chapter: '/truyen/tan-dang-ky/hoi-1/', about: '/gioi-thieu/', list: '/truyen/' };
const viewports = {
  mobile: { ...devices['iPhone 13'], defaultBrowserType: undefined },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
fs.mkdirSync('qa', { recursive: true });
const report = { base: BASE, errors: [], checks: {} };
const browser = await chromium.launch();

// Scroll through the page so lazy images load, then wait until every <img> has decoded.
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.round(innerHeight * 0.8)) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 });
  await page.waitForTimeout(250);
  return page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src));
}

for (const [vp, opts] of Object.entries(viewports)) {
  const { defaultBrowserType, ...ctxOpts } = opts;
  const ctx = await browser.newContext({ ...ctxOpts, locale: 'vi-VN' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => report.errors.push(`${vp}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/ytimg|fonts|youtube/i.test(m.text()) && report.errors.push(`${vp} console: ${m.text()}`));
  for (const [name, path] of Object.entries(pages)) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const broken = await settle(page);
    report.checks[`${name}-${vp}-imagesLoaded`] = broken.length === 0;
    if (broken.length) report.errors.push(`${vp} ${name}: broken images ${broken.join(', ')}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    report.checks[`${name}-${vp}-noHorizontalOverflow`] = !overflow;
    await page.screenshot({ path: `qa/${name}-${vp}.png`, fullPage: name !== 'chapter' });
  }
  // Header: search + mobile menu
  await page.goto(BASE + pages.home, { waitUntil: 'networkidle' });
  if (vp === 'mobile') {
    await page.click('[data-menu]');
    report.checks[`menu-opens-${vp}`] = await page.isVisible('#drawer');
    await page.click('[data-search-toggle]');
  }
  const q = vp === 'mobile' ? '#q-mobile' : '#q-desktop';
  await page.fill(q, 'den tat');
  await page.waitForSelector(`${q}-results li[role="option"]`, { timeout: 5000 }).catch(() => {});
  report.checks[`search-${vp}`] = /Đêm Đèn Tắt/.test((await page.textContent(`${q}-results`)) ?? '');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `qa/search-${vp}.png` });

  // Reader mode interactions
  await page.goto(BASE + pages.chapter, { waitUntil: 'networkidle' });
  await settle(page);
  await page.click('[data-act="settings"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `qa/chapter-${vp}-settings.png` });
  report.checks[`settings-panel-${vp}`] = await page.isVisible('#r-settings');
  await page.click('label.sw-sepia');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `qa/chapter-${vp}-settings-sepia.png` });
  const theme = await page.evaluate(() => JSON.parse(localStorage.getItem('hanlao:prefs:v1') || '{}').theme);
  report.checks[`prefs-persist-${vp}`] = theme === 'sepia';
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo(0, 2500));
  await page.click('[data-act="scroll"]');
  const y0 = await page.evaluate(() => scrollY);
  await page.waitForTimeout(1200);
  const y1 = await page.evaluate(() => scrollY);
  report.checks[`autoscroll-${vp}`] = y1 > y0;
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'networkidle' });
  report.checks[`resume-toast-${vp}`] = await page.isVisible('#r-toast');
  report.checks[`theme-after-reload-${vp}`] = (await page.evaluate(() => document.documentElement.dataset.rtheme)) === 'sepia';
  await page.screenshot({ path: `qa/chapter-${vp}-resume.png` });
  await page.evaluate(() => { localStorage.setItem('hanlao:prefs:v1', JSON.stringify({ theme: 'dark' })); });
  await page.reload({ waitUntil: 'networkidle' });
  await settle(page);
  await page.click('[data-open="toc"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `qa/chapter-${vp}-dark-toc.png` });
  await page.keyboard.press('Escape');
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + '/truyen/tan-dang-ky/hoi-1/', { waitUntil: 'networkidle' });
  const text = await page.textContent('#r-body');
  report.checks[`no-production-markup-${vp}`] = !/<!--|\[pause|short1|scene:/i.test(text ?? '');
  report.checks[`youtube-facade-${vp}`] = (await page.locator('a[data-yt-id]').count()) === 1;
  await ctx.close();
}
await browser.close();
fs.writeFileSync('qa/report.json', JSON.stringify(report, null, 2) + '\n');
const failed = Object.entries(report.checks).filter(([, v]) => !v);
console.log(JSON.stringify(report, null, 2));
if (failed.length || report.errors.length) process.exit(1);
