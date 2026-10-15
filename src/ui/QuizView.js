/**
 * QUIZ: kuis lengkap (10 soal campuran), Identifikasi Peralatan 3D, dan Klasifikasi
 * Kitchen Equipment / Kitchen Utensils (drag-and-drop dengan umpan balik otomatis).
 */
import * as THREE from 'three';
import { h, esc, icon, toast } from '../utils/dom.js';

export function renderQuiz(app, params = {}) {
  if (params.mode === 'full') return runQuiz(app, app.quiz.fullQuiz(), 'Quiz Lengkap', 'quizBest');
  if (params.mode === 'identify') return runQuiz(app, app.quiz.identifyRound(8), 'Identifikasi Peralatan', 'identifyBest');
  if (params.mode === 'classify') return runQuiz(app, [app.quiz.classify(10)], 'Klasifikasi Equipment / Utensils', 'classifyBest');
  return renderMenu(app);
}

function renderMenu(app) {
  app.showKitchen();
  app.stage.autoRotate = true;
  const d = app.progress.data;
  const page = h(`<div class="quiz-menu">
    <div class="card quiz-intro"><span class="eyebrow">QUIZ</span><h1>Uji Pemahamanmu</h1><p>Soal dibuat langsung dari isi bahan ajar: fungsi alat, bahan pembuat, kategori, serta konsep kitchen equipment & utensils.</p></div>
    <div class="quiz-modes">
      <button class="card qmode" data-m="full"><span class="qm-ic">📝</span><b>Quiz Lengkap</b><span>10 soal: pilihan ganda, identifikasi 3D, mencocokkan alat–fungsi & alat–bahan, klasifikasi.</span><em>Skor terbaik: ${d.quizBest}%</em></button>
      <button class="card qmode" data-m="identify"><span class="qm-ic">🧊</span><b>Identifikasi Peralatan</b><span>Sistem menampilkan objek 3D acak. Alat apakah ini? Pilih dari 4 jawaban.</span><em>Skor terbaik: ${d.identifyBest}%</em></button>
      <button class="card qmode" data-m="classify"><span class="qm-ic">🗂️</span><b>Klasifikasi</b><span>Seret alat ke kelompok KITCHEN EQUIPMENT atau KITCHEN UTENSILS.</span><em>Skor terbaik: ${d.classifyBest}%</em></button>
    </div>
  </div>`);
  page.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => app.navigate('quiz', { mode: b.dataset.m, title: 'Quiz' }); });
  app.showPage(page, 'page-quiz');
  app.setPanel(h(`<div><div class="panel-head"><h3>Petunjuk Quiz</h3></div><div class="card"><ul class="steps">
    <li>Bacalah soal dengan teliti.</li><li>Pada soal identifikasi, putar & perbesar model 3D untuk mengamati bentuknya.</li>
    <li>Pada soal mencocokkan, klik alat lalu klik pasangannya.</li><li>Pada klasifikasi, seret kartu ke kotak yang sesuai (atau ketuk kartu lalu ketuk kotak).</li>
    <li>Skor terbaik tersimpan otomatis.</li></ul></div></div>`));
}

