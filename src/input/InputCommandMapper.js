// Pattern: Command
// Motivo: separar dispositivo de entrada de las acciones del rover.
// Beneficio: soporta teclado y tactil con la misma interfaz.
export class InputCommandMapper {
  constructor(joystickZone, joystickKnob, actionBtn) {
    this.joystick = { x: 0, y: 0 };
    this.actionPressed = false;
    this.keys = new Set();
    this.activePointerId = null;
    this.zone = joystickZone;
    this.knob = joystickKnob;
    this.actionBtn = actionBtn;
    this.attachKeyboard();
    this.attachTouchJoystick();
    this.attachActionButton();
  }

  attachKeyboard() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });
  }

  attachTouchJoystick() {
    if (!this.zone) return;
    const radius = 45;
    const center = () => {
      const rect = this.zone.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const update = (clientX, clientY) => {
      const c = center();
      let dx = clientX - c.x;
      let dy = clientY - c.y;
      const len = Math.hypot(dx, dy);
      if (len > radius) {
        dx = (dx / len) * radius;
        dy = (dy / len) * radius;
      }
      this.joystick.x = dx / radius;
      this.joystick.y = dy / radius;
      this.knob.style.left = `${39 + dx}px`;
      this.knob.style.top = `${39 + dy}px`;
    };
    const reset = () => {
      this.joystick.x = 0;
      this.joystick.y = 0;
      this.knob.style.left = "39px";
      this.knob.style.top = "39px";
    };
    this.zone.addEventListener("pointerdown", (e) => {
      this.activePointerId = e.pointerId;
      this.zone.setPointerCapture(e.pointerId);
      update(e.clientX, e.clientY);
    });
    this.zone.addEventListener("pointermove", (e) => {
      if (e.pointerId === this.activePointerId) update(e.clientX, e.clientY);
    });
    const release = (e) => {
      if (e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      reset();
    };
    this.zone.addEventListener("pointerup", release);
    this.zone.addEventListener("pointercancel", release);
  }

  attachActionButton() {
    if (!this.actionBtn) return;
    this.actionBtn.addEventListener("pointerdown", () => {
      this.actionPressed = true;
    });
    const release = () => {
      this.actionPressed = false;
    };
    this.actionBtn.addEventListener("pointerup", release);
    this.actionBtn.addEventListener("pointercancel", release);
  }

  getMoveVector() {
    let x = this.joystick.x;
    let y = -this.joystick.y;
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) x -= 1;
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) x += 1;
    if (this.keys.has("ArrowUp") || this.keys.has("KeyW")) y += 1;
    if (this.keys.has("ArrowDown") || this.keys.has("KeyS")) y -= 1;
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len, strength: Math.min(1, Math.hypot(x, y)) };
  }

  consumeActionPressed() {
    const keyboardAction = this.keys.has("Space") || this.keys.has("KeyE");
    const active = keyboardAction || this.actionPressed;
    return active;
  }
}
