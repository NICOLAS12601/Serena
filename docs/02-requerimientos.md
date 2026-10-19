# 02 · Requerimientos y alcance

## Contexto del negocio

- **SERENA · Masajes & Bienestar**, en Montevideo. Atiende **Micaela**, sola por ahora.
- Atiende **en su casa**, así que la dirección exacta **no se publica** (ver [06](06-pagos-y-seguridad.md#privacidad-de-la-dirección)).
- Servicios iniciales: **masaje terapéutico, masaje relajante y masaje con piedras calientes**. Se van a sumar más.
- Duraciones, precios y horarios están **a definir**: los carga ella desde el panel.

## Fase 1 · Lanzamiento

### Sitio público

Las pantallas siguen los **diseños de Micaela** (octubre 2026): una columna pensada para celular, con el logo arriba y hojas decorativas.

- **Home:** logo y **dos caminos**: *"Es mi primer masaje en Serena"* y *"Ya soy cliente"*.
- **Primera vez** (`/primera-vez`): presenta el **Encuentro inicial** (90 min: entrevista, masaje personalizado y un café o té al final) y lleva a reservarlo. El cliente nuevo **no elige masaje**: Micaela lo define en la entrevista, según lo que la persona necesita. Es un servicio marcado `isFirstVisit`; no aparece en la lista de clientes que vuelven. Su precio lo carga Micaela desde el panel.
- **Servicios** (`/masajes`, para quien ya es cliente): ícono, nombre, descripción, duración y precio de cada masaje (cargados desde el panel).
- **Reserva online** (`/reservar`), en pasos: **fecha** (calendario) → **horario** (agrupado en mañana, tarde y noche; los ocupados se ven tachados) → **políticas** (hay que aceptarlas) → **datos** → **confirmación** (resumen y seña) → **listo**. **Sin registro ni contraseña** ([ADR-009](decisiones/ADR-009-reserva-sin-cuenta.md)).
- **Link de gestión** (en la pantalla final y en el WhatsApp de confirmación) para ver esa reserva y **reprogramarla** (con 12 h o más de anticipación, la seña pasa al nuevo turno).
- **Pago:** el cliente elige **MercadoPago** (se confirma solo) o **transferencia** con descuento (queda reservado hasta que Micaela ve la plata), y si paga la **seña** o el **total**; si paga la seña, el resto se paga después del masaje ([ADR-010](decisiones/ADR-010-pago-de-sena-o-total.md)).
- **Comprobante de transferencia:** botón "Enviar comprobante por WhatsApp" con el mensaje ya escrito; como referencia de la transferencia se pide **el nombre**.
- **Sobre mí**, **testimonios**, **preguntas frecuentes**, **política de cancelación**.
- **Contacto:** formulario, botón flotante de WhatsApp con mensaje precargado, link a Instagram, barrio (sin dirección exacta).
- **Política de privacidad** (requerida por la Ley 18.331; ver [06](06-pagos-y-seguridad.md#datos-personales-ley-18331)).
- **Responsive:** pensado primero para **celular** y adaptado a **computadora**, con **SEO local** ("masajes en Montevideo / [barrio]").

### Datos que se piden al reservar
| Dato | Motivo |
|---|---|
| Servicio | Lo elige en el calendario |
| Nombre | Identificación |
| Fecha de nacimiento | Pedido por Micaela; la edad se calcula (¿atiende menores? → [pendientes](pendientes.md)) |
| Celular (WhatsApp) | Contacto. **Se valida** con las reglas de libphonenumber (Google): tiene que ser un celular válido del país elegido (Uruguay por defecto, ej. 099 123 456; extranjeros con su código de país). Se guarda en formato internacional (`+59899123456`). Valida el formato, no que el número sea de esa persona |
| Email (opcional) | Se guarda para más adelante; por ahora no se le manda nada ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)). El cliente se reconoce por su **celular** |
| Motivo de consulta (opcional) | Pedido por Micaela. **Es un dato de salud** (sensible). Opcional: ella completa la ficha después, por WhatsApp o en persona |
| Consentimiento | Checkbox con link a la política de privacidad |

Micaela arma la ficha completa del cliente después, en persona.

### Pagos
- **Seña** (por defecto 50%, configurable).
- **MercadoPago:** confirmación automática.
- **Transferencia bancaria:** precio con descuento (configurable) y confirmación manual por parte de Micaela, **después de ver la plata en su cuenta**.

### Panel de administración (solo Micaela, en `/admin`, pensado para computadora)

Decisiones en [ADR-011](decisiones/ADR-011-panel-de-administracion.md). Estado: ✅ = ya funciona.

- ✅ **Login** con email y contraseña (sesión segura de 7 días, límite de intentos) y **Mi cuenta** para cambiar la contraseña.
- ✅ **Servicios:** alta, edición, baja (solo si no tienen reservas; si no, se desactivan), precio, duración, descripción, ícono, orden, activo y "encuentro inicial".
- ✅ **Horarios y bloqueos:** horario semanal con varias franjas por día y días bloqueados (vacaciones, feriados).
- ✅ **Configuración:** WhatsApp, barrio, dirección, seña, descuento, plazos para pagar, datos bancarios, descanso, anticipación, ventana y texto de las políticas (ver la tabla de abajo).
- ✅ **Clientes:** búsqueda, contacto, edad e historial de reservas con el motivo de consulta.
- ✅ **Reservas** (primera pantalla del panel), en una lista con tres bloques:
  - **Para revisar:** transferencias pendientes con el tiempo que les queda, y las vencidas de las últimas 48 h (la plata puede llegar tarde: se confirman si el horario sigue libre). Botones **"Llegó la plata"** (registra el pago de la seña o el total) y **Cancelar**.
  - **Para cerrar:** sesiones que ya pasaron; **Completada** (con lo **cobrado en el momento**, que queda registrado como pago) o **No vino**.
  - **Próximas**, agrupadas por día, con el comentario del cliente: **"Avisar por WhatsApp"** (mensaje con día, hora, dirección y lo que falta pagar), **Reprogramar** (horarios libres de ese día sin contar la propia reserva; sin anticipación mínima ni ventana) y **Cancelar**.
  - No hay email automático al cliente ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)). Falta el link de gestión en el mensaje (todavía no existe esa página).
