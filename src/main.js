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
import { CatSystem } from "./systems/CatSystem.js";

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

const eventBus = new EventBus();
const stateManager = new GameStateManager("menu");
const world = new WorldScene(document.getElementById("game-canvas"));
const ui = new UISystem();
const viewBtn = document.getElementById("view-btn");
const input = new InputCommandMapper(
  document.getElementById("joystick-zone"),
  document.getElementById("joystick-knob"),
  document.getElementById("camera-joystick-zone"),
  document.getElementById("camera-joystick-knob"),
  document.getElementById("action-btn")
);

let rover = null;
let battery = null;
let piruleta = null;
let mission = null;
let cat = null;
let totalTime = 0;
let hint = "Recolecta recursos para estabilizar sistemas";
let lastAction = false;

function updateViewButtonLabel() {
  if (!viewBtn) return;
  const mode = world.getCameraMode();
  if (mode === "first_person") viewBtn.textContent = "CAM: 1P";
  else if (mode === "very_far") viewBtn.textContent = "CAM: MUY LEJOS";
  else if (mode === "far") viewBtn.textContent = "CAM: LEJOS";
  else viewBtn.textContent = "CAM: 3P";
}

function resetGame() {
  rover = new RoverSystem(world, mapLayout);
  battery = new BatterySystem(eventBus);
  piruleta = new PiruletaSystem();
  mission = new MissionSystem(world, eventBus);
  cat = new CatSystem(world);
  totalTime = gameConfig.maxMissionTimeSec;
  hint = "Mantener con vida a Piruleta";
  lastAction = false;
}

function setupEvents() {
  eventBus.on("phase_changed", ({ phase }) => {
    if (phase === "stability") {
      hint = "Fase 2: Piruleta ya no corre peligro inmediato. Mantener estabilidad.";
      ui.showPhaseBanner("FASE 2: ESTABILIDAD");
    }
    if (phase === "final") {
      hint = "Fase final: guia a Piruleta hasta la nave de retorno.";
      ui.showPhaseBanner("FASE 3: VOLVER A CASA");
    }
  });
  eventBus.on("final_mission_unlocked", () => {
    cat.setFinalControl(true);
  });
  eventBus.on("oxygen_empty", () => {
    if (mission?.isFinalPhase()) return;
    stateManager.transition("mission_fail");
    ui.showResult("Derrota", "El soporte vital de Piruleta se quedo sin oxigeno.");
  });
}

function getMissionText(phase, systems) {
  if (phase === "survival") return "Fase 1: Supervivencia";
  if (phase === "stability") return "Fase 2: Estabilidad";
  return "Fase 3: Volver a casa";
}

