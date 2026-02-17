# Patrones Aplicados

Este documento registra los patrones de diseno que se aplicaran en el proyecto, donde se usan y que problema resuelven.

## Convencion de comentarios en codigo

- Formato obligatorio corto (encima del bloque):
  - `Pattern: <Nombre> - <Motivo breve>`
- Formato didactico recomendado (3 lineas max):
  - `Pattern: <Nombre>`
  - `Motivo: <por que se usa aqui>`
  - `Beneficio: <que mejora concreta aporta>`

### Plantilla didactica sugerida

```js
// Pattern: <Nombre>
// Motivo: <problema concreto que estamos resolviendo>
// Beneficio: <impacto directo en claridad, escalabilidad o testeo>
```

### Ejemplo real (State)

```js
// Pattern: State
// Motivo: el juego tiene modos distintos (menu, playing, paused, fail) con reglas diferentes.
// Beneficio: evita ifs gigantes y hace seguras las transiciones entre estados.
```

## Matriz de patrones (objetivo v1)

1. Patron: `State`
- Donde: `src/core/GameStateManager.js`
- Problema que resuelve: controlar transiciones de flujo (`menu`, `playing`, `paused`, etc.) de forma clara.
- Senal en codigo: `Pattern: State`.
- Motivo didactico: encapsular reglas por estado.
- Beneficio didactico: menos acoplamiento y transiciones mas faciles de depurar.

2. Patron: `Observer (Pub-Sub)`
- Donde: `src/core/EventBus.js` y sus suscriptores.
- Problema que resuelve: desacoplar sistemas (UI, misiones, bateria, pickups) usando eventos.
- Senal en codigo: `Pattern: Observer`.
- Motivo didactico: un emisor no necesita conocer quien escucha.
- Beneficio didactico: agregar nuevas reacciones sin romper codigo existente.

3. Patron: `Strategy`
- Donde: `src/systems/BatterySystem.js`, `src/systems/PiruletaSystem.js`, `src/systems/MissionSystem.js`.
- Problema que resuelve: cambiar reglas de consumo/objetivo sin modificar el sistema completo.
- Senal en codigo: `Pattern: Strategy`.
- Motivo didactico: las reglas pueden variar por modo, mision o dificultad.
- Beneficio didactico: permite experimentar balance sin tocar el nucleo.

4. Patron: `Factory`
- Donde: `src/scene/EntityFactory.js`.
- Problema que resuelve: crear entidades de forma consistente y reusable (rover, rocas, pickups, estaciones).
- Senal en codigo: `Pattern: Factory`.
- Motivo didactico: centralizar como se construyen entidades.
- Beneficio didactico: evita duplicacion y errores de inicializacion.

5. Patron: `Command`
- Donde: `src/input/InputCommandMapper.js`.
- Problema que resuelve: traducir input tactil/teclado a acciones de juego desacopladas del rover.
- Senal en codigo: `Pattern: Command`.
- Motivo didactico: separar "que boton se pulsa" de "que accion se ejecuta".
- Beneficio didactico: facilita remapeo de controles y pruebas de input.

6. Patron: `Facade`
- Donde: `src/scene/WorldScene.js`.
- Problema que resuelve: ocultar complejidad de Three.js con una API simple para los sistemas.
- Senal en codigo: `Pattern: Facade`.
- Motivo didactico: exponer solo operaciones utiles de alto nivel.
- Beneficio didactico: reduce complejidad accidental para el resto del juego.

7. Patron: `Template Method`
- Donde: base de misiones dentro de `src/systems/MissionSystem.js`.
- Problema que resuelve: mantener flujo comun de mision y redefinir pasos por tipo.
- Senal en codigo: `Pattern: Template Method`.
- Motivo didactico: todas las misiones comparten estructura pero cambian objetivos.
- Beneficio didactico: agrega nuevas misiones sin reescribir el flujo completo.

8. Patron: `Repository` (ligero)
- Donde: `src/config/missions.js`, `src/config/mapLayout.js`, `src/config/gameConfig.js`.
- Problema que resuelve: centralizar lectura de datos de juego y evitar valores dispersos.
- Senal en codigo: `Pattern: Repository`.
- Motivo didactico: separar datos de reglas.
- Beneficio didactico: balancear el juego editando config sin tocar logica.

## Reglas de uso

- No usar un patron si no mejora claridad o evolucion.
- Preferir simplicidad en MVP y crecer por necesidad.
- Cada nuevo patron debe registrarse en este archivo y en `docs/DECISIONES.md` si cambia arquitectura.
- Comentar patron solo en puntos de decision relevantes, no en cada linea.
- Si un patron deja de aportar valor, simplificar y documentar el cambio.
