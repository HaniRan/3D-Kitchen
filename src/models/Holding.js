/**
 * Holding equipment (penyimpanan sebelum disajikan):
 * Display Case, Showcase Chiller, Showcase Freezer, Upright Chiller, Upright Freezer,
 * Walk-in Chiller, Walk-in Freezer, Showcase Warmer, Warmer Cabinet, Steam Table, Chafing Dish.
 */
import * as THREE from 'three';
import { M, colorMat } from './materials.js';
import { labelTexture, panelTexture } from './textures.js';
import {
  Kit, mesh, at, group, box, rbox, cyl, cylX, cylZ, sphere, torus, lathe, latheGeo, vessel,
  rectLatheGeo, trayGeo, shapeFrom, extrudeGeo, roundedRectShape, tube, knob, bulletFoot, caster,
  flameRing, steamPuffs, steamTick, mergeMeshes, PI, TAU, V3, clamp,
} from './helpers.js';

/* ------------------------------------------------------------------ props */
function bottle(mat = M.bottleGreen, h = 0.22) {
  const b = lathe([[0, 0], [0.032, 0], [0.034, 0.006], [0.034, h * 0.6], [0.026, h * 0.72], [0.013, h * 0.82], [0.013, h * 0.97], [0.015, h], [0, h]], mat, 20);
  const label = cyl(0.0345, 0.0345, h * 0.25, M.labelPaper, 20, true);
  label.position.y = h * 0.33;
  const cap = cyl(0.015, 0.015, 0.012, M.plasticRed, 12);
  cap.position.y = h;
  return group(b, label, cap);
}
function can(color) {
  const c = lathe([[0, 0], [0.028, 0], [0.033, 0.01], [0.033, 0.11], [0.028, 0.12], [0, 0.12]], colorMat(color, 0.3, 0.8), 20);
  return group(c);
}
function sandwichBox() {
  const g = new THREE.Group();
  const tri = shapeFrom([[0, 0], [0.12, 0], [0, 0.07]]);
  const body = mesh(extrudeGeo(tri, 0.06, { bevel: 0.004, segs: 1 }), M.breadCrumb);
  body.rotation.y = PI / 2;
  g.add(body);
  const filling = mesh(extrudeGeo(shapeFrom([[0.005, 0.0], [0.11, 0.0], [0.005, 0.062]]), 0.012, { bevel: 0.002, segs: 1 }), M.leaf);
  filling.rotation.y = PI / 2;
  g.add(filling);
  const clear = mesh(extrudeGeo(tri, 0.07, { bevel: 0.006, segs: 1 }), M.glassPane);
  clear.rotation.y = PI / 2;
  g.add(clear);
  return g;
}
function cake(r = 0.09, h = 0.07, top = M.cream, body = M.bread) {
  const g = new THREE.Group();
  g.add(at(cyl(r, r, h * 0.7, body, 32), 0, h * 0.35, 0));
  g.add(at(cyl(r * 1.01, r * 1.01, h * 0.3, top, 32), 0, h * 0.85, 0));
  for (let i = 0; i < 6; i++) g.add(at(sphere(0.008, M.fruitRed, 10, 8), Math.cos(i) * r * 0.7, h + 0.004, Math.sin(i) * r * 0.7));
  return g;
}
function bread(len = 0.18) {
  const b = sphere(0.05, M.bread, 20, 12);
  b.scale.set(len / 0.1, 0.55, 0.85);
  b.position.y = 0.025;
  return group(b);
}
function iceTub(mat) {
  return group(
    mesh(trayGeo({ w: 0.24, d: 0.16, h: 0.1, r: 0.02, flare: -0.01, wall: 0.002, lip: 0.005 }), M.plasticWhite),
    at(rbox(0.225, 0.04, 0.145, 0.03, mat, 2), 0, 0.08, 0),
  );
}
function friedChicken() {
  const g = new THREE.Group();
  const s = sphere(0.035, M.fried, 14, 10);
  s.scale.set(1.3, 0.8, 1);
  const bone = cyl(0.006, 0.006, 0.04, M.breadCrumb, 8);
  bone.rotation.z = PI / 2;
  bone.position.x = 0.05;
  g.add(s, bone);
  return g;
}
function gnPan(w, d, foodMat) {
  const g = group(mesh(trayGeo({ w, d, h: 0.1, r: 0.02, flare: -0.008, wall: 0.0012, lip: 0.012, corner: 0.01 }), M.steelSatin));
  if (foodMat) g.add(at(rbox(w - 0.03, 0.02, d - 0.03, 0.01, foodMat, 2), 0, 0.075, 0));
  return g;
}
function wireShelf(w, d) {
  const bars = [];
  for (let i = 0; i <= 10; i++) bars.push(at(box(0.004, 0.004, d, M.chrome), -w / 2 + (i * w) / 10, 0, 0));
  for (const s of [-1, 1]) bars.push(at(box(w, 0.008, 0.008, M.chrome), 0, 0, (s * d) / 2));
  return mergeMeshes(bars, M.chrome);
}
function labelPlate(text, w, h, bg = '#1c2b36', fg = '#ffffff') {
  const tex = labelTexture(text, { w: 512, h: Math.round((512 * h) / w), bg, fg, font: `bold ${Math.round(((512 * h) / w) * 0.55)}px Arial` });
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.25 });
  return mesh(new THREE.PlaneGeometry(w, h), m, { cast: false });
}
function tempDisplay(kit, text, w = 0.08, h = 0.03, color = '#ff3b2a') {
  const tex = labelTexture(text, { w: 256, h: 96, bg: '#050505', fg: color, font: 'bold 68px monospace', glow: true });
  const mat = kit.own(M.lcd);
  mat.emissive = new THREE.Color(0xffffff);
  mat.emissiveMap = tex;
  mat.emissiveIntensity = 1.3;
  const m = mesh(new THREE.PlaneGeometry(w, h), mat, { cast: false });
  return { mesh: m, mat, set: (t) => tex.userData.update(t) };
}

/* ------------------------------------------------------------------ pintu lemari */
function glassDoor(w, h, { frameMat = M.aluminium, handle = 'right' } = {}) {
  const g = new THREE.Group();
  const shape = roundedRectShape(w, h, 0.01);
  shape.holes.push(roundedRectShape(w - 0.07, h - 0.08, 0.008));
  g.add(mesh(extrudeGeo(shape, 0.035, { bevel: 0.003, segs: 1 }), frameMat));
  const pane = mesh(new THREE.PlaneGeometry(w - 0.06, h - 0.07), M.glassPane);
  g.add(pane);
  const hx = handle === 'right' ? w / 2 - 0.04 : -w / 2 + 0.04;
  g.add(at(rbox(0.025, h * 0.4, 0.03, 0.008, frameMat, 2), hx, 0, 0.03));
  return g;
}
function solidDoor(w, h, mat = M.steel, handleSide = 'right') {
  const g = new THREE.Group();
  g.add(rbox(w, h, 0.06, 0.01, mat, 2));
  const hx = handleSide === 'right' ? w / 2 - 0.05 : -w / 2 + 0.05;
  const bar = at(cyl(0.012, 0.012, h * 0.45, M.steelPolished, 14), hx, 0.0, 0.07);
  g.add(bar);
  for (const s of [-1, 1]) g.add(at(cylZ(0.009, 0.05, M.steelPolished), hx, s * h * 0.2, 0.045));
  g.add(at(box(w - 0.02, 0.006, 0.005, M.rubber), 0, -h / 2 + 0.003, -0.03));
  return g;
}

