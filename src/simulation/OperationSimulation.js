/**
 * Simulasi pengoperasian: menjalankan langkah-langkah interaktif pada model 3D di studio.
 * - Peralatan bermesin: mengubah status rig (plug, power, speed, door, lid, fill, …).
 * - Kitchen utensils: animasi gerakan alat bersama properti (talenan, wortel, panci, dll.).
 * Setiap langkah memiliki pilihan aksi benar + pengecoh (penggunaan tidak sesuai/berbahaya).
 */
import * as THREE from 'three';
import { simulations, useTexts } from '../data/simulations.js';
import * as P from './Props.js';
import { buildModel } from '../models/index.js';

const DISTRACT = {
  electric: [
    ['Masukkan tangan untuk merapikan bahan saat mesin menyala', 'Penggunaan alat tidak sesuai fungsi. Jangan menyentuh bagian bergerak/pisau ketika mesin terhubung listrik!'],
    ['Cabut steker dengan menarik kabelnya dan tangan basah', 'Berbahaya! Pegang steker (bukan kabel) dengan tangan kering.'],
    ['Siram badan motor dengan air', 'Berbahaya! Bagian motor tidak boleh terkena air — cukup dilap kain lembap setelah steker dicabut.'],
  ],
  gas: [
    ['Nyalakan api tanpa memeriksa selang & regulator', 'Berbahaya! Periksa kebocoran gas terlebih dahulu.'],
    ['Tinggalkan kompor menyala tanpa pengawasan', 'Tidak aman! Jangan meninggalkan api menyala tanpa pengawasan.'],
  ],
  hot: [
    ['Ambil loyang/panci panas dengan tangan kosong', 'PERINGATAN: Permukaan panas. Gunakan oven mitt atau perlindungan yang sesuai.'],
    ['Buka pintu/tutup sambil mendekatkan wajah', 'Hati-hati uap panas! Buka perlahan dan menjauh dari wajah.'],
  ],
  holding: [
    ['Biarkan pintu terbuka lama', 'Kurang tepat. Pintu harus ditutup rapat agar suhu tetap stabil.'],
    ['Cungkil bunga es dengan pisau', 'Penggunaan alat tidak sesuai fungsi. Jangan mencungkil bahan beku dengan benda tajam.'],
  ],
  sharp: [
    ['Pegang alat pada bagian bilah/tajamnya', 'Berbahaya! Selalu pegang pada gagang dan arahkan mata pisau menjauhi tubuh.'],
    ['Potong bahan di atas telapak tangan', 'Penggunaan alat tidak sesuai fungsi. Selalu gunakan talenan.'],
  ],
  general: [
    ['Gunakan alat untuk keperluan lain (mis. mencungkil kaleng)', 'Penggunaan alat tidak sesuai fungsi.'],
    ['Simpan alat dalam keadaan basah & kotor', 'Kurang tepat. Alat harus dibersihkan dan dikeringkan sebelum disimpan.'],
  ],
  glass: [
    ['Pegang gelas pada bibirnya', 'Kurang higienis. Pegang gelas berkaki pada kakinya, gelas tanpa kaki pada bagian bawah.'],
  ],
};

function pickDistractor(eq, i) {
  let pool = DISTRACT.general;
  if (eq.power === 'gas') pool = DISTRACT.gas;
  else if (eq.category === 'holding' && !eq.hot) pool = DISTRACT.holding;
  else if (eq.power === 'listrik') pool = DISTRACT.electric;
  else if (eq.hot) pool = DISTRACT.hot;
  else if (eq.sharp) pool = DISTRACT.sharp;
  else if (eq.material.includes('kaca')) pool = DISTRACT.glass.concat(DISTRACT.general);
  return pool[i % pool.length];
}

export class OperationSimulation {
  constructor({ studio, stage, audio }) {
    this.studio = studio;
    this.stage = stage;
    this.audio = audio;
    this.eq = null;
    this.model = null;
    this.steps = [];
    this.index = -1;
    this.motion = null;
    this.t = 0;
    this.prop = null;
    this.extra = null;
  }

