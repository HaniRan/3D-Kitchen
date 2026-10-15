/**
 * Mesin persiapan (kitchen equipment bertenaga listrik):
 * Blender, Hand Mixer, Planetary Mixer, Spiral Mixer, Meat Slicer, Timbangan Digital.
 * Setiap model memiliki rig animasi: plug (listrik terhubung), power, speed, lid/door, fill, dst.
 */
import * as THREE from 'three';
import { M, colorMat } from './materials.js';
import { labelTexture } from './textures.js';
import {
  Kit, mesh, at, group, box, rbox, cyl, cylX, cylZ, sphere, torus, lathe, latheGeo, vessel, vesselProfile,
  rectLatheGeo, shapeFrom, extrudeGeo, roundedRectShape, tube, tubeGeo, knob, caster, deform, mergeMeshes,
  PI, TAU, V2, V3, arcPts, clamp, lerp,
} from './helpers.js';

/** Kabel listrik + steker; mengembalikan {group, plug} untuk animasi colok. */
function powerCord(start, mid, end, mat = M.plasticBlack) {
  const g = new THREE.Group();
  const cord = tube([start, ...mid, end], 0.0028, mat, { segs: 60, radial: 6 });
  const plug = group(rbox(0.03, 0.022, 0.04, 0.006, mat, 2));
  for (const s of [-1, 1]) plug.add(at(cyl(0.0022, 0.0022, 0.018, M.chrome, 8), s * 0.009, 0, 0.028, PI / 2));
  plug.position.copy(end);
  g.add(cord, plug);
  return { group: g, plug };
}

/** Tombol LED kecil pada panel. */
function led(kit, base, r = 0.004) {
  const m = kit.own(base);
  const l = cyl(r, r, 0.003, m, 16);
  l.rotation.x = PI / 2;
  return { mesh: l, mat: m };
}

