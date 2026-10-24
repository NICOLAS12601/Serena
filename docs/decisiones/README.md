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
| [007](ADR-007-pnpm-workspaces.md) | pnpm workspaces como gestor del monorepo | Aceptada |
| [008](ADR-008-descanso-guardado-en-la-reserva.md) | El fin del bloqueo (sesión + descanso) se guarda en cada reserva | Aceptada |
| [009](ADR-009-reserva-sin-cuenta.md) | Reservar sin contraseña; "Mis reservas" con código por email (fase 2) | Reemplazada en parte por ADR-012 |
| [010](ADR-010-pago-de-sena-o-total.md) | El cliente elige pagar la seña o el total; comprobante de transferencia por WhatsApp | Aceptada |
| [011](ADR-011-panel-de-administracion.md) | Panel de administración: sesión con cookie segura, solo computadora y aviso por WhatsApp con un botón | Aceptada |
| [012](ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md) | El cliente se reconoce por su celular; email opcional; confirmación manual por WhatsApp | Aceptada |
| [013](ADR-013-calculo-de-horarios-libres.md) | Horarios libres: descanso solo entre reservas, intervalo configurable desde el inicio de cada franja | Aceptada |
| [014](ADR-014-comprobante-de-transferencia.md) | Con el comprobante de transferencia, el turno queda guardado hasta que se acredite | Aceptada |
| [015](ADR-015-dominio-uy-y-dns-en-cloudflare.md) | Dominio `serenabienestar.uy` en HostingenlaWeb, con el DNS en Cloudflare (gratis) | Aceptada |

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
