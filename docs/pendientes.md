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
- [ ] **Dominio:** Micaela lo va a comprar en **HostingenlaWeb** (registrador acreditado de .uy). Antes de pagar, confirmar con el soporte:
  - que venden **solo el dominio**, sin plan de hosting (sus planes de hosting compartido no pueden correr la API);
  - que desde el panel se pueden **editar los registros DNS** (A, CNAME, TXT) **o cambiar los nameservers**;
  - el precio del primer año y el de **renovación** (referencia vieja: US$38/año en 2022).

  Al registrarlo: **a nombre de Micaela** y con **su email** como contacto administrativo (ahí llegan las aprobaciones de transferencias). El dominio se puede transferir a otro registrador con el código EPP. Activar la renovación automática.
- [ ] Revisar los límites vigentes de los planes gratuitos (Render, Neon, Resend, Netlify) antes de desplegar.
- [x] ~~Decidir el gestor de monorepo (npm workspaces, pnpm o Turborepo).~~ → pnpm workspaces ([ADR-007](decisiones/ADR-007-pnpm-workspaces.md)).
- [x] ~~**Descanso entre sesiones en la exclusion constraint.**~~ → se guarda `blockedUntil` en cada reserva ([ADR-008](decisiones/ADR-008-descanso-guardado-en-la-reserva.md)).
- [x] ~~**Dirección en `Settings`.**~~ → agregada a [04](04-modelo-de-datos.md), junto con el barrio (público).
- [ ] **Pago de MercadoPago que llega tarde con el horario ya ocupado** ([05](05-flujo-de-reserva.md#bloqueo-temporal-patrón-venta-de-entradas)): definir si el reintegro es automático (API de MercadoPago) o lo hace Micaela a mano.
- [ ] **Qué datos del `Client` se actualizan** cuando alguien reserva con un celular que ya existe (nombre, email, fecha de nacimiento) ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- [x] ~~**¿Email obligatorio?**~~ → el cliente se reconoce por su **celular**; el email es opcional y por ahora no se usa; la confirmación va por WhatsApp ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- [x] ~~**Aviso a Micaela de cada reserva nueva:**~~ → **email a su casilla con Resend** (`Settings.notificationEmail`), con botón de prueba en Configuración ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).

## Para explicar antes de avanzar
- [ ] **Hosting:** cómo se conectan Netlify/Cloudflare (web), Render (API) y Neon (base) y qué es cada uno.
- [ ] **Webhooks:** cómo avisa MercadoPago de un pago (necesario para decidir el pago tardío).

## Hoja de ruta (fase 1)

Orden de construcción. Al retomar, seguir por el primer ítem sin tachar.

- [x] ~~Esqueleto del monorepo, PostgreSQL en Docker, Prisma, esquema, migración inicial y seed.~~
- [x] ~~`GET /services` y home de la web que los muestra (demo).~~
- [x] ~~**Front según los diseños de Micaela:** home con dos caminos, primera vez, lista de masajes y el flujo de reserva completo. Los horarios, la seña y las políticas son **datos de demostración** (`apps/web/src/lib/demo.ts`) y la reserva todavía no se guarda.~~
- [x] ~~**Panel de Micaela, primera parte** (`/admin`, solo computadora): login seguro, servicios, horarios y bloqueos, configuración, clientes y mi cuenta ([ADR-011](decisiones/ADR-011-panel-de-administracion.md)).~~
- [ ] **Horarios libres** (`GET /availability?serviceId&date`): franjas del horario semanal − bloqueos − reservas que ocupan, con descanso, anticipación mínima, ventana máxima y zona horaria `America/Montevideo` ([05](05-flujo-de-reserva.md#cálculo-de-horarios-libres)). Explicar la lógica con un ejemplo antes de programar. Al terminar, reemplazar `getDemoSlots` / `isDemoDayAvailable` en la web.
- [ ] **Crear reserva** con bloqueo temporal, expiración de pendientes y manejo del error de superposición.
- [ ] **Panel: sección de reservas** (agenda, pendientes, confirmar pago, cancelar, reprogramar, completar) con el botón "Avisar por WhatsApp" al confirmar.
- [ ] **Pagos:** MercadoPago (modo de pruebas, webhook verificado) y transferencia.
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
