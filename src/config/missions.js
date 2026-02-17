// Pattern: Repository
// Motivo: declarar objetivos como datos y no como ifs repetidos.
// Beneficio: se pueden agregar nuevas misiones con cambios locales.
export const missionTemplates = [
  {
    id: "oxygen",
    title: "Mision 1: Oxigeno de emergencia",
    objectiveLabel: "Botellas entregadas",
    target: 3,
    pickupType: "oxygen",
    deliverTo: "piruleta",
  },
  {
    id: "camp",
    title: "Mision 2: Construir campamento",
    objectiveLabel: "Materiales entregados",
    target: 6,
    pickupType: "material",
    deliverTo: "camp",
  },
  {
    id: "food",
    title: "Mision 3: Suministro de comida",
    objectiveLabel: "Comida entregada",
    target: 3,
    pickupType: "food",
    deliverTo: "camp",
  },
];
