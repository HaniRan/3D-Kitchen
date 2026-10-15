/**
 * PERAWATAN PERALATAN DAPUR: pilih alat → simulasi membersihkan, mengeringkan, memeriksa,
 * memperbaiki/mengganti, dan menyimpan, dengan indikator kondisi alat & umpan balik.
 */
import { h, esc, icon, toast, modal } from '../utils/dom.js';
import { CATEGORIES } from '../data/equipment.js';
import { careSteps } from '../data/materials.js';

function blocks(v) {
  const n = Math.round(v / 10);
  return '█'.repeat(n) + '░'.repeat(10 - n);
}

export function renderMaintenance(app, params = {}) {
  if (!params.id) return renderPicker(app);
  const eq = app.data.byId[params.id];
  app.selected = eq.id;
  const model = app.openStudio(eq.id);
  const saved = app.progress.data.conditions[eq.id] ?? 100;
  const s = app.maint.start(eq, model, saved);
  app.setSafety(eq);
  const log = [];
  const el = h(`<div class="maint">
    <div class="panel-top"><button class="icon-btn" data-act="back" title="Pilih alat lain">${icon('back')}</button><span class="crumb">Perawatan Peralatan Dapur</span></div>
    <div class="panel-head"><span class="eyebrow">PERAWATAN PERALATAN DAPUR</span><h3>${esc(eq.name)}</h3></div>
    <div class="card cond">
      <div class="cond-head"><span>Kondisi alat:</span><b class="cond-val"></b></div>
      <div class="cond-blocks"></div>
      <div class="bar cond-bar"><i></i></div>
    </div>
    <div class="maint-actions"></div>
    <div class="card"><h4>Status</h4><ul class="status-list"></ul></div>
    <div class="card"><h4>Umpan balik</h4><div class="log"></div></div>
    <details class="card"><summary><b>Prosedur perawatan (Bahan Ajar)</b></summary><ol class="steps">${careSteps.map((c) => `<li><b>${esc(c.title)}.</b> ${esc(c.text)}</li>`).join('')}</ol>
      <h4>Khusus ${esc(eq.name)}</h4><ol class="steps">${eq.maintenance.map((m) => `<li>${esc(m)}</li>`).join('')}</ol></details>
  </div>`);
  const actWrap = el.querySelector('.maint-actions');
  app.maint.actions().forEach((a) => {
    const b = h(`<button class="maint-btn" data-a="${a.id}"><span>${a.icon}</span>${esc(a.label)}</button>`);
    actWrap.appendChild(b);
  });
  function draw() {
    const c = Math.round(s.condition);
    const lv = c >= 75 ? 'good' : c >= 45 ? 'mid' : 'low';
    el.querySelector('.cond-val').textContent = `${c}%`;
    el.querySelector('.cond-val').className = `cond-val ${lv}`;
    el.querySelector('.cond-blocks').textContent = blocks(c);
    el.querySelector('.cond-blocks').className = `cond-blocks ${lv}`;
    const bi = el.querySelector('.cond-bar i');
    bi.style.width = `${c}%`;
    bi.className = lv;
    el.querySelector('.status-list').innerHTML = app.maint.status().map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? '✔' : '✖'} ${esc(x.text)}</li>`).join('');
    el.querySelector('.log').innerHTML = log.length ? log.slice(-6).reverse().map((l) => `<div class="log-item log-${l.type}">${esc(l.msg)}</div>`).join('') : '<p class="muted">Mulai dengan menekan "Gunakan alat", lalu lakukan perawatan secara berurutan.</p>';
  }
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a],[data-act]');
    if (!b) return;
    if (b.dataset.act === 'back') return app.navigate('maintenance');
    const r = app.maint.act(b.dataset.a);
    log.push(r);
    app.progress.data.conditions[eq.id] = Math.round(s.condition);
    app.progress.save();
    if (r.type === 'danger') {
      await modal({ title: 'WARNING', body: `<p>${esc(r.msg)}</p>`, level: 'danger' });
    } else if (r.type === 'success') {
      const isNew = app.progress.addTo('maint', eq.id);
      toast(isNew ? 'Perawatan berhasil. Progress bertambah.' : 'Perawatan berhasil.', 'success');
    } else toast(r.msg, r.type === 'ok' ? 'ok' : r.type === 'warn' ? 'warn' : 'info', 2600);
    draw();
  });
  draw();
  app.setPanel(el);
}

function renderPicker(app) {
  app.showKitchen();
  const el = h(`<div class="sim-pick">
    <div class="panel-head"><span class="eyebrow">PERAWATAN PERALATAN DAPUR</span><h3>Pilih alat yang akan dirawat</h3><p class="muted">Peralatan yang tidak dirawat dengan baik akan cepat rusak sehingga menambah pengeluaran.</p></div>
    <label class="search">${icon('search')}<input type="search" placeholder="Cari peralatan..." aria-label="Cari"></label>
    <div class="pick-grid"></div>
  </div>`);
  const grid = el.querySelector('.pick-grid');
  const fill = (q = '') => {
    grid.innerHTML = '';
    app.data.equipment.filter((e) => !q || `${e.name} ${e.nameId}`.toLowerCase().includes(q.toLowerCase())).forEach((eq) => {
      const c = app.progress.data.conditions[eq.id] ?? 100;
      const b = h(`<button class="pick"><span class="eq-thumb"></span><span><b>${esc(eq.name)}</b><small>${esc(CATEGORIES[eq.category].short)} · kondisi ${c}%${app.progress.has('maint', eq.id) ? ' · ✓' : ''}</small></span></button>`);
      app.thumbs.request(eq, (u) => { if (u) b.querySelector('.eq-thumb').style.backgroundImage = `url(${u})`; });
      b.onclick = () => app.navigate('maintenance', { id: eq.id });
      grid.appendChild(b);
    });
  };
  fill();
  el.querySelector('input').oninput = (e) => fill(e.target.value);
  app.setPanel(el);
}
