/**
 * Tekstur prosedural (dibuat dengan <canvas>) — tanpa file gambar eksternal,
 * sehingga aplikasi tetap ringan dan dapat berjalan offline.
 */
import * as THREE from 'three';

const cache = new Map();

/** Pseudo-random deterministik agar tekstur selalu sama setiap dimuat. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c, { srgb = true, repeat = [1, 1], wrap = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (wrap) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

function cached(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}

/* ------------------------------------------------------------------ */

/** Serat kayu (warna dasar). */
export function woodTexture(base = '#a8743f', dark = '#6e4520', seed = 3) {
  return cached(`wood${base}${dark}${seed}`, () => {
    const c = canvas(512, 512), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    // serat memanjang (sumbu x)
    for (let i = 0; i < 140; i++) {
      const y0 = r() * 512, amp = 2 + r() * 8, freq = 0.004 + r() * 0.01, ph = r() * 6;
      g.strokeStyle = dark;
      g.globalAlpha = 0.05 + r() * 0.22;
      g.lineWidth = 0.6 + r() * 2.4;
      g.beginPath();
      for (let x = 0; x <= 512; x += 8) {
        const y = y0 + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 3.1 + ph) * amp * 0.25;
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    // mata kayu
    for (let k = 0; k < 2; k++) {
      const cx = r() * 512, cy = r() * 512;
      for (let j = 0; j < 9; j++) {
        g.globalAlpha = 0.12;
        g.beginPath();
        g.ellipse(cx, cy, 6 + j * 5, 2 + j * 1.6, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    return toTexture(c);
  });
}

/** Garis halus "brushed" untuk peta kekasaran stainless steel. */
export function brushedTexture() {
  return cached('brushed', () => {
    const c = canvas(256, 256), g = c.getContext('2d'), r = rng(11);
    g.fillStyle = '#808080';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) {
      const y = r() * 256, v = Math.floor(100 + r() * 70);
      g.strokeStyle = `rgb(${v},${v},${v})`;
      g.globalAlpha = 0.35;
      g.lineWidth = 0.5 + r();
      const x = r() * 256, len = 40 + r() * 200;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + len, y);
      g.stroke();
    }
    g.globalAlpha = 1;
    return toTexture(c, { srgb: false, repeat: [2, 2] });
  });
}

/** Butiran batu (cobek). */
export function stoneTexture(seed = 5) {
  return cached('stone' + seed, () => {
    const c = canvas(512, 512), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = '#55524e';
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26000; i++) {
      const v = Math.floor(40 + r() * 80);
      g.fillStyle = `rgb(${v},${v - 2},${v - 5})`;
      g.globalAlpha = 0.5;
      const s = r() * 2.6;
      g.fillRect(r() * 512, r() * 512, s, s);
    }
    for (let i = 0; i < 260; i++) {
      g.fillStyle = r() > 0.5 ? '#2a2826' : '#8a8780';
      g.globalAlpha = 0.6;
      g.beginPath();
      g.arc(r() * 512, r() * 512, 0.8 + r() * 2.2, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;
    return toTexture(c, { repeat: [2, 2] });
  });
}

/** Tanah liat / gerabah. */
export function clayTexture() {
  return cached('clay', () => {
    const c = canvas(256, 256), g = c.getContext('2d'), r = rng(9);
    g.fillStyle = '#a65a33';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      const v = r();
      g.fillStyle = v > 0.5 ? '#b8693e' : '#8f4a28';
      g.globalAlpha = 0.25;
      g.fillRect(r() * 256, r() * 256, 1.5, 1.5);
    }
    for (let y = 0; y < 256; y += 6 + r() * 6) {
      g.strokeStyle = '#7d3f22';
      g.globalAlpha = 0.12;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(256, y + r() * 3);
      g.stroke();
    }
    g.globalAlpha = 1;
    return toTexture(c, { repeat: [2, 1] });
  });
}

/** Tenunan kain. */
export function fabricTexture(color = '#2f3e46', stripe = null, seed = 2) {
  return cached(`fab${color}${stripe}${seed}`, () => {
    const c = canvas(256, 256), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = color;
    g.fillRect(0, 0, 256, 256);
    if (stripe) {
      g.fillStyle = stripe;
      for (let x = 0; x < 256; x += 64) g.fillRect(x + 6, 0, 10, 256);
      g.fillRect(0, 26, 256, 6);
    }
    for (let y = 0; y < 256; y += 2) {
      g.fillStyle = y % 4 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
      g.fillRect(0, y, 256, 1);
    }
    for (let x = 0; x < 256; x += 2) {
      g.fillStyle = x % 4 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      g.fillRect(x, 0, 1, 256);
    }
    for (let i = 0; i < 1500; i++) {
      g.fillStyle = 'rgba(0,0,0,0.05)';
      g.fillRect(r() * 256, r() * 256, 2, 1);
    }
    return toTexture(c, { repeat: [3, 3] });
  });
}

/** Ubin dinding putih (subway tile) dengan nat. */
export function wallTileTexture() {
  return cached('walltile', () => {
    const c = canvas(512, 512), g = c.getContext('2d'), r = rng(21);
    g.fillStyle = '#c9cdd0';
    g.fillRect(0, 0, 512, 512);
    const tw = 128, th = 64;
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? tw / 2 : 0;
      for (let col = -1; col < 5; col++) {
        const x = col * tw + off, y = row * th;
        const v = 240 + Math.floor(r() * 10);
        const grd = g.createLinearGradient(x, y, x, y + th);
        grd.addColorStop(0, `rgb(${v},${v},${v + 2})`);
        grd.addColorStop(1, `rgb(${v - 10},${v - 9},${v - 7})`);
        g.fillStyle = grd;
        g.fillRect(x + 3, y + 3, tw - 6, th - 6);
      }
    }
    return toTexture(c, { repeat: [5, 3] });
  });
}

/** Lantai keramik anti-slip (quarry tile) abu-abu kecokelatan. */
export function floorTileTexture() {
  return cached('floortile', () => {
    const c = canvas(512, 512), g = c.getContext('2d'), r = rng(31);
    g.fillStyle = '#4b4c4f';
    g.fillRect(0, 0, 512, 512);
    const t = 128;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const v = 120 + Math.floor(r() * 18);
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      g.fillRect(x * t + 3, y * t + 3, t - 6, t - 6);
      for (let i = 0; i < 500; i++) {
        const k = Math.floor(r() * 40) - 20;
        g.fillStyle = `rgba(${v + k},${v + k - 4},${v + k - 10},0.6)`;
        g.fillRect(x * t + 3 + r() * (t - 6), y * t + 3 + r() * (t - 6), 2, 2);
      }
    }
    return toTexture(c, { repeat: [8, 8] });
  });
}

