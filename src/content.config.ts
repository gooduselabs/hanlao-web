import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const episodes = defineCollection({
  loader: glob({ pattern: '*/hoi-*.md', base: './content/series' }),
  schema: z.object({
    series: z.string(),
    seriesSlug: z.string(),
    episode: z.number().int().positive(),
    title: z.string(),
    summary: z.string().default(''),
    youtubeId: z.string().optional(),
    youtubeUrl: z.string().url().optional(),
    nextTitle: z.string().optional(),
    ytTitle: z.string().optional(),
    thumbTitle: z.string().optional(),
    thumbHook: z.string().optional(),
    chapterCount: z.number().int().optional(),
    updated: z.string().optional(),
    sourceFile: z.string().optional(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '*/series.json', base: './content/series' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    fullTitle: z.string(),
    tagline: z.string().default(''),
    synopsis: z.string().default(''),
    genre: z.array(z.string()).default([]),
    status: z.string().default('đang ra'),
    youtubeChannel: z.string().url().optional(),
  }),
});

export const collections = { episodes, series };
