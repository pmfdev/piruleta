# Arquitectura

## Estado actual

- Arquitectura pendiente de seleccion de stack.

## Opciones candidatas

1. Web (HTML/CSS/JS)
- Ventajas: arranque rapido, facil despliegue, sin instalacion compleja.
- Riesgos: manejo manual de fisicas/escenas si crece el alcance.

2. Godot
- Ventajas: buen motor 2D, flujo rapido para juegos pequenos.
- Riesgos: requiere toolchain y exportacion segun plataforma.

3. Unity
- Ventajas: ecosistema amplio y escalable.
- Riesgos: mayor complejidad para un MVP pequeno.

## Recomendacion inicial

- Empezar con opcion Web para entregar un MVP rapido.

## Arquitectura objetivo (si se elige Web)

- `src/`: logica del juego.
- `assets/`: imagenes, audio, fuentes.
- `docs/`: documentacion del proyecto.
- `tests/` (opcional inicial): pruebas de logica pura.

## Principios tecnicos

- Simplicidad primero.
- Iteraciones cortas.
- Todo cambio importante documentado en `docs/DECISIONES.md`.
