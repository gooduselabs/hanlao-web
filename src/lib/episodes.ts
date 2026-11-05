import { getCollection, type CollectionEntry } from 'astro:content';

export type Episode = CollectionEntry<'episodes'>;
export type Series = CollectionEntry<'series'>;

export async function allSeries(): Promise<Series[]> {
  return (await getCollection('series')).sort((a, b) => a.data.title.localeCompare(b.data.title, 'vi'));
}

export async function episodesOf(slug: string): Promise<Episode[]> {
  return (await getCollection('episodes', (e) => e.data.seriesSlug === slug)).sort(
    (a, b) => a.data.episode - b.data.episode,
  );
}

/** Newest episodes across all series (highest episode number first, then update date). */
export async function latestEpisodes(n = 6): Promise<Episode[]> {
  return (await getCollection('episodes'))
    .sort((a, b) => (b.data.updated ?? '').localeCompare(a.data.updated ?? '') || b.data.episode - a.data.episode)
    .slice(0, n);
}

export function wordCount(body = ''): number {
  return body.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(body = ''): number {
  return Math.max(1, Math.round(wordCount(body) / 230));
}

export function chapterList(body = ''): { id: string; text: string }[] {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => ({ id: headingId(m[1].trim()), text: m[1].trim() }));
}

/** Must match the ids Astro's markdown renderer (github-slugger) generates. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-');
}
