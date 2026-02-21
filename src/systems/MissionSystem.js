import { mapLayout } from "../config/mapLayout.js";
import { gameConfig } from "../config/gameConfig.js";

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

const PHASES = {
  SURVIVAL: "survival",
  STABILITY: "stability",
  FINAL: "final",
};

function clamp01Pct(v) {
  return Math.max(0, Math.min(100, v));
}

function resourceLabel(type) {
  if (type === "oxygen") return "botella de oxigeno";
  if (type === "material") return "componentes de mantenimiento";
  if (type === "food") return "comida";
  return type;
}

export class MissionSystem {
  constructor(world, eventBus) {
    this.world = world;
    this.eventBus = eventBus;
    this.heldItemType = null;
    this.phase = PHASES.SURVIVAL;
    this.stableTimer = 0;
    this.catOutdoor = false;
    this.systems = {
      oxygen: 52,
      systemHealth: 58,
      food: 48,
    };
    this.pickupCounters = { oxygen: 1000, material: 2000, food: 3000 };
    this.refillPools = {
      oxygen: [...mapLayout.oxygenPickups],
      material: [...mapLayout.materialPickups],
      food: [...mapLayout.foodPickups],
    };
    this.populateInitialPickups();
  }

  getPhase() {
    return this.phase;
  }

  isFinalPhase() {
    return this.phase === PHASES.FINAL;
  }

  isStableNow() {
    return (
      this.systems.oxygen >= gameConfig.oxygenStableThreshold &&
      this.systems.systemHealth >= gameConfig.maintenanceSafeThreshold &&
      this.systems.food >= gameConfig.systemStableThreshold
    );
  }

  shouldCatBeOutdoor() {
    return this.catOutdoor;
  }

  getSystemState() {
    return {
      oxygen: Number(this.systems.oxygen.toFixed(2)),
      systemHealth: Number(this.systems.systemHealth.toFixed(2)),
      food: Number(this.systems.food.toFixed(2)),
      stableTimer: Number(this.stableTimer.toFixed(2)),
      phase: this.phase,
      carrying: this.heldItemType ?? null,
    };
  }

  populateInitialPickups() {
    const initial = [
      ...mapLayout.oxygenPickups.map((p) => ({ ...p, type: "oxygen" }),
      ),
      ...mapLayout.materialPickups.map((p) => ({ ...p, type: "material" }),
      ),
      ...mapLayout.foodPickups.map((p) => ({ ...p, type: "food" }),
      ),
    ];
    this.world.setPickups(initial);
  }

  update(dt) {
    if (!this.isFinalPhase()) {
      if (gameConfig.freezeModuleNeedsForDesign) return;
      const decay = this.phase === PHASES.SURVIVAL ? gameConfig.systemDecaySurvival : gameConfig.systemDecayStability;
      this.systems.systemHealth = clamp01Pct(this.systems.systemHealth - decay.maintenance * dt);
      this.systems.food = clamp01Pct(this.systems.food - decay.food * dt);

      // El oxigeno solo deja de caer cuando alcanza estabilidad y el mantenimiento acompana.
      const oxygenStable =
        this.systems.oxygen >= gameConfig.oxygenStableThreshold &&
        this.systems.systemHealth >= gameConfig.maintenanceSafeThreshold;
      if (!oxygenStable) {
        // Si mantenimiento cae, el oxigeno empeora mas rapido.
        const maintenancePenalty = Math.max(0, (gameConfig.maintenanceSafeThreshold - this.systems.systemHealth) * 0.02);
        this.systems.oxygen = clamp01Pct(this.systems.oxygen - (decay.oxygen + maintenancePenalty) * dt);
      }
    }

    const stable = this.isStableNow();
    this.stableTimer = stable ? this.stableTimer + dt : 0;

    if (this.phase === PHASES.SURVIVAL && this.stableTimer >= gameConfig.phase2UnlockStableSec) {
      this.phase = PHASES.STABILITY;
      this.eventBus.emit("phase_changed", { phase: this.phase });
    }

    const shouldOutdoor = this.phase !== PHASES.SURVIVAL && stable && this.stableTimer >= gameConfig.catOutdoorStableSec;
    if (this.catOutdoor !== shouldOutdoor) {
      this.catOutdoor = shouldOutdoor;
      this.eventBus.emit("cat_outdoor_changed", { outdoor: this.catOutdoor });
    }

    if (this.phase === PHASES.STABILITY && stable && this.stableTimer >= gameConfig.finalMissionUnlockStableSec) {
      this.phase = PHASES.FINAL;
      this.eventBus.emit("phase_changed", { phase: this.phase });
      this.eventBus.emit("final_mission_unlocked");
    }

    if (this.systems.oxygen <= 0.01) {
      this.eventBus.emit("oxygen_empty");
    }
  }

  getDeliveryPoint(type) {
    return mapLayout.moduleDeliveryPoints?.[type] ?? mapLayout.camp;
  }

  boostSystemForType(type) {
    const boost = gameConfig.systemBoostByDelivery[type] ?? 16;
    if (type === "oxygen") this.systems.oxygen = clamp01Pct(this.systems.oxygen + boost);
    if (type === "material") this.systems.systemHealth = clamp01Pct(this.systems.systemHealth + boost);
    if (type === "food") this.systems.food = clamp01Pct(this.systems.food + boost);
  }

  spawnReplacementPickup(type) {
    const pool = this.refillPools[type];
    if (!pool || pool.length === 0) return;
    const idx = Math.floor(Math.random() * pool.length);
    const ref = pool[idx];
    const id = `${type}_${this.pickupCounters[type]++}`;
    this.world.addPickup({ id, x: ref.x, z: ref.z, type });
  }

  interact(roverPos, interactionDistance) {
    if (this.isFinalPhase()) return { hint: "Guia a Piruleta hasta la nave" };
    if (!this.heldItemType) {
      const pick = this.world.pickups.find((p) => distance2D(roverPos, p) <= interactionDistance);
      if (!pick) return { hint: "Busca recursos para estabilizar sistemas" };
      this.heldItemType = pick.type;
      this.world.removePickupById(pick.id);
      return { hint: `Recogido: ${resourceLabel(pick.type)}` };
    }

    const deliveryPoint = this.getDeliveryPoint(this.heldItemType);
    if (distance2D(roverPos, deliveryPoint) > interactionDistance) {
      return { hint: "Lleva el recurso al punto de entrega exterior del modulo" };
    }
    const deliveredType = this.heldItemType;
    this.heldItemType = null;
    this.boostSystemForType(deliveredType);
    this.spawnReplacementPickup(deliveredType);
    this.eventBus.emit("item_delivered", { type: deliveredType });
    return { hint: `Sistema reforzado con ${resourceLabel(deliveredType)}` };
  }
}
