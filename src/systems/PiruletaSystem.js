import { gameConfig } from "../config/gameConfig.js";

// Pattern: Strategy
// Motivo: separar comportamiento de oxigeno fuera y dentro del campamento.
// Beneficio: extender reglas de supervivencia sin romper este sistema.
const oxygenStrategies = {
  outside(dt) {
    return gameConfig.oxygenDrainPerSecOutsideCamp * dt;
  },
  safe() {
    return 0;
  },
};

export class PiruletaSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.oxygen = 100;
    this.campBuilt = false;
  }

  update(dt) {
    this.oxygen = 100;
  }

  addOxygenBottle() {
    this.oxygen = Math.min(100, this.oxygen + gameConfig.oxygenBottleBoost);
  }
}