/* ============================================================ DISPLAY CASE == */
export function buildDisplayCase() {
  const kit = new Kit('display-case');
  const W = 0.9, D = 0.5, baseH = 0.16, glassH = 0.5;
  const base = at(rbox(W, baseH, D, 0.01, M.woodDark, 2), 0, baseH / 2, 0);
  const plinth = at(rbox(W - 0.02, 0.012, D - 0.02, 0.004, M.steelSatin, 2), 0, baseH + 0.006, 0);
  kit.part('base', 'Alas lemari (tanpa pengatur suhu)', [0, -0.08, 0], base, plinth);
  const frame = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) frame.push(at(box(0.015, glassH, 0.015, M.aluminium), sx * (W / 2 - 0.008), baseH + glassH / 2, sz * (D / 2 - 0.008)));
  for (const sz of [-1, 1]) frame.push(at(box(W, 0.015, 0.015, M.aluminium), 0, baseH + glassH, sz * (D / 2 - 0.008)));
  for (const sx of [-1, 1]) frame.push(at(box(0.015, 0.015, D, M.aluminium), sx * (W / 2 - 0.008), baseH + glassH, 0));
  const fr = mergeMeshes(frame, M.aluminium);
  const panes = new THREE.Group();
  const front = at(plane(W - 0.02, glassH - 0.01), 0, baseH + glassH / 2, D / 2 - 0.008);
  const back = at(plane(W - 0.02, glassH - 0.01), 0, baseH + glassH / 2, -D / 2 + 0.008);
  const left = at(plane(D - 0.02, glassH - 0.01), -W / 2 + 0.008, baseH + glassH / 2, 0, 0, PI / 2);
  const right = at(plane(D - 0.02, glassH - 0.01), W / 2 - 0.008, baseH + glassH / 2, 0, 0, PI / 2);
  const top = at(plane(W - 0.02, D - 0.02), 0, baseH + glassH, 0, -PI / 2);
  panes.add(front, back, left, right, top);
  kit.part('glass', 'Kotak kaca & rangka aluminium', [0, 0.2, 0], fr, panes);
  const shelf = at(rbox(W - 0.04, 0.008, D - 0.06, 0.003, M.glassPane, 1), 0, baseH + 0.25, 0);
  const goods = new THREE.Group();
  for (let i = 0; i < 3; i++) goods.add(at(bread(0.16), -0.28 + i * 0.28, baseH + 0.015, 0.05));
  for (let i = 0; i < 3; i++) goods.add(at(cake(0.07, 0.06), -0.28 + i * 0.28, baseH + 0.256, 0));
  kit.part('shelf', 'Rak kaca & produk (roti, kue)', [0, 0, 0.35], shelf, goods);
  return kit.finish({ holding: true, temp: 'ruang' });
}
function plane(w, h) { return mesh(new THREE.PlaneGeometry(w, h), M.glassPane, { cast: false }); }

/* ======================================================== SHOWCASE CHILLER == */
export function buildShowcaseChiller() {
  const kit = new Kit('showcase-chiller');
  const W = 0.62, H = 1.95, D = 0.6;
  const body = new THREE.Group();
  body.add(at(rbox(W, H - 0.25, 0.03, 0.008, M.enamelBlack, 2), 0, (H - 0.25) / 2 + 0.1, -D / 2 + 0.015));
  for (const s of [-1, 1]) body.add(at(rbox(0.03, H - 0.25, D, 0.008, M.enamelBlack, 2), s * (W / 2 - 0.015), (H - 0.25) / 2 + 0.1, 0));
  body.add(at(rbox(W, 0.12, D, 0.01, M.enamelBlack, 2), 0, 0.06, 0));
  body.add(at(box(W - 0.06, 0.06, 0.005, colorMat(0x111111, 0.7)), 0, 0.06, D / 2 + 0.002));
  const header = at(rbox(W, 0.26, D, 0.01, M.enamelBlack, 2), 0, H - 0.13, 0);
  const sign = labelPlate('SHOWCASE CHILLER', W - 0.06, 0.12, '#0b4f8a');
  sign.position.set(0, H - 0.12, D / 2 + 0.002);
  const disp = tempDisplay(kit, '4°C', 0.07, 0.025, '#3bd1ff');
  disp.mesh.position.set(W / 2 - 0.08, H - 0.215, D / 2 + 0.002);
  const lm = kit.own(M.interiorLight);
  const strip = at(box(0.012, H - 0.45, 0.012, lm), -W / 2 + 0.04, H / 2, D / 2 - 0.06);
  kit.part('body', 'Kabinet berpendingin & papan nama', [0, 0, -0.15], body, header, sign, disp.mesh, strip);
  const shelves = new THREE.Group();
  const items = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const y = 0.25 + i * 0.36;
    shelves.add(at(wireShelf(W - 0.07, D - 0.1), 0, y, 0));
    for (let k = 0; k < 6; k++) {
      let it;
      if (i === 3) it = bottle(k % 2 ? M.bottleGreen : M.juice, 0.24);
      else if (i === 2) it = can(k % 2 ? 0xc0392b : 0x2471a3);
      else if (i === 1) it = sandwichBox();
      else it = k % 2 ? at(sphere(0.035, M.fruitRed, 16, 12), 0, 0.035, 0) : at(sphere(0.035, M.fruitYellow, 16, 12), 0, 0.035, 0);
      it.position.set(-0.22 + (k % 6) * 0.088, y + 0.004, i === 1 ? 0.0 : (k % 2 ? 0.08 : -0.06));
      items.add(it);
    }
  }
  kit.part('shelves', 'Rak kawat & produk (sandwich, salad, buah, minuman)', [0, 0, 0.5], shelves, items);
  const pivot = new THREE.Group();
  const door = glassDoor(W - 0.02, H - 0.3, { frameMat: M.enamelBlack });
  door.position.x = (W - 0.02) / 2;
  pivot.add(door);
  pivot.position.set(-W / 2 + 0.01, (H - 0.3) / 2 + 0.115, D / 2 + 0.02);
  kit.part('door', 'Pintu kaca (isi terlihat)', [0, 0, 0.3], pivot);
  kit.stateVar('door', 0, 3);
  kit.stateVar('power', 1, 3);
  kit.onApply((s) => {
    pivot.rotation.y = -s.door * 1.5;
    lm.emissiveIntensity = s.power * 2.2;
    disp.mat.emissiveIntensity = s.power * 1.3;
  });
  return kit.finish({ holding: true, electric: true, temp: 'dingin' });
}

