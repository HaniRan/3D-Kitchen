/**
 * Model pisau & alat potong: Vegetable/Paring Knife, Chopping (Chef) Knife, Filleting Knife,
 * Boning Knife, Bread Knife, Cleaver, Sharpener (honing steel), Carving Fork.
 *
 * Orientasi: profil pisau berdiri pada bidang XY (ujung pisau ke +X, mata pisau ke bawah),
 * ketebalan pada sumbu Z. Satuan meter dengan ukuran mendekati ukuran asli.
 */
import * as THREE from 'three';
import { M } from './materials.js';
import {
  Kit, mesh, at, group, rbox, cyl, sphere, torus, lathe, latheGeo, shapeFrom, extrudeGeo,
  bladeGeo, tube, PI, TAU, arcPts, V3, clamp, lerp,
} from './helpers.js';

/* ---------------- gagang ---------------- */

/** Profil gagang (sisi samping). len = panjang, h = tinggi. */
function handleShapePts(len, h, butt = 1) {
  const pts = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = -t * len;
    // sedikit menggembung di tengah, mengecil dekat bolster, ujung (butt) melengkung ke bawah
    const top = h * (0.42 + 0.08 * Math.sin(t * PI) - 0.02 * t);
    pts.push([x, top]);
  }
  // ujung belakang membulat & sedikit menukik
  pts.push(...arcPts(-len, -h * 0.02 * butt, h * 0.45, PI / 2, PI * 1.5, 8).map(([x, y]) => [x - h * 0.05, y - h * 0.05 * butt]));
  for (let i = n; i >= 0; i--) {
    const t = i / n, x = -t * len;
    const bot = -h * (0.44 + 0.1 * Math.sin(t * PI * 0.9) + 0.06 * t * t * butt);
    pts.push([x, bot]);
  }
  return pts;
}

/**
 * Gagang full-tang: tang baja di tengah + dua scale + paku keling.
 * mat = material scale, rivets = jumlah paku.
 */
function knifeHandle(len, h, { mat = M.handlePOM, rivets = 3, thick = 0.017, tang = true, butt = 1 } = {}) {
  const g = new THREE.Group();
  const pts = handleShapePts(len, h, butt);
  const shape = shapeFrom(pts);
  const tangT = tang ? 0.0026 : 0;
  const scaleT = (thick - tangT) / 2;
  const bev = Math.min(0.0028, scaleT * 0.6);
  const scaleDepth = Math.max(scaleT - bev, 0.0008);
  for (const s of [-1, 1]) {
    const geo = extrudeGeo(shape, scaleDepth, { bevel: bev, bevelT: bev, segs: 4, curveSegments: 8 });
    // bevel hanya pada sisi luar: geser sehingga sisi dalam menempel tang
    const m = mesh(geo, mat);
    m.position.z = s * (tangT / 2 + scaleT / 2);
    g.add(m);
  }
  if (tang) {
    const tangShape = shapeFrom(handleShapePts(len, h * 1.0, butt));
    const tm = mesh(extrudeGeo(tangShape, tangT, { bevel: 0.0002, segs: 1, curveSegments: 8 }), M.steelPolished);
    g.add(tm);
  }
  // paku keling (rivet) menembus gagang
  for (let i = 0; i < rivets; i++) {
    const x = -len * (0.2 + (0.62 * i) / Math.max(rivets - 1, 1));
    const r = cyl(0.0029, 0.0029, tangT + 2 * scaleT + bev + 0.0003, M.steelPolished, 20);
    r.rotation.x = PI / 2;
    r.position.set(x, -h * 0.02, 0);
    g.add(r);
  }
  return g;
}

/** Bolster (penahan) di antara bilah dan gagang. */
function bolster(h, thick = 0.012) {
  const pts = [[0.004, h * 0.48], [0.012, h * 0.3], [0.014, -h * 0.1], [0.008, -h * 0.55], [-0.006, -h * 0.56], [-0.006, h * 0.5]];
  const g = extrudeGeo(shapeFrom(pts), thick - 0.004, { bevel: 0.002, segs: 3, curveSegments: 6 });
  return mesh(g, M.steelPolished);
}

/** Bilah dari garis punggung (spine) & garis mata (edge). */
function bladeMesh(spine, edge, opts = {}, mat = M.blade) {
  return mesh(bladeGeo(spine, edge, opts), mat);
}

/** Merakit pisau lengkap dengan bagian-bagian untuk exploded view. */
function assembleKnife(name, { spine, edge, blade = {}, handleLen, handleH, handleThick = 0.017, bolsterH, handleMat, rivets, tang, offsetY = 0, butt }) {
  const kit = new Kit(name);
  kit.part('blade', 'Bilah (blade) — mata, ujung, punggung', [0.05, 0, 0], bladeMesh(spine, edge, blade));
  if (bolsterH) kit.part('bolster', 'Bolster / penahan', [0, 0.03, 0], at(bolster(bolsterH), 0, offsetY, 0));
  const handle = knifeHandle(handleLen, handleH, { mat: handleMat, rivets, tang, butt, thick: handleThick });
  handle.position.y = offsetY;
  kit.part('handle', 'Gagang (handle) & paku keling', [-0.05, 0, 0], handle);
  return kit;
}

