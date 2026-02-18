# Relevo de Sesion

Este archivo sirve para retomar el proyecto sin perder contexto entre sesiones.

## Como usar

1. Al terminar una sesion, agregar una nueva entrada arriba del todo.
2. Mantener maximo 10 a 15 lineas por entrada.
3. Incluir siempre rama, commit y siguientes pasos concretos.
4. Al volver, usar este prompt:
   - `Retomamos desde docs/RELEVO_SESION.md en rama <rama>`

---

## Plantilla

### Fecha: YYYY-MM-DD
- Rama activa:
- Ultimo commit util:
- Estado actual:
- Que funciona:
- Que falta:
- Proximos 3 pasos:
  1.
  2.
  3.
- Riesgos/Bloqueos:
- Comandos utiles:
  - `npm install`
  - `npm run dev -- --host 127.0.0.1 --port 5173`
  - `npm run build`

---

## Entradas

### Fecha: 2026-02-17
- Rama activa: `develop`
- Ultimo commit util: `a122bab` (`feat: integra Android con Capacitor y mejora controles del rover`)
- Estado actual: `develop` y `dev_V1` quedaron alineadas en el mismo commit; app Android instalada y ejecutando en emulador con paquete `com.pmfdev.piruleta`.
- Que funciona:
  - Integracion Android via Capacitor (`android/` + `capacitor.config.json`).
  - Deploy validado en emulador (`build + sync + installDebug + launch`).
  - Joystick a la derecha y boton accion a la izquierda.
  - Control del rover con giro/aceleracion progresivos y seguimiento tactil robusto.
  - Limpieza de conflicto de app vieja en emulador (`com.marte.rover` desinstalada).
- Que falta:
  - Ajuste fino de sensacion del giro (percepcion de direccion/camara en pruebas manuales).
  - Pulir comportamiento de camara en rotaciones largas para evitar confusion visual.
  - Continuar ciclo completo de misiones con validacion automatizada end-to-end.
- Proximos 3 pasos:
  1. Hacer una pasada de tuning de `roverTurnSpeed`, umbrales y suavizado con pruebas en emulador.
  2. Revisar camara tercera persona para alinear mejor percepcion de giro izquierda/derecha.
  3. Revalidar flujo de misiones (inicio, progreso, victoria/derrota) en Android.
- Riesgos/Bloqueos:
  - El emulador puede mostrar pantalla blanca transitoria o quedar detras de otras ventanas.
  - Posible confusion de percepcion por relacion camara-giro aunque el input sea correcto.
- Comandos utiles:
  - `npm run build`
  - `npx cap sync android`
  - `cd android && gradlew.bat installDebug`
  - `adb shell am start -n com.pmfdev.piruleta/.MainActivity`

### Fecha: 2026-02-17
- Rama activa: `dev_V1`
- Ultimo commit util: `d8ca7e4` (`feat: agrega base jugable 3D con arquitectura modular`)
- Estado actual: MVP base jugable creado con `Vite + Three.js`, arquitectura modular y comentarios didacticos de patrones.
- Que funciona:
  - Menu de inicio, HUD y escena 3D de Marte.
  - Movimiento base del rover, bateria y oxigeno.
  - Estructura de misiones inicial y hooks de testing (`render_game_to_text`, `advanceTime`).
  - Build de produccion (`npm run build`) validado.
- Que falta:
  - Pulir controles y camara.
  - Completar flujo integral de misiones (ciclo completo con victoria/derrota robusta).
  - Mejorar UX/feedback de objetivos e interacciones.
- Proximos 3 pasos:
  1. Ajustar controles tactiles y camara tercera persona para mejor jugabilidad.
  2. Completar y validar el flujo completo de las 3 misiones con pruebas automatizadas.
  3. Refinar HUD/mensajes y balance inicial de recursos (oxigeno/bateria/tiempo).
- Riesgos/Bloqueos:
  - Riesgo de sensacion de control "tosco" en movil si no se ajusta input/camara.
  - Dependencia de Playwright/servidor local para validar cada iteracion visual.
- Comandos utiles:
  - `npm install`
  - `npm run dev -- --host 127.0.0.1 --port 5173`
  - `npm run build`
