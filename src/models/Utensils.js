/**
 * Kitchen utensils (alat kecil, dipakai dengan tangan):
 * Peeler, Grater, Ladle, Skimmer/Spider, Frying Spatula (sutil), Conical Strainer, Strainer,
 * Balloon Whisk, Ice Cream Scoop, Cutting Board, Rolling Pin, Measuring Cup, Cobek & Ulekan.
 * Alat bergagang panjang dibuat memanjang pada sumbu X (bagian kerja di +X).
 */
import * as THREE from 'three';
import { M, colorMat } from './materials.js';
import {
  Kit, mesh, at, group, box, rbox, cyl, sphere, torus, lathe, latheGeo, vessel, shapeFrom, extrudeGeo,
  roundedRectShape, tube, tubeGeo, capEnds, deform, PI, TAU, V3, arcPts, lerp, clamp,
} from './helpers.js';

/** Klon material dengan pengulangan tekstur alpha khusus. */
function perfMat(kit, base, rx, ry) {
  const m = kit.own(base);
  m.alphaMap = base.alphaMap.clone();
  m.alphaMap.repeat.set(rx, ry);
  m.alphaMap.needsUpdate = true;
  return m;
}

/* ---------------- Peeler ---------------- */
export function buildPeeler() {
  const kit = new Kit('peeler');
  // gagang plastik dengan karet
  const hs = shapeFrom([
    ...arcPts(-0.095, 0, 0.011, PI / 2, PI * 1.5, 10),
    [-0.02, -0.0095], [0, -0.007], [0, 0.007], [-0.02, 0.0095],
  ]);
  const handle = mesh(extrudeGeo(hs, 0.008, { bevel: 0.0035, segs: 4 }), M.plasticRed);
  const grip = mesh(extrudeGeo(roundedRectShape(0.05, 0.016, 0.006, -0.055, 0), 0.0155, { bevel: 0.0012, segs: 2 }), M.silicone);
  const hole = torus(0.0045, 0.0012, M.silicone, 8, 20);
  hole.position.set(-0.092, 0, 0);
  kit.part('handle', 'Gagang plastik & pegangan karet', [-0.04, 0, 0], handle, grip);
  // lengan Y dari kawat baja
  const arms = new THREE.Group();
  for (const s of [-1, 1]) {
    const pts = [V3(-0.004, s * 0.004, 0), V3(0.012, s * 0.016, 0), V3(0.026, s * 0.03, 0), V3(0.034, s * 0.034, 0)];
    arms.add(tube(pts, 0.0022, M.steelPolished, { segs: 24, radial: 8 }));
    arms.add(at(sphere(0.0028, M.steelPolished, 10, 8), 0.034, s * 0.034, 0));
  }
  kit.part('frame', 'Rangka Y (lengan baja)', [0.01, 0, 0.03], arms);
  // bilah dengan celah
  const blade = mesh(extrudeGeo(shapeFrom(
    [[-0.004, -0.033], [0.006, -0.033], [0.006, 0.033], [-0.004, 0.033]],
    [[[-0.0015, -0.025], [0.002, -0.025], [0.002, 0.025], [-0.0015, 0.025]]],
  ), 0.0008, { bevel: 0.0002, segs: 1 }), M.blade);
  blade.position.set(0.034, 0, 0);
  blade.rotation.y = 0.5;
  kit.part('blade', 'Bilah pengupas bercelah', [0.04, 0, 0], blade);
  return kit.finish();
}

