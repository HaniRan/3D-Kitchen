/**
 * Cooking equipment (alat pengolahan berukuran besar):
 * Gas Open Burner, Conventional (Deck) Oven, Revolving Rack Oven, Convection Oven, Combi Oven,
 * Microwave Oven, Salamander, Griller (charbroiler), Deep Fryer, Tilting Skillet, Steam Jacketed Kettle.
 */
import * as THREE from 'three';
import { M, colorMat } from './materials.js';
import { labelTexture } from './textures.js';
import {
  Kit, mesh, at, group, box, rbox, cyl, cylX, cylZ, sphere, torus, lathe, latheGeo, vessel, vesselProfile,
  rectLatheGeo, trayGeo, shapeFrom, extrudeGeo, roundedRectShape, tube, knob, bulletFoot, caster,
  flameRing, steamPuffs, steamTick, mergeMeshes, ovenDoor, deform, PI, TAU, V3, clamp, lerp,
} from './helpers.js';

/** Panel lampu/LED milik model. */
function ledMesh(kit, base, r = 0.005) {
  const m = kit.own(base);
  const l = cylZ(r, 0.004, m);
  return { mesh: l, mat: m };
}

/** Layar digital (emissive) dengan teks yang dapat diperbarui. */
function digitalDisplay(kit, w, h, text = '', color = '#ff6a2a', chars = 6) {
  const ph = Math.round((256 * h) / w);
  const fs = Math.round(Math.min(ph * 0.62, 256 / (chars * 0.62)));
  const tex = labelTexture(text, { w: 256, h: ph, bg: '#070707', fg: color, font: `bold ${fs}px monospace`, glow: true });
  const mat = kit.own(M.lcd);
  mat.emissive = new THREE.Color(0xffffff);
  mat.emissiveMap = tex;
  mat.emissiveIntensity = 0;
  const m = mesh(new THREE.PlaneGeometry(w, h), mat, { cast: false });
  let last = text;
  return {
    mesh: m,
    mat,
    set(t) { if (t !== last) { tex.userData.update(t); last = t; } },
  };
}

/**
 * Cangkang kabinet terbuka di depan (agar isi ruang oven terlihat lewat kaca pintu):
 * atas, bawah, samping, belakang, dan bingkai depan berlubang. Posisi alas di y = 0.
 * o = { x, y, w, h } bukaan relatif terhadap pusat sisi depan.
 */
function openShell(W, H, D, o, mat = M.steel, lining = colorMat(0x9a9fa3, 0.35, 0.9)) {
  const g = new THREE.Group();
  const t = 0.015;
  g.add(at(rbox(W, t, D, 0.006, mat, 2), 0, H - t / 2, 0));
  g.add(at(rbox(W, t, D, 0.006, mat, 2), 0, t / 2, 0));
  for (const s of [-1, 1]) g.add(at(rbox(t, H, D, 0.006, mat, 2), s * (W / 2 - t / 2), H / 2, 0));
  g.add(at(box(W - 0.01, H - 0.01, t, mat), 0, H / 2, -D / 2 + t / 2));
  const shape = roundedRectShape(W, H, 0.012);
  shape.holes.push(roundedRectShape(o.w, o.h, 0.01, o.x, o.y));
  const front = mesh(extrudeGeo(shape, t, { bevel: 0.002, segs: 1 }), mat);
  front.position.set(0, H / 2, D / 2 - t / 2);
  g.add(front);
  // lapisan dalam ruang (rongga oven)
  const cx = o.x, cy = H / 2 + o.y, cd = D - 0.06;
  g.add(at(box(o.w, o.h, 0.004, lining), cx, cy, -D / 2 + t + 0.003));
  for (const s of [-1, 1]) {
    g.add(at(box(0.004, o.h, cd, lining), cx + s * (o.w / 2), cy, 0.01));
    g.add(at(box(o.w, 0.004, cd, lining), cx, cy + s * (o.h / 2), 0.01));
  }
  return g;
}

/** Baris kaki penyetel untuk peralatan berdiri. */
function legs(w, d, h = 0.15, inset = 0.05) {
  return [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(bulletFoot(h, 0.024, M.steelSatin), sx * (w / 2 - inset), 0, sz * (d / 2 - inset))));
}

/** Tungku pembakar (burner) bulat dengan tutup berlubang api. */
function burnerHead() {
  return group(
    lathe([[0, 0], [0.05, 0], [0.055, 0.012], [0.052, 0.02], [0.04, 0.022], [0, 0.022]], M.castIron, 32),
    at(lathe([[0, 0], [0.038, 0], [0.04, 0.006], [0.03, 0.012], [0, 0.013]], M.castIron, 32), 0, 0.022, 0),
  );
}

/** Rangka tatakan besi cor (grate) di atas satu tungku. */
function grate(size = 0.3) {
  const bars = [];
  const t = 0.012, h = 0.018;
  const half = size / 2;
  for (const s of [-1, 1]) {
    bars.push(at(box(size, h, t, M.castIron), 0, 0, s * (half - t / 2)));
    bars.push(at(box(t, h, size, M.castIron), s * (half - t / 2), 0, 0));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + PI / 4;
    const len = half * 1.41 - 0.05;
    const b = box(len - 0.02, h, t, M.castIron);
    b.position.set(Math.cos(a) * (0.05 + len / 2), 0, Math.sin(a) * (0.05 + len / 2));
    b.rotation.y = -a;
    bars.push(b);
  }
  for (const s of [-1, 1]) {
    bars.push(at(box(size - 0.02, h, t, M.castIron), 0, 0, s * 0.06));
  }
  return mergeMeshes(bars, M.castIron);
}

/* =============================================== GAS OPEN BURNER == */
export function buildGasRange() {
  const kit = new Kit('gas-range');
  const W = 1.2, D = 0.78, topY = 0.9;
  const body = mesh(rectLatheGeo([[0, 0.15], [0, topY - 0.02], [-0.004, topY - 0.005], [-0.012, topY]], W, D, 0.01, 3, { capStart: true, capEnd: false }), M.steel);
  const top = at(rbox(W, 0.012, D, 0.004, M.steelSatin, 2), 0, topY - 0.006, 0);
  const shelf = at(rbox(W - 0.08, 0.01, D - 0.1, 0.003, M.steel, 2), 0, 0.32, 0);
  const frontPanel = at(rbox(W, 0.13, 0.03, 0.006, M.steelPolished, 2), 0, topY - 0.075, D / 2 + 0.01);
  const riser = at(rbox(W, 0.3, 0.06, 0.008, M.steel, 2), 0, topY + 0.15, -D / 2 + 0.03);
  const riserShelf = at(rbox(W, 0.012, 0.22, 0.004, M.steel, 2), 0, topY + 0.3, -D / 2 + 0.1);
  const opening = at(box(W - 0.06, 0.48, 0.005, colorMat(0x2a2d30, 0.6, 0.4)), 0, 0.6, D / 2 - 0.005);
  // oven di bawah kompor (range oven): pintu berjendela, gagang, ventilasi & kick plate
  const oDoor = ovenDoor(W * 0.62, 0.5, { mat: M.steel, glassMat: M.glassDark, handleMat: M.steelPolished, depth: 0.035 });
  oDoor.position.set(-W * 0.17, 0.48, D / 2 + 0.018);
  const sidePanel = at(rbox(W * 0.3, 0.5, 0.012, 0.006, M.steelSatin, 2), W * 0.33, 0.48, D / 2 + 0.006);
  const louvers = [];
  for (let i = 0; i < 8; i++) louvers.push(at(box(W * 0.22, 0.008, 0.004, M.steelDark), W * 0.33, 0.62 - i * 0.03, D / 2 + 0.013));
  const kick = at(box(W - 0.02, 0.1, 0.01, M.steelSatin), 0, 0.2, D / 2 - 0.004);
  kit.part('body', 'Badan kompor, oven bawah & kaki (stainless)', [0, -0.15, 0], body, top, shelf, frontPanel, riser, riserShelf, opening, oDoor, sidePanel, mergeMeshes(louvers, M.steelDark), kick, ...legs(W, D));
  const burners = [];
  const grates = new THREE.Group();
  const knobs = [];
  const positions = [];
  for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) positions.push([-0.4 + c * 0.4, r === 0 ? 0.17 : -0.17]);
  const flames = [];
  positions.forEach(([x, z], i) => {
    const b = burnerHead();
    b.position.set(x, topY, z);
    burners.push(b);
    const gr = grate(0.36);
    gr.position.set(x, topY + 0.06, z);
    grates.add(gr);
    const fm = kit.own(M.flame);
    const f = flameRing(0.04, fm, 22, 0.03);
    f.position.set(x, topY + 0.03, z);
    f.userData.mat = fm;
    flames.push(f);
    kit.root.add(f);
    const k = knob(0.022, 0.025, M.plasticBlack, colorMat(0xffffff));
    k.position.set(-0.5 + i * 0.2, topY - 0.075, D / 2 + 0.025);
    knobs.push(k);
  });
  // tiang pijakan grate
  const posts = [];
  positions.forEach(([x, z]) => [-1, 1].forEach((s) => posts.push(at(box(0.012, 0.05, 0.012, M.castIron), x + s * 0.17, topY + 0.03, z + s * 0.17))));
  grates.add(mergeMeshes(posts, M.castIron));
  kit.part('burners', 'Tungku api (burner)', [0, 0.12, 0], ...burners);
  kit.part('grates', 'Tatakan besi cor (grate)', [0, 0.3, 0], grates);
  kit.part('knobs', 'Kenop pengatur gas', [0, 0, 0.2], ...knobs);
  kit.stateVar('gas', 0, 6); // katup gas utama
  kit.stateVar('power', 0, 4); // api menyala (tungku 1)
  kit.stateVar('heat', 0.6, 3);
  kit.stateVar('all', 0, 3); // semua tungku menyala (tampilan dapur)
  kit.onApply((s, dt, t) => {
    flames.forEach((f, i) => {
      const on = i === 0 ? s.power * s.gas : s.all * s.gas;
      const h = 0.4 + s.heat * 0.9;
      f.userData.mat.opacity = on * 0.75;
      f.visible = on > 0.01;
      f.scale.set(1, h * (1 + Math.sin(t * 25 + i) * 0.06), 1);
    });
    knobs[0].rotation.z = -s.gas * (0.6 + s.heat * 1.4);
    for (let i = 1; i < 6; i++) knobs[i].rotation.z = -s.all * s.gas * 1.2;
  });
  return kit.finish({ hot: true, gas: true });
}

