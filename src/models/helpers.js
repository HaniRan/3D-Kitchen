/**
 * Alat bantu geometri prosedural untuk membentuk peralatan dapur yang realistis:
 * lathe (benda putar: panci, gelas, piring), loft persegi bersudut bulat (loyang, GN pan),
 * extrude berbevel (pisau, spatula), tube (kawat, gagang), serta sistem "Kit" untuk
 * bagian (exploded view) dan animasi (rig).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const V2 = (x, y) => new THREE.Vector2(x, y);
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const PI = Math.PI;
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);

/* ------------------------------------------------------------------ */
/* Mesh dasar                                                          */
/* ------------------------------------------------------------------ */

export function mesh(geo, mat, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

/** Atur posisi/rotasi lalu kembalikan objek (chainable). */
export function at(o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
}

export function group(...children) {
  const g = new THREE.Group();
  children.flat().forEach((c) => c && g.add(c));
  return g;
}

export const box = (w, h, d, mat) => mesh(new THREE.BoxGeometry(w, h, d), mat);
export const rbox = (w, h, d, r, mat, seg = 3) =>
  mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)), mat);
export const cyl = (rt, rb, h, mat, seg = 32, open = false) =>
  mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat);
export const sphere = (r, mat, ws = 32, hs = 16) => mesh(new THREE.SphereGeometry(r, ws, hs), mat);
export const torus = (R, r, mat, rs = 12, ts = 48, arc = TAU) => mesh(new THREE.TorusGeometry(R, r, rs, ts, arc), mat);
export const plane = (w, h, mat) => mesh(new THREE.PlaneGeometry(w, h), mat, { cast: false });

/** Silinder pada sumbu X (mis. batang horizontal). */
export function cylX(r, len, mat, seg = 24) {
  const m = cyl(r, r, len, mat, seg);
  m.geometry.rotateZ(PI / 2);
  return m;
}
/** Silinder pada sumbu Z. */
export function cylZ(r, len, mat, seg = 24) {
  const m = cyl(r, r, len, mat, seg);
  m.geometry.rotateX(PI / 2);
  return m;
}

/* ------------------------------------------------------------------ */
/* Lathe                                                               */
/* ------------------------------------------------------------------ */

/** Titik-titik busur (untuk sudut membulat pada profil). */
export function arcPts(cx, cy, r, a0, a1, n = 6) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n);
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** Hapus titik berurutan yang terlalu berdekatan (mencegah normal NaN). */
function dedupe(pts, eps = 1e-6) {
  const out = [];
  for (const p of pts) {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > eps) out.push([Math.max(p[0], 0), p[1]]);
  }
  return out;
}

export function latheGeo(pts, seg = 48, phiStart = 0, phiLength = TAU) {
  return new THREE.LatheGeometry(dedupe(pts).map((p) => V2(p[0], p[1])), seg, phiStart, phiLength);
}
export const lathe = (pts, mat, seg = 48) => mesh(latheGeo(pts, seg), mat);

/** Wadah lathe lengkap; lip > 0 menambahkan bibir gulung (rolled rim) berbentuk torus. */
export function vessel(opts, mat, seg = 56) {
  const g = new THREE.Group();
  g.add(mesh(latheGeo(vesselProfile(opts), seg), mat));
  if (opts.lip > 0) {
    const t = mesh(new THREE.TorusGeometry(opts.rT - (opts.wall ?? 0.0015) / 2 + opts.lip * 0.4, opts.lip, 10, seg), mat);
    t.rotation.x = PI / 2;
    t.position.y = opts.h;
    g.add(t);
  }
  return g;
}

/**
 * Profil wadah berdinding (panci, mangkuk, gelas) — dari pusat dasar luar,
 * naik ke bibir, lalu turun di sisi dalam hingga pusat dasar dalam.
 * opts: rB (jari-jari dasar), rT (jari-jari atas), h, wall, base, corner, lip (bibir digulung),
 *       belly (tambahan perut), curve (fungsi custom r(t))
 */
