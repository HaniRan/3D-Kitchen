/**
 * Serving equipment:
 * Chinawares  — Dessert Plate, Soup Cup, Saucer, B&B Plate, Dinner Plate, Tea Cup, Coffee Cup
 * Silverwares — Dessert Fork/Knife/Spoon, Butter Spreader, Soup Spoon, Dinner Fork/Knife/Spoon
 * Glasswares  — Water Goblet, Wine Glass, Juice Glass, High Ball Glass, Water Pitcher
 * Gerabah     — Periuk tanah liat
 */
import * as THREE from 'three';
import { M } from './materials.js';
import {
  Kit, mesh, at, group, cyl, sphere, torus, lathe, latheGeo, shapeFrom, extrudeGeo, tube, deform, stripGeo,
  PI, TAU, V3, arcPts, clamp, lerp, smooth,
} from './helpers.js';

/* ============================================================ CHINAWARES == */
function plateProfile(R) {
  // Piring hotel: kaki (foot ring), dasar (well) datar, dinding pendek, lalu rim/bibir lebar yang landai.
  const k = R / 0.135;
  return [
    [0, 0.0045], [0.066, 0.0045], [0.068, 0.0008], [0.07, 0], [0.075, 0], [0.078, 0.0035], [0.088, 0.0068],
    [0.096, 0.0115], [0.12, 0.0163], [0.1335, 0.0193], [0.1356, 0.021], [0.1352, 0.0231], [0.1325, 0.0238],
    [0.12, 0.0213], [0.1, 0.0186], [0.0962, 0.0174], [0.0925, 0.0142], [0.0885, 0.0108], [0.083, 0.0096],
    [0.06, 0.0093], [0, 0.0093],
  ].map(([r, y]) => [r * k, y * Math.max(k, 0.75)]);
}
function plate(R) {
  return lathe(plateProfile(R), M.ceramic, 96);
}
export function buildDinnerPlate() {
  const kit = new Kit('dinner-plate');
  kit.part('plate', 'Piring besar ±27 cm untuk hidangan utama', [0, 0, 0], plate(0.135));
  return kit.finish();
}
export function buildDessertPlate() {
  const kit = new Kit('dessert-plate');
  kit.part('plate', 'Piring kecil ±20 cm (appetizer/dessert)', [0, 0, 0], plate(0.1));
  return kit.finish();
}
export function buildBBPlate() {
  const kit = new Kit('bb-plate');
  const p = plate(0.08);
  const butter = at(mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), M.butter), 0.02, 0.014, 0);
  const roll = sphere(0.028, M.bread, 20, 12);
  roll.scale.set(1.3, 0.7, 1);
  roll.position.set(-0.02, 0.025, 0);
  kit.part('plate', 'Piring roti & mentega ±16 cm', [0, 0, 0], p);
  kit.part('food', 'Contoh: roti & mentega', [0, 0.08, 0], butter, roll);
  return kit.finish();
}
function saucer(R = 0.075) {
  const k = R / 0.075;
  const pts = [[0, 0.004], [0.035, 0.004], [0.037, 0], [0.042, 0], [0.044, 0.003], [0.06, 0.008], [0.073, 0.014], [0.0755, 0.0165], [0.074, 0.018], [0.071, 0.0175], [0.058, 0.0115], [0.03, 0.007], [0.026, 0.0085], [0.022, 0.0085], [0.02, 0.007], [0, 0.007]];
  return lathe(pts.map(([r, y]) => [r * k, y]), M.ceramic, 64);
}
export function buildSaucer() {
  const kit = new Kit('saucer');
  kit.part('saucer', 'Piring alas cangkir (saucer)', [0, 0, 0], saucer());
  return kit.finish();
}
function cupBody(rB, rT, h, wall = 0.003) {
  const pts = [[0, 0.003], [rB - 0.004, 0.003], [rB - 0.003, 0], [rB, 0], [rB + 0.002, 0.004]];
  for (let i = 1; i <= 12; i++) {
    const t = i / 12;
    const r = rB + 0.002 + (rT - rB - 0.002) * Math.pow(t, 0.7);
    pts.push([r, 0.004 + (h - 0.004) * t]);
  }
  pts.push([rT - wall * 0.5, h + wall * 0.4]);
  for (let i = 12; i >= 1; i--) {
    const t = i / 12;
    const r = rB + 0.002 + (rT - rB - 0.002) * Math.pow(t, 0.7) - wall;
    pts.push([r, 0.004 + wall + (h - 0.004 - wall) * t]);
  }
  pts.push([0, 0.004 + wall * 1.5]);
  return lathe(pts, M.ceramic, 64);
}
function cupHandle(r0, y0, size = 1) {
  const pts = [V3(r0 - 0.002, y0 + 0.02 * size, 0), V3(r0 + 0.016 * size, y0 + 0.024 * size, 0), V3(r0 + 0.026 * size, y0 + 0.008 * size, 0), V3(r0 + 0.018 * size, y0 - 0.012 * size, 0), V3(r0 - 0.002, y0 - 0.014 * size, 0)];
  const g = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0045 * size, 10, false), M.ceramic);
  g.scale.z = 0.7;
  return g;
}
function cupWithSaucer(name, { rB, rT, h, liquid, label }) {
  const kit = new Kit(name);
  const sc = saucer(0.075);
  kit.part('saucer', 'Piring alas (saucer)', [0, -0.03, 0], sc);
  const body = cupBody(rB, rT, h);
  const hd = cupHandle(rB + (rT - rB) * 0.55, h * 0.55);
  hd.position.y = 0;
  const liq = mesh(new THREE.CircleGeometry(rT - 0.006, 40), liquid);
  liq.rotation.x = -PI / 2;
  liq.position.y = h * 0.82;
  const cup = group(body, hd, liq);
  cup.position.y = 0.0085;
  kit.part('cup', label, [0, 0.06, 0], cup);
  kit.stateVar('fill', 1, 3);
  kit.onApply((s) => { liq.visible = s.fill > 0.05; });
  return kit.finish({ hot: false });
}
export function buildTeaCup() {
  return cupWithSaucer('tea-cup', { rB: 0.026, rT: 0.047, h: 0.052, liquid: M.tea, label: 'Cangkir teh (lebar & dangkal)' });
}
export function buildCoffeeCup() {
  return cupWithSaucer('coffee-cup', { rB: 0.028, rT: 0.037, h: 0.068, liquid: M.coffee, label: 'Cangkir kopi (lebih tinggi & ramping)' });
}
export function buildSoupCup() {
  const kit = new Kit('soup-cup');
  kit.part('saucer', 'Alas (saucer) soup cup', [0, -0.03, 0], saucer(0.085));
  const body = cupBody(0.034, 0.056, 0.05, 0.0035);
  // soup cup (consommé cup): dua pegangan kecil di kedua sisi
  const ears = new THREE.Group();
  for (const sd of [0, 1]) {
    const pts = [V3(0.0505, 0.043, 0), V3(0.064, 0.0445, 0), V3(0.0705, 0.035, 0), V3(0.0645, 0.0235, 0), V3(0.046, 0.019, 0)];
    const h = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0037, 10, false), M.ceramic);
    h.scale.z = 0.75;
    const g = group(h);
    g.rotation.y = sd * PI;
    ears.add(g);
  }
  const soup = mesh(new THREE.CircleGeometry(0.05, 40), M.soup);
  soup.rotation.x = -PI / 2;
  soup.position.y = 0.042;
  const cup = group(body, ears, soup);
  cup.position.y = 0.0085;
  kit.part('cup', 'Mangkuk sup dengan pegangan di kedua sisi', [0, 0.07, 0], cup);
  return kit.finish();
}

