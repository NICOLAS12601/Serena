# ADR-012 · El cliente se reconoce por su celular; la confirmación va por WhatsApp

- **Estado:** Aceptada
- **Fecha:** 2026-10-18
- **Reemplaza en parte a:** [ADR-009](ADR-009-reserva-sin-cuenta.md) (el cliente se reconocía por email y la confirmación llegaba por email).

## Contexto
Los clientes de SERENA llegan desde Instagram y se comunican con Micaela por WhatsApp. El comprobante de transferencia ya se manda por WhatsApp ([ADR-010](ADR-010-pago-de-sena-o-total.md)) y el panel ya tiene previsto un botón "Avisar por WhatsApp" ([ADR-011](ADR-011-panel-de-administracion.md)). Mandar emails agrega un servicio (Resend), registros DNS para que no caigan en spam y textos que mantener, y en Uruguay se mira mucho más WhatsApp que el mail.

## Decisión
- **El cliente se reconoce por su celular** (`Client.phone`, único, en formato E.164: `+59899123456`). Si ya existe, la reserva se asocia a ese cliente; si no, se crea. La base exige el formato con un `CHECK`, así "099 123 456" y "+598 99 123 456" nunca son dos clientes distintos.
- **El email es opcional** (`Client.email`, puede quedar vacío; si se carga, es único y en minúsculas). Por ahora **no se usa para mandar nada**; se guarda por si más adelante se suman los emails.
- **En la fase 1 no se envían emails a los clientes.** La confirmación es **manual por WhatsApp**:
  1. El cliente reserva. Si paga por transferencia, manda el comprobante por WhatsApp.
  2. Micaela revisa que la plata haya llegado (con MercadoPago se confirma solo).
  3. En el panel toca **"Avisar por WhatsApp"**: se abre el chat del cliente con el mensaje ya escrito (confirmación, día y hora, **dirección** y link de gestión) y ella lo envía.
- La **dirección exacta** viaja solo en ese mensaje, después de cobrada la seña.
- El **link de gestión** de la reserva (ADR-009) se muestra en la pantalla final y va en el mensaje de Micaela. Como en la base se guarda solo el hash del token, el botón genera un token nuevo al armar el mensaje (se define al hacer la sección de reservas).
- **Aviso a Micaela de cada reserva nueva: por email** a su casilla (`Settings.notificationEmail`, se carga en el panel), enviado con **Resend** desde la API. Es el único email de la fase 1 y va a una sola persona. Mientras no haya dominio verificado en Resend se envía desde `onboarding@resend.dev`, que solo puede mandar al email de la cuenta de Resend: alcanza, porque la destinataria es ella. En Configuración hay un botón **"Enviar mail de prueba"**.

## Alternativas consideradas
- **Sin email en el formulario:** igual de simple, pero si algún día se suman los emails no habría datos de los clientes anteriores.
- **Email opcional y confirmación por Resend a quien lo deje:** mantiene toda la complejidad de los emails para una parte de los clientes.
- **Aviso a Micaela por Telegram** (bot): instantáneo y gratis, pero tendría que instalar Telegram solo para esto.
- **Notificación del navegador** (Web Push): más compleja y solo le llega a la computadora.
- **WhatsApp automático** (API oficial de WhatsApp Business de Meta): requiere verificar el negocio, plantillas aprobadas por Meta y se paga por conversación. Más complejo que los emails. Queda para la fase 2 si el volumen lo justifica.

## Consecuencias
- ➕ Sin emails a clientes: no hacen falta registros DNS de email ni pelear con el spam, y el canal es el que usan los clientes. Resend se usa solo para avisarle a Micaela.
- ➕ Se piden menos datos obligatorios (Ley 18.331).
- ➖ Cada confirmación depende de que Micaela toque el botón; las reservas de la noche se confirman a la mañana. El cliente igual ve en pantalla que su turno quedó reservado.
- ➖ No hay recordatorios automáticos el día anterior (Micaela puede mandarlos a mano).
- ➖ "Mis reservas" con código (fase 2 de ADR-009) necesitaría mandar el código por WhatsApp automático o al email opcional; se decide en la fase 2.
- ➖ Si Micaela no ve el mail de aviso, la reserva queda pendiente: la sección de reservas del panel destaca las pendientes con el tiempo que les queda.
