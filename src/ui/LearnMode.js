/**
 * MODE BELAJAR terpandu (8 tahap): nama alat, model 3D, fungsi, bagian-bagian, cara menggunakan,
 * keselamatan, perawatan, dan latihan. Selesai → progress "peralatan dipelajari" bertambah.
 */
import { h, esc, icon, toast } from '../utils/dom.js';
import { CATEGORIES, TYPES } from '../data/equipment.js';
import { safetyInfo } from './InfoPanel.js';

const STEPS = ['Nama alat', 'Model 3D', 'Fungsi', 'Bagian-bagian', 'Cara menggunakan', 'Keselamatan', 'Perawatan', 'Latihan'];

export function renderLearn(app, params = {}) {
  const eq = app.data.byId[params.id];
  if (!eq) return app.navigate('list');
  app.selected = eq.id;
  const model = app.openStudio(eq.id);
  const api = model.userData.model;
  app.setSafety(eq);
  let step = 0;
  let answered = false;
  // soal latihan: fungsi alat
  const others = app.data.equipment.filter((e) => e.id !== eq.id && e.function !== eq.function).sort(() => Math.random() - 0.5).slice(0, 3);
  const opts = [eq, ...others].sort(() => Math.random() - 0.5);
  const el = h(`<div class="learn">
    <div class="panel-top"><button class="icon-btn" data-act="exit" title="Keluar">${icon('back')}</button><span class="crumb">MODE BELAJAR</span></div>
    <div class="panel-head"><span class="eyebrow">MODE BELAJAR: ${esc(eq.name.toUpperCase())}</span></div>
    <div class="learn-steps"></div>
    <div class="card learn-body"></div>
    <div class="learn-nav">
      <button class="btn btn-ghost" data-act="prev">← SEBELUMNYA</button>
      <button class="btn btn-primary" data-act="next">LANJUT →</button>
    </div>
  </div>`);
  const body = el.querySelector('.learn-body');
  const s = safetyInfo(eq);
  function draw() {
    el.querySelector('.learn-steps').innerHTML = STEPS.map((t, i) => `<span class="ls${i < step ? ' done' : i === step ? ' cur' : ''}" title="${t}">${i + 1}</span>`).join('');
    app.setExplode(step === 3);
    app.labels.forced = step === 3;
    app.labels.show(step === 3);
    app.stage.autoRotate = step === 1;
    if (api) {
      if (step === 4) { ['plug', 'gas', 'power'].forEach((k) => api.has(k) && api.set(k, 1)); api.has('fill') && api.set('fill', 1); }
      else if (step !== 4) { api.reset(); }
    }
    switch (step) {
      case 0: body.innerHTML = `<span class="step-no">1. NAMA ALAT</span><h2>${esc(eq.name)}</h2><p class="lead">${esc(eq.nameId)}</p><div class="chips"><span class="chip chip-cat">${esc(CATEGORIES[eq.category].label)}</span><span class="chip chip-type">${esc(TYPES[eq.type].label)}</span></div><p class="muted">${esc(eq.subcategory)}</p>`; break;
      case 1: body.innerHTML = `<span class="step-no">2. GAMBAR / MODEL 3D</span><h3>Amati bentuk alat</h3><p>Model 3D berputar otomatis. Gunakan <b>drag</b> untuk memutar, <b>scroll</b> untuk zoom, dan <b>klik kanan</b> untuk menggeser tampilan.</p><p class="muted">Bahan: ${esc(eq.materialText)}</p>`; break;
      case 2: body.innerHTML = `<span class="step-no">3. FUNGSI</span><h3>${esc(eq.function)}</h3><p>${esc(eq.description)}</p>`; break;
      case 3: body.innerHTML = `<span class="step-no">4. BAGIAN-BAGIAN</span><h3>Exploded view</h3><ol class="parts">${(api?.parts || []).map((p) => `<li>${esc(p.label)}</li>`).join('') || '<li>Satu komponen utama</li>'}</ol><p class="muted">Komponen dipisahkan perlahan agar bagian-bagiannya terlihat.</p>`; break;
      case 4: body.innerHTML = `<span class="step-no">5. CARA MENGGUNAKAN</span><ol class="steps">${eq.operation.map((o) => `<li>${esc(o)}</li>`).join('')}</ol><button class="btn btn-accent btn-sm" data-act="sim">${icon('play')} Coba simulasinya</button>`; break;
      case 5: body.innerHTML = `<span class="step-no">6. KESELAMATAN</span><div class="safety-head"><span class="level-badge level-${s.level}">${s.label}</span> ${esc(s.msg)}</div><ul class="safety-list">${(eq.safety.length ? eq.safety : ['Gunakan sesuai fungsinya.']).map((o) => `<li>${esc(o)}</li>`).join('')}</ul>`; break;
      case 6: body.innerHTML = `<span class="step-no">7. PERAWATAN</span><ol class="steps">${eq.maintenance.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>`; break;
      case 7: body.innerHTML = `<span class="step-no">8. LATIHAN</span><h3>Apa fungsi ${esc(eq.name)}?</h3><div class="q-opts">${opts.map((o, k) => `<button class="q-opt" data-k="${k}"><span class="q-letter">${'ABCD'[k]}.</span> ${esc(o.function)}</button>`).join('')}</div><div class="q-feedback"></div>`; break;
      default:
    }
    el.querySelector('[data-act="prev"]').disabled = step === 0;
    const nb = el.querySelector('[data-act="next"]');
    nb.textContent = step === STEPS.length - 1 ? 'SELESAI ✓' : 'LANJUT →';
    nb.disabled = step === STEPS.length - 1 && !answered;
    if (step === 7) {
      body.querySelectorAll('.q-opt').forEach((b) => {
        b.onclick = () => {
          const ok = opts[+b.dataset.k].id === eq.id;
          app.audio.play(ok ? 'correct' : 'wrong');
          const fb = body.querySelector('.q-feedback');
          if (ok) {
            answered = true;
            body.querySelectorAll('.q-opt').forEach((x) => { x.disabled = true; });
            b.classList.add('correct');
            fb.className = 'q-feedback show ok';
            fb.innerHTML = `<div><b>BENAR</b> Jawaban benar. ${esc(eq.name)} digunakan untuk ${esc(eq.function.charAt(0).toLowerCase() + eq.function.slice(1))}</div>`;
            nb.disabled = false;
          } else {
            b.classList.add('wrong');
            b.disabled = true;
            fb.className = 'q-feedback show no';
            fb.innerHTML = '<div><b>SALAH</b> Jawaban belum tepat. Pelajari kembali fungsi alat, lalu coba lagi.</div>';
          }
        };
      });
    }
  }
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const a = b.dataset.act;
    if (a === 'prev' && step > 0) { step--; draw(); app.audio.play('click'); }
    else if (a === 'next') {
      if (step < STEPS.length - 1) { step++; draw(); app.audio.play('click'); }
      else {
        const isNew = app.progress.addTo('learned', eq.id);
        app.audio.play('correct');
        toast(isNew ? `Selesai! ${eq.name} tercatat sudah dipelajari.` : 'Selesai! Materi ini sudah pernah dipelajari.', 'success');
        app.labels.forced = false;
        app.navigate('list', { keep: true });
        app.selectEquipment(eq.id, { focus: false });
      }
    } else if (a === 'exit') { app.labels.forced = false; app.navigate('list', { keep: true }); app.selectEquipment(eq.id, { focus: false }); }
    else if (a === 'sim') app.navigate('simulation', { id: eq.id });
  });
  draw();
  app.setPanel(el);
  app.cleanup.push(() => { app.labels.forced = false; });
}
