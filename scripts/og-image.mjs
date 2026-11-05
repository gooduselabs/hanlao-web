// Renders public/og-default.png (1200×630) from scripts/assets/og.html. Run: node scripts/og-image.mjs
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('file://' + path.join(root, 'scripts/assets/og.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(root, 'public/og-default.png') });
await b.close();
console.log('✔ public/og-default.png');
