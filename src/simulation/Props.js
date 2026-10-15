/**
 * Properti pendukung simulasi (bahan & wadah) untuk animasi penggunaan kitchen utensils.
 */
import * as THREE from 'three';
import { M, colorMat } from '../models/materials.js';
import { buildModel } from '../models/index.js';
import { mesh, at, group, rbox, cyl, sphere, lathe, vessel, PI } from '../models/helpers.js';

export function carrot() {
  const g = lathe([[0, 0], [0.006, 0.01], [0.014, 0.06], [0.017, 0.13], [0.012, 0.15], [0, 0.152]], M.carrot, 20);
  g.rotation.z = PI / 2;
  g.position.y = 0.017;
  const leaf = mesh(new THREE.ConeGeometry(0.012, 0.05, 6), M.leaf);
  leaf.rotation.z = -PI / 2;
  leaf.position.set(-0.17, 0.017, 0);
  return group(g, leaf);
}
export function breadLoaf() {
  const b = rbox(0.24, 0.1, 0.11, 0.045, M.bread, 4);
  b.position.y = 0.05;
  return group(b);
}
export function meatBlock() {
  const m = rbox(0.18, 0.05, 0.12, 0.02, M.meat, 3);
  m.position.y = 0.025;
  return group(m);
}
export function cheeseBlock() {
  const c = rbox(0.08, 0.05, 0.05, 0.004, M.cheese, 1);
  c.position.y = 0.025;
  return group(c);
}
export function soupPot() {
  const p = group(vessel({ rB: 0.13, rT: 0.13, h: 0.16, wall: 0.0016, base: 0.004, corner: 0.012, lip: 0.002 }, M.steel, 48));
  const s = cyl(0.126, 0.126, 0.002, M.soup, 40);
  s.position.y = 0.12;
  p.add(s);
  return p;
}
export function mixingBowl() {
  const b = group(vessel({ rB: 0.06, rT: 0.13, h: 0.1, wall: 0.0016, base: 0.003, corner: 0.04, lip: 0.002 }, M.steelPolished, 48));
  const c = lathe([[0, 0.006], [0.05, 0.006], [0.085, 0.04], [0.1, 0.06], [0, 0.062]], M.cream, 32);
  b.add(c);
  return b;
}
export function servingMat() {
  const m = rbox(0.42, 0.006, 0.32, 0.01, colorMat(0x2c3e50, 0.9), 2);
  m.position.y = 0.003;
  return group(m);
}
export function doughSheet() {
  const d = rbox(0.3, 0.012, 0.22, 0.006, M.dough, 2);
  d.position.y = 0.006;
  return group(d);
}
export function glassForPour() {
  return buildModel('juice-glass');
}
export function iceTub() {
  const g = group(vessel({ rB: 0.1, rT: 0.11, h: 0.1, wall: 0.002, base: 0.003, corner: 0.01 }, M.plasticWhite, 40));
  const ic = cyl(0.105, 0.105, 0.04, M.iceCreamPink, 32);
  ic.position.y = 0.075;
  g.add(ic);
  return g;
}
export function friedPatty() {
  const pan = buildModel('frying-pan');
  pan.userData.model?.set('fill', 1);
  pan.userData.model?.snap?.();
  pan.userData.model?.tick(0);
  return pan;
}
export function boardWith(itemFn) {
  const b = buildModel('cutting-board');
  const it = itemFn();
  it.position.y = 0.03;
  return group(b, it);
}
