# 05 · Flujo de reserva

## Flujo desde el cliente

1. Elige un **servicio**.
2. Ve un calendario con los **horarios libres** (calculados por la API).
3. Elige horario y completa sus **datos**.
4. Elige **medio de pago**: MercadoPago o transferencia (esta última muestra el precio con descuento).
5. Se crea la reserva **bloqueando el horario** temporalmente.
6. Paga, y cuando el pago se confirma recibe un **email con la confirmación y la dirección**.

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
→ email + dirección y el horario se libera     (alerta a Micaela)
```

Para **transferencia** el flujo es el mismo, con dos diferencias: el estado es `PENDING_VERIFICATION` y el bloqueo dura más (2 h por defecto), porque la confirmación es manual. Ver [06](06-pagos-y-seguridad.md#transferencia-bancaria).

Los tiempos de bloqueo son configurables en `Settings`.

## Cálculo de horarios libres

Para un día y un servicio (duración `D`):

1. Tomar las franjas de `WeeklySchedule` de ese día de la semana.
2. Restar los `TimeOff` que caen ese día.
3. Restar las reservas que **ocupan el horario** (confirmadas, o pendientes con bloqueo vigente), cada una extendida con el descanso (`bufferMinutes`).
4. Generar los inicios posibles (ej. cada 15 o 30 min) donde entren `D` minutos.
5. Descartar los que no cumplan la anticipación mínima o superen la ventana máxima.

## El problema de concurrencia (dos personas, mismo horario, mismo segundo)

**Lo ingenuo:** "consulto si está libre → si está libre, guardo la reserva". Entre la consulta y el guardado puede colarse otra persona, y quedan **dos reservas superpuestas**. Esto se llama *race condition*.

**La solución: que la base de datos lo haga imposible.** PostgreSQL tiene las **exclusion constraints**: una regla que impide guardar dos filas cuyos rangos de tiempo se superpongan. Conceptualmente:

```sql
-- Requiere la extensión btree_gist
ALTER TABLE booking ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    tstzrange(starts_at, ends_at + buffer, '[)') WITH &&
  )
  WHERE (status IN ('PENDING_PAYMENT', 'PENDING_VERIFICATION', 'CONFIRMED'));
```

Si dos pedidos llegan a la vez, **uno se guarda y el otro falla**. La API atrapa ese error y le responde al cliente: *"Ese horario se acaba de ocupar, elegí otro"*.

**Detalle importante:** la condición `WHERE` no puede depender de la hora actual. Entonces una reserva pendiente **vencida** seguiría "ocupando" el lugar hasta que su estado cambie a `EXPIRED`. Lo resolvemos así:
- **Antes de crear una reserva**, dentro de la misma transacción, se marcan como `EXPIRED` las pendientes vencidas que se superponen.
- Además, una **tarea periódica** (cada minuto) expira las pendientes vencidas, para mantener la tabla prolija.

(Ver [ADR-004](decisiones/ADR-004-bloqueo-temporal-y-exclusion-constraint.md). La sintaxis exacta con Prisma se resuelve en la implementación: Prisma no soporta exclusion constraints en el esquema, así que va en una migración SQL manual.)