/* ======================================================== SHOWCASE FREEZER == */
export function buildShowcaseFreezer() {
  const kit = new Kit('showcase-freezer');
  const W = 1.2, H = 0.86, D = 0.66;
  const body = mesh(rectLatheGeo([[0, 0.06], [0, H - 0.05], [-0.01, H]], W, D, 0.04, 4, { capEnd: false }), M.enamelWhite);
  const inner = mesh(trayGeo({ w: W - 0.1, d: D - 0.1, h: H - 0.25, r: 0.03, flare: 0, wall: 0.003, lip: 0.04, corner: 0.02 }), colorMat(0xdfe5ea, 0.4));
  inner.position.y = 0.25;
  const bumper = mesh(rectLatheGeo([[0.012, H - 0.06], [0.012, H - 0.02]], W, D, 0.04, 4, { capStart: false, capEnd: false }), M.plasticGrey);
  const casters = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(caster(0.025, M.steelDark, M.rubber), sx * (W / 2 - 0.08), 0, sz * (D / 2 - 0.08))));
  const disp = tempDisplay(kit, '-18°C', 0.09, 0.03, '#3bd1ff');
  disp.mesh.position.set(W / 2 - 0.12, H - 0.1, D / 2 + 0.002);
  const sign = labelPlate('SHOWCASE FREEZER', 0.4, 0.06, '#0b4f8a');
  sign.position.set(-0.25, H - 0.1, D / 2 + 0.002);
  kit.part('body', 'Kabinet pembeku (chest)', [0, -0.15, 0], body, inner, bumper, ...casters, disp.mesh, sign);
  const tubs = new THREE.Group();
  const mats = [M.iceCreamPink, M.iceCreamVanilla, M.iceCreamChoco, M.iceCreamPink, M.iceCreamChoco, M.iceCreamVanilla, M.iceCreamVanilla, M.iceCreamPink];
  for (let i = 0; i < 8; i++) tubs.add(at(iceTub(mats[i]), -0.42 + (i % 4) * 0.28, H - 0.24, i < 4 ? -0.1 : 0.1));
  kit.part('content', 'Isi beku (es krim)', [0, 0.35, 0], tubs);
  const lids = [];
  for (const s of [-1, 1]) {
    const l = new THREE.Group();
    const curved = mesh(new THREE.CylinderGeometry(0.9, 0.9, W / 2 - 0.02, 32, 1, true, PI / 2 - 0.36, 0.72), M.glassPane);
    curved.rotation.z = PI / 2;
    curved.position.y = -0.885;
    curved.scale.set(1, 1, 1);
    const fr = mesh(rectLatheGeo([[0, -0.005], [0, 0.012]], W / 2 - 0.02, D - 0.04, 0.01, 2, { capStart: false, capEnd: false }), M.aluminium);
    l.add(curved, fr, at(box(0.12, 0.012, 0.02, M.plasticGrey), 0, 0.02, s * 0 + 0.0));
    l.position.set(s * (W / 4), H + 0.005, 0);
    lids.push(l);
  }
  kit.part('lids', 'Tutup kaca geser lengkung', [0, 0.25, 0], ...lids);
  kit.stateVar('door', 0, 3);
  kit.stateVar('power', 1, 3);
  kit.onApply((s) => {
    lids[1].position.x = W / 4 - s.door * (W / 2 - 0.04);
    lids[1].position.y = H + 0.005 + s.door * 0.02;
    disp.mat.emissiveIntensity = s.power * 1.3;
  });
  return kit.finish({ holding: true, electric: true, temp: 'beku' });
}

/* ============================================= UPRIGHT CHILLER / FREEZER == */
/**
 * Lemari reach-in stainless 2 pintu (±2 m). Chiller: pintu kaca berbingkai stainless, lampu LED
 * interior, display +3°C hijau-biru. Freezer: pintu padat tebal dengan kunci, display -18°C, lapisan
 * bunga es (frost) di dinding dalam & produk beku, kisi kondensor lebih besar.
 */
