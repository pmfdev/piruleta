# Seguimiento Diario

Este archivo mantiene el hilo de trabajo entre sesiones.

## Como usar

1. Crear una nueva entrada por fecha.
2. Registrar avances reales (no intenciones largas).
3. Dejar siempre siguientes pasos claros.
4. Si hay bloqueo, indicar causa y accion propuesta.

---

## Plantilla de entrada

### Fecha: YYYY-MM-DD

- Sesion:
- Rama:
- Objetivo del dia:
- Trabajo realizado:
- Decisiones tomadas (IDs):
- Archivos tocados:
- Estado de pruebas:
- Bloqueos:
- Siguientes pasos:

---

## Entradas

### Fecha: 2026-02-17

- Sesion: Inicial
- Rama: `develop`
- Objetivo del dia: Preparar base documental y flujo git.
- Trabajo realizado:
  - Clonado repo remoto vacio.
  - Creada rama `develop`.
  - Creados documentos base en `docs/`.
  - Commit y push inicial en `develop`.
- Decisiones tomadas (IDs): `DEC-001`, `DEC-002`
- Archivos tocados:
  - `README.md`
  - `docs/CONTEXTO_PROYECTO.md`
  - `docs/MISION_JUEGO.md`
  - `docs/PLAN.md`
  - `docs/ARQUITECTURA.md`
  - `docs/DECISIONES.md`
  - `docs/SEGUIMIENTO.md`
- Estado de pruebas: No aplica (sin codigo jugable aun).
- Bloqueos: Ninguno.
- Siguientes pasos:
  - Definir edad del jugador, plataforma, tipo de juego y stack tecnico.
  - Cerrar decision de arquitectura (DEC-003).

### Fecha: 2026-02-17

- Sesion: Definicion funcional del juego
- Rama: `develop`
- Objetivo del dia: Cerrar requisitos de producto para arrancar implementacion.
- Trabajo realizado:
  - Definidos requisitos completos: Android, 3D, Marte, rover tipo NASA.
  - Definidos controles: joystick virtual + boton de accion.
  - Definidos UX en espanol con paneles/iconos.
  - Definido requisito offline y objetivo de distribucion APK.
  - Actualizada arquitectura con seleccion de stack Godot 4.
- Decisiones tomadas (IDs): `DEC-003`, `DEC-004`, `DEC-005`
- Archivos tocados:
  - `README.md`
  - `docs/CONTEXTO_PROYECTO.md`
  - `docs/MISION_JUEGO.md`
  - `docs/PLAN.md`
  - `docs/ARQUITECTURA.md`
  - `docs/DECISIONES.md`
  - `docs/SEGUIMIENTO.md`
- Estado de pruebas: No aplica (fase documental).
- Bloqueos: Ninguno.
- Siguientes pasos:
  - Crear proyecto base en Godot 4.
  - Implementar escena de prueba con rover y controles moviles.
  - Generar primera APK interna.

### Fecha: 2026-02-17

- Sesion: Ajuste de stack tecnico
- Rama: `develop`
- Objetivo del dia: Alinear tecnologia con preferencia JS del proyecto.
- Trabajo realizado:
  - Cambio de stack principal a JavaScript + Three.js + Capacitor.
  - Actualizacion de arquitectura, contexto y plan tecnico.
  - Registro del pivot en decisiones para trazabilidad.
- Decisiones tomadas (IDs): `DEC-006`
- Archivos tocados:
  - `README.md`
  - `docs/CONTEXTO_PROYECTO.md`
  - `docs/PLAN.md`
  - `docs/ARQUITECTURA.md`
  - `docs/DECISIONES.md`
  - `docs/SEGUIMIENTO.md`
- Estado de pruebas: No aplica (fase documental).
- Bloqueos: Ninguno.
- Siguientes pasos:
  - Crear scaffold de proyecto web 3D.
  - Integrar controles tactiles (joystick + accion).
  - Empaquetar primer APK con Capacitor.

### Fecha: 2026-02-17

- Sesion: Cierre de narrativa, misiones y arquitectura por patrones
- Rama: `develop`
- Objetivo del dia: Definir en detalle misiones, balance base y arquitectura escalable antes de programar.
- Trabajo realizado:
  - Definida historia canon de Piruleta y rol de Sergi.
  - Cerradas 3 misiones MVP: oxigeno, campamento y comida.
  - Cerradas reglas globales: tiempo maximo 7 minutos, oxigeno y bateria.
  - Definido mapa inicial con 3 estaciones de recarga y relieve no homogeneo.
  - Definida arquitectura v1 por sistemas con patrones de diseno.
  - Creado documento `docs/PATRONES_APLICADOS.md`.
- Decisiones tomadas (IDs): `DEC-007`, `DEC-008`, `DEC-009`
- Archivos tocados:
  - `README.md`
  - `docs/CONTEXTO_PROYECTO.md`
  - `docs/MISION_JUEGO.md`
  - `docs/PLAN.md`
  - `docs/ARQUITECTURA.md`
  - `docs/PATRONES_APLICADOS.md`
  - `docs/DECISIONES.md`
  - `docs/SEGUIMIENTO.md`
- Estado de pruebas: No aplica (fase documental).
- Bloqueos: Ninguno.
- Siguientes pasos:
  - Crear scaffold tecnico del proyecto JS + Three.js.
  - Implementar `GameStateManager`, `EventBus` y configuraciones base.
  - Construir escena jugable minima con HUD de oxigeno/bateria/tiempo.

### Fecha: 2026-02-19

- Sesion: Relieve avanzado, ajustes jugables y despliegue Android
- Rama: `dev_V2`
- Objetivo del dia: Mejorar terreno/camara y dejar build instalable en emulador y movil.
- Trabajo realizado:
  - Integrado Monte Olimpo (mega relieve) con mapa ampliado.
  - Mejorado contacto rover-terreno para evitar hundimiento en pendientes.
  - Implementado y luego retirado la mecanica de deslizamiento por solicitud.
  - Oxigeno fijado al 100% permanente por solicitud.
  - Eliminadas todas las cuevas por solicitud final (`mountainCaves: []`).
  - Implementado control de camara con colision contra terreno y ajuste en regiones.
  - Ajustados scripts Vite a `--configLoader runner` y agregado `vite.config.js` para evitar fallos EPERM en este entorno.
  - APK debug generado e instalado en emulador y movil via `adb`.
- Decisiones tomadas (IDs): `DEC-006` (vigente), ajustes de sesion sin nuevo ID formal.
- Archivos tocados:
  - `.gitignore`
  - `package.json`
  - `vite.config.js`
  - `src/config/gameConfig.js`
  - `src/config/mapLayout.js`
  - `src/main.js`
  - `src/scene/WorldScene.js`
  - `src/systems/PiruletaSystem.js`
  - `src/systems/RoverSystem.js`
  - `docs/SEGUIMIENTO.md`
- Estado de pruebas:
  - `npm run build` OK.
  - Validaciones Playwright en web sin errores de consola.
  - Instalacion Android en emulador OK.
  - Instalacion Android en movil OK (tras habilitar permisos del dispositivo).
- Bloqueos:
  - Restriccion temporal `INSTALL_FAILED_USER_RESTRICTED` en movil (resuelto al permitir instalacion por USB).
- Siguientes pasos:
  - Validar jugabilidad completa en movil real (controles tactiles + rendimiento).
  - Ajustar camara dentro de laderas pronunciadas si aparecen casos extremos.
