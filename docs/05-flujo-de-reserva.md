# 05 · Flujo de reserva

## Flujo desde el cliente

1. Elige un **servicio**.
2. Ve un calendario con los **horarios libres** (calculados por la API).
3. Elige horario y completa sus **datos**.
4. Elige **medio de pago**: MercadoPago o transferencia (esta última muestra el precio con descuento).
5. Se crea la reserva **bloqueando el horario** temporalmente.
6. Paga. Cuando el pago se confirma, Micaela le escribe **por WhatsApp** con la confirmación y la dirección, desde el botón del panel ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).

## Bloqueo temporal (patrón "venta de entradas")

Igual que Tickantel o RedTickets: mientras alguien está pagando, ese horario **no se le ofrece a nadie más**.

```
Cliente elige servicio + día + hora
        │
        ▼
Se crea Booking con status = PENDING_PAYMENT, holdExpiresAt = ahora + 10 min
(ese horario deja de aparecer libre)
        │
        ▼
Redirección a MercadoPago (la preferencia de pago también vence a los 10 min)
        │
   ┌────┴─────────────────┬──────────────────────────┐
   ▼                      ▼                          ▼
Paga a tiempo       No paga / cierra           Paga tarde (raro)
MP avisa (webhook)  Pasado holdExpiresAt,      Si el horario sigue libre → se confirma.
→ CONFIRMED         la reserva pasa a EXPIRED  Si no → se devuelve el dinero
→ aviso a Micaela    y el horario se libera     (alerta a Micaela)
```

Para **transferencia** el flujo es el mismo, con dos diferencias: el estado es `PENDING_VERIFICATION` y el bloqueo dura más (2 h por defecto), porque la confirmación es manual. Ver [06](06-pagos-y-seguridad.md#transferencia-bancaria).

Los tiempos de bloqueo son configurables en `Settings`.

## Cálculo de horarios libres

Lo hace la API (`apps/api/src/availability/`), siempre en hora de **Montevideo** ([ADR-013](decisiones/ADR-013-calculo-de-horarios-libres.md)):
- `GET /availability/days?serviceId&month=AAAA-MM` → los días del mes con al menos un horario libre (el calendario).
- `GET /availability?serviceId&date=AAAA-MM-DD` → los inicios de ese día, libres y ocupados (los ocupados se muestran tachados).

Para un día y un servicio (duración `D`):

1. Si el día ya pasó o supera la **ventana máxima** (`maxAdvanceDays`), no hay horarios.
2. Tomar las franjas de `WeeklySchedule` de ese día de la semana.
3. Generar inicios cada **`slotIntervalMinutes`** (30 por defecto) **desde el comienzo de cada franja**, mientras la sesión (`D` minutos) termine dentro de la franja.
4. Un inicio está **ocupado** si:
   - la sesión se superpone con un **bloqueo** (`TimeOff`);
   - la sesión **más el descanso** (`bufferMinutes`) se superpone con una reserva que **ocupa el horario** (confirmada, o pendiente con bloqueo vigente), cada una desde `startsAt` hasta `blockedUntil`. Es la misma regla que la exclusion constraint;
   - empieza antes de la **anticipación mínima** (`minAdvanceHours`).

El descanso **solo importa entre reservas**: la última sesión de una franja puede terminar justo al cierre.

### Ejemplo (está como test en `apps/api/src/availability/slots.spec.ts`)
Jueves de 09:00 a 13:00 y de 15:00 a 19:00, un bloqueo de 17:00 a 19:00, una reserva a las 10:00 de 60 min (ocupa hasta 11:15 con el descanso), masaje de 60 min, descanso de 15 e intervalo de 30:

| Inicio | ¿Libre? | Por qué |
|---|---|---|
| 09:00, 09:30 | No | Con el descanso, se pisa con la reserva de las 10:00 |
| 10:00, 10:30, 11:00 | No | Se pisan con la reserva (que ocupa hasta 11:15) |
| 11:30, 12:00 | **Sí** | La de 12:00 termina 13:00, justo al cierre de la franja |
| 15:00, 15:30, 16:00 | **Sí** | La de 16:00 termina 17:00, justo cuando empieza el bloqueo |
| 16:30, 17:00, 17:30, 18:00 | No | Se pisan con el bloqueo |

## El problema de concurrencia (dos personas, mismo horario, mismo segundo)

**Lo ingenuo:** "consulto si está libre → si está libre, guardo la reserva". Entre la consulta y el guardado puede colarse otra persona, y quedan **dos reservas superpuestas**. Esto se llama *race condition*.

**La solución: que la base de datos lo haga imposible.** PostgreSQL tiene las **exclusion constraints**: una regla que impide guardar dos filas cuyos rangos de tiempo se superpongan. Conceptualmente:

```sql
-- GiST compara rangos de forma nativa: no hace falta ninguna extensión
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_overlap"
  EXCLUDE USING gist (
    tstzrange("startsAt", "blockedUntil", '[)') WITH &&
  )
  WHERE ("status" NOT IN ('CANCELLED', 'EXPIRED'));
```

`blockedUntil` es el fin de la sesión más el descanso, calculado y guardado al reservar. Así la base también garantiza el descanso, incluso si dos personas reservan horarios contiguos en el mismo instante ([ADR-008](decisiones/ADR-008-descanso-guardado-en-la-reserva.md)).

Si dos pedidos llegan a la vez, **uno se guarda y el otro falla**. La API atrapa ese error y le responde al cliente: *"Ese horario se acaba de ocupar, elegí otro"*.

**Detalle importante:** la condición `WHERE` no puede depender de la hora actual. Entonces una reserva pendiente **vencida** seguiría "ocupando" el lugar hasta que su estado cambie a `EXPIRED`. Lo resolvemos así:
- **Antes de crear una reserva**, dentro de la misma transacción, se marcan como `EXPIRED` las pendientes vencidas que se superponen.
- Además, una **tarea periódica** (cada minuto) expira las pendientes vencidas, para mantener la tabla prolija.

(Ver [ADR-004](decisiones/ADR-004-bloqueo-temporal-y-exclusion-constraint.md). Prisma no soporta exclusion constraints en el esquema, así que la regla está escrita a mano al final de la primera migración, `apps/api/prisma/migrations/20261012214526_init/migration.sql`, junto con los controles de valores (`CHECK`). Se probó en vivo: con dos reservas simultáneas al mismo horario, la segunda espera a que la primera termine y es rechazada.)
