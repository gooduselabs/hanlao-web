import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripProduction, slugify, chapters } from '../scripts/strip.mjs';

test('slugify removes Vietnamese diacritics', () => {
  assert.equal(slugify('Tàn Đăng Ký'), 'tan-dang-ky');
  assert.equal(slugify('Hàn Lão Đọc Truyện!'), 'han-lao-doc-truyen');
});

test('strips comments but keeps prose inside short markers', () => {
  const src = '## Chương 1: A\n<!-- scene: mountain -->\nMở đầu.\n\n<!-- short1 -->\nĐoạn hay.\n<!-- /short1 -->\n\nKết.';
  const out = stripProduction(src);
  assert.ok(!out.includes('<!--'));
  assert.ok(out.includes('Đoạn hay.'));
  assert.ok(out.includes('Mở đầu.') && out.includes('Kết.'));
  assert.ok(!/\n{3,}/.test(out));
});

test('strips pause, SFX and timestamps', () => {
  const src = '## Chương 2 (01:23)\nLão nói [pause] rồi im.\nSFX: gió rít\n[SFX: sấm]\n[00:45]\nHết.';
  const out = stripProduction(src);
  assert.ok(out.startsWith('## Chương 2\nLão nói rồi im.'));
  assert.ok(out.trim().endsWith('Hết.'));
  assert.ok(!/pause|SFX|00:45|01:23/.test(out));
});

test('keeps ordinary brackets and quotes', () => {
  const out = stripProduction('Cậu nói: “[chữ] khắc dưới đáy đèn.”');
  assert.ok(out.includes('[chữ]'));
});

test('chapters extracts h2 headings', () => {
  assert.deepEqual(chapters('## Chương 1: A\nx\n## Chương 2: B'), ['Chương 1: A', 'Chương 2: B']);
});

import { parseFrontMatter } from '../scripts/strip.mjs';
test('lenient front matter allows colons in values', () => {
  const { data, content } = parseFrontMatter('---\nhoi: 1\nyt_title: A • Hồi 1: B — C\n---\n## X\n');
  assert.equal(data.hoi, 1);
  assert.equal(data.yt_title, 'A • Hồi 1: B — C');
  assert.equal(content, '## X\n');
});
