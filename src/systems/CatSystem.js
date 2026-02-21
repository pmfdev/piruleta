import { gameConfig } from "../config/gameConfig.js";
import { mapLayout } from "../config/mapLayout.js";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export class CatSystem {
  constructor(world) {
    this.world = world;
    this.x = mapLayout.piruleta.x;
    this.z = mapLayout.piruleta.z;
    this.mode = "indoor";
    this.orbit = 0;
    this.walkPhase = 0;
    this.finalControl = false;
    this.world.setPiruletaTransform(this.x, this.z);
  }

  setOutdoorEnabled(enabled) {
    this.mode = enabled ? "outdoor" : "indoor";
  }

  setFinalControl(enabled) {
    this.finalControl = enabled;
    if (enabled) this.mode = "final";
  }

  update(dt, input) {
    if (this.mode === "indoor") {
      this.walkPhase += dt * 1.8;
      const idleBob = Math.sin(this.walkPhase) * 0.035;
      this.world.setPiruletaTransform(mapLayout.piruleta.x, mapLayout.piruleta.z, idleBob);
      this.x = mapLayout.piruleta.x;
      this.z = mapLayout.piruleta.z;
      return;
    }

    if (this.mode === "outdoor") {
      this.orbit += dt * 0.55;
      this.walkPhase += dt * 7.2;
      const radius = 6.5;
      this.x = mapLayout.piruleta.x + Math.cos(this.orbit) * radius;
      this.z = mapLayout.piruleta.z + Math.sin(this.orbit * 0.9) * (radius * 0.65);
      const walkBob = Math.sin(this.walkPhase) * 0.075;
      this.world.setPiruletaTransform(this.x, this.z, walkBob);
      return;
    }

    if (this.mode === "final" && this.finalControl) {
      const mv = input.getMoveVector();
      const len = Math.hypot(mv.x, mv.y);
      if (len > 0.01) {
        const vx = mv.x / len;
        const vz = mv.y / len;
        this.x = clamp(this.x + vx * gameConfig.catPlayerWalkSpeed * dt, -gameConfig.mapLimit, gameConfig.mapLimit);
        this.z = clamp(this.z + vz * gameConfig.catPlayerWalkSpeed * dt, -gameConfig.mapLimit, gameConfig.mapLimit);
        this.walkPhase += dt * 9.5;
      } else {
        this.walkPhase += dt * 2;
      }
      const finalBob = Math.sin(this.walkPhase) * (len > 0.01 ? 0.09 : 0.03);
      this.world.setPiruletaTransform(this.x, this.z, finalBob);
    }
  }

  getPosition() {
    return { x: this.x, z: this.z };
  }
}
