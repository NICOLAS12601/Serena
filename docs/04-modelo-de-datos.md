# 04 · Modelo de datos

> Los nombres de tablas y campos están en **inglés** (son código); el [glosario](#glosario) al final da su equivalente en español. La definición exacta vive en [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).

## Tablas y relaciones

```
  ┌──────────┐                ┌──────────┐
  │  Client  │                │ Service  │
  └────┬─────┘                └────┬─────┘
       │ 1                         │ 1
       │                           │
       │ N    ┌──────────────┐   N │
       └─────►│   Booking    │◄────┘
              └──────┬───────┘
                     │ 1
                     │
                     │ N
              ┌──────▼───────┐
              │   Payment    │
              └──────────────┘

  Sueltas (sin relaciones):  WeeklySchedule · TimeOff · Settings · AdminUser
```

- Un **cliente** tiene muchas reservas; cada reserva es de un solo cliente (`Booking.clientId`). En la fase 2 también tiene muchos códigos de acceso (`ClientLoginCode.clientId`).
- Un **servicio** aparece en muchas reservas; cada reserva es de un solo servicio (`Booking.serviceId`).
- Una **reserva** puede tener varios pagos (la seña, un reintegro...); cada pago es de una sola reserva (`Payment.bookingId`).
- Las tablas sueltas no apuntan a otras: el horario semanal, los bloqueos y la configuración se consultan al calcular horarios libres; `AdminUser` es el acceso de Micaela al panel.

## Entidades

```
Service         name, description, durationMin, price, imageUrl, icon, isFirstVisit, active, sortOrder
                → los servicios que ofrece (encuentro inicial, relajante, descontracturante,
                  drenaje linfático, maderoterapia...)

WeeklySchedule  weekday, startMinutes, endMinutes (minutos desde medianoche: 540 = 09:00)
                → su horario habitual. Puede haber varias franjas por día (ej. 9–13 y 15–19)

TimeOff         startsAt, endsAt, reason
                → días u horas bloqueados (vacaciones, feriados, trámites)

Client          name, phone (único, E.164), email (opcional, único), birthDate
                → quien reserva. Sin contraseña: se reconoce por su celular (ADR-012)

ClientLoginCode client, codeHash, expiresAt, usedAt                                    (fase 2)
                → códigos de 6 dígitos para entrar a "Mis reservas". Vencen a los 10 min,
                  se usan una sola vez y se guardan hasheados

Booking         client, service, startsAt, endsAt, blockedUntil, status, paymentMethod,
                paymentPlan (DEPOSIT | FULL), priceSnapshot, depositAmount, holdExpiresAt, reason (motivo de consulta),
                privacyConsentAt, manageTokenHash, createdAt
                → la reserva (el turno)

Payment         booking, amount, status, mercadoPagoPaymentId (único), verifiedAt
                → cada pago asociado a una reserva. El medio de pago está en Booking

Settings        depositPercent, transferDiscountPercent, mpHoldMinutes, transferHoldHours,
                bufferMinutes, slotIntervalMinutes, minAdvanceHours, maxAdvanceDays, bankDetails,
                address (solo se envía en el WhatsApp de confirmación), neighborhood (barrio, público),
                whatsappNumber (botón de comprobante y de contacto),
                notificationEmail (donde le llega a Micaela el aviso de cada reserva),
                cancellationPolicyText
                → una sola fila con la configuración editable desde el panel

AdminUser       email (único), passwordHash
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
| `COMPLETED` | ✅ (ya pasó, pero el horario sigue ocupado) | La sesión se realizó |
| `NO_SHOW` | ✅ (ídem) | No se presentó |
| `CANCELLED` | ❌ | Cancelada (por el cliente o por Micaela) |
| `EXPIRED` | ❌ | Venció el bloqueo sin pago; el horario se liberó |

## Decisiones de diseño a notar

- **`priceSnapshot` y `depositAmount` se copian al momento de reservar.** Si Micaela cambia los precios, las reservas ya hechas no se alteran. `priceSnapshot` ya incluye el descuento por transferencia.
- **`paymentPlan`** dice si el cliente pagó por adelantado la **seña** o el **total**. `depositAmount` es siempre la seña: la parte que no se devuelve ([ADR-010](decisiones/ADR-010-pago-de-sena-o-total.md)).
- **`endsAt` = `startsAt` + duración del servicio**, y **`blockedUntil` = `endsAt` + descanso** (`bufferMinutes` vigente al reservar). La restricción anti-superposición usa `[startsAt, blockedUntil)`, así el descanso también lo garantiza la base de datos (ver [05](05-flujo-de-reserva.md) y [ADR-008](decisiones/ADR-008-descanso-guardado-en-la-reserva.md)).
- **`Settings` es una tabla de una sola fila** en vez de constantes en el código, así todo lo operativo se edita desde el panel sin volver a desplegar.
- `reason` (motivo de consulta) es un **dato de salud**: acceso restringido al panel y nunca se expone en APIs públicas.
- **Fecha de nacimiento, no edad** (`Client.birthDate`): la edad cambia con el tiempo y quedaría desactualizada; se calcula cuando hace falta.
- **El medio de pago se guarda una sola vez**, en `Booking.paymentMethod` (define el estado inicial y el tiempo de bloqueo). `Payment` no lo repite, para que no puedan contradecirse.
- **`privacyConsentAt`** registra cuándo el cliente aceptó la política de privacidad (Ley 18.331).
- **`manageTokenHash`** es el hash del secreto del link personal para ver o cancelar la reserva sin cuenta ([ADR-009](decisiones/ADR-009-reserva-sin-cuenta.md)).

## Normalización

El modelo está en **tercera forma normal**: cada dato vive en un solo lugar (el teléfono en `Client`, la duración en `Service`) y las demás tablas lo referencian por su id. Las excepciones son intencionales: `priceSnapshot`, `depositAmount`, `endsAt` y `blockedUntil` no son copias del precio, la duración o el descanso actuales, sino **lo que se acordó al reservar**, que no debe cambiar si Micaela modifica la configuración.

## Glosario

| Inglés | Español |
|---|---|
| `Service` | Servicio |
| `WeeklySchedule` | Horario semanal |
| `TimeOff` | Bloqueo / día no disponible |
| `Client` | Cliente |
| `ClientLoginCode` | Código de acceso a "Mis reservas" |
| `Booking` | Reserva (turno) |
| `Payment` | Pago |
| `Settings` | Configuración |
| `AdminUser` | Usuario administrador |
| `startsAt` / `endsAt` | Empieza / termina |
| `blockedUntil` | Ocupa el horario hasta (fin + descanso) |
| `holdExpiresAt` | Vence el bloqueo temporal |
| `priceSnapshot` | Precio acordado al reservar |
| `depositAmount` | Monto de la seña (no se devuelve) |
| `paymentPlan` | Qué pagó por adelantado: seña (`DEPOSIT`) o total (`FULL`) |
| `whatsappNumber` | Número de WhatsApp de Micaela |
| `notificationEmail` | Email de Micaela para los avisos de reservas nuevas |
| `reason` | Motivo de consulta |
| `birthDate` | Fecha de nacimiento |
| `privacyConsentAt` | Fecha de aceptación de la política de privacidad |
| `manageTokenHash` | Hash de la clave del link para gestionar la reserva |
| `startMinutes` / `endMinutes` | Hora de inicio / fin, en minutos desde medianoche |
| `durationMin` | Duración en minutos |
| `sortOrder` | Orden en que se muestra |
| `icon` | Ícono del servicio (lotus, leaf, waves, wood-roller) |
| `isFirstVisit` | Es el "Encuentro inicial" para clientes nuevos |
| `weekday` | Día de la semana |
| `bufferMinutes` | Descanso entre sesiones (min) |
| `slotIntervalMinutes` | Cada cuántos minutos se ofrecen horarios ([ADR-013](decisiones/ADR-013-calculo-de-horarios-libres.md)) |
| `status` | Estado |