/* ---------------- Grater (parutan kotak) ---------------- */
export function buildGrater() {
  const kit = new Kit('grater');
  const h = 0.23;
  const body = mesh(new THREE.CylinderGeometry(0.052, 0.068, h, 4, 1, true), M.graterMetal);
  body.rotation.y = PI / 4;
  body.position.y = h / 2 + 0.008;
  kit.part('body', 'Badan parutan 4 sisi (kasar, halus, sedang, pengiris)', [0, 0, 0], body);
  // bingkai atas
  const top = mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.008, 4, 1, true), M.steelPolished);
  top.rotation.y = PI / 4;
  top.position.y = h + 0.006;
  // gagang plastik
  const hp = [V3(-0.032, 0, 0), V3(-0.03, 0.035, 0), V3(-0.012, 0.055, 0), V3(0.012, 0.055, 0), V3(0.03, 0.035, 0), V3(0.032, 0, 0)];
  const handle = tube(hp, 0.0065, M.plasticBlack, { segs: 40, radial: 12 });
  handle.position.y = h + 0.008;
  kit.part('handle', 'Gagang atas', [0, 0.08, 0], top, handle);
  // kaki karet
  const foot = mesh(new THREE.CylinderGeometry(0.07, 0.071, 0.01, 4, 1, true), M.rubber);
  foot.rotation.y = PI / 4;
  foot.position.y = 0.005;
  kit.part('base', 'Bingkai bawah karet anti-selip', [0, -0.05, 0], foot);
  return kit.finish();
}

/* ---------------- Ladle ---------------- */
export function buildLadle() {
  const kit = new Kit('ladle');
  const R = 0.045;
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const a = -PI / 2 + (i / 14) * (PI / 2);
    pts.push([Math.cos(a) * R, R * 0.85 + Math.sin(a) * R * 0.85]);
  }
  const inner = pts.slice().reverse().map(([x, y]) => [Math.max(x - 0.0012, 0), y + 0.0012]);
  const bowl = lathe([...pts, [R + 0.0012, R * 0.85 + 0.001], ...inner], M.steelPolished, 48);
  bowl.position.x = 0.27;
  kit.part('bowl', 'Mangkuk sendok (bowl)', [0.05, 0, 0], bowl);
  const hp = [
    V3(0.27 - R + 0.002, R * 0.8, 0), V3(0.215, R * 1.5, 0), V3(0.19, 0.11, 0), V3(0.15, 0.125, 0),
    V3(0.0, 0.16, 0), V3(-0.06, 0.175, 0), V3(-0.08, 0.172, 0), V3(-0.09, 0.158, 0),
  ];
  // gagang pelat pipih (stamped) berpenampang oval, ujung berkait untuk digantung
  const handle = group(tube(hp, 0.0032, M.steelPolished, { segs: 90, radial: 12 }), ...capEnds(hp, 0.0032, M.steelPolished));
  handle.scale.z = 2.8;
  const hang = at(torus(0.006, 0.0018, M.steelPolished, 6, 20), -0.072, 0.168, 0, PI / 2, 0, 0);
  kit.part('handle', 'Gagang panjang berkait', [-0.03, 0.04, 0], handle, hang);
  return kit.finish();
}

/* ---------------- Skimmer / Spider ---------------- */
export function buildSpider() {
  const kit = new Kit('spider');
  const R = 0.078, D = 0.028;
  const dishY = (r) => D * (r / R) * (r / R);
  // kawat spiral anyaman
  const spiral = [];
  const turns = 11, steps = turns * 48;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, r = 0.004 + t * (R - 0.006), a = t * turns * TAU;
    spiral.push(V3(Math.cos(a) * r, dishY(r), Math.sin(a) * r));
  }
  const basket = new THREE.Group();
  basket.add(mesh(tubeGeo(spiral, 0.0009, { segs: steps, radial: 5, tension: 0.2 }), M.steelPolished));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU, sp = [];
    for (let i = 0; i <= 8; i++) { const r = (i / 8) * R; sp.push(V3(Math.cos(a) * r, dishY(r), Math.sin(a) * r)); }
    basket.add(tube(sp, 0.0011, M.steelPolished, { segs: 16, radial: 5 }));
  }
  const rim = torus(R, 0.0022, M.steelPolished, 8, 64);
  rim.rotation.x = PI / 2;
  rim.position.y = D;
  basket.add(rim);
  basket.position.x = 0.2;
  kit.part('basket', 'Keranjang kawat spiral', [0.06, 0, 0], basket);
  // kawat leher
  const neck = new THREE.Group();
  for (const s of [-1, 1]) {
    neck.add(tube([V3(0.2 - R, D, s * 0.02), V3(0.1, D + 0.012, s * 0.006), V3(0.07, D + 0.02, s * 0.002), V3(0.04, D + 0.028, 0)], 0.0018, M.steelPolished, { segs: 30, radial: 6 }));
  }
  kit.part('neck', 'Kawat leher', [0, 0.03, 0], neck);
  // gagang bambu dengan ruas
  const bam = cyl(0.0085, 0.0095, 0.24, M.bamboo, 20);
  bam.rotation.z = PI / 2 - 0.08;
  bam.position.set(-0.08, D + 0.038, 0);
  const nodes = new THREE.Group();
  for (const x of [-0.02, -0.11, -0.19]) {
    const n = torus(0.0094, 0.0012, M.bamboo, 6, 20);
    n.rotation.y = PI / 2;
    n.position.set(x, D + 0.038 - (x + 0.08) * 0.08, 0);
    nodes.add(n);
  }
  kit.part('handle', 'Gagang bambu', [-0.05, 0, 0], bam, nodes);
  return kit.finish();
}

