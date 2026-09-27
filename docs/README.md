# Documentación de SERENA

Esta carpeta es la **memoria del proyecto**: qué se construye, por qué y cómo. Si retomás el proyecto después de un tiempo (o se lo pasás a otra persona), empezá por acá.

## Índice

| # | Documento | De qué trata |
|---|---|---|
| 01 | [Análisis de mercado](01-analisis-mercado.md) | Qué tienen 10 sitios de masajes y qué aprendimos |
| 02 | [Requerimientos y alcance](02-requerimientos.md) | Qué hace el sitio, por fases |
| 03 | [Arquitectura](03-arquitectura.md) | Piezas del sistema, hosting, entornos |
| 04 | [Modelo de datos](04-modelo-de-datos.md) | Tablas, estados de una reserva |
| 05 | [Flujo de reserva](05-flujo-de-reserva.md) | Bloqueo temporal y cómo evitamos turnos superpuestos |
| 06 | [Pagos y seguridad](06-pagos-y-seguridad.md) | MercadoPago, transferencia, webhooks, datos personales |
| 07 | [Marca](07-marca.md) | Identidad visual y fotos |
| — | [Decisiones (ADR)](decisiones/) | Una ficha por cada decisión importante |
| — | [Pendientes](pendientes.md) | Lo que falta definir |

## Convenciones

- **Documentación en español.** Código, nombres de variables y commits en **inglés** (el repo es público y sirve como portfolio).
- Las decisiones importantes se registran como **ADR** (*Architecture Decision Record*) en [`decisiones/`](decisiones/). Una ADR no se borra: si una decisión cambia, se escribe una nueva que la reemplaza.
- **Datos reales (dirección, datos bancarios, teléfono, precios) nunca van en el código**: se cargan desde el panel y viven en la base de datos. Los secretos (claves de API) van en `.env`, que no se sube.
