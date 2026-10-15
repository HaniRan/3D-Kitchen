/**
 * KitchenScene: lingkungan dapur profesional 3D (lantai, dinding, hood, meja stainless, rak,
 * lemari penyimpanan, meja saji) beserta penempatan semua peralatan yang dapat dipilih.
 * Model dimuat bertahap (lazy) agar halaman tetap responsif.
 */
import * as THREE from 'three';
import { buildModel, hasModel } from '../models/index.js';
import { M, colorMat } from '../models/materials.js';
import { wallTileTexture, floorTileTexture } from '../models/textures.js';
import { mesh, at, box, rbox, cyl, cylX, group, bulletFoot, mergeMeshes, PI } from '../models/helpers.js';

const ROOM = { x0: -6, x1: 6, z0: -4.5, z1: 4.5, h: 3.2 };

/** Meja kerja stainless dengan rak bawah. */
function prepTable(w = 1.8, d = 0.75, h = 0.9) {
  const parts = [];
  parts.push(at(rbox(w, 0.04, d, 0.01, M.steel, 2), 0, h - 0.02, 0));
  parts.push(at(box(w - 0.02, 0.12, 0.012, M.steel), 0, h - 0.08, d / 2 - 0.006));
  parts.push(at(rbox(w - 0.08, 0.02, d - 0.08, 0.004, M.steel, 1), 0, 0.22, 0));
  const legs = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) legs.push(at(cyl(0.02, 0.02, h - 0.06, M.steelSatin, 12), sx * (w / 2 - 0.05), (h - 0.06) / 2 + 0.03, sz * (d / 2 - 0.05)));
  const g = group(...parts, mergeMeshes(legs, M.steelSatin));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(bulletFoot(0.04, 0.022, M.steelSatin), sx * (w / 2 - 0.05), 0, sz * (d / 2 - 0.05)));
  g.userData.top = h;
  return g;
}

/** Rak kawat berdiri (rak dapur). */
function wireRack(w = 1.2, d = 0.45, h = 1.8, levels = 4) {
  const bars = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bars.push(at(cyl(0.012, 0.012, h, M.chrome, 10), sx * (w / 2 - 0.015), h / 2, sz * (d / 2 - 0.015)));
  for (let i = 0; i < levels; i++) {
    const y = 0.15 + (i * (h - 0.25)) / (levels - 1);
    for (let k = 0; k <= 12; k++) bars.push(at(box(0.004, 0.004, d - 0.02, M.chrome), -w / 2 + 0.02 + (k * (w - 0.04)) / 12, y, 0));
    for (const sz of [-1, 1]) bars.push(at(box(w, 0.012, 0.012, M.chrome), 0, y, sz * (d / 2 - 0.015)));
  }
  const g = group(mergeMeshes(bars, M.chrome));
  g.userData.levels = Array.from({ length: levels }, (_, i) => 0.15 + (i * (h - 0.25)) / (levels - 1) + 0.006);
  return g;
}

/** Lemari penyimpanan stainless dengan pintu geser & meja atas. */
function storageCabinet(w = 1.6, d = 0.65, h = 0.9) {
  const g = new THREE.Group();
  g.add(at(rbox(w, h - 0.12, d, 0.01, M.steel, 2), 0, (h - 0.12) / 2 + 0.1, 0));
  g.add(at(rbox(w + 0.02, 0.04, d + 0.04, 0.01, M.steelSatin, 2), 0, h - 0.02, 0));
  for (const s of [-1, 1]) {
    g.add(at(box(w / 2 - 0.02, h - 0.2, 0.01, M.steelSatin), s * (w / 4), h / 2 + 0.03, d / 2 + 0.005));
    g.add(at(box(0.012, 0.12, 0.02, M.steelPolished), s * 0.12, h / 2 + 0.03, d / 2 + 0.015));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(bulletFoot(0.1, 0.022, M.steelSatin), sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06)));
  g.userData.top = h;
  return g;
}