function uprightCabinet(name, label, temp, color) {
  const kit = new Kit(name);
  const freezer = temp.startsWith('-');
  const W = 1.22, H = 2.02, D = 0.8;
  const body = new THREE.Group();
  body.add(at(rbox(W, 0.03, D, 0.008, M.steel, 2), 0, H - 0.015, 0));
  body.add(at(rbox(W, 0.03, D, 0.008, M.steel, 2), 0, 0.15, 0));
  for (const s of [-1, 1]) body.add(at(rbox(0.03, H - 0.15, D, 0.008, M.steel, 2), s * (W / 2 - 0.015), (H + 0.15) / 2, 0));
  body.add(at(box(W - 0.04, H - 0.15, 0.03, M.steel), 0, (H + 0.15) / 2, -D / 2 + 0.015));
  body.add(at(box(0.04, H - 0.4, 0.02, M.steel), 0, (H + 0.15) / 2 - 0.09, D / 2 - 0.01)); // tiang tengah (mullion)
  // dinding dalam (liner) — freezer: berlapis bunga es putih kebiruan
  const lining = freezer ? colorMat(0xeef6fb, 0.85, 0.0) : colorMat(0xdfe4e8, 0.35, 0.3);
  const inner = rectLatheGeo([[0, 0.17], [0, H - 0.25]], W - 0.06, D - 0.07, 0.01, 1, { capStart: true, capEnd: true });
  const lin = mesh(inner, lining);
  lin.material = lining;
  lin.geometry.index && lin.geometry.index.array.reverse(); // tampak dari dalam
  lin.geometry.computeVertexNormals();
  lin.position.z = -0.015;
  body.add(lin);
  if (freezer) {
    // gumpalan bunga es di sudut atas & pada evaporator
    const frost = colorMat(0xf7fbff, 0.95);
    for (let i = 0; i < 9; i++) body.add(at(sphere(0.03 + (i % 3) * 0.008, frost, 10, 8), -0.5 + i * 0.125, H - 0.27, -D / 2 + 0.06));
  }
  // kepala (header) dengan kisi kondensor, papan nama & display suhu
  const top = at(rbox(W, 0.22, D, 0.01, M.steel, 2), 0, H - 0.11, 0);
  const louverN = freezer ? 12 : 8;
  const louvers = [];
  for (let i = 0; i < louverN; i++) louvers.push(at(box(0.026, 0.13, 0.006, M.steelDark), -W / 2 + 0.07 + i * 0.038, 0, D / 2 + 0.002));
  top.add(mergeMeshes(louvers, M.steelDark));
  const sign = labelPlate(label, 0.3, 0.07, color);
  sign.position.set(0.13, H - 0.11, D / 2 + 0.003);
  const dispBezel = at(rbox(0.15, 0.07, 0.012, 0.004, M.plasticBlack, 2), 0.44, H - 0.11, D / 2 + 0.004);
  const disp = tempDisplay(kit, temp, 0.11, 0.04, freezer ? '#5cc8ff' : '#4dff9a');
  disp.mesh.position.set(0.44, H - 0.11, D / 2 + 0.0105);
  const casters = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(caster(0.045, M.steelDark, M.rubber), sx * (W / 2 - 0.08), 0, sz * (D / 2 - 0.08))));
  const kick = at(box(W - 0.02, 0.12, 0.01, M.steelSatin), 0, 0.075, D / 2 - 0.01);
  const vents = [];
  for (let i = 0; i < 14; i++) vents.push(at(box(0.05, 0.008, 0.004, M.steelDark), -0.36 + i * 0.055, 0.075, D / 2 - 0.004));
  kit.part('body', 'Kabinet stainless berinsulasi & pengatur suhu', [0, 0, -0.2], body, top, sign, dispBezel, disp.mesh, kick, mergeMeshes(vents, M.steelDark), ...casters);
  const shelves = new THREE.Group();
  const items = new THREE.Group();
  const frostBox = colorMat(0xdbe9f4, 0.7);
  for (let i = 0; i < 4; i++) {
    const y = 0.32 + i * 0.4;
    for (const s of [-1, 1]) {
      shelves.add(at(wireShelf(W / 2 - 0.07, D - 0.16), s * (W / 4), y, -0.02));
      for (let k = 0; k < 2; k++) {
        const it = freezer
          ? at(rbox(0.2, 0.08 + (k % 2) * 0.04, 0.28, 0.01, k % 2 ? M.cardboard : frostBox, 2), 0, 0.04 + (k % 2) * 0.02, 0)
          : gnPan(0.22, 0.3, (i + k) % 3 === 0 ? M.leaf : (i + k) % 3 === 1 ? M.meat : M.carrot);
        it.position.x = s * (W / 4) - 0.12 + k * 0.24;
        it.position.y = y + 0.005;
        it.position.z = -0.02;
        if (!freezer) it.scale.setScalar(0.85);
        items.add(it);
      }
    }
  }
  let lm = null;
  if (!freezer) {
    lm = kit.own(M.interiorLight);
    for (const s of [-1, 1]) shelves.add(at(box(0.012, H - 0.5, 0.012, lm), s * (W / 2 - 0.04), (H + 0.15) / 2 - 0.05, D / 2 - 0.07));
  }
  kit.part('shelves', 'Rak yang dapat diatur ketinggiannya', [0, 0, 0.6], shelves, items);
  const doors = [];
  const dW = W / 2 - 0.02, dH = H - 0.42;
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    const side = s < 0 ? 'right' : 'left';
    let d;
    if (freezer) {
      d = solidDoor(dW, dH, M.steel, side);
      // kunci pintu & gasket magnet tebal
      const hx = side === 'right' ? dW / 2 - 0.05 : -dW / 2 + 0.05;
      d.add(at(cylZ(0.009, 0.012, M.chrome, 16), hx, -dH * 0.3, 0.036));
    } else {
      d = glassDoor(dW, dH, { frameMat: M.steel, handle: side });
    }
    d.position.x = -s * (W / 4 - 0.01);
    pivot.add(d);
    pivot.position.set(s * (W / 2 - 0.005), dH / 2 + 0.17, D / 2 + 0.03);
    doors.push({ pivot, s });
  }
  kit.part('doors', freezer ? 'Pintu padat berinsulasi, gasket & kunci' : 'Pintu kaca berinsulasi (double glass) & gagang', [0, 0, 0.35], ...doors.map((d) => d.pivot));
  kit.stateVar('door', 0, 2.5);
  kit.stateVar('power', 1, 3);
  kit.onApply((s) => {
    doors[0].pivot.rotation.y = -s.door * 1.6;
    doors[1].pivot.rotation.y = s.door * 1.6;
    disp.mat.emissiveIntensity = s.power * 1.3;
    if (lm) lm.emissiveIntensity = s.power * 1.8;
  });
  return kit.finish({ holding: true, electric: true, temp: freezer ? 'beku' : 'dingin' });
}
export function buildUprightChiller() { return uprightCabinet('upright-chiller', 'CHILLER', '+3°C', '#0b7a5a'); }
export function buildUprightFreezer() { return uprightCabinet('upright-freezer', 'FREEZER', '-18°C', '#0b4f8a'); }

/* ============================================= WALK-IN CHILLER / FREEZER == */
/**
 * Ruang pendingin walk-in dari panel insulasi (PU) bersambungan: sambungan panel vertikal,
 * profil sudut, kick plate stainless, pintu engsel berat (3 engsel cam-lift, gagang latch berkunci,
 * kick plate pelat bordes), tirai plastik (strip curtain), display suhu, unit kondensor di atap
 * & evaporator di dalam. Freezer: panel lebih tebal, rangka pintu berpemanas (heater frame),
 * katup penyeimbang tekanan, display -18°C. Chiller: jendela kecil di pintu, display +2°C.
 */
