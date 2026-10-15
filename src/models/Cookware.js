/**
 * Panci & wajan (pan): Stock Pot, Sauce Pot, Sauce Pan, Saute Pan, Braising/Roasting Pan,
 * Frying Pan, Steaming Pan. Semua dibuat dengan profil lathe berdinding tebal yang realistis.
 */
import * as THREE from 'three';
import { M } from './materials.js';
import {
  Kit, mesh, at, group, box, rbox, cyl, sphere, torus, lathe, latheGeo, vessel, vesselProfile,
  shapeFrom, extrudeGeo, tube, trayGeo, steamPuffs, steamTick, PI, TAU, V3, arcPts, clamp,
} from './helpers.js';

/** Pegangan loop (dikeling) di sisi panci; arah +X. */
export function loopHandle(span = 0.07, reach = 0.045, r = 0.005, mat = M.steelPolished) {
  const g = new THREE.Group();
  const pts = [V3(0, 0, -span / 2), V3(reach * 0.55, 0.008, -span / 2), V3(reach, 0.012, -span * 0.3), V3(reach, 0.012, span * 0.3), V3(reach * 0.55, 0.008, span / 2), V3(0, 0, span / 2)];
  g.add(tube(pts, r, mat, { segs: 40, radial: 10 }));
  for (const s of [-1, 1]) {
    const plate = rbox(0.004, 0.022, 0.016, 0.002, mat, 2);
    plate.position.set(0.001, -0.002, (s * span) / 2);
    g.add(plate);
  }
  return g;
}

/** Gagang panjang cor (stay-cool) dengan lubang gantungan; arah −X dari titik pasang. */
export function stickHandle(len = 0.2, mat = M.steelPolished, rise = 0.12) {
  const pts = [[0, 0.012], [0.02, 0.0085], [0.06, 0.0075], [len - 0.03, 0.0105], [len - 0.008, 0.0095], [len, 0.004], [len, -0.004], [len - 0.008, -0.0095], [len - 0.03, -0.0105], [0.06, -0.0055], [0.02, -0.0065], [0, -0.012]];
  const hole = arcPts(len - 0.022, 0, 0.0055, 0, TAU, 16);
  const geo = extrudeGeo(shapeFrom(pts, [hole]), 0.012, { bevel: 0.0035, segs: 3, curveSegments: 12 });
  geo.rotateX(PI / 2); // datar: lebar di Z
  geo.rotateY(PI); // memanjang ke −X
  const m = mesh(geo, mat);
  m.rotation.z = -rise; // sedikit menanjak
  const g = group(m);
  const rivets = [0.008, -0.008].map((z) => at(sphere(0.0035, mat, 10, 8), 0.004, 0.0, z));
  g.add(...rivets);
  return g;
}

/** Tutup panci berkubah dengan pegangan. */
export function potLid(R, { dome = 0.025, mat = M.steelPolished, knobType = 'loop' } = {}) {
  const g = new THREE.Group();
  const pts = [[R + 0.004, -0.004], [R + 0.004, 0.0], [R, 0.004]];
  for (let i = 1; i <= 10; i++) {
    const t = i / 10, r = R * (1 - t);
    pts.push([r, 0.004 + dome * Math.sin((t * PI) / 2)]);
  }
  const lid = lathe(pts, mat, 56);
  g.add(lid);
  // tepi bawah tutup (sisi dalam) agar tidak tampak tipis
  const rimIn = mesh(latheGeo([[R - 0.003, -0.006], [R + 0.0035, -0.006], [R + 0.004, -0.004]], 56), mat);
  g.add(rimIn);
  if (knobType === 'loop') {
    const k = loopHandle(0.05, 0.022, 0.0045, mat);
    k.rotation.z = PI / 2;
    k.position.y = dome + 0.004;
    g.add(k);
  } else {
    const k = lathe([[0, 0], [0.012, 0], [0.016, 0.01], [0.018, 0.02], [0.012, 0.026], [0, 0.027]], M.plasticBlack, 24);
    k.position.y = dome + 0.003;
    g.add(k);
  }
  return g;
}

/** Dasar sandwich (encapsulated base) untuk panci stainless. */
function capsuleBase(R, mat = M.steelSatin) {
  return lathe([[0, -0.006], [R - 0.012, -0.006], [R - 0.004, -0.004], [R - 0.002, 0.004], [0, 0.004]], mat, 56);
}

