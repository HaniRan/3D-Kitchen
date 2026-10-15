/**
 * Audio ringan berbasis Web Audio API (tanpa file suara): klik, motor, berhenti, api, desis,
 * mendidih, air, perbaikan, benar, salah, peringatan. Dapat dimatikan (SOUND ON/OFF).
 */
export class Audio {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.ctx = null;
  }
  _ctx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  setEnabled(v) { this.enabled = v; }
  _tone(freq, dur, { type = 'sine', vol = 0.08, slide = 0, delay = 0 } = {}) {
    const c = this._ctx();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  _noise(dur, { vol = 0.05, filter = 1200, q = 0.8, delay = 0 } = {}) {
    const c = this._ctx();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filter;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0);
  }
  play(name) {
    if (!this.enabled) return;
    try {
      switch (name) {
        case 'click': this._tone(880, 0.06, { type: 'triangle', vol: 0.05 }); break;
        case 'motor': this._tone(110, 0.9, { type: 'sawtooth', vol: 0.03, slide: 60 }); this._tone(220, 0.9, { type: 'square', vol: 0.01, slide: 120 }); break;
        case 'stop': this._tone(240, 0.5, { type: 'sawtooth', vol: 0.025, slide: -180 }); break;
        case 'ignite': this._noise(0.35, { vol: 0.08, filter: 900 }); this._tone(1800, 0.05, { type: 'square', vol: 0.02 }); break;
        case 'sizzle': this._noise(1.0, { vol: 0.04, filter: 5000, q: 0.5 }); break;
        case 'boil': for (let i = 0; i < 5; i++) this._tone(300 + Math.random() * 200, 0.08, { vol: 0.03, delay: i * 0.12 }); break;
        case 'water': this._noise(0.7, { vol: 0.05, filter: 2500, q: 0.6 }); break;
        case 'repair': this._tone(1200, 0.05, { type: 'square', vol: 0.03 }); this._tone(1200, 0.05, { type: 'square', vol: 0.03, delay: 0.15 }); break;
        case 'correct': this._tone(660, 0.12, { vol: 0.07 }); this._tone(990, 0.18, { vol: 0.07, delay: 0.1 }); break;
        case 'wrong': this._tone(220, 0.25, { type: 'square', vol: 0.04, slide: -60 }); break;
        case 'warning': this._tone(740, 0.15, { type: 'square', vol: 0.04 }); this._tone(740, 0.15, { type: 'square', vol: 0.04, delay: 0.22 }); break;
        default: this._tone(660, 0.05, { vol: 0.04 });
      }
    } catch (e) { /* audio tidak tersedia */ }
  }
}
