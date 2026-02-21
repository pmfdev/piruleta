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
  // Nueva progresion por fases
  systemStableThreshold: 70,
  phase2UnlockStableSec: 26,
  catOutdoorStableSec: 34,
  finalMissionUnlockStableSec: 56,
  systemDecaySurvival: {
    oxygen: 1.35,
    habitat: 0.74,
    food: 0.56,
  },
  systemDecayStability: {
    oxygen: 0.5,
    habitat: 0.34,
    food: 0.28,
  },
  systemBoostByDelivery: {
    oxygen: 26,
    material: 20,
    food: 22,
  },
  catAutoWalkSpeed: 1.8,
  catPlayerWalkSpeed: 3.0,
  catShipReachDistance: 3.2,
};
