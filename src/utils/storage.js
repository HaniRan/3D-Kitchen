/**
 * Penyimpanan progress belajar di localStorage (dengan penanganan error bila tidak tersedia).
 */
const KEY = 'sim3d-peralatan-dapur-v1';

const DEFAULT = () => ({
  learned: [], viewed: [], sims: [], maint: [], quizBest: 0, quizLast: null, identifyBest: 0, classifyBest: 0,
  conditions: {}, sound: true, visited: false,
});

export class Progress {
  constructor() {
    this.data = DEFAULT();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = { ...DEFAULT(), ...JSON.parse(raw) };
    } catch (e) { /* mode privat / storage diblokir */ }
    this.listeners = new Set();
  }
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* abaikan */ }
    this.listeners.forEach((fn) => fn(this.data));
  }
  onChange(fn) { this.listeners.add(fn); }
  addTo(list, id) {
    if (!this.data[list].includes(id)) { this.data[list].push(id); this.save(); return true; }
    return false;
  }
  has(list, id) { return this.data[list].includes(id); }
  set(k, v) { this.data[k] = v; this.save(); }
  reset() { const s = this.data.sound; this.data = DEFAULT(); this.data.sound = s; this.save(); }
}
