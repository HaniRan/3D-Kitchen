/**
 * Label bagian-bagian alat (HTML di atas kanvas), mengikuti posisi bagian saat exploded view.
 */
import * as THREE from 'three';
import { esc } from '../utils/dom.js';

export class PartLabels {
  constructor(stage, container) {
    this.stage = stage;
    this.el = container;
    this.items = [];
    this.visible = false;
    this.forced = false;
    this.box = new THREE.Box3();
    this.v = new THREE.Vector3();
  }
  set(model, show = false) {
    this.clear();
    const parts = model.userData.model?.parts || [];
    parts.forEach((p, i) => {
      const d = document.createElement('div');
      d.className = 'part-label';
      d.innerHTML = `<i>${i + 1}</i><span>${esc(p.label)}</span>`;
      this.el.appendChild(d);
      this.items.push({ p, d });
    });
    this.show(show || this.forced);
  }
  clear() { this.items = []; this.el.innerHTML = ''; }
  show(v) { this.visible = v; this.el.classList.toggle('show', v); }
  update() {
    if (!this.visible) return;
    const placed = [];
    for (const { p, d } of this.items) {
      this.box.setFromObject(p.obj);
      if (this.box.isEmpty()) { d.style.display = 'none'; continue; }
      this.box.getCenter(this.v);
      const s = this.stage.project(this.v);
      if (!s.visible) { d.style.display = 'none'; continue; }
      // hindari label bertumpuk
      let y = s.y;
      for (const q of placed) if (Math.abs(q.x - s.x) < 150 && Math.abs(q.y - y) < 26) y = q.y + 26;
      placed.push({ x: s.x, y });
      d.style.display = '';
      d.style.transform = `translate(${s.x}px, ${y}px)`;
    }
  }
}
