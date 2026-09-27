# ADR-004 · Bloqueo temporal del horario + exclusion constraint en PostgreSQL

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
1. Mientras un cliente paga, nadie más debe poder tomar su horario.
2. Dos clientes pueden intentar reservar el mismo horario al mismo tiempo (*race condition*).

## Decisión
- Al elegir un horario se crea la reserva en estado **pendiente**, con `holdExpiresAt`: 10 min para MercadoPago y 2 h para transferencia, ambos configurables. Es el mismo patrón de Tickantel o RedTickets.
- Se garantiza que no haya superposición **a nivel de base de datos** con una **exclusion constraint** de PostgreSQL (`EXCLUDE USING gist` sobre `tstzrange`), aplicada solo a los estados que ocupan el horario.
- Las reservas pendientes vencidas se marcan `EXPIRED` en la misma transacción antes de insertar, y además con una tarea periódica.

Detalle: [05 · Flujo de reserva](../05-flujo-de-reserva.md).

## Alternativas consideradas
- **Solo validar en el código** ("consulto y después guardo"): vulnerable a *race conditions*.
- **Bloqueos en memoria o Redis:** agrega infraestructura y no sobrevive a un reinicio de la API.
- **Lock pesimista (`SELECT ... FOR UPDATE`)** sobre un "slot": requiere modelar los slots como filas, cuando son rangos calculados.

## Consecuencias
- ➕ La garantía la da la base de datos, así que es imposible guardar dos reservas superpuestas aunque haya un bug en la aplicación.
- ➖ Prisma no soporta exclusion constraints en el esquema: va en una **migración SQL manual** y requiere la extensión `btree_gist`.
