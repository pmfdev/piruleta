import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Pattern: Factory
// Motivo: crear entidades 3D con una construccion consistente.
// Beneficio: evita duplicar inicializacion de mallas y materiales.
export class EntityFactory {
  constructor(options = {}) {
    this.roverModelPath = options.roverModelPath ?? "/models/rover.glb";
    this.roverModelScale = options.roverModelScale ?? 1.1;
    this.loader = new GLTFLoader();
    this.roverModelScene = null;
    this.roverModelPromise = null;
  }

  loadRoverModel() {
    if (this.roverModelScene) return Promise.resolve(this.roverModelScene);
    if (this.roverModelPromise) return this.roverModelPromise;

    this.roverModelPromise = new Promise((resolve, reject) => {
      this.loader.load(
        this.roverModelPath,
        (gltf) => {
          this.roverModelScene = gltf.scene;
          resolve(gltf.scene);
        },
        undefined,
        (error) => reject(error)
      );
    });
    return this.roverModelPromise;
  }

  createFallbackRover() {
    const root = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1, 3),
      new THREE.MeshStandardMaterial({ color: 0xf0e5c8, roughness: 0.75 })
    );
    body.position.y = 1.2;
    root.add(body);

    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.9, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xc4b89b })
    );
    mast.position.set(0, 2, -0.9);
    root.add(mast);
    return root;
  }

  createRover() {
    const root = new THREE.Group();
    const fallback = this.createFallbackRover();
    root.add(fallback);

    this.loadRoverModel()
      .then((source) => {
        const roverModel = source.clone(true);
        roverModel.scale.setScalar(this.roverModelScale);
        roverModel.position.set(0, 0, 0);

        roverModel.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = true;
          node.receiveShadow = true;
        });

        root.remove(fallback);
        root.add(roverModel);
      })
      .catch(() => {
        // Si el modelo no existe, mantenemos el rover procedural.
      });

    return root;
  }

  createPiruleta() {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0xe6d1b8, roughness: 0.6 })
    );
    return mesh;
  }

  createCamp() {
    const group = new THREE.Group();
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0x8aa0ad, roughness: 0.9 })
    );
    floor.position.y = 0.25;
    group.add(floor);
    return group;
  }

  createStation() {
    return new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 2, 18),
      new THREE.MeshStandardMaterial({ color: 0x3ec0ff, emissive: 0x07334a })
    );
  }

  createReturnShip() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.8, 2.4, 18),
      new THREE.MeshStandardMaterial({ color: 0xd8d8dc, roughness: 0.42, metalness: 0.35 })
    );
    base.position.y = 1.2;
    group.add(base);

    const cabin = new THREE.Mesh(
      new THREE.ConeGeometry(1.55, 3.4, 18),
      new THREE.MeshStandardMaterial({ color: 0xb8beca, roughness: 0.35, metalness: 0.42 })
    );
    cabin.position.y = 4.05;
    group.add(cabin);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.2, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0x8fe0ff, emissive: 0x0e3044, roughness: 0.3 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.35;
    group.add(ring);
    return group;
  }

  createRock(radius) {
    return new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius, 0),
      new THREE.MeshStandardMaterial({ color: 0x7e5f4c, roughness: 1 })
    );
  }

  createPickup(type) {
    const colorMap = {
      oxygen: 0x70d4ff,
      material: 0x98ff7f,
      food: 0xffae6a,
    };
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: colorMap[type] ?? 0xffffff, emissive: 0x181818 })
    );
    return mesh;
  }
}
