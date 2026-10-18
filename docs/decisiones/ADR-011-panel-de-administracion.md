# ADR-011 · Panel de administración: sesión con cookie segura, solo computadora y aviso por WhatsApp con un botón

- **Estado:** Aceptada
- **Fecha:** 2026-10-18

## Contexto
Micaela necesita un panel para manejar su negocio sin tocar código ni la base de datos (hasta ahora se usaba Prisma Studio, que es una herramienta de desarrollo). El panel maneja **datos de salud** (motivo de consulta) y datos personales, así que el acceso tiene que ser seguro. La web (Netlify/Cloudflare) y la API (Render) van a estar en **dominios distintos**.

## Decisión
- **Ubicación:** dentro de la web, en `/admin`. Pensado **solo para computadora** (Micaela lo usa desde la PC); las páginas públicas siguen siendo responsive.
- **Primera versión:** servicios, horario semanal, días bloqueados, configuración (incluye WhatsApp, datos bancarios, dirección y políticas), mi cuenta (cambiar contraseña) y clientes. La sección de **reservas** llega cuando las reservas se guarden de verdad.
- **Sesión:** al iniciar sesión, la API crea una sesión en la base (`AdminSession`, se guarda solo el **hash** del token) y lo envía en una **cookie `httpOnly`** (el código de la página no puede leerla), `SameSite=Lax` y `Secure` en producción. Cerrar sesión o cambiar la contraseña borra las sesiones. Las sesiones vencen a los 7 días.
- **Un solo dominio para el navegador:** la web reenvía a la API todo lo que va a `/api/...` (*rewrites* de Next.js). Así la cookie es "de primera parte" y los navegadores no la bloquean.
- **Protección del login:** límite de intentos por minuto (*rate limiting*) y contraseña verificada con scrypt en tiempo constante.
- **Validación** de todos los datos que llegan al panel con DTOs (`class-validator`).
- **Aviso al cliente al confirmar una reserva:** email automático + botón **"Avisar por WhatsApp"** en el panel, que abre el chat del cliente en el WhatsApp de Micaela con el mensaje ya escrito.

## Alternativas consideradas
- **Token (JWT) guardado en el navegador** y enviado en cada pedido: más simple entre dominios distintos, pero un script malicioso que llegara a correr en la página podría robarlo y entrar al panel.
- **Cookie entre dominios distintos** (`SameSite=None`): los navegadores bloquean cada vez más las cookies de terceros (Safari ya lo hace), así que el login fallaría.
- **JWT en cookie, sin tabla de sesiones:** no permite cerrar una sesión robada antes de que venza. La tabla de sesiones permite revocar.
- **WhatsApp automático (API de WhatsApp Business):** costo por mensaje, verificación del negocio, plantillas aprobadas y un número aparte que no se puede usar en la app. Queda como opción para la fase 2.
- **Panel responsive:** más trabajo sin necesidad real hoy.

## Consecuencias
- ➕ La sesión no se puede robar desde JavaScript y se puede revocar.
- ➕ Micaela usa su WhatsApp de siempre, sin costo.
- ➖ En producción hay que configurar la URL de la API en la web (`API_URL`) para el reenvío de `/api/...`.
- ➖ Una tabla más (`AdminSession`) y una tarea de limpieza de sesiones vencidas (o se borran al validar).
