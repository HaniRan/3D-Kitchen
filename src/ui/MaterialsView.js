/**
 * BAHAN PEMBUAT PERALATAN: tujuh bahan dengan karakteristik, contoh, kelebihan, kekurangan,
 * dan perawatan, serta visual material 3D (swatch) berbeda untuk setiap bahan.
 */
import * as THREE from 'three';
import { h, esc, icon } from '../utils/dom.js';
import { materialsData, examplesFor } from '../data/materials.js';
import { M } from '../models/materials.js';
import { buildModel } from '../models/index.js';

const SWATCH = { steel: () => M.steel, copper: () => M.copper, castIron: () => M.castIron, aluminium: () => M.aluminium, wood: () => M.wood, clay: () => M.clay, glass: () => M.glass, plastic: () => M.plasticRed, stone: () => M.stone, fabric: () => M.fabricApron };

function swatchObject(key, label) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 64, 32), SWATCH[key]());
  s.position.y = 0.12;
  s.castShadow = true;
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.03, 48), M.enamelWhite);
  ped.position.y = 0.015;
  ped.receiveShadow = true;
  g.add(s, ped);
  g.userData.label = label;
  return g;
}

export function renderMaterials(app, params = {}) {
  const current = params.mat || 'logam';
  const mat = materialsData.find((m) => m.id === current);
  // --- panggung studio: swatch + contoh alat ---
  const stageModel = new THREE.Group();
  // satu baris rapi: bola material (swatch) di kiri, lalu contoh peralatan dari bahan tsb.
  const row = [];
  (mat.subtypes || [{ swatch: mat.swatch, name: mat.name }]).forEach((st) => row.push(swatchObject(st.swatch, st.name)));
  mat.sample.forEach((id) => {
    const m = buildModel(id);
    m.userData.model?.set('fill', 1); m.userData.model?.snap?.(); m.userData.model?.tick(0);
    const b = new THREE.Box3().setFromObject(m);
    const sz = b.getSize(new THREE.Vector3());
    m.scale.setScalar(Math.min(1, 0.34 / Math.max(sz.x, sz.y, sz.z)));
    const holder = new THREE.Group();
    holder.add(m);
    const c = new THREE.Box3().setFromObject(holder).getCenter(new THREE.Vector3());
    m.position.x -= c.x; m.position.z -= c.z;
    row.push(holder);
  });
  const widths = row.map((o) => new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).x);
  const gap = 0.08;
  let x = -(widths.reduce((t, w) => t + w, 0) + gap * (row.length - 1)) / 2;
  row.forEach((o, i) => { o.position.x = x + widths[i] / 2; x += widths[i] + gap; stageModel.add(o); });
  stageModel.userData.model = { parts: [], tick() {}, reset() {}, set() {}, has: () => false };
  app.mode !== 'studio' && app._savePose();
  app.mode = 'studio';
  app.studio.show(stageModel);
  app.studioModel = stageModel;
  app.stage.setScene(app.studio.scene);
  app.stage.setPickables([]);
  app.labels.clear();
  const v = app.studio.view(new THREE.Vector3(0.1, 0.38, 1));
  app.stage.flyTo(v.pos, v.target, 0.8);
  app.stage.autoRotate = false;
  app.selected = null;

  const list = h(`<div class="mat-view">
    <div class="panel-head"><h3>Bahan Pembuat Peralatan</h3><p class="muted">Berdasarkan bahan pembuatnya, peralatan dapur terbagi menjadi tujuh jenis.</p></div>
    <div class="mat-tabs"></div>
    <div class="card mat-detail">
      <h2>${mat.icon} ${esc(mat.name)}</h2>
      <h4>Karakteristik</h4><p>${esc(mat.characteristics)}</p>
      ${mat.subtypes ? `<h4>Jenis logam</h4><div class="subtypes">${mat.subtypes.map((s) => `<div class="subtype"><b>${esc(s.name)}</b><span>${esc(s.note)}</span></div>`).join('')}</div>` : ''}
      ${mat.examples ? `<h4>Contoh peralatan (bahan ajar)</h4><p>${esc(mat.examples)}</p>` : ''}
      <h4>Contoh peralatan di simulator</h4><div class="chips ex-chips"></div>
      <div class="two-col">
        <div><h4 class="ok">Kelebihan</h4><ul>${mat.pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
        <div><h4 class="no">Kekurangan</h4><ul>${mat.cons.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
      </div>
      <h4>Cara perawatan</h4><ol class="steps">${mat.care.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
    </div>
  </div>`);
  const tabs = list.querySelector('.mat-tabs');
  materialsData.forEach((m) => {
    const b = h(`<button class="mat-tab${m.id === current ? ' on' : ''}"><span>${m.icon}</span>${esc(m.name)}</button>`);
    b.onclick = () => app.navigate('materials', { mat: m.id });
    tabs.appendChild(b);
  });
  const ex = list.querySelector('.ex-chips');
  examplesFor(current, app.data.equipment).forEach((e) => {
    const c = h(`<button class="chip chip-link">${esc(e.name)}</button>`);
    c.onclick = () => { app.navigate('list', { keep: true }); app.selectEquipment(e.id); };
    ex.appendChild(c);
  });
  app.setPanel(list);
  app._updateTools();
}
