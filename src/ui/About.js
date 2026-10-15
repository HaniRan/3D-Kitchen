/** Halaman Tentang. */
import { h, esc } from '../utils/dom.js';
import { kitchenSections } from '../data/materials.js';
import { CATEGORIES, TYPES } from '../data/equipment.js';

export function renderAbout(app) {
  const page = h(`<div class="about">
    <section class="card about-card">
      <span class="eyebrow">Tentang Aplikasi</span>
      <h1>Simulator 3D Peralatan Dapur</h1>
      <p>Media pembelajaran interaktif untuk siswa SMK bidang Kuliner. Siswa dapat <b>mengenali</b>, mempelajari fungsi, <b>mengoperasikan secara simulatif</b>, mengelompokkan, dan mempelajari <b>perawatan</b> berbagai peralatan dapur dalam lingkungan dapur profesional 3D.</p>
      <h3>Tujuan Pembelajaran</h3>
      <p>Setelah mempelajari materi ini, siswa diharapkan mampu memahami peralatan dapur: mendeskripsikan fungsi peralatan besar (kitchen equipment) dan peralatan kecil (utensils), membedakan peralatan dapur berdasarkan bahan pembuatnya, serta mengoperasikan dan melakukan perawatan peralatan dapur dengan baik.</p>
      <h3>Peta Materi</h3>
      <ol><li>Kitchen Equipment dan Utensils</li><li>Peralatan Dapur Berdasarkan Bahan Pembuatannya</li><li>Mengoperasikan Peralatan Dapur</li><li>Perawatan Peralatan Dapur</li></ol>
      <h3>Pengelompokan Peralatan</h3>
      <div class="two-col">
        <div><h4>Berdasarkan ukuran</h4><ul>${Object.values(TYPES).map((t) => `<li><b>${t.label}</b> — ${esc(t.desc)}</li>`).join('')}</ul></div>
        <div><h4>Berdasarkan fungsi</h4><ul>${Object.entries(CATEGORIES).filter(([k]) => k !== 'linen').map(([, c]) => `<li><b>${esc(c.label)}</b> — ${esc(c.desc)}</li>`).join('')}</ul></div>
      </div>
      <h3>Jenis Dapur di Industri Kuliner (Kitchen Section)</h3>
      <div class="sections">${kitchenSections.map(([n, d]) => `<div class="sec-item"><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join('')}</div>
      <h3>Teknologi</h3>
      <p>HTML5, CSS3, JavaScript ES Modules, Three.js (WebGL). Semua model 3D dibuat secara prosedural (lathe, extrude, tube) dengan material PBR: stainless steel, kayu, kaca, plastik, batu, keramik, dan kain.</p>
      <p class="muted">Sumber materi: Bahan Ajar Peralatan Dapur (Kemdikbudristek, 2022 — Ann Nurhasanah; Gisslen, 2011).</p>
      <div class="foot-note"><b>SIMULATOR 3D PERALATAN DAPUR</b><br>Media Pembelajaran Interaktif SMK Kuliner<br>© 2026 · Versi 1.0</div>
    </section>
  </div>`);
  app.showPage(page, 'page-about');
  app.setPanel(h(`<div><div class="panel-head"><h3>Cara Menggunakan</h3></div>
    <ol class="steps card">
      <li>Pilih menu di sidebar (Peralatan, Bahan, Simulasi, Perawatan, Quiz).</li>
      <li>Klik alat pada dapur 3D atau pada daftar untuk melihat informasinya.</li>
      <li>Tekan <b>Pelajari</b> untuk mode belajar terpandu (8 tahap).</li>
      <li>Tekan <b>Simulasikan</b> untuk mencoba langkah pengoperasian.</li>
      <li>Gunakan <b>Exploded View</b> untuk melihat bagian-bagian alat.</li>
      <li>Uji pemahaman di menu <b>Quiz</b>.</li>
    </ol></div>`));
}
