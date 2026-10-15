/**
 * Pustaka material PBR yang dipakai bersama oleh semua model.
 * Material dibuat sekali (lazy) lalu digunakan ulang untuk menghemat memori GPU.
 */
import * as THREE from 'three';
import {
  woodTexture, brushedTexture, stoneTexture, clayTexture, fabricTexture,
  perforatedAlpha, graterAlpha, dotGridTexture, noiseColorTexture,
} from './textures.js';

const lib = new Map();

function def(name, make) {
  Object.defineProperty(M, name, {
    get() {
      if (!lib.has(name)) {
        const m = make();
        m.name = name;
        lib.set(name, m);
      }
      return lib.get(name);
    },
  });
}

const std = (o) => new THREE.MeshStandardMaterial(o);
const phys = (o) => new THREE.MeshPhysicalMaterial(o);

/** Akses material: M.steel, M.wood, M.glass, … */
export const M = {};

/* ---------- LOGAM ---------- */
def('steel', () => std({ color: 0xd4d8db, metalness: 1, roughness: 0.3, roughnessMap: brushedTexture() }));
def('steelPolished', () => std({ color: 0xe6e9eb, metalness: 1, roughness: 0.12 }));
def('steelSatin', () => std({ color: 0xc9ced2, metalness: 1, roughness: 0.4, roughnessMap: brushedTexture() }));
def('steelDark', () => std({ color: 0x8c9399, metalness: 1, roughness: 0.42 }));
def('blade', () => std({ color: 0xdfe3e6, metalness: 1, roughness: 0.18, roughnessMap: brushedTexture() }));
def('aluminium', () => std({ color: 0xc4c8cc, metalness: 1, roughness: 0.38 }));
def('aluminiumCast', () => std({ color: 0xb9bdc0, metalness: 0.85, roughness: 0.5 }));
def('castIron', () => std({ color: 0x232324, metalness: 0.65, roughness: 0.62 }));
def('copper', () => std({ color: 0xd38a5b, metalness: 1, roughness: 0.25 }));
def('chrome', () => std({ color: 0xf2f4f5, metalness: 1, roughness: 0.06 }));
def('brass', () => std({ color: 0xd8b25c, metalness: 1, roughness: 0.3 }));
def('nonstick', () => phys({ color: 0x1b1c1e, metalness: 0.1, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.4 }));
def('enamelGrey', () => phys({ color: 0xb8bcbf, metalness: 0.15, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
def('enamelWhite', () => phys({ color: 0xeef0ef, metalness: 0.05, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
def('enamelBlack', () => phys({ color: 0x1c1d1f, metalness: 0.2, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
def('enamelRed', () => phys({ color: 0xa7221c, metalness: 0.1, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.1 }));

/* ---------- PLASTIK & KARET ---------- */
def('plasticBlack', () => std({ color: 0x1d1e20, metalness: 0, roughness: 0.55 }));
def('plasticGloss', () => phys({ color: 0x18191b, metalness: 0, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }));
def('plasticWhite', () => phys({ color: 0xf1f1ee, metalness: 0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }));
def('plasticGrey', () => std({ color: 0x6a6f74, metalness: 0, roughness: 0.6 }));
def('plasticRed', () => phys({ color: 0xc0262d, metalness: 0, roughness: 0.4, clearcoat: 0.4 }));
def('plasticBlue', () => std({ color: 0x1f5fa8, metalness: 0, roughness: 0.5 }));
def('plasticGreen', () => std({ color: 0x2e8b57, metalness: 0, roughness: 0.5 }));
def('plasticClear', () => phys({
  color: 0xffffff, metalness: 0, roughness: 0.08, transmission: 1, thickness: 0.004, ior: 1.49,
  transparent: true, opacity: 1, side: THREE.DoubleSide, envMapIntensity: 1.2,
}));
def('rubber', () => std({ color: 0x141414, metalness: 0, roughness: 0.9 }));
def('silicone', () => std({ color: 0x2b2d30, metalness: 0, roughness: 0.75 }));
def('handlePOM', () => phys({ color: 0x121212, metalness: 0, roughness: 0.32, clearcoat: 0.3 }));

/* ---------- KACA ---------- */
// Kaca gelas saji: transmisi fisik (refraksi nyata).
def('glass', () => phys({
  color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.003, ior: 1.52,
  side: THREE.DoubleSide, envMapIntensity: 1.4, specularIntensity: 1,
}));
// Kaca pintu/etalase: lebih ringan (transparansi biasa), lebih hemat performa.
def('glassPane', () => phys({
  color: 0xdfeef2, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16,
  side: THREE.DoubleSide, envMapIntensity: 2, depthWrite: false,
}));
def('glassDark', () => phys({
  color: 0x0b0f12, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.55,
  envMapIntensity: 1.5, depthWrite: false,
}));

/* ---------- KAYU, BATU, TANAH LIAT, KERAMIK ---------- */
def('wood', () => std({ color: 0xffffff, map: woodTexture('#b07a43', '#6b421f', 3), roughness: 0.62, metalness: 0 }));
def('woodDark', () => std({ color: 0xffffff, map: woodTexture('#6a3f20', '#2f1a0b', 7), roughness: 0.5, metalness: 0 }));
def('woodLight', () => std({ color: 0xffffff, map: woodTexture('#d6b07c', '#9c7243', 5), roughness: 0.7, metalness: 0 }));
def('bamboo', () => std({ color: 0xffffff, map: woodTexture('#d9bb7a', '#a07f3f', 13), roughness: 0.55 }));
def('stone', () => std({ color: 0xffffff, map: stoneTexture(), bumpMap: stoneTexture(), bumpScale: 1.2, roughness: 0.92 }));
def('clay', () => std({ color: 0xffffff, map: clayTexture(), roughness: 0.88 }));
def('ceramic', () => phys({ color: 0xf7f6f2, metalness: 0, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.06 }));

/* ---------- KAIN ---------- */
def('fabricApron', () => phys({ color: 0xffffff, map: fabricTexture('#273a46'), roughness: 1, sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color(0x6688aa), side: THREE.DoubleSide }));
def('fabricTowel', () => phys({ color: 0xffffff, map: fabricTexture('#efefea', '#c0392b'), roughness: 1, sheen: 0.5, sheenRoughness: 0.9, sheenColor: new THREE.Color(0xffffff) }));
def('fabricWhite', () => phys({ color: 0xffffff, map: fabricTexture('#f4f4f0'), roughness: 1, sheen: 0.5, sheenRoughness: 0.9, sheenColor: new THREE.Color(0xffffff) }));
def('fabricMitt', () => phys({ color: 0xffffff, map: fabricTexture('#8f2d2a', null, 8), roughness: 1, sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xff9988) }));
def('strap', () => std({ color: 0x1d2a33, roughness: 0.95 }));

/* ---------- LOGAM BERLUBANG ---------- */
const perforated = (pattern, density, color = 0xd0d4d7, rough = 0.3) => std({
  color, metalness: 1, roughness: rough, alphaMap: perforatedAlpha(pattern, density),
  alphaTest: 0.5, side: THREE.DoubleSide,
});
def('meshFine', () => perforated('mesh', 70, 0xcfd3d6, 0.35));
def('meshCoarse', () => perforated('mesh', 34, 0xcfd3d6, 0.35));
def('perfHoles', () => perforated('holes', 40));
def('perfHolesBig', () => perforated('holes', 18));
def('graterMetal', () => std({ color: 0xd6dadd, metalness: 1, roughness: 0.25, alphaMap: graterAlpha(), alphaTest: 0.5, side: THREE.DoubleSide }));
def('microwaveMesh', () => std({ color: 0x0a0a0a, metalness: 0.4, roughness: 0.5, alphaMap: dotGridTexture(), transparent: true, opacity: 0.92, side: THREE.DoubleSide }));

/* ---------- EMISIF (lampu, api, elemen pemanas) ---------- */
def('ledRed', () => std({ color: 0x330000, emissive: 0xff2a1a, emissiveIntensity: 0 }));
def('ledGreen', () => std({ color: 0x002a0b, emissive: 0x22ff66, emissiveIntensity: 0 }));
def('ledAmber', () => std({ color: 0x331a00, emissive: 0xffa21a, emissiveIntensity: 0 }));
def('ledBlue', () => std({ color: 0x001233, emissive: 0x2a8bff, emissiveIntensity: 0 }));
def('heater', () => std({ color: 0x2b2b2b, metalness: 0.6, roughness: 0.5, emissive: 0xff3b0a, emissiveIntensity: 0 }));
def('flame', () => new THREE.MeshBasicMaterial({ color: 0x3d7bff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
def('flameOrange', () => new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
def('steam', () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
def('interiorLight', () => std({ color: 0xffffff, emissive: 0xfff2d6, emissiveIntensity: 0 }));
def('lcd', () => std({ color: 0x0f1a14, roughness: 0.25, metalness: 0.2 }));

/* ---------- MAKANAN (props) ---------- */
def('oil', () => phys({ color: 0xd99a1b, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.88 }));
def('water', () => phys({ color: 0xbfe3f0, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.35, depthWrite: false }));
def('soup', () => phys({ color: 0xc8892e, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }));
def('smoothie', () => phys({ color: 0xe0566e, roughness: 0.4, clearcoat: 0.3 }));
def('bread', () => std({ color: 0xffffff, map: noiseColorTexture('#c98a45', '#7a4416', 4), roughness: 0.85 }));
def('breadCrumb', () => std({ color: 0xf2deb0, roughness: 0.95 }));
def('meat', () => std({ color: 0xffffff, map: noiseColorTexture('#a8343a', '#e8b4b0', 12, 900), roughness: 0.55 }));
def('meatCooked', () => std({ color: 0xffffff, map: noiseColorTexture('#6b3a22', '#2a140a', 14, 4000), roughness: 0.7 }));
def('fried', () => std({ color: 0xffffff, map: noiseColorTexture('#d8952f', '#8b4d14', 16, 7000), roughness: 0.75 }));
def('carrot', () => std({ color: 0xe8711c, roughness: 0.55 }));
def('leaf', () => std({ color: 0x3f8f2f, roughness: 0.6, side: THREE.DoubleSide }));
def('dough', () => std({ color: 0xf1e2c4, roughness: 0.9 }));
def('cream', () => phys({ color: 0xfbf5e8, roughness: 0.35, clearcoat: 0.4 }));
def('iceCreamPink', () => std({ color: 0xf2a5b8, roughness: 0.8 }));
def('iceCreamVanilla', () => std({ color: 0xf6e9c8, roughness: 0.8 }));
def('iceCreamChoco', () => std({ color: 0x6b4026, roughness: 0.8 }));
def('fruitRed', () => phys({ color: 0xc8202a, roughness: 0.3, clearcoat: 0.8 }));
def('fruitYellow', () => phys({ color: 0xf2c230, roughness: 0.4, clearcoat: 0.5 }));
def('cheese', () => std({ color: 0xf3c84b, roughness: 0.6 }));
def('wine', () => phys({ color: 0x6d0d1d, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.9 }));
def('juice', () => phys({ color: 0xf59a1b, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.9 }));
def('coffee', () => phys({ color: 0x2b1406, roughness: 0.1, clearcoat: 1 }));
def('tea', () => phys({ color: 0x8a3c0d, roughness: 0.1, clearcoat: 1 }));
def('butter', () => std({ color: 0xf6dd8a, roughness: 0.5 }));
def('bottleGreen', () => phys({ color: 0x2f7d3f, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 }));
def('labelPaper', () => std({ color: 0xf5f1e6, roughness: 0.8 }));
def('cardboard', () => std({ color: 0xc89b62, roughness: 0.9 }));

/** Membuat salinan material (mis. untuk highlight) tanpa merusak material bersama. */
export function cloneMat(m, props = {}) {
  const c = m.clone();
  Object.assign(c, props);
  return c;
}

/** Material sederhana berwarna. */
export function colorMat(color, rough = 0.6, metal = 0) {
  const key = `c${color}_${rough}_${metal}`;
  if (!lib.has(key)) lib.set(key, std({ color, roughness: rough, metalness: metal }));
  return lib.get(key);
}
