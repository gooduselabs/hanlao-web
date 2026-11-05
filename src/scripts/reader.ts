// Reading-mode enhancements. Everything degrades gracefully: without JS the prose, TOC and
// prev/next links still work; without localStorage, defaults are used.

type Prefs = { theme: string; font: 'serif' | 'sans'; size: number; lineHeight: number; width: number; speed: number };
const PREFS_KEY = 'hanlao:prefs:v1';
const PROGRESS_KEY = 'hanlao:progress:v1';
const LAST_KEY = 'hanlao:last:v1';
const THEMES = ['light', 'sepia', 'mint', 'blue', 'pink', 'dark', 'night'];
const DEFAULTS: Prefs = { theme: 'light', font: 'serif', size: 20, lineHeight: 1.85, width: 720, speed: 3 };
const LIMITS = { size: [14, 30], lineHeight: [1.4, 2.4], width: [480, 960], speed: [1, 10] } as const;

const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode / quota: ignore */
    }
  },
};

const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, n));
function sanitize(p: Partial<Prefs>): Prefs {
  const o = { ...DEFAULTS, ...p };
  return {
    theme: THEMES.includes(o.theme) ? o.theme : DEFAULTS.theme,
    font: o.font === 'sans' ? 'sans' : 'serif',
    size: clamp(Number(o.size) || DEFAULTS.size, LIMITS.size),
    lineHeight: clamp(Number(o.lineHeight) || DEFAULTS.lineHeight, LIMITS.lineHeight),
    width: clamp(Number(o.width) || DEFAULTS.width, LIMITS.width),
    speed: clamp(Math.round(Number(o.speed) || DEFAULTS.speed), LIMITS.speed),
  };
}

const root = document.documentElement;
const article = document.querySelector<HTMLElement>('article.reader');
const toolbar = document.getElementById('r-toolbar');

