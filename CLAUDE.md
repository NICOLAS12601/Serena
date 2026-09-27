# CLAUDE.md

Contexto para asistentes de IA (Claude Code) que trabajen en este repo.

## Qué es
Sitio web + sistema de reservas para **SERENA · Masajes & Bienestar** (Montevideo), el emprendimiento de Micaela. Atiende sola, en su casa. Lo desarrolla su esposo como proyecto personal y de portfolio.

**Antes de proponer o cambiar algo, leer [`docs/`](docs/README.md).** Ahí están el análisis, los requerimientos, la arquitectura, el modelo de datos, los flujos y las decisiones (ADR). Lo pendiente está en [`docs/pendientes.md`](docs/pendientes.md).

## Estado
- ✅ Diseño y documentación (commit inicial).
- ⏭️ Próximo paso: esqueleto del monorepo (`apps/web` con Next.js, `apps/api` con NestJS), `.gitattributes` para normalizar los saltos de línea y `.env.example`.

## Decisiones clave (resumen; el detalle está en `docs/decisiones/`)
- Next.js (web) + NestJS (API) separados, en monorepo; PostgreSQL (Neon) + Prisma.
- Agenda **propia**, con bloqueo temporal del horario mientras se paga (10 min MercadoPago, 2 h transferencia) y **exclusion constraint** en PostgreSQL contra la superposición.
- Seña del 50%: MercadoPago (webhook **siempre verificado** contra la API de MP) o transferencia con descuento (confirmación manual al ver la plata en el banco).
- Todo lo operativo (horarios, precios, seña, políticas, anticipación) se **configura desde el panel**, con valores por defecto vía seed.
- Hosting gratuito en la nube; la PC de casa solo como staging.

## Convenciones
- **Documentación en español; código, identificadores y commits en inglés.**
- **El repo es público:** nunca poner en el código la dirección, los datos bancarios, el teléfono ni los precios reales (van en la base de datos), ni secretos (van en `.env`).
- Las decisiones nuevas o los cambios de decisión se registran como ADR nueva en `docs/decisiones/`.
- Datos del cliente al reservar: nombre, edad, teléfono, email, servicio y motivo de consulta (dato de salud: Ley 18.331, requiere consentimiento y solo es visible en el panel).

## Cómo trabajar con el desarrollador
- Quiere **aprender** y tener control del código. No hay apuro.
- En el **diseño**, explicar los conceptos y las alternativas y dejar que decida.
- En la **implementación**, ejecutar directo, explicando lo no obvio.
- Mantener `docs/` actualizada a medida que cambian las cosas.
