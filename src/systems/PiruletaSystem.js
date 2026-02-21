export class PiruletaSystem {
  constructor() {
    this.campBuilt = false;
    this.mood = "inquieto";
  }

  update(dt, systems) {
    const food = systems?.food ?? 50;
    if (food < 25) this.mood = "apatico";
    else if (food < 55) this.mood = "inquieto";
    else this.mood = "tranquilo";
  }
}