function walkIn(name, label, temp) {
  const kit = new Kit(name);
  const freezer = temp.startsWith('-');
  const W = 2.4, H = 2.3, D = 2.4, T = freezer ? 0.15 : 0.1;
  const pm = colorMat(0xf1f3f3, 0.5, 0.05);
  const seamMat = colorMat(0xb9c0c4, 0.6);
  const walls = new THREE.Group();
  walls.add(at(box(W, H, T, pm), 0, H / 2, -D / 2 + T / 2));
  for (const s of [-1, 1]) walls.add(at(box(T, H, D, pm), s * (W / 2 - T / 2), H / 2, 0));
  walls.add(at(box(W, T, D, pm), 0, H - T / 2, 0));
  const doorW = 0.86, doorH = 1.92, doorX = -0.45;
  const fShape = roundedRectShape(W, H, 0.002);
  fShape.holes.push(roundedRectShape(doorW, doorH, 0.003, doorX, -H / 2 + doorH / 2));
  const front = mesh(extrudeGeo(fShape, T, { bevel: 0, segs: 1 }), pm);
  front.position.set(0, H / 2, D / 2 - T / 2);
  walls.add(front);
  // sambungan panel (lebar panel ±0.8–1.2 m) di semua sisi + atap
  const seams = [];
  const vSeam = (x, z, ry = 0) => seams.push(at(box(0.008, H - 0.01, 0.003), x, H / 2, z, 0, ry, 0));
  for (const x of [-W / 2 + 0.8, -W / 2 + 1.6]) vSeam(x, -D / 2 - 0.001);
  for (const x of [0.3]) vSeam(x, D / 2 + 0.001); // depan (sebelah kanan bukaan pintu)
  for (const z of [-D / 2 + 0.8, -D / 2 + 1.6]) for (const s of [-1, 1]) vSeam(s * (W / 2 + 0.001), z, PI / 2);
  for (const z of [-0.4, 0.4]) seams.push(at(box(W, 0.003, 0.008), 0, H + 0.001, z));
  walls.add(mergeMeshes(seams.map((m) => { m.material = seamMat; return m; }), seamMat));
  // profil sudut (corner trim) & kick plate keliling
  const trims = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) trims.push(at(box(0.036, H, 0.036), sx * (W / 2 - 0.016), H / 2, sz * (D / 2 - 0.016)));
  for (const sz of [-1, 1]) trims.push(at(box(W + 0.004, 0.036, 0.036), 0, H - 0.016, sz * (D / 2 - 0.016)));
  for (const sx of [-1, 1]) trims.push(at(box(0.036, 0.036, D + 0.004), sx * (W / 2 - 0.016), H - 0.016, 0));
  const kicks = [];
  kicks.push(at(box(W / 2 + doorX - doorW / 2 + 0.0, 0.15, 0.004), (-W / 2 + doorX - doorW / 2) / 2, 0.075, D / 2 + 0.003));
  kicks.push(at(box(W / 2 - doorX - doorW / 2, 0.15, 0.004), (W / 2 + doorX + doorW / 2) / 2, 0.075, D / 2 + 0.003));
  kicks.push(at(box(W, 0.15, 0.004), 0, 0.075, -D / 2 - 0.003));
  for (const s of [-1, 1]) kicks.push(at(box(0.004, 0.15, D), s * (W / 2 + 0.003), 0.075, 0));
  walls.add(mergeMeshes(trims, colorMat(0xdde1e3, 0.45, 0.3)), mergeMeshes(kicks, M.steelSatin));
  // kusen pintu (door frame) stainless; freezer: strip pemanas merah di kusen
  const frame = [];
  frame.push(at(box(doorW + 0.1, 0.05, 0.02), doorX, doorH + 0.025, D / 2 + 0.01));
  for (const s of [-1, 1]) frame.push(at(box(0.05, doorH, 0.02), doorX + s * (doorW / 2 + 0.025), doorH / 2, D / 2 + 0.01));
  walls.add(mergeMeshes(frame, M.steelSatin));
  if (freezer) {
    const heat = colorMat(0xb8321f, 0.5);
    walls.add(at(box(doorW + 0.02, 0.008, 0.004), doorX, doorH + 0.012, D / 2 + 0.021));
    walls.children[walls.children.length - 1].material = heat;
    for (const s of [-1, 1]) { const st = at(box(0.008, doorH, 0.004), doorX + s * (doorW / 2 + 0.012), doorH / 2, D / 2 + 0.021); st.material = heat; walls.add(st); }
    // katup penyeimbang tekanan (pressure relief port)
    walls.add(at(cylZ(0.05, 0.04, M.plasticGrey, 24), 0.75, 1.95, D / 2 + 0.02));
    walls.add(at(cylZ(0.035, 0.01, M.plasticBlack, 24), 0.75, 1.95, D / 2 + 0.045));
  }
  const floor = at(box(W - 2 * T, 0.02, D - 2 * T, colorMat(0x9aa1a6, 0.55, 0.5)), 0, 0.01, 0);
  const ramp = mesh(extrudeGeo(shapeFrom([[0, 0], [0.22, 0], [0, 0.02]]), doorW + 0.1, { bevel: 0, segs: 1 }), M.aluminiumCast);
  ramp.rotation.y = -PI / 2;
  ramp.position.set(doorX, 0, D / 2);
  const sign = labelPlate(label, 0.9, 0.14, freezer ? '#0b4f8a' : '#0b7a5a');
  sign.position.set(doorX, doorH + 0.17, D / 2 + 0.003);
  // panel kontrol: display suhu, saklar lampu, lampu alarm
  const disp = tempDisplay(kit, temp, 0.13, 0.05, freezer ? '#5cc8ff' : '#4dff9a');
  const dispBox = at(rbox(0.26, 0.2, 0.06, 0.012, M.plasticWhite, 2), 0.4, 1.5, D / 2 + 0.03);
  disp.mesh.position.set(0.4, 1.53, D / 2 + 0.0605);
  const ctrls = group(
    at(cylZ(0.008, 0.006, M.ledRed), 0.33, 1.44, D / 2 + 0.062),
    at(cylZ(0.008, 0.006, M.ledGreen), 0.36, 1.44, D / 2 + 0.062),
    at(rbox(0.07, 0.11, 0.02, 0.006, M.plasticWhite, 2), 0.4, 1.2, D / 2 + 0.01),
    at(box(0.018, 0.04, 0.01, M.plasticGrey), 0.4, 1.2, D / 2 + 0.024),
  );
  // unit kondensor di atap + pipa tembaga
  const cu = new THREE.Group();
  const cuW = freezer ? 1.0 : 0.8;
  cu.add(at(rbox(cuW, 0.5, 0.55, 0.015, colorMat(0xd3d7d9, 0.45, 0.4), 2), 0, 0.27, 0));
  for (const x of freezer ? [-0.24, 0.24] : [0]) {
    cu.add(at(cylZ(0.19, 0.01, colorMat(0x1e2124, 0.6), 32), x, 0.29, 0.28));
    const g = at(torus(0.18, 0.006, M.steelDark, 6, 32), x, 0.29, 0.287);
    cu.add(g);
    for (let k = 1; k < 4; k++) cu.add(at(torus(0.045 * k, 0.003, M.steelDark, 4, 28), x, 0.29, 0.287));
    cu.add(at(cylZ(0.035, 0.012, M.steelDark, 16), x, 0.29, 0.29));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cu.add(at(box(0.05, 0.03, 0.05, M.rubber), sx * (cuW / 2 - 0.06), 0.015, sz * 0.22));
  cu.add(tube([V3(cuW / 2 - 0.05, 0.12, -0.1), V3(cuW / 2 + 0.08, 0.12, -0.1), V3(cuW / 2 + 0.1, 0.0, -0.1), V3(cuW / 2 + 0.1, -0.02, -0.1)], 0.01, M.copper, { segs: 20, radial: 8 }));
  cu.add(tube([V3(cuW / 2 - 0.05, 0.08, -0.17), V3(cuW / 2 + 0.05, 0.08, -0.17), V3(cuW / 2 + 0.06, 0.0, -0.17), V3(cuW / 2 + 0.06, -0.02, -0.17)], 0.007, M.copper, { segs: 20, radial: 8 }));
  cu.position.set(0.3, H, -0.4);
  // evaporator di dalam (dekat plafon, dinding belakang)
  const evap = new THREE.Group();
  evap.add(rbox(1.0, 0.3, 0.38, 0.02, M.plasticWhite, 2));
  for (const x of [-0.25, 0.25]) {
    evap.add(at(cylZ(0.11, 0.01, colorMat(0x2a2d30, 0.6), 28), x, 0, 0.19));
    evap.add(at(torus(0.11, 0.006, M.steelDark, 6, 28), x, 0, 0.196));
  }
  evap.position.set(0.2, H - T - 0.2, -D / 2 + T + 0.2);
  const lm = kit.own(M.interiorLight);
  const lamp = at(rbox(0.5, 0.05, 0.12, 0.02, lm, 2), -0.3, H - T - 0.03, 0.4);
  kit.part('room', freezer ? 'Ruang berinsulasi panel tebal, unit kondensor & pengatur suhu' : 'Ruang berinsulasi (panel PU), unit kondensor & pengatur suhu',
    [0, 0, -0.5], walls, floor, ramp, sign, dispBox, disp.mesh, ctrls, cu, evap, lamp);
  // rak & bahan di dalam
  const inside = new THREE.Group();
  const z = -D / 2 + T + 0.3;
  for (let i = 0; i < 4; i++) inside.add(at(wireShelf(1.8, 0.45), 0, 0.3 + i * 0.42, z));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) inside.add(at(cyl(0.012, 0.012, 1.6, M.chrome, 8), sx * 0.9, 0.8, z + sz * 0.22));
  const goods = freezer ? [M.cardboard, colorMat(0xe4eef5, 0.8), M.meat] : [M.cardboard, colorMat(0xe7eef3, 0.5), M.leaf];
  for (let i = 0; i < 12; i++) inside.add(at(rbox(0.3, 0.2, 0.35, 0.01, goods[i % 3], 2), -0.7 + (i % 5) * 0.35, 0.41 + Math.floor(i / 5) * 0.42, z));
  kit.part('shelves', 'Rak penyimpanan bahan', [0, 0, 0.5], inside);
  // pintu engsel berat
  const pivot = new THREE.Group();
  const door = new THREE.Group();
  const dW = doorW + 0.06, dH = doorH + 0.03;
  const dShape = roundedRectShape(dW, dH, 0.01);
  if (!freezer) dShape.holes.push(roundedRectShape(0.3, 0.38, 0.03, 0.06, 0.38));
  door.add(mesh(extrudeGeo(dShape, T * 0.9, { bevel: 0.006, segs: 2 }), pm));
  if (!freezer) {
    door.add(at(mesh(new THREE.PlaneGeometry(0.3, 0.38), M.glassPane), 0.06, 0.38, 0));
    door.add(at(mesh(rectLatheGeo([[0, -0.01], [0, 0.01], [0.018, 0.01]], 0.3, 0.38, 0.03, 3, { capStart: false, capEnd: false }), M.steelSatin), 0.06, 0.38, T * 0.45 + 0.002, PI / 2, 0, 0));
  }
  // kick plate pelat bordes (diamond tread) di bagian bawah pintu
  door.add(at(box(dW - 0.04, 0.3, 0.004, M.aluminiumCast), 0, -dH / 2 + 0.17, T * 0.45 + 0.008));
  // gagang latch berkunci (sisi kanan) + 3 engsel cam-lift (sisi kiri)
  const zf = T * 0.45 + 0.006;
  door.add(at(rbox(0.08, 0.3, 0.045, 0.014, M.chrome, 2), dW / 2 - 0.07, 0.0, zf + 0.02));
  const lever = tube([V3(dW / 2 - 0.07, -0.04, zf + 0.04), V3(dW / 2 - 0.07, -0.05, zf + 0.1), V3(dW / 2 - 0.18, -0.07, zf + 0.11), V3(dW / 2 - 0.3, -0.08, zf + 0.1)], 0.013, M.chrome, { segs: 24, radial: 10 });
  door.add(lever, at(sphere(0.016, M.chrome, 12, 8), dW / 2 - 0.3, -0.08, zf + 0.1));
  door.add(at(cylZ(0.013, 0.012, M.brass, 16), dW / 2 - 0.07, 0.09, zf + 0.045));
  for (const y of [-0.75, 0.0, 0.75]) door.add(at(rbox(0.2, 0.15, 0.04, 0.012, M.chrome, 2), -dW / 2 + 0.08, y, zf + 0.014));
  door.position.x = dW / 2;
  pivot.add(door);
  pivot.position.set(doorX - dW / 2, doorH / 2 + 0.01, D / 2 + T * 0.45 + 0.02);
  kit.part('door', freezer ? 'Pintu berat berinsulasi, engsel & latch (kusen berpemanas)' : 'Pintu tebal berinsulasi, jendela, engsel & latch', [0, 0, 0.6], pivot);
  // bagian engsel yang menempel di dinding/kusen
  const hingeFixed = [];
  for (const y of [-0.75, 0.0, 0.75]) hingeFixed.push(at(rbox(0.12, 0.15, 0.05, 0.012, M.chrome, 2), doorX - doorW / 2 - 0.08, doorH / 2 + 0.01 + y, D / 2 + 0.03));
  kit.root.add(mergeMeshes(hingeFixed, M.chrome));
  // tirai plastik (strip curtain) pada rel di balik bukaan pintu
  const curtain = new THREE.Group();
  const stripMat = M.plasticClear;
  for (let i = 0; i < 8; i++) curtain.add(at(box(0.13, doorH - 0.06, 0.002, stripMat), doorX - doorW / 2 + 0.06 + i * 0.105, doorH / 2 - 0.02, D / 2 - T - 0.02 - (i % 2) * 0.004));
  curtain.add(at(box(doorW + 0.04, 0.04, 0.03, M.steelSatin), doorX, doorH + 0.0, D / 2 - T - 0.02));
  kit.root.add(curtain);
  kit.stateVar('door', 0, 2);
  kit.stateVar('power', 1, 3);
  kit.onApply((s) => {
    pivot.rotation.y = -s.door * 1.5;
    lm.emissiveIntensity = (0.4 + s.door) * 2;
    disp.mat.emissiveIntensity = s.power * 1.3;
  });
  return kit.finish({ holding: true, electric: true, temp: freezer ? 'beku' : 'dingin', walkin: true });
}
export function buildWalkInChiller() { return walkIn('walkin-chiller', 'WALK-IN CHILLER', '+2°C'); }
export function buildWalkInFreezer() { return walkIn('walkin-freezer', 'WALK-IN FREEZER', '-18°C'); }

