// Pattern: Repository
// Motivo: centralizar constantes de juego para evitar valores sueltos en sistemas.
// Beneficio: balancear el juego editando una sola fuente de verdad.
export const gameConfig = {
  maxMissionTimeSec: 420,
  oxygenDrainPerSecOutsideCamp: 100 / 60,
  oxygenBottleBoost: 33.33,
  batteryMax: 100,
  batteryDrainMovingPerSec: 0.5,
  batteryDrainIdlePerSec: 0.1,
  batteryUseAction: 2,
  batteryChargePerSec: 5,
  roverSpeed: 9.5,
  roverTurnSpeed: Math.PI * (120 / 180),
  interactionDistance: 4.5,
  campSafeDistance: 6,
  mapLimit: 110,
};
