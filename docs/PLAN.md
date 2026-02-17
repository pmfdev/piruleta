# Plan de Trabajo

## Fase 0 - Descubrimiento

- Confirmado perfil del jugador (11 anos, gustos: Minecraft, espacio y Lego).
- Confirmada plataforma Android y requerimiento offline.
- Confirmado concepto: rover 3D en Marte.

## Fase 1 - Diseno del nucleo jugable

- Definida historia canon de Piruleta en Marte.
- Definida campana de 3 misiones (oxigeno, campamento, comida).
- Definido limite global de partida: `7:00` minutos.
- Definidas reglas globales de oxigeno y bateria.
- Definido layout inicial de mapa (POIs, estaciones, pickups).
- Definidas reglas de navegacion (pendiente y colisiones).

## Fase 2 - MVP tecnico

- Crear estructura base del proyecto.
- Configurar proyecto JS vainilla con Three.js.
- Implementar escena 3D de Marte (terreno base y puntos de interes).
- Implementar controlador del rover (movimiento + camara).
- Implementar controles tactiles (joystick + boton accion).
- Implementar sistema de objetivos y temporizador.
- Implementar menus en espanol (inicio, pausa, fin, configuracion).
- Integrar Capacitor y generar build Android inicial.

## Fase 2.1 - Calidad de arquitectura

- Aplicar patrones definidos en `docs/ARQUITECTURA.md`.
- Anotar comentarios de patron en puntos clave del codigo.
- Mantener documento vivo `docs/PATRONES_APLICADOS.md`.

## Fase 3 - Contenido y experiencia infantil

- Arte base (placeholders o sprites iniciales).
- Sonidos y musica suave.
- Ajuste de dificultad y ritmo.

## Fase 4 - Pruebas y pulido

- Corregir bugs.
- Revisar rendimiento.
- Prueba real con el jugador.
- Ajustes finales.

## Fase 5 - Entrega

- Generar APK jugable para compartir.
- Preparar build de tienda Android (AAB) si aplica.
- Documentar mejoras para v2.

## Registro de avance

- 2026-02-17: Se crea base documental del proyecto.
- 2026-02-17: Se cierra definicion funcional de juego movil 3D en Marte.
- 2026-02-17: Se cierra narrativa, misiones MVP, tiempos, bateria, mapa y arquitectura orientada a patrones.
