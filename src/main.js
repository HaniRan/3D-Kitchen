/**
 * SIMULATOR 3D PERALATAN DAPUR — titik masuk aplikasi.
 * Mengatur navigasi menu, dua mode 3D (Dapur & Studio), pemilihan alat, panel informasi,
 * mode belajar, simulasi, perawatan, kuis, progress, audio, dan kontrol keyboard.
 */
import * as THREE from 'three';
import './styles/main.css';
import { Stage } from './core/Stage.js';
import { KitchenScene } from './scenes/KitchenScene.js';
import { StudioScene } from './scenes/StudioScene.js';
import { buildModel } from './models/index.js';
import { equipmentData, byId, CATEGORIES, TYPES } from './data/equipment.js';
import { OperationSimulation } from './simulation/OperationSimulation.js';
import { MaintenanceSimulation } from './simulation/MaintenanceSimulation.js';
import { QuizSystem } from './quiz/QuizSystem.js';
import { Audio } from './utils/audio.js';
import { Progress } from './utils/storage.js';
import { Thumbnails } from './utils/thumbnails.js';
import { $, h, toast, icon } from './utils/dom.js';
import { renderSidebar, MENU } from './ui/Sidebar.js';
import { renderInfoPanel, safetyInfo } from './ui/InfoPanel.js';
import { renderEquipmentList } from './ui/EquipmentList.js';
import { renderDashboard } from './ui/Dashboard.js';
import { renderMaterials } from './ui/MaterialsView.js';
import { renderSimulation } from './ui/SimulationView.js';
import { renderMaintenance } from './ui/MaintenanceView.js';
import { renderQuiz } from './ui/QuizView.js';
import { renderLearn } from './ui/LearnMode.js';
import { renderAbout } from './ui/About.js';
import { PartLabels } from './ui/Labels.js';

class App {
  constructor() {
    this.data = { equipment: equipmentData, byId, CATEGORIES, TYPES };
    this.progress = new Progress();
    this.audio = new Audio(this.progress.data.sound);
    this.thumbs = new Thumbnails();
    this.quiz = new QuizSystem(equipmentData);
    this.view = 'dashboard';
    this.params = {};
    this.mode = 'kitchen';
    this.selected = null;
    this.exploded = 0;
    this.explodeTarget = 0;
    this.cleanup = [];
  }

  async init() {
    this.el = {
      app: $('#app'), stage: $('#stage'), panel: $('#panel'), panelBody: $('#panelBody'), page: $('#page'),
      title: $('#viewTitle'), tooltip: $('#tooltip'), safety: $('#safety'), tools: $('#viewTools'), sidebar: $('#sidebar'),
    };
    try {
      this.stage = new Stage(this.el.stage);
    } catch (err) {
      this._webglError(err);
      return;
    }
    this.kitchen = new KitchenScene(this.stage, this.data);
    this.studio = new StudioScene(this.stage);
    this.sim = new OperationSimulation({ studio: this.studio, stage: this.stage, audio: this.audio });
    this.maint = new MaintenanceSimulation({ studio: this.studio, stage: this.stage, audio: this.audio });
    this.labels = new PartLabels(this.stage, $('#hudLabels'));
    this.poses = { kitchen: this.kitchen.landingView(), studio: null };
    this.stage.setScene(this.kitchen.scene);
    this._applyPose(this.kitchen.landingView());
    this.stage.autoRotate = true;
    this.stage.controls.minDistance = 0.3;
    this.stage.controls.maxDistance = 22;

    this.stage.addTicker((dt) => this._tick(dt));
    this.stage.onPick = (hit) => this._onPick(hit);
    this.stage.onHover = (hit, e) => this._onHover(hit, e);

    renderSidebar(this);
    this._bindChrome();
    this._bindKeys();
    this._buildTools();

    // memuat dapur bertahap dengan progress pada layar awal
    const bar = $('#loadBar'), txt = $('#loadText');
    await this.kitchen.populate((p) => {
      bar.style.width = `${Math.round(p * 100)}%`;
      txt.textContent = `Memuat dapur 3D… ${Math.round(p * 100)}%`;
    });
    txt.textContent = `${equipmentData.length} peralatan siap dipelajari`;
    $('#btnStart').disabled = false;
    $('#landing').classList.add('ready');
    this.navigate('dashboard', {}, { silent: true });
    // pra-render thumbnail saat senggang
    setTimeout(() => equipmentData.forEach((e) => this.thumbs.request(e, () => {})), 1500);
  }