/* =========================================================== SILVERWARES == */
/*
 * Semua alat makan dibuat dengan stripGeo: lebar gagang mengikuti profil ergonomis,
 * kepala sendok cekung (ellipsoid), gagang sedikit melengkung, lalu dibaringkan di bidang XZ.
 */
const sq = (v) => Math.sqrt(Math.max(0, v));

/** Setengah lebar gagang: ujung membulat, melebar, lalu menyempit ke leher. */
function handleHalf(x, { wEnd = 0.023, wNeck = 0.0072, xNeck }) {
  const endR = wEnd * 0.5;
  const round = x < endR ? sq(1 - ((endR - x) / endR) ** 2) : 1;
  const t = clamp(x / xNeck, 0, 1);
  return (lerp(wEnd, wNeck, smooth(Math.pow(t, 0.9))) / 2) * round;
}
function lay(geo, y = 0) {
  const m = mesh(geo, M.steelPolished);
  m.rotation.x = -PI / 2;
  m.position.y = y;
  return m;
}
const handleBend = (L) => (x) => 0.006 * Math.sin((x / L) * PI * 0.85) - 0.002 * (x / L);

function makeSpoon(name, L, a, b, d, label) {
  const kit = new Kit(name);
  const cx = L - a;
  const xNeck = L - 2 * a;
  const hw = (x) => {
    const h = handleHalf(x, { xNeck: xNeck + 0.005 });
    const e = Math.abs(x - cx) <= a ? b * sq(1 - ((x - cx) / a) ** 2) : 0;
    return Math.max(x <= xNeck + 0.012 ? h : 0, e, 0.0003);
  };
  const bend = handleBend(L);
  const geo = stripGeo((x) => hw(x), (x) => -hw(x), 0, L, {
    thick: 0.0022, nx: 140, ny: 16,
    zFn: (x, y) => {
      const dx = (x - cx) / (a * 0.97), dy = y / (b * 0.97);
      const q = 1 - dx * dx - dy * dy;
      return bend(x) - (q > 0 ? d * Math.pow(q, 0.75) : 0) + (x > cx ? 0 : 0);
    },
  });
  kit.part('spoon', label, [0, 0, 0], lay(geo, d + 0.001));
  return kit.finish();
}

