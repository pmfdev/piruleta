# Arquitectura

## Estado actual

- Arquitectura seleccionada para juego 3D Android offline con stack web.
- Diseno funcional del MVP cerrado: historia, misiones, reglas globales y layout base.

## Decision de stack

- Stack principal: `JavaScript vainilla + Three.js + Capacitor`.
- Plan B: `Godot 4` solo si aparece bloqueo grave de rendimiento o empaquetado.

## Objetivo de arquitectura v1

- Escalable: permitir agregar mas misiones y mecanicas sin reescribir el nucleo.
- Mantenible: separar datos, estado, sistemas y render.
- Didactica: documentar patrones usados dentro del codigo con comentarios cortos.

## Patrones base a aplicar

- `State`: control de estados del juego.
- `Observer (Pub-Sub)`: eventos desacoplados entre sistemas.
- `Strategy`: reglas intercambiables (consumo, dificultad, objetivos).
- `Factory`: creacion consistente de entidades de mundo.
- `Command`: mapeo de input a acciones.
- `Facade`: API simple para coordinar escena 3D.
- `Template Method`: flujo base de mision con pasos concretos por tipo.
- `Repository` (ligero): acceso centralizado a configuraciones de mapa y misiones.

## Estructura objetivo de carpetas

- `src/core/`
  - `GameLoop.js`
  - `GameStateManager.js`
  - `EventBus.js`
- `src/config/`
  - `gameConfig.js`
  - `missions.js`
  - `mapLayout.js`
- `src/systems/`
  - `RoverSystem.js`
  - `BatterySystem.js`
  - `PiruletaSystem.js`
  - `MissionSystem.js`
  - `PickupSystem.js`
  - `TerrainSystem.js`
  - `UISystem.js`
- `src/scene/`
  - `WorldScene.js`
  - `CameraController.js`
  - `EntityFactory.js`
- `src/input/`
  - `InputCommandMapper.js`
  - `VirtualJoystick.js`
  - `ActionButton.js`
- `src/ui/`
  - `HUD.js`
  - `screens/`
- `assets/`
- `android/` (generado por Capacitor)
- `docs/`

## Estados del juego (State)

- `menu`
- `briefing`
- `playing`
- `paused`
- `mission_success`
- `mission_fail`
- `campaign_complete`

## Contratos principales entre sistemas

- `MissionSystem` define objetivo activo y criterio de cierre.
- `PiruletaSystem` expone nivel de oxigeno y regla de consumo (fuera/dentro campamento).
- `BatterySystem` calcula consumo/recarga y notifica energia critica.
- `RoverSystem` aplica movimiento, pendientes y colisiones.
- `UISystem` refleja estado jugable y progreso, nunca contiene logica de reglas.

## Reglas de calidad de codigo

- Modulos pequenos con una responsabilidad.
- Sin logica de juego en componentes de UI.
- Datos de misiones y mapa siempre en `src/config/`.
- Comentarios didacticos de patron obligatorios en codigo nuevo:
  - `Pattern: <Nombre>`
  - `Motivo: <por que se usa en este punto>`
  - `Beneficio: <que mejora concreta aporta>`
- Referencia base: `docs/PATRONES_APLICADOS.md`.
