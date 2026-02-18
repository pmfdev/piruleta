import * as THREE from "three";
import { mapLayout } from "../config/mapLayout.js";
import { EntityFactory } from "./EntityFactory.js";

function smoothHeight(x, z, mountains) {
  let h = 0;
  mountains.forEach((m) => {
    const dx = x - m.x;
    const dz = z - m.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < m.radius) {
      const t = 1 - d / m.radius;
      h += m.height * t * t;
    }
  });
  return h;
}

// Pattern: Facade
// Motivo: ofrecer una API simple sobre detalles de Three.js.
// Beneficio: los sistemas de juego no dependen de la complejidad del render.
export class WorldScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.factory = new EntityFactory();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb95f31);

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 350);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.ground = null;
    this.rover = null;
    this.piruleta = null;
    this.camp = null;
    this.pickups = [];
    this.rocks = [];
    this.stations = [];
    this.roverYaw = 0;

    this.setupLights();
    this.setupTerrain();
    this.setupEntities();
    this.resize();
  }

  setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xfff4df, 1);
    dir.position.set(30, 45, 10);
    this.scene.add(dir);
  }

  setupTerrain() {
    const geometry = new THREE.PlaneGeometry(130, 130, 64, 64);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, smoothHeight(x, y, mapLayout.mountains));
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: 0xbd6a3b, roughness: 1 });
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  setupEntities() {
    this.rover = this.factory.createRover();
    this.piruleta = this.factory.createPiruleta();
    this.camp = this.factory.createCamp();

    this.setObjectXZ(this.rover, mapLayout.spawn.x, mapLayout.spawn.z, 0);
    this.setObjectXZ(this.piruleta, mapLayout.piruleta.x, mapLayout.piruleta.z, 0.4);
    this.setObjectXZ(this.camp, mapLayout.camp.x, mapLayout.camp.z, 0);
    this.scene.add(this.rover, this.piruleta, this.camp);

    mapLayout.stations.forEach((s) => {
      const mesh = this.factory.createStation();
      this.setObjectXZ(mesh, s.x, s.z, 0.9);
      this.scene.add(mesh);
      this.stations.push({ ...s, mesh });
    });

    mapLayout.rocks.forEach((r) => {
      const rock = this.factory.createRock(r.r);
      this.setObjectXZ(rock, r.x, r.z, r.r * 0.65);
      this.scene.add(rock);
      this.rocks.push({ ...r, mesh: rock });
    });
  }

  setPickups(pickups) {
    this.pickups.forEach((p) => this.scene.remove(p.mesh));
    this.pickups = pickups.map((p) => {
      const mesh = this.factory.createPickup(p.type);
      this.setObjectXZ(mesh, p.x, p.z, 1);
      this.scene.add(mesh);
      return { ...p, mesh };
    });
  }

  removePickupById(id) {
    const idx = this.pickups.findIndex((p) => p.id === id);
    if (idx === -1) return;
    this.scene.remove(this.pickups[idx].mesh);
    this.pickups.splice(idx, 1);
  }

  setObjectXZ(object, x, z, offsetY = 0) {
    object.position.set(x, this.getHeightAt(x, z) + offsetY, z);
  }

  getHeightAt(x, z) {
    return smoothHeight(x, z, mapLayout.mountains);
  }

  getRoverPosition() {
    return this.rover.position;
  }

  setRoverTransform(x, z, yaw) {
    // El modelo apunta visualmente hacia -Z; compensamos para alinearlo con
    // el heading fisico del sistema de movimiento (+Z cuando yaw=0).
    this.roverYaw = yaw;
    this.rover.rotation.y = yaw + Math.PI;
    this.setObjectXZ(this.rover, x, z, 0.5);
  }

  updateCamera() {
    const p = this.rover.position;
    const yaw = this.roverYaw;
    const back = new THREE.Vector3(Math.sin(yaw) * -11, 6.5, Math.cos(yaw) * -11);
    this.camera.position.set(p.x + back.x, p.y + back.y, p.z + back.z);
    this.camera.lookAt(p.x, p.y + 1, p.z);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  }
}
