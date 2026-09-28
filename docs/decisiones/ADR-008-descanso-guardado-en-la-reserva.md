# ADR-008 · El fin del bloqueo (sesión + descanso) se guarda en cada reserva

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
Entre sesión y sesión hay un descanso configurable (`bufferMinutes`, 15 min por defecto, en `Settings`). La exclusion constraint de [ADR-004](ADR-004-bloqueo-temporal-y-exclusion-constraint.md) tiene que respetarlo, pero una constraint solo puede usar los datos de la propia fila: no puede leer `Settings`.

## Decisión
Al crear la reserva se calcula y se guarda **`blockedUntil = endsAt + bufferMinutes`** (el descanso vigente en ese momento). La constraint compara el rango `[startsAt, blockedUntil)`.

Ejemplo: sesión de 10:00 a 11:00 con 15 min de descanso → `blockedUntil = 11:15`. Nadie puede reservar antes de las 11:15, **ni siquiera si dos personas reservan horarios contiguos en el mismo instante**.

Si Micaela cambia el descanso, las reservas ya hechas conservan su `blockedUntil` y solo las nuevas usan el valor nuevo. Es el mismo criterio que `priceSnapshot`: lo acordado al reservar no cambia.

## Alternativas consideradas
- **Aplicar el descanso solo al calcular los horarios libres; la constraint protege solo la sesión (`[startsAt, endsAt)`):** más simple, sin campo extra. Sigue siendo imposible que dos personas tengan el mismo horario, pero si dos clientes reservan horarios **contiguos** en el mismo instante, las dos reservas se aceptan y quedan pegadas, sin descanso. Riesgo muy bajo y de consecuencia leve; se descartó porque el costo de evitarlo es un solo campo.
- **Guardar los minutos de descanso (`bufferMinutes`) en la reserva:** equivalente, pero la constraint y las consultas quedan más difíciles de leer.
- **Descanso fijo escrito en la constraint:** cambiarlo exigiría una migración; contradice [ADR-006](ADR-006-configuracion-desde-el-panel.md).

## Consecuencias
- ➕ El descanso queda garantizado por la base de datos, igual que la no superposición.
- ➕ Cambiar el descanso desde el panel no afecta a las reservas existentes.
- ➖ Un campo más en `Booking`, calculado por la API al reservar.