/* ---------------- Frying spatula (sutil wajan) ---------------- */
export function buildSpatula() {
  const kit = new Kit('spatula');
  const outline = [[0, -0.022], [0.07, -0.052], [0.105, -0.05], [0.112, 0], [0.105, 0.05], [0.07, 0.052], [0, 0.022]];
  const geo = extrudeGeo(shapeFrom(outline), 0.0012, { bevel: 0.0004, segs: 1, curveSegments: 6 });
  // lengkung melintang (scoop) & ujung depan menipis
  deform(geo, (x, y, z) => [x, y, z + 0.18 * y * y + 0.06 * Math.max(0, x - 0.05) ** 2]);
  const blade = mesh(geo, M.steelPolished);
  blade.rotation.x = -PI / 2; // berbaring
  blade.position.set(0.12, 0.004, 0);
  // tepi samping sedikit terangkat menjadi wadah sutil
  kit.part('blade', 'Daun sutil cekung', [0.05, 0, 0], blade);
  const hp = [V3(0.125, 0.006, 0), V3(0.1, 0.02, 0), V3(0.075, 0.05, 0), V3(0.0, 0.08, 0), V3(-0.08, 0.1, 0)];
  const shaft = tube(hp, 0.005, M.steelPolished, { segs: 40, radial: 12 });
  const rivet = at(sphere(0.004, M.steelPolished, 10, 8), 0.125, 0.006, 0);
  kit.part('shaft', 'Leher & batang', [0, 0.03, 0], shaft, rivet);
  const grip = lathe([[0, 0], [0.011, 0], [0.012, 0.02], [0.0115, 0.12], [0.009, 0.135], [0, 0.137]], M.wood, 24);
  const gripG = group(grip);
  const dir = V3(-0.08, 0.1, 0).sub(V3(0, 0.08, 0)).normalize();
  gripG.quaternion.setFromUnitVectors(V3(0, 1, 0), dir);
  gripG.position.set(-0.05, 0.094, 0);
  const ring = torus(0.008, 0.0015, M.steelPolished, 8, 20);
  ring.position.copy(gripG.position).addScaledVector(dir, 0.145);
  kit.part('handle', 'Gagang kayu tahan panas', [-0.05, 0, 0], gripG, ring);
  return kit.finish();
}