export function vesselProfile({ rB, rT, h, wall = 0.0015, base = 0.003, corner = 0.01, lip = 0, belly = 0, steps = 10 }) {
  const out = [[0, 0]];
  const c = Math.min(corner, rB * 0.9, h * 0.5);
  // sudut bawah membulat (luar)
  out.push(...arcPts(rB - c, c, c, -PI / 2, 0, 6));
  // dinding luar
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const r = lerp(rB, rT, t) + Math.sin(t * PI) * belly;
    out.push([r, lerp(c, h, t)]);
  }
  // bibir membulat (bibir gulung ditambahkan terpisah sebagai torus — lihat vessel())
  out.push(...arcPts(rT - wall / 2, h, wall / 2, 0, PI, 4));
  // dinding dalam
  const ci = Math.max(c - wall, 0.001);
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const r = lerp(rB, rT, t) + Math.sin(t * PI) * belly - wall;
    out.push([r, lerp(base + ci, h, t)]);
  }
  out.push(...arcPts(rB - wall - ci, base + ci, ci, 0, -PI / 2, 6));
  out.push([0, base]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Loft persegi bersudut bulat (“lathe” untuk benda persegi)            */
/* ------------------------------------------------------------------ */

function rrectRing(hw, hd, r, n, y) {
  r = clamp(r, 0.0005, Math.min(hw, hd) - 1e-5);
  const pts = [];
  const corners = [[hw - r, hd - r, 0], [-hw + r, hd - r, PI / 2], [-hw + r, -hd + r, PI], [hw - r, -hd + r, PI * 1.5]];
  for (const [cx, cz, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (PI / 2) * (i / n);
      pts.push(V3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r));
    }
  }
  return pts;
}

/**
 * Membuat permukaan dari profil [offset, y] terhadap persegi dasar (w × d, radius r).
 * offset > 0 melebar keluar, offset < 0 menyempit ke dalam. Ring pertama & terakhir ditutup.
 */
