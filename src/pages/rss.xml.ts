import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, episodePath } from '../lib/site';

export async function GET(context: APIContext) {
  const eps = (await getCollection('episodes')).sort(
    (a, b) => b.data.episode - a.data.episode || a.data.seriesSlug.localeCompare(b.data.seriesSlug),
  );
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    customData: '<language>vi</language>',
    items: eps.map((e) => ({
      title: `${e.data.series} · Hồi ${e.data.episode}: ${e.data.title}`,
      description: e.data.summary,
      link: episodePath(e.data.seriesSlug, e.data.episode),
      // Source has no publish dates: derive a stable, ordered date from the update date + episode number.
      pubDate: new Date(Date.parse(`${e.data.updated ?? '2026-01-01'}T00:00:00Z`) + e.data.episode * 60_000),
      categories: [e.data.series],
    })),
  });
}