/* ======================================================= BLENDER == */
export function buildBlender() {
  const kit = new Kit('blender');
  // --- base (motor) ---
  const baseGeo = rectLatheGeo([[0.004, 0], [0.012, 0.004], [0.014, 0.014], [0.008, 0.12], [0.002, 0.148], [-0.006, 0.157], [-0.022, 0.16]], 0.16, 0.17, 0.035, 6);
  const baseBody = mesh(baseGeo, M.enamelBlack);
  const pad = lathe([[0, 0.16], [0.056, 0.16], [0.058, 0.166], [0.054, 0.172], [0, 0.172]], M.rubber, 40);
  const coupler = cyl(0.012, 0.014, 0.008, M.steelDark, 6);
  coupler.position.y = 0.176;
  const feet = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(cyl(0.01, 0.011, 0.004, M.rubber, 16), sx * 0.075, -0.002, sz * 0.08)));
  const cord = powerCord(V3(0, 0.03, -0.09), [V3(0, 0.01, -0.13), V3(0.05, 0.004, -0.2)], V3(0.12, 0.012, -0.24));
  kit.part('base', 'Badan motor (base)', [0, -0.05, 0], baseBody, pad, coupler, ...feet, cord.group);
  // --- panel kontrol (miring di depan) ---
  const panel = new THREE.Group();
  panel.add(rbox(0.13, 0.08, 0.006, 0.004, M.plasticGloss, 2));
  const dial = knob(0.019, 0.016, M.steelPolished, M.plasticRed);
  dial.position.z = 0.003;
  panel.add(dial);
  const btnOn = at(rbox(0.018, 0.012, 0.008, 0.003, M.plasticGrey, 2), -0.045, -0.018, 0.004);
  const btnPulse = at(rbox(0.018, 0.012, 0.008, 0.003, M.plasticGrey, 2), 0.045, -0.018, 0.004);
  const ledPow = led(kit, M.ledGreen), ledStby = led(kit, M.ledRed);
  at(ledPow.mesh, -0.045, 0.018, 0.004, PI / 2);
  at(ledStby.mesh, 0.045, 0.018, 0.004, PI / 2);
  panel.add(btnOn, btnPulse, ledPow.mesh, ledStby.mesh);
  panel.position.set(0, 0.075, 0.0985);
  panel.rotation.x = -0.065;
  kit.part('panel', 'Panel kontrol (tombol & pengatur kecepatan)', [0, 0, 0.12], panel);
  // --- wadah (jar) ---
  const jarY = 0.168;
  const collar = lathe([[0.04, 0], [0.066, 0], [0.068, 0.006], [0.066, 0.042], [0.06, 0.046], [0.05, 0.046], [0.05, 0.03], [0.04, 0.03]], M.plasticBlack, 40);
  const ridges = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const r = box(0.004, 0.03, 0.006, M.plasticBlack);
    const a = (i / 12) * TAU;
    r.position.set(Math.cos(a) * 0.068, 0.022, Math.sin(a) * 0.068);
    r.rotation.y = -a;
    ridges.add(r);
  }
  const jar = vessel({ rB: 0.058, rT: 0.082, h: 0.215, wall: 0.0035, base: 0.004, corner: 0.012, steps: 12 }, M.plasticClear, 56);
  jar.position.y = 0.036;
  const ticks = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const y = 0.07 + i * 0.026, r = 0.058 + (0.024 * (y - 0.036)) / 0.215 + 0.0006;
    const t = box(i % 2 ? 0.012 : 0.02, 0.0012, 0.001, colorMat(0xffffff, 0.5));
    t.position.set(0, y, r);
    ticks.add(t);
  }
  const handle = tube([V3(-0.06, 0.07, 0), V3(-0.105, 0.075, 0), V3(-0.118, 0.14, 0), V3(-0.106, 0.215, 0), V3(-0.078, 0.232, 0)], 0.011, M.plasticBlack, { segs: 40, radial: 12 });
  // isi: potongan buah & cairan
  const pieces = new THREE.Group();
  const pm = [M.fruitRed, M.fruitYellow, M.fruitRed, M.iceCreamVanilla];
  for (let i = 0; i < 9; i++) {
    const p = i % 3 === 0 ? rbox(0.022, 0.018, 0.02, 0.005, pm[i % 4], 2) : sphere(0.013, pm[i % 4], 14, 10);
    const a = i * 2.4, r = 0.012 + (i % 3) * 0.013;
    p.position.set(Math.cos(a) * r, 0.065 + (i % 4) * 0.014, Math.sin(a) * r);
    p.rotation.set(i, i * 2, 0);
    pieces.add(p);
  }
  const liquid = mesh(latheGeo([[0, 0.044], [0.056, 0.044], [0.064, 0.12], [0.068, 0.15], [0.04, 0.146], [0.0, 0.12]], 40), M.smoothie);
  kit.part('container', 'Wadah/tabung (container) & pegangan', [0, 0.12, 0], collar, ridges, jar, ticks, handle, pieces, liquid);
  kit.parts[kit.parts.length - 1].obj.position.y = jarY;
  // --- pisau blender ---
  const blades = new THREE.Group();
  blades.add(cyl(0.008, 0.01, 0.014, M.steelPolished, 16));
  for (let i = 0; i < 4; i++) {
    const b = mesh(extrudeGeo(shapeFrom([[0, -0.005], [0.034, -0.003], [0.036, 0.003], [0, 0.005]]), 0.0012, { bevel: 0.0003, segs: 1 }), M.blade);
    b.rotation.x = PI / 2;
    const g = group(b);
    g.rotation.y = (i * PI) / 2;
    g.rotation.z = i % 2 ? 0.35 : -0.3;
    g.position.y = 0.006;
    blades.add(g);
  }
  const bladeHolder = group(blades);
  bladeHolder.position.y = 0.048;
  kit.part('blade', 'Pisau blender (blade assembly)', [0, 0.06, 0.12], bladeHolder);
  kit.parts[kit.parts.length - 1].obj.position.y = jarY;
  // --- tutup ---
  const lid = new THREE.Group();
  lid.add(lathe([[0.072, -0.02], [0.08, -0.02], [0.088, 0.0], [0.088, 0.008], [0.07, 0.012], [0.03, 0.012], [0.03, 0.002], [0, 0.002]], M.rubber, 48));
  lid.add(at(lathe([[0, 0], [0.028, 0], [0.03, 0.02], [0.026, 0.026], [0, 0.026]], M.plasticClear, 32), 0, 0.002, 0));
  lid.position.y = 0.036 + 0.215 + 0.004;
  const lidPart = kit.part('lid', 'Tutup (lid) & tutup isi ulang', [0, 0.32, 0], lid);
  kit.parts[kit.parts.length - 1].obj.position.y = jarY;

  // --- rig ---
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 4);
  kit.stateVar('speed', 0, 3);
  kit.stateVar('lid', 0, 4); // 1 = terbuka
  kit.stateVar('fill', 0, 3);
  kit.stateVar('blend', 0, 0.5);
  let spin = 0;
  const plugBase = cord.plug.position.clone();
  kit.onApply((s, dt, t) => {
    spin += dt * s.power * (8 + s.speed * 30);
    blades.rotation.y = spin;
    ledPow.mat.emissiveIntensity = s.power * 3;
    ledStby.mat.emissiveIntensity = s.plug * (1 - s.power) * 2.5;
    dial.rotation.z = -s.speed * 0.9;
    btnOn.position.z = 0.004 - s.power * 0.002;
    lidPart.position.set(s.lid * 0.16, s.lid * 0.06, 0);
    lidPart.rotation.z = -s.lid * 0.5;
    cord.plug.position.copy(plugBase).add(V3(0.0, 0, -0.03 * (1 - s.plug)));
    cord.plug.visible = true;
    // isi: potongan buah → cairan
    const blend = clamp(s.blend, 0, 1);
    pieces.visible = s.fill > 0.05 && blend < 0.98;
    pieces.children.forEach((p, i) => {
      p.scale.setScalar(Math.max(0.001, s.fill * (1 - blend)));
      if (s.power > 0.1) p.position.y += Math.sin(t * 30 + i) * 0.0006 * s.power;
    });
    liquid.visible = s.fill > 0.05 && blend > 0.02;
    liquid.scale.set(1, Math.max(0.01, blend), 1);
    liquid.rotation.y = spin * 0.3;
    // getaran halus saat menyala
    kit.root.position.x = s.power > 0.05 ? Math.sin(t * 90) * 0.0004 * s.power : 0;
  });
  return kit.finish({ electric: true });
}

/* ==================================================== HAND MIXER == */
function beater(len = 0.13) {
  const g = new THREE.Group();
  g.add(at(cyl(0.0032, 0.0032, len * 0.5, M.steelPolished, 10), 0, -len * 0.25, 0));
  g.add(at(cyl(0.005, 0.005, 0.012, M.steelPolished, 12), 0, -0.004, 0));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * PI;
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20, y = -len * 0.45 - u * len * 0.55;
      const r = 0.019 * Math.sin(PI * u) ** 0.8;
      pts.push(V3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    for (let i = 20; i >= 0; i--) {
      const u = i / 20, y = -len * 0.45 - u * len * 0.55;
      const r = 0.019 * Math.sin(PI * u) ** 0.8;
      pts.push(V3(-Math.cos(a) * r, y, -Math.sin(a) * r));
    }
    g.add(tube(pts, 0.0012, M.steelPolished, { segs: 50, radial: 5, closed: false }));
  }
  return g;
}