/* ======================================================== SHOWCASE WARMER == */
export function buildShowcaseWarmer() {
  const kit = new Kit('showcase-warmer');
  const W = 0.72, D = 0.5, baseH = 0.12, gH = 0.52;
  const base = at(rbox(W, baseH, D, 0.012, M.enamelBlack, 2), 0, baseH / 2, 0);
  const top = at(rbox(W, 0.08, D, 0.012, M.enamelBlack, 2), 0, baseH + gH + 0.04, 0);
  const disp = tempDisplay(kit, '65°C', 0.08, 0.028, '#ff7a2a');
  disp.mesh.position.set(W / 2 - 0.08, baseH / 2, D / 2 + 0.002);
  const kb = at(knob(0.016, 0.016, M.plasticGrey, colorMat(0xffffff)), W / 2 - 0.18, baseH / 2, D / 2 + 0.002);
  const frame = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) frame.push(at(box(0.016, gH, 0.016, M.enamelBlack), sx * (W / 2 - 0.008), baseH + gH / 2, sz * (D / 2 - 0.008)));
  const panes = new THREE.Group();
  panes.add(at(plane(W - 0.02, gH), 0, baseH + gH / 2, D / 2 - 0.008));
  panes.add(at(plane(W - 0.02, gH), 0, baseH + gH / 2, -D / 2 + 0.008));
  for (const s of [-1, 1]) panes.add(at(plane(D - 0.02, gH), s * (W / 2 - 0.008), baseH + gH / 2, 0, 0, PI / 2));
  kit.part('body', 'Kabinet kaca & alas', [0, -0.08, 0], base, top, disp.mesh, kb, mergeMeshes(frame, M.enamelBlack), panes);
  const lampMat = kit.own(M.heater);
  lampMat.emissive = new THREE.Color(0xff8a2a);
  const lamps = new THREE.Group();
  for (const s of [-1, 1]) lamps.add(at(cylX(0.012, W - 0.1, lampMat), 0, baseH + gH - 0.02, s * 0.1));
  kit.part('heater', 'Lampu/elemen penghangat', [0, 0.15, 0], lamps);
  const trays = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const y = baseH + 0.02 + i * 0.24;
    trays.add(at(rbox(W - 0.06, 0.01, D - 0.08, 0.004, M.steelPolished, 1), 0, y, 0));
    for (let k = 0; k < 6; k++) trays.add(at(friedChicken(), -0.22 + (k % 3) * 0.22, y + 0.03, k < 3 ? -0.09 : 0.09));
  }
  kit.part('trays', 'Rak & makanan yang digoreng', [0, 0, 0.35], trays);
  const glow = new THREE.PointLight(0xff8a3a, 0, 0.8);
  glow.position.set(0, baseH + gH - 0.05, 0);
  kit.root.add(glow);
  kit.stateVar('power', 1, 2);
  kit.onApply((s) => {
    lampMat.emissiveIntensity = s.power * 2.2;
    glow.intensity = s.power * 0.6;
    disp.mat.emissiveIntensity = s.power * 1.3;
  });
  return kit.finish({ holding: true, electric: true, hot: true, temp: 'hangat' });
}

