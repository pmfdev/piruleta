import { gameConfig } from "../config/gameConfig.js";

// Pattern: Strategy
// Motivo: encapsular reglas de consumo/recarga por estado operativo.
// Beneficio: permite cambiar balance sin tocar el flujo general.
const batteryStrategies = {
  moving(dt) {
    return gameConfig.batteryDrainMovingPerSec * dt;
  },
  idle(dt) {
    return gameConfig.batteryDrainIdlePerSec * dt;
  },
  recharging(dt) {
    return -gameConfig.batteryChargePerSec * dt;
  },
};

export class BatterySystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.level = gameConfig.batteryMax;
    this.recharging = false;
  }

  update(dt, isMoving, actionPressed, nearStation) {
    this.recharging = nearStation && actionPressed;
    const mode = this.recharging ? "recharging" : isMoving ? "moving" : "idle";
    let delta = batteryStrategies[mode](dt);
    if (actionPressed && !this.recharging) delta += gameConfig.batteryUseAction * dt;
    this.level = Math.max(0, Math.min(gameConfig.batteryMax, this.level - delta));

    if (this.level <= 15) this.eventBus.emit("battery_low");
  }

  canMove() {
    return this.level > 0;
  }
}