/** Panel dinding walk-in dengan sambungan vertikal. */
export function panelTexture(color = '#e9ecee') {
  return cached('panel' + color, () => {
    const c = canvas(256, 256), g = c.getContext('2d');
    g.fillStyle = color;
    g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 8) {
      g.fillStyle = 'rgba(0,0,0,0.035)';
      g.fillRect(0, y, 256, 3);
    }
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(0, 0, 3, 256);
    return toTexture(c, { repeat: [3, 1] });
  });
}

/**
 * Peta alpha untuk logam berlubang (parutan, saringan, kukusan).
 * pattern: 'holes' | 'mesh' | 'slots' | 'grater'
 */
export function perforatedAlpha(pattern = 'holes', density = 24) {
  return cached(`perf${pattern}${density}`, () => {
    const c = canvas(512, 512), g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#000';
    const step = 512 / density;
    if (pattern === 'mesh') {
      g.fillRect(0, 0, 512, 512);
      g.fillStyle = '#fff';
      for (let i = 0; i <= density; i++) {
        g.fillRect(i * step - 1.2, 0, 2.4, 512);
        g.fillRect(0, i * step - 1.2, 512, 2.4);
      }
    } else if (pattern === 'slots') {
      for (let y = 0; y < density; y++) for (let x = 0; x < density / 3; x++) {
        g.fillRect(x * step * 3 + step * 0.5, y * step + step * 0.3, step * 2, step * 0.4);
      }
    } else {
      for (let y = 0; y < density; y++) for (let x = 0; x < density; x++) {
        const ox = y % 2 ? step / 2 : 0;
        g.beginPath();
        g.arc(x * step + ox + step / 2, y * step + step / 2, step * 0.28, 0, 7);
        g.fill();
      }
    }
    return toTexture(c, { srgb: false, repeat: [1, 1] });
  });
}

