// Pure functions for normalizing the author's production markdown into reading prose.

/** Remove diacritics and produce an ASCII slug. */
export function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const BRACKET_TAG =
  /\[(?:pause|ngắt|ngat|sfx|nhạc|nhac|music|beat|break|im lặng|silence|\d{1,2}:\d{2}(?::\d{2})?)(?:[^\]\n]*)\]/giu;

/** Strip production markup while keeping every word of prose. */
export function stripProduction(body) {
  let s = String(body).replace(/\r\n?/g, '\n');
  s = s.replace(/<!--[\s\S]*?-->/g, ''); // scene / short1 / short2 markers and any comment
  s = s.replace(BRACKET_TAG, ''); // [pause], [SFX: ...], [00:12]
  s = s.replace(/^\s*(?:SFX|Âm thanh|AMBIENCE|BGM)\s*[:：].*$/gimu, ''); // SFX lines
  s = s.replace(/^(#{1,6}\s.*?)\s*[\(\[]\d{1,2}:\d{2}(?::\d{2})?[\)\]]\s*$/gm, '$1'); // heading timestamps
  s = s.replace(/^\s*\(?\d{1,2}:\d{2}(?::\d{2})?\)?\s*$/gm, ''); // lone timestamp lines
  s = s
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, '').replace(/ {2,}/g, ' '))
    .join('\n');
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s + '\n';
}

/** Collect `## ` headings (chapters). */
export function chapters(body) {
  return [...String(body).matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
}

/**
 * Lenient front-matter parser: the author's files use `key: value` lines whose values may
 * contain unquoted colons (not strict YAML). Returns { data, content }.
 */
export function parseFrontMatter(raw) {
  const s = String(raw).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = s.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, content: s };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    data[kv[1]] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
  }
  return { data, content: s.slice(m[0].length) };
}
