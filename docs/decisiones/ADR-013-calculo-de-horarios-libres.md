# ADR-013 · Cálculo de horarios libres: descanso solo entre reservas e intervalo configurable

- **Estado:** Aceptada
- **Fecha:** 2026-10-18

## Contexto
Para mostrar los horarios libres hay que decidir dos cosas que el modelo de datos no resuelve:
1. Si el **descanso** después de una sesión ([ADR-008](ADR-008-descanso-guardado-en-la-reserva.md)) tiene que entrar dentro de la franja de atención o solo importa entre dos reservas.
2. **Cada cuánto** se ofrecen inicios de sesión.

## Decisión
- **El descanso solo se respeta entre reservas.** La última sesión de una franja puede terminar justo a la hora de cierre, y una sesión puede terminar justo cuando empieza un bloqueo (`TimeOff`). Entre dos reservas rige la misma regla que la base: `[startsAt, blockedUntil)` no se puede superponer.
- **Los inicios se ofrecen cada `Settings.slotIntervalMinutes`** (30 por defecto, entre 5 y 120), contados **desde el comienzo de cada franja**: con una franja de 08:30 a 12:00 y 30 min, se ofrece 08:30, 09:00, 09:30…
- El descanso (`bufferMinutes`) y el intervalo **se configuran en el panel**.
- Se devuelven también los inicios **ocupados**, para que el sitio los muestre tachados.
- Todo se calcula en hora de **Montevideo** (`America/Montevideo`), aunque el servidor esté en otra zona.

## Alternativas consideradas
- **El descanso tiene que entrar en la franja:** más simple de explicar, pero Micaela pierde el último turno de cada franja por un descanso que no necesita.
- **Inicios alineados al reloj** (siempre en :00 y :30): si una franja empieza 08:45, el primer turno sería 09:00 y se perderían 15 min. Contar desde el inicio de la franja respeta lo que cargó Micaela.
- **Inicios justo al terminar cada reserva** (sin grilla): aprovecha cada minuto, pero los horarios quedan desprolijos (11:15, 12:30, 13:45) y cambian con cada reserva.

## Consecuencias
- ➕ Micaela controla el descanso y la grilla desde el panel, sin tocar código.
- ➕ El cálculo usa la misma regla que la exclusion constraint, así que lo que se ofrece es lo que la base acepta.
- ➖ Con una grilla de 30 min y sesiones de 90, pueden quedar huecos cortos sin usar después de una reserva. Si molesta, se baja el intervalo a 15.
