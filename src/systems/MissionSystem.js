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

export class MissionSystem {
  constructor(world, eventBus) {
    this.world = world;
    this.eventBus = eventBus;
    this.heldItemType = null;
    this.phase = PHASES.SURVIVAL;
    this.stableTimer = 0;
    this.catOutdoor = false;
    this.systems = {
      oxygen: 58,
      habitat: 44,
      food: 50,
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
    const t = gameConfig.systemStableThreshold;
    return this.systems.oxygen >= t && this.systems.habitat >= t && this.systems.food >= t;
  }

  shouldCatBeOutdoor() {
    return this.catOutdoor;
  }

  getSystemState() {
    return {
      oxygen: Number(this.systems.oxygen.toFixed(2)),
      habitat: Number(this.systems.habitat.toFixed(2)),
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
      const decay = this.phase === PHASES.SURVIVAL ? gameConfig.systemDecaySurvival : gameConfig.systemDecayStability;
      this.systems.oxygen = clamp01Pct(this.systems.oxygen - decay.oxygen * dt);
      this.systems.habitat = clamp01Pct(this.systems.habitat - decay.habitat * dt);
      this.systems.food = clamp01Pct(this.systems.food - decay.food * dt);
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
    return type === "oxygen" ? mapLayout.piruleta : mapLayout.camp;
  }

  boostSystemForType(type) {
    const boost = gameConfig.systemBoostByDelivery[type] ?? 16;
    if (type === "oxygen") this.systems.oxygen = clamp01Pct(this.systems.oxygen + boost);
    if (type === "material") this.systems.habitat = clamp01Pct(this.systems.habitat + boost);
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
      return { hint: `Recogido: ${pick.type}` };
    }

    const deliveryPoint = this.getDeliveryPoint(this.heldItemType);
    if (distance2D(roverPos, deliveryPoint) > interactionDistance) {
      return { hint: "Lleva el recurso al sistema de destino" };
    }
    const deliveredType = this.heldItemType;
    this.heldItemType = null;
    this.boostSystemForType(deliveredType);
    this.spawnReplacementPickup(deliveredType);
    this.eventBus.emit("item_delivered", { type: deliveredType });
    return { hint: `Sistema reforzado con ${deliveredType}` };
  }
}