/* ---------------- Conical strainer (chinois) ---------------- */
export function buildConicalStrainer() {
  const kit = new Kit('conical-strainer');
  const R = 0.095, D = 0.2;
  const cone = lathe([[0.003, 0], [R * 0.3, D * 0.3], [R * 0.7, D * 0.7], [R, D]], perfMat(kit, M.perfHoles, 10, 6), 48);
  const tip = sphere(0.006, M.steelPolished, 12, 8);
  tip.position.y = 0.002;
  kit.part('cone', 'Kerucut saringan berlubang halus', [0, -0.06, 0], cone, tip);
  const band = vessel({ rB: R + 0.001, rT: R + 0.002, h: 0.022, wall: 0.0012, base: 0, corner: 0.0001 }, M.steelPolished, 48);
  band.children[0].geometry = latheGeo([[R - 0.001, 0], [R + 0.001, 0], [R + 0.002, 0.022], [R + 0.004, 0.024], [R, 0.024]], 48);
  band.position.y = D - 0.012;
  const rimRing = torus(R + 0.003, 0.0025, M.steelPolished, 8, 56);
  rimRing.rotation.x = PI / 2;
  rimRing.position.y = D + 0.012;
  kit.part('rim', 'Bibir penguat', [0, 0.02, 0], band, rimRing);
  // gagang panjang & kait penahan
  const hp = [V3(-R - 0.002, D + 0.004, 0), V3(-R - 0.05, D + 0.02, 0), V3(-R - 0.2, D + 0.05, 0)];
  const handle = tube([V3(-R - 0.002, D + 0.006, 0), V3(-R - 0.04, D + 0.014, 0), V3(-R - 0.19, D + 0.04, 0)], 0.0038, M.steelPolished, { segs: 30, radial: 12 });
  handle.scale.z = 2.6;
  const hole = torus(0.006, 0.0015, M.steelPolished, 6, 18);
  hole.rotation.x = PI / 2;
  hole.position.set(-R - 0.197, D + 0.041, 0);
  const hook = tube([V3(R, D + 0.008, 0), V3(R + 0.025, D + 0.016, 0), V3(R + 0.03, D + 0.002, 0)], 0.0025, M.steelPolished, { segs: 16, radial: 8 });
  kit.part('handle', 'Gagang & kait penahan panci', [-0.05, 0, 0], handle, hole, hook);
  void hp;
  return kit.finish();
}

/* ---------------- Strainer (saringan kecil) ---------------- */
export function buildStrainer() {
  const kit = new Kit('strainer');
  const R = 0.06;
  const pts = arcPts(0, R, R, -PI / 2, 0, 16);
  const bowl = lathe(pts, perfMat(kit, M.meshCoarse, 3, 1.2), 64);
  kit.part('mesh', 'Jaring kawat halus', [0, -0.04, 0], bowl);
  const rim = torus(R, 0.0024, M.steelPolished, 8, 56);
  rim.rotation.x = PI / 2;
  rim.position.y = R;
  kit.part('rim', 'Bingkai bibir', [0, 0.01, 0], rim);
  const hp = [V3(-R, R, -0.012), V3(-R - 0.05, R + 0.012, -0.004), V3(-R - 0.15, R + 0.03, 0)];
  const hp2 = [V3(-R, R, 0.012), V3(-R - 0.05, R + 0.012, 0.004), V3(-R - 0.15, R + 0.03, 0)];
  const handle = group(tube(hp, 0.0025, M.steelPolished, { segs: 20, radial: 8 }), tube(hp2, 0.0025, M.steelPolished, { segs: 20, radial: 8 }));
  const grip = cyl(0.007, 0.0075, 0.09, M.plasticBlack, 16);
  grip.rotation.z = PI / 2 - 0.12;
  grip.position.set(-R - 0.19, R + 0.035, 0);
  const ear = tube([V3(R - 0.004, R, 0), V3(R + 0.02, R + 0.005, 0), V3(R + 0.024, R - 0.006, 0)], 0.0022, M.steelPolished, { segs: 12, radial: 6 });
  kit.part('handle', 'Gagang & kait', [-0.05, 0, 0], handle, grip, ear);
  return kit.finish();
}

/* ---------------- Balloon whisk ---------------- */
export function buildWhisk() {
  const kit = new Kit('whisk');
  const L = 0.19, Rm = 0.036, n = 8;
  const wires = new THREE.Group();
  for (let i = 0; i < n / 2; i++) {
    const th = (i / (n / 2)) * PI;
    const pts = [];
    for (let k = 0; k <= 40; k++) {
      const s = k / 40; // 0 → 1 (kiri pangkal → ujung → kanan pangkal)
      const u = s < 0.5 ? s * 2 : (1 - s) * 2; // posisi sepanjang sumbu
      const side = s < 0.5 ? 1 : -1;
      const prof = Math.pow(Math.sin(PI * Math.pow(u, 0.75) * 0.5 + 0.0001), 1) * Math.pow(Math.sin(PI * u * 0.999), 0.5);
      const r = Rm * prof + 0.004 * (1 - u);
      const x = u * L;
      pts.push(V3(x, side * r * Math.cos(th), side * r * Math.sin(th)));
    }
    wires.add(tube(pts, 0.00085, M.steelPolished, { segs: 90, radial: 5 }));
  }
  wires.position.x = 0.004;
  kit.part('wires', 'Kawat pengocok (balon)', [0.05, 0, 0], wires);
  const hp = [[0, -0.115], [0.0085, -0.115], [0.0115, -0.1], [0.0125, -0.03], [0.009, -0.005], [0.006, 0.006], [0, 0.006]];
  const handle = lathe(hp, M.steelPolished, 32);
  handle.rotation.z = -PI / 2;
  const loop = torus(0.007, 0.0016, M.steelPolished, 8, 20);
  loop.position.x = -0.122;
  kit.part('handle', 'Gagang berongga', [-0.04, 0, 0], handle, loop);
  return kit.finish();
}