function runQuiz(app, questions, title, bestKey) {
  let i = 0, score = 0;
  const total = questions.length;
  const page = h(`<div class="quiz-run"><div class="card quiz-card"></div></div>`);
  const card = page.querySelector('.quiz-card');
  app.showPage(page, 'page-quiz');
  const side = h(`<div><div class="panel-head"><span class="eyebrow">${esc(title)}</span><h3>Progress</h3></div><div class="card"><div class="q-prog"></div><div class="bar"><i></i></div><p class="muted q-score"></p></div>
    <button class="btn btn-ghost btn-block" data-quit>${icon('back')} Kembali ke menu quiz</button></div>`);
  side.querySelector('[data-quit]').onclick = () => app.navigate('quiz');
  app.setPanel(side);
  const upd = () => {
    side.querySelector('.q-prog').innerHTML = `Soal <b>${Math.min(i + 1, total)}</b> dari <b>${total}</b>`;
    side.querySelector('.bar i').style.width = `${(i / total) * 100}%`;
    side.querySelector('.q-score').textContent = `Skor sementara: ${Math.round(score * 10) / 10} / ${total}`;
  };

  function next() {
    upd();
    if (i >= total) return finish();
    const q = questions[i];
    page.className = 'quiz-run' + (q.type === 'identify' ? ' identify' : '');
    if (q.type === 'identify') {
      const m = app.openStudio(q.model);
      m.userData.model?.set('fill', 1);
      app.stage.autoRotate = true;
      app.setSafety(null);
    } else if (app.mode !== 'kitchen') app.showKitchen();
    const head = `<div class="q-head"><span class="q-type">${esc(q.title)}</span><span class="q-num">${i + 1}/${total}</span></div><h2 class="q-text">${esc(q.q)}</h2>`;
    if (q.type === 'mcq' || q.type === 'identify') {
      card.innerHTML = `${head}<div class="q-opts">${q.options.map((o, k) => `<button class="q-opt" data-k="${k}"><span class="q-letter">${'ABCD'[k]}.</span> ${esc(o)}</button>`).join('')}</div><div class="q-feedback"></div>`;
      let answered = false;
      card.querySelectorAll('.q-opt').forEach((b) => {
        b.onclick = () => {
          if (answered) return;
          answered = true;
          const k = +b.dataset.k, ok = k === q.answer;
          if (ok) score++;
          card.querySelectorAll('.q-opt').forEach((x) => { x.disabled = true; if (+x.dataset.k === q.answer) x.classList.add('correct'); });
          if (!ok) b.classList.add('wrong');
          app.audio.play(ok ? 'correct' : 'wrong');
          showFeedback(ok, ok ? q.explainOk : q.explainNo);
        };
      });
    } else if (q.type === 'match') {
      matchQuestion(head, q);
    } else if (q.type === 'classify') {
      classifyQuestion(head, q);
    }
  }

  function showFeedback(ok, text, partial = null) {
    const fb = card.querySelector('.q-feedback') || card.appendChild(h('<div class="q-feedback"></div>'));
    fb.className = `q-feedback show ${ok ? 'ok' : 'no'}`;
    fb.innerHTML = `<div><b>${ok ? 'BENAR' : partial ? 'SELESAI' : 'SALAH'}</b> ${esc(text)}</div><button class="btn btn-primary" data-next>${i + 1 >= total ? 'Lihat Skor' : 'Soal Berikutnya →'}</button>`;
    fb.querySelector('[data-next]').onclick = () => { i++; next(); };
  }

  function matchQuestion(head, q) {
    card.innerHTML = `${head}<div class="match"><div class="m-col m-left"></div><div class="m-col m-right"></div></div><div class="q-feedback"></div>`;
    const L = card.querySelector('.m-left'), R = card.querySelector('.m-right');
    let selL = null, mistakes = 0, matched = 0;
    q.left.forEach((l) => { const b = h(`<button class="m-item" data-id="${l.id}">${esc(l.text)}</button>`); L.appendChild(b); });
    q.right.forEach((r) => { const b = h(`<button class="m-item m-r" data-id="${r.id}">${esc(r.text)}</button>`); R.appendChild(b); });
    L.onclick = (e) => {
      const b = e.target.closest('.m-item');
      if (!b || b.classList.contains('locked')) return;
      L.querySelectorAll('.m-item').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel');
      selL = b;
      app.audio.play('click');
    };
    R.onclick = (e) => {
      const b = e.target.closest('.m-item');
      if (!b || b.classList.contains('locked')) return;
      if (!selL) { toast('Pilih alat di kolom kiri terlebih dahulu.', 'info', 1800); return; }
      if (b.dataset.id === selL.dataset.id) {
        [b, selL].forEach((x) => { x.classList.remove('sel'); x.classList.add('locked'); x.dataset.pair = matched + 1; });
        matched++;
        selL = null;
        app.audio.play('correct');
        if (matched === q.left.length) {
          const pts = Math.max(0, 1 - mistakes * 0.25);
          score += pts;
          showFeedback(mistakes === 0, mistakes === 0 ? 'Semua pasangan tepat!' : `Semua pasangan selesai dengan ${mistakes} kesalahan. Pelajari kembali fungsi alat.`, true);
        }
      } else {
        mistakes++;
        b.classList.add('wrong');
        app.audio.play('wrong');
        setTimeout(() => b.classList.remove('wrong'), 600);
      }
    };
  }

  function classifyQuestion(head, q) {
    card.innerHTML = `${head}<div class="classify"><div class="pool"></div>
      <div class="bins"><div class="bin" data-bin="equipment"><b>KITCHEN EQUIPMENT</b><small>Besar, sulit dipindahkan, bermesin listrik/gas</small><div class="bin-items"></div></div>
      <div class="bin" data-bin="utensil"><b>KITCHEN UTENSILS</b><small>Kecil, mudah dipindahkan, umumnya tanpa mesin</small><div class="bin-items"></div></div></div></div><div class="q-feedback"></div>`;
    const pool = card.querySelector('.pool');
    let correct = 0, placed = 0, picked = null;
    q.items.forEach((it) => {
      const eq = app.data.byId[it.id];
      const b = h(`<div class="cl-item" draggable="true" data-id="${it.id}" tabindex="0"><span class="eq-thumb"></span>${esc(it.text)}</div>`);
      app.thumbs.request(eq, (u) => { if (u) b.querySelector('.eq-thumb').style.backgroundImage = `url(${u})`; });
      b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', it.id); b.classList.add('dragging'); });
      b.addEventListener('dragend', () => b.classList.remove('dragging'));
      b.addEventListener('click', () => { pool.querySelectorAll('.cl-item').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); picked = it.id; });
      pool.appendChild(b);
    });
    const drop = (binEl, id) => {
      const it = q.items.find((x) => x.id === id);
      const node = pool.querySelector(`[data-id="${id}"]`);
      if (!it || !node) return;
      const ok = it.answer === binEl.dataset.bin;
      node.classList.remove('sel');
      node.draggable = false;
      node.classList.add(ok ? 'ok' : 'no');
      node.title = ok ? 'Benar' : `Kurang tepat — ${it.text} termasuk ${it.answer === 'equipment' ? 'kitchen equipment' : 'kitchen utensils'}`;
      binEl.querySelector('.bin-items').appendChild(node);
      placed++;
      if (ok) correct++;
      app.audio.play(ok ? 'correct' : 'wrong');
      toast(ok ? `Benar: ${it.text} → ${binEl.dataset.bin === 'equipment' ? 'Kitchen Equipment' : 'Kitchen Utensils'}` : `Kurang tepat: ${it.text} termasuk ${it.answer === 'equipment' ? 'Kitchen Equipment' : 'Kitchen Utensils'}`, ok ? 'ok' : 'warn', 1800);
      picked = null;
      if (placed === q.items.length) {
        score += correct / q.items.length;
        showFeedback(correct === q.items.length, `${correct} dari ${q.items.length} alat diklasifikasikan dengan benar.`, true);
      }
    };
    card.querySelectorAll('.bin').forEach((bin) => {
      bin.addEventListener('dragover', (e) => { e.preventDefault(); bin.classList.add('over'); });
      bin.addEventListener('dragleave', () => bin.classList.remove('over'));
      bin.addEventListener('drop', (e) => { e.preventDefault(); bin.classList.remove('over'); drop(bin, e.dataTransfer.getData('text/plain')); });
      bin.addEventListener('click', () => { if (picked) drop(bin, picked); });
    });
  }

  function finish() {
    const pct = Math.round((score / total) * 100);
    const best = app.progress.data[bestKey] || 0;
    if (pct > best) app.progress.set(bestKey, pct);
    app.progress.set('quizLast', pct);
    page.className = 'quiz-run';
    app.showKitchen();
    app.stage.autoRotate = true;
    const msg = pct >= 85 ? 'Luar biasa! Pemahamanmu sangat baik.' : pct >= 70 ? 'Bagus! Pertahankan dan pelajari kembali bagian yang salah.' : 'Pelajari kembali materi peralatan dapur, lalu coba lagi.';
    card.innerHTML = `<div class="q-final"><div class="score-ring" style="--p:${pct}"><b>${pct}%</b></div><h2>Skor Akhir</h2><p>${esc(msg)}</p>
      <p class="muted">Skor terbaik: ${Math.max(pct, best)}%</p>
      <div class="action-row"><button class="btn btn-primary" data-again>${icon('reset')} Ulangi</button><button class="btn btn-ghost" data-menu>Menu Quiz</button><button class="btn btn-ghost" data-learn>${icon('book')} Pelajari Materi</button></div></div>`;
    app.audio.play(pct >= 70 ? 'correct' : 'click');
    card.querySelector('[data-again]').onclick = () => app.navigate('quiz', { ...app.params });
    card.querySelector('[data-menu]').onclick = () => app.navigate('quiz');
    card.querySelector('[data-learn]').onclick = () => app.navigate('list', { title: 'Peralatan Dapur' });
    upd();
    side.querySelector('.bar i').style.width = '100%';
  }
  next();
  void THREE;
}