/* ================================================ DECK (CONVENTIONAL) OVEN == */
export function buildDeckOven() {
  const kit = new Kit('deck-oven');
  const W = 1.05, D = 0.82, deckH = 0.34;
  const stand = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) stand.add(at(box(0.04, 0.72, 0.04, M.steel), sx * (W / 2 - 0.04), 0.36, sz * (D / 2 - 0.04)));
  stand.add(at(rbox(W - 0.04, 0.02, D - 0.04, 0.004, M.steel, 2), 0, 0.2, 0));
  stand.add(at(rbox(W - 0.04, 0.03, D - 0.04, 0.004, M.steel, 2), 0, 0.72, 0));
  kit.part('stand', 'Rangka penyangga', [0, -0.25, 0], stand);
  const decks = [];
  const doors = [];
  const heaters = [];
  const lights = [];
  const displays = [];
  for (let i = 0; i < 2; i++) {
    const y0 = 0.735 + i * deckH;
    const g = new THREE.Group();
    g.add(at(rbox(W, deckH - 0.006, D, 0.01, M.enamelBlack, 2), 0, deckH / 2, 0));
    g.add(at(rbox(W - 0.02, 0.012, D - 0.02, 0.004, M.steelSatin, 2), 0, deckH - 0.006, 0));
    // rongga dalam (terlihat saat pintu terbuka)
    const cav = at(box(0.68, 0.2, 0.68, colorMat(0x1a1714, 0.8, 0.3)), -0.12, deckH / 2 - 0.01, 0.06);
    const stone = at(box(0.68, 0.015, 0.66, colorMat(0x8b6b4a, 0.95)), -0.12, deckH / 2 - 0.1, 0.07);
    const lm = kit.own(M.interiorLight);
    const lamp = at(box(0.6, 0.004, 0.02, lm), -0.12, deckH / 2 + 0.085, 0.06);
    lights.push(lm);
    const hm = kit.own(M.heater);
    for (const hy of [deckH / 2 + 0.07, deckH / 2 - 0.085]) {
      for (let k = 0; k < 3; k++) g.add(at(cylX(0.005, 0.62, hm), -0.12, hy, -0.15 + k * 0.17));
    }
    heaters.push(hm);
    g.add(cav, stone, lamp);
    // pintu (engsel di bawah)
    const door = ovenDoor(0.72, 0.24, { mat: M.steel, glassMat: M.glassDark, handleMat: M.steelPolished, depth: 0.04 });
    const pivot = new THREE.Group();
    door.position.y = 0.12;
    pivot.add(door);
    pivot.position.set(-0.12, deckH / 2 - 0.12, D / 2 + 0.02);
    g.add(pivot);
    doors.push(pivot);
    // panel kontrol kanan
    const panel = at(rbox(0.24, deckH - 0.06, 0.012, 0.006, M.steelSatin, 2), W / 2 - 0.14, deckH / 2, D / 2 + 0.005);
    const k1 = at(knob(0.022, 0.02, M.plasticBlack, colorMat(0xffffff)), W / 2 - 0.19, deckH / 2 - 0.06, D / 2 + 0.01);
    const k2 = at(knob(0.022, 0.02, M.plasticBlack, colorMat(0xffffff)), W / 2 - 0.09, deckH / 2 - 0.06, D / 2 + 0.01);
    const disp = digitalDisplay(kit, 0.14, 0.04, '---');
    disp.mesh.position.set(W / 2 - 0.14, deckH / 2 + 0.07, D / 2 + 0.012);
    displays.push(disp);
    g.add(panel, k1, k2, disp.mesh);
    g.position.y = y0;
    decks.push(g);
  }
  kit.part('deck1', 'Dek bawah (ruang panggang & elemen pemanas)', [0, 0, 0.0], decks[0]);
  kit.part('deck2', 'Dek atas (ruang panggang & elemen pemanas)', [0, 0.25, 0], decks[1]);
  const vent = at(cyl(0.035, 0.035, 0.18, M.steelSatin, 20), -W / 2 + 0.15, 0.735 + 2 * deckH + 0.09, -D / 2 + 0.15);
  kit.part('vent', 'Cerobong uap (vent)', [0, 0.25, 0], vent);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 2);
  kit.stateVar('heat', 0, 0.6);
  kit.stateVar('door', 0, 3);
  kit.stateVar('light', 0, 6);
  kit.onApply((s) => {
    doors[0].rotation.x = s.door * 1.45;
    heaters.forEach((h) => { h.emissiveIntensity = s.heat * s.power * 2.2; });
    lights.forEach((l) => { l.emissiveIntensity = s.light * 2.5; });
    displays.forEach((d) => {
      d.mat.emissiveIntensity = s.power > 0.5 ? 1.4 : 0;
      d.set(s.power > 0.5 ? `${Math.round(30 + s.heat * 150)}°C` : '---');
    });
  });
  return kit.finish({ hot: true, electric: true });
}