/* ---------------- Ice cream scoop ---------------- */
export function buildIceCreamScoop() {
  const kit = new Kit('ice-cream-scoop');
  const R = 0.029;
  // mangkuk setengah bola, bukaan menghadap ke atas (+Y)
  const outer = arcPts(0, R, R, -PI / 2, 0, 14);
  const inner = outer.slice().reverse().map(([x, y]) => [Math.max(x - 0.0016, 0), y + 0.0008]);
  const bowl = lathe([...outer, [R + 0.0006, R + 0.0008], ...inner], M.steelPolished, 40);
  bowl.position.set(0.03, 0, 0);
  // pengikis (scraper) lengkung di dalam mangkuk
  const scraper = torus(R * 0.9, 0.0011, M.steelPolished, 6, 24, PI);
  scraper.rotation.set(0, 0, PI);
  scraper.position.set(0.03, R + 0.0005, 0);
  const pivot = cyl(0.003, 0.003, 0.006, M.steelPolished, 12);
  pivot.position.set(0.03, R * 0.25, 0);
  kit.part('bowl', 'Mangkuk scoop & pengikis', [0.04, 0, 0], bowl, scraper, pivot);
  // gagang aluminium cor, menyatu di sisi mangkuk dan sedikit naik
  const hs = shapeFrom([[0.004, 0.0065], [-0.03, 0.0055], [-0.12, 0.0085], [-0.132, 0.0045], [-0.132, -0.0045], [-0.12, -0.0085], [-0.03, -0.0055], [0.004, -0.0065]]);
  const handle = mesh(extrudeGeo(hs, 0.006, { bevel: 0.0035, segs: 4 }), M.aluminiumCast);
  handle.rotation.x = PI / 2;
  handle.rotation.y = 0.12;
  handle.position.set(0.003, R * 0.85, 0);
  kit.part('handle', 'Gagang aluminium', [-0.04, 0, 0], handle);
  // tuas ibu jari (trigger) menuju poros pengikis
  const lever = tube([V3(0.03, R + 0.004, 0), V3(0.012, R + 0.014, 0), V3(-0.02, R + 0.02, 0), V3(-0.05, R + 0.02, 0), V3(-0.062, R + 0.012, 0)], 0.0028, M.steelPolished, { segs: 24, radial: 8 });
  lever.scale.z = 1.8;
  // bantalan ibu jari bergerigi
  const pad = at(rbox(0.022, 0.006, 0.014, 0.003, M.steelSatin, 2), -0.05, R + 0.022, 0, 0, 0, -0.05);
  kit.part('lever', 'Tuas pelepas (trigger)', [0, 0.03, 0], lever, pad);
  return kit.finish();
}

/* ---------------- Cutting board ---------------- */
export function buildCuttingBoard() {
  const kit = new Kit('cutting-board');
  const board = rbox(0.45, 0.03, 0.3, 0.008, M.wood, 3);
  board.position.y = 0.015;
  const groove = new THREE.Mesh(
    new THREE.ShapeGeometry((() => {
      const s = roundedRectShape(0.41, 0.26, 0.02);
      s.holes.push(roundedRectShape(0.4, 0.25, 0.016));
      return s;
    })()),
    colorMat(0x5a3415, 0.8),
  );
  groove.rotation.x = -PI / 2;
  groove.position.y = 0.0302;
  groove.receiveShadow = true;
  kit.part('board', 'Papan kayu keras dengan alur sari', [0, 0, 0], board, groove);
  return kit.finish();
}

