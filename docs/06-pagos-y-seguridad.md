# 06 · Pagos y seguridad

## Seña

- Porcentaje configurable (**50%** por defecto) sobre el precio del servicio.
- El resto se paga en la sesión.

## MercadoPago (Checkout Pro)

1. La API crea una **preferencia de pago** con el monto de la seña, el ID de la reserva y un **vencimiento** igual al bloqueo (10 min).
2. El cliente paga en la página de MercadoPago.
3. MercadoPago avisa a nuestra API por **webhook**.
4. La API **verifica** (ver abajo) y pasa la reserva a `CONFIRMED`.

> Todavía no hay cuenta de MercadoPago. Se desarrolla en **modo de pruebas** (credenciales de test y tarjetas de prueba) y la cuenta real se conecta al final.

### ¿Es seguro el webhook? Cómo evitamos pagos "fantasma"

**Principio: el webhook es un aviso de "pasó algo", NO la prueba de un pago.**

| Riesgo | Defensa |
|---|---|
| Alguien envía un aviso falso a nuestra API | **Nunca usamos el contenido del aviso.** Tomamos el ID del pago y **consultamos directamente a la API de MercadoPago** con nuestra clave secreta. Solo si MP responde `approved` **y el monto y la reserva coinciden**, confirmamos |
| Avisos falsificados o manipulados | **Validamos la firma** (`x-signature`) con el secreto del webhook. Si no coincide, se descarta |
| Llega el mismo aviso dos veces | Procesamiento **idempotente**: si el pago ya fue registrado, no se hace nada |
| Se pierde un aviso | **Tarea de conciliación** periódica: consulta en MP el estado de las reservas pendientes |
| Un cliente dice "yo pagué" y no figura | Cada reserva guarda el **`mercadoPagoPaymentId`**. Micaela lo busca en su cuenta de MP: si no existe, no hubo pago. Es la misma evidencia que usa MP ante un reclamo |

## Transferencia bancaria

- Precio con **descuento** configurable (**10%** por defecto), porque no hay comisión de MercadoPago.
- La reserva queda en `PENDING_VERIFICATION` con un bloqueo más largo (**2 h** por defecto).
- Se le muestran al cliente los **datos bancarios** (cargados en el panel) y se le pide enviar el comprobante (WhatsApp o email).
- Micaela **confirma manualmente** desde el panel.

> ⚠️ **Regla de oro: confirmar solo al ver la plata acreditada en la cuenta del banco, nunca por un comprobante o captura de pantalla.** Las capturas truchas son el fraude más común.

## Privacidad de la dirección

Micaela atiende en su casa:
- El sitio muestra **solo el barrio**.
- La dirección exacta se envía **únicamente en el email de confirmación**, después de cobrada la seña.
- La dirección vive en la base de datos (`Settings`), **nunca en el código** (el repo es público).

## Datos personales (Ley 18.331)

- El **motivo de consulta** es un dato de **salud**, y la ley uruguaya de protección de datos lo considera **sensible**.
- Al reservar: **checkbox de consentimiento** con link a una **política de privacidad** breve (qué datos se piden, para qué, quién los ve y cómo pedir su eliminación).
- El motivo de consulta **solo es visible en el panel** y nunca se devuelve en endpoints públicos.
- No se piden datos que no se usan.

## Seguridad general

- **Panel de admin** protegido con login (contraseña guardada con hash, por ejemplo argon2 o bcrypt) y sesión con JWT o cookie segura.
- **Secretos** solo en variables de entorno. `.env` está en `.gitignore`.
- **Validación** de todos los datos de entrada en la API (DTOs con class-validator).
- **Rate limiting** en los endpoints públicos (crear reserva, contacto) para evitar spam.
- **HTTPS** en todos lados (lo da el hosting).