  _webglError(err) {
    console.error(err);
    $('#landing').classList.add('ready');
    $('#loadText').textContent = 'WebGL tidak tersedia di perangkat/peramban ini. Gunakan Chrome/Edge/Firefox terbaru dengan akselerasi grafis aktif.';
    $('#btnStart').disabled = true;
  }

  /* ================================================================ */
  /* Mode 3D                                                          */
  /* ================================================================ */
  _applyPose(p) {
    this.stage.camera.position.copy(p.pos);
    this.stage.controls.target.copy(p.target);
    this.stage.controls.update();
  }
  _savePose() {
    this.poses[this.mode] = { pos: this.stage.camera.position.clone(), target: this.stage.controls.target.clone() };
  }

  showKitchen({ fly = true } = {}) {
    if (this.mode !== 'kitchen') {
      this._savePose();
      this.mode = 'kitchen';
      this.stage.setScene(this.kitchen.scene);
      this.stage.setPickables([...this.kitchen.instances.values()]);
      this.stage.controls.minDistance = 0.3;
      this.stage.controls.maxDistance = 22;
      this._applyPose(this.poses.kitchen || this.kitchen.defaultView());
      this.labels.clear();
      this.exploded = this.explodeTarget = 0;
    }
    if (this.selected && fly) {
      const w = this.kitchen.get(this.selected);
      if (w) { this.stage.highlight(w); }
    } else this.stage.highlight([]);
    this._updateTools();
  }

  /** Tampilkan satu alat di studio. Mengembalikan model yang ditampilkan. */
  openStudio(id, { fly = true, keepCamera = false } = {}) {
    const eq = byId[id];
    if (this.mode === 'kitchen') this._savePose();
    this.mode = 'studio';
    this.sim.stop();
    this.maint.stop();
    const model = buildModel(eq.modelType);
    model.userData.equipmentId = id;
    this.studio.show(model);
    this.studioModel = model;
    this.stage.setScene(this.studio.scene);
    this.stage.setPickables([]);
    this.exploded = this.explodeTarget = 0;
    this.labels.set(model, false);
    const v = this.studio.view();
    if (!keepCamera) {
      if (fly && this.poses.studio) this.stage.flyTo(v.pos, v.target, 0.7);
      else this._applyPose(v);
    }
    this.poses.studio = v;
    this.stage.highlight([]);
    this._updateTools();
    return model;
  }

  resetView() {
    this.stage.autoRotate = false;
    if (this.mode === 'kitchen') {
      const v = this.kitchen.defaultView();
      this.stage.flyTo(v.pos, v.target);
    } else {
      this.studio.layout();
      const v = this.studio.view();
      this.stage.flyTo(v.pos, v.target);
      this.setExplode(false);
      this.studioModel?.userData.model?.reset();
    }
    this.audio.play('click');
  }

  focusSelected() {
    if (!this.selected) return toast('Pilih alat terlebih dahulu.', 'info');
    if (this.mode === 'kitchen') {
      const w = this.kitchen.get(this.selected);
      if (w) this.stage.frame(w, { padding: 1.4 });
    } else {
      const v = this.studio.view();
      this.stage.flyTo(v.pos, v.target);
    }
  }

