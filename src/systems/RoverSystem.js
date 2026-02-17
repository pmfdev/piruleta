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
  }

  update(dt, input, isRecharging) {
    if (isRecharging) {
      this.world.setRoverTransform(this.x, this.z, this.yaw);
      this.isMoving = false;
      return;
    }
    const mv = input.getMoveVector();
    this.isMoving = mv.strength > 0.2;
    if (!this.isMoving) {
      this.world.setRoverTransform(this.x, this.z, this.yaw);
      return;
    }

    const targetYaw = Math.atan2(mv.x, mv.y);
    let dy = targetYaw - this.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    const maxTurn = gameConfig.roverTurnSpeed * dt;
    this.yaw += clamp(dy, -maxTurn, maxTurn);

    const speed = gameConfig.roverSpeed * mv.strength;
    const nx = this.x + Math.sin(this.yaw) * speed * dt;
    const nz = this.z + Math.cos(this.yaw) * speed * dt;
    const slopePenalty = this.sampleSlopePenalty(nx, nz);
    const finalX = this.x + (nx - this.x) * slopePenalty;
    const finalZ = this.z + (nz - this.z) * slopePenalty;

    if (!this.hitsRock(finalX, finalZ)) {
      this.x = clamp(finalX, -gameConfig.mapLimit, gameConfig.mapLimit);
      this.z = clamp(finalZ, -gameConfig.mapLimit, gameConfig.mapLimit);
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
