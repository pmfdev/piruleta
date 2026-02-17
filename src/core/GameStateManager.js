// Pattern: State
// Motivo: el juego cambia de modo y cada modo tiene reglas distintas.
// Beneficio: evita condicionales gigantes y clarifica transiciones.
export class GameStateManager {
  constructor(initial = "menu") {
    this.state = initial;
    this.allowed = {
      menu: new Set(["playing"]),
      playing: new Set(["paused", "mission_fail", "campaign_complete"]),
      paused: new Set(["playing", "menu"]),
      mission_fail: new Set(["menu", "playing"]),
      campaign_complete: new Set(["menu", "playing"]),
    };
  }

  getState() {
    return this.state;
  }

  canTransition(to) {
    return this.allowed[this.state]?.has(to) ?? false;
  }

  transition(to) {
    if (this.state === to) return true;
    if (!this.canTransition(to)) return false;
    this.state = to;
    return true;
  }
}