/** Isi panci (kaldu/saus) dengan skala sesuai status 'fill'. */
function contents(R, y, mat) {
  const m = cyl(R, R, 0.002, mat, 48);
  m.position.y = y;
  return m;
}

/** Menyusun panci dua pegangan (stock pot/sauce pot). */
function twoHandlePot(name, R, H, { lidDome = 0.03, fillMat = M.soup } = {}) {
  const kit = new Kit(name);
  const body = vessel({ rB: R, rT: R, h: H, wall: 0.0016, base: 0.004, corner: 0.012, lip: 0.0022 }, M.steel, 64);
  const base = capsuleBase(R);
  const soup = contents(R - 0.004, H * 0.7, fillMat);
  kit.part('body', 'Badan panci & dasar tebal (encapsulated base)', [0, 0, 0], body, base, soup);
  const handles = new THREE.Group();
  for (const s of [-1, 1]) {
    const h = loopHandle(0.075, 0.05, 0.006);
    h.rotation.y = s > 0 ? 0 : PI;
    h.position.set(s * (R - 0.001), H - 0.04, 0);
    handles.add(h);
  }
  kit.part('handles', 'Pegangan samping (dikeling)', [0, 0, 0.12], handles);
  const lid = potLid(R, { dome: lidDome });
  lid.position.y = H + 0.004;
  kit.part('lid', 'Tutup panci', [0, 0.15, 0], lid);
  const steam = steamPuffs(10, kit.own(M.steam), R * 0.4);
  steam.position.y = H;
  kit.root.add(steam);
  kit.stateVar('lid', 0, 4);
  kit.stateVar('fill', 0, 2);
  kit.stateVar('power', 0, 1.5); // dipanaskan → uap
  kit.onApply((s, dt, t) => {
    lid.position.set(-s.lid * R * 0.9, H + 0.004 + s.lid * 0.1, 0);
    lid.rotation.z = s.lid * 0.9;
    soup.visible = s.fill > 0.02;
    soup.scale.set(1, 1, 1);
    soup.position.y = 0.01 + (H * 0.72 - 0.01) * s.fill;
    steamTick(steam, t, s.power * (0.4 + 0.6 * s.lid), 0.35, 0.05);
  });
  return kit.finish({ hot: true });
}

export function buildStockPot() { return twoHandlePot('stock-pot', 0.16, 0.36, { lidDome: 0.03 }); }
export function buildSaucePot() { return twoHandlePot('sauce-pot', 0.15, 0.16, { lidDome: 0.028, fillMat: M.soup }); }

/** Panci/wajan bergagang panjang. */
function stickPan(name, { R, H, rB = R, corner = 0.012, handleLen = 0.21, helper = false, nonstick = false, lid = false, fillMat = null, label }) {
  const kit = new Kit(name);
  const prof = { rB, rT: R, h: H, wall: nonstick ? 0.003 : 0.0018, base: 0.004, corner, lip: nonstick ? 0 : 0.0018, steps: 12 };
  const parts = [];
  if (nonstick) {
    parts.push(mesh(latheGeo(vesselProfile(prof), 64), M.aluminium));
    // lapisan antilengket bagian dalam
    const inner = vesselProfile({ ...prof, rB: rB - 0.0028, rT: R - 0.0028, h: H - 0.001, base: 0.0045, corner: corner - 0.003, wall: 0.0005 });
    const innerOnly = inner.slice(Math.floor(inner.length / 2));
    parts.push(mesh(latheGeo([[R - 0.0025, H - 0.0005], ...innerOnly.slice(1)], 64), M.nonstick));
  } else {
    parts.push(vessel(prof, M.steel, 64));
    parts.push(capsuleBase(rB));
  }
  let food = null;
  if (fillMat) {
    food = contents(rB - 0.006, 0.012, fillMat);
    parts.push(food);
  }
  kit.part('body', label || 'Badan wajan', [0, 0, 0], ...parts);
  const h = stickHandle(handleLen, M.steelPolished, 0.18);
  h.position.set(-R + 0.002, H - 0.022, 0);
  const hg = [h];
  if (helper) {
    const hh = loopHandle(0.06, 0.04, 0.0055);
    hh.position.set(R - 0.001, H - 0.025, 0);
    hg.push(hh);
  }
  kit.part('handle', helper ? 'Gagang panjang & pegangan bantu' : 'Gagang panjang (dikeling)', [-0.08, 0, 0], ...hg);
  let l = null;
  if (lid) {
    l = potLid(R, { dome: 0.02, knobType: 'knob' });
    l.position.y = H + 0.004;
    kit.part('lid', 'Tutup', [0, 0.12, 0], l);
  }
  const steam = steamPuffs(8, kit.own(M.steam), R * 0.4);
  steam.position.y = H * 0.5;
  kit.root.add(steam);
  kit.stateVar('power', 0, 1.5);
  kit.stateVar('fill', 0, 2);
  kit.stateVar('lid', 0, 4);
  kit.onApply((s, dt, t) => {
    if (food) food.visible = s.fill > 0.02;
    if (l) {
      l.position.set(s.lid * R * 0.9, H + 0.004 + s.lid * 0.08, 0);
      l.rotation.z = -s.lid * 0.8;
    }
    steamTick(steam, t, s.power * Math.max(s.fill, 0.3), 0.25, 0.035);
  });
  return kit.finish({ hot: true });
}

