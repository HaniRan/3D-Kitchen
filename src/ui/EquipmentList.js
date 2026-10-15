/**
 * Daftar peralatan dengan pencarian & filter (kategori fungsi, jenis, bahan).
 */
import { h, esc, icon } from '../utils/dom.js';
import { CATEGORIES, TYPES } from '../data/equipment.js';
import { renderInfoPanel } from './InfoPanel.js';

const FILTERS = [
  ['all', 'Semua'], ['persiapan', 'Persiapan'], ['pengolahan', 'Pengolahan'], ['holding', 'Holding'], ['serving', 'Serving'],
  ['logam', 'Logam'], ['kayu', 'Kayu'], ['kaca', 'Kaca'], ['plastik', 'Plastik'], ['batu', 'Batu'], ['tanah-liat', 'Tanah Liat'], ['kain', 'Kain'],
];

export function matches(eq, filter, q, type) {
  if (type && eq.type !== type) return false;
  if (filter && filter !== 'all') {
    if (CATEGORIES[filter]) { if (eq.category !== filter) return false; }
    else if (!eq.material.includes(filter)) return false;
  }
  if (q) {
    const s = `${eq.name} ${eq.nameId} ${eq.function} ${eq.subcategory}`.toLowerCase();
    if (!q.toLowerCase().split(/\s+/).every((w) => s.includes(w))) return false;
  }
  return true;
}

export function renderEquipmentList(app, params = {}) {
  if (params.keep && app.selected) {
    renderInfoPanel(app, app.data.byId[app.selected]);
    return;
  }
  const state = app.listState || (app.listState = { q: '', filter: 'all' });
  if (params.cat) state.filter = params.cat;
  else if (!params.keep) state.filter = params.filterKeep ? state.filter : 'all';
  const type = params.type || null;
  const el = h(`<div class="eqlist">
    <div class="panel-head">
      <h3>${esc(params.title || 'Peralatan Dapur')}</h3>
      <p class="muted">${type ? esc(TYPES[type].desc) : params.cat ? esc(CATEGORIES[params.cat].desc) : 'Klik alat pada dapur 3D atau pilih dari daftar untuk melihat informasinya.'}</p>
    </div>
    <label class="search">${icon('search')}<input type="search" placeholder="Cari peralatan..." value="${esc(state.q)}" aria-label="Cari peralatan"></label>
    <div class="filter-chips" role="tablist"></div>
    <div class="count muted"></div>
    <div class="cards"></div>
  </div>`);
  const chips = el.querySelector('.filter-chips');
  FILTERS.forEach(([id, label]) => {
    const c = h(`<button class="fchip${state.filter === id ? ' on' : ''}" data-f="${id}">${label}</button>`);
    c.onclick = () => { state.filter = id; chips.querySelectorAll('.fchip').forEach((x) => x.classList.toggle('on', x.dataset.f === id)); draw(); };
    chips.appendChild(c);
  });
  const input = el.querySelector('input');
  input.oninput = () => { state.q = input.value; draw(); };
  const cards = el.querySelector('.cards');
  function draw() {
    const list = app.data.equipment.filter((e) => matches(e, state.filter, state.q, type));
    el.querySelector('.count').textContent = `${list.length} alat ditemukan`;
    cards.innerHTML = '';
    if (!list.length) cards.innerHTML = '<p class="empty">Tidak ada alat yang cocok. Coba kata kunci atau filter lain.</p>';
    list.forEach((eq) => {
      const done = app.progress.has('learned', eq.id);
      const c = h(`<button class="eq-card${app.selected === eq.id ? ' sel' : ''}" title="${esc(eq.function)}">
        <span class="eq-thumb"></span>
        <span class="eq-txt"><b>${esc(eq.name)}</b><small>${esc(eq.nameId)}</small>
        <span class="eq-meta"><i class="dot dot-${eq.category}"></i>${esc(CATEGORIES[eq.category].short)} · ${eq.type === 'equipment' ? 'Equipment' : 'Utensil'}${done ? ' · <em>✓</em>' : ''}</span></span>
      </button>`);
      const th = c.querySelector('.eq-thumb');
      app.thumbs.request(eq, (url) => { if (url) th.style.backgroundImage = `url(${url})`; });
      c.onclick = () => app.selectEquipment(eq.id);
      c.onmouseenter = () => { const w = app.kitchen.get(eq.id); if (w && app.mode === 'kitchen' && !app.selected) app.stage.highlight(w); };
      c.onmouseleave = () => { if (app.mode === 'kitchen' && !app.selected) app.stage.highlight([]); };
      cards.appendChild(c);
    });
  }
  draw();
  app.setPanel(el);
}