  /** Siapkan simulasi untuk satu alat. Mengembalikan daftar langkah (dengan opsi). */
  start(eq, model) {
    this.eq = eq;
    this.model = model;
    this.api = model.userData.model;
    this.api?.reset();
    this.api?.snap?.();
    this.index = -1;
    this.motion = null;
    this.t = 0;
    const base = simulations[eq.sim] || simulations.utensil;
    this.steps = base.map((s, i) => {
      const step = { ...s };
      if (s.anim === 'use' && eq.useAnim && useTexts[eq.useAnim]) step.text = useTexts[eq.useAnim];
      if (s.anim === 'use' && eq.operation?.length) step.text = `${step.text} (${eq.operation[Math.min(1, eq.operation.length - 1)]})`;
      const [dLabel, dMsg] = pickDistractor(eq, i);
      step.options = [{ label: s.action, correct: true }, { label: dLabel, correct: false, msg: dMsg }];
      if ((i * 7 + eq.id.length) % 2) step.options.reverse();
      return step;
    });
    this._setupProps();
    return this.steps;
  }

  /** Jalankan langkah ke-i (setelah aksi benar dipilih). */
  doStep(i) {
    const step = this.steps[i];
    if (!step) return;
    this.index = i;
    if (this.api) for (const [k, v] of Object.entries(step.set || {})) this.api.set(k, v);
    const focus = step.focus && this.api?.parts.find((p) => p.name === step.focus);
    this.stage.highlight(focus ? focus.obj : this.studio.current);
    if (step.sound) this.audio?.play(step.sound);
    else this.audio?.play('click');
    if (step.anim) this._startMotion(step.anim);
    return focus;
  }

  stop() {
    this.motion = null;
    this.studio.holder.position.set(0, 0, 0);
    this.studio.holder.rotation.set(0, 0, 0);
    this.studio.props.clear();
    this.api?.reset();
  }

  /* ---------------- properti & gerakan alat ---------------- */
  _toolBox() {
    const m = this.studio.current;
    m.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(m);
  }

  _setupProps() {
    const eq = this.eq;
    const props = this.studio.props;
    props.clear();
    this.prop = null;
    this.extra = null;
    if (eq.sim !== 'utensil' && eq.sim !== 'serve') { this.studio.layout(); return; }
    const a = eq.useAnim;
    let prop = null;
    if (a === 'chop') prop = P.boardWith(P.carrot);
    else if (a === 'slice' || a === 'fork') prop = P.boardWith(P.meatBlock);
    else if (a === 'saw') prop = P.boardWith(P.breadLoaf);
    else if (a === 'peel') prop = P.boardWith(P.carrot);
    else if (a === 'grate') { prop = P.cheeseBlock(); }
    else if (a === 'board') prop = P.carrot();
    else if (a === 'scoop') prop = eq.id === 'ice-cream-scoop' ? P.iceTub() : P.soupPot();
    else if (a === 'strain') prop = P.soupPot();
    else if (a === 'flip') prop = P.friedPatty();
    else if (a === 'whisk') prop = P.mixingBowl();
    else if (a === 'roll') prop = P.doughSheet();
    else if (a === 'pour') prop = eq.id === 'water-pitcher' || eq.id === 'measuring-cup' ? P.glassForPour() : buildModel('water-pitcher');
    else if (a === 'serve' || a === 'cutlery') prop = a === 'cutlery' ? buildModel('dinner-plate') : P.servingMat();
    else if (a === 'wipe') prop = buildModel('dinner-plate');
    else if (a === 'sharpen') prop = buildModel('chopping-knife');
    if (prop) {
      props.add(prop);
      this.prop = prop;
    }
    this._placeRest();
    this.studio.layout();
  }

  /** Posisi awal alat: di samping properti. */
  _placeRest() {
    const h = this.studio.holder;
    h.position.set(0, 0, 0);
    h.rotation.set(0, 0, 0);
    if (!this.prop) return;
    const pb = new THREE.Box3().setFromObject(this.prop);
    const tb = this._toolBox();
    const a = this.eq.useAnim;
    if (a === 'grate') {
      this.prop.position.set(-(tb.max.x - tb.min.x) * 0.9, 0, 0);
      return;
    }
    if (a === 'pour' && !['water-pitcher', 'measuring-cup'].includes(this.eq.id)) {
      // alat = gelas (target); teko sebagai properti di sampingnya
      this.prop.position.set(0.18, 0, -0.05);
      return;
    }
    const gap = 0.04;
    h.position.x = pb.max.x - tb.min.x + gap;
    h.position.z = 0.0;
    this.restPos = h.position.clone();
  }

