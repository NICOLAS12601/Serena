# ADR-002 · Agenda de reservas propia

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
La reserva online es la funcionalidad central y el principal diferencial frente a la competencia local (ver [análisis de mercado](../01-analisis-mercado.md)). Se requiere seña, pago por transferencia con descuento y reglas propias (descanso entre sesiones, anticipación, bloqueo temporal).

## Decisión
Construir la agenda **propia** (API + base de datos). La sincronización con Google Calendar queda como opcional en la fase 2, según si Micaela la quiere para no olvidarse de los turnos.

## Alternativas consideradas
- **Calendly / Cal.com / Setmore embebidos:** mucho más rápido y con recordatorios incluidos, pero dependen de un tercero, se personalizan poco, soportan mal los pagos locales y la transferencia con verificación manual, y aportan poco aprendizaje.

## Consecuencias
- ➕ Control total del flujo, la marca y las reglas.
- ➖ Hay que resolver concurrencia, emails y el panel (ver ADR-004).
