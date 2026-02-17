# Mision del Juego

## Historia canon (v1)

- Piruleta, un gato siames muy curioso y travieso, mascota de Sergi, se cuela en una nave rumbo a Marte.
- En Marte, Piruleta deambula con escafandra y oxigeno limitado.
- Sergi ayuda desde la Tierra controlando un rover estilo NASA para mantener vivo a Piruleta.

## Mision principal

- Completar 3 misiones consecutivas para asegurar la supervivencia de Piruleta en Marte.

## Reglas globales de partida

- Tiempo maximo total de partida: `7:00` minutos.
- Oxigeno de Piruleta fuera del campamento: se vacia en `60s`.
- Oxigeno de Piruleta dentro del campamento: no baja.
- Bateria del rover:
  - Maximo: `100%`.
  - Consumo moviendose: `0.5%/s`.
  - Consumo quieto: `0.1%/s`.
  - Consumo por accion: `+2%` por uso.
  - Recarga en estacion: `+5%/s` (20s de 0 a 100).
- Estaciones de recarga en mapa: `3`.

## Misiones MVP

### Mision 1 - Oxigeno de emergencia

- Objetivo: recoger y entregar `3` botellas de oxigeno a Piruleta.
- Efecto por botella entregada: `+20s` de oxigeno equivalente.
- Exito: `3/3` entregadas.
- Falla: oxigeno en `0%` o tiempo total agotado.

### Mision 2 - Construir campamento

- Objetivo: recoger `6` materiales y entregarlos en la zona de campamento.
- Materiales: metal, lona, panel solar, filtro, agua, aislante.
- Exito: `6/6` entregados y campamento terminado.
- Regla importante: al finalizar esta mision, Piruleta queda dentro del campamento y deja de consumir oxigeno.

### Mision 3 - Suministro de comida

- Objetivo: entregar `3` paquetes de comida al campamento.
- Exito: `3/3` entregados antes del limite global de tiempo.
- Falla: tiempo total agotado.

## Criterios de calidad infantil

- Controles simples: joystick virtual + boton de accion.
- Objetivos claros con progreso visible.
- Dificultad media con tension constante, sin castigo extremo.
- Sin contenido agresivo.

## Definicion de exito (v1)

- Sergi entiende que hacer en menos de 30 segundos.
- Se completa una partida total antes de los `7:00` minutos.
- No hay bloqueos criticos de control o camara.
- Se genera una APK instalable para pruebas reales.
