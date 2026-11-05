import type { APIRoute } from 'astro';
import { allSeries, episodesOf, chapterList } from '../lib/episodes';
import { episodePath } from '../lib/site';
import { thumbFor } from '../lib/media';

// Static search index: hồi titles + chương headings (ids match the rendered heading anchors).
export const GET: APIRoute = async () => {
  const out = [];
  for (const s of await allSeries()) {
    for (const e of await episodesOf(s.data.slug)) {
      out.push({
        u: episodePath(s.data.slug, e.data.episode),
        n: e.data.episode,
        t: e.data.title,
        s: s.data.title,
        img: thumbFor(s.data.slug, e.data.episode) ?? undefined,
        c: chapterList(e.body).map((c) => ({ t: c.text, id: c.id })),
      });
    }
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
