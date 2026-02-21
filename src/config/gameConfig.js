// Pattern: Repository
// Motivo: centralizar constantes de juego para evitar valores sueltos en sistemas.
// Beneficio: balancear el juego editando una sola fuente de verdad.
export const gameConfig = {
  // Temporal de diseno: evita deterioro de sistemas mientras se trabaja en arte/escena.
  freezeModuleNeedsForDesign: true,
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
  oxygenStableThreshold: 76,
  maintenanceSafeThreshold: 62,
  phase2UnlockStableSec: 26,
  catOutdoorStableSec: 34,
  finalMissionUnlockStableSec: 56,
  systemDecaySurvival: {
    oxygen: 1.35,
    maintenance: 0.38,
    food: 0.56,
  },
  systemDecayStability: {
    oxygen: 0.5,
    maintenance: 0.18,
    food: 0.28,
  },
  systemBoostByDelivery: {
    oxygen: 24,
    material: 22,
    food: 18,
  },
  catAutoWalkSpeed: 1.8,
  catPlayerWalkSpeed: 3.0,
  catShipReachDistance: 3.2,
};