/* ================================================= REVOLVING RACK OVEN == */
export function buildRackOven() {
  const kit = new Kit('rack-oven');
  const W = 1.15, H = 2.15, D = 1.3;
  const shell = openShell(W, H, D, { x: -0.13, y: 1.02 - H / 2, w: 0.78, h: 1.8 });
  const hood = at(rbox(W + 0.05, 0.25, D * 0.6, 0.02, M.steelSatin, 2), 0, H + 0.12, D * 0.18);
  const base = at(box(W - 0.02, 0.06, D - 0.02, M.steelDark), 0, 0.03, 0);
  kit.part('body', 'Badan oven & cerobong (hood)', [0, 0, -0.2], shell, hood, base);
  // rak berputar di dalam (terlihat lewat jendela)
  const rack = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) rack.add(at(box(0.02, 1.6, 0.02, M.steelSatin), sx * 0.3, 0.8, sz * 0.3));
  for (let i = 0; i < 12; i++) {
    const tray = at(rbox(0.6, 0.01, 0.6, 0.004, M.aluminium, 1), 0, 0.2 + i * 0.12, 0);
    rack.add(tray);
    for (let k = 0; k < 4; k++) {
      const bun = sphere(0.05, M.bread, 14, 10);
      bun.scale.set(1, 0.6, 1);
      bun.position.set((k % 2 ? 1 : -1) * 0.14, 0.23 + i * 0.12, (k < 2 ? 1 : -1) * 0.14);
      rack.add(bun);
    }
  }
  rack.add(at(cyl(0.03, 0.03, 0.12, M.steelSatin), 0, 1.86, 0));
  const rackHolder = group(rack);
  rackHolder.position.set(-0.13, 0.1, 0.0);
  kit.part('rack', 'Rak berputar (revolving rack) & loyang', [0, 0, 1.0], rackHolder);
  const doorPivot = new THREE.Group();
  const door = ovenDoor(0.82, 1.85, { mat: M.steel, glassMat: M.glassPane, handleMat: M.steelPolished, handle: 'side', depth: 0.06 });
  door.position.x = 0.41;
  doorPivot.add(door);
  doorPivot.position.set(-0.13 - 0.41, 1.02, D / 2 + 0.03);
  kit.part('door', 'Pintu berjendela kaca', [0, 0, 0.4], doorPivot);
  const panel = at(rbox(0.22, 0.9, 0.02, 0.008, M.steelSatin, 2), W / 2 - 0.13, 1.35, D / 2 + 0.01);
  const disp = digitalDisplay(kit, 0.16, 0.06, '---');
  disp.mesh.position.set(W / 2 - 0.13, 1.65, D / 2 + 0.022);
  const disp2 = digitalDisplay(kit, 0.16, 0.06, '00:00', '#3bff7a');
  disp2.mesh.position.set(W / 2 - 0.13, 1.55, D / 2 + 0.022);
  const btns = [0, 1, 2, 3].map((i) => at(cylZ(0.014, 0.012, i === 0 ? M.plasticGreen : i === 3 ? M.plasticRed : M.plasticGrey), W / 2 - 0.17 + (i % 2) * 0.08, 1.38 - Math.floor(i / 2) * 0.08, D / 2 + 0.026));
  const lm = kit.own(M.interiorLight);
  const lamp = at(box(0.02, 1.4, 0.02, lm), -0.52, 1.0, D / 2 - 0.05);
  kit.part('panel', 'Panel kontrol (suhu, waktu, uap)', [0.25, 0, 0.2], panel, disp.mesh, disp2.mesh, ...btns, lamp);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 1.5);
  kit.stateVar('heat', 0, 0.6);
  kit.stateVar('door', 0, 2.5);
  kit.stateVar('light', 0, 6);
  let a = 0;
  kit.onApply((s, dt) => {
    a += dt * s.power * 0.8;
    rack.rotation.y = a;
    doorPivot.rotation.y = -s.door * 1.7;
    lm.emissiveIntensity = Math.max(s.light, s.power) * 2.5;
    disp.mat.emissiveIntensity = disp2.mat.emissiveIntensity = s.plug > 0.5 ? 1.4 : 0;
    disp.set(s.power > 0.5 ? `${Math.round(30 + s.heat * 160)}°C` : '---');
    disp2.set(s.power > 0.5 ? '20:00' : '00:00');
  });
  return kit.finish({ hot: true, electric: true });
}

/* ==================================================== CONVECTION OVEN == */
function fanBlades(r = 0.09, mat = M.steelSatin) {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const b = mesh(extrudeGeo(shapeFrom([[0.015, -0.012], [r, -0.02], [r, 0.02], [0.015, 0.012]]), 0.002, { bevel: 0.001, segs: 1 }), mat);
    b.rotation.z = (i / 6) * TAU;
    b.rotation.x = 0.0;
    const h = group(b);
    h.rotation.z = (i / 6) * TAU;
    b.rotation.set(0.35, 0, 0);
    g.add(h);
  }
  g.add(cylZ(0.022, 0.03, mat));
  return g;
}

function boxOven(kit, { W, H, D, doorW, doorH, panelW, doorSide = 'drop', glassMat = M.glassDark, racks = 4 }) {
  const cavX = -W / 2 + 0.03 + doorW / 2;
  const shell = openShell(W, H, D, { x: cavX, y: 0, w: doorW - 0.07, h: doorH - 0.07 });
  const cavity = new THREE.Group();
  for (let i = 0; i < racks; i++) {
    const y = H / 2 - doorH / 2 + 0.08 + i * ((doorH - 0.14) / Math.max(racks - 1, 1));
    const rk = new THREE.Group();
    for (let k = -4; k <= 4; k++) rk.add(at(box(0.004, 0.004, D - 0.16, M.steelPolished), cavX + k * ((doorW - 0.12) / 8), y, 0.02));
    cavity.add(rk);
  }
  // pintu
  let pivot;
  const door = ovenDoor(doorW, doorH, { mat: M.steel, glassMat, handleMat: M.steelPolished, handle: doorSide === 'drop' ? 'top' : 'side', depth: 0.045 });
  pivot = new THREE.Group();
  if (doorSide === 'drop') {
    door.position.y = doorH / 2;
    pivot.position.set(cavX, H / 2 - doorH / 2, D / 2 + 0.024);
  } else {
    door.position.x = doorW / 2;
    pivot.position.set(cavX - doorW / 2, H / 2, D / 2 + 0.024);
  }
  pivot.add(door);
  const panelX = W / 2 - panelW / 2 - 0.01;
  const panel = at(rbox(panelW, H - 0.06, 0.012, 0.006, M.steelSatin, 2), panelX, H / 2, D / 2 + 0.006);
  return { shell, cavity, pivot, panel, panelX, cavX };
}

export function buildConvectionOven() {
  const kit = new Kit('convection-oven');
  const W = 0.82, H = 0.62, D = 0.75, y0 = 0.7;
  const stand = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) stand.add(at(box(0.035, y0, 0.035, M.steel), sx * (W / 2 - 0.03), y0 / 2, sz * (D / 2 - 0.03)));
  stand.add(at(rbox(W - 0.03, 0.02, D - 0.03, 0.004, M.steel, 2), 0, 0.22, 0));
  for (let i = 0; i < 6; i++) stand.add(at(box(0.012, 0.012, D - 0.08, M.steelPolished), -W / 2 + 0.04, 0.3 + i * 0.06, 0), at(box(0.012, 0.012, D - 0.08, M.steelPolished), W / 2 - 0.04, 0.3 + i * 0.06, 0));
  kit.part('stand', 'Rangka & rak loyang', [0, -0.3, 0], stand);
  const o = boxOven(kit, { W, H, D, doorW: 0.6, doorH: 0.5, panelW: 0.18, doorSide: 'side', glassMat: M.glassDark });
  const g = group(o.shell, o.cavity);
  g.position.y = y0;
  const fan = fanBlades(0.1);
  fan.position.set(o.cavX, y0 + H / 2, -D / 2 + 0.07);
  const guardRing = torus(0.11, 0.003, M.steelPolished, 6, 40);
  guardRing.position.copy(fan.position).add(V3(0, 0, 0.02));
  kit.part('body', 'Badan oven & ruang panggang', [0, 0, -0.15], g);
  kit.part('fan', 'Kipas sirkulasi (konveksi) & elemen pemanas', [0, 0, -0.35], fan, guardRing);
  o.pivot.position.y += y0;
  kit.part('door', 'Pintu kaca', [0, 0, 0.35], o.pivot);
  const k1 = at(knob(0.022, 0.022, M.plasticBlack, colorMat(0xffffff)), o.panelX, y0 + 0.44, D / 2 + 0.012);
  const k2 = at(knob(0.022, 0.022, M.plasticBlack, colorMat(0xffffff)), o.panelX, y0 + 0.32, D / 2 + 0.012);
  const ledP = ledMesh(kit, M.ledAmber, 0.006);
  ledP.mesh.position.set(o.panelX, y0 + 0.2, D / 2 + 0.014);
  const lm = kit.own(M.interiorLight);
  const lamp = at(box(0.015, 0.015, 0.1, lm), o.cavX + 0.25, y0 + H - 0.08, 0.1);
  const panelG = group(o.panel, k1, k2, ledP.mesh, lamp);
  panelG.children[0].position.y += y0;
  kit.part('panel', 'Panel kontrol (suhu & timer)', [0.2, 0, 0.15], panelG);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 2);
  kit.stateVar('heat', 0, 0.8);
  kit.stateVar('door', 0, 3);
  kit.stateVar('light', 0, 6);
  let a = 0;
  kit.onApply((s, dt) => {
    a += dt * s.power * 18;
    fan.rotation.z = a;
    o.pivot.rotation.y = -s.door * 1.6;
    k1.rotation.z = -s.heat * 2.5;
    k2.rotation.z = -s.power * 1.5;
    ledP.mat.emissiveIntensity = s.heat * s.power * 3;
    lm.emissiveIntensity = Math.max(s.power, s.light) * 3;
  });
  return kit.finish({ hot: true, electric: true });
}

