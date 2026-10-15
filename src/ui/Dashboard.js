/**
 * Dashboard: judul simulator, ilustrasi dapur 3D (latar langsung), jumlah alat, kategori,
 * progress belajar, dan tombol "Mulai Simulasi".
 */
import { h, esc, icon } from '../utils/dom.js';
import { CATEGORIES } from '../data/equipment.js';

export function renderDashboard(app) {
  const E = app.data.equipment;
  const d = app.progress.data;
  const nEq = E.filter((e) => e.type === 'equipment').length;
  const nUt = E.length - nEq;
  const pct = (a, b) => Math.round((a / Math.max(b, 1)) * 100);
  const simTotal = E.filter((e) => e.sim).length;
  const page = h(`<div class="dash">
    <section class="dash-hero">
      <div class="dash-hero-text">
        <span class="eyebrow">Media Pembelajaran Interaktif SMK Kuliner</span>
        <h1>Simulator 3D<br>Peralatan Dapur</h1>
        <p>Kenali • Simulasikan • Rawat. Jelajahi dapur profesional 3D, pelajari fungsi, bahan, cara mengoperasikan, keselamatan, dan perawatan ${E.length} peralatan dapur.</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" data-go="simulation">${icon('play')} Mulai Simulasi</button>
          <button class="btn btn-glass btn-lg" data-go="list">${icon('grid')} Jelajahi Dapur</button>
        </div>
      </div>
      <div class="dash-hero-hint">${icon('rotate', 16)} Dapur 3D di belakang ini interaktif — klik alat untuk mempelajarinya.</div>
    </section>
    <section class="stat-grid">
      <div class="stat card"><b>${E.length}</b><span>Peralatan tersedia</span></div>
      <div class="stat card"><b>${nEq}</b><span>Kitchen equipment</span></div>
      <div class="stat card"><b>${nUt}</b><span>Kitchen utensils</span></div>
      <div class="stat card"><b>7</b><span>Jenis bahan pembuat</span></div>
    </section>
    <h3 class="sec-title">Kategori Alat (berdasarkan fungsi)</h3>
    <section class="cat-grid"></section>
    <h3 class="sec-title">Fitur Pembelajaran</h3>
    <section class="feat-grid">
      <button class="feat card" data-go="materials">${icon('layers', 22)}<b>Bahan Pembuat</b><span>Logam, kayu, tanah liat, kaca, plastik, batu, kain.</span></button>
      <button class="feat card" data-go="simulation">${icon('play', 22)}<b>Simulasi Pengoperasian</b><span>Langkah interaktif dengan animasi 3D & exploded view.</span></button>
      <button class="feat card" data-go="maintenance">${icon('sponge', 22)}<b>Perawatan Alat</b><span>Bersihkan, keringkan, periksa, perbaiki, simpan.</span></button>
      <button class="feat card" data-go="quiz">${icon('quiz', 22)}<b>Quiz & Identifikasi 3D</b><span>Pilihan ganda, mencocokkan, klasifikasi drag & drop.</span></button>
    </section>
  </div>`);
  const cg = page.querySelector('.cat-grid');
  Object.entries(CATEGORIES).forEach(([k, c]) => {
    const n = E.filter((e) => e.category === k).length;
    const b = h(`<button class="cat card cat-${k}"><span class="cat-ic">${c.icon}</span><b>${esc(c.short)}</b><small>${esc(c.label)}</small><em>${n} alat</em></button>`);
    b.onclick = () => app.navigate('list', { cat: k, title: c.label });
    cg.appendChild(b);
  });
  page.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => app.navigate(b.dataset.go, b.dataset.go === 'list' ? { title: 'Peralatan Dapur' } : {}); });
  app.showPage(page, 'page-dashboard');

  const panel = h(`<div class="dash-panel">
    <div class="panel-head"><h3>Progress Belajar</h3><p class="muted">Tersimpan otomatis di perangkat ini.</p></div>
    <div class="card prog">
      <div class="prog-row"><span>Peralatan dipelajari</span><b>${d.learned.length} / ${E.length}</b></div><div class="bar"><i style="width:${pct(d.learned.length, E.length)}%"></i></div>
      <div class="prog-row"><span>Peralatan dilihat</span><b>${d.viewed.length} / ${E.length}</b></div><div class="bar bar-b"><i style="width:${pct(d.viewed.length, E.length)}%"></i></div>
      <div class="prog-row"><span>Simulasi selesai</span><b>${d.sims.length}</b></div><div class="bar bar-c"><i style="width:${pct(d.sims.length, simTotal)}%"></i></div>
      <div class="prog-row"><span>Perawatan berhasil</span><b>${d.maint.length}</b></div><div class="bar bar-d"><i style="width:${pct(d.maint.length, E.length)}%"></i></div>
      <div class="prog-row"><span>Quiz (skor terbaik)</span><b>${d.quizBest}%</b></div><div class="bar bar-e"><i style="width:${d.quizBest}%"></i></div>
    </div>
    <div class="card help">
      <h4>Kontrol 3D</h4>
      <ul class="kbd-list">
        <li><kbd>Klik</kbd> pilih alat</li><li><kbd>Drag</kbd> putar kamera</li><li><kbd>Scroll</kbd> zoom</li><li><kbd>Klik kanan</kbd> geser (pan)</li>
        <li><kbd>R</kbd> reset kamera</li><li><kbd>F</kbd> fokus alat</li><li><kbd>E</kbd> exploded view</li><li><kbd>I</kbd> informasi</li><li><kbd>S</kbd> simulasi</li>
      </ul>
    </div>
    <button class="btn btn-ghost btn-block" data-reset>${icon('reset')} Atur ulang progress</button>
  </div>`);
  panel.querySelector('[data-reset]').onclick = async () => {
    const { modal } = await import('../utils/dom.js');
    const r = await modal({ title: 'Atur ulang progress?', body: '<p>Semua catatan peralatan dipelajari, simulasi, perawatan, dan skor quiz akan dihapus dari perangkat ini.</p>', level: 'warn', actions: [{ label: 'Batal' }, { label: 'Ya, atur ulang', primary: true }] });
    if (r === 1) { app.progress.reset(); renderDashboard(app); }
  };
  app.setPanel(panel);
}
