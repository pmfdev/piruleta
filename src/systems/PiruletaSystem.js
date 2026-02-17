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
    const mode = this.campBuilt ? "safe" : "outside";
    this.oxygen = Math.max(0, this.oxygen - oxygenStrategies[mode](dt));
    if (this.oxygen <= 0) this.eventBus.emit("oxygen_empty");
  }

  addOxygenBottle() {
    this.oxygen = Math.min(100, this.oxygen + gameConfig.oxygenBottleBoost);
  }
}