/* ========================================================= COMBI OVEN == */
export function buildCombiOven() {
  const kit = new Kit('combi-oven');
  const W = 0.86, H = 0.78, D = 0.8, y0 = 0.62;
  const stand = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) stand.add(at(box(0.04, y0, 0.04, M.steel), sx * (W / 2 - 0.04), y0 / 2, sz * (D / 2 - 0.04)));
  for (let i = 0; i < 7; i++) stand.add(at(box(0.014, 0.012, D - 0.1, M.steelPolished), -W / 2 + 0.05, 0.12 + i * 0.065, 0), at(box(0.014, 0.012, D - 0.1, M.steelPolished), W / 2 - 0.05, 0.12 + i * 0.065, 0));
  kit.part('stand', 'Rangka penyangga & rak GN', [0, -0.3, 0], stand);
  const o = boxOven(kit, { W, H, D, doorW: 0.64, doorH: 0.66, panelW: 0.17, doorSide: 'side', glassMat: M.glassPane, racks: 5 });
  // nampan GN berisi makanan
  for (let i = 0; i < 2; i++) {
    const tray = at(rbox(0.5, 0.04, 0.32, 0.01, M.steelPolished, 2), o.cavX, H / 2 - 0.15 + i * 0.25, 0.05);
    o.cavity.add(tray);
    for (let k = 0; k < 3; k++) o.cavity.add(at(rbox(0.12, 0.04, 0.2, 0.02, M.meatCooked, 2), o.cavX - 0.15 + k * 0.15, H / 2 - 0.12 + i * 0.25, 0.05));
  }
  const g = group(o.shell, o.cavity);
  g.position.y = y0;
  const fan = fanBlades(0.12);
  fan.position.set(o.cavX, y0 + H / 2, -D / 2 + 0.07);
  const steam = steamPuffs(16, kit.own(M.steam), 0.2);
  steam.position.set(o.cavX, y0 + 0.12, 0);
  kit.root.add(steam);
  kit.part('body', 'Badan oven & ruang masak', [0, 0, -0.15], g);
  kit.part('fan', 'Kipas & generator uap (steamer)', [0, 0, -0.35], fan);
  o.pivot.position.y += y0;
  kit.part('door', 'Pintu kaca ganda', [0, 0, 0.4], o.pivot);
  const screen = digitalDisplay(kit, 0.13, 0.17, '', '#5ad1ff');
  screen.mesh.position.set(o.panelX, y0 + H - 0.2, D / 2 + 0.013);
  const dial = at(knob(0.035, 0.025, M.steelPolished, M.plasticRed), o.panelX, y0 + H - 0.42, D / 2 + 0.012);
  const drip = at(rbox(0.66, 0.02, 0.06, 0.006, M.steelPolished, 2), o.cavX, y0 - 0.005, D / 2 + 0.02);
  const panelG = group(o.panel, screen.mesh, dial, drip);
  panelG.children[0].position.y += y0;
  kit.part('panel', 'Panel layar sentuh & kenop', [0.25, 0, 0.15], panelG);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 2);
  kit.stateVar('steam', 0, 1);
  kit.stateVar('heat', 0, 0.8);
  kit.stateVar('door', 0, 3);
  let a = 0;
  kit.onApply((s, dt, t) => {
    a += dt * s.power * 16;
    fan.rotation.z = a;
    o.pivot.rotation.y = -s.door * 1.6;
    dial.rotation.z = -s.heat * 2.5;
    screen.mat.emissiveIntensity = s.plug > 0.5 ? 1.2 : 0;
    screen.set(s.power > 0.5 ? (s.steam > 0.5 ? 'STEAM' : 'COMBI') : (s.plug > 0.5 ? 'READY' : ''));
    steamTick(steam, t, s.steam * s.power * (1 - s.door * 0.5), 0.5, 0.06);
  });
  return kit.finish({ hot: true, electric: true });
}

/* ==================================================== MICROWAVE OVEN == */
export function buildMicrowave() {
  const kit = new Kit('microwave');
  const W = 0.52, H = 0.32, D = 0.42;
  const shell = rbox(W, H, D, 0.012, M.steel, 2);
  shell.position.y = H / 2;
  const cav = at(box(0.33, 0.22, 0.32, colorMat(0xe8e8e2, 0.6, 0.1)), -0.07, H / 2, 0.03);
  cav.material = colorMat(0xdedcd4, 0.6, 0.1);
  const plate = cyl(0.13, 0.13, 0.006, M.glass, 40);
  plate.position.set(-0.07, 0.06, 0.03);
  const bowl = group(vessel({ rB: 0.035, rT: 0.065, h: 0.05, wall: 0.003, base: 0.004, corner: 0.015 }, M.ceramic, 32));
  const food = at(cyl(0.058, 0.055, 0.02, M.soup, 24), 0, 0.03, 0);
  bowl.add(food);
  bowl.position.set(-0.07, 0.063, 0.03);
  const feet = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(cyl(0.012, 0.012, 0.01, M.rubber, 12), sx * 0.22, -0.003, sz * 0.17)));
  kit.part('body', 'Badan & ruang microwave', [0, 0, -0.1], shell, cav, ...feet);
  kit.part('turntable', 'Piringan putar (turntable) kaca', [0, 0.12, 0.25], plate, bowl);
  const pivot = new THREE.Group();
  const doorG = new THREE.Group();
  doorG.add(at(rbox(0.36, 0.28, 0.02, 0.008, M.steelSatin, 2), 0.18, 0, 0));
  doorG.add(at(mesh(new THREE.PlaneGeometry(0.26, 0.18), M.microwaveMesh), 0.16, 0, 0.0105));
  doorG.add(at(rbox(0.02, 0.2, 0.03, 0.008, M.plasticBlack, 2), 0.33, 0, 0.022));
  pivot.add(doorG);
  pivot.position.set(-0.25, H / 2, D / 2 + 0.01);
  kit.part('door', 'Pintu berjaring pengaman gelombang mikro', [0, 0, 0.2], pivot);
  const panel = at(rbox(0.13, 0.28, 0.012, 0.006, M.plasticGloss, 2), 0.185, H / 2, D / 2 + 0.006);
  const disp = digitalDisplay(kit, 0.1, 0.035, '', '#3bff7a');
  disp.mesh.position.set(0.185, H / 2 + 0.1, D / 2 + 0.0125);
  const keys = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) keys.push(at(rbox(0.026, 0.02, 0.006, 0.003, M.plasticGrey, 1), 0.15 + c * 0.035, H / 2 + 0.04 - r * 0.03, D / 2 + 0.013));
  const start = at(rbox(0.1, 0.025, 0.006, 0.004, M.plasticGreen, 1), 0.185, H / 2 - 0.1, D / 2 + 0.013);
  const lm = kit.own(M.interiorLight);
  const lamp = at(box(0.04, 0.004, 0.04, lm), -0.07, H - 0.05, 0.03);
  kit.part('panel', 'Panel kontrol (waktu & daya)', [0.15, 0, 0.1], panel, disp.mesh, ...keys, start, lamp);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 4);
  kit.stateVar('door', 0, 3);
  kit.stateVar('fill', 0, 4);
  kit.stateVar('time', 60, 100);
  let a = 0;
  kit.onApply((s, dt) => {
    a += dt * s.power * 1.2;
    plate.rotation.y = a;
    bowl.position.set(-0.07 + Math.cos(a) * 0.05, 0.063, 0.03 + Math.sin(a) * 0.05);
    bowl.visible = s.fill > 0.05;
    pivot.rotation.y = -s.door * 1.7;
    lm.emissiveIntensity = Math.max(s.power, s.door) * 2.5;
    disp.mat.emissiveIntensity = s.plug > 0.5 ? 1.4 : 0;
    const sec = Math.max(0, Math.round(s.time));
    disp.set(s.plug > 0.5 ? `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}` : '');
    start.position.z = D / 2 + 0.013 - s.power * 0.003;
  });
  return kit.finish({ hot: true, electric: true });
}

