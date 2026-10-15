/**
 * SIMULASI PENGOPERASIAN: pilih alat → jalankan langkah interaktif dengan animasi 3D.
 * Setiap langkah menampilkan pilihan aksi; aksi yang salah memicu peringatan keselamatan.
 */
import { h, esc, icon, toast, modal } from '../utils/dom.js';
import { CATEGORIES } from '../data/equipment.js';

export function renderSimulation(app, params = {}) {
  if (!params.id) return renderPicker(app);
  const eq = app.data.byId[params.id];
  app.selected = eq.id;
  const model = app.openStudio(eq.id);
  const steps = app.sim.start(eq, model);
  app.setSafety(eq);
  if (eq.hot) toast('PERINGATAN: Permukaan panas. Gunakan perlindungan yang sesuai.', 'warn', 4200);
  let cur = 0;
  let done = [];
  const el = h(`<div class="sim">
    <div class="panel-top"><button class="icon-btn" data-act="back" title="Pilih alat lain">${icon('back')}</button><span class="crumb">Simulasi Pengoperasian</span></div>
    <div class="panel-head"><span class="eyebrow">SIMULASI PENGOPERASIAN</span><h3>${esc(eq.name)}</h3><p class="muted">${esc(eq.function)}</p></div>
    <div class="step-dots"></div>
    <div class="card step-card"></div>
    <div class="done-list"></div>
    <div class="action-row">
      <button class="btn btn-ghost btn-sm" data-act="explode">${icon('explode')} Exploded View</button>
      <button class="btn btn-ghost btn-sm" data-act="restart">${icon('reset')} Ulangi</button>
      <button class="btn btn-ghost btn-sm" data-act="info">${icon('info')} Info Alat</button>
    </div>
  </div>`);
  const dots = el.querySelector('.step-dots');
  const card = el.querySelector('.step-card');
  const doneList = el.querySelector('.done-list');
  function draw() {
    dots.innerHTML = steps.map((s, i) => `<span class="sd${i < cur ? ' done' : i === cur ? ' cur' : ''}" title="${esc(s.title)}">${i + 1}</span>`).join('');
    doneList.innerHTML = done.map((i) => `<div class="done-item">${icon('check', 14)} <b>STEP ${i + 1}</b> ${esc(steps[i].title)}</div>`).join('');
    if (cur >= steps.length) {
      card.innerHTML = `<div class="sim-finish"><div class="big">🎉</div><h3>Simulasi selesai!</h3><p>Kamu telah menyelesaikan ${steps.length} langkah pengoperasian <b>${esc(eq.name)}</b> dengan benar.</p>
        <div class="action-row"><button class="btn btn-primary" data-act="restart">${icon('reset')} Ulangi</button><button class="btn btn-accent" data-act="maint">${icon('sponge')} Lanjut Perawatan</button><button class="btn btn-ghost" data-act="back">Pilih alat lain</button></div></div>`;
      return;
    }
    const s = steps[cur];
    card.innerHTML = `<span class="step-no">STEP ${cur + 1} / ${steps.length}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
      <p class="muted small">Pilih tindakan yang benar:</p>
      <div class="opt-list">${s.options.map((o, i) => `<button class="opt" data-opt="${i}">${esc(o.label)}</button>`).join('')}</div>`;
  }
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act],[data-opt]');
    if (!b) return;
    if (b.dataset.opt != null) {
      const opt = steps[cur].options[+b.dataset.opt];
      if (opt.correct) {
        app.sim.doStep(cur);
        done.push(cur);
        cur++;
        if (cur >= steps.length) {
          const isNew = app.progress.addTo('sims', eq.id);
          app.audio.play('correct');
          toast(isNew ? 'Simulasi selesai! Progress bertambah.' : 'Simulasi selesai!', 'success');
        }
        draw();
      } else {
        app.audio.play('warning');
        b.classList.add('wrong');
        const level = /Berbahaya|WARNING|PERINGATAN/.test(opt.msg) ? 'danger' : 'warn';
        await modal({ title: level === 'danger' ? 'Tindakan Berbahaya!' : 'Penggunaan alat tidak sesuai fungsi', body: `<p>${esc(opt.msg)}</p>`, level });
      }
      return;
    }
    const act = b.dataset.act;
    if (act === 'back') app.navigate('simulation');
    else if (act === 'restart') app.navigate('simulation', { id: eq.id });
    else if (act === 'explode') app.setExplode(app.explodeTarget === 0);
    else if (act === 'info') { app.navigate('list', { keep: true }); app.selectEquipment(eq.id, { focus: false }); }
    else if (act === 'maint') app.navigate('maintenance', { id: eq.id });
  });
  draw();
  app.setPanel(el);
}

function renderPicker(app) {
  app.showKitchen();
  const E = app.data.equipment;
  const machines = E.filter((e) => e.sim && !['utensil', 'serve'].includes(e.sim));
  const utensils = E.filter((e) => ['utensil', 'serve'].includes(e.sim));
  const el = h(`<div class="sim-pick">
    <div class="panel-head"><span class="eyebrow">SIMULASI PENGOPERASIAN</span><h3>Pilih alat untuk disimulasikan</h3><p class="muted">Setiap langkah memiliki animasi 3D. Pilih tindakan yang benar dan hindari tindakan berbahaya.</p></div>
    <label class="search">${icon('search')}<input type="search" placeholder="Cari peralatan..." aria-label="Cari"></label>
    <h4 class="group-title">Peralatan bermesin & besar</h4><div class="pick-grid g1"></div>
    <h4 class="group-title">Kitchen utensils & serving</h4><div class="pick-grid g2"></div>
  </div>`);
  const fill = (grid, list, q = '') => {
    grid.innerHTML = '';
    list.filter((e) => !q || `${e.name} ${e.nameId}`.toLowerCase().includes(q.toLowerCase())).forEach((eq) => {
      const done = app.progress.has('sims', eq.id);
      const b = h(`<button class="pick${done ? ' done' : ''}"><span class="eq-thumb"></span><span><b>${esc(eq.name)}</b><small>${esc(CATEGORIES[eq.category].short)}${done ? ' · ✓ selesai' : ''}</small></span></button>`);
      app.thumbs.request(eq, (u) => { if (u) b.querySelector('.eq-thumb').style.backgroundImage = `url(${u})`; });
      b.onclick = () => app.navigate('simulation', { id: eq.id });
      grid.appendChild(b);
    });
  };
  const g1 = el.querySelector('.g1'), g2 = el.querySelector('.g2');
  fill(g1, machines); fill(g2, utensils);
  el.querySelector('input').oninput = (e) => { fill(g1, machines, e.target.value); fill(g2, utensils, e.target.value); };
  app.setPanel(el);
  const v = app.kitchen.defaultView();
  app.stage.flyTo(v.pos, v.target, 0.8);
}
