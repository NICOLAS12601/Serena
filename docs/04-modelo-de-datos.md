# 04 · Modelo de datos (borrador)

> Primer borrador conceptual. Los nombres definitivos (en inglés) se fijan en el esquema de Prisma.

## Entidades

```
Service         name, description, durationMin, price, imageUrl, active, sortOrder
                → los servicios que ofrece (terapéutico, relajante, piedras calientes...)

WeeklySchedule  weekday, startTime, endTime
                → su horario habitual. Puede haber varias franjas por día (ej. 9–13 y 15–19)

TimeOff         from, to, reason
                → días u horas bloqueados (vacaciones, feriados, trámites)

Client          name, age, phone, email
                → quien reserva. Se reutiliza si vuelve con el mismo email/teléfono

Booking         client, service, startsAt, endsAt, status, reason (motivo de consulta),
                paymentMethod, priceSnapshot, depositAmount, holdExpiresAt, createdAt
                → la reserva (el turno)

Payment         booking, method, amount, status, mercadoPagoPaymentId, verifiedBy, verifiedAt
                → cada pago asociado a una reserva

Settings        depositPercent, transferDiscountPercent, mpHoldMinutes, transferHoldHours,
                bufferMinutes, minAdvanceHours, maxAdvanceDays, bankDetails,
                cancellationPolicyText, ...
                → una sola fila con la configuración editable desde el panel

AdminUser       email, passwordHash
                → acceso al panel (por ahora solo Micaela)
```

## Estados de una reserva (`Booking.status`)

```
                    ┌──────────── (no paga a tiempo) ────────────► EXPIRED
                    │
  [MercadoPago] ─► PENDING_PAYMENT ── (MP confirma pago) ──┐
                                                           ├─► CONFIRMED ─┬─► COMPLETED
  [Transferencia] ─► PENDING_VERIFICATION ── (Micaela ─────┘              ├─► NO_SHOW
                    │                        verifica)                    └─► CANCELLED
                    └──────────── (no se verifica a tiempo) ─────────► EXPIRED
```

| Estado | ¿Ocupa el horario? | Significado |
|---|---|---|
| `PENDING_PAYMENT` | ✅ (hasta `holdExpiresAt`) | Eligió horario, está pagando en MercadoPago |
| `PENDING_VERIFICATION` | ✅ (hasta `holdExpiresAt`) | Eligió transferencia; falta que Micaela vea la plata |
| `CONFIRMED` | ✅ | Seña cobrada. Se le envió la dirección |
| `COMPLETED` | — | La sesión se realizó |
| `NO_SHOW` | — | No se presentó |
| `CANCELLED` | ❌ | Cancelada (por el cliente o por Micaela) |
| `EXPIRED` | ❌ | Venció el bloqueo sin pago; el horario se liberó |

## Decisiones de diseño a notar

- **`priceSnapshot` y `depositAmount` se copian al momento de reservar.** Si Micaela cambia los precios, las reservas ya hechas no se alteran.
- **`endsAt` = `startsAt` + duración del servicio.** El descanso entre sesiones (`bufferMinutes`) se aplica al calcular los horarios libres y en la restricción anti-superposición (ver [05](05-flujo-de-reserva.md)).
- **`Settings` es una tabla de una sola fila** en vez de constantes en el código, así todo lo operativo se edita desde el panel sin volver a desplegar.
- `reason` (motivo de consulta) es un **dato de salud**: acceso restringido al panel y nunca se expone en APIs públicas.