export function rectLatheGeo(profile, w, d, r, n = 5, { capStart = true, capEnd = true } = {}) {
  const rings = profile.map(([o, y]) => rrectRing(w / 2 + o, d / 2 + o, r + o, n, y));
  const per = rings[0].length;
  const pos = [], uv = [], idx = [];
  rings.forEach((ring, ri) => ring.forEach((p, i) => {
    pos.push(p.x, p.y, p.z);
    uv.push(i / per, ri / (rings.length - 1));
  }));
  for (let ri = 0; ri < rings.length - 1; ri++) {
    for (let i = 0; i < per; i++) {
      const a = ri * per + i, b = ri * per + ((i + 1) % per);
      const c = (ri + 1) * per + i, e = (ri + 1) * per + ((i + 1) % per);
      idx.push(a, c, b, b, c, e);
    }
  }
  const cap = (ri, flip) => {
    const ring = rings[ri], y = ring[0].y;
    const ci = pos.length / 3;
    pos.push(0, y, 0);
    uv.push(0.5, 0.5);
    for (let i = 0; i < per; i++) {
      const a = ri * per + i, b = ri * per + ((i + 1) % per);
      flip ? idx.push(ci, b, a) : idx.push(ci, a, b);
    }
  };
  if (capStart) cap(0, false);
  if (capEnd) cap(rings.length - 1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Wadah persegi (loyang, GN pan, bak fryer) dengan dinding miring & bibir. */
export function trayGeo({ w, d, h, r = 0.03, flare = 0.01, wall = 0.0012, lip = 0.008, corner = 0.008 }) {
  const p = [
    [-flare - corner * 0.6, 0],
    [-flare - corner * 0.15, corner * 0.4],
    [-flare, corner],
    [0, h],
    [lip, h],
    [lip, h - wall * 2],
    [-wall, h - wall * 2],
    [-flare - wall, corner + wall],
    [-flare - corner * 0.15 - wall, corner * 0.4 + wall],
    [-flare - corner * 0.6 - wall, wall],
  ];
  return rectLatheGeo(p, w, d, r, 5);
}

/* ------------------------------------------------------------------ */
/* Shape, extrude, tube                                                */
/* ------------------------------------------------------------------ */

export function shapeFrom(pts, holes = []) {
  const s = new THREE.Shape(pts.map(([x, y]) => V2(x, y)));
  holes.forEach((h) => s.holes.push(new THREE.Path(h.map(([x, y]) => V2(x, y)))));
  return s;
}

export function roundedRectShape(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape();
  const x = cx - w / 2, y = cy - h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function circlePath(cx, cy, r, n = 24) {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, TAU, true);
  return p;
}

/** Extrude berpusat di z=0, dengan bevel untuk tepi membulat. */
export function extrudeGeo(shape, depth, { bevel = 0, bevelT = null, segs = 3, curveSegments = 24 } = {}) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevelT ?? bevel,
    bevelSegments: segs, curveSegments,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * Menipiskan bilah ke arah mata pisau: ketebalan diskalakan berdasarkan jarak
 * tiap verteks ke garis mata pisau (edge polyline), sehingga bilah tampak diasah.
 */
export function taperToEdge(geo, edgePts, grind = 0.012, minScale = 0.06) {
  const pos = geo.attributes.position;
  const segDist = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    let d = Infinity;
    for (let k = 0; k < edgePts.length - 1; k++) {
      d = Math.min(d, segDist(x, y, edgePts[k][0], edgePts[k][1], edgePts[k + 1][0], edgePts[k + 1][1]));
    }
    const s = minScale + (1 - minScale) * smooth(clamp(d / grind, 0, 1));
    pos.setZ(i, pos.getZ(i) * s);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Geometri bilah pisau berbasis grid: bilah didefinisikan oleh garis punggung (spine) dan
 * garis mata (edge) sebagai fungsi x. Ketebalan menipis halus ke arah mata (grind) dan ke ujung
 * (distal taper) sehingga pantulan cahaya terlihat seperti pisau asli.
 * spine/edge: array [x,y] terurut naik pada x, keduanya bertemu di ujung (tip).
 */
export function bladeGeo(spine, edge, { thick = 0.0024, grind = 0.012, nx = 80, ny = 10, distal = 0.55, edgeFn = null } = {}) {
  const interp = (pts, x) => {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0] || 1));
    }
    return pts[pts.length - 1][1];
  };
  const x0 = Math.min(spine[0][0], edge[0][0]);
  const x1 = Math.max(spine[spine.length - 1][0], edge[edge.length - 1][0]);
  const pos = [], uv = [], idx = [];
  const W = ny + 1;
  // dua sisi (front z+, back z-)
  for (const side of [1, -1]) {
    for (let i = 0; i <= nx; i++) {
      const u = i / nx, x = lerp(x0, x1, u);
      const ys = interp(spine, x);
      let ye = interp(edge, x);
      if (edgeFn) ye = edgeFn(x, ye);
      const h = Math.max(ys - ye, 0);
      for (let j = 0; j <= ny; j++) {
        const v = Math.pow(j / ny, 1.6); // rapat dekat mata pisau
        const y = ye + h * v;
        const d = h * v;
        const g = 0.04 + 0.96 * smooth(clamp(d / grind, 0, 1));
        const dt = 1 - distal * Math.pow(u, 2);
        pos.push(x, y, side * (thick / 2) * g * dt);
        uv.push(u, v);
      }
    }
  }
  const off = (nx + 1) * W;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const a = i * W + j, b = (i + 1) * W + j, c = a + 1, d = b + 1;
    idx.push(a, b, c, c, b, d); // depan
    idx.push(off + a, off + c, off + b, off + c, off + d, off + b); // belakang
  }
  // tutup punggung (j = ny) dan mata (j = 0)
  for (let i = 0; i < nx; i++) {
    const a = i * W + ny, b = (i + 1) * W + ny;
    idx.push(a, b, off + a, b, off + b, off + a);
    const e = i * W, f = (i + 1) * W;
    idx.push(e, off + e, f, f, off + e, off + f);
  }
  // tutup tumit (i = 0) dan ujung depan (i = nx; berimpit bila ujung runcing)
  for (let j = 0; j < ny; j++) {
    const a = j, c = j + 1;
    idx.push(a, c, off + a, c, off + c, off + a);
    const t = nx * W + j, tc = t + 1;
    idx.push(t, off + t, tc, tc, off + t, off + tc);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Strip pipih berbasis grid (untuk sendok, garpu, pisau makan): lebar ditentukan fungsi
 * top(x) & bot(x), ketebalan konstan, dan zFn(x,y) untuk lengkungan (cekung sendok, tekukan gagang).
 */
export function stripGeo(top, bot, x0, x1, { thick = 0.0024, nx = 90, ny = 12, zFn = () => 0, capNormals = true } = {}) {
  const pos = [], idx = [];
  const W = ny + 1;
  for (const side of [1, -1]) {
    for (let i = 0; i <= nx; i++) {
      const x = lerp(x0, x1, i / nx);
      const yt = top(x), yb = bot(x);
      for (let j = 0; j <= ny; j++) {
        const y = lerp(yb, yt, j / ny);
        pos.push(x, y, zFn(x, y) + (side * thick) / 2);
      }
    }
  }
  const off = (nx + 1) * W;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const a = i * W + j, b = (i + 1) * W + j, c = a + 1, d = b + 1;
    idx.push(a, b, c, c, b, d);
    idx.push(off + a, off + c, off + b, off + c, off + d, off + b);
  }
  const faceCount = idx.length;
  for (let i = 0; i < nx; i++) {
    const a = i * W + ny, b = (i + 1) * W + ny;
    idx.push(a, b, off + a, b, off + b, off + a);
    const e = i * W, f = (i + 1) * W;
    idx.push(e, off + e, f, f, off + e, off + f);
  }
  for (let j = 0; j < ny; j++) {
    const a = j, c = j + 1;
    idx.push(a, c, off + a, c, off + c, off + a);
    const t = nx * W + j, tc = t + 1;
    idx.push(t, off + t, tc, tc, off + t, off + tc);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  // capNormals=false: normal hanya dari permukaan atas/bawah (sambungan antar strip tak terlihat)
  geo.setIndex(capNormals ? idx : idx.slice(0, faceCount));
  geo.computeVertexNormals();
  if (capNormals) return geo;
  // permukaan atas/bawah: normal halus; tepi (cap): normal datar per segitiga
  const n = geo.attributes.normal;
  const P = [], N = [];
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
  for (let k = 0; k < idx.length; k += 3) {
    const tri = [idx[k], idx[k + 1], idx[k + 2]];
    if (k < faceCount) {
      for (const v of tri) { P.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); N.push(n.getX(v), n.getY(v), n.getZ(v)); }
    } else {
      va.fromArray(pos, tri[0] * 3); vb.fromArray(pos, tri[1] * 3); vc.fromArray(pos, tri[2] * 3);
      const fn = vc.sub(vb).cross(va.sub(vb)).normalize();
      for (const v of tri) { P.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); N.push(fn.x, fn.y, fn.z); }
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  return out;
}

/** Tabung mengikuti titik-titik (kawat, gagang bundar). */
export function tubeGeo(pts, r, { segs = 64, radial = 10, closed = false, tension = 0.5, type = 'catmullrom' } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => (p.isVector3 ? p : V3(...p))), closed, type, tension);
  return new THREE.TubeGeometry(curve, segs, r, radial, closed);
}
export const tube = (pts, r, mat, opts) => mesh(tubeGeo(pts, r, opts), mat);