/* ========================================================= WARMER CABINET == */
export function buildWarmerCabinet() {
  const kit = new Kit('warmer-cabinet');
  const W = 0.72, H = 1.72, D = 0.78;
  const body = new THREE.Group();
  body.add(at(rbox(W, 0.03, D, 0.008, M.steel, 2), 0, H - 0.015, 0));
  body.add(at(rbox(W, 0.03, D, 0.008, M.steel, 2), 0, 0.13, 0));
  for (const s of [-1, 1]) body.add(at(rbox(0.03, H - 0.13, D, 0.008, M.steel, 2), s * (W / 2 - 0.015), (H + 0.13) / 2, 0));
  body.add(at(box(W - 0.04, H - 0.13, 0.03, M.steel), 0, (H + 0.13) / 2, -D / 2 + 0.015));
  const head = at(rbox(W, 0.2, D, 0.01, M.steel, 2), 0, H - 0.1, 0);
  const sign = labelPlate('HEATED HOLDING', 0.36, 0.06, '#8a2a0b');
  sign.position.set(-0.08, H - 0.1, D / 2 + 0.002);
  const disp = tempDisplay(kit, '70°C', 0.09, 0.032, '#ff7a2a');
  disp.mesh.position.set(0.22, H - 0.1, D / 2 + 0.002);
  const casters = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(caster(0.045, M.steelDark, M.rubber), sx * (W / 2 - 0.08), 0, sz * (D / 2 - 0.08))));
  const bumper = mesh(rectLatheGeo([[0.015, 0.12], [0.015, 0.16]], W, D, 0.03, 3, { capStart: false, capEnd: false }), M.rubber);
  kit.part('body', 'Kabinet berpemanas & pengatur suhu', [0, 0, -0.2], body, head, sign, disp.mesh, bumper, ...casters);
  const rails = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    for (const s of [-1, 1]) rails.add(at(box(0.02, 0.01, D - 0.12, M.steelPolished), s * (W / 2 - 0.045), 0.3 + i * 0.18, 0));
    if (i % 2 === 0) rails.add(at(gnPan(0.53, 0.32, i % 4 ? M.meatCooked : M.fried), 0, 0.25 + i * 0.18, 0));
  }
  kit.part('rails', 'Rel rak & GN pan berisi makanan', [0, 0, 0.55], rails);
  const pivot = new THREE.Group();
  const door = new THREE.Group();
  const shape = roundedRectShape(W - 0.02, H - 0.36, 0.01);
  shape.holes.push(roundedRectShape(W - 0.2, H - 0.7, 0.01));
  door.add(mesh(extrudeGeo(shape, 0.05, { bevel: 0.003, segs: 1 }), M.steel));
  door.add(mesh(new THREE.PlaneGeometry(W - 0.19, H - 0.69), M.glassPane));
  door.add(at(rbox(0.04, 0.36, 0.05, 0.01, M.steelPolished, 2), W / 2 - 0.06, 0, 0.05));
  door.position.x = (W - 0.02) / 2;
  pivot.add(door);
  pivot.position.set(-W / 2 + 0.01, (H - 0.36) / 2 + 0.15, D / 2 + 0.03);
  kit.part('door', 'Pintu berjendela', [0, 0, 0.35], pivot);
  kit.stateVar('door', 0, 2.5);
  kit.stateVar('power', 1, 3);
  kit.onApply((s) => {
    pivot.rotation.y = -s.door * 1.6;
    disp.mat.emissiveIntensity = s.power * 1.3;
  });
  return kit.finish({ holding: true, electric: true, hot: true, temp: 'hangat' });
}

/* ============================================================= STEAM TABLE == */
export function buildSteamTable() {
  const kit = new Kit('steam-table');
  const W = 1.55, D = 0.72, H = 0.86;
  const cab = new THREE.Group();
  cab.add(mesh(rectLatheGeo([[0, 0.12], [0, H - 0.02], [-0.005, H]], W, D, 0.012, 3, { capEnd: false }), M.steel));
  cab.add(...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(bulletFoot(0.12, 0.024, M.steelSatin), sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06)))));
  for (let i = 0; i < 3; i++) {
    cab.add(at(rbox(W / 3 - 0.04, H - 0.32, 0.012, 0.006, M.steelSatin, 2), -W / 3 + i * (W / 3), 0.44, D / 2 + 0.006));
    cab.add(at(cylX(0.008, 0.16, M.steelPolished), -W / 3 + i * (W / 3), H - 0.24, D / 2 + 0.03));
  }
  const knobs = [];
  for (let i = 0; i < 4; i++) {
    const k = at(knob(0.018, 0.018, M.plasticBlack, colorMat(0xffffff)), -0.54 + i * 0.36, H - 0.08, D / 2 + 0.008);
    knobs.push(k);
  }
  // meja atas berlubang 4 (well) — food pan bertumpu pada bibirnya
  const topShape = roundedRectShape(W, D, 0.012);
  for (let i = 0; i < 4; i++) topShape.holes.push(roundedRectShape(0.3, 0.49, 0.02, -0.54 + i * 0.36, 0));
  const top = mesh(extrudeGeo(topShape, 0.012, { bevel: 0.002, segs: 1 }), M.steelSatin);
  top.rotation.x = -PI / 2;
  top.position.y = H + 0.006;
  const wellMat = colorMat(0x8d959b, 0.35, 0.9);
  for (let i = 0; i < 4; i++) {
    const wl = mesh(trayGeo({ w: 0.3, d: 0.49, h: 0.2, r: 0.02, flare: 0, wall: 0.0015, lip: 0.0, corner: 0.02 }), wellMat);
    wl.position.set(-0.54 + i * 0.36, H - 0.2, 0);
    cab.add(wl);
  }
  const ledge = at(rbox(W, 0.025, 0.24, 0.006, colorMat(0xf2f2ee, 0.6), 2), 0, H - 0.04, D / 2 + 0.12);
  for (const s of [-1, 1]) ledge.add(at(box(0.03, 0.04, 0.2, M.steelSatin), s * 0.6, -0.03, 0));
  kit.part('cabinet', 'Meja kabinet, kenop & papan landasan', [0, -0.15, 0], cab, top, ledge, ...knobs);
  const wells = new THREE.Group();
  const foods = [M.soup, M.meatCooked, M.leaf, M.carrot];
  for (let i = 0; i < 4; i++) wells.add(at(gnPan(0.32, 0.51, foods[i]), -0.54 + i * 0.36, H + 0.012 - 0.1, 0));
  kit.part('wells', 'Bak air panas (well) & food pan', [0, 0.2, 0], wells);
  const guard = new THREE.Group();
  for (const x of [-0.72, 0, 0.72]) guard.add(at(cyl(0.012, 0.012, 0.42, M.steelPolished, 12), x, H + 0.21, -0.02));
  const glass = mesh(new THREE.BoxGeometry(W - 0.06, 0.006, 0.42), M.glassPane);
  glass.position.set(0, H + 0.43, 0.05);
  glass.rotation.x = 0.35;
  guard.add(glass, at(cylX(0.012, W - 0.04, M.steelPolished), 0, H + 0.42, -0.02));
  kit.part('guard', 'Pelindung kaca (sneeze guard)', [0, 0.25, -0.1], guard);
  const steam = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const sp = steamPuffs(6, kit.own(M.steam), 0.08);
    sp.position.set(-0.54 + i * 0.36, H + 0.02, 0);
    steam.add(sp);
  }
  kit.root.add(steam);
  kit.stateVar('power', 0, 1.2);
  kit.onApply((s, dt, t) => {
    steam.children.forEach((sp, i) => steamTick(sp, t + i * 0.3, s.power, 0.2, 0.03));
    knobs.forEach((k) => { k.rotation.z = -s.power * 1.6; });
  });
  return kit.finish({ holding: true, electric: true, hot: true, temp: 'hangat' });
}

