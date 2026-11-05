import fs from 'node:fs';
import path from 'node:path';
import { url } from './site';

// Assets are produced by `npm run media` into public/. Helpers return a URL only if the file exists,
// so a newly-synced hồi without art degrades to a CSS fallback instead of a broken image.
const PUBLIC = path.join(process.cwd(), 'public');
const has = (rel: string) => fs.existsSync(path.join(PUBLIC, rel));

export function thumbFor(series: string, ep: number): string | null {
  const rel = `images/thumbs/${series}/hoi-${ep}.webp`;
  return has(rel) ? url(rel) : null;
}
export function coverFor(series: string): string | null {
  const rel = `images/covers/${series}.webp`;
  return has(rel) ? url(rel) : null;
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}
