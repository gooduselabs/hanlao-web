// Header: mobile drawer + mobile search toggle + client-side search over hồi/chương titles.
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu]');
const drawer = document.getElementById('drawer');
const searchBtn = document.querySelector<HTMLButtonElement>('[data-search-toggle]');
const mSearch = document.getElementById('m-search');

function toggle(btn: HTMLButtonElement | null, el: HTMLElement | null, force?: boolean) {
  if (!btn || !el) return;
  const open = force ?? el.hidden;
  el.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  return open;
}
menuBtn?.addEventListener('click', () => {
  toggle(searchBtn, mSearch, false);
  const open = toggle(menuBtn, drawer);
  menuBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
});
searchBtn?.addEventListener('click', () => {
  toggle(menuBtn, drawer, false);
  if (toggle(searchBtn, mSearch)) mSearch?.querySelector('input')?.focus();
});

/* ---------- search ---------- */
type Entry = { u: string; t: string; n: number; s: string; img?: string; c: { t: string; id: string }[] };
type Hit = { href: string; title: string; sub: string; img?: string; score: number };
let index: Entry[] | null = null;
let loading: Promise<Entry[]> | null = null;
const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function load(src: string) {
  if (index) return Promise.resolve(index);
  return (loading ??= fetch(src)
    .then((r) => r.json())
    .then((d: Entry[]) => (index = d))
    .catch(() => (index = [])));
}

function highlight(text: string, terms: string[]) {
  // Mark matched ranges using the folded string's indices (NFD folding keeps 1:1 length after NFC input).
  const f = fold(text);
  if (f.length !== text.length) return esc(text);
  const marks = new Array(text.length).fill(false);
  for (const t of terms) {
    let i = f.indexOf(t);
    while (t && i >= 0) {
      for (let k = i; k < i + t.length; k++) marks[k] = true;
      i = f.indexOf(t, i + t.length);
    }
  }
  let out = '';
  let on = false;
  for (let i = 0; i < text.length; i++) {
    if (marks[i] !== on) {
      out += marks[i] ? '<mark>' : '</mark>';
      on = marks[i];
    }
    out += esc(text[i]);
  }
  return out + (on ? '</mark>' : '');
}

function search(q: string): { hits: Hit[]; terms: string[] } {
  const terms = fold(q).split(/\s+/).filter(Boolean);
  if (!terms.length || !index) return { hits: [], terms };
  const num = /^\d+$/.test(q.trim()) ? Number(q.trim()) : null;
  const hits: Hit[] = [];
  for (const e of index) {
    const ft = fold(`Hồi ${e.n} ${e.t}`);
    if (num === e.n || terms.every((t) => ft.includes(t))) {
      hits.push({ href: e.u, title: `Hồi ${e.n}: ${e.t}`, sub: e.s, img: e.img, score: num === e.n ? 0 : 1 });
    }
    for (const c of e.c) {
      if (terms.every((t) => fold(c.t).includes(t))) {
        hits.push({ href: `${e.u}#${c.id}`, title: c.t, sub: `Hồi ${e.n}: ${e.t}`, img: e.img, score: 2 });
      }
    }
  }
  hits.sort((a, b) => a.score - b.score);
  return { hits: hits.slice(0, 8), terms };
}

document.querySelectorAll<HTMLFormElement>('form[data-search]').forEach((form) => {
  const input = form.querySelector<HTMLInputElement>('input')!;
  const list = form.querySelector<HTMLUListElement>('.search-results')!;
  let active = -1;
  const items = () => [...list.querySelectorAll<HTMLLIElement>('li[role="option"]')];
  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  };
  const setActive = (i: number) => {
    const els = items();
    if (!els.length) return;
    active = (i + els.length) % els.length;
    els.forEach((el, k) => el.setAttribute('aria-selected', String(k === active)));
    input.setAttribute('aria-activedescendant', els[active].id);
    els[active].scrollIntoView({ block: 'nearest' });
  };
  async function run() {
    const q = input.value.trim();
    if (!q) return close();
    await load(form.dataset.index!);
    const { hits, terms } = search(q);
    list.innerHTML = hits.length
      ? hits
          .map(
            (h, i) =>
              `<li role="option" id="${input.id}-o${i}" aria-selected="false"><a href="${esc(h.href)}">` +
              (h.img ? `<img src="${esc(h.img)}" alt="" width="64" height="36" loading="lazy">` : '<span></span>') +
              `<span><b>${highlight(h.title, terms)}</b><small>${esc(h.sub)}</small></span></a></li>`,
          )
          .join('')
      : `<li class="search-empty">Không tìm thấy “${esc(q)}”. Thử tên hồi, tên chương hoặc số hồi.</li>`;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    active = -1;
  }
  input.addEventListener('focus', () => load(form.dataset.index!));
  input.addEventListener('input', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) run(); else setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Escape') { close(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const els = items();
    const target = els[Math.max(0, active)]?.querySelector('a');
    if (target) location.href = target.href;
    else run();
  });
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target as Node)) close();
  });
});
