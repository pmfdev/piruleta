function pct(v) {
  return `${Math.max(0, Math.min(100, v)).toFixed(0)}%`;
}

export class UISystem {
  constructor() {
    this.hud = document.getElementById("hud");
    this.oxygenFill = document.getElementById("oxygen-fill");
    this.batteryFill = document.getElementById("battery-fill");
    this.missionText = document.getElementById("mission-text");
    this.timeText = document.getElementById("time-text");
    this.hintText = document.getElementById("hint-text");
    this.menu = document.getElementById("menu");
    this.result = document.getElementById("result");
    this.resultTitle = document.getElementById("result-title");
    this.resultDesc = document.getElementById("result-desc");
    this.controls = document.getElementById("controls");
  }

  showPlayingUI() {
    this.menu.classList.add("hidden");
    this.result.classList.add("hidden");
    this.hud.classList.remove("hidden");
    this.controls.classList.remove("hidden");
  }

  showMenu() {
    this.menu.classList.remove("hidden");
    this.result.classList.add("hidden");
    this.hud.classList.add("hidden");
    this.controls.classList.add("hidden");
  }

  showResult(title, desc) {
    this.resultTitle.textContent = title;
    this.resultDesc.textContent = desc;
    this.result.classList.remove("hidden");
    this.hud.classList.add("hidden");
    this.controls.classList.add("hidden");
  }

  setHint(text) {
    this.hintText.textContent = text;
  }

  update(state) {
    this.oxygenFill.style.width = pct(state.oxygen);
    this.batteryFill.style.width = pct(state.battery);
    this.missionText.textContent = state.missionText;
    this.timeText.textContent = `Tiempo: ${state.timeLeft}s`;
  }
}