/** Tutup ujung tabung dengan bola kecil. */
export function capEnds(pts, r, mat) {
  const a = pts[0], b = pts[pts.length - 1];
  return [at(sphere(r, mat, 12, 8), ...a), at(sphere(r, mat, 12, 8), ...b)];
}

/** Deformasi verteks dengan fungsi (x,y,z) → [x,y,z]. */
export function deform(geo, fn) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const r = fn(p.getX(i), p.getY(i), p.getZ(i));
    p.setXYZ(i, r[0], r[1], r[2]);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Kenop kontrol (knob) dengan alur & penunjuk. */
export function knob(r = 0.018, h = 0.02, mat, markMat) {
  const pts = [[0, 0], [r * 0.95, 0], [r, h * 0.15], [r * 0.92, h * 0.85], [r * 0.7, h], [0, h]];
  const k = lathe(pts, mat, 24);
  k.geometry.rotateX(PI / 2);
  const g = group(k);
  if (markMat) {
    const mk = box(r * 0.18, r * 0.9, 0.002, markMat);
    mk.position.set(0, r * 0.35, h + 0.0005);
    g.add(mk);
  }
  return g;
}

/** Kaki penyetel (bullet foot) untuk peralatan besar. */
export function bulletFoot(h = 0.15, r = 0.022, mat) {
  return lathe([[0, 0], [r * 0.7, 0], [r, h * 0.12], [r, h * 0.5], [r * 0.55, h], [0, h]], mat, 20);
}

