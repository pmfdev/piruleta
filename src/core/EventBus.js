// Pattern: Observer
// Motivo: desacoplar emisores de eventos de suscriptores.
// Beneficio: agregar reacciones nuevas sin modificar sistemas existentes.
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}