function makeFork(name, L, label) {
  // Garpu: badan (gagang → leher → kepala melebar) + 4 mata garpu dengan dasar celah membulat.
  // Semua dibangun dengan stripGeo (grid rapat) sehingga lengkungan halus tanpa artefak.
  const kit = new Kit(name);
  const s = L / 0.205;
  const headW = 0.0255 * s, tineLen = 0.043 * s, tipL = 0.0055 * s;
  const xs = L - tineLen; // dasar celah
  const xNeck = xs - 0.036 * s;
  const n = 4, tw = headW / (n + (n - 1) * 0.7), sw = tw * 0.7, r = sw / 2;
  const hw = (x) => (x <= xNeck ? handleHalf(x, { xNeck }) : lerp(0.0034 * s, headW / 2, smooth(Math.pow(clamp((x - xNeck) / (xs - xNeck), 0, 1), 0.75))));
  const bend = (x) => handleBend(L)(x) + (x > xNeck ? 0.016 * s * ((x - xNeck) / (L - xNeck)) ** 2 : 0);
  const zFn = (x, y) => bend(x) - 0.0011 * (1 - clamp((2 * y / headW) ** 2, 0, 1)) * smooth(clamp((x - xNeck) / (xs - xNeck), 0, 1));
  const parts = [lay(stripGeo(hw, (x) => -hw(x), 0, xs, { thick: 0.0021, nx: 120, ny: 12, zFn, capNormals: false }), 0.003)];
  for (let i = 0; i < n; i++) {
    const mid = headW / 2 - tw / 2 - i * (tw + sw);
    const half = (x) => {
      const t = clamp((x - xs) / (L - xs), 0, 1);
      let h = (tw / 2) * (1 - 0.2 * t);
      const tx = x - (L - tipL);
      if (tx > 0) h *= 0.03 + 0.97 * Math.sqrt(Math.max(0, 1 - (tx / tipL) ** 2));
      return h;
    };
    // pengisi celah (fillet) di dasar celah: setengah lingkaran berjari-jari r
    const fill = (x) => { const d = xs + r - x; return d > 0 ? r - Math.sqrt(Math.max(0, r * r - d * d)) : 0; };
    const top = (x) => (i === 0 ? Math.min(mid + half(x), headW / 2) : mid + half(x) + fill(x));
    const bot = (x) => (i === n - 1 ? Math.max(mid - half(x), -headW / 2) : mid - half(x) - fill(x));
    parts.push(lay(stripGeo(top, bot, xs - 0.002, L, { thick: 0.0021, nx: 40, ny: 4, zFn, capNormals: false }), 0.003));
  }
  kit.part('fork', label, [0, 0, 0], group(parts));
  return kit.finish();
}

