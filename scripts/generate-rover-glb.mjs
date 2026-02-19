import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    constructor() {
      this.result = null;
      this.error = null;
      this.onloadend = null;
      this.onerror = null;
    }

    async readAsArrayBuffer(blob) {
      try {
        this.result = await blob.arrayBuffer();
        if (typeof this.onloadend === "function") this.onloadend();
      } catch (e) {
        this.error = e;
        if (typeof this.onerror === "function") this.onerror(e);
      }
    }

    async readAsDataURL(blob) {
      try {
        const ab = await blob.arrayBuffer();
        const type = blob.type || "application/octet-stream";
        const b64 = Buffer.from(ab).toString("base64");
        this.result = `data:${type};base64,${b64}`;
        if (typeof this.onloadend === "function") this.onloadend();
      } catch (e) {
        this.error = e;
        if (typeof this.onerror === "function") this.onerror(e);
      }
    }
  };
}

const rover = new THREE.Group();

const matBody = new THREE.MeshStandardMaterial({ color: 0xd8ccb1, roughness: 0.72, metalness: 0.08 });
const matDark = new THREE.MeshStandardMaterial({ color: 0x2a2522, roughness: 0.9, metalness: 0.02 });
const matAccent = new THREE.MeshStandardMaterial({ color: 0xc7b18f, roughness: 0.65, metalness: 0.1 });

const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 3.4), matBody);
chassis.position.y = 1.0;
rover.add(chassis);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 1.4), matAccent);
cabin.position.set(0, 1.65, -0.25);
rover.add(cabin);

const nose = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 0.9), matAccent);
nose.position.set(0, 1.2, 1.5);
rover.add(nose);

const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 10), matDark);
mast.position.set(0.65, 2.0, -1.2);
rover.add(mast);

const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 16), matAccent);
dish.rotation.x = Math.PI / 2;
dish.position.set(0.65, 2.6, -1.2);
rover.add(dish);

const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 18);
wheelGeo.rotateZ(Math.PI / 2);
const wheelPositions = [
  [-1.15, 0.55, -1.1],
  [1.15, 0.55, -1.1],
  [-1.15, 0.55, 0],
  [1.15, 0.55, 0],
  [-1.15, 0.55, 1.1],
  [1.15, 0.55, 1.1],
];
for (const [x, y, z] of wheelPositions) {
  const w = new THREE.Mesh(wheelGeo, matDark);
  w.position.set(x, y, z);
  rover.add(w);
}

const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.35), matDark);
arm.position.set(-0.85, 1.5, 1.0);
arm.rotation.x = -0.25;
rover.add(arm);

const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.32, 10), matDark);
drill.position.set(-0.85, 1.2, 1.55);
drill.rotation.x = -0.25;
rover.add(drill);

const exporter = new GLTFExporter();
const glbArrayBuffer = await new Promise((resolve, reject) => {
  exporter.parse(
    rover,
    (result) => {
      if (result instanceof ArrayBuffer) {
        resolve(result);
        return;
      }
      reject(new Error("GLB export did not return ArrayBuffer"));
    },
    (error) => reject(error),
    { binary: true, onlyVisible: true, trs: false }
  );
});

const outPath = path.resolve("public/models/rover.glb");
fs.writeFileSync(outPath, Buffer.from(glbArrayBuffer));
console.log(`Generated: ${outPath}`);