export function buildSaucePan() {
  return stickPan('sauce-pan', { R: 0.09, H: 0.095, handleLen: 0.2, lid: true, fillMat: M.soup, label: 'Badan panci saus' });
}
export function buildSautePan() {
  return stickPan('saute-pan', { R: 0.14, H: 0.068, corner: 0.014, handleLen: 0.23, helper: true, fillMat: M.carrot, label: 'Badan wajan sisi lurus' });
}
export function buildFryingPan() {
  return stickPan('frying-pan', { R: 0.14, rB: 0.1, H: 0.05, corner: 0.03, handleLen: 0.22, nonstick: true, fillMat: M.meatCooked, label: 'Badan aluminium & lapisan antilengket' });
}

export function buildRoastingPan() {
  const kit = new Kit('roasting-pan');
  const pan = mesh(trayGeo({ w: 0.44, d: 0.31, h: 0.075, r: 0.045, flare: 0.016, wall: 0.0015, lip: 0.01, corner: 0.012 }), M.steel);
  // rak pemanggang (rack)
  const rack = new THREE.Group();
  for (let i = -5; i <= 5; i++) {
    const w = tube([V3(i * 0.03, 0.03, -0.12), V3(i * 0.03, 0.03, 0.12)], 0.0018, M.steelPolished, { segs: 2, radial: 6 });
    rack.add(w);
  }
  for (const z of [-0.12, 0.12]) rack.add(tube([V3(-0.16, 0.03, z), V3(0.16, 0.03, z)], 0.0025, M.steelPolished, { segs: 2, radial: 6 }));
  // ayam panggang (roast chicken)
  const chicken = new THREE.Group();
  const skin = M.fried;
  const bodyC = sphere(0.07, skin, 32, 20);
  bodyC.scale.set(1.3, 0.78, 1.0);
  bodyC.position.y = 0.082;
  chicken.add(bodyC);
  const breast = sphere(0.05, skin, 24, 16);
  breast.scale.set(1.2, 0.8, 1.15);
  breast.position.set(-0.02, 0.11, 0);
  chicken.add(breast);
  for (const sd of [-1, 1]) {
    const thigh = sphere(0.036, skin, 20, 14);
    thigh.scale.set(1.4, 0.95, 1);
    thigh.position.set(0.05, 0.075, sd * 0.055);
    const drum = cyl(0.012, 0.024, 0.07, skin, 14);
    drum.rotation.z = -PI / 2.6;
    drum.position.set(0.1, 0.085, sd * 0.05);
    const bone = sphere(0.009, M.breadCrumb, 10, 8);
    bone.position.set(0.133, 0.1, sd * 0.05);
    const wing = sphere(0.026, skin, 16, 10);
    wing.scale.set(1.5, 0.6, 0.8);
    wing.position.set(-0.06, 0.085, sd * 0.07);
    chicken.add(thigh, drum, bone, wing);
  }
  kit.part('pan', 'Loyang panggang (braising/roasting pan)', [0, 0, 0], pan);
  kit.part('rack', 'Rak pemanggang', [0, 0.08, 0], rack);
  const handles = new THREE.Group();
  for (const s of [-1, 1]) {
    const h = loopHandle(0.12, 0.04, 0.0055);
    h.rotation.y = s > 0 ? 0 : PI;
    h.position.set(s * (0.22 + 0.006), 0.062, 0);
    handles.add(h);
  }
  kit.part('handles', 'Pegangan lipat', [0, 0, 0.1], handles);
  const food = kit.part('food', 'Contoh: unggas dipanggang', [0, 0.18, 0], chicken);
  kit.stateVar('fill', 0, 2);
  kit.onApply((s) => { food.visible = s.fill > 0.05; food.scale.setScalar(Math.max(0.001, s.fill)); });
  return kit.finish({ hot: true });
}