/* ============================================================ CHAFING DISH == */
export function buildChafingDish() {
  const kit = new Kit('chafing-dish');
  const W = 0.6, D = 0.36;
  const stand = new THREE.Group();
  for (const sx of [-1, 1]) {
    stand.add(tube([V3(sx * 0.3, 0, -0.17), V3(sx * 0.27, 0.12, -0.16), V3(sx * 0.28, 0.2, -0.15)], 0.007, M.steelPolished, { segs: 16, radial: 8 }));
    stand.add(tube([V3(sx * 0.3, 0, 0.17), V3(sx * 0.27, 0.12, 0.16), V3(sx * 0.28, 0.2, 0.15)], 0.007, M.steelPolished, { segs: 16, radial: 8 }));
    stand.add(tube([V3(sx * 0.28, 0.2, -0.15), V3(sx * 0.29, 0.2, 0), V3(sx * 0.28, 0.2, 0.15)], 0.007, M.steelPolished, { segs: 16, radial: 8 }));
  }
  for (const sz of [-1, 1]) stand.add(tube([V3(-0.28, 0.2, sz * 0.15), V3(0.28, 0.2, sz * 0.15)], 0.007, M.steelPolished, { segs: 4, radial: 8 }));
  const fuels = new THREE.Group();
  const flames = new THREE.Group();
  const fm = kit.own(M.flame);
  for (const x of [-0.13, 0.13]) {
    fuels.add(at(cyl(0.035, 0.035, 0.06, M.steelPolished, 20), x, 0.06, 0));
    fuels.add(at(cyl(0.032, 0.032, 0.004, M.plasticBlack, 20), x, 0.092, 0));
    const f = mesh(new THREE.ConeGeometry(0.018, 0.06, 10, 1, true), fm);
    f.position.set(x, 0.122, 0);
    flames.add(f);
    const holder = at(torus(0.037, 0.003, M.steelPolished, 6, 20), x, 0.09, 0);
    holder.rotation.x = PI / 2;
    fuels.add(holder);
  }
  kit.root.add(flames);
  kit.part('stand', 'Rangka penyangga & tempat bahan bakar', [0, -0.15, 0], stand, fuels);
  const water = mesh(trayGeo({ w: W - 0.06, d: D - 0.04, h: 0.1, r: 0.03, flare: 0, wall: 0.0015, lip: 0.012 }), M.steelPolished);
  water.position.y = 0.16;
  kit.part('waterpan', 'Wadah air panas (water pan)', [0, 0, 0.0], water);
  const food = group(gnPan(W - 0.1, D - 0.08, M.meatCooked));
  food.position.y = 0.19;
  kit.part('foodpan', 'Wadah makanan (food pan)', [0, 0.15, 0], food);
  const lidPivot = new THREE.Group();
  // tutup roll-top: setengah silinder (melintang sumbu X) dengan dinding ujung, berengsel di belakang
  const lW = W - 0.06, lD = D - 0.04, lH = 0.12;
  const shell = mesh(new THREE.CylinderGeometry(lD / 2, lD / 2, lW, 48, 1, true, -PI / 2, PI), M.steelPolished);
  shell.geometry.rotateZ(PI / 2);
  shell.material = M.steelPolished;
  shell.scale.set(1, lH / (lD / 2), 1);
  const capGeo = new THREE.CircleGeometry(lD / 2, 32, 0, PI);
  const caps = [-1, 1].map((sx) => {
    const c = mesh(capGeo, M.steelSatin);
    c.rotation.set(0, sx * PI / 2, 0);
    c.scale.set(1, lH / (lD / 2), 1);
    c.position.x = sx * lW / 2;
    return c;
  });
  const rim = mesh(rectLatheGeo([[0, -0.006], [0, 0.006]], lW + 0.004, lD + 0.004, 0.004, 1, { capStart: false, capEnd: false }), M.steelPolished);
  const lid = group(shell, ...caps, rim);
  lid.position.z = lD / 2;
  const handle = at(group(tube([V3(-0.08, 0, 0), V3(-0.07, 0.03, 0), V3(0.07, 0.03, 0), V3(0.08, 0, 0)], 0.007, M.steelPolished, { segs: 20, radial: 8 })), 0, lH * 0.72, lD / 2 + lD * 0.33);
  handle.rotation.x = 0.75;
  lidPivot.add(lid, handle);
  lidPivot.position.set(0, 0.268, -lD / 2);
  // engsel & rel belakang
  stand.add(at(cylX(0.008, lW, M.steelPolished), 0, 0.268, -lD / 2));
  kit.part('lid', 'Tutup (lid) dengan pegangan', [0, 0.25, 0], lidPivot);
  kit.stateVar('power', 0, 1.5);
  kit.stateVar('lid', 0, 2.5);
  kit.stateVar('fill', 1, 3);
  kit.onApply((s, dt, t) => {
    fm.opacity = s.power * 0.75;
    flames.visible = s.power > 0.02;
    flames.children.forEach((f, i) => { f.scale.y = 0.8 + Math.sin(t * 12 + i) * 0.15; });
    lidPivot.rotation.x = -s.lid * 1.7;
    food.children[0].children[1] && (food.children[0].children[1].visible = s.fill > 0.05);
  });
  return kit.finish({ holding: true, hot: true, temp: 'hangat' });
}
