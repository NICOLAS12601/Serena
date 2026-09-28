# ADR-009 · Reservar sin contraseña; "Mis reservas" con código por email

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
Algunos sitios de turnos exigen crear una cuenta para reservar (por ejemplo, [Peluquería Cesar Rosano](https://peluqueriacesarrosano.com.uy/): Google o email + contraseña, con un área "Tu cuenta" para ver los turnos). Allí la cuenta es el filtro contra reservas falsas, porque no cobran seña. En SERENA muchos clientes llegan desde Instagram, en el celular, a reservar su primera sesión, y registrarse con contraseña es un paso engorroso (y las contraseñas se olvidan). Aun así, es valioso que el cliente pueda ver sus reservas.

## Decisión
- **Para reservar no se pide registro ni contraseña.** El cliente completa sus datos en el formulario.
- **El cliente se reconoce por su email** (único en `Client`): si ya existe, la reserva se asocia a él; si no, se crea.
- **Fase 1 · Link de gestión:** el email de confirmación incluye un link a esa reserva (con un token largo y aleatorio, `Booking.manageToken`) para verla y cancelarla con un clic.
- **Fase 2 · "Mis reservas":** el cliente escribe su email, recibe un **código de 6 dígitos** (válido 10 min, de un solo uso, guardado hasheado en `ClientLoginCode`) y, al ingresarlo, ve sus reservas próximas y pasadas. Es un login sin contraseña.
- La única cuenta con contraseña es la de Micaela, para el panel (`AdminUser`).

## Alternativas consideradas
- **Cuenta con email + contraseña y/o Google:** da "mis reservas", pero agrega registro antes de la primera reserva (más abandonos), recuperación de contraseña y más datos sensibles que proteger.
- **"Mis reservas" con solo escribir el email:** descartada por privacidad. El email no es secreto: cualquiera que conozca el email de otra persona vería sus turnos (días, horarios, dirección).
- **Link por email en lugar de código:** el navegador interno de Instagram no comparte la sesión con el navegador que abre el link del email; el código se escribe en la misma pantalla.

## Consecuencias
- ➕ Reservar es rápido; no hay contraseñas que olvidar.
- ➕ El acceso a "Mis reservas" y al link de gestión requiere acceso a la casilla de email del cliente (un factor: "algo que tenés").
- ➕ Las reservas falsas las frena la seña.
- ➖ Si alguien escribe el email de otra persona al reservar, la reserva queda asociada a ese cliente. Riesgo bajo; se define en la implementación qué datos del `Client` se actualizan con cada reserva.
- ➖ Hay que limitar los intentos de ingreso del código (*rate limiting*) para que no se pueda adivinar.
