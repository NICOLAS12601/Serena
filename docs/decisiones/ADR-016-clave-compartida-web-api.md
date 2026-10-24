# ADR-016 · La API solo atiende a la web (clave compartida)

- **Estado:** Aceptada
- **Fecha:** 2026-10-24

## Contexto
La API está publicada en Render con su propia dirección (`*.onrender.com`). El navegador nunca la llama directo: pasa por la web, que reenvía `/api/...` ([ADR-011](ADR-011-panel-de-administracion.md)). Los límites de intentos (5 logins y 10 reservas por minuto) cuentan por IP, y la IP del visitante se lee de `X-Forwarded-For` contando los proxies del camino (`TRUST_PROXY=5`, medido en el [despliegue de prueba](../08-despliegue.md#estado-del-despliegue-de-prueba)).

Llamando a Render directo hay menos proxies en el camino, así que la API toma como "IP del visitante" una que escribe el que llama: un script podía cambiarla en cada pedido y esquivar el límite de reservas para llenar la agenda de reservas pendientes.

## Decisión
- Una **clave secreta compartida** (`INTERNAL_API_KEY`), el mismo valor en Netlify (web) y en Render (API).
- La web la agrega en el encabezado `x-internal-api-key`:
  - a los pedidos del navegador a `/api/...`, desde `apps/web/src/proxy.ts` (el *proxy* de Next 16, antes *middleware*), antes del reenvío;
  - a los pedidos que hacen las páginas desde el servidor (`apps/web/src/lib/api.ts`).
- La API la exige en **todas** las rutas con un guard global (`InternalKeyGuard`), que corre antes que los límites de intentos y la sesión del panel. Sin clave o con una equivocada: **403**. La comparación es de tiempo constante.
- Excepción: `GET /health`, que Render llama directo para saber si la API está viva.
- En desarrollo la clave es opcional (sin ella pasa todo). En producción la API **no arranca** sin `INTERNAL_API_KEY`.
- **La IP del visitante la manda la web** (agregado el mismo día): el `proxy.ts` toma la que Netlify anota en su primer servidor (`x-nf-client-connection-ip`, el visitante no la puede falsificar), borra cualquier `x-client-ip` que haya mandado el visitante y la pasa en `x-client-ip`. La API (`common/client-ip.ts`) le cree **solo si el mismo pedido trae la clave**; los límites de intentos cuentan por esa IP. Así no importa cuántos intermediarios haya: contar proxies (`TRUST_PROXY`) se rompió una vez al agregar el propio `proxy.ts` (pasó de 5 a 6). `TRUST_PROXY` queda como respaldo si la web no manda la IP.
- La clave va solo en las variables de entorno de Netlify y Render, nunca en el repo. Para cambiarla: nuevo valor en los dos lados y redesplegar la web.

## Alternativas consideradas
- **Red privada entre web y API:** lo más sólido, pero Netlify y Render son empresas distintas y no comparten red; habría que tener las dos en el mismo proveedor (Render *Private Services*, pago).
- **Aceptar el riesgo:** los clientes reales siempre pasan por la web. Se descartó porque el ataque es simple y su efecto (agenda bloqueada) le pega directo al negocio.
- **Firma por pedido (HMAC con fecha):** evita que una clave robada sirva para siempre, pero suma complejidad; la clave solo viaja entre servidores por HTTPS y nunca llega al navegador.
- **Solo contar proxies (`TRUST_PROXY`) para la IP:** sin depender de Netlify, pero hay que volver a medir cada vez que cambia el camino, y si queda mal los límites se comparten entre todos o se pueden esquivar. Quedó como respaldo.

## Consecuencias
- ➕ Llamar a la API sin pasar por la web no sirve: 403 antes de llegar a cualquier lógica.
- ➕ La IP para los límites no depende de cuántos proxies haya en el camino.
- ➖ La web depende de un encabezado de Netlify (`x-nf-client-connection-ip`); si se cambia de proveedor, hay que leer el equivalente (si no, se usa el respaldo `TRUST_PROXY`).
- ➖ Un valor más que mantener igual en dos proveedores; si no coinciden, la web muestra errores (403) hasta corregirlo.
- ➖ Los avisos (webhooks) de Mercado Pago tienen que entrar **por la web** (`/api/...` del dominio), no directo a Render, o marcar esa ruta como excepción.