/** Meja makan dengan taplak putih (untuk penataan serving equipment). */
function diningTable(w = 1.6, d = 0.9, h = 0.75) {
  const g = new THREE.Group();
  g.add(at(rbox(w, 0.04, d, 0.01, M.woodDark, 2), 0, h - 0.02, 0));
  const cloth = mesh(new THREE.BoxGeometry(w + 0.06, 0.004, d + 0.06), M.fabricWhite);
  cloth.position.y = h + 0.002;
  const drape = [];
  for (const s of [-1, 1]) {
    drape.push(at(box(w + 0.06, 0.2, 0.004, M.fabricWhite), 0, h - 0.1, s * (d / 2 + 0.03)));
    drape.push(at(box(0.004, 0.2, d + 0.06, M.fabricWhite), s * (w / 2 + 0.03), h - 0.1, 0));
  }
  g.add(cloth, ...drape);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.06, h - 0.04, 0.06, M.woodDark), sx * (w / 2 - 0.08), (h - 0.04) / 2, sz * (d / 2 - 0.08)));
  g.userData.top = h + 0.004;
  return g;
}

/** Kursi sederhana. */
function chair() {
  const g = new THREE.Group();
  g.add(at(rbox(0.44, 0.04, 0.42, 0.01, M.woodDark, 2), 0, 0.46, 0));
  g.add(at(rbox(0.44, 0.45, 0.03, 0.01, M.woodDark, 2), 0, 0.7, -0.2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.035, 0.46, 0.035, M.woodDark), sx * 0.19, 0.23, sz * 0.18));
  return g;
}

export class KitchenScene {
  constructor(stage, equipment) {
    this.stage = stage;
    this.equipment = equipment;
    this.scene = new THREE.Scene();
    this.scene.userData.staticShadows = true;
    this.scene.background = new THREE.Color(0xc9d2d9);
    this.scene.environment = stage.envMap;
    this.scene.environmentIntensity = 0.55;
    this.scene.fog = new THREE.Fog(0xc9d2d9, 18, 40);
    this.instances = new Map(); // id → wrapper group
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this._buildRoom();
    this._buildLights();
  }

