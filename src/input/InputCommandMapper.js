// Pattern: Command
// Motivo: separar dispositivo de entrada de las acciones del rover.
// Beneficio: soporta teclado y tactil con la misma interfaz.
export class InputCommandMapper {
  constructor(joystickZone, joystickKnob, cameraZone, cameraKnob, actionBtn) {
    this.joystick = { x: 0, y: 0 };
    this.lookJoystick = { x: 0, y: 0 };
    this.actionPressed = false;
    this.keys = new Set();
    this.movePointerId = null;
    this.lookPointerId = null;
    this.zone = joystickZone;
    this.knob = joystickKnob;
    this.cameraZone = cameraZone;
    this.cameraKnob = cameraKnob;
    this.actionBtn = actionBtn;
    this.attachKeyboard();
    this.attachTouchJoysticks();
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

  attachTouchJoysticks() {
    const radius = 45;
    const attachStick = (zone, knob, state, pointerKey) => {
      if (!zone || !knob) return;
      const center = () => {
        const rect = zone.getBoundingClientRect();
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
        state.x = dx / radius;
        state.y = dy / radius;
        knob.style.left = `${39 + dx}px`;
        knob.style.top = `${39 + dy}px`;
      };
      const reset = () => {
        state.x = 0;
        state.y = 0;
        knob.style.left = "39px";
        knob.style.top = "39px";
      };
      zone.addEventListener("pointerdown", (e) => {
        this[pointerKey] = e.pointerId;
        zone.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      });
      zone.addEventListener("pointermove", (e) => {
        if (e.pointerId === this[pointerKey]) update(e.clientX, e.clientY);
      });
      const release = (e) => {
        if (e.pointerId !== this[pointerKey]) return;
        this[pointerKey] = null;
        reset();
      };
      zone.addEventListener("pointerup", release);
      zone.addEventListener("pointercancel", release);
    };
    attachStick(this.zone, this.knob, this.joystick, "movePointerId");
    attachStick(this.cameraZone, this.cameraKnob, this.lookJoystick, "lookPointerId");
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
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y, strength: Math.min(1, Math.hypot(x, y)) };
  }

  getLookVector() {
    let x = this.lookJoystick.x;
    let y = -this.lookJoystick.y;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y, strength: Math.min(1, Math.hypot(x, y)) };
  }

  consumeActionPressed() {
    const keyboardAction = this.keys.has("Space") || this.keys.has("KeyE");
    const active = keyboardAction || this.actionPressed;
    return active;
  }
}
