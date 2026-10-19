# CLAUDE.md

Contexto para asistentes de IA (Claude Code) que trabajen en este repo.

## Qué es
Sitio web + sistema de reservas para **SERENA · Masajes & Bienestar** (Montevideo), el emprendimiento de Micaela. Atiende sola, en su casa. Lo desarrolla su esposo como proyecto personal y de portfolio.

**Antes de proponer o cambiar algo, leer [`docs/`](docs/README.md).** Ahí están el análisis, los requerimientos, la arquitectura, el modelo de datos, los flujos y las decisiones (ADR). Lo pendiente está en [`docs/pendientes.md`](docs/pendientes.md).

## Estado
- ✅ Diseño y documentación (commit inicial).
- ✅ Esqueleto del monorepo con pnpm workspaces (ADR-007): `apps/web` (Next.js 16, App Router, Tailwind 4, puerto 3000) y `apps/api` (NestJS 12, ESM, Vitest, oxlint, puerto 3001). `pnpm dev` levanta ambas.
- ✅ PostgreSQL 18 local con Docker Compose (`compose.yaml`) y Prisma 7.10 (versión fijada: la etiqueta `latest` de `prisma` llegó a apuntar a una RC). Esquema de la fase 1 en `apps/api/prisma/schema.prisma`.
- ✅ Migración inicial (exclusion constraint + CHECK en SQL manual, probadas en vivo) y seed idempotente (Settings, primer admin desde `.env`, datos de prueba solo fuera de producción).
- ✅ Primer recorrido completo: `PrismaModule` global + `GET /services` en la API; la home de la web los muestra con la paleta y tipografías de la marca (colores aproximados).
- ✅ Front según los **diseños de Micaela**: home con dos caminos (primera vez / ya soy cliente), `/primera-vez`, `/masajes` y el flujo de reserva `/reservar` en pasos. Las políticas siguen siendo datos de demostración (`apps/web/src/lib/demo.ts`); la reserva todavía no se guarda. Hay preguntas abiertas de los diseños en `docs/pendientes.md`.
- ✅ `GET /settings/public` (seña, descuento, plazos, barrio y WhatsApp; nunca dirección ni datos bancarios): la web ya no usa constantes de demo para eso. El número de WhatsApp de Micaela se carga desde el panel (Configuración).
- ✅ Web responsive (celular y computadora). Formato del código con Prettier: `pnpm format` en `apps/web` y `apps/api`.
- ✅ **Panel de Micaela** en `/admin` (solo computadora, ADR-011): login con cookie `httpOnly` + tabla `AdminSession` (hash del token), límite de 5 intentos/min, proxy `/api/*` → API en `next.config.ts`; secciones servicios, horarios y bloqueos, configuración, clientes y mi cuenta. Endpoints `/admin/*` protegidos con `AdminGuard`; DTOs con `class-validator`. Falta la sección de reservas.
- ✅ Cliente reconocido por su **celular** (E.164, único); email opcional (ADR-012). Aviso a Micaela por **email con Resend** (`NotificationsService`, sin SDK); botón "Enviar mail de prueba" en Configuración. Sin `RESEND_API_KEY` el mail se escribe en la consola.
- ✅ **Horarios libres** (`GET /availability`, `GET /availability/days`, ADR-013): cálculo en hora de Montevideo (`common/time.ts`), funciones puras con tests en `availability/slots.ts`. El flujo de reserva ya los usa; la reserva todavía no se guarda.
- ⏭️ Próximo paso: el primer ítem sin tachar de la **hoja de ruta** en `docs/pendientes.md` (hoy: crear reserva). Ahí también está cómo levantar el entorno.
- Pendientes de explicar al desarrollador: hosting y webhooks. Decisión abierta: pago de MercadoPago que llega tarde (ver `docs/pendientes.md`).
- Next.js 16 tiene cambios respecto de versiones anteriores: leer `apps/web/AGENTS.md` antes de tocar la web.

## Decisiones clave (resumen; el detalle está en `docs/decisiones/`)
- Next.js (web) + NestJS (API) separados, en monorepo; PostgreSQL (Neon) + Prisma.
- Agenda **propia**, con bloqueo temporal del horario mientras se paga (10 min MercadoPago, 2 h transferencia) y **exclusion constraint** en PostgreSQL contra la superposición.
- Seña del 50%: MercadoPago (webhook **siempre verificado** contra la API de MP) o transferencia con descuento (confirmación manual al ver la plata en el banco).
- El cliente elige pagar la **seña** (no se devuelve; con 12 h de aviso pasa al turno reprogramado) o el **total** (ADR-010). Comprobante de transferencia: botón de WhatsApp con mensaje armado; referencia = nombre.
- Clientes nuevos reservan solo el **Encuentro inicial** (`isFirstVisit`); el masaje lo define Micaela en la entrevista.
- Todo lo operativo (horarios, precios, seña, políticas, anticipación) se **configura desde el panel**, con valores por defecto vía seed.
- Hosting gratuito en la nube; la PC de casa solo como staging.

## Convenciones
- **Documentación en español; código, identificadores y commits en inglés.**
- **El repo es público:** nunca poner en el código la dirección, los datos bancarios, el teléfono ni los precios reales (van en la base de datos), ni secretos (van en `.env`).
- Las decisiones nuevas o los cambios de decisión se registran como ADR nueva en `docs/decisiones/`.
- Datos del cliente al reservar: nombre, fecha de nacimiento, celular, email opcional, servicio y motivo de consulta opcional (dato de salud: Ley 18.331, requiere consentimiento y solo es visible en el panel). Sin registro ni contraseña: el cliente se reconoce por su **celular** en E.164 (ADR-009, ADR-012). En la fase 1 no se mandan emails a clientes: Micaela confirma por WhatsApp con el botón del panel.
- Nombres de tablas y campos en inglés; el glosario en español está en `docs/04-modelo-de-datos.md`.

## Cómo trabajar con el desarrollador
- Quiere **aprender** y tener control del código. No hay apuro.
- En el **diseño**, explicar los conceptos y las alternativas y dejar que decida.
- En la **implementación**, ejecutar directo, explicando lo no obvio.
- Mantener `docs/` actualizada a medida que cambian las cosas.