/* ========================================================== SALAMANDER == */
export function buildSalamander() {
  const kit = new Kit('salamander');
  const W = 0.62, H = 0.46, D = 0.42;
  const shell = new THREE.Group();
  shell.add(at(rbox(W, 0.14, D, 0.012, M.steel, 2), 0, H - 0.07, 0));
  for (const s of [-1, 1]) shell.add(at(rbox(0.02, H, D, 0.006, M.steel, 2), s * (W / 2 - 0.01), H / 2, 0));
  shell.add(at(box(W - 0.04, H, 0.01, colorMat(0x1e1e1e, 0.6, 0.4)), 0, H / 2, -D / 2 + 0.005));
  shell.add(at(rbox(W, 0.025, D, 0.006, M.steel, 2), 0, 0.012, 0));
  // braket dinding (wall bracket) di belakang + pelat dinding
  shell.add(at(box(W * 0.8, 0.36, 0.012, M.steelDark), 0, 0.24, -D / 2 - 0.05));
  for (const sx of [-1, 1]) shell.add(at(box(0.012, 0.3, 0.05, M.steelDark), sx * W * 0.3, 0.24, -D / 2 - 0.025));
  // rel rak bertingkat di dinding samping dalam
  const rails = [];
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) rails.push(at(box(0.012, 0.008, D - 0.08), sx * (W / 2 - 0.026), 0.07 + k * 0.06, 0));
  shell.add(mergeMeshes(rails, M.steelSatin));
  // panel radiant (keramik) di bawah kepala
  shell.add(at(box(W - 0.06, 0.006, D - 0.06, colorMat(0x2a2522, 0.8)), 0, H - 0.142, 0));
  // baki penampung lemak (drip tray) dengan pegangan
  const drip = group(mesh(trayGeo({ w: W - 0.06, d: D - 0.04, h: 0.03, r: 0.01, flare: 0, wall: 0.0015, lip: 0.004, corner: 0.006 }), M.steelSatin));
  drip.add(at(cylX(0.006, 0.12, M.steelPolished), 0, 0.022, (D - 0.04) / 2 + 0.02));
  for (const sx of [-1, 1]) drip.add(at(cylZ(0.005, 0.02, M.steelPolished), sx * 0.06, 0.022, (D - 0.04) / 2 + 0.01));
  drip.position.y = 0.026;
  shell.add(drip);
  kit.part('body', 'Rangka, braket dinding & baki lemak', [0, 0, -0.15], shell);
  const hm = kit.own(M.heater);
  hm.emissive = new THREE.Color(0xff5a14);
  const heater = new THREE.Group();
  for (let i = 0; i < 4; i++) heater.add(at(rbox(0.12, 0.012, 0.3, 0.004, hm, 1), -0.2 + i * 0.135, H - 0.15, 0.0));
  kit.part('heater', 'Elemen pemanas atas (infra merah)', [0, 0.15, 0], heater);
  const shelf = new THREE.Group();
  for (let k = -6; k <= 6; k++) shelf.add(at(box(0.005, 0.005, D - 0.06, M.steelPolished), k * 0.042, 0, 0));
  shelf.add(at(box(W - 0.06, 0.008, 0.008, M.steelPolished), 0, 0, D / 2 - 0.03), at(box(W - 0.06, 0.008, 0.008, M.steelPolished), 0, 0, -D / 2 + 0.03));
  // pegangan depan rak
  shelf.add(at(cylX(0.008, W * 0.5, M.steelPolished), 0, 0.02, D / 2 + 0.03));
  for (const sx of [-1, 1]) shelf.add(at(box(0.008, 0.02, 0.06, M.steelPolished), sx * W * 0.24, 0.01, D / 2 - 0.0));
  const dish = group(trayGeoMesh(0.3, 0.2, 0.03), at(rbox(0.22, 0.03, 0.14, 0.03, M.cheese, 2), 0, 0.02, 0));
  dish.position.y = 0.006;
  shelf.add(dish);
  const shelfHolder = group(shelf);
  kit.part('shelf', 'Rak geser (atur jarak ke pemanas)', [0, -0.05, 0.3], shelfHolder);
  const k1 = at(knob(0.02, 0.02, M.plasticBlack, colorMat(0xffffff)), W / 2 - 0.06, H - 0.07, D / 2 + 0.002);
  const ledP = ledMesh(kit, M.ledAmber, 0.006);
  ledP.mesh.position.set(W / 2 - 0.13, H - 0.07, D / 2 + 0.004);
  kit.part('controls', 'Kenop pengatur panas', [0.1, 0, 0.1], k1, ledP.mesh);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 1.2);
  kit.stateVar('heat', 0.7, 2);
  kit.stateVar('shelf', 0.4, 2);
  kit.onApply((s) => {
    hm.emissiveIntensity = s.power * s.heat * 3;
    shelfHolder.position.y = 0.06 + s.shelf * 0.18;
    k1.rotation.z = -s.power * s.heat * 2.4;
    ledP.mat.emissiveIntensity = s.power * 3;
    dish.children[1].material = s.power > 0.8 ? M.fried : M.cheese;
  });
  return kit.finish({ hot: true, electric: true });
}

function trayGeoMesh(w, d, h) {
  return mesh(trayGeo({ w, d, h, r: 0.02, flare: 0.006, wall: 0.0015, lip: 0.006 }), M.steelSatin);
}

/* ============================================================= GRILLER == */
export function buildGriller() {
  const kit = new Kit('griller');
  const W = 0.62, D = 0.66, H = 0.36;
  const body = mesh(rectLatheGeo([[0, 0.06], [0, H - 0.02], [-0.006, H]], W, D, 0.01, 3, { capEnd: false }), M.steel);
  const front = at(rbox(W, 0.1, 0.03, 0.006, M.steelPolished, 2), 0, 0.13, D / 2 + 0.01);
  const trough = at(rbox(W - 0.04, 0.03, 0.08, 0.006, M.steelSatin, 2), 0, H - 0.04, D / 2 - 0.02);
  const feet = legs(W, D, 0.06, 0.05);
  const glowMat = kit.own(M.heater);
  glowMat.emissive = new THREE.Color(0xff4a10);
  const radiants = new THREE.Group();
  for (let i = 0; i < 3; i++) radiants.add(at(rbox(0.16, 0.05, D - 0.16, 0.02, glowMat, 2), -0.19 + i * 0.19, H - 0.09, -0.03));
  kit.part('body', 'Badan griller, penampung lemak & kaki', [0, -0.1, 0], body, front, trough, ...feet);
  kit.part('burners', 'Burner & radiant (sumber panas)', [0, 0.05, 0.35], radiants);
  const bars = [];
  for (let i = 0; i < 16; i++) bars.push(at(rbox(0.018, 0.022, D - 0.14, 0.005, M.castIron, 1), -W / 2 + 0.05 + i * 0.034, H + 0.005, -0.03));
  const grateMesh = mergeMeshes(bars, M.castIron);
  kit.part('grate', 'Batang panggangan besi cor (char grate)', [0, 0.18, 0], grateMesh);
  const flames = new THREE.Group();
  const fm = kit.own(M.flameOrange);
  for (let i = 0; i < 18; i++) {
    const f = mesh(new THREE.ConeGeometry(0.012, 0.05, 6, 1, true), fm);
    f.position.set(-0.25 + (i % 6) * 0.1, H - 0.02, -0.2 + Math.floor(i / 6) * 0.17);
    f.userData.p = i;
    flames.add(f);
  }
  kit.root.add(flames);
  const steaks = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const st = rbox(0.13, 0.022, 0.09, 0.02, M.meatCooked, 2);
    st.position.set(-0.17 + i * 0.17, H + 0.028, -0.02);
    st.rotation.y = 0.3 * (i - 1);
    steaks.add(st);
  }
  const food = kit.part('food', 'Contoh: steak dipanggang', [0, 0.3, 0], steaks);
  const knobs = [0, 1, 2].map((i) => at(knob(0.022, 0.022, M.plasticBlack, colorMat(0xffffff)), -0.19 + i * 0.19, 0.13, D / 2 + 0.025));
  kit.part('knobs', 'Kenop pengatur api', [0, 0, 0.2], ...knobs);
  kit.stateVar('gas', 0, 6);
  kit.stateVar('power', 0, 1.5);
  kit.stateVar('fill', 0, 3);
  kit.onApply((s, dt, t) => {
    glowMat.emissiveIntensity = s.power * 2.2;
    fm.opacity = s.power * 0.55;
    flames.visible = s.power > 0.02;
    flames.children.forEach((f) => { f.scale.y = 0.6 + Math.abs(Math.sin(t * 9 + f.userData.p)) * 0.8; });
    food.visible = s.fill > 0.05;
    knobs.forEach((k) => { k.rotation.z = -s.gas * 1.6; });
  });
  return kit.finish({ hot: true, gas: true });
}

