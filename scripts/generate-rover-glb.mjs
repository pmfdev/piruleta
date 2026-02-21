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

const matFrame = new THREE.MeshStandardMaterial({ color: 0xc8b89c, roughness: 0.7, metalness: 0.14 });
const matDark = new THREE.MeshStandardMaterial({ color: 0x262a30, roughness: 0.88, metalness: 0.06 });
const matSolar = new THREE.MeshStandardMaterial({ color: 0x274b6d, roughness: 0.4, metalness: 0.55 });
const matGlass = new THREE.MeshStandardMaterial({ color: 0x7fb6d8, roughness: 0.2, metalness: 0.35 });
const matWire = new THREE.MeshStandardMaterial({ color: 0x8e8b81, roughness: 0.62, metalness: 0.38 });

const bodyCore = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.52, 2.9), matFrame);
bodyCore.position.y = 1.02;
rover.add(bodyCore);

const topDeck = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.26, 2.15), matFrame);
topDeck.position.y = 1.42;
rover.add(topDeck);

const frontBay = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.7), matFrame);
frontBay.position.set(0, 1.16, 1.73);
rover.add(frontBay);

const rearBay = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.26, 0.62), matFrame);
rearBay.position.set(0, 1.1, -1.72);
rover.add(rearBay);

const sidePodGeo = new THREE.BoxGeometry(0.38, 0.38, 2.2);
const leftPod = new THREE.Mesh(sidePodGeo, matFrame);
leftPod.position.set(-1.28, 0.95, 0);
const rightPod = new THREE.Mesh(sidePodGeo, matFrame);
rightPod.position.set(1.28, 0.95, 0);
rover.add(leftPod, rightPod);

const panelGeo = new THREE.BoxGeometry(1.65, 0.06, 1.05);
const leftPanel = new THREE.Mesh(panelGeo, matSolar);
leftPanel.position.set(-1.75, 1.58, -0.2);
leftPanel.rotation.z = 0.05;
const rightPanel = new THREE.Mesh(panelGeo, matSolar);
rightPanel.position.set(1.75, 1.58, -0.2);
rightPanel.rotation.z = -0.05;
rover.add(leftPanel, rightPanel);

const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.25, 10), matWire);
mast.position.set(0.62, 2.03, -1.02);
rover.add(mast);

const cameraHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.2), matFrame);
cameraHead.position.set(0.62, 2.72, -1.02);
rover.add(cameraHead);

const lensLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 14), matGlass);
lensLeft.rotation.x = Math.PI / 2;
lensLeft.position.set(0.53, 2.72, -0.9);
const lensRight = lensLeft.clone();
lensRight.position.x = 0.71;
rover.add(lensLeft, lensRight);

const antennaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), matWire);
antennaBase.position.set(-0.58, 1.92, -1.25);
const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.04, 20), matFrame);
dish.rotation.x = Math.PI / 2;
dish.rotation.z = 0.2;
dish.position.set(-0.58, 2.34, -1.35);
rover.add(antennaBase, dish);

const instrumentArm = new THREE.Group();
const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.95), matDark);
armUpper.position.set(0, 0, 0.4);
armUpper.rotation.x = -0.38;
instrumentArm.add(armUpper);
const armFore = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.72), matDark);
armFore.position.set(0, -0.2, 0.94);
armFore.rotation.x = -0.58;
instrumentArm.add(armFore);
const armTool = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.34, 10), matWire);
armTool.position.set(0, -0.5, 1.24);
armTool.rotation.x = -0.5;
instrumentArm.add(armTool);
instrumentArm.position.set(-0.86, 1.33, 1.16);
rover.add(instrumentArm);

function createWheelAssembly(side, z) {
  const assembly = new THREE.Group();
  const pivotX = side * 1.1;
  const wheelCenterY = 0.44;
  const wheelX = side * 1.58;

  const swingArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.62), matDark);
  swingArm.position.set((pivotX + wheelX) * 0.5, 0.78, z);
  swingArm.rotation.y = side > 0 ? 0.08 : -0.08;
  assembly.add(swingArm);

  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.54, 8), matWire);
  strut.position.set((pivotX + wheelX) * 0.5, 0.56, z);
  assembly.add(strut);

  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.1, 14, 28), matDark);
  tire.position.set(wheelX, wheelCenterY, z);
  tire.rotation.y = Math.PI / 2;
  assembly.add(tire);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 16), matFrame);
  hub.position.set(wheelX, wheelCenterY, z);
  hub.rotation.z = Math.PI / 2;
  assembly.add(hub);

  const spokeGeo = new THREE.BoxGeometry(0.03, 0.25, 0.03);
  for (let i = 0; i < 6; i += 1) {
    const spoke = new THREE.Mesh(spokeGeo, matWire);
    const ang = (i / 6) * Math.PI * 2;
    spoke.position.set(wheelX, wheelCenterY + Math.cos(ang) * 0.11, z + Math.sin(ang) * 0.11);
    assembly.add(spoke);
  }
  return assembly;
}

const wheelZs = [-1.16, 0, 1.16];
for (const z of wheelZs) {
  rover.add(createWheelAssembly(-1, z));
  rover.add(createWheelAssembly(1, z));
}

const rockerLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.5), matWire);
rockerLeft.position.set(-1.2, 0.78, 0);
const rockerRight = rockerLeft.clone();
rockerRight.position.x = 1.2;
rover.add(rockerLeft, rockerRight);

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
