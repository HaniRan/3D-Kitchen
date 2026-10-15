/**
 * StudioScene: panggung studio netral untuk memeriksa satu alat secara detail
 * (rotasi, zoom, exploded view, simulasi, identifikasi 3D). Latar gradien, lantai bayangan,
 * pencahayaan tiga titik (key, fill, rim).
 */
import * as THREE from 'three';
import { studioBackdrop } from '../models/textures.js';
import { M } from '../models/materials.js';
import { PI } from '../models/helpers.js';

export class StudioScene {
  constructor(stage) {
    this.stage = stage;
    this.scene = new THREE.Scene();
    this.scene.background = studioBackdrop();
    this.scene.environment = stage.envMap;
    this.scene.environmentIntensity = 0.9;
    this.holder = new THREE.Group();
    this.scene.add(this.holder);
    this.props = new THREE.Group();
    this.scene.add(this.props);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -PI / 2;
    ground.receiveShadow = true;
    this.ground = ground;
    this.scene.add(ground);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.02, 0.02, 96), new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0.55 }));
    disc.receiveShadow = true;
    this.disc = disc;
    this.scene.add(disc);

    this.key = new THREE.DirectionalLight(0xffffff, 2.2);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.bias = -0.0003;
    this.key.shadow.normalBias = 0.01;
    this.scene.add(this.key, this.key.target);
    this.fill = new THREE.DirectionalLight(0xdce8ff, 0.7);
    this.rim = new THREE.DirectionalLight(0xffffff, 1.0);
    this.scene.add(this.fill, this.rim, new THREE.HemisphereLight(0xffffff, 0x9aa4ad, 0.5));
    this.current = null;
    this.radius = 1;
  }

  /** Tampilkan model; atur cahaya, lantai, dan batas zoom sesuai ukuran objek. */
  show(model) {
    this.holder.clear();
    this.props.clear();
    this.holder.rotation.set(0, 0, 0);
    this.holder.position.set(0, 0, 0);
    if (!model) { this.current = null; return; }
    const api = model.userData.model;
    if (api?.meta?.studio?.rotation) model.rotation.set(...api.meta.studio.rotation);
    model.position.set(0, 0, 0);
    this.holder.add(model);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3());
    model.position.x -= c.x;
    model.position.z -= c.z;
    model.position.y -= box.min.y;
    this.current = model;
    this.layout();
  }

  /** Hitung ulang posisi lantai, cahaya dan batas kamera berdasarkan isi panggung. */
  layout() {
    this.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.holder);
    if (this.props.children.length) box.union(new THREE.Box3().setFromObject(this.props));
    const size = box.getSize(new THREE.Vector3());
    const r = Math.max(size.length() / 2, 0.05);
    this.radius = r;
    this.ground.position.y = 0;
    this.disc.scale.set(r * 1.25, 1, r * 1.25);
    this.disc.position.y = -0.0101 * 1;
    this.disc.scale.y = Math.max(r * 0.3, 0.05);
    this.disc.position.y = -0.0101 * this.disc.scale.y;
    const c = box.getCenter(new THREE.Vector3());
    this.key.position.set(c.x + r * 2, c.y + r * 4, c.z + r * 3);
    this.key.target.position.copy(c);
    const sc = this.key.shadow.camera;
    sc.left = sc.bottom = -r * 2;
    sc.right = sc.top = r * 2;
    sc.near = r * 0.5;
    sc.far = r * 12;
    sc.updateProjectionMatrix();
    this.fill.position.set(c.x - r * 3, c.y + r, c.z + r * 2);
    this.rim.position.set(c.x, c.y + r * 2, c.z - r * 4);
    const ctl = this.stage.controls;
    ctl.minDistance = r * 0.6;
    ctl.maxDistance = r * 8;
  }

  view(dir = new THREE.Vector3(0.55, 0.42, 1)) {
    const box = new THREE.Box3().setFromObject(this.holder);
    const c = box.getCenter(new THREE.Vector3());
    const fov = THREE.MathUtils.degToRad(this.stage.camera.fov);
    const fit = Math.min(fov, fov * this.stage.camera.aspect);
    const dist = (this.radius * 1.2) / Math.sin(fit / 2);
    return { pos: c.clone().addScaledVector(dir.clone().normalize(), dist), target: c };
  }
}