/* ========================================================== DEEP FRYER == */
function fryBasket(w = 0.2, d = 0.28, h = 0.14, kit) {
  const g = new THREE.Group();
  const m = kit.own(M.meshCoarse);
  m.alphaMap = M.meshCoarse.alphaMap.clone();
  m.alphaMap.repeat.set(4, 2);
  g.add(mesh(trayGeo({ w, d, h, r: 0.015, flare: 0.0, wall: 0.0005, lip: 0.0, corner: 0.01 }), m));
  const rim = mesh(rectLatheGeo([[0.003, h - 0.004], [0.003, h + 0.004]], w, d, 0.015, 4, { capStart: false, capEnd: false }), M.steelPolished);
  g.add(rim);
  const handle = tube([V3(0, h, d / 2), V3(0, h + 0.04, d / 2 + 0.06), V3(0, h + 0.07, d / 2 + 0.22)], 0.006, M.steelPolished, { segs: 20, radial: 8 });
  const grip = at(cyl(0.013, 0.013, 0.12, M.plasticBlack, 16), 0, h + 0.075, d / 2 + 0.25, PI / 2 - 0.2);
  const hook = tube([V3(0, h + 0.02, -d / 2), V3(0, h + 0.05, -d / 2 - 0.02), V3(0, h + 0.03, -d / 2 - 0.035)], 0.004, M.steelPolished, { segs: 12, radial: 6 });
  // kentang goreng
  const fries = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const f = box(0.01, 0.01, 0.07, M.fried);
    f.position.set((Math.sin(i * 3.1) * w) / 2.8, 0.02 + (i % 4) * 0.012, (Math.cos(i * 1.7) * d) / 3.2);
    f.rotation.set(i * 0.4, i, 0.2);
    fries.add(f);
  }
  g.add(handle, grip, hook, fries);
  g.userData.fries = fries;
  return g;
}

export function buildDeepFryer() {
  const kit = new Kit('deep-fryer');
  const W = 0.6, D = 0.52, H = 0.36;
  const body = mesh(rectLatheGeo([[0, 0.03], [0, H]], W, D, 0.012, 3, { capEnd: false }), M.steel);
  // pelat atas dengan DUA lubang bak minyak (sebelumnya pelat penuh menutupi minyak)
  const deckShape = roundedRectShape(W, D, 0.012);
  [-0.145, 0.145].forEach((x) => deckShape.holes.push(roundedRectShape(0.236, 0.336, 0.02, x, -0.02)));
  const deck = mesh(extrudeGeo(deckShape, 0.004, { curveSegments: 12 }), M.steelSatin);
  deck.rotation.x = -PI / 2;
  deck.position.y = H + 0.002;
  const feet = legs(W, D, 0.04, 0.05);
  const doorF = at(rbox(W - 0.06, H - 0.12, 0.012, 0.006, M.steelSatin, 2), 0, H / 2 + 0.01, D / 2 + 0.004);
  const pull = at(cylX(0.008, 0.3, M.steelPolished), 0, H - 0.09, D / 2 + 0.03);
  const valve = at(cylZ(0.015, 0.03, M.plasticRed), -0.15, 0.1, D / 2 + 0.02);
  kit.part('body', 'Badan fryer stainless & pintu kabinet (keran pembuangan minyak)', [0, -0.1, 0], body, deck, doorF, pull, valve, ...feet);
  const wells = new THREE.Group();
  const oilMats = [];
  const oilMat = kit.own(M.oil);
  oilMat.color.set(0xbf7a0a);
  oilMat.opacity = 0.96;
  oilMat.roughness = 0.03;
  const bubbles = new THREE.Group();
  [-0.145, 0.145].forEach((x) => {
    const w = mesh(trayGeo({ w: 0.24, d: 0.34, h: 0.24, r: 0.02, flare: -0.005, wall: 0.0015, lip: 0.012, corner: 0.02 }), M.steelSatin);
    w.position.set(x, H - 0.24, 0.02);
    // permukaan minyak goreng ±4 cm di bawah bibir bak, jelas terlihat dari atas
    const oil = rbox(0.234, 0.12, 0.334, 0.018, oilMat, 2);
    oil.position.set(x, H - 0.045 - 0.06, 0.02);
    oilMats.push(oil);
    wells.add(w, oil);
    for (let i = 0; i < 14; i++) {
      const b = sphere(0.005, M.oil, 8, 6);
      b.userData = { x, seed: i * 0.37 + x };
      bubbles.add(b);
    }
  });
  kit.part('wells', 'Bak minyak (oil tank)', [0, 0.05, 0.0], wells);
  kit.root.add(bubbles);
  const baskets = [];
  [-0.145, 0.145].forEach((x, i) => {
    const b = fryBasket(0.2, 0.28, 0.13, kit);
    const holder = group(b);
    holder.position.set(x, H - 0.17, 0.02);
    baskets.push({ holder, b });
  });
  kit.part('baskets', 'Keranjang penggoreng (fry basket)', [0, 0.25, 0.15], ...baskets.map((q) => q.holder));
  const ctrls = new THREE.Group();
  const leds = [];
  [-0.145, 0.145].forEach((x) => {
    const head = at(rbox(0.24, 0.16, 0.08, 0.015, M.steel, 2), x, H + 0.08, -D / 2 + 0.04);
    const kb = at(knob(0.02, 0.02, M.plasticBlack, colorMat(0xffffff)), x - 0.05, H + 0.08, -D / 2 + 0.082);
    const l1 = ledMesh(kit, M.ledGreen, 0.005);
    l1.mesh.position.set(x + 0.04, H + 0.1, -D / 2 + 0.082);
    const l2 = ledMesh(kit, M.ledAmber, 0.005);
    l2.mesh.position.set(x + 0.07, H + 0.1, -D / 2 + 0.082);
    leds.push(l1, l2);
    ctrls.add(head, kb, l1.mesh, l2.mesh);
  });
  const cord = tube([V3(0, H + 0.05, -D / 2), V3(0, H - 0.05, -D / 2 - 0.08), V3(0.1, 0.01, -D / 2 - 0.2)], 0.004, M.plasticBlack, { segs: 20, radial: 6 });
  kit.part('controls', 'Kepala kontrol (termostat & lampu) + elemen pemanas', [0, 0.15, -0.15], ctrls, cord);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 1.5);
  kit.stateVar('heat', 0, 0.5);
  kit.stateVar('basket', 0, 2); // 1 = keranjang turun ke minyak
  kit.stateVar('fill', 0, 3);
  kit.onApply((s, dt, t) => {
    const b0 = baskets[0];
    b0.holder.position.y = H - 0.17 + 0.16 - s.basket * 0.16 + 0.0;
    b0.holder.rotation.x = (1 - s.basket) * 0.0;
    baskets[1].holder.position.y = H - 0.17 + 0.16;
    baskets.forEach((q) => { q.b.userData.fries.visible = s.fill > 0.05 && q === b0; });
    leds[0].mat.emissiveIntensity = leds[2].mat.emissiveIntensity = s.plug * s.power * 3;
    leds[1].mat.emissiveIntensity = leds[3].mat.emissiveIntensity = s.power * (s.heat < 0.95 ? 1 : 0) * 3;
    const boil = s.power * s.heat * (0.3 + s.basket * 0.7);
    bubbles.visible = boil > 0.05;
    bubbles.children.forEach((b) => {
      const p = (t * 1.5 + b.userData.seed * 7) % 1;
      b.position.set(b.userData.x + Math.sin(b.userData.seed * 30) * 0.09, H - 0.045, 0.02 + Math.cos(b.userData.seed * 17) * 0.14);
      b.scale.setScalar(Math.max(0.001, boil * Math.sin(p * PI)));
    });
  });
  return kit.finish({ hot: true, electric: true });
}

