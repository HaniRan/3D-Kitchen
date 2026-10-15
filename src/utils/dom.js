/** Utilitas DOM kecil. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Template literal ke elemen (fragment pertama). */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Notifikasi singkat (toast). type: info | ok | warn | danger | success */
export function toast(msg, type = 'info', ms = 3200) {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  const icons = { info: 'ℹ️', ok: '✅', success: '🎉', warn: '⚠️', danger: '⛔' };
  const el = h(`<div class="toast toast-${type}" role="status"><span class="toast-ic">${icons[type] || 'ℹ️'}</span><span>${esc(msg)}</span></div>`);
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, ms);
}

/** Dialog modal sederhana. */
export function modal({ title, body, level = 'info', actions = [{ label: 'Mengerti', primary: true }] }) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal');
    root.innerHTML = '';
    const box = h(`<div class="modal-box modal-${level}" role="dialog" aria-modal="true">
      <div class="modal-head"><span class="level-badge level-${level}">${level === 'danger' ? 'DANGER' : level === 'warn' ? 'WARNING' : level === 'ok' ? 'SAFE' : 'INFO'}</span><h3>${esc(title)}</h3></div>
      <div class="modal-body">${body}</div>
      <div class="modal-actions"></div></div>`);
    const act = box.querySelector('.modal-actions');
    actions.forEach((a, i) => {
      const b = h(`<button class="btn ${a.primary ? 'btn-primary' : 'btn-ghost'}">${esc(a.label)}</button>`);
      b.onclick = () => { root.classList.remove('open'); resolve(i); };
      act.appendChild(b);
    });
    root.appendChild(box);
    root.classList.add('open');
    root.onclick = (e) => { if (e.target === root) { root.classList.remove('open'); resolve(-1); } };
  });
}

/** Ikon SVG garis sederhana. */
const P = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  spoon: '<ellipse cx="12" cy="6.5" rx="3.5" ry="4.5"/><path d="M12 11v10"/>',
  knife: '<path d="M4 20L18 6c2-2 3 1 1 3L9 19z"/><path d="M4 20l3-1"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>',
  snow: '<path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/>',
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/>',
  sponge: '<rect x="3" y="7" width="18" height="10" rx="3"/><circle cx="8" cy="12" r="1"/><circle cx="13" cy="11" r="1"/><circle cx="16" cy="13" r="1"/>',
  quiz: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 9a3 3 0 115 2c-1 .7-2 1.2-2 3"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  reset: '<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  rotate: '<path d="M21 12a9 9 0 11-3-6.7"/><path d="M21 3v6h-6"/>',
  explode: '<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M4 4l3 3M20 4l-3 3M4 20l3-3M20 20l-3-3"/>',
  tag: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
  mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  book: '<path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-5a3 3 0 00-3 3v13a2 2 0 012-2h6z"/>',
  kitchen: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M8 13h.01M8 16h8"/>',
  cube: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M3 7l9 5 9-5"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"/>',
  check: '<path d="M5 13l4 4L19 7"/>',
};
export function icon(name, size = 18) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.info}</svg>`;
}