  setExplode(on) {
    if (this.mode !== 'studio') return;
    this.explodeTarget = on ? 1 : 0;
    this.labels.show(on || this.labels.forced);
    this._updateTools();
    if (on) {
      const parts = this.studioModel?.userData.model?.parts.filter((p) => p.dir) || [];
      if (parts.length < 2) toast('Alat ini tersusun dari satu komponen utama; bagian ditandai dengan label.', 'info');
      // perbesar bingkai agar komponen yang terpisah tetap terlihat
      const v = this.studio.view(this.stage.camera.position.clone().sub(this.stage.controls.target));
      const off = v.pos.clone().sub(v.target).multiplyScalar(1.35);
      this.stage.flyTo(v.target.clone().add(off).add(new THREE.Vector3(0, this.studio.radius * 0.25, 0)), v.target.clone().add(new THREE.Vector3(0, this.studio.radius * 0.2, 0)), 0.8);
    }
  }

  /* ================================================================ */
  /* Navigasi                                                         */
  /* ================================================================ */
  navigate(view, params = {}, { silent = false } = {}) {
    this.cleanup.forEach((fn) => { try { fn(); } catch (e) { /* abaikan */ } });
    this.cleanup = [];
    this.sim.stop();
    this.maint.stop();
    this.view = view;
    this.params = params;
    this.el.app.dataset.view = view;
    this.showPage(null);
    this.el.app.classList.remove('drawer-open');
    const item = MENU.find((m) => m.id === view && (!m.params || JSON.stringify(m.params) === JSON.stringify(params))) || MENU.find((m) => m.id === view);
    const TITLES = { learn: 'Mode Belajar', simulation: 'Simulasi', maintenance: 'Perawatan', quiz: 'Quiz', materials: 'Bahan Pembuat' };
    this.el.title.textContent = (view === 'learn' ? TITLES.learn : params.title) || item?.label || TITLES[view] || '';
    renderSidebar(this);
    if (!silent) this.audio.play('click');
    this.stage.autoRotate = false;
    switch (view) {
      case 'dashboard': this.showKitchen(); renderDashboard(this); this.stage.autoRotate = true; break;
      case 'list': this.showKitchen(); renderEquipmentList(this, params); break;
      case 'materials': renderMaterials(this, params); break;
      case 'simulation': renderSimulation(this, params); break;
      case 'maintenance': renderMaintenance(this, params); break;
      case 'quiz': renderQuiz(this, params); break;
      case 'learn': renderLearn(this, params); break;
      case 'about': this.showKitchen(); renderAbout(this); this.stage.autoRotate = true; break;
      default: renderDashboard(this);
    }
    this.setSafety(view === 'list' && this.selected ? byId[this.selected] : null);
    this._updateTools();
  }

  setPanel(content) {
    const b = this.el.panelBody;
    b.innerHTML = '';
    if (typeof content === 'string') b.innerHTML = content;
    else if (content) b.appendChild(content);
    b.scrollTop = 0;
    this.el.panel.classList.add('has-content');
  }

  showPage(content, cls = '') {
    const p = this.el.page;
    p.className = 'page' + (content ? ' open ' + cls : '');
    p.innerHTML = '';
    if (content) {
      if (typeof content === 'string') p.innerHTML = content;
      else p.appendChild(content);
      p.scrollTop = 0;
    }
  }

  /* ================================================================ */
  /* Pemilihan alat                                                   */
  /* ================================================================ */
  selectEquipment(id, { focus = true, from = 'list' } = {}) {
    const eq = byId[id];
    if (!eq) return;
    this.selected = id;
    this.progress.addTo('viewed', id);
    if (this.view !== 'list') this.navigate('list', { ...this.params, keep: true });
    if (this.mode === 'kitchen') {
      const w = this.kitchen.get(id);
      if (w) {
        this.stage.highlight(w);
        if (focus) this.stage.frame(w, { padding: eq.type === 'utensil' ? 2.2 : 1.35 });
      }
    } else {
      this.openStudio(id);
    }
    renderInfoPanel(this, eq);
    this.setSafety(eq);
    if (from === 'kitchen') this.audio.play('click');
    this._updateTools();
  }

  deselect() {
    this.selected = null;
    this.stage.highlight([]);
    this.setSafety(null);
    if (this.view === 'list') renderEquipmentList(this, this.params);
  }

