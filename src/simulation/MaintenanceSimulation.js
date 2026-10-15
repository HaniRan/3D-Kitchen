/**
 * Simulasi perawatan peralatan dapur (Bahan Ajar: Perawatan Peralatan Dapur):
 * 1. Membersihkan  2. Mengeringkan  3. Memeriksa kerusakan  4. Memperbaiki/mengganti  5. Menyimpan.
 * Dilengkapi indikator kondisi alat, umpan balik, dan peringatan keselamatan kerja.
 */
import * as THREE from 'three';

const DAMAGE = (eq) => {
  if (eq.sharp && eq.category === 'persiapan' && eq.type === 'utensil') return ['Mata pisau/alat mulai tumpul.', 'Asah dengan sharpener hingga tajam kembali.'];
  if (eq.power === 'gas') return ['Lubang api (port burner) tersumbat sisa makanan.', 'Bersihkan port burner dengan sikat kawat halus.'];
  if (eq.category === 'holding' && eq.power) return ['Karet pintu (gasket) kotor dan mulai kendur.', 'Bersihkan atau ganti karet pintu agar suhu stabil.'];
  if (eq.power === 'listrik') return ['Kabel dekat steker terlipat dan pelindungnya retak.', 'Ganti kabel/steker oleh teknisi sebelum digunakan.'];
  if (eq.material.includes('kaca') || eq.material.includes('tanah-liat')) return ['Ditemukan gompal kecil di bibir alat.', 'Pisahkan dan ganti alat yang gompal agar tidak melukai.'];
  if (eq.material.includes('kayu')) return ['Permukaan kayu kasar dan retak halus.', 'Ampelas halus lalu oles minyak food grade.'];
  if (eq.material.includes('kain')) return ['Jahitan terlepas di bagian tepi.', 'Jahit ulang atau ganti bila sudah menipis.'];
  return ['Paku keling/gagang sedikit longgar.', 'Kencangkan gagang atau ganti bila perlu.'];
};

export class MaintenanceSimulation {
  constructor({ studio, stage, audio }) {
    this.studio = studio;
    this.stage = stage;
    this.audio = audio;
    this.fx = new THREE.Group();
    this.studio.scene.add(this.fx);
    this.t = 0;
  }

  start(eq, model, savedCondition = 100) {
    this.eq = eq;
    this.model = model;
    this.api = model.userData.model;
    this.powerKey = eq.power === 'gas' ? (this.api?.has('gas') ? 'gas' : null) : eq.power === 'listrik' ? (this.api?.has('plug') ? 'plug' : null) : null;
    this.s = {
      condition: savedCondition,
      dirty: false, wet: false, inspected: false, damaged: false, repaired: false, stored: true,
      powered: false, usedCount: 0, damage: DAMAGE(eq),
    };
    this._shelf(false);
    this._fx();
    return this.s;
  }

  /** Daftar aksi yang tersedia. */
  actions() {
    const a = [{ id: 'use', label: 'Gunakan alat', icon: '▶' }];
    if (this.eq.power) a.push({ id: 'disconnect', label: this.eq.power === 'gas' ? 'Tutup katup gas' : 'Cabut steker / matikan listrik', icon: '⏻' });
    a.push(
      { id: 'clean', label: '1. Membersihkan', icon: '🧽' },
      { id: 'dry', label: '2. Mengeringkan', icon: '💨' },
      { id: 'inspect', label: '3. Memeriksa kerusakan', icon: '🔍' },
      { id: 'repair', label: '4. Memperbaiki / mengganti', icon: '🔧' },
      { id: 'store', label: '5. Menyimpan pada tempatnya', icon: '📦' },
    );
    return a;
  }