  _startMotion(kind) {
    const tb = this._toolBox();
    const pb = this.prop ? new THREE.Box3().setFromObject(this.prop) : new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    const size = tb.getSize(new THREE.Vector3());
    this.motion = { kind, t: 0, tb, pb, size, start: this.studio.holder.position.clone(), startRot: this.studio.holder.rotation.clone() };
    this.t = 0;
  }

  tick(dt) {
    const m = this.motion;
    if (!m) return;
    m.t += dt;
    const h = this.studio.holder;
    const t = m.t;
    const a = this.eq.useAnim;
    const pb = m.pb, size = m.size;
    const topY = pb.max.y;
    if (m.kind === 'inspect') {
      const k = Math.min(t / 2.2, 1);
      h.position.copy(m.start).add(new THREE.Vector3(0, Math.sin(k * Math.PI) * size.y * 0.6 + Math.sin(k * Math.PI) * 0.05, 0));
      h.rotation.y = k * Math.PI * 2;
      if (k >= 1) { this.motion = null; h.rotation.y = 0; }
      return;
    }
    if (m.kind === 'rest') {
      const k = Math.min(t / 1.0, 1);
      h.position.lerp(this.restPos || new THREE.Vector3(), k);
      h.rotation.set(h.rotation.x * (1 - k), h.rotation.y * (1 - k), h.rotation.z * (1 - k));
      if (k >= 1) this.motion = null;
      return;
    }
    if (m.kind === 'toss') {
      h.position.y = Math.abs(Math.sin(t * 5)) * 0.03;
      h.rotation.z = Math.sin(t * 5) * 0.08;
      if (t > 2.5) { this.motion = null; h.position.y = 0; h.rotation.z = 0; }
      return;
    }
    if (m.kind === 'lift') {
      h.position.y = Math.sin(Math.min(t / 2, 1) * Math.PI) * 0.15;
      if (t > 2) this.motion = null;
      return;
    }
    if (m.kind === 'serve' || (m.kind === 'use' && (a === 'serve' || a === 'cutlery'))) {
      const k = Math.min(t / 1.6, 1);
      const target = a === 'cutlery' ? new THREE.Vector3(pb.max.x + 0.03 - m.tb.min.x * 0, 0, 0) : new THREE.Vector3(0, pb.max.y, 0);
      if (a === 'cutlery') { target.x = pb.max.x + 0.04 - (m.tb.min.x - h.position.x) - 0.0; h.rotation.y = -Math.PI / 2 * k; }
      h.position.lerpVectors(m.start, target, k * k * (3 - 2 * k));
      if (k >= 1) this.motion = null;
      return;
    }
    if (m.kind !== 'use') return;
    // ---- gerakan penggunaan per jenis alat ----
    const dur = 4.5;
    const workX = m.tb.max.x - h.position.x - size.x * 0.12; // ujung kerja relatif
    switch (a) {
      case 'chop':
      case 'slice': {
        h.rotation.set(0, Math.PI / 2, 0);
        const lift = a === 'chop' ? Math.max(0, Math.sin(t * 7)) * 0.045 : 0.01 + Math.sin(t * 3) * 0.004;
        h.position.set(-0.04 + ((t * 0.02) % 0.09), topY - m.tb.min.y + 0.002 + lift - 0.012, -(workX - size.x * 0.25));
        if (a === 'slice') h.position.z += Math.sin(t * 3) * 0.05;
        break;
      }
      case 'saw':
        h.rotation.set(0, Math.PI / 2, 0);
        h.position.set(0, topY - m.tb.min.y - Math.min(t * 0.012, 0.06), -(workX - size.x * 0.35) + Math.sin(t * 6) * 0.05);
        break;
      case 'peel':
        h.rotation.set(-Math.PI / 2, 0, -0.6);
        h.position.set(-0.08 + ((t * 0.12) % 0.16), topY + 0.012, 0.02);
        break;
      case 'sharpen': {
        h.rotation.set(0, 0, 0.9);
        h.position.set(0.02, 0.02, 0.06);
        if (this.prop) {
          this.prop.rotation.set(0, 0, -0.35 + (Math.sin(t * 4) > 0 ? 0 : 0));
          const s = (Math.sin(t * 4) + 1) / 2;
          this.prop.position.set(-0.05 + s * 0.12, 0.12 + s * 0.05, 0.06 + (Math.floor(t * 4 / Math.PI) % 2 ? 0.012 : -0.012));
        }
        break;
      }
      case 'fork':
        h.rotation.set(0, 0, -Math.PI / 2);
        h.position.set(0, topY + 0.02 + Math.max(0, Math.sin(t * 3)) * 0.04 - (m.tb.min.y) * 0, 0);
        h.position.y = topY + size.x * 0.0 + Math.max(0, Math.sin(t * 3)) * 0.04 + 0.19;
        break;
      case 'grate':
        if (this.prop) {
          const face = (m.tb.max.x - m.tb.min.x) / 2 - 0.005;
          this.prop.position.set(-face - 0.022, 0.06 + ((Math.sin(t * 5) + 1) / 2) * 0.13, 0);
          this.prop.rotation.set(0, 0, -0.2);
        }
        break;
      case 'board':
        if (this.prop) this.prop.position.set(-0.04, Math.max(0.03, 0.25 - t * 0.2), 0);
        h.position.set(0, 0, 0);
        break;
      case 'scoop': {
        const cyc = (t % 2.4) / 2.4;
        const dip = Math.sin(cyc * Math.PI);
        h.rotation.set(0, 0, -0.15 + dip * 0.3);
        h.position.set(-workX, topY + 0.06 - dip * 0.09, 0);
        break;
      }
      case 'strain':
        h.position.set(0, topY + 0.01 + Math.sin(t * 2) * 0.004, 0);
        h.rotation.set(0, 0, 0);
        if (!this.extra) {
          const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.25, 12), this.model.userData.streamMat || new THREE.MeshStandardMaterial({ color: 0xc8892e, transparent: true, opacity: 0.7 }));
          this.extra = stream;
          this.studio.props.add(stream);
        }
        this.extra.position.set(0, topY + size.y + 0.15, 0);
        this.extra.visible = t < dur;
        break;
      case 'whisk': {
        h.rotation.set(0, t * 6, -Math.PI / 2 + 0.35);
        const r = 0.035;
        h.position.set(Math.cos(t * 6) * r, topY + 0.03 + size.x * 0.0, Math.sin(t * 6) * r);
        h.position.y = topY - 0.05 + (m.tb.max.x - m.tb.min.x) * 0.95;
        break;
      }
      case 'flip': {
        const cyc = (t % 2) / 2;
        h.rotation.set(-Math.sin(cyc * Math.PI) * 0.5, 0, 0.25 - Math.sin(cyc * Math.PI) * 0.4);
        h.position.set(-workX + 0.02, topY - 0.01 + Math.sin(cyc * Math.PI) * 0.06, 0);
        break;
      }
      case 'roll':
        h.position.set(0, topY, Math.sin(t * 2) * 0.06);
        h.rotation.set(Math.sin(t * 2) * -4, 0, 0);
        h.children[0].rotation.x = 0;
        break;
      case 'pour': {
        const k = Math.min(t / 1.5, 1);
        if (['water-pitcher', 'measuring-cup'].includes(this.eq.id)) {
          h.position.set(lerp(m.start.x, 0.14, k), topY + 0.04 * k, 0);
          h.rotation.z = (Math.PI / 2.6) * k;
        } else if (this.prop) {
          this.prop.position.set(lerp(0.18, 0.15, k), 0.1 * k + 0.02, 0);
          this.prop.rotation.z = (Math.PI / 2.8) * k;
        }
        break;
      }
      case 'grind': {
        const u = this.api?.parts.find((p) => p.name === 'ulekan');
        if (u) {
          u.inner.rotation.y = Math.sin(t * 4) * 0.3;
          u.inner.position.y = -Math.abs(Math.sin(t * 4)) * 0.006;
        }
        break;
      }
      case 'wipe':
        h.position.set(Math.cos(t * 4) * 0.04, topY + 0.01, Math.sin(t * 4) * 0.04);
        break;
      case 'wear':
      default:
        h.rotation.y = Math.sin(t * 1.5) * 0.6;
        h.position.y = Math.sin(t * 2) * 0.01 + 0.02;
    }
    if (t > dur && !['board'].includes(a)) {
      // akhiri gerakan dengan halus
      this.motion = null;
      if (this.extra) this.extra.visible = false;
    }
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
