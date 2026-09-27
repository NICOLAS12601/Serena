# ADR-005 · Seña por MercadoPago o por transferencia

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
Se cobra una seña (50% por defecto) para reducir las ausencias. MercadoPago cobra una comisión; la transferencia no, pero requiere verificación manual.

## Decisión
- **MercadoPago Checkout Pro:** confirmación automática vía webhook, **siempre verificando el pago contra la API de MercadoPago** y validando la firma. Nunca se confía en el contenido del aviso.
- **Transferencia:** precio con descuento configurable (10% por defecto), estado `PENDING_VERIFICATION` y confirmación manual de Micaela **solo al ver la plata acreditada**.
- Mientras no exista la cuenta real, se desarrolla con las **credenciales de prueba** de MercadoPago.

Detalle: [06 · Pagos y seguridad](../06-pagos-y-seguridad.md).

## Alternativas consideradas
- **Solo MercadoPago:** pierde a quienes prefieren transferir y no ofrece el descuento.
- **Sin seña:** más ausencias, que es el problema que la competencia resuelve con seña.
- **Otras pasarelas (dLocal, Handy, etc.):** MercadoPago es el más conocido por el público local y el más simple de integrar.

## Consecuencias
- ➕ Flexibilidad de pago y ahorro de comisión con transferencia.
- ➖ La transferencia requiere intervención manual y es vulnerable a comprobantes falsos (mitigado con la regla de verificar en el banco).
