# Decisiones de arquitectura (ADR)

Cada archivo registra **una** decisión: el contexto, qué se decidió, qué alternativas se descartaron y sus consecuencias. Las ADR no se editan para cambiar la decisión: si cambia, se escribe una nueva y la vieja se marca como *Reemplazada por ADR-XXX*.

| ADR | Decisión | Estado |
|---|---|---|
| [001](ADR-001-nextjs-y-nestjs-separados.md) | Next.js (web) + NestJS (API) separados, en un monorepo | Aceptada |
| [002](ADR-002-agenda-propia.md) | Agenda de reservas propia en vez de Calendly/Cal.com | Aceptada |
| [003](ADR-003-hosting-nube-y-pc-de-casa.md) | Producción en la nube gratuita; PC de casa solo como staging | Aceptada |
| [004](ADR-004-bloqueo-temporal-y-exclusion-constraint.md) | Bloqueo temporal del horario + exclusion constraint en PostgreSQL | Aceptada |
| [005](ADR-005-pagos-mercadopago-y-transferencia.md) | Seña por MercadoPago (automático) o transferencia (manual, con descuento) | Aceptada |
| [006](ADR-006-configuracion-desde-el-panel.md) | Todo lo operativo, configurable desde el panel | Aceptada |

## Plantilla

```markdown
# ADR-XXX · Título

- **Estado:** Propuesta | Aceptada | Reemplazada por ADR-YYY
- **Fecha:** AAAA-MM-DD

## Contexto
## Decisión
## Alternativas consideradas
## Consecuencias
```