/* ---------------- pisau-pisau ---------------- */

export function buildChoppingKnife() {
  // Pisau koki (chef's knife) 21 cm
  return assembleKnife('chopping-knife', {
    // punggung lurus lalu turun landai ke ujung; mata pisau lurus di tumit lalu "belly" melengkung naik
    spine: [[0, 0.0105], [0.06, 0.0104], [0.12, 0.0094], [0.155, 0.0072], [0.18, 0.0042], [0.2, 0.0012], [0.212, -0.0012]],
    edge: [[0, -0.034], [0.006, -0.0362], [0.06, -0.0362], [0.1, -0.0352], [0.13, -0.0325], [0.155, -0.0275], [0.175, -0.021], [0.192, -0.0135], [0.204, -0.007], [0.212, -0.0012]],
    blade: { thick: 0.0026, grind: 0.024, distal: 0.5 },
    handleLen: 0.125, handleH: 0.024, bolsterH: 0.03, rivets: 3, offsetY: -0.002,
  }).finish();
}

export function buildVegetableKnife() {
  // Pisau kecil (paring/vegetable knife) 9 cm
  return assembleKnife('vegetable-knife', {
    spine: [[0, 0.0068], [0.055, 0.0066], [0.075, 0.003], [0.092, -0.0068]],
    edge: [[0, -0.0115], [0.004, -0.0128], [0.06, -0.0124], [0.08, -0.0104], [0.092, -0.0068]],
    blade: { thick: 0.0018, grind: 0.008, distal: 0.4 },
    handleLen: 0.095, handleH: 0.0175, handleThick: 0.0135, bolsterH: 0.019, rivets: 3, offsetY: -0.0025,
  }).finish();
}

export function buildFilletingKnife() {
  // Pisau fillet: bilah tipis, sempit, lentur
  return assembleKnife('filleting-knife', {
    spine: [[0, 0.0062], [0.08, 0.0058], [0.14, 0.0044], [0.175, 0.0024], [0.196, 0.0003]],
    edge: [[0, -0.0115], [0.008, -0.0128], [0.05, -0.0122], [0.12, -0.0093], [0.17, -0.0048], [0.196, 0.0003]],
    blade: { thick: 0.0016, grind: 0.009, distal: 0.5 },
    handleLen: 0.12, handleH: 0.022, bolsterH: 0.022, rivets: 3, offsetY: -0.002,
  }).finish();
}

export function buildBoningKnife() {
  // Pisau boning: bilah sempit, lengkung di dekat tumit, ujung runcing
  return assembleKnife('boning-knife', {
    spine: [[0, 0.0068], [0.06, 0.0064], [0.12, 0.0038], [0.152, 0.0004]],
    edge: [[0, -0.0155], [0.006, -0.017], [0.02, -0.0168], [0.03, -0.0152], [0.042, -0.012], [0.056, -0.0088], [0.08, -0.0066], [0.12, -0.0042], [0.152, 0.0004]],
    blade: { thick: 0.002, grind: 0.008, distal: 0.5 },
    handleLen: 0.12, handleH: 0.023, bolsterH: 0.026, rivets: 3, offsetY: -0.002,
  }).finish();
}

export function buildBreadKnife() {
  // Pisau roti bergerigi (serrated), ujung membulat
  const p = 0.0068;
  return assembleKnife('bread-knife', {
    spine: [[0, 0.007], [0.205, 0.0068], [0.219, 0.0045], [0.227, 0.0], [0.231, -0.008]],
    edge: [[0, -0.022], [0.215, -0.022], [0.225, -0.019], [0.2295, -0.014], [0.231, -0.008]],
    blade: {
      thick: 0.0022, grind: 0.009, distal: 0.2, nx: 260,
      edgeFn: (x, y) => (x > 0.006 && x < 0.216 ? -0.0236 + 0.002 * Math.abs(Math.sin((PI * (x - 0.006)) / p)) : y),
    },
    handleLen: 0.125, handleH: 0.023, bolsterH: 0.026, rivets: 3, offsetY: -0.002,
  }).finish();
}

export function buildCleaver() {
  // Cleaver: bilah persegi lebar, punggung tebal, lubang gantungan
  const kit = new Kit('cleaver');
  const mat = kit.own(M.blade);
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#000';
  g.beginPath();
  g.ellipse(0.85 * 512, (1 - 0.82) * 512, 0.041 * 512, 0.083 * 512, 0, 0, TAU);
  g.fill();
  const alpha = new THREE.CanvasTexture(c);
  mat.alphaMap = alpha;
  mat.alphaTest = 0.5;
  mat.side = THREE.DoubleSide;
  const blade = bladeMesh(
    [[0, 0.026], [0.172, 0.028], [0.18, 0.027], [0.182, 0.022]],
    [[0, -0.055], [0.006, -0.062], [0.04, -0.063], [0.12, -0.062], [0.178, -0.06], [0.182, -0.052]],
    { thick: 0.0048, grind: 0.03, distal: 0.15, nx: 60, ny: 14 }, mat,
  );
  kit.part('blade', 'Bilah tebal & lubang gantungan', [0.06, 0, 0], blade);
  kit.part('bolster', 'Leher / bolster', [0, 0.03, 0], at(rbox(0.012, 0.026, 0.012, 0.003, M.steelPolished), -0.002, 0.012, 0));
  const h = knifeHandle(0.12, 0.026, { mat: M.woodDark, rivets: 3, thick: 0.02, butt: 0.4 });
  h.position.y = 0.012;
  kit.part('handle', 'Gagang kayu & paku keling', [-0.05, 0, 0], h);
  return kit.finish();
}