export function buildSteamingPan() {
  const kit = new Kit('steaming-pan');
  const R = 0.13;
  const base = vessel({ rB: R, rT: R, h: 0.12, wall: 0.0016, base: 0.004, corner: 0.012, lip: 0.002 }, M.steel, 64);
  const water = contents(R - 0.004, 0.06, M.water);
  const hb = new THREE.Group();
  for (const s of [-1, 1]) {
    const h = loopHandle(0.06, 0.035, 0.005);
    h.rotation.y = s > 0 ? 0 : PI;
    h.position.set(s * R, 0.09, 0);
    hb.add(h);
  }
  kit.part('base', 'Panci dasar (air perebus)', [0, 0, 0], base, capsuleBase(R), water, hb);
  const tiers = [];
  for (let i = 0; i < 2; i++) {
    const t = new THREE.Group();
    // dinding susun (bagian bawah mengecil agar masuk ke panci di bawahnya)
    const wall = lathe([
      [R - 0.006, -0.02], [R - 0.0045, -0.02], [R - 0.0045, 0.0], [R, 0.008], [R, 0.09], [R + 0.0025, 0.092], [R - 0.0015, 0.094],
      [R - 0.0016, 0.01], [R - 0.0062, 0.002], [R - 0.0062, -0.018],
    ], M.steel, 64);
    const floor = mesh(new THREE.CircleGeometry(R - 0.005, 48), (() => {
      const m = kit.own(M.perfHolesBig);
      m.alphaMap = M.perfHolesBig.alphaMap.clone();
      m.alphaMap.repeat.set(5, 5);
      return m;
    })());
    floor.rotation.x = -PI / 2;
    floor.position.y = -0.012;
    t.add(wall, floor);
    for (const s of [-1, 1]) {
      const h = loopHandle(0.05, 0.03, 0.0045);
      h.rotation.y = s > 0 ? 0 : PI;
      h.position.set(s * R, 0.07, 0);
      t.add(h);
    }
    // bakpao/kue kukus
    for (let k = 0; k < 4; k++) {
      const bun = sphere(0.032, M.dough, 20, 12);
      bun.scale.y = 0.7;
      bun.position.set(Math.cos(k * 1.57 + i) * 0.06, 0.0, Math.sin(k * 1.57 + i) * 0.06);
      bun.userData.food = true;
      t.add(bun);
    }
    t.position.y = 0.14 + i * 0.104;
    tiers.push(kit.part('tier' + (i + 1), `Susun pengukus ${i + 1} (dasar berlubang)`, [0, 0.1 + i * 0.12, 0], t));
  }
  const lid = potLid(R, { dome: 0.03 });
  lid.position.y = 0.14 + 2 * 0.104 - 0.006;
  kit.part('lid', 'Tutup', [0, 0.38, 0], lid);
  const steam = steamPuffs(12, kit.own(M.steam), 0.06);
  steam.position.y = 0.38;
  kit.root.add(steam);
  kit.stateVar('power', 0, 1.2);
  kit.stateVar('lid', 0, 4);
  kit.stateVar('fill', 1, 3);
  const lidBase = lid.position.y;
  kit.onApply((s, dt, t) => {
    lid.position.set(-s.lid * R, lidBase + s.lid * 0.08, 0);
    lid.rotation.z = s.lid * 0.8;
    tiers.forEach((tg) => tg.traverse((o) => { if (o.userData.food) o.visible = s.fill > 0.05; }));
    steamTick(steam, t, s.power, 0.3, 0.05);
  });
  return kit.finish({ hot: true });
}
