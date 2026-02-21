// Pattern: Repository
// Motivo: conservar el layout del mundo en datos configurables.
// Beneficio: mover puntos del mapa sin tocar logica de gameplay.
export const mapLayout = {
  spawn: { x: -48, z: -42 },
  piruleta: { x: 44, z: 36 },
  camp: { x: 38, z: -34 },
  returnShip: { x: -64, z: 58 },
  stations: [
    { x: -38, z: -36 },
    { x: 0, z: 4 },
    { x: 30, z: -22 },
  ],
  mountains: [
    { x: -12, z: 18, radius: 20, height: 4.5 },
    { x: 26, z: 24, radius: 16, height: 3.8 },
  ],
  olympusMountain: {
    center: { x: 52, z: 52 },
    radius: 46,
    height: 30,
    calderaRadius: 11,
    calderaDepth: 7.5,
    rimRadius: 15,
    rimHeight: 3.6,
  },
  mountainCaves: [],
  oxygenPickups: [
    { id: "o1", x: -8, z: -6 },
    { id: "o2", x: 20, z: 10 },
    { id: "o3", x: 36, z: 28 },
  ],
  materialPickups: [
    { id: "m1", x: -30, z: 8 },
    { id: "m2", x: -4, z: 26 },
    { id: "m3", x: 12, z: -2 },
    { id: "m4", x: 30, z: 18 },
    { id: "m5", x: 8, z: -30 },
    { id: "m6", x: 44, z: -6 },
  ],
  foodPickups: [
    { id: "f1", x: -18, z: -20 },
    { id: "f2", x: 6, z: 30 },
    { id: "f3", x: 34, z: 4 },
  ],
  rocks: [
    { x: -26, z: -10, r: 2.2 },
    { x: -18, z: 14, r: 2.6 },
    { x: -2, z: -20, r: 2.3 },
    { x: 10, z: 14, r: 2.4 },
    { x: 24, z: 28, r: 3.2 },
    { x: 30, z: -14, r: 2.5 },
    { x: 42, z: 10, r: 2.2 },
    { x: -34, z: 32, r: 2.7 },
    { x: -40, z: -28, r: 2.4 },
    { x: 4, z: 34, r: 2.6 },
  ],
};