function makeTableKnife(name, L, label, { bladeLen = 0.1, bladeW = 0.019 } = {}) {
  const kit = new Kit(name);
  const xB = L - bladeLen;
  const tipR = bladeW * 0.95;
  const top = (x) => {
    if (x < xB) return handleHalf(x, { wEnd: 0.021, wNeck: 0.011, xNeck: xB });
    const base = lerp(0.0055, bladeW * 0.32, smooth(clamp((x - xB) / 0.015, 0, 1)));
    const tx = x - (L - tipR);
    return tx > 0 ? base * sq(1 - (tx / tipR) ** 2) + (-bladeW * 0.68) * (1 - sq(1 - (tx / tipR) ** 2)) * 0 : base;
  };
  const bot = (x) => {
    if (x < xB) return -handleHalf(x, { wEnd: 0.021, wNeck: 0.011, xNeck: xB });
    const base = -lerp(0.0055, bladeW * 0.68, smooth(clamp((x - xB) / 0.02, 0, 1)));
    const serr = x > xB + 0.015 && x < L - tipR ? 0.0004 * Math.abs(Math.sin(x * 900)) : 0;
    const tx = x - (L - tipR);
    if (tx > 0) {
      const k = sq(1 - (tx / tipR) ** 2);
      return base * k + top(x) * (1 - k) * 0.0;
    }
    return base + serr;
  };
  const geo = stripGeo(top, bot, 0, L, { thick: 0.0028, nx: 150, ny: 10, zFn: (x) => 0.004 * Math.sin((x / L) * PI) });
  kit.part('knife', label, [0, 0, 0], lay(geo, 0.002));
  return kit.finish();
}

export const buildDinnerFork = () => makeFork('dinner-fork', 0.23, 'Garpu makan utama ±23 cm');
export const buildDessertFork = () => makeFork('dessert-fork', 0.2, 'Garpu hidangan pembuka/penutup ±20 cm');
export const buildDinnerSpoon = () => makeSpoon('dinner-spoon', 0.23, 0.032, 0.0215, 0.0085, 'Sendok makan utama ±23 cm');
export const buildDessertSpoon = () => makeSpoon('dessert-spoon', 0.2, 0.028, 0.019, 0.0075, 'Sendok hidangan pembuka/penutup ±20 cm');
export const buildSoupSpoon = () => makeSpoon('soup-spoon', 0.205, 0.025, 0.025, 0.009, 'Sendok sup (kepala bundar)');
export const buildDinnerKnife = () => makeTableKnife('dinner-knife', 0.23, 'Pisau makan utama ±23 cm', { bladeLen: 0.105, bladeW: 0.02 });
export const buildDessertKnife = () => makeTableKnife('dessert-knife', 0.2, 'Pisau hidangan pembuka/penutup ±20 cm', { bladeLen: 0.09, bladeW: 0.018 });
export function buildButterSpreader() {
  const kit = new Kit('butter-spreader');
  const L = 0.165, xB = 0.095, R = 0.0135;
  const hw = (x) => {
    if (x < xB) return handleHalf(x, { wEnd: 0.02, wNeck: 0.01, xNeck: xB });
    const w = lerp(0.005, R, smooth(clamp((x - xB) / 0.025, 0, 1)));
    const tx = x - (L - R);
    return tx > 0 ? w * sq(1 - (tx / R) ** 2) : w;
  };
  const geo = stripGeo(hw, (x) => -hw(x), 0, L, { thick: 0.0024, nx: 120, ny: 10, zFn: (x) => 0.004 * Math.sin((x / L) * PI) });
  kit.part('spreader', 'Pisau oles mentega (bilah lebar, ujung bulat)', [0, 0, 0], lay(geo, 0.002));
  return kit.finish();
}

