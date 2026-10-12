# Pendientes

Lo que falta definir. Cuando algo se resuelve, se tacha y se anota dónde quedó documentado.

## Negocio (Micaela)
- [ ] Horario de atención (se carga desde el panel).
- [ ] Duraciones y precios de cada servicio (se cargan desde el panel).
- [ ] Revisar y ajustar la política de cancelación borrador ([02](02-requerimientos.md#política-de-cancelación-borrador-editable)).
- [ ] ¿Atiende a menores de edad? Si no, bloquear por edad o pedir que reserve un adulto.
- [ ] Crear cuenta de **MercadoPago** y la "aplicación" de desarrolladores.
- [ ] Datos bancarios para transferencias.
- [ ] Textos: "Sobre mí", descripciones de servicios, preguntas frecuentes.
- [ ] Sesión de fotos del espacio ([07](07-marca.md#fotos-del-espacio)).

## Técnico
- [ ] Colores hex exactos y archivos del logo (SVG/PNG en alta).
- [ ] Nombre y compra del dominio.
- [ ] Revisar los límites vigentes de los planes gratuitos (Render, Neon, Resend, Netlify) antes de desplegar.
- [x] ~~Decidir el gestor de monorepo (npm workspaces, pnpm o Turborepo).~~ → pnpm workspaces ([ADR-007](decisiones/ADR-007-pnpm-workspaces.md)).
- [x] ~~**Descanso entre sesiones en la exclusion constraint.**~~ → se guarda `blockedUntil` en cada reserva ([ADR-008](decisiones/ADR-008-descanso-guardado-en-la-reserva.md)).
- [x] ~~**Dirección en `Settings`.**~~ → agregada a [04](04-modelo-de-datos.md), junto con el barrio (público).
- [ ] **Pago de MercadoPago que llega tarde con el horario ya ocupado** ([05](05-flujo-de-reserva.md#bloqueo-temporal-patrón-venta-de-entradas)): definir si el reintegro es automático (API de MercadoPago) o lo hace Micaela a mano.
- [ ] **Qué datos del `Client` se actualizan** cuando alguien reserva con un email que ya existe (nombre, teléfono, fecha de nacimiento) ([ADR-009](decisiones/ADR-009-reserva-sin-cuenta.md)).

## Para explicar antes de avanzar
- [ ] **Hosting:** cómo se conectan Netlify/Cloudflare (web), Render (API) y Neon (base) y qué es cada uno.
- [ ] **Webhooks:** cómo avisa MercadoPago de un pago (necesario para decidir el pago tardío).

## Hoja de ruta (fase 1)

Orden de construcción. Al retomar, seguir por el primer ítem sin tachar.

- [x] ~~Esqueleto del monorepo, PostgreSQL en Docker, Prisma, esquema, migración inicial y seed.~~
- [x] ~~`GET /services` y home de la web que los muestra (demo).~~
- [ ] **Horarios libres** (`GET /availability?serviceId&date`): franjas del horario semanal − bloqueos − reservas que ocupan, con descanso, anticipación mínima, ventana máxima y zona horaria `America/Montevideo` ([05](05-flujo-de-reserva.md#cálculo-de-horarios-libres)). Explicar la lógica con un ejemplo antes de programar.
- [ ] **Crear reserva** con bloqueo temporal, expiración de pendientes y manejo del error de superposición.
- [ ] **Pagos:** MercadoPago (modo de pruebas, webhook verificado) y transferencia.
- [ ] **Emails** (Resend): confirmación con la dirección y el link de gestión.
- [ ] **Panel de Micaela** (dentro de la web, con login): reservas, servicios, horarios, bloqueos y configuración. *Micaela no usa Prisma Studio: es una herramienta solo para desarrollo.*
- [ ] **Páginas públicas:** sobre mí, preguntas frecuentes, política de cancelación, política de privacidad, contacto y WhatsApp.
- [ ] **Despliegue** en la nube (ver límites de los planes gratuitos).

## Cómo retomar el entorno
1. Abrir **Docker Desktop** (la base corre en el contenedor `serena-db`; si está apagado: `docker compose up -d`).
2. `pnpm dev` desde la raíz → web en http://localhost:3000 y API en http://localhost:3001.
3. Para ver los datos: `pnpm db:studio` desde `apps/api`.
