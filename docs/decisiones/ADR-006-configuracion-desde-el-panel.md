# ADR-006 · Todo lo operativo, configurable desde el panel

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
Horarios, precios, duraciones, política de cancelación y anticipación todavía están **a definir** y van a cambiar con el tiempo. Micaela los tiene que poder ajustar sin depender de un cambio de código. Además, el repo es **público**, así que los datos reales del negocio no pueden estar en el código.

## Decisión
- Tabla **`Settings`** (una sola fila) con los parámetros operativos: seña, descuento por transferencia, tiempos de bloqueo, descanso, anticipación, ventana, datos bancarios, dirección y textos de políticas.
- **Servicios, horarios semanales y días bloqueados** en sus propias tablas, editables desde el panel.
- Valores iniciales razonables mediante un *seed* (ver [02](../02-requerimientos.md#configuración-inicial-editable-desde-el-panel)).

## Consecuencias
- ➕ Micaela es autónoma, no hay que redesplegar por cambios operativos y no quedan datos sensibles en el repo.
- ➖ Más pantallas en el panel y más validación (por ejemplo, que la seña esté entre 0 y 100%).