/* ============================================================ GLASSWARES == */
/** Haluskan profil [r,y] dengan spline (mencegah gelas tampak bersegi). */
function smoothPts(pts, n = 32) {
  const c = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
  return c.getPoints(n).map((v) => [v.x, v.y]);
}
/** Profil gelas: outer = titik [r,y] dari bawah luar ke bibir; wall = ketebalan. */
function glassFromOuter(outer, wall, baseThick) {
  const inner = [];
  for (let i = outer.length - 1; i >= 0; i--) {
    const [r, y] = outer[i];
    if (y < baseThick) break;
    inner.push([Math.max(r - wall, 0.0005), y]);
  }
  const top = outer[outer.length - 1];
  return [[0, 0], ...outer, [top[0] - wall * 0.5, top[1] + wall * 0.4], ...inner, [0, inner[inner.length - 1][1]]];
}
function liquidFor(outer, wall, y0, y1, mat) {
  const pts = [[0, y0]];
  for (const [r, y] of outer) if (y >= y0 && y <= y1) pts.push([r - wall - 0.0005, y]);
  pts.push([pts[pts.length - 1][0], y1], [0, y1]);
  return lathe(pts, mat, 48);
}
function stemGlass(name, { footR, stemR, stemH, bowl, label, liquid, fillTo }) {
  const kit = new Kit(name);
  const foot = lathe([[0, 0], [footR, 0], [footR, 0.002], [footR * 0.5, 0.005], [stemR * 1.6, 0.008], [stemR, 0.014], [stemR, stemH], [stemR * 1.6, stemH + 0.006], [0, stemH + 0.008]], M.glass, 48);
  const outer = smoothPts(bowl, 28).map(([r, y]) => [r, y + stemH]);
  const b = lathe(glassFromOuter(outer, 0.0016, stemH + 0.006), M.glass, 64);
  kit.part('foot', 'Kaki & batang gelas (stem)', [0, -0.05, 0], foot);
  const parts = [b];
  let liq = null;
  if (liquid) {
    liq = liquidFor(outer, 0.0016, stemH + 0.008, stemH + fillTo, liquid);
    parts.push(liq);
  }
  kit.part('bowl', label, [0, 0.05, 0], ...parts);
  kit.stateVar('fill', 1, 3);
  kit.onApply((s) => { if (liq) liq.visible = s.fill > 0.05; });
  return kit.finish({ glass: true });
}
export function buildWaterGoblet() {
  const bowl = [[0.012, 0.0], [0.032, 0.008], [0.043, 0.025], [0.047, 0.05], [0.046, 0.075], [0.043, 0.098]];
  return stemGlass('water-goblet', { footR: 0.04, stemR: 0.008, stemH: 0.045, bowl, label: 'Mangkuk gelas lebar (air mineral)', liquid: M.water, fillTo: 0.07 });
}
export function buildWineGlass() {
  const bowl = [[0.008, 0.0], [0.025, 0.012], [0.038, 0.035], [0.042, 0.06], [0.039, 0.085], [0.033, 0.11]];
  return stemGlass('wine-glass', { footR: 0.036, stemR: 0.0042, stemH: 0.085, bowl, label: 'Mangkuk gelas tulip (anggur)', liquid: M.wine, fillTo: 0.045 });
}
function tumbler(name, { r0, r1, h, base, label, liquid, fillTo, ice = 0 }) {
  const kit = new Kit(name);
  const outer = [[r0 - 0.002, 0], [r0, 0.003]];
  for (let i = 1; i <= 8; i++) outer.push([lerp(r0, r1, i / 8), 0.003 + (h - 0.003) * (i / 8)]);
  const g = lathe(glassFromOuter(outer, 0.0018, base), M.glass, 64);
  const parts = [g];
  let liq = null;
  if (liquid) {
    liq = liquidFor(outer, 0.0018, base + 0.001, fillTo, liquid);
    parts.push(liq);
    for (let i = 0; i < ice; i++) {
      const cube = mesh(new THREE.BoxGeometry(0.022, 0.022, 0.022), M.glass);
      cube.position.set(Math.cos(i * 2.1) * r0 * 0.4, fillTo - 0.012 - i * 0.004, Math.sin(i * 2.1) * r0 * 0.4);
      cube.rotation.set(i, i * 0.7, 0.3);
      parts.push(cube);
    }
  }
  kit.part('glass', label, [0, 0, 0], ...parts);
  kit.stateVar('fill', 1, 3);
  kit.onApply((s) => { if (liq) liq.visible = s.fill > 0.05; });
  return kit.finish({ glass: true });
}
export const buildJuiceGlass = () => tumbler('juice-glass', { r0: 0.033, r1: 0.036, h: 0.11, base: 0.012, label: 'Gelas tanpa kaki, lurus (sari buah)', liquid: M.juice, fillTo: 0.09 });
export const buildHighballGlass = () => tumbler('highball-glass', { r0: 0.03, r1: 0.031, h: 0.15, base: 0.014, label: 'Gelas tinggi tanpa kaki (minuman campuran)', liquid: M.water, fillTo: 0.125, ice: 3 });
export function buildWaterPitcher() {
  const kit = new Kit('water-pitcher');
  const outer = [[0.052, 0], ...smoothPts([[0.056, 0.004], [0.064, 0.04], [0.066, 0.09], [0.058, 0.15], [0.05, 0.19], [0.054, 0.215], [0.058, 0.225]], 36)];
  const bodyGeo = latheGeo(glassFromOuter(outer, 0.0022, 0.008), 96);
  // cerat (spout): bibir ditarik keluar & sedikit naik di sisi +X, menyatu dengan badan
  deform(bodyGeo, (x, y, z) => {
    const r = Math.hypot(x, z);
    if (r < 1e-5 || y < 0.185) return [x, y, z];
    const c = Math.max(0, x / r);
    const k = Math.pow(c, 10) * ((y - 0.185) / 0.04) ** 2;
    const nr = r + 0.024 * k;
    return [(x / r) * nr, y + 0.006 * k, (z / r) * nr * (1 - 0.25 * k)];
  });
  const body = mesh(bodyGeo, M.glass);
  const water = liquidFor(outer, 0.0022, 0.01, 0.16, M.water);
  const spout = null;
  const handle = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(-0.055, 0.205, 0), V3(-0.095, 0.2, 0), V3(-0.1, 0.13, 0), V3(-0.085, 0.06, 0), V3(-0.06, 0.045, 0)]), 40, 0.007, 12), M.glass);
  // irisan lemon (infused water)
  const lemon = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const l = cyl(0.022, 0.022, 0.004, M.fruitYellow, 20);
    l.position.set(Math.cos(i * 2) * 0.02, 0.05 + i * 0.04, Math.sin(i * 2) * 0.02);
    l.rotation.set(1.2 + i, i, 0);
    lemon.add(l);
  }
  kit.part('pitcher', 'Teko kaca (water pitcher), cerat & pegangan', [0, 0, 0], body, spout, handle);
  kit.part('content', 'Air mineral / infused water', [0, 0.25, 0], water, lemon);
  return kit.finish({ glass: true });
}

/* =============================================================== GERABAH == */
export function buildClayPot() {
  const kit = new Kit('clay-pot');
  const outer = [[0, 0], ...smoothPts([[0.05, 0], [0.085, 0.02], [0.11, 0.06], [0.115, 0.09], [0.105, 0.12], [0.085, 0.14], [0.08, 0.15], [0.088, 0.158], [0.09, 0.165]], 40)];
  const inner = outer.filter(([, y]) => y > 0.026).reverse().map(([r, y]) => [r - 0.008, y]);
  const pot = lathe([...outer, [0.086, 0.168], ...inner, [0, 0.03]], M.clay, 72);
  kit.part('pot', 'Periuk tanah liat (gerabah)', [0, 0, 0], pot);
  const lid = lathe([[0.086, 0], [0.09, 0.004], [0.06, 0.03], [0.02, 0.04], [0.018, 0.05], [0.025, 0.058], [0, 0.06]], M.clay, 48);
  lid.position.y = 0.165;
  kit.part('lid', 'Tutup gerabah', [0, 0.12, 0], lid);
  return kit.finish();
}