function update(dt) {
  if (stateManager.getState() !== "playing") return;

  const phase = mission.getPhase();
  const finalPhase = phase === "final";
  if (!finalPhase) {
    totalTime -= dt;
    if (totalTime <= 0) {
      totalTime = 0;
      stateManager.transition("mission_fail");
      ui.showResult("Derrota", "La estacion quedo fuera de servicio antes de estabilizarse.");
      return;
    }
  }

  const roverPos = rover.getPosition();
  const nearStation = mapLayout.stations.some((s) => distance2D(roverPos, s) <= gameConfig.interactionDistance);
  const actionPressed = input.consumeActionPressed();

  if (!finalPhase) {
    battery.update(dt, rover.isMoving, actionPressed, nearStation);
    rover.update(dt, input, battery.recharging || !battery.canMove());
    if (!battery.canMove() && !battery.recharging) {
      hint = "Sin bateria. Busca estacion y mantene ACCION para recargar.";
    }
    mission.update(dt);
    cat.setOutdoorEnabled(mission.shouldCatBeOutdoor());
    cat.update(dt, input);
  } else {
    rover.update(dt, input, true);
    cat.setFinalControl(true);
    cat.update(dt, input);
    mission.update(dt);
    const catPos = cat.getPosition();
    const shipPos = world.getReturnShipPosition();
    if (distance2D(catPos, shipPos) <= gameConfig.catShipReachDistance) {
      stateManager.transition("campaign_complete");
      ui.showResult("Victoria", "Piruleta sube a la nave y vuelve a casa.");
      return;
    }
  }

  if (actionPressed && !lastAction && !finalPhase) {
    const result = mission.interact(rover.getPosition(), gameConfig.interactionDistance);
    if (result?.hint) hint = result.hint;
  }
  lastAction = actionPressed;

  world.applyCameraLookInput(input.getLookVector(), dt);
  piruleta.update(dt, mission.isStableNow());

  const systems = mission.getSystemState();
  const phaseText = getMissionText(phase, systems);
  const stableMark = mission.isStableNow() ? "estable" : "fragil";
  const carrying = mission.heldItemType ?? "ninguno";
  const chargeText = nearStation ? "cerca de estacion" : "sin estacion cercana";

  ui.setHint(
    `O2 ${systems.oxygen.toFixed(0)} | HAB ${systems.habitat.toFixed(0)} | COM ${systems.food.toFixed(0)} | Estado ${stableMark} | Carga ${chargeText} | Item ${carrying} | Piruleta ${piruleta.mood}`
  );
  ui.update({
    oxygen: systems.oxygen,
    battery: battery.level,
    missionText: phaseText,
    timeLeft: finalPhase ? "sin limite" : Math.ceil(totalTime),
  });
}

function render() {
  world.render();
}

function startPlaying() {
  if (!stateManager.transition("playing")) return;
  resetGame();
  world.setCameraMode("follow");
  updateViewButtonLabel();
  ui.showPlayingUI();
  ui.showPhaseBanner("FASE 1: SUPERVIVENCIA");
}

setupEvents();
resetGame();
updateViewButtonLabel();
ui.showMenu();

document.getElementById("start-btn").addEventListener("click", startPlaying);
document.getElementById("restart-btn").addEventListener("click", () => {
  stateManager.transition("menu");
  ui.showMenu();
});
if (viewBtn) {
  viewBtn.addEventListener("click", () => {
    world.cycleCameraMode();
    updateViewButtonLabel();
  });
}
window.addEventListener("resize", () => world.resize());
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "v") {
    world.cycleCameraMode();
    updateViewButtonLabel();
  }
  if (e.key.toLowerCase() === "f") {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
});

const loop = new GameLoop(update, render);
loop.start();

window.render_game_to_text = () => {
  const roverPos = rover.getPosition();
  const catPos = cat.getPosition();
  const systems = mission.getSystemState();
  return JSON.stringify({
    coord_system: "x derecha, z abajo/arriba en el plano; y altura",
    mode: stateManager.getState(),
    phase: mission.getPhase(),
    rover: { x: Number(roverPos.x.toFixed(2)), z: Number(roverPos.z.toFixed(2)), yaw: Number(rover.yaw.toFixed(2)) },
    piruleta: { x: Number(catPos.x.toFixed(2)), z: Number(catPos.z.toFixed(2)), mood: piruleta.mood },
    camera_mode: world.getCameraMode(),
    terrain_region: world.getTerrainRegion(roverPos.x, roverPos.z),
    systems: {
      oxygen: systems.oxygen,
      habitat: systems.habitat,
      food: systems.food,
      carrying: systems.carrying,
      stable_timer: systems.stableTimer,
    },
    battery: { level: Number(battery.level.toFixed(2)), recharging: battery.recharging },
    pickups_visible: world.pickups.map((p) => ({ id: p.id, type: p.type, x: p.x, z: p.z })),
    time_left: mission.isFinalPhase() ? null : Number(totalTime.toFixed(2)),
    ship: { x: Number(mapLayout.returnShip.x.toFixed(2)), z: Number(mapLayout.returnShip.z.toFixed(2)) },
    hint,
  });
};

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i++) update(1 / 60);
  render();
};