/** Roda kastor. */
export function caster(r = 0.04, mat, wheelMat) {
  const g = group();
  const plate = box(r * 2, 0.006, r * 2, mat);
  plate.position.y = r * 2.4;
  const fork = box(r * 1.2, r * 1.3, r * 0.15, mat);
  fork.position.set(0, r * 1.7, 0);
  const wheel = mesh(new THREE.CylinderGeometry(r, r, r * 0.8, 20), wheelMat);
  wheel.geometry.rotateX(PI / 2);
  wheel.position.y = r;
  g.add(plate, fork, wheel);
  return g;
}

/* ------------------------------------------------------------------ */
/* Kit: bagian (exploded view) + rig animasi                           */
/* ------------------------------------------------------------------ */

/**
 * Kit membungkus model: menyimpan daftar bagian (part) beserta arah explode,
 * status animasi (power, speed, door, lid, tilt, dll.) yang dihaluskan setiap frame.
 */
export class Kit {
  constructor(name) {
    this.root = new THREE.Group();
    this.root.name = name;
    this.parts = [];
    this.state = {};
    this.target = {};
    this.rates = {};
    this.applyFns = [];
    this.owned = [];
    this.t = 0;
  }

  /**
   * Daftarkan bagian. dir = vektor pergeseran saat exploded view (meter).
   * Struktur: outer (digeser exploded view) → inner (dipakai animasi). Mengembalikan inner.
   */
  part(name, label, dir, ...objs) {
    const outer = new THREE.Group();
    outer.name = name;
    const inner = new THREE.Group();
    outer.add(inner);
    objs.flat().forEach((o) => o && inner.add(o));
    this.root.add(outer);
    this.parts.push({ name, label, obj: outer, inner, dir: dir ? V3(...dir) : null });
    return inner;
  }

  /** Material milik model ini saja (untuk lampu/elemen yang menyala sendiri). */
  own(mat) {
    const c = mat.clone();
    this.owned.push(c);
    return c;
  }

  /** Daftarkan variabel status animasi beserta nilai awal & kecepatan transisi. */
  stateVar(key, initial = 0, rate = 3) {
    this.state[key] = initial;
    this.target[key] = initial;
    this.rates[key] = rate;
  }

  onApply(fn) {
    this.applyFns.push(fn);
  }

  finish(meta = {}) {
    const kit = this;
    // simpan posisi dasar tiap bagian setelah semua posisi ditetapkan
    kit.parts.forEach((p) => { p.base = p.obj.position.clone(); });
    const api = {
      parts: kit.parts,
      state: kit.state,
      meta,
      has: (k) => k in kit.state,
      set(k, v) { if (k in kit.target) kit.target[k] = v; },
      get: (k) => kit.state[k],
      reset() {
        for (const k in kit.target) kit.target[k] = kit.initial[k];
      },
      snap() {
        for (const k in kit.target) kit.state[k] = kit.target[k];
      },
      tick(dt) {
        kit.t += dt;
        for (const k in kit.target) {
          const s = kit.state[k], t = kit.target[k];
          if (typeof t === 'number') {
            const r = kit.rates[k];
            kit.state[k] = Math.abs(t - s) < 1e-4 ? t : s + (t - s) * (1 - Math.exp(-r * dt));
          } else kit.state[k] = t;
        }
        kit.applyFns.forEach((fn) => fn(kit.state, dt, kit.t));
      },
    };
    kit.initial = { ...kit.target };
    kit.root.userData.model = api;
    kit.root.traverse((o) => {
      if (o.isMesh) {
        // jangan biarkan objek transparan/emisif tipis menghasilkan bayangan aneh
        const m = o.material;
        if (m && (m.transparent || m.blending === THREE.AdditiveBlending)) o.castShadow = false;
      }
    });
    api.tick(0);
    return kit.root;
  }
}