/* ---------------- Rolling pin ---------------- */
export function buildRollingPin() {
  const kit = new Kit('rolling-pin');
  const barrel = lathe([[0, -0.125], [0.024, -0.125], [0.026, -0.12], [0.026, 0.12], [0.024, 0.125], [0, 0.125]], M.woodLight, 40);
  barrel.rotation.z = PI / 2;
  barrel.position.y = 0.026;
  kit.part('barrel', 'Silinder penggiling', [0, 0.03, 0], barrel);
  const handles = new THREE.Group();
  for (const s of [-1, 1]) {
    const h = lathe([[0, 0], [0.008, 0], [0.012, 0.015], [0.014, 0.06], [0.011, 0.075], [0, 0.077]], M.woodLight, 24);
    h.rotation.z = -s * PI / 2;
    h.position.set(s * 0.127, 0.026, 0);
    handles.add(h);
  }
  kit.part('handles', 'Pegangan kiri & kanan', [0, -0.02, 0], handles);
  return kit.finish();
}

/* ---------------- Measuring cup (gelas ukur plastik) ---------------- */
export function buildMeasuringCup() {
  const kit = new Kit('measuring-cup');
  const jug = vessel({ rB: 0.042, rT: 0.05, h: 0.13, wall: 0.0022, base: 0.004, corner: 0.008 }, M.plasticClear, 72);
  // cerat (spout): bibir ditarik keluar di sisi +X
  deform(jug.children[0].geometry, (x, y, z) => {
    const r = Math.hypot(x, z);
    if (r < 1e-5 || y < 0.1) return [x, y, z];
    const k = Math.pow(Math.max(0, x / r), 10) * ((y - 0.1) / 0.03) ** 2;
    const nr = r + 0.016 * k;
    return [(x / r) * nr, y + 0.004 * k, (z / r) * nr * (1 - 0.2 * k)];
  });
  const spout = null;
  const ticks = new THREE.Group();
  for (let i = 1; i <= 5; i++) {
    const t = box(0.0015, 0.0012, i % 2 ? 0.02 : 0.012, M.plasticRed);
    const y = 0.02 + i * 0.02, r = 0.042 + (0.008 * y) / 0.13 + 0.0008;
    t.position.set(0, y, 0);
    t.rotation.y = PI / 2;
    t.position.z = r;
    t.rotation.y = 0;
    t.geometry = new THREE.BoxGeometry(i % 2 ? 0.02 : 0.012, 0.0012, 0.0015);
    ticks.add(t);
  }
  kit.part('cup', 'Wadah transparan bergaris takaran', [0, 0, 0], jug, spout, ticks);
  const hp = [V3(-0.044, 0.115, 0), V3(-0.075, 0.11, 0), V3(-0.08, 0.07, 0), V3(-0.07, 0.035, 0), V3(-0.044, 0.03, 0)];
  kit.part('handle', 'Pegangan', [-0.04, 0, 0], tube(hp, 0.0055, M.plasticClear, { segs: 30, radial: 10 }));
  return kit.finish();
}

/* ---------------- Cobek & ulekan (batu) ---------------- */
export function buildCobek() {
  const kit = new Kit('cobek');
  const pts = [[0, 0], [0.06, 0], [0.085, 0.006], [0.098, 0.022], [0.1, 0.038], [0.094, 0.043], [0.07, 0.034], [0.035, 0.026], [0, 0.024]];
  const c = lathe(pts, M.stone, 48);
  kit.part('cobek', 'Cobek (wadah batu)', [0, -0.03, 0], c);
  const u = lathe([[0, 0], [0.016, 0], [0.021, 0.012], [0.02, 0.04], [0.014, 0.09], [0.013, 0.12], [0.009, 0.13], [0, 0.131]], M.stone, 28);
  u.rotation.z = 1.05;
  u.position.set(0.035, 0.038, 0.01);
  kit.part('ulekan', 'Ulekan / munthu (penggerus)', [0.04, 0.06, 0], u);
  return kit.finish();
}
