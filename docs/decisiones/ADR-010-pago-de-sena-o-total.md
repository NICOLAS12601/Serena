# ADR-010 · El cliente elige pagar la seña o el total; comprobante de transferencia por WhatsApp

- **Estado:** Aceptada
- **Fecha:** 2026-10-18
- **Complementa:** [ADR-005](ADR-005-pagos-mercadopago-y-transferencia.md) (los medios de pago no cambian)

## Contexto
[ADR-005](ADR-005-pagos-mercadopago-y-transferencia.md) define que al reservar se paga una **seña** (50% por defecto) por MercadoPago o por transferencia con descuento. Micaela quiere que el cliente también pueda **pagar el masaje completo** por adelantado. Además, en la transferencia hacía falta resolver cómo el cliente avisa que pagó y cómo Micaela identifica cada transferencia.

## Decisión
- Al confirmar, el cliente elige **medio** (MercadoPago o transferencia) y **cuánto paga ahora**: la **seña** o el **total**. Si paga la seña, el resto se paga después del masaje.
- La reserva guarda la elección en `Booking.paymentPlan` (`DEPOSIT` o `FULL`). `depositAmount` sigue existiendo: es la parte que **no se devuelve**. Con 12 h o más de aviso pasa al turno reprogramado; con menos, se pierde.
- El descuento por transferencia se aplica al precio (`priceSnapshot` ya lo incluye), y la seña se calcula sobre ese precio.
- **Comprobante de transferencia:** la pantalla final muestra los datos bancarios, pide poner **el nombre** como referencia y ofrece un botón **"Enviar comprobante por WhatsApp"** con el mensaje ya escrito (nombre, servicio, fecha, hora y monto). El número sale de `Settings.whatsappNumber`, que se carga desde el panel.
- El comprobante **no es prueba de pago**: Micaela confirma solo al ver la plata en el banco ([06](../06-pagos-y-seguridad.md#transferencia-bancaria)). Con MercadoPago no se pide comprobante: la confirmación llega por webhook y se verifica contra la API.

## Alternativas consideradas
- **Solo seña:** más simple, pero Micaela quiere ofrecer el pago completo.
- **Código de reserva como referencia de la transferencia** (ej. "SER-4821"): descartado porque no todos lo entenderían; el nombre es más natural.
- **Subir el comprobante en la web:** requiere almacenamiento de archivos y guardar más datos personales, y no reemplaza la verificación en el banco. Queda como opción para la fase 2.
- **Reemplazar `depositAmount` por un "monto a pagar ahora":** se perdería el concepto de seña, que es lo que define qué se pierde al cancelar tarde.

## Consecuencias
- ➕ Más flexibilidad para el cliente; Micaela puede cobrar todo por adelantado.
- ➕ El flujo del comprobante usa la herramienta que Micaela ya usa (WhatsApp) y no agrega código complejo.
- ➖ Hay que registrar el **resto** cobrado después del masaje (en el panel, al marcar la reserva como completada).
- La regla publicada es la básica: con 12 h o más de aviso se reagenda sin perder la seña; con menos, se pierde. Los casos particulares (por ejemplo, devoluciones a quien pagó el total) los resuelve Micaela caso a caso; si devuelve dinero, se registra como un `Payment` con estado `REFUNDED` (precisado el 2026-10-18).
