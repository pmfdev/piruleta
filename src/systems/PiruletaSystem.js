export class PiruletaSystem {
  constructor() {
    this.campBuilt = false;
    this.mood = "inquieto";
    this.calmTimer = 0;
  }

  update(dt, stable) {
    if (stable) this.calmTimer += dt;
    else this.calmTimer = 0;
    this.mood = this.calmTimer >= 8 ? "tranquilo" : "inquieto";
  }
}