/* ====================================================== TILTING SKILLET == */
export function buildTiltingSkillet() {
  const kit = new Kit('tilting-skillet');
  const W = 0.95, D = 0.68;
  const frame = new THREE.Group();
  for (const sx of [-1, 1]) {
    frame.add(at(rbox(0.14, 0.62, 0.62, 0.02, M.steel, 2), sx * (W / 2 + 0.07), 0.31 + 0.12, 0));
    frame.add(...legs(0.14, 0.62, 0.12, 0.04).map((l) => { l.position.x += sx * (W / 2 + 0.07); return l; }));
  }
  frame.add(at(box(W, 0.04, 0.05, M.steel), 0, 0.2, -0.25));
  kit.part('frame', 'Rangka & kolom samping', [0, -0.1, 0], frame);
  // wajan persegi besar (pan) – pivot pada sumbu depan
  const panG = new THREE.Group();
  const outer = rbox(W, 0.26, D, 0.02, M.steel, 2);
  outer.position.set(0, -0.13, -D / 2);
  const well = mesh(trayGeo({ w: W - 0.08, d: D - 0.08, h: 0.22, r: 0.03, flare: 0.0, wall: 0.002, lip: 0.035, corner: 0.03 }), M.steelPolished);
  well.position.set(0, -0.22 + 0.003, -D / 2);
  // cerat tuang berbentuk V di tengah depan
  const spout = mesh(extrudeGeo(shapeFrom([[-0.09, 0.0], [0, -0.06], [0.09, 0.0], [0.082, 0.004], [0, -0.054], [-0.082, 0.004]]), 0.11, { bevel: 0.001, segs: 1 }), M.steelPolished);
  spout.position.set(0, -0.006, 0.045);
  const rimBand = mesh(rectLatheGeo([[0.004, -0.03], [0.004, 0.0], [-0.03, 0.0]], W, D, 0.02, 3, { capStart: false, capEnd: false }), M.steelPolished);
  rimBand.position.z = -D / 2;
  panG.add(rimBand);
  const food = mesh(new THREE.BoxGeometry(W - 0.12, 0.004, D - 0.12), M.soup);
  food.position.set(0, -0.08, -D / 2);
  panG.add(outer, well, spout, food);
  const lidPivot = new THREE.Group();
  const lid = rbox(W + 0.01, 0.03, D + 0.01, 0.012, M.steel, 2);
  lid.position.set(0, 0.015, D / 2);
  const lidHandle = at(cylX(0.012, W * 0.6, M.steelPolished), 0, 0.06, D + 0.03);
  lidHandle.add(...[-1, 1].map((s) => at(cyl(0.008, 0.008, 0.06, M.steelPolished, 10), s * W * 0.25, -0.03, 0)));
  lidHandle.children.forEach((c) => c.rotation.set(0, 0, -PI / 2));
  lidPivot.add(lid, lidHandle);
  lidPivot.position.set(0, 0.0, -D);
  panG.add(lidPivot);
  const panHolder = group(panG);
  panHolder.position.set(0, 0.86, D / 2);
  kit.part('pan', 'Wajan besar (braising pan) & tutup berengsel', [0, 0.15, 0], panHolder);
  const wheel = new THREE.Group();
  wheel.add(torus(0.1, 0.01, M.steelPolished, 8, 40));
  for (let i = 0; i < 3; i++) wheel.add(at(box(0.2, 0.012, 0.012, M.steelPolished), 0, 0, 0, 0, 0, (i * PI) / 3));
  wheel.add(at(cylZ(0.012, 0.08, M.plasticBlack), 0.1, 0, 0.04));
  wheel.rotation.y = PI / 2;
  wheel.position.set(W / 2 + 0.17, 0.74, 0.12);
  const ctrl = at(rbox(0.02, 0.2, 0.2, 0.006, M.plasticBlack, 2), -W / 2 - 0.145, 0.68, 0.12);
  const kb = at(knob(0.024, 0.022, M.plasticGrey, colorMat(0xffffff)), -W / 2 - 0.16, 0.7, 0.12, 0, -PI / 2);
  const lp = ledMesh(kit, M.ledAmber, 0.006);
  lp.mesh.rotation.y = -PI / 2;
  lp.mesh.position.set(-W / 2 - 0.157, 0.62, 0.12);
  kit.part('controls', 'Roda pemiring (tilt wheel) & panel kontrol', [0.15, 0, 0.15], wheel, ctrl, kb, lp.mesh);
  const steam = steamPuffs(12, kit.own(M.steam), 0.3);
  steam.position.set(0, 0.86, 0);
  kit.root.add(steam);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 1.2);
  kit.stateVar('lid', 0, 2.5);
  kit.stateVar('tilt', 0, 1.2);
  kit.stateVar('fill', 0, 2);
  kit.onApply((s, dt, t) => {
    lidPivot.rotation.x = -s.lid * 1.6;
    panG.rotation.x = s.tilt * 0.6;
    wheel.rotation.x = s.tilt * 6;
    food.visible = s.fill > 0.05;
    lp.mat.emissiveIntensity = s.power * 3;
    steamTick(steam, t, s.power * s.fill * s.lid, 0.4, 0.06);
  });
  return kit.finish({ hot: true, electric: true });
}

/* =================================================== STEAM JACKETED KETTLE == */
/**
 * Steam jacketed kettle tipe tilting: ketel setengah bola berdinding ganda (jaket uap di bagian
 * bawah), bibir tuang (pouring lip) di depan, tutup kubah berengsel di belakang, bertumpu pada
 * trunnion di antara dua kolom pedestal; roda tangan pemiring (kiri), konsol & manometer (kanan),
 * keran pengisi air berlengan ayun, serta katup pembuangan (draw-off) di dasar.
 */
