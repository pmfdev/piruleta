import { EventBus } from "./core/EventBus.js";
import { GameStateManager } from "./core/GameStateManager.js";
import { GameLoop } from "./core/GameLoop.js";
import { gameConfig } from "./config/gameConfig.js";
import { mapLayout } from "./config/mapLayout.js";
import { WorldScene } from "./scene/WorldScene.js";
import { InputCommandMapper } from "./input/InputCommandMapper.js";
import { RoverSystem } from "./systems/RoverSystem.js";
import { BatterySystem } from "./systems/BatterySystem.js";
import { PiruletaSystem } from "./systems/PiruletaSystem.js";
import { MissionSystem } from "./systems/MissionSystem.js";
import { UISystem } from "./systems/UISystem.js";

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

const eventBus = new EventBus();
const stateManager = new GameStateManager("menu");
const world = new WorldScene(document.getElementById("game-canvas"));
const ui = new UISystem();
const input = new InputCommandMapper(
  document.getElementById("joystick-zone"),
  document.getElementById("joystick-knob"),
  document.getElementById("action-btn")
);

let rover = null;
let battery = null;
let piruleta = null;
let mission = null;
let totalTime = 0;
let hint = "Pulsa ACCION cerca de objetos";
let lastAction = false;

function resetGame() {
  rover = new RoverSystem(world, mapLayout);
  battery = new BatterySystem(eventBus);
  piruleta = new PiruletaSystem(eventBus);
  mission = new MissionSystem(world, eventBus);
  totalTime = gameConfig.maxMissionTimeSec;
  hint = "Recoge el primer objetivo";
  lastAction = false;
}

function setupEvents() {
  eventBus.on("item_delivered", ({ type }) => {
    if (type === "oxygen") piruleta.addOxygenBottle();
  });
  eventBus.on("mission_completed", ({ missionId }) => {
    hint = `Mision completada: ${missionId}`;
    if (missionId === "camp") piruleta.campBuilt = true;
  });
  eventBus.on("campaign_completed", () => {
    stateManager.transition("campaign_complete");
    ui.showResult("Victoria", "Piruleta esta a salvo en Marte.");
  });
  eventBus.on("oxygen_empty", () => {
    stateManager.transition("mission_fail");
    ui.showResult("Derrota", "Piruleta se quedo sin oxigeno.");
  });
}

function update(dt) {
  if (stateManager.getState() !== "playing") return;

  totalTime -= dt;
  if (totalTime <= 0) {
    totalTime = 0;
    stateManager.transition("mission_fail");
    ui.showResult("Derrota", "Se acabo el tiempo de 7 minutos.");
    return;
  }

  const roverPos = rover.getPosition();
  const nearStation = mapLayout.stations.some((s) => distance2D(roverPos, s) <= gameConfig.interactionDistance);
  const actionPressed = input.consumeActionPressed();

  battery.update(dt, rover.isMoving, actionPressed, nearStation);
  if (!battery.canMove() && !battery.recharging) {
    hint = "Sin bateria. Ve a una estacion y pulsa ACCION";
  }

  rover.update(dt, input, battery.recharging || !battery.canMove());
  piruleta.update(dt);

  if (actionPressed && !lastAction) {
    const result = mission.interact(rover.getPosition(), gameConfig.interactionDistance);
    if (result?.hint) hint = result.hint;
  }
  lastAction = actionPressed;

  const current = mission.current;
  const missionText = current
    ? `${current.title} - ${current.objectiveLabel}: ${current.progress}/${current.target}`
    : "Campana completada";

  ui.setHint(
    `${hint} | Estaciones: ${nearStation ? "cerca (mantener ACCION)" : "lejos"} | Item: ${mission.heldItemType ?? "ninguno"}`
  );
  ui.update({
    oxygen: piruleta.oxygen,
    battery: battery.level,
    missionText,
    timeLeft: Math.ceil(totalTime),
  });
}

function render() {
  world.render();
}

function startPlaying() {
  if (!stateManager.transition("playing")) return;
  resetGame();
  ui.showPlayingUI();
}

setupEvents();
resetGame();
ui.showMenu();

document.getElementById("start-btn").addEventListener("click", startPlaying);
document.getElementById("restart-btn").addEventListener("click", () => {
  stateManager.transition("menu");
  ui.showMenu();
});
window.addEventListener("resize", () => world.resize());
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
});

const loop = new GameLoop(update, render);
loop.start();

window.render_game_to_text = () => {
  const roverPos = rover.getPosition();
  const current = mission.current;
  return JSON.stringify({
    coord_system: "x derecha, z abajo/arriba en el plano; y altura",
    mode: stateManager.getState(),
    rover: { x: Number(roverPos.x.toFixed(2)), z: Number(roverPos.z.toFixed(2)), yaw: Number(rover.yaw.toFixed(2)) },
    piruleta: { oxygen: Number(piruleta.oxygen.toFixed(2)), camp_built: piruleta.campBuilt },
    battery: { level: Number(battery.level.toFixed(2)), recharging: battery.recharging },
    mission: current
      ? { id: current.id, progress: current.progress, target: current.target, carrying: mission.heldItemType ?? null }
      : { id: "done" },
    pickups_visible: world.pickups.map((p) => ({ id: p.id, type: p.type, x: p.x, z: p.z })),
    time_left: Number(totalTime.toFixed(2)),
    hint,
  });
};

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i++) update(1 / 60);
  render();
};
