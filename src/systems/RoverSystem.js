import { gameConfig } from "../config/gameConfig.js";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

export class RoverSystem {
  constructor(world, mapLayout) {
    this.world = world;
    this.mapLayout = mapLayout;
    this.x = mapLayout.spawn.x;
    this.z = mapLayout.spawn.z;
    this.yaw = 0;
    this.isMoving = false;
    this.turnVelocity = 0;
    this.moveVelocity = 0;
  }

  update(dt, input, isRecharging) {
    if (isRecharging) {
      this.turnVelocity = 0;
      this.moveVelocity = 0;
      this.world.setRoverTransform(this.x, this.z, this.yaw);
      this.isMoving = false;
      return;
    }
    const mv = input.getMoveVector();
    const turnAxis = Math.abs(mv.x) < 0.06 ? 0 : mv.x;
    let throttleAxis = Math.abs(mv.y) < 0.08 ? 0 : mv.y;
    const turningInPlaceIntent = Math.abs(turnAxis) > 0.18 && (Math.abs(turnAxis) > Math.abs(throttleAxis) * 1.35 || Math.abs(throttleAxis) < 0.25);
    if (turningInPlaceIntent) throttleAxis = 0;
    const turnCurve = turnAxis * Math.abs(turnAxis);
    const throttleCurve = throttleAxis * Math.abs(throttleAxis);

    // En tercera persona (camara detras), giro positivo del joystick debe
    // llevar el morro del rover hacia la derecha en pantalla.
    const targetTurnVelocity = -turnCurve * gameConfig.roverTurnSpeed;
    const turnBlend = Math.min(1, dt * 10);
    this.turnVelocity += (targetTurnVelocity - this.turnVelocity) * turnBlend;
    this.yaw += this.turnVelocity * dt;

    const targetMoveVelocity = throttleCurve * gameConfig.roverSpeed;
    const moveBlend = Math.min(1, dt * (Math.abs(targetMoveVelocity) > Math.abs(this.moveVelocity) ? 7 : 10));
    this.moveVelocity += (targetMoveVelocity - this.moveVelocity) * moveBlend;
    this.isMoving = Math.abs(this.moveVelocity) > 0.08;

    const nx = this.x + Math.sin(this.yaw) * this.moveVelocity * dt;
    const nz = this.z + Math.cos(this.yaw) * this.moveVelocity * dt;
    const slopePenalty = this.sampleSlopePenalty(nx, nz);
    const finalX = this.x + (nx - this.x) * slopePenalty;
    const finalZ = this.z + (nz - this.z) * slopePenalty;

    // Movimiento por ejes para permitir deslizamiento contra obstaculos.
    const targetX = clamp(finalX, -gameConfig.mapLimit, gameConfig.mapLimit);
    const targetZ = clamp(finalZ, -gameConfig.mapLimit, gameConfig.mapLimit);

    const prevX = this.x;
    const prevZ = this.z;

    if (!this.hitsRock(targetX, this.z)) {
      this.x = targetX;
      this.world.setRoverTransform(this.x, this.z, this.yaw);
      if (this.world.isRoverCollidingWithModule()) {
        this.x = prevX;
      }
    }

    if (!this.hitsRock(this.x, targetZ)) {
      this.z = targetZ;
      this.world.setRoverTransform(this.x, this.z, this.yaw);
      if (this.world.isRoverCollidingWithModule()) {
        this.z = prevZ;
      }
    }
    this.world.setRoverTransform(this.x, this.z, this.yaw);
  }

  sampleSlopePenalty(x, z) {
    const h0 = this.world.getHeightAt(this.x, this.z);
    const h1 = this.world.getHeightAt(x, z);
    const rise = Math.abs(h1 - h0);
    const run = Math.max(0.01, Math.hypot(x - this.x, z - this.z));
    const angle = Math.atan2(rise, run) * (180 / Math.PI);
    if (angle <= 15) return 1;
    if (angle > 30) return 0.25;
    return 1 - ((angle - 15) / 15) * 0.4;
  }

  hitsRock(x, z) {
    return this.mapLayout.rocks.some((r) => distance2D({ x, z }, r) < r.r + 1.4);
  }

  getPosition() {
    return { x: this.x, z: this.z };
  }
}