export function buildSharpener() {
  // Honing steel: batang beralur, pelindung jari, gagang, cincin gantungan
  const kit = new Kit('sharpener');
  const rod = mesh(new THREE.CylinderGeometry(0.0045, 0.0068, 0.25, 28, 1), M.steelSatin);
  rod.geometry.rotateZ(-PI / 2);
  rod.position.x = 0.125;
  const tipCap = sphere(0.0045, M.steelSatin, 16, 8);
  tipCap.position.x = 0.25;
  kit.part('rod', 'Batang pengasah beralur', [0.06, 0, 0], rod, tipCap);
  const guard = lathe([[0, -0.004], [0.017, -0.003], [0.019, 0], [0.017, 0.003], [0, 0.004]], M.steelPolished, 36);
  guard.geometry.rotateZ(PI / 2);
  guard.scale.set(1, 1, 0.55);
  kit.part('guard', 'Pelindung jari (guard)', [0, 0.03, 0], guard);
  const hp = [[0, 0], [0.012, 0], [0.0135, 0.02], [0.0125, 0.06], [0.0135, 0.1], [0.012, 0.118], [0.006, 0.124], [0, 0.124]];
  const handle = lathe(hp, M.handlePOM, 32);
  handle.geometry.rotateZ(PI / 2);
  handle.position.x = -0.004;
  const ring = torus(0.011, 0.0018, M.steelPolished, 10, 32);
  ring.position.set(-0.14, 0, 0);
  kit.part('handle', 'Gagang & cincin gantung', [-0.05, 0, 0], handle, ring);
  return kit.finish();
}

export function buildCarvingFork() {
  // Garpu daging (carving fork) tempa: satu bilah baja pipih yang terbelah menjadi dua mata
  // garpu panjang & runcing (sebidang dengan tang), sedikit melengkung, bolster & gagang berpaku keling.
  const kit = new Kit('carving-fork');
  const x0 = 0.0, xC = 0.052, xT = 0.178; // pangkal, celah (crotch), ujung
  const pts = [];
  const N = 14;
  // tepi atas: leher → mata garpu atas (tepi luar)
  pts.push([x0 - 0.002, 0.0062], [0.02, 0.006], [0.036, 0.0072], [0.046, 0.0096]);
  for (let i = 0; i <= N; i++) { const t = i / N, x = lerp(0.05, xT - 0.016, t); pts.push([x, 0.0104 - 0.0018 * t]); }
  pts.push([xT - 0.008, 0.0078], [xT, 0.0074]); // ujung runcing
  for (let i = N; i >= 0; i--) { const t = i / N, x = lerp(xC + 0.006, xT - 0.016, t); pts.push([x, 0.0056 + 0.0012 * t]); }
  // dasar celah membulat
  pts.push(...arcPts(xC + 0.006, 0, 0.0056, PI / 2, PI * 1.5, 10));
  for (let i = 0; i <= N; i++) { const t = i / N, x = lerp(xC + 0.006, xT - 0.016, t); pts.push([x, -(0.0056 + 0.0012 * t)]); }
  pts.push([xT, -0.0074], [xT - 0.008, -0.0078]);
  for (let i = N; i >= 0; i--) { const t = i / N, x = lerp(0.05, xT - 0.016, t); pts.push([x, -(0.0104 - 0.0018 * t)]); }
  pts.push([0.046, -0.0096], [0.036, -0.0072], [0.02, -0.006], [x0 - 0.002, -0.0062]);
  const geo = extrudeGeo(shapeFrom(pts), 0.0022, { bevel: 0.0007, bevelT: 0.0006, segs: 2, curveSegments: 4 });
  // meruncing ke ujung (ketebalan) & mata garpu sedikit melengkung ke atas
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = clamp((x - 0.05) / (xT - 0.05), 0, 1);
    p.setZ(i, z * (1 - 0.55 * t));
    p.setY(i, y + 0.012 * t * t);
  }
  geo.computeVertexNormals();
  const tines = mesh(geo, M.steelPolished);
  kit.part('tines', 'Dua mata garpu (tines) panjang & runcing', [0.05, 0, 0], tines);
  kit.part('bolster', 'Bolster', [0, 0.03, 0], at(bolster(0.021), 0, -0.001, 0));
  const h = knifeHandle(0.12, 0.022, { mat: M.handlePOM, rivets: 3 });
  h.position.y = -0.001;
  kit.part('handle', 'Gagang berpaku keling', [-0.05, 0, 0], h);
  return kit.finish();
}
