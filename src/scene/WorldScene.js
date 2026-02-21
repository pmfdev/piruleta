import * as THREE from "three";
import { mapLayout } from "../config/mapLayout.js";
import { EntityFactory } from "./EntityFactory.js";

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function hash2D(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise2D(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const tx = smoothStep(x - x0);
  const ty = smoothStep(y - y0);

  const v00 = hash2D(x0, y0);
  const v10 = hash2D(x1, y0);
  const v01 = hash2D(x0, y1);
  const v11 = hash2D(x1, y1);

  const a = v00 + (v10 - v00) * tx;
  const b = v01 + (v11 - v01) * tx;
  return a + (b - a) * ty;
}

function fbm2D(x, y, octaves = 5) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    value += valueNoise2D(x * frequency, y * frequency) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value / Math.max(0.0001, norm);
}

function createMarsGroundMaps(size = 1024) {
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const warpX = fbm2D(u * 3.1 + 17.3, v * 3.1 - 9.2, 3) - 0.5;
      const warpY = fbm2D(u * 2.8 - 11.4, v * 2.8 + 5.7, 3) - 0.5;
      const su = u + warpX * 0.22;
      const sv = v + warpY * 0.22;
      const macro = fbm2D(su * 5.6, sv * 5.6, 5);
      const micro = fbm2D(su * 55.0, sv * 47.0, 4);
      const gravel = fbm2D(su * 130.0 + 1.7, sv * 122.0 - 2.3, 2);
      const ridge = Math.abs(Math.sin((su * 22.0 - sv * 17.0) * Math.PI)) * 0.1;
      heights[y * size + x] = clamp01(macro * 0.52 + micro * 0.26 + gravel * 0.14 + ridge * 0.08);
    }
  }

  const albedoData = new Uint8Array(size * size * 4);
  const roughnessData = new Uint8Array(size * size * 4);
  const normalData = new Uint8Array(size * size * 4);

  const texel = (tx, ty) => {
    const sx = (tx + size) % size;
    const sy = (ty + size) % size;
    return heights[sy * size + sx];
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const p = i * 4;
      const h = heights[i];
      const rustTint = fbm2D(x * 0.01 + 2.1, y * 0.01 - 3.4, 3);
      const darkRock = fbm2D(x * 0.018 - 6.3, y * 0.018 + 4.9, 3);
      const basaltMask = clamp01((darkRock - 0.52) * 4.6);

      const r = Math.round(102 + h * 96 + rustTint * 12 - basaltMask * 54);
      const g = Math.round(54 + h * 52 + rustTint * 6 - basaltMask * 32);
      const b = Math.round(32 + h * 24 - basaltMask * 18);
      albedoData[p] = Math.max(0, Math.min(255, r));
      albedoData[p + 1] = Math.max(0, Math.min(255, g));
      albedoData[p + 2] = Math.max(0, Math.min(255, b));
      albedoData[p + 3] = 255;

      const rough = Math.round(168 + (1 - h) * 74 + fbm2D(x * 0.03 + 4.2, y * 0.03 - 1.8, 2) * 28);
      const roughClamped = Math.max(0, Math.min(255, rough));
      roughnessData[p] = roughClamped;
      roughnessData[p + 1] = roughClamped;
      roughnessData[p + 2] = roughClamped;
      roughnessData[p + 3] = 255;

      const hx1 = texel(x + 1, y);
      const hx0 = texel(x - 1, y);
      const hy1 = texel(x, y + 1);
      const hy0 = texel(x, y - 1);
      const dx = (hx1 - hx0) * 4.2;
      const dy = (hy1 - hy0) * 4.2;
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      normalData[p] = Math.round((nx / len) * 127 + 128);
      normalData[p + 1] = Math.round((ny / len) * 127 + 128);
      normalData[p + 2] = Math.round((nz / len) * 127 + 128);
      normalData[p + 3] = 255;
    }
  }

  const albedo = new THREE.DataTexture(albedoData, size, size, THREE.RGBAFormat);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.needsUpdate = true;

  const roughness = new THREE.DataTexture(roughnessData, size, size, THREE.RGBAFormat);
  roughness.needsUpdate = true;

  const normal = new THREE.DataTexture(normalData, size, size, THREE.RGBAFormat);
  normal.needsUpdate = true;

  return { albedo, roughness, normal };
}