export function buildHandMixer() {
  const kit = new Kit('hand-mixer');
  const outline = [
    [-0.1, 0.014], [-0.07, 0.004], [0.05, 0.002], [0.088, 0.01], [0.104, 0.03], [0.104, 0.056], [0.09, 0.074],
    [0.066, 0.09], [0.054, 0.118], [0.03, 0.137], [-0.05, 0.138], [-0.088, 0.126], [-0.104, 0.1], [-0.108, 0.05],
  ];
  const hole = [[-0.068, 0.074], [0.028, 0.072], [0.04, 0.084], [0.034, 0.105], [0.016, 0.121], [-0.055, 0.122], [-0.075, 0.105], [-0.078, 0.085]];
  // kontur dihaluskan dengan spline agar badan tampak membulat (bukan bersegi)
  const smoothShape = (pts) => new THREE.SplineCurve([...pts, pts[0]].map(([x, y]) => V2(x, y))).getPoints(pts.length * 8).slice(0, -1).map((v) => [v.x, v.y]);
  const bodyGeo = extrudeGeo(shapeFrom(smoothShape(outline), [smoothShape(hole).reverse()]), 0.058, { bevel: 0.011, bevelT: 0.012, segs: 6, curveSegments: 4 });
  const body = mesh(bodyGeo, M.plasticWhite);
  const trim = mesh(extrudeGeo(shapeFrom([[-0.112, 0.03], [0.112, 0.03], [0.112, 0.038], [-0.112, 0.038]]), 0.0815, { bevel: 0.001, segs: 1 }), M.steelSatin);
  const slider = at(rbox(0.026, 0.01, 0.016, 0.003, M.plasticGrey, 2), -0.01, 0.149, 0);
  const eject = at(rbox(0.016, 0.008, 0.02, 0.003, M.plasticGrey, 2), -0.06, 0.148, 0);
  const vents = new THREE.Group();
  for (const sz of [-1, 1]) for (let i = 0; i < 5; i++) vents.add(at(box(0.004, 0.025, 0.002, M.plasticBlack), -0.085 + i * 0.008, 0.06, sz * 0.0412));
  const ledM = led(kit, M.ledGreen, 0.003);
  at(ledM.mesh, 0.06, 0.06, 0.0412);
  const cord = powerCord(V3(-0.105, 0.04, 0), [V3(-0.14, 0.03, 0), V3(-0.18, 0.0, 0.05)], V3(-0.22, 0.012, 0.1));
  kit.part('body', 'Badan motor & pegangan', [0, 0.06, 0], body, trim, slider, eject, vents, ledM.mesh, cord.group);
  const beaters = new THREE.Group();
  const b1 = beater(), b2 = beater();
  b1.position.set(0.045, 0.004, 0.017);
  b2.position.set(0.045, 0.004, -0.017);
  beaters.add(b1, b2);
  kit.part('beaters', 'Pengocok (beater) — dapat dilepas', [0, -0.08, 0], beaters);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 5);
  kit.stateVar('speed', 0, 3);
  kit.stateVar('attach', 1, 4);
  let spin = 0;
  const plugBase = cord.plug.position.clone();
  kit.onApply((s, dt, t) => {
    spin += dt * s.power * (10 + s.speed * 25);
    b1.rotation.y = spin;
    b2.rotation.y = -spin;
    beaters.position.y = (1 - s.attach) * -0.12;
    beaters.visible = s.attach > 0.02;
    slider.position.x = -0.022 + s.speed * 0.012;
    ledM.mat.emissiveIntensity = s.power * 3;
    cord.plug.position.copy(plugBase).add(V3(0, 0, -0.03 * (1 - s.plug)));
    kit.root.position.z = s.power > 0.05 ? Math.sin(t * 80) * 0.0005 : 0;
  });
  return kit.finish({ electric: true });
}

