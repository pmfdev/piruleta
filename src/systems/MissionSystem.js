import { missionTemplates } from "../config/missions.js";
import { mapLayout } from "../config/mapLayout.js";

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

// Pattern: Template Method
// Motivo: todas las misiones comparten flujo (recolectar -> entregar -> completar).
// Beneficio: agregar tipos de mision nuevos reutilizando el mismo esqueleto.
export class MissionSystem {
  constructor(world, eventBus) {
    this.world = world;
    this.eventBus = eventBus;
    this.missions = missionTemplates.map((m) => ({ ...m, progress: 0 }));
    this.currentIndex = 0;
    this.heldItemType = null;
    this.populatePickupsForMission();
  }

  get current() {
    return this.missions[this.currentIndex];
  }

  getTargetPoint() {
    return this.current.deliverTo === "piruleta" ? mapLayout.piruleta : mapLayout.camp;
  }

  populatePickupsForMission() {
    const m = this.current;
    const source =
      m.pickupType === "oxygen"
        ? mapLayout.oxygenPickups
        : m.pickupType === "material"
          ? mapLayout.materialPickups
          : mapLayout.foodPickups;
    this.world.setPickups(source.map((p) => ({ ...p, type: m.pickupType })));
  }

  interact(roverPos, interactionDistance) {
    const m = this.current;
    if (!m) return { hint: "Campana completada" };
    if (!this.heldItemType) {
      const pick = this.world.pickups.find((p) => distance2D(roverPos, p) <= interactionDistance);
      if (!pick || pick.type !== m.pickupType) return { hint: "Acercate al objetivo" };
      this.heldItemType = pick.type;
      this.world.removePickupById(pick.id);
      return { hint: `Recogido: ${pick.type}` };
    }

    const deliveryPoint = this.getTargetPoint();
    if (distance2D(roverPos, deliveryPoint) > interactionDistance) {
      return { hint: "Lleva el item al destino" };
    }
    m.progress += 1;
    const deliveredType = this.heldItemType;
    this.heldItemType = null;
    this.eventBus.emit("item_delivered", { type: deliveredType, missionId: m.id, progress: m.progress });
    if (m.progress >= m.target) {
      this.currentIndex += 1;
      const finishedMissionId = m.id;
      this.eventBus.emit("mission_completed", { missionId: finishedMissionId });
      if (this.currentIndex >= this.missions.length) {
        this.eventBus.emit("campaign_completed");
      } else {
        this.populatePickupsForMission();
      }
    }
    return { hint: `Entrega completada ${m.progress}/${m.target}` };
  }
}
