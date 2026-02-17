# Decisiones del Proyecto

Formato de registro:

- Fecha: YYYY-MM-DD
- ID: DEC-XXX
- Decision:
- Motivo:
- Impacto:
- Estado: propuesta | aceptada | descartada

---

- Fecha: 2026-02-17
- ID: DEC-001
- Decision: Empezar por planificacion y base documental antes de programar.
- Motivo: Reducir retrabajo y alinear objetivos del juego infantil.
- Impacto: Facilita priorizacion, arquitectura y trazabilidad de cambios.
- Estado: aceptada

- Fecha: 2026-02-17
- ID: DEC-002
- Decision: Trabajar en rama `develop` para el arranque del proyecto.
- Motivo: Separar trabajo inicial de una futura rama principal estable.
- Impacto: Permite flujo de integracion controlado.
- Estado: aceptada

- Fecha: 2026-02-17
- ID: DEC-003
- Decision: Cerrar alcance del juego como experiencia 3D para Android con partidas de 3 a 5 minutos.
- Motivo: Ya se definio edad, plataforma, control, tema y requisitos de uso.
- Impacto: Permite pasar de planificacion a arquitectura e implementacion.
- Estado: aceptada

- Fecha: 2026-02-17
- ID: DEC-004
- Decision: Elegir Godot 4 como stack principal para el MVP.
- Motivo: Objetivo de APK Android offline con mundo 3D, joystick virtual y boton de accion.
- Impacto: Se orientan estructura de proyecto, tareas y pipeline de builds a Godot.
- Estado: descartada

- Fecha: 2026-02-17
- ID: DEC-005
- Decision: No usar por ahora la skill `develop-web-game`.
- Motivo: La skill esta orientada a juego web y en ese momento se eligio enfoque Godot.
- Impacto: Se priorizo temporalmente flujo de motor de juego.
- Estado: descartada

- Fecha: 2026-02-17
- ID: DEC-006
- Decision: Cambiar el stack principal a `JavaScript + Three.js + Capacitor`.
- Motivo: Prioridad explicita del proyecto por stack JS y salida a Android en APK.
- Impacto: La implementacion se hara como juego web 3D empaquetado para Android.
- Estado: aceptada

- Fecha: 2026-02-17
- ID: DEC-007
- Decision: Congelar temporalmente implementacion para cerrar diseno funcional completo antes de codificar.
- Motivo: Priorizar claridad de misiones, reglas y arquitectura para evitar retrabajo.
- Impacto: Se completa especificacion del MVP y se reduce riesgo tecnico al iniciar desarrollo.
- Estado: aceptada

- Fecha: 2026-02-17
- ID: DEC-008
- Decision: Definir partida total con limite global de `7:00` minutos y mecanica dual de recursos (oxigeno + bateria).
- Motivo: Mantener tension jugable con reglas simples para edad objetivo.
- Impacto: Guia directa para balance, UI y criterio de derrota.
- Estado: aceptada

- Fecha: 2026-02-17
- ID: DEC-009
- Decision: Adoptar arquitectura por sistemas con patrones explicitos (`State`, `Observer`, `Strategy`, `Factory`, `Command`, `Facade`, `Template Method`, `Repository` ligero).
- Motivo: Mejorar escalabilidad, mantenibilidad y valor pedagogico del codigo.
- Impacto: Estructura modular desde el MVP y documentacion de patrones aplicada por archivo.
- Estado: aceptada
