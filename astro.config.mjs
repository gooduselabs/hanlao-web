import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL / BASE_PATH let the same build target GitHub Pages project sites
// (e.g. BASE_PATH=/hanlao-web) or Cloudflare Pages / custom domain (BASE_PATH=/).
const site = process.env.SITE_URL || 'https://hanlaodoctruyen.github.io';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