  /** Jalankan aksi; mengembalikan { type: 'ok'|'info'|'warn'|'danger'|'success', msg }. */
  act(id) {
    const s = this.s;
    const clamp = (v) => Math.max(0, Math.min(100, v));
    let r;
    switch (id) {
      case 'use': {
        // penggunaan tanpa perawatan menurunkan kondisi lebih banyak
        const neglect = s.dirty || s.wet || !s.stored;
        s.condition = clamp(s.condition - (neglect ? 18 : 10));
        s.usedCount++;
        s.dirty = true;
        s.wet = false;
        s.stored = false;
        s.inspected = false;
        s.damaged = s.usedCount % 2 === 1 || s.condition < 70;
        s.repaired = false;
        if (this.eq.power) s.powered = true;
        if (this.powerKey) this.api.set(this.powerKey, 1);
        if (this.api?.has('power')) this.api.set('power', 1);
        this._shelf(false);
        r = { type: neglect ? 'warn' : 'info', msg: neglect ? 'Alat dipakai lagi sebelum dirawat — kondisi menurun lebih cepat!' : 'Alat telah digunakan. Sekarang lakukan perawatan.' };
        this.audio?.play(this.eq.power ? 'motor' : 'click');
        break;
      }
      case 'disconnect':
        s.powered = false;
        if (this.powerKey) this.api.set(this.powerKey, 0);
        if (this.api?.has('power')) this.api.set('power', 0);
        r = { type: 'ok', msg: this.eq.power === 'gas' ? 'Katup gas ditutup dan kenop pada posisi OFF. Aman untuk dibersihkan.' : 'Steker dicabut. Tidak ada aliran listrik — aman untuk dibersihkan.' };
        this.audio?.play('stop');
        break;
      case 'clean':
        if (s.powered) {
          s.condition = clamp(s.condition - 5);
          r = { type: 'danger', msg: this.eq.power === 'gas' ? 'WARNING: Pastikan tidak ada aliran gas yang terhubung sebelum membersihkan peralatan.' : 'WARNING: Pastikan tidak ada aliran listrik yang terhubung sebelum membersihkan peralatan.' };
          this.audio?.play('warning');
        } else if (!s.dirty) {
          r = { type: 'info', msg: 'Peralatan sudah bersih.' };
        } else {
          s.dirty = false;
          s.wet = true;
          s.condition = clamp(s.condition + 8);
          r = { type: 'ok', msg: 'Peralatan sudah bersih. Segera keringkan!' };
          this.audio?.play('water');
        }
        break;
      case 'dry':
        if (s.dirty) r = { type: 'warn', msg: 'Bersihkan peralatan terlebih dahulu sebelum dikeringkan.' };
        else if (!s.wet) r = { type: 'info', msg: 'Peralatan sudah kering.' };
        else {
          s.wet = false;
          s.condition = clamp(s.condition + 6);
          r = { type: 'ok', msg: 'Peralatan sudah kering — tidak akan muncul bercak putih.' };
          this.audio?.play('click');
        }
        break;
      case 'inspect':
        if (s.dirty) r = { type: 'warn', msg: 'Bersihkan peralatan terlebih dahulu agar kerusakan terlihat jelas.' };
        else if (s.wet) r = { type: 'warn', msg: 'Peralatan belum dikeringkan.' };
        else {
          s.inspected = true;
          r = s.damaged && !s.repaired
            ? { type: 'warn', msg: `Ditemukan: ${s.damage[0]} Lakukan perbaikan.` }
            : { type: 'ok', msg: 'Pemeriksaan selesai: tidak ada kerusakan.' };
          this.audio?.play('click');
        }
        break;
      case 'repair':
        if (!s.inspected) r = { type: 'warn', msg: 'Periksa kerusakan terlebih dahulu.' };
        else if (!s.damaged || s.repaired) r = { type: 'info', msg: 'Tidak ada kerusakan yang perlu diperbaiki.' };
        else {
          s.repaired = true;
          s.condition = clamp(s.condition + 12);
          r = { type: 'ok', msg: `Perbaikan: ${s.damage[1]}` };
          this.audio?.play('repair');
        }
        break;
      case 'store':
        if (s.stored) r = { type: 'info', msg: 'Peralatan sudah tersimpan pada tempatnya.' };
        else if (s.powered) r = { type: 'danger', msg: 'WARNING: Matikan dan putuskan sumber listrik/gas sebelum menyimpan.' };
        else if (s.dirty) r = { type: 'warn', msg: 'Peralatan belum dibersihkan.' };
        else if (s.wet) r = { type: 'warn', msg: 'Peralatan belum dikeringkan.' };
        else if (!s.inspected) r = { type: 'warn', msg: 'Periksa kerusakan terlebih dahulu sebelum disimpan.' };
        else if (s.damaged && !s.repaired) r = { type: 'warn', msg: 'Perbaiki atau ganti bagian yang rusak sebelum disimpan.' };
        else {
          s.stored = true;
          s.condition = clamp(s.condition + 10);
          this._shelf(true);
          r = { type: 'success', msg: 'Perawatan berhasil. Peralatan disimpan pada tempatnya.' };
          this.audio?.play('correct');
        }
        break;
      default:
        r = { type: 'info', msg: '' };
    }
    this._fx();
    return r;
  }

