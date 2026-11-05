// Progressive enhancement for listing pages: "Đọc tiếp" links/strips and read markers.
type Last = { series: string; episode: number; title: string; url: string; ratio?: number };
function read<T>(k: string, d: T): T {
  try {
    return (JSON.parse(localStorage.getItem(k) || 'null') as T) ?? d;
  } catch {
    return d;
  }
}
const progress = read<Record<string, { ratio: number; max?: number }>>('hanlao:progress:v1', {});
const last = read<Last | null>('hanlao:last:v1', null);

document.querySelectorAll<HTMLElement>('[data-progress-key]').forEach((el) => {
  const p = progress[el.dataset.progressKey!];
  if (p && (p.max ?? p.ratio) > 0.9) el.querySelector<HTMLElement>('.read-mark')?.removeAttribute('hidden');
});

document.querySelectorAll<HTMLAnchorElement>('[data-continue]').forEach((card) => {
  const only = card.dataset.continue;
  if (!last || (only && only !== last.series)) return;
  card.href = last.url;
  const r = progress[`${last.series}/${last.episode}`]?.ratio ?? 0;
  const t = card.querySelector('[data-continue-title]');
  if (t) t.textContent = `Hồi ${last.episode}: ${last.title}`;
  const pct = card.querySelector('[data-continue-pct]');
  if (pct) pct.textContent = r >= 0.01 ? `${Math.round(r * 100)}%` : '';
  const bar = card.querySelector<HTMLElement>('.meter span');
  if (bar) bar.style.width = `${Math.round(r * 100)}%`;
  card.hidden = false;
  // a "start from the beginning" button can step back when there is progress
  document.querySelectorAll<HTMLElement>('[data-hide-when-continue]').forEach((el) => el.classList.replace('btn-primary', 'btn-outline'));
});
