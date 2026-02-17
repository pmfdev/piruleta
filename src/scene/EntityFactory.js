import * as THREE from "three";

// Pattern: Factory
// Motivo: crear entidades 3D con una construccion consistente.
// Beneficio: evita duplicar inicializacion de mallas y materiales.
export class EntityFactory {
  createRover() {
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
