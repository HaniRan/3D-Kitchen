/**
 * Pembuat thumbnail 3D: merender setiap model ke gambar kecil memakai renderer terpisah,
 * secara bertahap saat browser senggang (lazy), lalu disimpan di memori.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildModel } from '../models/index.js';

/** Jalankan saat browser senggang, tetapi paling lambat 250 ms (agar antrean tidak macet). */
const idle = (f) => (window.requestIdleCallback ? window.requestIdleCallback(f, { timeout: 250 }) : setTimeout(f, 16));

export class Thumbnails {
  constructor(size = 168) {
    this.size = size;
    this.cache = new Map();
    this.queue = [];
    this.waiters = new Map();
    this.renderer = null;
  }
  _init() {
    if (this.renderer) return;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1);
    r.setSize(this.size, this.size);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = r;
    const pm = new THREE.PMREMGenerator(r);
    this.env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene = new THREE.Scene();
    this.scene.environment = this.env;
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 4, 3);
    this.scene.add(key, new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.5));
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.001, 100);
  }
  get(id) { return this.cache.get(id); }
  /** Minta thumbnail; callback dipanggil saat siap. */
  request(eq, cb) {
    if (this.cache.has(eq.id)) { cb(this.cache.get(eq.id)); return; }
    if (!this.waiters.has(eq.id)) { this.waiters.set(eq.id, []); this.queue.push(eq); }
    this.waiters.get(eq.id).push(cb);
    this._pump();
  }
  _pump() {
    if (this._busy) return;
    this._busy = true;
    const step = () => {
      const eq = this.queue.shift();
      if (!eq) { this._busy = false; return; }
      try { this._render(eq); } catch (e) { console.warn('thumbnail gagal', eq.id, e); this.cache.set(eq.id, ''); }
      (this.waiters.get(eq.id) || []).forEach((fn) => fn(this.cache.get(eq.id)));
      this.waiters.delete(eq.id);
      idle(step);
    };
    idle(step);
  }
  _render(eq) {
    this._init();
    const model = buildModel(eq.modelType);
    const api = model.userData.model;
    if (api?.has('fill')) { api.set('fill', 1); api.snap?.(); api.tick(0); }
    const holder = new THREE.Group();
    holder.add(model);
    this.scene.add(holder);
    const box = new THREE.Box3().setFromObject(holder);
    const c = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() / 2;
    const dist = r / Math.sin(THREE.MathUtils.degToRad(16)) * 1.02;
    const dir = new THREE.Vector3(0.6, 0.45, 1).normalize();
    this.camera.position.copy(c).addScaledVector(dir, dist);
    this.camera.near = dist / 50;
    this.camera.far = dist * 5;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(c);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.render(this.scene, this.camera);
    this.cache.set(eq.id, this.renderer.domElement.toDataURL('image/png'));
    this.scene.remove(holder);
    holder.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
  }
}