export function buildSteamKettle() {
  const kit = new Kit('steam-kettle');
  const R = 0.32, B = R * 0.82; // jari-jari & kedalaman bejana dalam
  const PX = R + 0.15; // posisi kolom
  const pedestals = new THREE.Group();
  for (const s of [-1, 1]) {
    pedestals.add(at(rbox(0.15, 0.8, 0.26, 0.03, M.steel, 3), s * PX, 0.44, 0));
    pedestals.add(at(rbox(0.26, 0.03, 0.34, 0.01, M.steelSatin, 2), s * PX, 0.015, 0));
    pedestals.add(at(cylX(0.05, 0.03, M.steelSatin, 24), s * (PX - 0.09), 0.86, 0)); // dudukan bantalan trunnion
    for (const sz of [-1, 1]) pedestals.add(at(cyl(0.012, 0.012, 0.01, M.steelDark, 12), s * PX + 0.09, 0.033, sz * 0.13));
  }
  // konsol kontrol (kanan) dengan manometer jaket & lampu
  const gauge = new THREE.Group();
  gauge.add(cylX(0.045, 0.02, M.steelPolished));
  const face = mesh(new THREE.CircleGeometry(0.04, 32), colorMat(0xf6f6f0, 0.5));
  face.rotation.y = PI / 2;
  face.position.x = 0.011;
  const needle = box(0.002, 0.03, 0.003, M.plasticRed);
  needle.position.set(0.013, 0.01, 0);
  gauge.add(face, needle);
  gauge.position.set(PX + 0.085, 0.7, 0.05);
  const console_ = at(rbox(0.02, 0.24, 0.18, 0.006, M.plasticBlack, 2), PX + 0.08, 0.62, 0.0);
  // keran pengisi (swing faucet) pada kolom kanan
  const faucet = new THREE.Group();
  faucet.add(at(cyl(0.016, 0.016, 0.42, M.chrome, 16), 0, 0.21, 0));
  faucet.add(tube([V3(0, 0.42, 0), V3(0, 0.47, 0), V3(-0.05, 0.5, 0), V3(-0.3, 0.5, 0.02), V3(-0.4, 0.48, 0.03), V3(-0.42, 0.44, 0.03)], 0.012, M.chrome, { segs: 40, radial: 10 }));
  for (const s of [-1, 1]) {
    faucet.add(at(cylX(0.009, 0.05, M.chrome), 0.03, 0.3, s * 0.04));
    faucet.add(at(cylX(0.016, 0.02, s > 0 ? colorMat(0x1f5fa8, 0.4) : colorMat(0xb02a22, 0.4)), 0.065, 0.3, s * 0.04));
  }
  faucet.position.set(PX, 0.84, -0.1);
  kit.part('pedestals', 'Kolom pedestal, konsol kontrol, manometer & keran pengisi', [0, -0.1, 0], pedestals, gauge, console_, faucet);

  const kg = new THREE.Group();
  // bejana dalam (stainless) dengan bibir gulung & bibir tuang di depan (+Z)
  const N = 20, prof = [];
  for (let k = 0; k <= N; k++) { const a = -PI / 2 + (k / N) * (PI / 2); prof.push([Math.cos(a) * R, Math.sin(a) * B]); }
  prof.push([R, 0.13], [R + 0.008, 0.136], [R + 0.011, 0.144], [R + 0.005, 0.15], [R - 0.003, 0.147], [R - 0.004, 0.13]);
  for (let k = N; k >= 0; k--) { const a = -PI / 2 + (k / N) * (PI / 2); prof.push([Math.cos(a) * (R - 0.004), Math.sin(a) * (B - 0.004)]); }
  const innerGeo = latheGeo(prof, 96);
  deform(innerGeo, (x, y, z) => {
    const r = Math.hypot(x, z);
    if (r < 1e-5 || y < 0.03) return [x, y, z];
    const c = Math.max(0, z / r);
    const k = Math.pow(c, 6) * ((y - 0.03) / 0.12) ** 2;
    const nr = r + 0.07 * k;
    return [(x / r) * nr * (1 - 0.25 * k), y + 0.016 * k, (z / r) * nr];
  });
  const vesselM = mesh(innerGeo, M.steelPolished);
  // jaket uap luar (berdinding ganda) — menutup 2/3 bawah bejana
  const J = 0.04, jp = [];
  for (let k = 0; k <= N; k++) { const a = -PI / 2 + (k / N) * (PI / 2); jp.push([Math.cos(a) * (R + J), Math.sin(a) * (B + J)]); }
  jp.push([R + J, 0.02], [R + J - 0.004, 0.026], [R - 0.002, 0.026]);
  const jacket = mesh(latheGeo(jp, 96), M.steelSatin);
  const band = at(torus(R + J + 0.002, 0.006, M.steelPolished, 8, 96), 0, 0.02, 0, PI / 2);
  // trunnion (poros) di kiri-kanan, katup pengaman & pipa uap
  for (const s of [-1, 1]) kg.add(at(cylX(0.04, PX - R - J - 0.06 + 0.04, M.steelSatin), s * (R + J + (PX - R - J - 0.06) / 2), 0, 0));
  const safety = group(at(cyl(0.014, 0.014, 0.05, M.brass, 14), 0, 0.025, 0), at(cyl(0.02, 0.02, 0.012, M.brass, 14), 0, 0.055, 0));
  safety.position.set(0.26, -0.03, -0.26);
  // katup pembuangan (draw-off) di dasar
  const drain = new THREE.Group();
  drain.add(at(cyl(0.022, 0.022, 0.08, M.steelPolished, 16), 0, -0.04, 0));
  drain.add(at(sphere(0.035, M.steelPolished, 16, 10), 0, -0.09, 0));
  drain.add(at(cylZ(0.018, 0.07, M.steelPolished), 0, -0.1, 0.05));
  drain.add(at(rbox(0.16, 0.014, 0.02, 0.006, M.plasticBlack, 2), 0.06, -0.06, 0));
  drain.position.y = -B - J;
  const soup = mesh(new THREE.CircleGeometry(R - 0.03, 48), M.soup);
  soup.rotation.x = -PI / 2;
  soup.position.y = 0.02;
  // tutup kubah berengsel di belakang
  const lidPivot = new THREE.Group();
  const lid = lathe([[0, 0.07], [R * 0.35, 0.062], [R * 0.7, 0.04], [R * 0.95, 0.012], [R + 0.016, 0.0], [R + 0.016, -0.012], [R + 0.012, -0.014], [R - 0.004, 0.0], [R * 0.7, 0.028], [0, 0.058]].reverse(), M.steel, 72);
  lid.position.z = R + 0.012;
  const lidKnob = at(loopKnob(), 0, 0.075, R + 0.012);
  lidKnob.add(at(rbox(0.12, 0.014, 0.03, 0.006, M.plasticBlack, 2), 0, 0.036, 0));
  const hingeArm = at(rbox(0.12, 0.03, 0.08, 0.008, M.steelPolished, 2), 0, 0.02, -0.02);
  lidPivot.add(lid, lidKnob, hingeArm);
  lidPivot.position.set(0, 0.152, -R - 0.012);
  const hingeBase = at(rbox(0.16, 0.05, 0.05, 0.008, M.steelPolished, 2), 0, 0.13, -R - 0.03);
  kg.add(vesselM, jacket, band, safety, drain, soup, lidPivot, hingeBase);
  const kHolder = group(kg);
  kHolder.position.set(0, 0.86, 0);
  kit.part('kettle', 'Ketel berdinding ganda (steam jacket), bibir tuang, tutup berengsel & katup buang', [0, 0.2, 0], kHolder);
  // roda tangan pemiring (kiri)
  const wheel = new THREE.Group();
  wheel.add(torus(0.12, 0.011, M.steelPolished, 8, 40));
  for (let i = 0; i < 3; i++) wheel.add(at(box(0.24, 0.012, 0.012, M.steelPolished), 0, 0, 0, 0, 0, (i * PI) / 3));
  wheel.add(at(cylZ(0.03, 0.03, M.steelPolished), 0, 0, -0.015));
  wheel.add(at(cylZ(0.012, 0.08, M.plasticBlack), 0.12, 0, 0.04));
  wheel.rotation.y = -PI / 2;
  wheel.position.set(-(PX + 0.12), 0.86, 0);
  const gearbox = at(rbox(0.06, 0.16, 0.16, 0.01, M.steelSatin, 2), -(PX + 0.09), 0.86, 0);
  const ledP = ledMesh(kit, M.ledGreen, 0.007);
  ledP.mesh.rotation.y = PI / 2;
  ledP.mesh.position.set(PX + 0.092, 0.58, -0.04);
  kit.part('controls', 'Roda tangan pemiring (tilt handwheel) & lampu indikator', [-0.15, 0, 0.1], wheel, gearbox, ledP.mesh);
  const steam = steamPuffs(14, kit.own(M.steam), 0.18);
  steam.position.set(0, 1.0, 0);
  kit.root.add(steam);
  kit.stateVar('power', 0, 1);
  kit.stateVar('lid', 0, 2.5);
  kit.stateVar('tilt', 0, 1);
  kit.stateVar('fill', 0, 2);
  kit.onApply((s, dt, t) => {
    lidPivot.rotation.x = -s.lid * 1.75;
    kg.rotation.x = s.tilt * 0.9;
    wheel.rotation.x = s.tilt * 7;
    soup.visible = s.fill > 0.05;
    soup.position.y = -0.18 + s.fill * 0.17;
    soup.scale.setScalar(0.75 + s.fill * 0.25);
    needle.rotation.x = -s.power * 1.8;
    ledP.mat.emissiveIntensity = s.power * 3;
    steamTick(steam, t, s.power * s.fill * (0.3 + s.lid * 0.7), 0.4, 0.07);
  });
  return kit.finish({ hot: true, gas: false, electric: true, steam: true });
}

function loopKnob() {
  return group(
    tube([V3(-0.05, 0, 0), V3(-0.04, 0.035, 0), V3(0.04, 0.035, 0), V3(0.05, 0, 0)], 0.008, M.steelPolished, { segs: 20, radial: 8 }),
  );
}
