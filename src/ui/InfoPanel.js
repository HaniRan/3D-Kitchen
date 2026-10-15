/**
 * Panel informasi alat: nama, kategori, fungsi, bahan, cara mengoperasikan, keselamatan,
 * cara perawatan, bagian-bagian, dan tombol PELAJARI / SIMULASIKAN / ROTASI / RESET.
 */
import { h, esc, icon } from '../utils/dom.js';
import { CATEGORIES, TYPES } from '../data/equipment.js';
import { buildModel } from '../models/index.js';

const MAT = { logam: 'Logam', kayu: 'Kayu', 'tanah-liat': 'Tanah Liat', kaca: 'Kaca', plastik: 'Plastik', batu: 'Batu', kain: 'Kain' };

/** Tingkat keselamatan & pesan untuk indikator SAFE / WARNING / DANGER. */
export function safetyInfo(eq) {
  const level = eq.safetyLevel || 'safe';
  let msg = 'Aman digunakan sesuai prosedur.';
  if (eq.hot) msg = 'PERINGATAN: Permukaan panas. Gunakan perlindungan yang sesuai.';
  else if (eq.power === 'listrik' && eq.sharp) msg = 'Bagian tajam & bergerak — jangan disentuh saat terhubung listrik.';
  else if (eq.power === 'gas') msg = 'Periksa kebocoran gas; tutup katup setelah digunakan.';
  else if (eq.power === 'listrik') msg = 'Alat listrik — pastikan tangan kering; cabut steker sebelum dibersihkan.';
  else if (eq.sharp) msg = 'Benda tajam — pegang pada gagang, arahkan menjauhi tubuh.';
  else if (eq.material.includes('kaca')) msg = 'Mudah pecah — tangani dengan hati-hati.';
  return { level, label: { safe: 'SAFE', warning: 'WARNING', danger: 'DANGER' }[level], msg };
}

const partsCache = new Map();
function partsOf(eq) {
  if (!partsCache.has(eq.id)) {
    try {
      const m = buildModel(eq.modelType);
      partsCache.set(eq.id, (m.userData.model?.parts || []).map((p) => p.label));
    } catch (e) { partsCache.set(eq.id, []); }
  }
  return partsCache.get(eq.id);
}

export function renderInfoPanel(app, eq) {
  const s = safetyInfo(eq);
  const learned = app.progress.has('learned', eq.id);
  const parts = partsOf(eq);
  const el = h(`<div class="info">
    <div class="panel-top">
      <button class="icon-btn" data-act="back" title="Kembali ke daftar">${icon('back')}</button>
      <span class="crumb">${esc(CATEGORIES[eq.category].short)} / ${esc(eq.subcategory)}</span>
    </div>
    <div class="info-hero card">
      <div class="thumb" data-thumb></div>
      <div>
        <div class="chips">
          <span class="chip chip-cat">${esc(CATEGORIES[eq.category].short)}</span>
          <span class="chip chip-type">${esc(TYPES[eq.type].label)}</span>
          <span class="level-badge level-${s.level}" title="${esc(s.msg)}">${s.label}</span>
          ${learned ? '<span class="chip chip-done">✓ Dipelajari</span>' : ''}
        </div>
        <h2 class="info-name">${esc(eq.name)}</h2>
        <p class="info-sub">${esc(eq.nameId)}</p>
      </div>
    </div>
    <div class="action-row">
      <button class="btn btn-primary" data-act="learn" title="Mode belajar terpandu">${icon('book')} Pelajari</button>
      <button class="btn btn-accent" data-act="sim" title="Simulasi pengoperasian (S)">${icon('play')} Simulasikan</button>
      <button class="btn btn-ghost" data-act="rotate" title="Lihat detail & putar 360°">${icon('rotate')} Rotasi</button>
      <button class="btn btn-ghost" data-act="reset" title="Reset tampilan (R)">${icon('reset')} Reset</button>
    </div>
    <div class="info-sec card"><h4>Nama Alat</h4><p><b>${esc(eq.name)}</b> — ${esc(eq.nameId)}</p></div>
    <div class="info-sec card"><h4>Kategori</h4><p>${esc(CATEGORIES[eq.category].label)}<br><span class="muted">${esc(TYPES[eq.type].label)}: ${esc(TYPES[eq.type].desc)}</span></p></div>
    <div class="info-sec card"><h4>Fungsi</h4><p>${esc(eq.function)}</p><p class="muted">${esc(eq.description)}</p></div>
    <div class="info-sec card"><h4>Bahan</h4><div class="chips">${eq.material.map((m) => `<span class="chip chip-mat mat-${m}">${MAT[m]}</span>`).join('')}</div><p class="muted">${esc(eq.materialText)}</p></div>
    ${parts.length ? `<div class="info-sec card"><h4>Bagian-Bagian</h4><ol class="parts">${parts.map((p) => `<li>${esc(p)}</li>`).join('')}</ol><button class="btn btn-ghost btn-sm" data-act="explode">${icon('explode')} Exploded View</button></div>` : ''}
    <div class="info-sec card"><h4>Cara Mengoperasikan</h4><ol class="steps">${eq.operation.map((o) => `<li>${esc(o)}</li>`).join('')}</ol></div>
    <div class="info-sec card sec-safety level-${s.level}"><h4>${icon('shield')} Keselamatan</h4><ul class="safety-list">${(eq.safety.length ? eq.safety : ['Gunakan sesuai fungsinya dan jaga kebersihan.']).map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>
    <div class="info-sec card"><h4>Cara Perawatan</h4><ol class="steps">${eq.maintenance.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
      <button class="btn btn-ghost btn-sm" data-act="maint">${icon('sponge')} Simulasi Perawatan</button></div>
  </div>`);
  app.thumbs.request(eq, (url) => { const t = el.querySelector('[data-thumb]'); if (t && url) t.style.backgroundImage = `url(${url})`; });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'back') { app.deselect(); app.showKitchen(); }
    else if (act === 'learn') app.navigate('learn', { id: eq.id });
    else if (act === 'sim') app.navigate('simulation', { id: eq.id });
    else if (act === 'rotate') { app.openStudio(eq.id); app.stage.autoRotate = true; app._updateTools(); }
    else if (act === 'reset') { app.resetView(); }
    else if (act === 'explode') { if (app.mode !== 'studio') app.openStudio(eq.id); setTimeout(() => app.setExplode(true), 300); }
    else if (act === 'maint') app.navigate('maintenance', { id: eq.id });
  });
  app.setPanel(el);
}