/* =============================================== PLANETARY MIXER == */
export function buildPlanetaryMixer() {
  const kit = new Kit('planetary-mixer');
  const paint = M.enamelGrey;
  const base = rbox(0.44, 0.07, 0.56, 0.025, paint, 3);
  base.position.set(0, 0.035, 0);
  const column = mesh(rectLatheGeo([[0.02, 0], [0.0, 0.08], [-0.012, 0.6], [-0.012, 0.62]], 0.26, 0.24, 0.06, 5), paint);
  column.position.set(0, 0.06, -0.15);
  const feet = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(cyl(0.02, 0.022, 0.012, M.rubber, 16), sx * 0.18, 0.0, sz * 0.23)));
  kit.part('body', 'Badan & kolom (rangka utama)', [0, 0, -0.12], base, column, ...feet);
  // kepala (head) dengan transmisi
  const head = rbox(0.28, 0.2, 0.52, 0.07, paint, 4);
  head.position.set(0, 0.78, -0.02);
  const cap = lathe([[0, 0], [0.05, 0], [0.052, 0.006], [0.05, 0.03], [0.042, 0.036], [0, 0.036]], M.steelSatin, 32);
  cap.rotation.x = PI / 2;
  cap.position.set(0, 0.79, 0.235);
  const controls = new THREE.Group();
  controls.add(rbox(0.012, 0.11, 0.16, 0.004, M.plasticBlack, 2));
  const bStart = at(cyl(0.012, 0.012, 0.012, M.plasticGreen, 16), 0.008, 0.025, -0.04, 0, 0, PI / 2);
  const bStop = at(cyl(0.012, 0.012, 0.012, M.plasticRed, 16), 0.008, -0.025, -0.04, 0, 0, PI / 2);
  const timer = knob(0.022, 0.014, M.plasticGrey, colorMat(0xffffff));
  timer.rotation.y = PI / 2;
  timer.position.set(0.006, 0, 0.035);
  controls.add(bStart, bStop, timer);
  controls.position.set(0.146, 0.78, -0.08);
  const ledP = led(kit, M.ledGreen, 0.005);
  at(ledP.mesh, 0.152, 0.83, -0.08, 0, 0, PI / 2);
  const speedLever = group(at(cyl(0.006, 0.006, 0.07, M.steelPolished, 10), 0, 0.035, 0), at(sphere(0.013, M.plasticBlack, 16, 12), 0, 0.072, 0));
  speedLever.position.set(-0.13, 0.86, -0.18);
  kit.part('head', 'Kepala mesin (motor & transmisi) + panel kontrol', [0, 0.18, 0], head, cap, controls, ledP.mesh, speedLever);
  // rumah planetary & pengaduk
  const planet = new THREE.Group();
  planet.add(lathe([[0, 0], [0.075, 0], [0.078, 0.02], [0.07, 0.045], [0, 0.045]], M.steelSatin, 40));
  const orbit = new THREE.Group();
  const shaft = cyl(0.009, 0.009, 0.06, M.steelPolished, 12);
  shaft.position.y = -0.03;
  // flat beater (pengaduk pipih) aluminium
  const beaterShape = shapeFrom(
    [[0, 0], [0.045, -0.02], [0.08, -0.09], [0.088, -0.17], [0.06, -0.235], [0, -0.255], [-0.06, -0.235], [-0.088, -0.17], [-0.08, -0.09], [-0.045, -0.02]],
    [[[0, -0.045], [0.05, -0.1], [0.062, -0.17], [0.04, -0.215], [0, -0.228], [-0.04, -0.215], [-0.062, -0.17], [-0.05, -0.1]]],
  );
  const fb = mesh(extrudeGeo(beaterShape, 0.008, { bevel: 0.003, segs: 3, curveSegments: 16 }), M.aluminium);
  fb.position.y = -0.055;
  const spinner = group(shaft, fb);
  spinner.position.x = 0.022;
  orbit.add(spinner);
  planet.add(orbit);
  planet.position.set(0, 0.68 - 0.045, 0.12);
  planet.children[0].position.y = 0;
  kit.part('beater', 'Pengaduk (flat beater) & poros planetary', [0, -0.05, 0.25], planet);
  // mangkuk & penyangga
  const bowlG = new THREE.Group();
  // mangkuk mixer: dasar membulat dalam, dinding sedikit melebar, bibir gulung, telinga pengunci
  const bp = [];
  for (let k = 0; k <= 12; k++) { const a = -PI / 2 + (k / 12) * (PI / 2) * 0.92; bp.push([0.004 + Math.cos(a) * 0.15, 0.12 + Math.sin(a) * 0.12]); }
  bp.push([0.158, 0.17], [0.164, 0.23], [0.168, 0.276]);
  const inner = bp.slice().reverse().map(([r, y]) => [Math.max(r - 0.0022, 0), y + (y < 0.05 ? 0.0022 : 0)]);
  const bowl = group(
    lathe([[0, 0], ...bp, [0.1695, 0.279], ...inner, [0, 0.0022]], M.steelPolished, 72),
    at(torus(0.1685, 0.0035, M.steelPolished, 8, 72), 0, 0.279, 0, PI / 2),
    at(lathe([[0.05, -0.02], [0.065, -0.02], [0.07, 0.002], [0.05, 0.002]], M.steelSatin, 40), 0, 0, 0),
  );
  const dough = mesh(latheGeo([[0, 0.006], [0.03, 0.006], [0.06, 0.03], [0.09, 0.07], [0.095, 0.1], [0.05, 0.125], [0, 0.12]], 32), M.dough);
  for (const s of [-1, 1]) bowlG.add(at(rbox(0.03, 0.025, 0.03, 0.008, M.steelPolished, 2), s * 0.18, 0.24, 0));
  bowlG.add(bowl, dough);
  bowlG.position.set(0, 0.36, 0.12);
  kit.part('bowl', 'Mangkuk adonan (bowl) stainless', [0, -0.1, 0.35], bowlG);
  const yoke = new THREE.Group();
  for (const s of [-1, 1]) {
    yoke.add(tube([V3(s * 0.11, 0.55, -0.03), V3(s * 0.18, 0.55, 0.0), V3(s * 0.2, 0.56, 0.12), V3(s * 0.19, 0.56, 0.2)], 0.014, paint, { segs: 24, radial: 10 }));
  }
  yoke.add(at(rbox(0.24, 0.06, 0.06, 0.02, paint, 2), 0, 0.55, -0.04));
  // tuas pengangkat mangkuk
  const crank = group(at(cylX(0.012, 0.05, M.steelPolished), 0.025, 0, 0), at(cyl(0.006, 0.006, 0.12, M.steelPolished, 10), 0.05, -0.06, 0), at(sphere(0.016, M.plasticBlack, 16, 12), 0.05, -0.12, 0));
  crank.position.set(0.13, 0.45, -0.12);
  kit.part('yoke', 'Penyangga & tuas pengangkat mangkuk', [0.2, 0, 0], yoke, crank);
  // rig
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 3);
  kit.stateVar('speed', 0, 3);
  kit.stateVar('lift', 1, 2); // 1 = mangkuk di atas (posisi kerja)
  kit.stateVar('fill', 0, 2);
  let a1 = 0, a2 = 0;
  const yokeInner = kit.parts.find((p) => p.name === 'yoke').inner;
  const bowlInner = kit.parts.find((p) => p.name === 'bowl').inner;
  kit.onApply((s, dt, t) => {
    a1 += dt * s.power * (1.5 + s.speed * 2);
    a2 += dt * s.power * (4 + s.speed * 5);
    orbit.rotation.y = a1;
    spinner.rotation.y = -a2;
    const drop = (1 - s.lift) * -0.12;
    bowlInner.position.y = drop;
    yokeInner.position.y = drop;
    crank.rotation.x = (1 - s.lift) * 1.6;
    dough.visible = s.fill > 0.05;
    dough.scale.set(1, Math.max(0.01, s.fill), 1);
    dough.rotation.y = a1 * 0.5;
    ledP.mat.emissiveIntensity = s.power * 3;
    bStart.position.x = 0.008 - s.power * 0.004;
    speedLever.rotation.z = -0.4 + s.speed * 0.3;
  });
  return kit.finish({ electric: true });
}

