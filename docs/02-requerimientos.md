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
- **Primera vez** (`/primera-vez`): presenta el **Encuentro inicial** (90 min: entrevista, masaje personalizado y un café o té al final) y lleva a reservarlo. Es un servicio marcado `isFirstVisit`; no aparece en la lista de clientes que vuelven.
- **Servicios** (`/masajes`, para quien ya es cliente): ícono, nombre, descripción, duración y precio de cada masaje (cargados desde el panel).
- **Reserva online** (`/reservar`), en pasos: **fecha** (calendario) → **horario** (agrupado en mañana, tarde y noche; los ocupados se ven tachados) → **políticas** (hay que aceptarlas) → **datos** → **confirmación** (resumen y seña) → **listo**. **Sin registro ni contraseña** ([ADR-009](decisiones/ADR-009-reserva-sin-cuenta.md)).
- **Link de gestión** en el email de confirmación para ver esa reserva y **reprogramarla** (con 12 h o más de anticipación, la seña pasa al nuevo turno).
- **Pago de la seña:** el cliente elige **MercadoPago** (se confirma solo) o **transferencia** con descuento (queda reservado hasta que Micaela ve la plata); ver [06](06-pagos-y-seguridad.md).
- **Sobre mí**, **testimonios**, **preguntas frecuentes**, **política de cancelación**.
- **Contacto:** formulario, botón flotante de WhatsApp con mensaje precargado, link a Instagram, barrio (sin dirección exacta).
- **Política de privacidad** (requerida por la Ley 18.331; ver [06](06-pagos-y-seguridad.md#datos-personales-ley-18331)).
- Pensado primero para **celular** y con **SEO local** ("masajes en Montevideo / [barrio]").

### Datos que se piden al reservar
| Dato | Motivo |
|---|---|
| Servicio | Lo elige en el calendario |
| Nombre | Identificación |
| Fecha de nacimiento | Pedido por Micaela; la edad se calcula (¿atiende menores? → [pendientes](pendientes.md)) |
| Teléfono (WhatsApp) | Contacto |
| Email | Confirmación, dirección y recordatorios |
| Motivo de consulta (opcional) | Pedido por Micaela. **Es un dato de salud** (sensible). Opcional: ella completa la ficha después, por WhatsApp o en persona |
| Consentimiento | Checkbox con link a la política de privacidad |

Micaela arma la ficha completa del cliente después, en persona.

### Pagos
- **Seña** (por defecto 50%, configurable).
- **MercadoPago:** confirmación automática.
- **Transferencia bancaria:** precio con descuento (configurable) y confirmación manual por parte de Micaela, **después de ver la plata en su cuenta**.

### Panel de administración (solo Micaela)
- Ver las reservas (lista y calendario). Confirmar transferencias, cancelar, marcar "completada" o "no asistió".
- Gestionar **servicios** (alta, baja, precio, duración, foto, orden).
- Definir el **horario semanal** y los **días bloqueados** (vacaciones, feriados).
- **Configuración:** ver la tabla de abajo.
- Editar los **textos de las políticas** (cancelación).

### Configuración inicial (editable desde el panel)

| Parámetro | Valor inicial |
|---|---|
| Porcentaje de seña | 50% |
| Descuento por transferencia | 10% |
| Minutos de bloqueo pagando con MercadoPago | 10 |
| Horas de bloqueo pagando por transferencia | 2 |
| Descanso entre sesiones | 15 min |
| Anticipación mínima para reservar | 12 h |
| Ventana máxima hacia adelante | 30 días |
| Horario semanal | Vacío (lo carga ella) |
| Datos bancarios | Vacío (los carga ella) |

### Política de cancelación (acordada en octubre 2026, editable)
> - Con **12 h o más** de anticipación, el turno **se reprograma** para otra fecha y la seña queda para el nuevo turno (no se reintegra).
> - Con **menos de 12 h** o si no te presentás, la seña se pierde.
> - Hay **15 min de tolerancia**: si llegás tarde, la sesión termina en el horario previsto.

## Fase 2
- **"Mis reservas":** el cliente ingresa su email, recibe un código de 6 dígitos y ve sus reservas próximas y pasadas ([ADR-009](decisiones/ADR-009-reserva-sin-cuenta.md)).
- Recordatorio automático el día anterior (email y, eventualmente, WhatsApp).
- **Gift cards** y **packs** (cuponeras).
- Reseñas de Google embebidas.
- Sincronización opcional con Google Calendar de Micaela.

## Fase 3
- Blog (SEO).
- Ficha del cliente digital (historial de sesiones).
- Cupones de descuento (ej. primera sesión).
