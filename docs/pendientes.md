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
- [ ] Sesión de fotos del espacio ([07](07-marca.md#fotos-del-espacio)). Ya hay una foto de la sala; faltan detalles (aceites, piedras, toallas) para otras páginas.

### Preguntas que surgieron de los diseños (octubre 2026)
- [x] ~~**Medios de pago:**~~ → se mantienen **MercadoPago y transferencia** ([ADR-005](decisiones/ADR-005-pagos-mercadopago-y-transferencia.md)). El cliente elige en la confirmación.
- [x] ~~**Fecha de nacimiento:**~~ → se mantiene en el formulario.
- [x] ~~**Anticipación para cancelar:**~~ → **12 horas**, y con aviso a tiempo el turno se **reprograma** (la seña pasa al nuevo turno). Ver [02](02-requerimientos.md#política-de-cancelación-acordada-en-octubre-2026-editable).
- [x] ~~**Pantalla final:**~~ → con MercadoPago, "¡Tu reserva está confirmada!"; con transferencia, "¡Tu turno está reservado!" hasta que llega la seña.
- [x] ~~**Comprobante de transferencia:**~~ → botón "Enviar comprobante por WhatsApp" con el mensaje ya escrito; como referencia, **el nombre** (sin código de reserva) ([ADR-010](decisiones/ADR-010-pago-de-sena-o-total.md)).
- [ ] **WhatsApp automático:** el diseño dice "te enviamos los detalles a tu WhatsApp". Mandar WhatsApp automáticos requiere la API de WhatsApp Business (tiene costo); en la fase 1 Micaela los manda con el botón del panel ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- [ ] **Precios en la lista de masajes:** el diseño no los muestra; se agregaron chicos debajo de la descripción (los precios visibles generan confianza, ver [01](01-analisis-mercado.md)).
- [x] ~~**Encuentro inicial:**~~ → el cliente nuevo no elige masaje: Micaela lo define en la entrevista. El precio ($1.200) lo carga ella desde el panel (no va en el código).
- [x] ~~**Pago total y cancelación tardía:**~~ → se publica solo la regla básica (12 h para reagendar sin perder la seña); los casos particulares los maneja Micaela caso a caso.
- [x] ~~**¿Se verifica que sea cliente nuevo?**~~ → por ahora no: se confía en la buena fe del cliente. Micaela decide más adelante si quiere ser más estricta.

## Técnico
- [x] ~~**Archivos del logo**~~ → logo oficial en `apps/web/public/logo-serena.png`; terracota exacta `#a14d29` ([07](07-marca.md)).
- [x] ~~**Dominio:**~~ → **`serenabienestar.uy`** comprado en HostingenlaWeb el 2026-10-23 (US$ 10 + IVA por año, sin hosting ni "Gestionar DNS"); DNS en **Cloudflare Free** ([ADR-015](decisiones/ADR-015-dominio-uy-y-dns-en-cloudflare.md)). Falta:
  - [x] ~~Esperar el mail de Cloudflare con el dominio **Active**~~ → activo el 2026-10-23 (los nameservers de Cloudflare ya responden).
  - [ ] Revisar en el panel del dominio: titular y contacto administrativo **a nombre de Micaela** y con **su email** (ahí llegan las aprobaciones de transferencias), **renovación automática** activada y **DNSSEC** apagado.
  - [ ] Cargar en Cloudflare los registros de **Resend** (verificar el dominio) para mandar los avisos desde `@serenabienestar.uy`. Se puede hacer antes de tener hosting.
  - [ ] Al desplegar: registros de la web (raíz y `www`) y, opcionalmente, que el servidor solo acepte visitas que vengan de Cloudflare.
- [ ] Revisar los límites vigentes de los planes gratuitos (Render, Neon, Resend, Netlify) antes de desplegar.
- [x] ~~Decidir el gestor de monorepo (npm workspaces, pnpm o Turborepo).~~ → pnpm workspaces ([ADR-007](decisiones/ADR-007-pnpm-workspaces.md)).
- [x] ~~**Descanso entre sesiones en la exclusion constraint.**~~ → se guarda `blockedUntil` en cada reserva ([ADR-008](decisiones/ADR-008-descanso-guardado-en-la-reserva.md)).
- [x] ~~**Dirección en `Settings`.**~~ → agregada a [04](04-modelo-de-datos.md), junto con el barrio (público).
- [ ] **Pago de MercadoPago que llega tarde con el horario ya ocupado** ([05](05-flujo-de-reserva.md#bloqueo-temporal-patrón-venta-de-entradas)): definir si el reintegro es automático (A, API de MercadoPago) o lo resuelve Micaela a mano con un aviso por mail (B, recomendada). Si el horario sigue libre, se confirma igual.
- [x] ~~**Qué datos del `Client` se actualizan** con un celular que ya existe~~ → se **conservan** y solo se completa el email si faltaba ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- [x] ~~**Tarea periódica que expira las reservas pendientes vencidas**~~ → `BookingsExpiryService`, cada minuto (un `setInterval`, sin librería).
- [x] ~~**Límite de intentos detrás del proxy**~~ → `TRUST_PROXY=5`, medido en la nube ([08](08-despliegue.md#estado-del-despliegue-de-prueba)).
- [x] ~~**Que la API solo atienda a la web**~~ → clave compartida `INTERNAL_API_KEY` ([ADR-016](decisiones/ADR-016-clave-compartida-web-api.md)). Al conectar Mercado Pago, el webhook tiene que entrar por la web (`/api/...`).
- [x] ~~Sacar `forwardedFor` de `GET /health`~~ → reemplazado por `ip` / `proxyIp` cuando la IP pasó a mandarla la web.
- [ ] **Link de gestión de la reserva:** falta la página para verla y reprogramarla; hoy se guarda el hash del token pero el link no se muestra.
- [x] ~~**¿Email obligatorio?**~~ → el cliente se reconoce por su **celular**; el email es opcional y por ahora no se usa; la confirmación va por WhatsApp ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- [x] ~~**Aviso a Micaela de cada reserva nueva:**~~ → **email a su casilla con Resend** (`Settings.notificationEmail`), con botón de prueba en Configuración ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).

## Para explicar antes de avanzar
- [x] ~~**Hosting:**~~ explicado (2026-10-23): ver [08](08-despliegue.md#cómo-se-conectan-las-piezas).
- [x] ~~**Webhooks:**~~ explicado (2026-10-18): firma, consultar siempre el pago a MercadoPago, avisos repetidos sin efecto (`mercadoPagoPaymentId` único), túnel en desarrollo y cuentas de prueba.

## Hoja de ruta (fase 1)

Orden de construcción. Al retomar, seguir por el primer ítem sin tachar.

- [x] ~~Esqueleto del monorepo, PostgreSQL en Docker, Prisma, esquema, migración inicial y seed.~~
- [x] ~~`GET /services` y home de la web que los muestra (demo).~~
- [x] ~~**Front según los diseños de Micaela:** home con dos caminos, primera vez, lista de masajes y el flujo de reserva completo. Los horarios, la seña y las políticas son **datos de demostración** (`apps/web/src/lib/demo.ts`) y la reserva todavía no se guarda.~~
- [x] ~~**Panel de Micaela, primera parte** (`/admin`, solo computadora): login seguro, servicios, horarios y bloqueos, configuración, clientes y mi cuenta ([ADR-011](decisiones/ADR-011-panel-de-administracion.md)).~~
- [x] ~~**Horarios libres**~~ (`GET /availability` y `GET /availability/days`): descanso solo entre reservas e intervalo configurable ([05](05-flujo-de-reserva.md#cálculo-de-horarios-libres), [ADR-013](decisiones/ADR-013-calculo-de-horarios-libres.md)). El flujo de reserva ya muestra los días y horarios reales.
- [x] ~~**Crear reserva**~~ (`POST /bookings`): montos calculados por la API, bloqueo temporal, expiración de pendientes vencidas que se superponen, error de superposición traducido a "Ese horario se acaba de ocupar" y aviso por email a Micaela de las reservas por transferencia. Pendiente: la tarea periódica de expiración (arriba).
- [x] ~~**Panel: sección de reservas**~~: para revisar, para cerrar y próximas; confirmar pago (también transferencias que llegan tarde), cancelar, reprogramar, completada con lo cobrado, no vino y "Avisar por WhatsApp" ([02](02-requerimientos.md#panel-de-administración-solo-micaela-en-admin-pensado-para-computadora)).
- [x] ~~**Despliegue de prueba**~~ (adelantado, 2026-10-23): web en `https://serena-masajes.netlify.app`, API en `https://serena-api-atje.onrender.com`, base en Neon; planes gratis, sin dominio, con datos de prueba ([08](08-despliegue.md)). `TRUST_PROXY=5` comprobado. Así Mercado Pago ya tiene una dirección pública para los webhooks.
- [ ] **Pagos con MercadoPago** (modo de pruebas, webhook verificado). Excluir el pago en efectivo (Abitab/Redpagos): queda pendiente días y no entra en el bloqueo de 10 min. Las transferencias ya funcionan ([ADR-014](decisiones/ADR-014-comprobante-de-transferencia.md)).
- [x] ~~**Aviso a Micaela por email** (Resend): servicio de envío y botón "Enviar mail de prueba" en Configuración.~~ El aviso de cada reserva se dispara al hacer "crear reserva". Los emails a clientes quedan fuera de la fase 1 ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- [ ] **Páginas públicas:** sobre mí, preguntas frecuentes, política de cancelación, política de privacidad, contacto y WhatsApp.
- [ ] **Despliegue** en la nube (ver límites de los planes gratuitos).

## Para probar los avisos por email con Resend
1. Micaela crea una cuenta en [resend.com](https://resend.com) **con el mismo email** donde quiere recibir los avisos.
2. En Resend, *API Keys* → crear una con permiso *Sending access* y copiarla en `apps/api/.env` como `RESEND_API_KEY` (nunca en el repo).
3. Reiniciar la API, cargar ese email en Configuración → *Avisos de reservas*, guardar y tocar **"Enviar mail de prueba"**.

Sin `RESEND_API_KEY` la API no envía nada: escribe el mail en su consola (modo desarrollo).

## Cómo retomar el entorno
1. Abrir **Docker Desktop** (la base corre en el contenedor `serena-db`; si está apagado: `docker compose up -d`).
2. `pnpm dev` desde la raíz → web en http://localhost:3000 y API en http://localhost:3001.
3. Panel: http://localhost:3000/admin (usuario de prueba en `apps/api/.env`). Para ver la base cruda: `pnpm db:studio` desde `apps/api` (solo desarrollo).