  _onPick(hit) {
    if (this.mode !== 'kitchen') return;
    if (!hit) return;
    const id = hit.object.userData.equipmentId;
    if (!id) return;
    if (this.view === 'dashboard' || this.view === 'about') this.navigate('list', { keep: true });
    this.selectEquipment(id, { from: 'kitchen' });
  }

  _onHover(hit, e) {
    const tt = this.el.tooltip;
    if (!hit || this.mode !== 'kitchen') { tt.classList.remove('show'); return; }
    const eq = byId[hit.object.userData.equipmentId];
    if (!eq) return;
    const rect = this.el.stage.getBoundingClientRect();
    tt.innerHTML = `<b>${eq.name}</b><span>${CATEGORIES[eq.category].short} · ${TYPES[eq.type].label}</span>`;
    tt.style.left = `${e.clientX - rect.left + 14}px`;
    tt.style.top = `${e.clientY - rect.top + 14}px`;
    tt.classList.add('show');
  }

  /** Indikator keselamatan SAFE / WARNING / DANGER pada panggung 3D. */
  setSafety(eq) {
    const el = this.el.safety;
    if (!eq) { el.className = 'safety-banner'; el.innerHTML = ''; return; }
    const s = safetyInfo(eq);
    el.className = `safety-banner show level-${s.level}`;
    el.innerHTML = `<span class="level-badge level-${s.level}">${s.label}</span><span>${s.msg}</span>`;
  }

  /* ================================================================ */
  /* Tombol kontrol 3D                                                */
  /* ================================================================ */
  _buildTools() {
    const T = this.el.tools;
    const btn = (id, ic, label, tip, fn) => {
      const b = h(`<button class="tool-btn" data-tool="${id}" data-tip="${tip}" aria-label="${label}">${icon(ic)}<span>${label}</span></button>`);
      b.onclick = () => fn();
      T.appendChild(b);
      return b;
    };
    btn('reset', 'reset', 'Reset View', 'Kembalikan kamera (R)', () => this.resetView());
    btn('zin', 'zoomIn', 'Zoom In', 'Perbesar', () => this.stage.zoom(0.75));
    btn('zout', 'zoomOut', 'Zoom Out', 'Perkecil', () => this.stage.zoom(1.33));
    btn('full', 'full', 'Fullscreen', 'Layar penuh', () => this.toggleFullscreen());
    btn('focus', 'focus', 'Fokus', 'Fokus ke alat terpilih (F)', () => this.focusSelected());
    btn('rotate', 'rotate', 'Rotasi', 'Putar otomatis', () => { this.stage.autoRotate = !this.stage.autoRotate; this._updateTools(); });
    btn('explode', 'explode', 'Exploded View', 'Pisahkan komponen (E)', () => this.setExplode(true));
    btn('close', 'layers', 'Close View', 'Satukan kembali komponen', () => this.setExplode(false));
    btn('labels', 'tag', 'Label Bagian', 'Tampilkan nama bagian', () => { this.labels.forced = !this.labels.forced; this.labels.show(this.labels.forced || this.explodeTarget > 0); this._updateTools(); });
    btn('studio', 'cube', 'Lihat Detail 3D', 'Buka alat di studio 3D', () => { if (this.selected) { this.openStudio(this.selected); this._updateTools(); } });
    btn('kitchen', 'kitchen', 'Kembali ke Dapur', 'Lihat di lingkungan dapur', () => { this.showKitchen(); if (this.selected && this.view === 'list') { const w = this.kitchen.get(this.selected); if (w) this.stage.frame(w, { padding: 1.6 }); } });
  }

  _updateTools() {
    const T = this.el.tools;
    const studio = this.mode === 'studio';
    const set = (id, show, active = false) => {
      const b = T.querySelector(`[data-tool="${id}"]`);
      if (!b) return;
      b.hidden = !show;
      b.classList.toggle('active', active);
    };
    set('focus', !!this.selected);
    set('rotate', true, this.stage.autoRotate);
    // exploded view & label hanya untuk satu alat (bukan halaman bahan atau soal identifikasi)
    const partsOk = studio && ['list', 'learn', 'simulation', 'maintenance'].includes(this.view);
    set('explode', partsOk && this.explodeTarget === 0);
    set('close', partsOk && this.explodeTarget > 0, true);
    set('labels', partsOk, !!this.labels.forced);
    set('studio', !studio && !!this.selected && this.view === 'list');
    set('kitchen', studio && this.view === 'list');
    $('#modeChip').textContent = studio ? 'Studio 3D' : 'Dapur 3D';
  }