/** Objek api biru (kerucut aditif) untuk tungku gas. */
export function flameRing(R, mat, n = 20, h = 0.025) {
  const g = new THREE.Group();
  const geo = new THREE.ConeGeometry(0.004, h, 6, 1, true);
  geo.translate(0, h / 2, 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const f = new THREE.Mesh(geo, mat);
    f.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
    f.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    g.add(f);
  }
  return g;
}

/** Partikel uap sederhana (sprite bola) — dianimasikan dengan steamTick. */
export function steamPuffs(count, mat, spread = 0.1) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 10, 8);
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.userData.seed = Math.random();
    m.userData.spread = spread;
    m.scale.setScalar(0.001);
    g.add(m);
  }
  return g;
}
export function steamTick(g, t, amount, height = 0.25, size = 0.03) {
  g.children.forEach((m) => {
    const s = m.userData.seed, sp = m.userData.spread;
    const p = (t * 0.35 + s) % 1;
    m.position.set(Math.sin(s * 40 + t * 0.8) * sp * (0.3 + p), p * height, Math.cos(s * 23) * sp * (0.3 + p));
    m.scale.setScalar(Math.max(0.0001, size * (0.4 + p) * amount));
  });
  if (g.children[0]) g.children[0].material.opacity = 0.22 * amount;
}

/**
 * Gabungkan banyak mesh berbahan sama menjadi satu mesh (hemat draw call).
 * Transformasi tiap mesh (relatif terhadap parent-nya) dipanggang ke geometri.
 */
export function mergeMeshes(list, mat) {
  const geos = list.map((m) => {
    m.updateMatrix();
    let g = m.geometry.clone();
    if (g.index !== null) g = g.toNonIndexed();
    g.applyMatrix4(m.matrix);
    // samakan atribut agar dapat digabung
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    return g;
  });
  return mesh(mergeGeometries(geos, false), mat);
}

/** Pintu oven dengan bingkai, kaca gelap & gagang batang. */
export function ovenDoor(w, h, { frame = 0.012, glass = true, handle = 'top', depth = 0.04, mat, glassMat, handleMat } = {}) {
  const g = new THREE.Group();
  const shape = roundedRectShape(w, h, 0.012);
  if (glass) shape.holes.push(roundedRectShape(w - 0.12, h * 0.55, 0.01, 0, -h * 0.02));
  const body = mesh(extrudeGeo(shape, depth - 0.006, { bevel: 0.003, segs: 2 }), mat);
  g.add(body);
  if (glass) {
    const pane = mesh(new THREE.PlaneGeometry(w - 0.11, h * 0.55 + 0.01), glassMat);
    pane.position.set(0, -h * 0.02, depth / 2 - 0.004);
    g.add(pane);
  }
  if (handle === 'top' || handle === 'side') {
    const vertical = handle === 'side';
    const L = vertical ? h * 0.6 : w * 0.8;
    const bar = mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 16), handleMat);
    if (!vertical) bar.rotation.z = PI / 2;
    const off = 0.05;
    bar.position.set(vertical ? w / 2 - 0.05 : 0, vertical ? 0 : h / 2 - 0.045, depth / 2 + off);
    g.add(bar);
    for (const s of [-1, 1]) {
      const st = mesh(new THREE.CylinderGeometry(0.008, 0.01, off, 12), handleMat);
      st.rotation.x = PI / 2;
      st.position.set(vertical ? w / 2 - 0.05 : (s * L) / 2.4, vertical ? (s * L) / 2.4 : h / 2 - 0.045, depth / 2 + off / 2);
      g.add(st);
    }
  }
  return g;
}
