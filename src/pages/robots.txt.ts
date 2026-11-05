import type { APIContext } from 'astro';
export function GET({ site }: APIContext) {
  const sm = new URL(`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}sitemap-index.xml`, site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sm}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