  toggleFullscreen() {
    const el = this.el.stage;
    if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    else document.exitFullscreen?.();
  }

  /* ================================================================ */
  /* Loop                                                             */
  /* ================================================================ */
  _tick(dt) {
    this.stage.continuous = this.mode === 'studio';
    if (this.mode === 'kitchen') this.kitchen.tick(dt);
    else if (this.studioModel) {
      this.studioModel.userData.model?.tick(dt);
      this.sim.tick(dt);
      this.maint.tick(dt);
      // exploded view halus
      if (Math.abs(this.exploded - this.explodeTarget) > 1e-4) {
        this.exploded += (this.explodeTarget - this.exploded) * (1 - Math.exp(-5 * dt));
        if (Math.abs(this.exploded - this.explodeTarget) < 1e-3) this.exploded = this.explodeTarget;
        const k = this.exploded;
        this.studioModel.userData.model?.parts.forEach((p) => {
          if (p.dir) p.obj.position.copy(p.base).addScaledVector(p.dir, k);
        });
      }
      this.labels.update();
    }
  }

  /* ================================================================ */
  /* Chrome (topbar, drawer, suara, landing)                          */
  /* ================================================================ */
  _bindChrome() {
    $('#btnStart').onclick = async () => {
      this.audio.play('correct');
      $('#landing').classList.add('hide');
      this.progress.set('visited', true);
      const v = this.kitchen.defaultView();
      this.stage.autoRotate = false;
      await this.stage.flyTo(v.pos, v.target, 1.8);
      setTimeout(() => { $('#landing')?.remove(); }, 600);
      this.stage.autoRotate = this.view === 'dashboard';
    };
    $('#btnMenu').onclick = () => this.el.app.classList.toggle('drawer-open');
    $('#scrim').onclick = () => this.el.app.classList.remove('drawer-open');
    const snd = () => {
      const on = this.progress.data.sound;
      document.querySelectorAll('.btn-sound').forEach((b) => {
        b.innerHTML = `${icon(on ? 'sound' : 'mute')}<span>${on ? 'SOUND ON' : 'SOUND OFF'}</span>`;
        b.setAttribute('aria-pressed', on);
      });
    };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.btn-sound');
      if (!b) return;
      this.progress.set('sound', !this.progress.data.sound);
      this.audio.setEnabled(this.progress.data.sound);
      this.audio.play('click');
      snd();
    });
    snd();
    // bottom sheet (layar kecil)
    $('#panelHandle').onclick = () => this.el.panel.classList.toggle('expanded');
    this.progress.onChange(() => renderSidebar(this));
  }

  _bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'r') this.resetView();
      else if (k === 'f') this.focusSelected();
      else if (k === 'e') {
        if (this.mode !== 'studio' && this.selected) this.openStudio(this.selected);
        this.setExplode(this.explodeTarget === 0);
      } else if (k === 'i') {
        if (this.selected) { if (this.view !== 'list') this.navigate('list', { keep: true }); renderInfoPanel(this, byId[this.selected]); this.el.panel.classList.add('expanded'); }
        else toast('Pilih alat terlebih dahulu (klik alat di dapur).', 'info');
      } else if (k === 's') {
        if (this.selected) this.navigate('simulation', { id: this.selected });
        else this.navigate('simulation');
      } else if (k === 'escape') {
        if (this.explodeTarget) this.setExplode(false);
        else this.el.app.classList.remove('drawer-open');
      }
    });
  }
}

const app = new App();
window.addEventListener('DOMContentLoaded', () => app.init());
window.__app = app;