function distanceToSegment2D(px, pz, ax, az, bx, bz) {
  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;
  const abLenSq = abx * abx + abz * abz;
  if (abLenSq <= 0.00001) return Math.hypot(px - ax, pz - az);
  const t = clamp01((apx * abx + apz * abz) / abLenSq);
  const cx = ax + abx * t;
  const cz = az + abz * t;
  return Math.hypot(px - cx, pz - cz);
}

function baseHeightFromHills(x, z, mountains) {
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

function olympusHeight(x, z, olympusMountain) {
  if (!olympusMountain) return 0;
  const dx = x - olympusMountain.center.x;
  const dz = z - olympusMountain.center.z;
  const d = Math.hypot(dx, dz);
  if (d > olympusMountain.radius) return 0;

  const summitFlatRadius = olympusMountain.summitFlatRadius ?? olympusMountain.calderaRadius;
  const summitEdgeT = 1 - summitFlatRadius / olympusMountain.radius;
  const summitFlatHeight = olympusMountain.height * Math.pow(Math.max(0, summitEdgeT), 1.2);
  if (d <= summitFlatRadius) return summitFlatHeight;

  const t = 1 - d / olympusMountain.radius;
  let h = olympusMountain.height * Math.pow(t, 1.2);

  if (d < olympusMountain.calderaRadius) {
    const ct = 1 - d / olympusMountain.calderaRadius;
    h -= olympusMountain.calderaDepth * ct * ct;
  }

  const rimDelta = Math.abs(d - olympusMountain.rimRadius);
  if (rimDelta < olympusMountain.calderaRadius * 0.75) {
    const rt = 1 - rimDelta / (olympusMountain.calderaRadius * 0.75);
    h += olympusMountain.rimHeight * rt * rt;
  }
  return h;
}

function terrainBaseHeight(x, z, layout) {
  const hills = baseHeightFromHills(x, z, layout.mountains);
  const olympus = olympusHeight(x, z, layout.olympusMountain);
  return hills + olympus;
}

function terrainHeight(x, z, layout) {
  return terrainBaseHeight(x, z, layout);
}

// Pattern: Facade
// Motivo: ofrecer una API simple sobre detalles de Three.js.
// Beneficio: los sistemas de juego no dependen de la complejidad del render.
export class WorldScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.factory = new EntityFactory();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xc46c3c);
    this.scene.fog = new THREE.Fog(0xc46c3c, 60, 320);

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 520);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.ground = null;
    this.rover = null;
    this.piruleta = null;
    this.camp = null;
    this.pickups = [];
    this.rocks = [];
    this.stations = [];
    this.caveShells = [];
    this.scenicMarkers = [];
    this.referenceCube = null;
    this.roverYaw = 0;
    this.tmpForward = new THREE.Vector3();
    this.tmpRight = new THREE.Vector3();
    this.tmpUp = new THREE.Vector3();
    this.tmpLookAt = new THREE.Vector3();
    this.tmpCamAnchor = new THREE.Vector3();
    this.tmpCamDesired = new THREE.Vector3();
    this.tmpCamResolved = new THREE.Vector3();
    this.tmpCamPoint = new THREE.Vector3();
    this.tmpCamDir = new THREE.Vector3();
    this.cameraOrbitYaw = 0;
    this.cameraOrbitPitch = 0;
    this.lookInput = { x: 0, y: 0, strength: 0 };
    this.cameraMode = "follow";
    this.roverVibePhase = 0;
    this.lastRoverPos = null;
    this.roverVisualState = { y: 0, pitch: 0, roll: 0 };

    this.setupLights();
    this.setupTerrain();
    this.setupEntities();
    this.setupMountainLandmarks();
    this.resize();
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xffd8bf, 0x3b2520, 0.48));
    const key = new THREE.DirectionalLight(0xffdeb8, 1.2);
    key.position.set(30, 45, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 180;
    key.shadow.camera.left = -75;
    key.shadow.camera.right = 75;
    key.shadow.camera.top = 75;
    key.shadow.camera.bottom = -75;
    key.shadow.bias = -0.0002;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xff8f5d, 0.28);
    fill.position.set(-18, 12, -15);
    this.scene.add(fill);
  }

  setupTerrain() {
    const geometry = new THREE.PlaneGeometry(240, 240, 180, 180);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // PlaneGeometry se rota -90deg en X, por lo que el eje Z mundo
      // corresponde a -Y local del plano.
      pos.setZ(i, terrainHeight(x, -y, mapLayout));
    }
    geometry.computeVertexNormals();

    const maps = createMarsGroundMaps(1024);
    const anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy?.() ?? 1);
    [maps.albedo, maps.roughness, maps.normal].forEach((t) => {
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.set(1, 1);
      t.anisotropy = anisotropy;
    });

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: maps.albedo,
      normalMap: maps.normal,
      roughnessMap: maps.roughness,
      roughness: 1,
      metalness: 0.03,
      normalScale: new THREE.Vector2(2.25, 2.25),
    });
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.layers.set(0);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  setupEntities() {
    this.rover = this.factory.createRover();
    this.piruleta = this.factory.createPiruleta();
    this.camp = this.factory.createCamp();
    this.piruleta.castShadow = true;
    this.piruleta.receiveShadow = true;
    this.camp.traverse?.((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
    });

    this.setObjectXZ(this.rover, mapLayout.spawn.x, mapLayout.spawn.z, 0);
    this.setObjectXZ(this.piruleta, mapLayout.piruleta.x, mapLayout.piruleta.z, 0.4);
    this.setObjectXZ(this.camp, mapLayout.camp.x, mapLayout.camp.z, 0);
    this.scene.add(this.rover, this.piruleta, this.camp);

    mapLayout.stations.forEach((s) => {
      const mesh = this.factory.createStation();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.setObjectXZ(mesh, s.x, s.z, 0.9);
      this.scene.add(mesh);
      this.stations.push({ ...s, mesh });
    });

    mapLayout.rocks.forEach((r) => {
      const rock = this.factory.createRock(r.r);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.setObjectXZ(rock, r.x, r.z, r.r * 0.65);
      this.scene.add(rock);
      this.rocks.push({ ...r, mesh: rock });
    });

    this.referenceCube = null;
  }

  setupMountainLandmarks() {
    const summit = mapLayout.olympusMountain?.center;
    if (summit) {
      const markerSpot = { x: -44, z: -8 };
      const summitRing = new THREE.Mesh(
        new THREE.TorusGeometry(4.8, 0.35, 14, 48),
        new THREE.MeshStandardMaterial({ color: 0xffd28e, emissive: 0x3c1f00, roughness: 0.68 })
      );
      summitRing.rotation.x = Math.PI / 2;
      this.setObjectXZ(summitRing, markerSpot.x, markerSpot.z, 1.2);
      this.scene.add(summitRing);
      this.scenicMarkers.push(summitRing);

      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.9, 5.6, 16),
        new THREE.MeshStandardMaterial({ color: 0xf0c78f, emissive: 0x241000, roughness: 0.5 })
      );
      this.setObjectXZ(beacon, markerSpot.x, markerSpot.z, 4.1);
      this.scene.add(beacon);
      this.scenicMarkers.push(beacon);
    }

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
    return terrainHeight(x, z, mapLayout);
  }

  sampleRoverSurface(x, z, yaw) {
    const tiltHalfLength = 1.1;
    const tiltHalfWidth = 0.8;
    const supportHalfLength = 1.55;
    const supportHalfWidth = 1.15;
    const contactLocalY = 0.74;

    this.tmpForward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    this.tmpRight.set(this.tmpForward.z, 0, -this.tmpForward.x).normalize();

    const centerH = this.getHeightAt(x, z);
    const frontH = this.getHeightAt(x + this.tmpForward.x * tiltHalfLength, z + this.tmpForward.z * tiltHalfLength);
    const backH = this.getHeightAt(x - this.tmpForward.x * tiltHalfLength, z - this.tmpForward.z * tiltHalfLength);
    const rightH = this.getHeightAt(x + this.tmpRight.x * tiltHalfWidth, z + this.tmpRight.z * tiltHalfWidth);
    const leftH = this.getHeightAt(x - this.tmpRight.x * tiltHalfWidth, z - this.tmpRight.z * tiltHalfWidth);

    let maxContactH = -Infinity;
    let minContactH = Infinity;
    const roughnessSteps = 12;
    for (let iz = -roughnessSteps; iz <= roughnessSteps; iz++) {
      const tz = iz / roughnessSteps;
      for (let ix = -roughnessSteps; ix <= roughnessSteps; ix++) {
        const tx = ix / roughnessSteps;
        const sx = x + this.tmpForward.x * (tz * supportHalfLength) + this.tmpRight.x * (tx * supportHalfWidth);
        const sz = z + this.tmpForward.z * (tz * supportHalfLength) + this.tmpRight.z * (tx * supportHalfWidth);
        const h = this.getHeightAt(sx, sz);
        if (h > maxContactH) maxContactH = h;
        if (h < minContactH) minContactH = h;
      }
    }

    const tangentF = new THREE.Vector3(this.tmpForward.x * 2 * tiltHalfLength, frontH - backH, this.tmpForward.z * 2 * tiltHalfLength);
    const tangentR = new THREE.Vector3(this.tmpRight.x * 2 * tiltHalfWidth, rightH - leftH, this.tmpRight.z * 2 * tiltHalfWidth);
    this.tmpUp.crossVectors(tangentR, tangentF).normalize();
    if (this.tmpUp.y < 0) this.tmpUp.multiplyScalar(-1);

    // Reproyectamos ejes sobre el plano del terreno para calcular
    // la altura minima del origen que evita interpenetracion.
    const normalDot = this.tmpForward.dot(this.tmpUp);
    this.tmpForward.addScaledVector(this.tmpUp, -normalDot).normalize();
    this.tmpRight.crossVectors(this.tmpUp, this.tmpForward).normalize();

    let requiredOriginY = -Infinity;
    const fitSteps = 12;
    for (let iz = -fitSteps; iz <= fitSteps; iz++) {
      const tz = iz / fitSteps;
      for (let ix = -fitSteps; ix <= fitSteps; ix++) {
        const tx = ix / fitSteps;
        const localZ = tz * supportHalfLength;
        const localX = tx * supportHalfWidth;
        const sx = x + this.tmpUp.x * contactLocalY + this.tmpForward.x * localZ + this.tmpRight.x * localX;
        const sz = z + this.tmpUp.z * contactLocalY + this.tmpForward.z * localZ + this.tmpRight.z * localX;
        const groundY = this.getHeightAt(sx, sz);
        const localYOffset = this.tmpUp.y * contactLocalY + this.tmpForward.y * localZ + this.tmpRight.y * localX;
        const pointRequiredY = groundY - localYOffset;
        if (pointRequiredY > requiredOriginY) requiredOriginY = pointRequiredY;
      }
    }

    const roughness = Math.max(0, maxContactH - minContactH);
    const roughnessBoost = Math.min(0.22, roughness * 0.05);
    const baseClearance = 0.68;
    return { normal: this.tmpUp, y: requiredOriginY + roughnessBoost + baseClearance, roughness };
  }

  getTerrainRegion(x, z) {
    const olympus = mapLayout.olympusMountain;
    if (!olympus) return "llanura";

    const d = Math.hypot(x - olympus.center.x, z - olympus.center.z);
    const inCave = (mapLayout.mountainCaves ?? []).some((cave) => {
      for (let i = 0; i < cave.path.length - 1; i++) {
        const a = cave.path[i];
        const b = cave.path[i + 1];
        if (distanceToSegment2D(x, z, a.x, a.z, b.x, b.z) <= cave.radius * 0.82) return true;
      }
      return false;
    });
    if (inCave) return "cueva";
    if (d <= olympus.calderaRadius * 0.92) return "cima";
    if (d <= olympus.radius * 0.94) return "ladera";
    return "llanura";
  }

  getRoverPosition() {
    return this.rover.position;
  }

  setRoverTransform(x, z, yaw) {
    // Alineamos rover segun su huella completa para evitar interpenetracion en laderas.
    this.roverYaw = yaw;
    const sample = this.sampleRoverSurface(x, z, yaw);
    const groundNormal = sample.normal;
    this.rover.position.set(x, sample.y, z);

    this.tmpForward.set(Math.sin(yaw), 0, Math.cos(yaw));
    const normalDot = this.tmpForward.dot(groundNormal);
    this.tmpForward.addScaledVector(groundNormal, -normalDot);
    if (this.tmpForward.lengthSq() < 0.0001) {
      this.tmpForward.set(0, 0, 1);
    }
    this.tmpForward.normalize();

    this.rover.up.copy(groundNormal);
    this.tmpLookAt.copy(this.rover.position).add(this.tmpForward);
    this.rover.lookAt(this.tmpLookAt);
    this.applyRoverTerrainVibration(x, z, sample.roughness);
  }

  applyRoverTerrainVibration(x, z, terrainRoughness) {
    const visualRoot = this.rover?.children?.[0];
    if (!visualRoot) return;

    if (!visualRoot.userData.baseVisualTransform) {
      visualRoot.userData.baseVisualTransform = {
        y: visualRoot.position.y,
        rx: visualRoot.rotation.x,
        rz: visualRoot.rotation.z,
      };
    }
    const base = visualRoot.userData.baseVisualTransform;

    if (!this.lastRoverPos) {
      this.lastRoverPos = { x, z };
      return;
    }

    const dx = x - this.lastRoverPos.x;
    const dz = z - this.lastRoverPos.z;
    this.lastRoverPos = { x, z };
    const travel = Math.hypot(dx, dz);
    const speedFactor = Math.min(1, travel * 28);
    const roughFactor = Math.min(1, Math.max(0, terrainRoughness) * 2.2);
    const intensity = Math.min(0.028, (0.006 + roughFactor * 0.03) * speedFactor);

    if (intensity < 0.0005) {
      this.roverVisualState.y *= 0.75;
      this.roverVisualState.pitch *= 0.75;
      this.roverVisualState.roll *= 0.75;
    } else {
      this.roverVibePhase += 0.22 + speedFactor * 0.36 + roughFactor * 0.2;
      const targetY = Math.sin(this.roverVibePhase * 1.8) * intensity;
      const targetPitch = Math.sin(this.roverVibePhase * 1.35 + 0.7) * intensity * 0.9;
      const targetRoll = Math.sin(this.roverVibePhase * 1.12 + 1.3) * intensity * 1.05;

      this.roverVisualState.y += (targetY - this.roverVisualState.y) * 0.35;
      this.roverVisualState.pitch += (targetPitch - this.roverVisualState.pitch) * 0.3;
      this.roverVisualState.roll += (targetRoll - this.roverVisualState.roll) * 0.3;
    }

    visualRoot.position.y = base.y + this.roverVisualState.y;
    visualRoot.rotation.x = base.rx + this.roverVisualState.pitch;
    visualRoot.rotation.z = base.rz + this.roverVisualState.roll;
  }

  resolveCameraCollision(anchor, desired, groundClearance, maxDistance = Infinity) {
    this.tmpCamResolved.copy(desired);
    const samples = 28;
    let hitT = 1;
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      this.tmpCamPoint.lerpVectors(anchor, desired, t);
      const floorY = this.getHeightAt(this.tmpCamPoint.x, this.tmpCamPoint.z) + groundClearance;
      if (this.tmpCamPoint.y < floorY) {
        hitT = t;
        break;
      }
    }

    if (hitT < 1) {
      const safeT = Math.max(0.2, hitT - 0.08);
      this.tmpCamResolved.lerpVectors(anchor, desired, safeT);
    }

    const minY = this.getHeightAt(this.tmpCamResolved.x, this.tmpCamResolved.z) + groundClearance;
    if (this.tmpCamResolved.y < minY) this.tmpCamResolved.y = minY;

    if (Number.isFinite(maxDistance)) {
      this.tmpCamDir.subVectors(this.tmpCamResolved, anchor);
      const d = this.tmpCamDir.length();
      if (d > maxDistance) {
        this.tmpCamDir.multiplyScalar(maxDistance / Math.max(0.0001, d));
        this.tmpCamResolved.copy(anchor).add(this.tmpCamDir);
      }
    }
  }

  updateCamera() {
    const p = this.rover.position;
    const yaw = this.roverYaw + this.cameraOrbitYaw;
    const region = this.getTerrainRegion(p.x, p.z);
    const inCave = region === "cueva";
    const roverGroundY = this.getHeightAt(p.x, p.z);

    if (this.cameraMode === "first_person") {
      const eyeHeight = inCave ? 1.68 : 1.95;
      const eyeY = Math.max(p.y + eyeHeight, roverGroundY + 1.45);
      const camForwardOffset = 0.78;
      const camX = p.x + Math.sin(yaw) * camForwardOffset;
      const camZ = p.z + Math.cos(yaw) * camForwardOffset;
      this.camera.position.set(camX, eyeY, camZ);

      const lookDist = 9;
      this.tmpLookAt.set(
        camX + Math.sin(yaw) * lookDist,
        eyeY + this.cameraOrbitPitch * 4.2,
        camZ + Math.cos(yaw) * lookDist
      );
      this.camera.lookAt(this.tmpLookAt);

      const fpFov = 78;
      const nextFov = this.camera.fov + (fpFov - this.camera.fov) * 0.15;
      if (Math.abs(nextFov - this.camera.fov) > 0.01) {
        this.camera.fov = nextFov;
        this.camera.updateProjectionMatrix();
      }
      return;
    }

    const veryFarMode = this.cameraMode === "very_far";
    const farMode = this.cameraMode === "far";
    const followDistance = inCave ? (veryFarMode ? 8.4 : farMode ? 6.2 : 3.4) : veryFarMode ? 27 : farMode ? 18.5 : 11;
    const followHeight = inCave ? (veryFarMode ? 5.2 : farMode ? 4.1 : 2.8) : veryFarMode ? 13.2 : farMode ? 9.8 : 6.8;
    const anchorHeight = inCave ? (veryFarMode ? 1.6 : farMode ? 1.45 : 1.3) : veryFarMode ? 2.6 : farMode ? 2.2 : 1.6;
    const lookHeight = inCave ? (veryFarMode ? 1.28 : farMode ? 1.2 : 1.15) : veryFarMode ? 1.45 : farMode ? 1.3 : 1;
    const sideOffset = inCave ? 0.42 : 0;
    const targetFov = inCave ? (veryFarMode ? 76 : farMode ? 74 : 72) : veryFarMode ? 50 : farMode ? 56 : 60;
    const pitch = this.cameraOrbitPitch;
    const horizDistance = followDistance * Math.max(0.45, Math.cos(pitch));
    const pitchHeightOffset = followDistance * Math.sin(pitch) * 0.85;

    const anchorY = Math.max(p.y + anchorHeight, roverGroundY + (inCave ? 1.1 : 1.45));
    this.tmpCamAnchor.set(p.x, anchorY, p.z);
    this.tmpCamDesired.set(
      p.x + Math.sin(yaw) * -horizDistance + Math.cos(yaw) * sideOffset,
      p.y + followHeight + pitchHeightOffset,
      p.z + Math.cos(yaw) * -horizDistance - Math.sin(yaw) * sideOffset
    );

    this.resolveCameraCollision(this.tmpCamAnchor, this.tmpCamDesired, inCave ? 0.18 : 0.3, inCave ? 4 : Infinity);
    this.camera.position.copy(this.tmpCamResolved);

    this.tmpLookAt.set(p.x, p.y + lookHeight + pitch * 1.6, p.z);
    this.camera.lookAt(this.tmpLookAt);

    const nextFov = this.camera.fov + (targetFov - this.camera.fov) * 0.12;
    if (Math.abs(nextFov - this.camera.fov) > 0.01) {
      this.camera.fov = nextFov;
      this.camera.updateProjectionMatrix();
    }
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

  applyCameraLookInput(lookVec, dt) {
    this.lookInput = lookVec ?? this.lookInput;
    if (!lookVec) return;
    const x = Math.abs(lookVec.x) < 0.06 ? 0 : lookVec.x;
    const y = Math.abs(lookVec.y) < 0.06 ? 0 : lookVec.y;
    if (x === 0 && y === 0) return;

    const yawSpeed = 1.8;
    const pitchSpeed = 1.35;
    this.cameraOrbitYaw += x * yawSpeed * dt;
    this.cameraOrbitPitch = clamp01((this.cameraOrbitPitch + y * pitchSpeed * dt + 0.5) / 1.05) * 1.05 - 0.5;
  }

  cycleCameraMode() {
    const order = ["first_person", "follow", "far", "very_far"];
    const i = order.indexOf(this.cameraMode);
    this.cameraMode = order[(i + 1 + order.length) % order.length];
    return this.cameraMode;
  }

  setCameraMode(mode) {
    if (mode === "first_person" || mode === "follow" || mode === "far" || mode === "very_far") {
      this.cameraMode = mode;
    }
  }

  getCameraMode() {
    return this.cameraMode;
  }
}