/** Tekstur parutan kotak: 4 sisi dengan pola lubang berbeda (dipetakan ke 4 sisi silinder). */
export function graterAlpha() {
  return cached('grater', () => {
    const c = canvas(1024, 256), g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 1024, 256);
    g.fillStyle = '#000';
    const face = (i, fn) => { g.save(); g.translate(i * 256, 0); fn(); g.restore(); };
    // sisi 1: lubang parut kasar
    face(0, () => {
      for (let y = 24; y < 236; y += 22) for (let x = 30; x < 230; x += 26) {
        g.beginPath(); g.ellipse(x + ((y / 22) % 2) * 13, y, 7, 5, 0, 0, 7); g.fill();
      }
    });
    // sisi 2: celah pengiris (slicer)
    face(1, () => { g.fillRect(48, 110, 160, 14); });
    // sisi 3: lubang halus
    face(2, () => {
      for (let y = 22; y < 238; y += 9) for (let x = 26; x < 232; x += 9) {
        g.beginPath(); g.arc(x + ((y / 9) % 2) * 4.5, y, 2, 0, 7); g.fill();
      }
    });
    // sisi 4: lubang sedang
    face(3, () => {
      for (let y = 24; y < 236; y += 15) for (let x = 28; x < 232; x += 16) {
        g.beginPath(); g.arc(x + ((y / 15) % 2) * 8, y, 4.2, 0, 7); g.fill();
      }
    });
    return toTexture(c, { srgb: false, wrap: false });
  });
}

/** Tekstur teks/label (papan nama, layar digital). */
export function labelTexture(text, {
  w = 512, h = 128, bg = '#111', fg = '#fff', font = 'bold 64px Arial', align = 'center', glow = false,
} = {}) {
  const c = canvas(w, h), g = c.getContext('2d');
  const draw = (t) => {
    g.clearRect(0, 0, w, h);
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.font = font;
    // perkecil huruf otomatis bila teks melebihi lebar kanvas
    const m = /(\d+)px/.exec(font);
    if (m && t) {
      let size = +m[1];
      while (size > 8 && g.measureText(t).width > w * 0.92) {
        size -= 2;
        g.font = font.replace(/\d+px/, size + 'px');
      }
    }
    g.fillStyle = fg;
    g.textAlign = align;
    g.textBaseline = 'middle';
    if (glow) { g.shadowColor = fg; g.shadowBlur = 18; }
    g.fillText(t, align === 'center' ? w / 2 : 16, h / 2 + 2);
    g.shadowBlur = 0;
  };
  draw(text);
  const tex = toTexture(c, { wrap: false });
  tex.userData.update = (t) => { draw(t); tex.needsUpdate = true; };
  return tex;
}

/** Jaring pada jendela microwave. */
export function dotGridTexture() {
  return cached('dotgrid', () => {
    const c = canvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#111';
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#fff';
    for (let y = 0; y < 256; y += 8) for (let x = 0; x < 256; x += 8) {
      g.beginPath(); g.arc(x + 4, y + 4, 2.4, 0, 7); g.fill();
    }
    return toTexture(c, { srgb: false, repeat: [4, 3] });
  });
}

/** Gradien latar studio. */
export function studioBackdrop() {
  return cached('backdrop', () => {
    const c = canvas(16, 512), g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#dfe5ea');
    grd.addColorStop(0.55, '#c7d0d8');
    grd.addColorStop(1, '#9aa6b1');
    g.fillStyle = grd;
    g.fillRect(0, 0, 16, 512);
    return toTexture(c, { wrap: false });
  });
}

/** Kerak roti / makanan sederhana (noise berwarna). */
export function noiseColorTexture(a = '#c98a45', b = '#8a5222', seed = 4, n = 6000) {
  return cached(`noise${a}${b}${seed}`, () => {
    const c = canvas(256, 256), g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = a;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < n; i++) {
      g.fillStyle = b;
      g.globalAlpha = r() * 0.35;
      const s = 1 + r() * 4;
      g.beginPath(); g.arc(r() * 256, r() * 256, s, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    return toTexture(c);
  });
}
