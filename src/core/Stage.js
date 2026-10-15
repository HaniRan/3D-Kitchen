/**
 * Stage: renderer WebGL, kamera, OrbitControls, post-processing (outline highlight),
 * transisi kamera halus, picking (klik/hover), serta loop render yang efisien.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Stage {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add('stage-canvas');

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.02, 120);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.addEventListener('start', () => { this.userInteracting = true; this.cancelTween(); });
    this.controls.addEventListener('end', () => { this.userInteracting = false; });
    this.controls.addEventListener('change', () => this.invalidate());

    this.scene = null;
    this.composer = null;
    this.outline = null;
    this._last = performance.now();
    this.tickers = new Set();
    this.tween = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pickables = [];
    this.onPick = null;
    this.onHover = null;
    this.autoRotate = false;
    /** true = render setiap frame (studio/simulasi). false = render saat ada perubahan saja. */
    this.continuous = false;
    this._dirty = 2;
    this._idle = 0;
    this._downPos = null;
    this._hoverTimer = 0;

    this._bindEvents();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(container);
    this.renderer.setAnimationLoop(() => this._loop());
  }

  /** Ganti scene aktif (dapur/studio); buat ulang composer agar outline memakai scene yang benar. */
  setScene(scene) {
    this.scene = scene;
    // bayangan statis (dapur) cukup dihitung sekali → hemat ribuan draw call per frame
    this.renderer.shadowMap.autoUpdate = !scene.userData.staticShadows;
    this.renderer.shadowMap.needsUpdate = true;
    this.invalidate(4);
    scene.environment = scene.environment || this.envMap;
    const size = this.renderer.getSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x * this.renderer.getPixelRatio(), size.y * this.renderer.getPixelRatio(), { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(size.x, size.y);
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.outline = new OutlinePass(new THREE.Vector2(size.x, size.y), scene, this.camera);
    this.outline.edgeStrength = 5;
    this.outline.edgeGlow = 0.4;
    this.outline.edgeThickness = 1.6;
    this.outline.pulsePeriod = 2.2;
    this.outline.visibleEdgeColor.set('#2ee6c9');
    this.outline.hiddenEdgeColor.set('#0f6f63');
    this.composer.addPass(this.outline);
    this.composer.addPass(new OutputPass());
  }

  highlight(objs) {
    if (this.outline) this.outline.selectedObjects = (Array.isArray(objs) ? objs : [objs]).filter(Boolean);
    this.invalidate();
  }

  /** Tandai bahwa layar perlu dirender ulang selama n frame. */
  invalidate(n = 2) { this._dirty = Math.max(this._dirty, n); }

  /** Minta bayangan statis dihitung ulang (mis. setelah dapur selesai dimuat). */
  refreshShadows() { this.renderer.shadowMap.needsUpdate = true; this.invalidate(); }

  resize() {
    const w = Math.max(this.container.clientWidth, 1), h = Math.max(this.container.clientHeight, 1);
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.composer) {
      this.composer.setSize(w, h);
      this.outline?.setSize(w, h);
    }
    this.invalidate(3);
  }

  addTicker(fn) { this.tickers.add(fn); return () => this.tickers.delete(fn); }

  /* ---------------- kamera ---------------- */
  cancelTween() { this.tween = null; }

  /** Animasi kamera ke posisi & target baru. */
  flyTo(pos, target, duration = 0.9) {
    return new Promise((resolve) => {
      this.tween = {
        t: 0, duration,
        p0: this.camera.position.clone(), p1: pos.clone(),
        t0: this.controls.target.clone(), t1: target.clone(),
        resolve,
      };
    });
  }

  /** Bingkai objek agar pas di layar, mempertahankan arah pandang saat ini (atau arah tertentu). */
  frame(obj, { dir = null, padding = 1.25, duration = 0.9, minDist = 0.25 } = {}) {
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return Promise.resolve();
    const c = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() / 2;
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const fit = Math.min(fov, fov * this.camera.aspect);
    const dist = Math.max((r * padding) / Math.sin(fit / 2), minDist);
    const d = dir ? dir.clone().normalize() : this.camera.position.clone().sub(this.controls.target).normalize();
    if (d.y < 0.25) { d.y = 0.25; d.normalize(); }
    return this.flyTo(c.clone().addScaledVector(d, dist), c, duration);
  }

  zoom(factor) {
    const off = this.camera.position.clone().sub(this.controls.target);
    const len = THREE.MathUtils.clamp(off.length() * factor, this.controls.minDistance || 0.1, this.controls.maxDistance || 100);
    off.setLength(len);
    this.flyTo(this.controls.target.clone().add(off), this.controls.target.clone(), 0.35);
  }

  /* ---------------- picking ---------------- */
  setPickables(list) { this.pickables = list; }

  _bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => { this._downPos = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', (e) => {
      if (!this._downPos || e.button !== 0) return;
      const moved = Math.hypot(e.clientX - this._downPos[0], e.clientY - this._downPos[1]);
      this._downPos = null;
      if (moved > 6) return;
      const hit = this.pick(e);
      this.onPick?.(hit, e);
    });
    el.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - this._hoverTimer < 70 || e.buttons) return;
      this._hoverTimer = now;
      const hit = this.pick(e);
      el.style.cursor = hit ? 'pointer' : 'grab';
      this.onHover?.(hit, e);
    });
    el.addEventListener('pointerleave', () => this.onHover?.(null));
  }

  /** Raycast dua tahap: uji kotak pembatas tiap objek dulu, baru mesh di dalamnya. */
  pick(e) {
    if (!this.pickables.length) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const ray = this.raycaster.ray;
    const cands = [];
    const tmp = new THREE.Vector3();
    for (const p of this.pickables) {
      if (!p.visible) continue;
      const box = p.userData.box || (p.userData.box = new THREE.Box3().setFromObject(p));
      if (ray.intersectBox(box, tmp)) cands.push({ p, d: tmp.distanceTo(ray.origin) });
    }
    cands.sort((a, b) => a.d - b.d);
    let best = null;
    for (const { p } of cands.slice(0, 6)) {
      const hits = this.raycaster.intersectObject(p, true).filter((h) => h.object.visible && !(h.object.material?.transparent && h.object.material.opacity < 0.05));
      if (hits.length && (!best || hits[0].distance < best.distance)) best = { object: p, distance: hits[0].distance, point: hits[0].point };
    }
    return best;
  }

  /** Proyeksikan titik 3D ke koordinat layar (untuk label bagian). */
  project(v) {
    const p = v.clone().project(this.camera);
    const w = this.container.clientWidth, h = this.container.clientHeight;
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, visible: p.z < 1 && p.z > -1 };
  }

  /* ---------------- loop ---------------- */
  _loop() {
    const now = performance.now();
    const dt = Math.min((now - this._last) / 1000, 0.05);
    this._last = now;
    if (this.tween) {
      const tw = this.tween;
      tw.t += dt / tw.duration;
      const k = ease(Math.min(tw.t, 1));
      this.camera.position.lerpVectors(tw.p0, tw.p1, k);
      this.controls.target.lerpVectors(tw.t0, tw.t1, k);
      if (tw.t >= 1) { this.tween = null; tw.resolve(); }
    }
    this.controls.autoRotate = this.autoRotate && !this.userInteracting;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.update(dt);
    for (const fn of this.tickers) fn(dt);
    if (!this.scene || !this.composer) return;
    // Render sesuai kebutuhan: penuh saat ada gerakan, ~8 fps saat diam (animasi kecil tetap jalan).
    const active = this.continuous || this.tween || this.controls.autoRotate || this.userInteracting || this._dirty > 0;
    if (!active) {
      this._idle += dt;
      if (this._idle < 0.125) return;
    }
    this._idle = 0;
    if (this._dirty > 0) this._dirty--;
    this.composer.render(dt);
  }
}