  /** Daftar pengingat status (untuk checklist di panel). */
  status() {
    const s = this.s;
    const list = [];
    if (this.eq.power) list.push({ ok: !s.powered, text: s.powered ? (this.eq.power === 'gas' ? 'Gas masih terhubung.' : 'Listrik masih terhubung.') : 'Sumber listrik/gas terputus.' });
    list.push({ ok: !s.dirty, text: s.dirty ? 'Peralatan belum dibersihkan.' : 'Peralatan sudah bersih.' });
    list.push({ ok: !s.wet, text: s.wet ? 'Peralatan belum dikeringkan.' : 'Peralatan kering.' });
    list.push({ ok: s.inspected || s.stored, text: s.inspected || s.stored ? 'Sudah diperiksa.' : 'Belum diperiksa kerusakannya.' });
    list.push({ ok: !s.damaged || s.repaired || s.stored, text: s.damaged && !s.repaired && !s.stored ? (s.inspected ? 'Ada kerusakan yang perlu diperbaiki.' : 'Kemungkinan ada kerusakan.') : 'Tidak ada kerusakan tertunda.' });
    list.push({ ok: s.stored, text: s.stored ? 'Tersimpan pada tempatnya.' : 'Peralatan belum disimpan pada tempatnya.' });
    return list;
  }

  /* ---------------- efek visual 3D ---------------- */
  _surfacePoints(n, seed) {
    const box = new THREE.Box3().setFromObject(this.studio.holder);
    const pts = [];
    const ray = new THREE.Raycaster();
    let r = seed;
    const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
    for (let i = 0; i < n * 4 && pts.length < n; i++) {
      const x = box.min.x + rnd() * (box.max.x - box.min.x);
      const z = box.min.z + rnd() * (box.max.z - box.min.z);
      ray.set(new THREE.Vector3(x, box.max.y + 1, z), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(this.studio.holder, true).find((h) => h.object.visible && !(h.object.material?.transparent));
      if (hit) pts.push(hit.point);
    }
    return pts;
  }

  _fx() {
    this.fx.clear();
    if (!this.s) return;
    const size = new THREE.Box3().setFromObject(this.studio.holder).getSize(new THREE.Vector3()).length();
    const base = Math.max(size * 0.012, 0.003);
    if (this.s.dirty) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x5b3a1a, roughness: 1 });
      this._surfacePoints(26, 7).forEach((p, i) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(base * (0.6 + (i % 3) * 0.4), 8, 6), mat);
        m.scale.y = 0.35;
        m.position.copy(p);
        this.fx.add(m);
      });
    }
    if (this.s.wet) {
      const mat = new THREE.MeshPhysicalMaterial({ color: 0xbfe6ff, roughness: 0, transparent: true, opacity: 0.55, clearcoat: 1 });
      this._surfacePoints(34, 13).forEach((p, i) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(base * (0.4 + (i % 4) * 0.2), 10, 8), mat);
        m.scale.y = 0.6;
        m.position.copy(p);
        this.fx.add(m);
      });
    }
  }

  /** Animasi menyimpan: alat bergeser ke rak penyimpanan virtual. */
  _shelf(on) {
    this.storeT = on ? 0 : null;
    this.studio.holder.position.set(0, 0, 0);
    this.studio.holder.scale.setScalar(1);
  }

  tick(dt) {
    if (this.storeT != null && this.storeT < 1) {
      this.storeT = Math.min(1, this.storeT + dt / 1.2);
      const k = this.storeT;
      this.studio.holder.position.set(0, Math.sin(k * Math.PI) * 0.1 * this.studio.radius, -k * this.studio.radius * 0.6);
      this.studio.holder.scale.setScalar(1 - k * 0.15);
    }
  }

  stop() {
    this.fx.clear();
    this.studio.holder.position.set(0, 0, 0);
    this.studio.holder.scale.setScalar(1);
    this.api?.reset();
  }
}