/* ================================================== SPIRAL MIXER == */
export function buildSpiralMixer() {
  const kit = new Kit('spiral-mixer');
  const paint = M.enamelWhite;
  const lower = mesh(rectLatheGeo([[0, 0.08], [0, 0.56], [-0.01, 0.6], [-0.03, 0.605]], 0.56, 0.9, 0.06, 5), paint);
  const casters = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(caster(0.035, M.steelDark, M.rubber), sx * 0.22, 0, sz * 0.36)));
  const skirt = at(rbox(0.5, 0.06, 0.84, 0.02, M.steelSatin, 2), 0, 0.09, 0);
  const column = mesh(rectLatheGeo([[0, 0], [-0.01, 0.62], [-0.03, 0.64]], 0.46, 0.3, 0.07, 5), paint);
  column.position.set(0, 0.6, -0.29);
  kit.part('body', 'Badan bawah & kolom (beroda)', [0, 0, -0.15], lower, skirt, column, ...casters);
  const head = rbox(0.4, 0.24, 0.66, 0.08, paint, 4);
  head.position.set(0, 1.12, -0.1);
  const display = mesh(new THREE.PlaneGeometry(0.12, 0.05), kit.own(M.lcd));
  const dispTex = labelTexture('00:00', { w: 256, h: 96, bg: '#04140c', fg: '#38ff8a', font: 'bold 64px monospace', glow: true });
  display.material.emissive = new THREE.Color(0xffffff);
  display.material.emissiveMap = dispTex;
  display.material.emissiveIntensity = 0;
  display.position.set(0, 1.15, 0.2301);
  const panel = at(rbox(0.32, 0.14, 0.01, 0.01, M.plasticGloss, 2), 0, 1.13, 0.226);
  const btns = new THREE.Group();
  const bOn = at(cylZ(0.014, 0.012, M.plasticGreen), -0.11, 1.1, 0.234);
  const bOff = at(cylZ(0.014, 0.012, M.plasticRed), 0.11, 1.1, 0.234);
  const bSp1 = at(cylZ(0.011, 0.01, M.plasticGrey), -0.06, 1.1, 0.234);
  const bSp2 = at(cylZ(0.011, 0.01, M.plasticGrey), 0.06, 1.1, 0.234);
  const eStop = at(cylZ(0.022, 0.02, M.plasticRed), 0.17, 1.18, 0.23);
  btns.add(bOn, bOff, bSp1, bSp2);
  kit.part('head', 'Kepala mesin & panel kontrol', [0, 0.2, 0], head, panel, display, btns, eStop);
  // mangkuk berputar
  const bowlG = new THREE.Group();
  bowlG.add(vessel({ rB: 0.22, rT: 0.26, h: 0.3, wall: 0.002, base: 0.004, corner: 0.06, lip: 0.004 }, M.steelPolished, 72));
  const dough = mesh(latheGeo([[0, 0.006], [0.14, 0.006], [0.19, 0.04], [0.205, 0.09], [0.18, 0.13], [0.08, 0.15], [0, 0.14]], 40), M.dough);
  bowlG.add(dough);
  bowlG.position.set(0, 0.605, 0.15);
  kit.part('bowl', 'Mangkuk berputar (bowl)', [0, -0.05, 0.4], bowlG);
  // pengait spiral & batang pemecah
  const hookG = new THREE.Group();
  const hp = [];
  // poros lurus lalu spiral (corkscrew) yang melebar ke bawah
  for (let i = 0; i <= 80; i++) {
    const u = i / 80;
    if (u < 0.3) { hp.push(V3(0, -u * 0.4, 0)); continue; }
    const v = (u - 0.3) / 0.7, a = v * TAU * 1.6, r = 0.07 * Math.min(1, v * 2.2);
    hp.push(V3(Math.cos(a) * r, -u * 0.4, Math.sin(a) * r));
  }
  hookG.add(at(cyl(0.024, 0.024, 0.07, M.steelPolished, 16), 0, -0.01, 0));
  hookG.add(tube(hp, 0.0135, M.steelPolished, { segs: 160, radial: 12 }));
  hookG.add(at(sphere(0.0135, M.steelPolished, 12, 8), ...hp[hp.length - 1].toArray()));
  const hookHolder = group(hookG);
  hookHolder.position.set(0.06, 1.02, 0.12);
  const breaker = at(cyl(0.012, 0.012, 0.3, M.steelPolished, 12), -0.07, 0.86, 0.12);
  kit.part('hook', 'Pengait spiral (spiral hook) & batang pemecah', [0, 0.25, 0.35], hookHolder, breaker);
  // pelindung (safety guard): rangka cincin + kisi kawat sejajar, berengsel di belakang
  const guard = new THREE.Group();
  const GR = 0.272;
  guard.add(at(torus(GR, 0.006, M.steelPolished, 8, 72), 0, 0, 0, PI / 2));
  const wires = [];
  for (let i = -6; i <= 6; i++) {
    const x = i * 0.04, half = Math.sqrt(Math.max(0, GR * GR - x * x));
    if (half < 0.02) continue;
    wires.push(at(cylZ(0.0032, half * 2, M.steelPolished, 6), x, 0.0, 0));
  }
  wires.push(at(cylX(0.006, GR * 2, M.steelPolished, 8), 0, 0.006, 0.0));
  guard.add(mergeMeshes(wires, M.steelPolished));
  // celah pengisian (bukaan) berbingkai & lengan engsel
  guard.add(at(rbox(0.14, 0.012, 0.1, 0.01, colorMat(0xd23a2a, 0.5), 2), 0.12, 0.012, 0.12));
  for (const s of [-1, 1]) guard.add(at(rbox(0.03, 0.02, 0.2, 0.006, M.steelPolished, 2), s * 0.12, 0.01, -GR - 0.06));
  const guardHolder = group(guard);
  // engsel di belakang mangkuk: holder di titik engsel, guard digeser ke depan
  guard.position.z = GR + 0.06;
  guardHolder.position.set(0, 0.912, 0.15 - GR - 0.06);
  const guardPart = kit.part('guard', 'Penutup pengaman (safety guard)', [0, 0.35, 0.2], guardHolder);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 2);
  kit.stateVar('speed', 0, 3);
  kit.stateVar('lid', 0, 3); // 1 = guard terbuka
  kit.stateVar('fill', 0, 2);
  let a = 0, b = 0, last = '';
  kit.onApply((s, dt, t) => {
    a += dt * s.power * (5 + s.speed * 6);
    b += dt * s.power * (0.8 + s.speed * 0.4);
    hookG.rotation.y = a;
    bowlG.rotation.y = -b;
    dough.visible = s.fill > 0.05;
    dough.scale.set(1, Math.max(0.01, s.fill), 1);
    guardHolder.rotation.x = -s.lid * 1.45;
    display.material.emissiveIntensity = s.plug > 0.5 ? 1.4 : 0;
    const txt = s.power > 0.5 ? `SPD ${Math.round(s.speed) || 1}` : '00:00';
    if (txt !== last) { dispTex.userData.update(txt); last = txt; }
  });
  return kit.finish({ electric: true });
}

