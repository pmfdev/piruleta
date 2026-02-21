import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODULE_STYLE_PRESETS = {
  compacto: {
    buriedBaseY: -1.1,
    moduleOffsetY: 0.02,
    airlockFrameScale: 0.96,
    airlockGlowEmissive: 0x1c3444,
    warmLightIntensity: 1.0,
    warmLightDistance: 2.8,
    wearOpacity: 0.85,
  },
  equilibrado: {
    buriedBaseY: -1.25,
    moduleOffsetY: 0,
    airlockFrameScale: 1.0,
    airlockGlowEmissive: 0x244255,
    warmLightIntensity: 1.3,
    warmLightDistance: 3.2,
    wearOpacity: 1.0,
  },
  dramatico: {
    buriedBaseY: -1.42,
    moduleOffsetY: -0.05,
    airlockFrameScale: 1.05,
    airlockGlowEmissive: 0x315d78,
    warmLightIntensity: 1.55,
    warmLightDistance: 3.8,
    wearOpacity: 1.1,
  },
};
const ACTIVE_MODULE_STYLE = "equilibrado";

// Pattern: Factory
// Motivo: crear entidades 3D con una construccion consistente.
// Beneficio: evita duplicar inicializacion de mallas y materiales.
export class EntityFactory {
  constructor(options = {}) {
    this.roverModelPath = options.roverModelPath ?? "/models/rover.glb";
    this.roverModelScale = options.roverModelScale ?? 1.1;
    this.habitatModelPath = options.habitatModelPath ?? "/models/habitat.glb";
    this.habitatModelScale = options.habitatModelScale ?? 5.4;
    this.loader = new GLTFLoader();
    this.roverModelScene = null;
    this.roverModelPromise = null;
    this.habitatModelScene = null;
    this.habitatModelPromise = null;
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
    body.castShadow = true;
    body.receiveShadow = false;
    root.add(body);

    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.9, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xc4b89b })
    );
    mast.position.set(0, 2, -0.9);
    mast.castShadow = true;
    mast.receiveShadow = false;
    root.add(mast);
    return root;
  }

  loadHabitatModel() {
    if (this.habitatModelScene) return Promise.resolve(this.habitatModelScene);
    if (this.habitatModelPromise) return this.habitatModelPromise;

    this.habitatModelPromise = new Promise((resolve, reject) => {
      this.loader.load(
        this.habitatModelPath,
        (gltf) => {
          this.habitatModelScene = gltf.scene;
          resolve(gltf.scene);
        },
        undefined,
        (error) => reject(error)
      );
    });
    return this.habitatModelPromise;
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
          // Evita self-shadow acne en superficies del rover.
          node.receiveShadow = false;
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
    const root = new THREE.Group();
    const visual = new THREE.Group();
    root.add(visual);

    const lightBeige = new THREE.MeshStandardMaterial({ color: 0xe5ceb0, roughness: 0.82, metalness: 0.02 });
    const darkBrown = new THREE.MeshStandardMaterial({ color: 0x4a3328, roughness: 0.86, metalness: 0.02 });
    const muzzleTint = new THREE.MeshStandardMaterial({ color: 0x8a6852, roughness: 0.86, metalness: 0.01 });
    const eyeBlue = new THREE.MeshStandardMaterial({ color: 0x80c8ef, emissive: 0x18384f, roughness: 0.34, metalness: 0.0 });
    const pupilBlack = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.0 });
    const nosePink = new THREE.MeshStandardMaterial({ color: 0xc4878a, roughness: 0.7, metalness: 0.0 });
    const helmetGlass = new THREE.MeshStandardMaterial({
      color: 0xbfd8ea,
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.32,
    });

    const bodyCore = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 1.24, 10), lightBeige);
    bodyCore.rotation.z = Math.PI / 2;
    bodyCore.position.set(0, 0.5, 0);
    visual.add(bodyCore);

    const bodyFront = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 10), lightBeige);
    bodyFront.position.set(0.62, 0.5, 0);
    bodyFront.scale.set(1.08, 0.88, 0.95);
    visual.add(bodyFront);

    const bodyBack = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 10), lightBeige);
    bodyBack.position.set(-0.62, 0.5, 0);
    bodyBack.scale.set(1.0, 0.86, 0.92);
    visual.add(bodyBack);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.39, 12, 10), lightBeige);
    head.position.set(1.0, 0.79, 0);
    head.scale.set(1.05, 0.86, 0.95);
    visual.add(head);

    const faceMask = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), darkBrown);
    faceMask.position.set(1.17, 0.8, 0);
    faceMask.scale.set(0.9, 0.66, 0.58);
    visual.add(faceMask);

    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), muzzleTint);
    muzzle.position.set(1.23, 0.72, 0);
    muzzle.scale.set(1.12, 0.78, 0.74);
    visual.add(muzzle);

    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), muzzleTint);
    cheekL.position.set(1.2, 0.69, 0.13);
    cheekL.scale.set(1.0, 0.8, 0.72);
    visual.add(cheekL);
    const cheekR = cheekL.clone();
    cheekR.position.z = -0.13;
    visual.add(cheekR);

    const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), darkBrown);
    leftEar.position.set(0.91, 1.06, 0.22);
    leftEar.rotation.set(0.2, 0.12, -0.2);
    visual.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.z = -0.22;
    rightEar.rotation.z = 0.2;
    visual.add(rightEar);

    // Ojos menos saltones: un poco mas pequenos, mas metidos en la cara y aplanados en el eje frontal.
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), eyeBlue);
    eyeL.position.set(1.305, 0.86, 0.205);
    eyeL.scale.set(0.62, 0.94, 0.9);
    visual.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.z = -0.205;
    visual.add(eyeR);

    // Pupilas mas legibles sobre el iris azul sin exagerar el relieve.
    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 7, 6), pupilBlack);
    pupilL.position.set(1.346, 0.86, 0.205);
    pupilL.scale.set(0.6, 0.95, 0.9);
    visual.add(pupilL);
    const pupilR = pupilL.clone();
    pupilR.position.z = -0.205;
    visual.add(pupilR);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.07, 3), nosePink);
    nose.position.set(1.34, 0.73, 0);
    nose.rotation.z = Math.PI / 2;
    visual.add(nose);

    const helmetDome = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 10), helmetGlass);
    helmetDome.position.set(1.03, 0.81, 0);
    helmetDome.scale.set(1.06, 0.92, 1.02);
    helmetDome.renderOrder = 2;
    visual.add(helmetDome);

    const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xf1e6db, roughness: 0.9, metalness: 0.0 });
    const whiskerRows = [0.76, 0.72, 0.68];
    whiskerRows.forEach((y) => {
      const whiskerL = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.24), whiskerMat);
      whiskerL.position.set(1.27, y, 0.23);
      whiskerL.rotation.y = 0.04;
      visual.add(whiskerL);

      const whiskerR = whiskerL.clone();
      whiskerR.position.z = -0.23;
      whiskerR.rotation.y = -0.04;
      visual.add(whiskerR);
    });

    const legAnchors = [
      { x: 0.52, z: 0.26 },
      { x: 0.52, z: -0.26 },
      { x: -0.42, z: 0.26 },
      { x: -0.42, z: -0.26 },
    ];
    const legs = legAnchors.map((a) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.46, 8), darkBrown);
      leg.position.set(a.x, 0.24, a.z);
      visual.add(leg);
      return leg;
    });

    const tailBase = new THREE.Group();
    tailBase.position.set(-0.96, 0.62, 0);
    tailBase.rotation.z = 0.2;
    visual.add(tailBase);
    const tailSegments = [];
    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.085 - i * 0.012, 0.075 - i * 0.012, 0.34, 7), darkBrown);
      seg.position.set(-0.19 - i * 0.2, 0.2 + i * 0.07, 0);
      seg.rotation.z = 0.42 + i * 0.1;
      tailBase.add(seg);
      tailSegments.push(seg);
    }

    root.userData.piruletaRig = {
      visual,
      bodyCore,
      head,
      leftEar,
      rightEar,
      legs,
      tailSegments,
      muzzle,
      eyes: [eyeL, eyeR],
      pupils: [pupilL, pupilR],
      base: {
        visualPos: visual.position.clone(),
        visualRot: visual.rotation.clone(),
        bodyScale: bodyCore.scale.clone(),
        headPos: head.position.clone(),
        tailBaseRot: tailBase.rotation.clone(),
        earLRot: leftEar.rotation.clone(),
        earRRot: rightEar.rotation.clone(),
      },
      tailBase,
    };
    return root;
  }

  createFallbackCamp() {
    const style = MODULE_STYLE_PRESETS[ACTIVE_MODULE_STYLE] ?? MODULE_STYLE_PRESETS.equilibrado;
    const group = new THREE.Group();
    group.position.y = style.moduleOffsetY;

    const buriedBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5.8, 6.3, 2.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x8c8f95, roughness: 0.92, metalness: 0.08 })
    );
    buriedBase.position.y = style.buriedBaseY;
    group.add(buriedBase);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.9, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: 0xd9dde2, roughness: 0.85, metalness: 0.15 })
    );
    dome.position.y = 0.35;
    group.add(dome);

    const trimRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.95, 0.16, 14, 48),
      new THREE.MeshStandardMaterial({ color: 0xc58a3f, roughness: 0.7, metalness: 0.12 })
    );
    trimRing.rotation.x = Math.PI / 2;
    trimRing.position.y = 0.34;
    group.add(trimRing);

    const airlockFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.18, 0.58, 26),
      new THREE.MeshStandardMaterial({ color: 0x4f5762, roughness: 0.68, metalness: 0.32 })
    );
    airlockFrame.rotation.x = Math.PI / 2;
    airlockFrame.position.set(0, 1.0, 4.74);
    airlockFrame.scale.setScalar(style.airlockFrameScale);
    group.add(airlockFrame);

    const airlockDoor = new THREE.Mesh(
      new THREE.CircleGeometry(0.86, 24),
      new THREE.MeshStandardMaterial({ color: 0xa9b0ba, roughness: 0.62, metalness: 0.36 })
    );
    airlockDoor.position.set(0, 1.0, 5.02);
    group.add(airlockDoor);

    const airlockGlowRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.06, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0x9db7c6, emissive: style.airlockGlowEmissive, roughness: 0.3, metalness: 0.22 })
    );
    airlockGlowRing.rotation.x = Math.PI / 2;
    airlockGlowRing.position.set(0, 1.0, 5.03);
    group.add(airlockGlowRing);

    const statusLights = [];
    const statusLightPositions = [-0.52, 0, 0.52];
    statusLightPositions.forEach((x) => {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 14, 10),
        new THREE.MeshStandardMaterial({ color: 0x1d1d1d, emissive: 0x000000, roughness: 0.28, metalness: 0.2 })
      );
      lamp.position.set(x, 1.86, 4.82);
      group.add(lamp);
      statusLights.push(lamp);
    });

    const statusSlots = [];
    statusLightPositions.forEach((x) => {
      const slot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.08, 14),
        new THREE.MeshStandardMaterial({ color: 0x545d68, roughness: 0.72, metalness: 0.24 })
      );
      slot.rotation.x = Math.PI / 2;
      slot.position.set(x, 1.86, 4.76);
      group.add(slot);
      statusSlots.push(slot);
    });

    const maintenancePanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 1.95, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x78808a, roughness: 0.77, metalness: 0.26 })
    );
    maintenancePanel.position.set(4.2, 0.95, 0.9);
    maintenancePanel.rotation.y = -Math.PI * 0.28;
    group.add(maintenancePanel);

    const maintenanceAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xd49543, roughness: 0.62, metalness: 0.2 })
    );
    maintenanceAccent.position.set(4.23, 1.5, 1.02);
    maintenanceAccent.rotation.y = -Math.PI * 0.28;
    group.add(maintenanceAccent);

    const maintenanceCable = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.045, 8, 20, Math.PI * 1.05),
      new THREE.MeshStandardMaterial({ color: 0x2f343a, roughness: 0.9, metalness: 0.08 })
    );
    maintenanceCable.rotation.set(Math.PI * 0.45, Math.PI * 0.2, Math.PI * 0.5);
    maintenanceCable.position.set(4.35, 0.2, 1.25);
    group.add(maintenanceCable);

    const supplyPort = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.95, 1.15),
      new THREE.MeshStandardMaterial({ color: 0x6d7580, roughness: 0.78, metalness: 0.22 })
    );
    supplyPort.position.set(0, 0.78, -4.7);
    group.add(supplyPort);

    const supplyHatch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xb6bdc7, roughness: 0.55, metalness: 0.3 })
    );
    supplyHatch.position.set(0, 0.9, -5.29);
    group.add(supplyHatch);

    const supplyAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xcf8a38, roughness: 0.72, metalness: 0.16 })
    );
    supplyAccent.position.set(0, 1.24, -5.28);
    group.add(supplyAccent);

    const portholeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.11, 10, 26),
      new THREE.MeshStandardMaterial({ color: 0x6f7782, roughness: 0.6, metalness: 0.28 })
    );
    portholeRing.position.set(0, 2.24, 4.48);
    portholeRing.rotation.x = Math.PI / 2;
    group.add(portholeRing);

    const portholeGlass = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 22),
      new THREE.MeshStandardMaterial({
        color: 0x97c8d9,
        emissive: 0x1d1306,
        roughness: 0.12,
        metalness: 0.22,
        transparent: true,
        opacity: 0.8,
      })
    );
    portholeGlass.position.set(0, 2.24, 4.5);
    group.add(portholeGlass);

    const piruloSilhouette = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.85 })
    );
    piruloSilhouette.position.set(0, 2.16, 4.36);
    group.add(piruloSilhouette);

    const leftEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.075, 0.16, 8),
      new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.85 })
    );
    leftEar.position.set(-0.1, 2.37, 4.36);
    group.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.1;
    group.add(rightEar);

    const warmInteriorLight = new THREE.PointLight(0xffb56a, style.warmLightIntensity, style.warmLightDistance, 2);
    warmInteriorLight.position.set(0, 2.1, 4.0);
    group.add(warmInteriorLight);

    const steamPlumes = [];
    [-0.42, 0.42].forEach((x) => {
      const plume = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.21, 1.25, 10),
        new THREE.MeshStandardMaterial({
          color: 0xc6d1d8,
          emissive: 0x1b2429,
          roughness: 1,
          transparent: true,
          opacity: 0.0,
        })
      );
      plume.position.set(x, 2.05, 5.08);
      group.add(plume);
      steamPlumes.push(plume);
    });

    const wearPatches = [
      { x: -2.2, y: 2.15, z: 3.8, ry: Math.PI * 0.22, c: 0xc7c9cd },
      { x: 1.95, y: 2.05, z: 3.65, ry: -Math.PI * 0.2, c: 0xc4c7cc },
      { x: -2.7, y: 1.48, z: 2.7, ry: Math.PI * 0.31, c: 0xb6b9be },
      { x: 2.6, y: 1.35, z: 2.45, ry: -Math.PI * 0.27, c: 0xb9bdc3 },
    ];
    wearPatches.forEach((p) => {
      const patch = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.34, 0.03),
        new THREE.MeshStandardMaterial({
          color: p.c,
          roughness: 0.86,
          metalness: 0.06,
          transparent: true,
          opacity: Math.min(1, style.wearOpacity),
        })
      );
      patch.position.set(p.x, p.y, p.z);
      patch.rotation.y = p.ry;
      group.add(patch);
    });

    group.userData.moduleVisuals = {
      statusLights,
      statusSlots,
      airlockGlowRing,
      piruloSilhouette,
      piruloEars: [leftEar, rightEar],
      steamPlumes,
    };
    group.userData.moduleStyle = ACTIVE_MODULE_STYLE;
    return group;
  }

  createCamp() {
    const root = new THREE.Group();
    const fallback = this.createFallbackCamp();
    root.add(fallback);
    root.userData.moduleVisuals = fallback.userData.moduleVisuals;
    root.userData.moduleStyle = fallback.userData.moduleStyle;

    this.loadHabitatModel()
      .then((source) => {
        const habitatModel = source.clone(true);
        habitatModel.scale.setScalar(this.habitatModelScale);
        habitatModel.position.set(0, 0.85, 0);
        habitatModel.rotation.y = Math.PI;

        habitatModel.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.roughness = Math.min(1, (node.material.roughness ?? 0.8) + 0.08);
            node.material.metalness = Math.max(0, (node.material.metalness ?? 0.2) * 0.85);
          }
        });

        root.remove(fallback);
        root.add(habitatModel);
        root.userData.moduleVisuals = null;
        root.userData.moduleStyle = "glb";
      })
      .catch(() => {
        // Si falla el GLB del habitat, se mantiene el fallback procedural.
      });

    return root;
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