if (article && toolbar) {
  let prefs = sanitize(store.get<Partial<Prefs>>(PREFS_KEY, {}));
  const $ = <T extends Element>(sel: string, el: ParentNode = toolbar) => el.querySelector<T>(sel)!;
  const btn = (act: string) => $<HTMLButtonElement>(`[data-act="${act}"]`);
  const settings = document.getElementById('r-settings')!;
  const toc = document.getElementById('r-toc')!;
  const toast = document.getElementById('r-toast')!;
  const bar = document.querySelector<HTMLElement>('.r-progress span');
  const body = document.getElementById('r-body')!;
  const key = `${article.dataset.series}/${article.dataset.episode}`;

  toolbar.hidden = false;

  /* ---------- Preferences ---------- */
  function apply() {
    root.dataset.rtheme = prefs.theme;
    root.dataset.rfont = prefs.font;
    root.style.setProperty('--r-size', `${prefs.size}px`);
    root.style.setProperty('--r-lh', String(prefs.lineHeight));
    root.style.setProperty('--r-width', `${prefs.width}px`);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--r-bg').trim() || '#fffdf8');
    // sync controls
    settings.querySelectorAll<HTMLInputElement>('input[name="r-theme"]').forEach((i) => (i.checked = i.value === prefs.theme));
    settings.querySelectorAll<HTMLInputElement>('input[name="r-font"]').forEach((i) => (i.checked = i.value === prefs.font));
    (['size', 'lineHeight', 'width', 'speed'] as const).forEach((k) => {
      const input = settings.querySelector<HTMLInputElement>(`input[name="${k}"]`)!;
      input.value = String(prefs[k]);
      const out = settings.querySelector(`[data-out="${k}"]`)!;
      out.textContent = k === 'size' ? `${prefs.size}px` : k === 'width' ? `${prefs.width}px` : k === 'lineHeight' ? prefs.lineHeight.toFixed(2) : String(prefs.speed);
    });
    $('.r-speed').textContent = String(prefs.speed);
  }
  function update(p: Partial<Prefs>) {
    const anchor = currentRatio();
    prefs = sanitize({ ...prefs, ...p });
    store.set(PREFS_KEY, prefs);
    apply();
    // keep reading position stable when typography changes
    if ('size' in p || 'lineHeight' in p || 'width' in p || 'font' in p) scrollToRatio(anchor, 'auto');
  }
  settings.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'r-theme') update({ theme: t.value });
    else if (t.name === 'r-font') update({ font: t.value as Prefs['font'] });
  });
  settings.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.type === 'range') update({ [t.name]: Number(t.value) } as Partial<Prefs>);
  });
  apply();

  /* ---------- Panels ---------- */
  function openPanel(panel: HTMLElement | null) {
    for (const [p, b] of [[settings, btn('settings')], [toc, btn('toc')]] as const) {
      const open = p === panel && p.hidden;
      p.hidden = !open;
      b.setAttribute('aria-expanded', String(open));
      if (open) (p.querySelector<HTMLElement>('input:checked, a.is-active, a[aria-current], button, a') as HTMLElement | null)?.focus({ preventScroll: true });
    }
  }
  const closePanels = () => {
    if (!settings.hidden || !toc.hidden) {
      settings.hidden = toc.hidden = true;
      btn('settings').setAttribute('aria-expanded', 'false');
      btn('toc').setAttribute('aria-expanded', 'false');
      return true;
    }
    return false;
  };
  document.addEventListener('click', (e) => {
    if (!toolbar.contains(e.target as Node)) closePanels();
  });
  toc.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a[data-chapter]')) closePanels();
  });

  /* ---------- Progress ---------- */
  function bounds() {
    const top = article!.getBoundingClientRect().top + scrollY + body.offsetTop - article!.offsetTop;
    const end = body.getBoundingClientRect().bottom + scrollY - innerHeight;
    return { top, span: Math.max(1, end - top) };
  }
  function currentRatio() {
    const b = bounds();
    return clamp((scrollY - b.top) / b.span, [0, 1]);
  }
  function scrollToRatio(r: number, behavior: ScrollBehavior = 'smooth') {
    const b = bounds();
    scrollTo({ top: b.top + r * b.span, behavior });
  }
  const chapterLinks = [...toc.querySelectorAll<HTMLAnchorElement>('a[data-chapter]')];
  const headings = chapterLinks.map((a) => document.getElementById(a.dataset.chapter!)).filter(Boolean) as HTMLElement[];
  let saveTimer = 0;
  function onScroll() {
    const r = currentRatio();
    if (bar) bar.style.transform = `scaleX(${r})`;
    // active chapter in TOC
    let idx = -1;
    headings.forEach((h, i) => {
      if (h.getBoundingClientRect().top < innerHeight * 0.35) idx = i;
    });
    chapterLinks.forEach((a, i) => a.classList.toggle('is-active', i === idx));
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const all = store.get<Record<string, { ratio: number; max?: number; t: number }>>(PROGRESS_KEY, {});
      all[key] = { ratio: r, max: Math.max(r, all[key]?.max ?? 0), t: Date.now() };
      store.set(PROGRESS_KEY, all);
      store.set(LAST_KEY, { series: article!.dataset.series, episode: Number(article!.dataset.episode), title: article!.dataset.title, url: article!.dataset.url, t: Date.now() });
    }, 400);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------- Toast / resume ---------- */
  function showToast(html: string, actions: { label: string; ghost?: boolean; run: () => void }[] = [], ms = 7000) {
    toast.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = html;
    toast.append(span);
    for (const a of actions) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = a.label;
      if (a.ghost) b.className = 'ghost';
      b.onclick = () => {
        a.run();
        toast.hidden = true;
      };
      toast.append(b);
    }
    toast.hidden = false;
    clearTimeout((toast as any)._t);
    (toast as any)._t = setTimeout(() => (toast.hidden = true), ms);
  }
  const saved = store.get<Record<string, { ratio: number }>>(PROGRESS_KEY, {})[key];
  if (!location.hash && saved && saved.ratio > 0.03 && saved.ratio < 0.98) {
    showToast(`Lần trước các con đọc tới ${Math.round(saved.ratio * 100)}%`, [
      { label: 'Đọc tiếp', run: () => scrollToRatio(saved.ratio) },
      { label: 'Từ đầu', ghost: true, run: () => {} },
    ], 10000);
  }
  onScroll();

  /* ---------- Auto-scroll ---------- */
  let scrolling = false;
  let raf = 0;
  let last = 0;
  let carry = 0;
  const pxPerSec = () => 8 + prefs.speed * prefs.speed * 2.2 + prefs.speed * 6; // 1→16 … 10→288 px/s
  function step(ts: number) {
    if (!scrolling) return;
    const dt = last ? Math.min(100, ts - last) : 16;
    last = ts;
    carry += (pxPerSec() * dt) / 1000;
    const whole = Math.floor(carry);
    if (whole >= 1) {
      carry -= whole;
      scrollBy(0, whole);
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
      setScrolling(false);
      showToast('Hết hồi rồi. Sang hồi sau nhé?', article!.dataset.next ? [{ label: 'Hồi sau →', run: () => (location.href = article!.dataset.next!) }] : []);
      return;
    }
    raf = requestAnimationFrame(step);
  }
  function setScrolling(on: boolean) {
    scrolling = on;
    btn('scroll').setAttribute('aria-pressed', String(on));
    btn('scroll').title = on ? 'Dừng tự cuộn (S / Space)' : 'Tự cuộn (S)';
    cancelAnimationFrame(raf);
    last = 0;
    carry = 0;
    if (on) raf = requestAnimationFrame(step);
    if (root.classList.contains('immersive')) armIdle();
  }
  const changeSpeed = (d: number) => {
    update({ speed: prefs.speed + d });
    $('.r-speed').animate?.([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], 200);
  };
  // tap-to-pause / resume on the text (mobile & desktop), ignoring links and text selection
  body.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) return;
    if (getSelection()?.toString()) return;
    if (scrolling) {
      setScrolling(false);
      showToast('Đã dừng tự cuộn', [{ label: 'Tiếp tục', run: () => setScrolling(true) }], 2500);
    }
  });
  // user wheel/touch drag shouldn't fight the auto-scroll: pause briefly
  let nudge = 0;
  const userNudge = () => {
    if (!scrolling) return;
    cancelAnimationFrame(raf);
    clearTimeout(nudge);
    nudge = window.setTimeout(() => {
      if (scrolling) {
        last = 0;
        raf = requestAnimationFrame(step);
      }
    }, 900);
  };
  addEventListener('wheel', userNudge, { passive: true });
  addEventListener('touchmove', userNudge, { passive: true });

  /* ---------- Immersive / full-screen ---------- */
  let idleTimer = 0;
  function armIdle() {
    toolbar!.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (root.classList.contains('immersive') && settings.hidden && toc.hidden) toolbar!.classList.add('idle');
    }, 2500);
  }
  function setImmersive(on: boolean) {
    const r = currentRatio();
    root.classList.toggle('immersive', on);
    btn('immersive').setAttribute('aria-pressed', String(on));
    if (on) {
      root.requestFullscreen?.().catch(() => {});
      armIdle();
    } else {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      toolbar!.classList.remove('idle');
    }
    requestAnimationFrame(() => scrollToRatio(r, 'auto'));
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && root.classList.contains('immersive')) setImmersive(false);
  });
  for (const ev of ['mousemove', 'touchstart', 'keydown']) addEventListener(ev, () => root.classList.contains('immersive') && armIdle(), { passive: true });

  /* ---------- Text-to-speech (vi-VN) ---------- */
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let speaking = false;
  let queue: HTMLElement[] = [];
  let qi = 0;
  let viVoice: SpeechSynthesisVoice | null = null;
  const pickVoice = () => {
    viVoice = synth?.getVoices().find((v) => /^vi([-_]|$)/i.test(v.lang)) ?? null;
  };
  if (synth) {
    btn('tts').hidden = false;
    pickVoice();
    synth.addEventListener?.('voiceschanged', pickVoice);
  }
  function clearMark() {
    body.querySelectorAll('.tts-on').forEach((el) => el.classList.remove('tts-on'));
  }
  function speakNext() {
    if (!synth || !speaking) return;
    clearMark();
    if (qi >= queue.length) return stopTTS();
    const el = queue[qi++];
    el.classList.add('tts-on');
    if (!scrolling) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const u = new SpeechSynthesisUtterance(el.textContent ?? '');
    u.lang = 'vi-VN';
    if (viVoice) u.voice = viVoice;
    u.rate = 0.95;
    u.onend = speakNext;
    u.onerror = () => speaking && speakNext();
    synth.speak(u);
  }
  function startTTS() {
    if (!synth) return;
    if (!viVoice) showToast('Máy chưa có giọng tiếng Việt — trình duyệt sẽ dùng giọng mặc định.', [], 4000);
    queue = [...body.querySelectorAll<HTMLElement>('p, h2')];
    qi = Math.max(0, queue.findIndex((el) => el.getBoundingClientRect().bottom > 80));
    speaking = true;
    btn('tts').setAttribute('aria-pressed', 'true');
    synth.cancel();
    speakNext();
  }
  function stopTTS() {
    speaking = false;
    synth?.cancel();
    clearMark();
    btn('tts').setAttribute('aria-pressed', 'false');
  }
  addEventListener('pagehide', () => synth?.cancel());

  /* ---------- Toolbar actions ---------- */
  toolbar.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-act]');
    if (!b) return;
    switch (b.dataset.act) {
      case 'toc': return openPanel(toc);
      case 'settings': return openPanel(settings);
      case 'close': return void closePanels();
      case 'scroll': return setScrolling(!scrolling);
      case 'slower': return changeSpeed(-1);
      case 'faster': return changeSpeed(1);
      case 'immersive': return setImmersive(!root.classList.contains('immersive'));
      case 'tts': return speaking ? stopTTS() : startTTS();
      case 'reset':
        prefs = { ...DEFAULTS };
        store.set(PREFS_KEY, prefs);
        return apply();
    }
  });

  /* ---------- Keyboard shortcuts ---------- */
  addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
    const k = e.key;
    if (k === 'Escape') {
      if (closePanels()) return;
      if (scrolling) return setScrolling(false);
      if (speaking) return stopTTS();
      if (root.classList.contains('immersive')) return setImmersive(false);
      return;
    }
    if (k === ' ' && scrolling) {
      e.preventDefault();
      return setScrolling(false);
    }
    if (/^(BUTTON|A)$/.test(t.tagName) && (k === ' ' || k === 'Enter')) return;
    switch (k.toLowerCase()) {
      case 's': e.preventDefault(); return setScrolling(!scrolling);
      case '+': case '=': return changeSpeed(1);
      case '-': case '_': return changeSpeed(-1);
      case 'f': return setImmersive(!root.classList.contains('immersive'));
      case 'm': return openPanel(toc);
      case 't': return update({ theme: THEMES[(THEMES.indexOf(prefs.theme) + 1) % THEMES.length] });
      case 'arrowleft': if (article.dataset.prev) location.href = article.dataset.prev; return;
      case 'arrowright': if (article.dataset.next) location.href = article.dataset.next; return;
    }
  });
}