/* =================================================== MEAT SLICER == */
/**
 * Mesin pengiris daging (gravity slicer) 300 mm: badan aluminium cor, pisau bundar dengan cincin
 * pelindung & penutup tengah, pengasah (sharpener) di atas pelindung, pelat pengatur ketebalan
 * (gauge plate) + kenop besar, kereta (carriage) miring yang bergeser sejajar bidang pisau dengan
 * pendorong (end weight) bergagang, serta area penampung irisan di sisi kiri.
 * Sumbu: pisau pada bidang XY (menghadap +Z / operator), kereta bergerak sepanjang X.
 */
export function buildMeatSlicer() {
  const kit = new Kit('meat-slicer');
  const al = M.aluminiumCast;
  const BR = 0.15; // jari-jari pisau (Ø 300 mm)
  const bx = -0.04, by = 0.27, bz = -0.04; // pusat pisau
  const base = mesh(rectLatheGeo([[0.012, 0], [0.014, 0.01], [0.004, 0.075], [-0.01, 0.085], [-0.03, 0.088]], 0.56, 0.46, 0.06, 6), al);
  const feet = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(cyl(0.02, 0.022, 0.018, M.rubber, 16), sx * 0.24, -0.008, sz * 0.18)));
  // menara motor di belakang pisau
  const tower = mesh(rectLatheGeo([[0.01, 0], [0, 0.04], [-0.01, 0.2], [-0.04, 0.23]], 0.2, 0.11, 0.05, 5), al);
  tower.position.set(bx, 0.085, bz - 0.09);
  const motor = at(cylZ(0.1, 0.1, al, 40), bx, by, bz - 0.09);
  // panel tombol depan
  const bOn = at(cylZ(0.012, 0.012, M.plasticGreen), -0.2, 0.045, 0.232);
  const bOff = at(cylZ(0.012, 0.012, M.plasticRed), -0.165, 0.045, 0.232);
  const ledS = led(kit, M.ledGreen, 0.004);
  at(ledS.mesh, -0.1825, 0.068, 0.232);
  // kenop ketebalan besar (di depan kanan pada dudukan)
  const thickKnob = knob(0.04, 0.034, M.plasticBlack, colorMat(0xffffff));
  thickKnob.position.set(0.17, 0.06, 0.232);
  const scaleRing = at(torus(0.046, 0.003, M.steelSatin, 6, 40), 0.17, 0.06, 0.233);
  const cord = powerCord(V3(-0.2, 0.04, -0.22), [V3(-0.24, 0.02, -0.26)], V3(-0.3, 0.012, -0.3));
  // area penampung irisan (receiving tray) di kiri depan
  const recv = at(rbox(0.2, 0.01, 0.2, 0.006, M.steelSatin, 2), -0.17, 0.09, 0.1);
  kit.part('base', 'Badan dasar (aluminium cor), motor, tombol & kenop ketebalan', [0, -0.08, 0], base, ...feet, tower, motor, bOn, bOff, ledS.mesh, thickKnob, scaleRing, recv, cord.group);
  // pisau bundar
  const bladeG = new THREE.Group();
  const disc = lathe([[0, 0.003], [0.06, 0.0028], [0.138, 0.0018], [0.147, 0.0004], [BR, 0], [0.147, -0.0004], [0.138, -0.0018], [0.06, -0.0028], [0, -0.003]], M.blade, 120);
  disc.rotation.x = PI / 2;
  const hub = lathe([[0, 0.03], [0.04, 0.026], [0.075, 0.012], [0.085, 0.004], [0.085, 0], [0, 0]], al, 48);
  hub.rotation.x = PI / 2;
  hub.position.z = 0.003;
  const hubKnob = at(knob(0.02, 0.022, M.plasticBlack), 0, 0, 0.032);
  const spinG = group(disc);
  bladeG.add(spinG, hub, hubKnob);
  bladeG.position.set(bx, by, bz);
  kit.part('blade', 'Pisau bundar (circular blade) & penutup tengah', [0, 0.05, 0.25], bladeG);
  // cincin pelindung pisau: menutup tepi atas & belakang, bagian kanan-bawah terbuka untuk memotong
  const ringGeo = new THREE.TorusGeometry(BR + 0.008, 0.012, 10, 80, PI * 1.55);
  const guard = mesh(ringGeo, al);
  guard.scale.z = 1.6;
  guard.rotation.z = PI * 0.05;
  guard.position.set(bx, by, bz - 0.004);
  // pengasah (sharpener) di atas pelindung
  const sharp = group(
    rbox(0.08, 0.06, 0.07, 0.014, al, 2),
    at(cyl(0.011, 0.011, 0.03, M.plasticBlack, 16), -0.02, 0.045, 0.0),
    at(cyl(0.011, 0.011, 0.03, M.plasticBlack, 16), 0.02, 0.045, 0.0),
  );
  sharp.position.set(bx - 0.02, by + BR + 0.04, bz - 0.01);
  kit.part('guard', 'Cincin pelindung pisau & pengasah (sharpener)', [0, 0.12, 0.1], guard, sharp);
  // pelat pengatur ketebalan (gauge plate) — sebidang dengan pisau di sisi kanan (sisi datang daging)
  const gShape = shapeFrom([[0.05, -0.13], [0.24, -0.13], [0.24, 0.08], [0.06, 0.08], ...arcPts(0, 0, BR + 0.006, Math.atan2(0.08, 0.06) * 0 + 0.93, -1.08, 10).map(([x, y]) => [x, y]).slice(1)]);
  const gauge = mesh(extrudeGeo(gShape, 0.008, { bevel: 0.002, segs: 1 }), al);
  gauge.position.set(bx, by, bz + 0.006);
  kit.part('gauge', 'Pelat pengatur ketebalan (gauge plate)', [0.15, 0, 0.05], gauge);
  // kereta (carriage): rel depan, lengan, baki miring, pendorong & gagang
  const carr = new THREE.Group();
  const trayG = new THREE.Group();
  trayG.add(rbox(0.24, 0.012, 0.2, 0.006, al, 2));
  trayG.add(at(rbox(0.012, 0.09, 0.2, 0.004, al, 2), 0.12, 0.045, 0)); // dinding ujung (end fence)
  trayG.add(at(rbox(0.24, 0.03, 0.012, 0.004, al, 2), 0, 0.015, 0.1)); // bibir depan
  trayG.rotation.x = -0.32; // miring ke arah pisau (gravity feed)
  trayG.position.set(0, 0.16, 0.08);
  const arm = rbox(0.06, 0.08, 0.1, 0.012, al, 2);
  arm.position.set(0.0, 0.11, 0.12);
  const rail = cylX(0.012, 0.26, M.steelPolished);
  rail.position.set(0, 0.095, 0.17);
  // pendorong (end weight) pada batang sejajar Z
  const rod = cylZ(0.007, 0.22, M.steelPolished);
  rod.position.set(0.1, 0.3, 0.08);
  const pusher = group(
    rbox(0.012, 0.09, 0.12, 0.006, al, 2),
    at(cyl(0.008, 0.008, 0.08, M.steelPolished, 10), 0.0, 0.08, 0.0),
    at(sphere(0.022, M.plasticBlack, 16, 12), 0.0, 0.125, 0),
  );
  pusher.position.set(0.078, 0.215, 0.07);
  const meat = rbox(0.13, 0.1, 0.13, 0.04, M.meat, 3);
  meat.position.set(0.0, 0.205, 0.035);
  meat.rotation.x = -0.32;
  const handle = group(at(cyl(0.009, 0.009, 0.08, M.steelPolished, 10), 0, 0.04, 0), at(sphere(0.02, M.plasticBlack, 16, 12), 0, 0.09, 0));
  handle.position.set(-0.08, 0.13, 0.19);
  carr.add(trayG, arm, rail, rod, pusher, meat, handle);
  carr.position.set(0.12, 0, 0.0);
  kit.part('carriage', 'Kereta penampan (carriage) & pendorong daging', [0.1, 0.05, 0.25], carr);
  // irisan daging hasil (di area penampung)
  const slices = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const sl = cyl(0.05, 0.05, 0.002, M.meat, 24);
    sl.scale.z = 0.8;
    sl.position.set(-0.2 + i * 0.012, 0.097 + i * 0.002, 0.1);
    sl.rotation.z = 0.1;
    slices.add(sl);
  }
  kit.root.add(slices);
  kit.stateVar('plug', 0, 6);
  kit.stateVar('power', 0, 3);
  kit.stateVar('work', 0, 2);
  kit.stateVar('thick', 0.3, 3);
  kit.stateVar('fill', 0, 3);
  let spin = 0, ph = 0;
  kit.onApply((s, dt) => {
    spin += dt * s.power * 25;
    spinG.rotation.z = -spin;
    ph += dt * s.work * 3;
    carr.position.x = 0.12 + (Math.sin(ph) - 0) * 0.13 * Math.min(1, s.work * 2) - 0.13 * Math.min(1, s.work * 2) * 0.0;
    meat.visible = s.fill > 0.05;
    meat.scale.setScalar(Math.max(0.001, s.fill));
    slices.children.forEach((sl, i) => { sl.visible = s.fill > 0.05 && ph > (i + 1) * 3; });
    ledS.mat.emissiveIntensity = s.power * 3;
    thickKnob.rotation.z = -s.thick * 3;
    gauge.position.z = bz + 0.006 + s.thick * 0.012;
  });
  return kit.finish({ electric: true, sharp: true });
}

