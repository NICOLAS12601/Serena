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