- Más adelante: subir fotos desde el panel.

### Configuración inicial (editable desde el panel)

| Parámetro | Valor inicial |
|---|---|
| Porcentaje de seña | 50% |
| Descuento por transferencia | 10% |
| Minutos de bloqueo pagando con MercadoPago | 10 |
| Horas de bloqueo pagando por transferencia | 2 |
| Descanso entre sesiones (solo entre reservas) | 15 min |
| Cada cuánto se ofrecen horarios | 30 min |
| Anticipación mínima para reservar | 12 h |
| Ventana máxima hacia adelante | 30 días |
| Horario semanal | Vacío (lo carga ella) |
| Datos bancarios | Vacío (los carga ella) |

### Política de cancelación (acordada en octubre 2026, editable)
> - Con **12 h o más** de anticipación, el turno **se reagenda** y no se pierde la seña. Los casos particulares (por ejemplo, quien pagó el total) los maneja Micaela caso a caso.
> - Con **menos de 12 h** o si no te presentás, la seña se pierde.
> - Hay **15 min de tolerancia**: si llegás tarde, la sesión termina en el horario previsto.

## Fase 2
- **"Mis reservas":** el cliente recibe un código de 6 dígitos y ve sus reservas próximas y pasadas ([ADR-009](decisiones/ADR-009-reserva-sin-cuenta.md)); por dónde llega el código (WhatsApp automático o email) se decide entonces ([ADR-012](decisiones/ADR-012-cliente-por-celular-y-aviso-por-whatsapp.md)).
- Recordatorio automático el día anterior y confirmación automática por **WhatsApp** (API de WhatsApp Business, con costo).
- **Gift cards** y **packs** (cuponeras).
- Reseñas de Google embebidas.
- Sincronización opcional con Google Calendar de Micaela.

## Fase 3
- Blog (SEO).
- Ficha del cliente digital (historial de sesiones).
- Cupones de descuento (ej. primera sesión).