/* ============================================ TIMBANGAN DIGITAL == */
export function buildScale() {
  const kit = new Kit('scale');
  const body = mesh(rectLatheGeo([[0.004, 0], [0.008, 0.006], [0.004, 0.036], [-0.004, 0.044], [-0.012, 0.046]], 0.24, 0.26, 0.03, 5), M.plasticWhite);
  // panel depan: layar LCD & tombol pada sisi depan badan
  const front = rbox(0.2, 0.03, 0.006, 0.004, M.plasticGloss, 2);
  front.position.set(0, 0.024, 0.1335);
  const lcd = mesh(new THREE.PlaneGeometry(0.085, 0.02), kit.own(M.lcd));
  const tex = labelTexture('', { w: 340, h: 80, bg: '#0a1a12', fg: '#7dffb0', font: 'bold 60px monospace', glow: true });
  lcd.material.emissive = new THREE.Color(0xffffff);
  lcd.material.emissiveMap = tex;
  lcd.material.emissiveIntensity = 0;
  lcd.position.set(-0.045, 0.024, 0.1369);
  const btns = ['ON', 'TARE', 'UNIT'].map((l, i) => {
    const b = cylZ(0.0065, 0.004, i === 0 ? M.plasticRed : M.plasticGrey);
    b.position.set(0.035 + i * 0.022, 0.024, 0.137);
    return b;
  });
  const frontG = group(lcd, ...btns);
  const feet = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => at(cyl(0.008, 0.009, 0.004, M.rubber, 12), sx * 0.1, -0.002, sz * 0.1)));
  kit.part('body', 'Badan timbangan & layar digital', [0, -0.04, 0], body, front, frontG, ...feet);
  const plat = new THREE.Group();
  plat.add(at(cyl(0.02, 0.025, 0.012, M.plasticGrey, 16), 0, 0.05, -0.01));
  plat.add(at(rbox(0.22, 0.006, 0.2, 0.012, M.steelPolished, 3), 0, 0.058, -0.01));
  kit.part('platform', 'Piringan timbang stainless', [0, 0.06, 0], plat);
  const bowlG = new THREE.Group();
  bowlG.add(vessel({ rB: 0.05, rT: 0.09, h: 0.07, wall: 0.0014, base: 0.002, corner: 0.03, lip: 0.002 }, M.steelPolished, 48));
  const flour = mesh(latheGeo([[0, 0.004], [0.025, 0.004], [0.042, 0.02], [0.062, 0.045], [0.04, 0.056], [0, 0.06]], 32), colorMat(0xf5f1e8, 0.95));
  bowlG.add(flour);
  bowlG.position.set(0, 0.061, -0.01);
  kit.root.add(bowlG);
  kit.stateVar('power', 0, 8);
  kit.stateVar('bowl', 0, 5);
  kit.stateVar('fill', 0, 2);
  kit.stateVar('tare', 0, 8);
  kit.stateVar('unit', 'g', 1);
  let last = '';
  kit.onApply((s) => {
    bowlG.visible = s.bowl > 0.02;
    bowlG.position.y = 0.061 + (1 - s.bowl) * 0.08;
    flour.visible = s.fill > 0.02;
    flour.scale.set(1, Math.max(0.01, s.fill), 1);
    lcd.material.emissiveIntensity = s.power > 0.5 ? 1.3 : 0;
    btns[0].position.z = 0.137 - (s.power > 0.5 ? 0.0015 : 0);
    const grams = Math.max(0, Math.round((s.bowl > 0.98 ? 180 : 0) * (1 - s.tare) + s.fill * 500));
    const txt = s.power > 0.5 ? (s.unit === 'lb' ? `${(grams / 453.6).toFixed(2)} lb` : `${grams} g`) : '';
    if (txt !== last) { tex.userData.update(txt); last = txt; }
  });
  return kit.finish({ electric: true });
}
