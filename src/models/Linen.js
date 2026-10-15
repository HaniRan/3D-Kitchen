/**
 * Peralatan berbahan kain (linen): Apron, Kitchen Towel, Dish Towel, Oven Mitt.
 */
import * as THREE from 'three';
import { M, colorMat } from './materials.js';
import { Kit, mesh, at, group, rbox, cyl, torus, shapeFrom, extrudeGeo, tube, deform, PI, V3, arcPts } from './helpers.js';

export function buildApron() {
  const kit = new Kit('apron');
  // celemek dada (bib apron) tergantung
  const outline = [
    [-0.13, 0.86], [0.13, 0.86], [0.14, 0.82], [0.17, 0.66], [0.3, 0.56], [0.31, 0.52], [0.3, 0.0], [-0.3, 0.0], [-0.31, 0.52], [-0.3, 0.56], [-0.17, 0.66], [-0.14, 0.82],
  ];
  const geo = extrudeGeo(shapeFrom(outline), 0.002, { bevel: 0.0015, segs: 1, curveSegments: 12 });
  deform(geo, (x, y, z) => [x, y, z + 0.04 * Math.cos((x / 0.31) * PI * 0.5) + 0.01 * Math.sin(x * 40) * (1 - y)]);
  const body = mesh(geo, M.fabricApron);
  const pocket = mesh(extrudeGeo(shapeFrom([[-0.2, 0.18], [0.2, 0.18], [0.2, 0.36], [-0.2, 0.36]]), 0.002, { bevel: 0.001, segs: 1 }), M.fabricApron);
  deform(pocket.geometry, (x, y, z) => [x, y, z + 0.04 * Math.cos((x / 0.31) * PI * 0.5) + 0.004]);
  const seam = mesh(new THREE.BoxGeometry(0.004, 0.18, 0.004), colorMat(0x1a2730, 0.9));
  seam.position.set(0, 0.27, 0.047);
  kit.part('body', 'Kain celemek tebal & kantong', [0, 0, 0], body, pocket, seam);
  const strap = tube([V3(-0.125, 0.86, 0.035), V3(-0.1, 1.0, 0.02), V3(0, 1.06, 0.0), V3(0.1, 1.0, 0.02), V3(0.125, 0.86, 0.035)], 0.007, M.strap, { segs: 30, radial: 6 });
  const ties = new THREE.Group();
  for (const s of [-1, 1]) ties.add(tube([V3(s * 0.3, 0.54, 0.01), V3(s * 0.33, 0.45, 0.03), V3(s * 0.31, 0.3, 0.05), V3(s * 0.33, 0.15, 0.04)], 0.008, M.strap, { segs: 20, radial: 6 }));
  kit.part('straps', 'Tali leher & tali pinggang', [0, 0.1, 0.05], strap, ties);
  return kit.finish();
}

function foldedTowel(mat, w = 0.26, d = 0.18) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const layer = rbox(w, 0.009, d, 0.0044, mat, 2);
    layer.position.y = 0.0045 + i * 0.0088;
    layer.position.x = i * 0.002;
    g.add(layer);
  }
  // lipatan melengkung di satu sisi
  const fold = mesh(new THREE.CylinderGeometry(0.013, 0.013, d, 20, 1, true, 0, PI), mat);
  fold.rotation.x = PI / 2;
  fold.position.set(w / 2 - 0.002, 0.0135, 0);
  g.add(fold);
  return g;
}
export function buildKitchenTowel() {
  const kit = new Kit('kitchen-towel');
  kit.part('towel', 'Serbet dapur (kitchen towel) terlipat', [0, 0, 0], foldedTowel(M.fabricTowel));
  return kit.finish();
}
export function buildDishTowel() {
  const kit = new Kit('dish-towel');
  kit.part('towel', 'Lap piring putih (dish towel) terlipat', [0, 0, 0], foldedTowel(M.fabricWhite, 0.28, 0.2));
  return kit.finish();
}

export function buildOvenMitt() {
  const kit = new Kit('oven-mitt');
  const outline = [
    [-0.055, 0], [0.055, 0], [0.06, 0.08], [0.065, 0.15], [0.06, 0.22], ...arcPts(0.0, 0.22, 0.06, 0, PI, 14),
    [-0.06, 0.2], [-0.075, 0.17], [-0.1, 0.16], [-0.112, 0.14], [-0.1, 0.12], [-0.068, 0.1], [-0.058, 0.07],
  ];
  const geo = extrudeGeo(shapeFrom(outline), 0.028, { bevel: 0.014, bevelT: 0.012, segs: 5, curveSegments: 14 });
  const mitt = mesh(geo, M.fabricMitt);
  // garis jahitan quilting
  const lines = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const l = mesh(new THREE.BoxGeometry(0.11, 0.002, 0.002), colorMat(0x5e1b19, 0.9));
    l.position.set(0, 0.05 + i * 0.035, 0.0275);
    l.rotation.z = 0.6;
    lines.add(l);
  }
  const cuff = rbox(0.14, 0.045, 0.062, 0.02, M.fabricWhite, 3);
  cuff.position.set(0, 0.012, 0);
  const loop = torus(0.014, 0.003, M.fabricWhite, 6, 20);
  loop.position.set(0.0, -0.022, 0);
  kit.part('mitt', 'Sarung tangan tebal berlapis (quilted)', [0, 0.06, 0], mitt, lines);
  kit.part('cuff', 'Manset & tali gantung', [0, -0.05, 0], cuff, loop);
  return kit.finish({ studio: {} });
}