  /* ---------------- ruangan ---------------- */
  _buildRoom() {
    const W = ROOM.x1 - ROOM.x0, D = ROOM.z1 - ROOM.z0;
    const floorTex = floorTileTexture();
    const floor = mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.75, metalness: 0.05 }), { cast: false });
    floor.rotation.x = -PI / 2;
    this.scene.add(floor);
    const wallTex = wallTileTexture();
    const wallMat = (rx, ry) => {
      const t = wallTex.clone();
      t.repeat.set(rx, ry);
      t.needsUpdate = true;
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.25, metalness: 0.0 });
    };
    const back = mesh(new THREE.PlaneGeometry(W, ROOM.h), wallMat(W / 0.75, ROOM.h / 0.3), { cast: false });
    back.position.set(0, ROOM.h / 2, ROOM.z0);
    const left = mesh(new THREE.PlaneGeometry(D, ROOM.h), wallMat(D / 0.75, ROOM.h / 0.3), { cast: false });
    left.position.set(ROOM.x0, ROOM.h / 2, 0);
    left.rotation.y = PI / 2;
    const right = left.clone();
    right.position.set(ROOM.x1, ROOM.h / 2, 0);
    right.rotation.y = -PI / 2;
    this.scene.add(back, left, right);
    // plint & list atas dinding
    const trims = [];
    trims.push(at(box(W, 0.12, 0.02, M.steelSatin), 0, 0.06, ROOM.z0 + 0.01));
    trims.push(at(box(0.02, 0.12, D, M.steelSatin), ROOM.x0 + 0.01, 0.06, 0));
    trims.push(at(box(0.02, 0.12, D, M.steelSatin), ROOM.x1 - 0.01, 0.06, 0));
    this.scene.add(mergeMeshes(trims, M.steelSatin));
    // saluran pembuangan lantai
    const drain = at(box(3.5, 0.004, 0.12, M.steelDark), -1.5, 0.002, -2.95);
    this.scene.add(drain);

    // hood (cerobong pembuangan) di atas cooking line
    const hood = new THREE.Group();
    const hw = 7.2, hd = 1.25;
    hood.add(at(rbox(hw, 0.5, hd, 0.02, M.steel, 2), 0, 0, 0));
    hood.add(at(box(hw - 0.1, 0.02, hd - 0.1, M.steelDark), 0, -0.26, 0));
    for (let i = 0; i < 12; i++) hood.add(at(box(0.5, 0.012, hd - 0.2, colorMat(0x8f979c, 0.4, 0.8)), -hw / 2 + 0.4 + i * 0.58, -0.26, 0.0));
    const lampM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e0, emissiveIntensity: 1.4 });
    for (let i = 0; i < 5; i++) hood.add(at(box(0.5, 0.01, 0.1, lampM), -2.8 + i * 1.4, -0.27, 0.4));
    hood.add(at(box(0.6, 0.7, 0.6, M.steel), -1.5, 0.6, -0.2));
    hood.position.set(-1.6, 2.45, ROOM.z0 + hd / 2);
    this.scene.add(hood);

    // lampu panel langit-langit (visual)
    const panelM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
    for (const x of [-3, 0, 3]) for (const z of [-0.5, 2.5]) {
      const p = mesh(new THREE.BoxGeometry(1.2, 0.03, 0.3), panelM, { cast: false });
      p.position.set(x, ROOM.h - 0.02, z);
      this.scene.add(p);
    }

    // meja & furnitur lingkungan (tidak dapat dipilih)
    this.env = {};
    const add = (name, obj, x, z, ry = 0) => {
      obj.position.set(x, 0, z);
      obj.rotation.y = ry;
      this.scene.add(obj);
      this.env[name] = obj;
      return obj;
    };
    add('islandA', prepTable(2.0, 0.85), -1.3, -0.7);
    add('islandB', prepTable(2.0, 0.85), 1.3, -0.7);
    add('grillTable', prepTable(0.75, 0.75, 0.55), -1.45, ROOM.z0 + 0.42);
    add('fryerTable', prepTable(0.75, 0.75, 0.55), -0.66, ROOM.z0 + 0.42);
    add('rack', wireRack(1.3, 0.5, 1.85, 4), -3.6, 1.5, PI / 2);
    add('cabinet', storageCabinet(1.7, 0.65), 5.62, 3.25, -PI / 2);
    add('passTable', prepTable(1.8, 0.75), -2.6, 3.2);
    add('buffet', prepTable(1.6, 0.75, 0.86), 2.5, 2.9);
    add('dining', diningTable(1.5, 0.9), -0.2, 3.65);
    add('chair', chair(), -0.2, 4.25, PI);
    add('ovenCounter', storageCabinet(1.0, 0.6), 5.65, -3.35, -PI / 2);

    // rel gantung alat di atas meja island
    const rail = new THREE.Group();
    rail.add(at(cylX(0.015, 4.6, M.steelPolished), 0, 0, 0));
    for (const x of [-2.2, 0, 2.2]) rail.add(at(cyl(0.012, 0.012, ROOM.h - 1.95, M.steelPolished, 10), x, (ROOM.h - 1.95) / 2, 0));
    rail.position.set(0, 1.95, -0.7);
    this.scene.add(rail);
    // batang magnet pisau
    const magnet = at(rbox(0.9, 0.05, 0.025, 0.008, M.plasticBlack, 2), 1.6, 1.86, -0.7);
    this.scene.add(magnet);
    // gantungan apron
    const hook = at(box(0.04, 0.04, 0.12, M.steelPolished), ROOM.x0 + 0.06, 1.75, 2.0);
    this.scene.add(hook);
  }

  _buildLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8f94, 0.85);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff6ea, 2.2);
    sun.position.set(3.5, 9, 5.5);
    sun.target.position.set(0, 0, -0.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = sun.shadow.camera;
    s.left = -8; s.right = 8; s.top = 8; s.bottom = -8; s.near = 1; s.far = 25;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight(0xdfe9ff, 0.6);
    fill.position.set(-6, 5, 4);
    this.scene.add(fill);
  }

  /* ---------------- penempatan peralatan ---------------- */
  /** Daftar penempatan: id, posisi, rotasi, bidang tumpu (surface) & penempelan ke dinding. */
  layout() {
    const zb = ROOM.z0 + 0.05;
    const tA = this.env.islandA.position, tB = this.env.islandB.position;
    const top = 0.9;
    const P = [];
    const p = (id, x, y, z, ry = 0, extra = {}) => P.push({ id, x, y, z, ry, ...extra });
    // cooking line (menempel dinding belakang)
    p('steam-kettle', -5.2, 0, zb, 0, { back: true });
    p('tilting-skillet', -3.9, 0, zb, 0, { back: true });
    p('gas-range', -2.45, 0, zb, 0, { back: true });
    p('salamander', -2.45, 1.45, zb, 0, { back: true });
    p('griller', -1.45, 0.55, zb + 0.02, 0, { back: true });
    p('deep-fryer', -0.66, 0.55, zb + 0.05, 0, { back: true });
    p('convection-oven', 0.3, 0, zb, 0, { back: true });
    p('combi-oven', 1.28, 0, zb, 0, { back: true });
    p('deck-oven', 2.45, 0, zb, 0, { back: true });
    p('rack-oven', 3.75, 0, zb, 0, { back: true });
    // panci di atas kompor (tinggi permukaan grate ≈ 0.978)
    p('stock-pot', -2.85, 0.98, -4.11);
    p('sauce-pan', -2.45, 0.98, -3.77, 0.4);
    p('frying-pan', -2.05, 0.98, -3.77, -0.5);
    p('saute-pan', -2.05, 0.98, -4.11, -0.2);
    // dinding kanan: pendingin & penghangat
    p('upright-chiller', 5.5, 0, -1.7, -PI / 2, { right: true });
    p('upright-freezer', 5.5, 0, -0.35, -PI / 2, { right: true });
    p('showcase-chiller', 5.5, 0, 0.85, -PI / 2, { right: true });
    p('warmer-cabinet', 5.5, 0, 1.75, -PI / 2, { right: true });
    p('microwave', 5.6, 0.9, 3.6, -PI / 2, { right: true });
    p('oven-mitt', 5.6, 0.9, 2.9, -PI / 2, { rx: -PI / 2 });
    // dinding kiri: walk-in
    p('walkin-chiller', -4.75, 0, -1.25, PI / 2, { left: true });
    p('walkin-freezer', -4.75, 0, 1.25 + 0.05, PI / 2, { left: true });
    p('apron', ROOM.x0 + 0.08, 0.95, 2.0, PI / 2);
    // island A: persiapan (sisi kiri)
    p('cutting-board', tA.x - 0.55, top, tA.z + 0.05, 0.05);
    p('chopping-knife', tA.x - 0.58, top + 0.03, tA.z + 0.08, 0, { rx: -PI / 2 });
    p('vegetable-knife', tA.x - 0.62, top + 0.03, tA.z - 0.05, 0.2, { rx: -PI / 2 });
    p('peeler', tA.x - 0.18, top, tA.z + 0.25, 0.6, { rx: -PI / 2 });
    p('grater', tA.x - 0.05, top, tA.z - 0.2, 0.3);
    p('cobek', tA.x + 0.2, top, tA.z + 0.2);
    p('scale', tA.x + 0.55, top, tA.z - 0.18, -0.2);
    p('measuring-cup', tA.x + 0.25, top, tA.z - 0.25);
    p('blender', tA.x + 0.82, top, tA.z + 0.18, -0.3);
    p('hand-mixer', tA.x - 0.25, top, tA.z - 0.12, 0.4);
    p('rolling-pin', tA.x + 0.55, top, tA.z + 0.25, 0.3);
    p('kitchen-towel', tA.x - 0.9, top, tA.z - 0.28, 0.1);
    // island B
    p('meat-slicer', tB.x - 0.45, top, tB.z, 0.15);
    p('dish-towel', tB.x + 0.35, top, tB.z + 0.25, -0.1);
    p('ice-cream-scoop', tB.x + 0.3, top, tB.z - 0.1, 0.5, { flat: true });
    p('sharpener', tB.x + 0.62, top + 0.007, tB.z + 0.05, 0.8, { flat: true });
    // lantai dekat island B
    p('planetary-mixer', 3.05, 0, -0.5, -PI / 2);
    p('spiral-mixer', 3.1, 0, 0.75, -PI / 2);
    // rel gantung (alat bergagang menghadap bawah)
    const hang = [['ladle', -1.9], ['spider', -1.45], ['spatula', -1.0], ['whisk', -0.6], ['conical-strainer', -0.15], ['strainer', 0.35], ['carving-fork', 0.75]];
    hang.forEach(([id, x]) => p(id, x, 1.93, -0.7, 0, { hang: true }));
    // pisau pada batang magnet
    const knives = [['filleting-knife', 1.25], ['boning-knife', 1.45], ['bread-knife', 1.67], ['cleaver', 1.93]];
    knives.forEach(([id, x]) => p(id, x, 1.9, -0.67, 0, { knife: true }));
    // rak: panci cadangan
    const rack = this.env.rack, lv = rack.userData.levels;
    p('sauce-pot', rack.position.x, lv[2], rack.position.z - 0.3, 0);
    p('steaming-pan', rack.position.x, lv[1], rack.position.z - 0.3, 0);
    p('roasting-pan', rack.position.x, lv[0], rack.position.z + 0.2, PI / 2);
    // area saji depan
    p('steam-table', 0.3, 0, 1.75, 0);
    p('chafing-dish', 2.05, 0.86, 2.95, 0);
    p('display-case', -2.95, 0.9, 3.2, 0);
    p('showcase-warmer', -1.98, 0.9, 3.2, 0);
    p('showcase-freezer', 4.3, 0, 3.2, 0);
    // meja makan: penataan cover
    const d = this.env.dining.position, ty = this.env.dining.userData.top;
    p('dinner-plate', d.x, ty, d.z + 0.15);
    p('soup-cup', d.x, ty + 0.012, d.z + 0.15);
    p('dinner-fork', d.x - 0.19, ty, d.z + 0.16, PI / 2, { flat: true });
    p('dessert-fork', d.x - 0.24, ty, d.z + 0.165, PI / 2, { flat: true });
    p('dinner-knife', d.x + 0.19, ty, d.z + 0.16, PI / 2, { flat: true });
    p('dessert-knife', d.x + 0.235, ty, d.z + 0.165, PI / 2, { flat: true });
    p('dinner-spoon', d.x + 0.28, ty, d.z + 0.16, PI / 2, { flat: true });
    p('soup-spoon', d.x + 0.325, ty, d.z + 0.165, PI / 2, { flat: true });
    p('dessert-spoon', d.x, ty, d.z - 0.04, PI, { flat: true });
    p('bb-plate', d.x - 0.3, ty, d.z - 0.08);
    p('butter-spreader', d.x - 0.3, ty + 0.012, d.z - 0.08, 0.2, { flat: true });
    p('water-goblet', d.x + 0.2, ty, d.z - 0.1);
    p('wine-glass', d.x + 0.3, ty, d.z - 0.05);
    p('juice-glass', d.x + 0.12, ty, d.z - 0.17);
    p('water-pitcher', d.x + 0.55, ty, d.z - 0.25);
    p('highball-glass', d.x + 0.42, ty, d.z - 0.2);
    p('dessert-plate', d.x - 0.5, ty, d.z + 0.15);
    p('saucer', d.x - 0.55, ty, d.z - 0.25);
    p('tea-cup', d.x - 0.32, ty, d.z - 0.3);
    p('coffee-cup', d.x + 0.0, ty, d.z - 0.3);
    p('clay-pot', d.x - 0.62, ty, d.z - 0.05);
    return P;
  }

  /** Muat semua peralatan secara bertahap. onProgress(0..1). */
  async populate(onProgress = () => {}) {
    const list = this.layout().filter((l) => hasModel(this.equipment.byId[l.id]?.modelType || l.id));
    let i = 0;
    for (const l of list) {
      const eq = this.equipment.byId[l.id];
      try {
        this._place(eq, l);
      } catch (err) {
        console.error('Gagal memuat model', l.id, err);
      }
      i++;
      onProgress(i / list.length);
      if (i % 4 === 0) await new Promise((r) => requestAnimationFrame(r));
    }
    this.stage.setPickables([...this.instances.values()]);
    this.stage.refreshShadows();
  }

  _place(eq, l) {
    const model = buildModel(eq.modelType);
    const wrap = new THREE.Group();
    wrap.name = 'eq:' + eq.id;
    wrap.userData.equipmentId = eq.id;
    const inner = new THREE.Group();
    inner.add(model);
    if (l.hang) inner.rotation.z = -PI / 2; // ujung kerja menghadap bawah
    if (l.knife) inner.rotation.z = -PI / 2;
    if (l.rx) inner.rotation.x = l.rx;
    wrap.add(inner);
    wrap.rotation.y = l.ry || 0;
    wrap.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(wrap);
    // tumpukan pada bidang (y = bawah), atau gantung (y = puncak)
    let y = l.y - box.min.y;
    if (l.hang || l.knife) y = l.y - box.max.y;
    let x = l.x, z = l.z;
    const c = box.getCenter(new THREE.Vector3());
    if (l.back) z = l.z - box.min.z;
    if (l.right) x = ROOM.x1 - 0.05 - box.max.x;
    if (l.left) x = ROOM.x0 + 0.05 - box.min.x;
    if (!l.back && !l.right && !l.left) { x = l.x - c.x; z = l.z - c.z; }
    else if (l.back) x = l.x - c.x;
    else z = l.z - c.z;
    wrap.position.set(x, y, z);
    this.root.add(wrap);
    this.instances.set(eq.id, wrap);
    // status awal suasana dapur
    const api = model.userData.model;
    if (api) {
      if (eq.id === 'gas-range') { api.set('gas', 1); api.set('all', 0); }
      if (['steam-table', 'showcase-warmer', 'chafing-dish'].includes(eq.id)) api.set('power', 1);
      if (eq.id === 'stock-pot') { api.set('fill', 1); }
      api.snap?.();
      wrap.userData.api = api;
    }
    wrap.updateMatrixWorld(true);
    wrap.userData.box = new THREE.Box3().setFromObject(wrap);
  }

  /** Tick animasi model yang terlihat di dapur. */
  tick(dt) {
    for (const w of this.instances.values()) w.userData.api?.tick(dt);
  }

  get(id) { return this.instances.get(id); }

  defaultView() {
    return { pos: new THREE.Vector3(0.6, 3.6, 8.6), target: new THREE.Vector3(0, 0.9, -0.6) };
  }
  landingView() {
    return { pos: new THREE.Vector3(-4.5, 4.8, 9.5), target: new THREE.Vector3(0, 1, -1) };
  }
}
