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
- La clave va solo en las variables de entorno de Netlify y Render, nunca en el repo. Para cambiarla: nuevo valor en los dos lados y redesplegar la web.

## Alternativas consideradas
- **Red privada entre web y API:** lo más sólido, pero Netlify y Render son empresas distintas y no comparten red; habría que tener las dos en el mismo proveedor (Render *Private Services*, pago).
- **Aceptar el riesgo:** los clientes reales siempre pasan por la web. Se descartó porque el ataque es simple y su efecto (agenda bloqueada) le pega directo al negocio.
- **Firma por pedido (HMAC con fecha):** evita que una clave robada sirva para siempre, pero suma complejidad; la clave solo viaja entre servidores por HTTPS y nunca llega al navegador.
- **Leer la IP de un encabezado propio de Netlify** (`x-nf-client-connection-ip`) en vez de contar proxies: menos frágil si cambia la cadena, pero ata la API a Netlify. Se puede sumar más adelante junto con la clave.

## Consecuencias
- ➕ Llamar a la API sin pasar por la web no sirve: 403 antes de llegar a cualquier lógica.
- ➕ `TRUST_PROXY` se mide una sola vez por el camino real; el camino directo deja de importar.
- ➖ Un valor más que mantener igual en dos proveedores; si no coinciden, la web muestra errores (403) hasta corregirlo.
- ➖ Los avisos (webhooks) de Mercado Pago tienen que entrar **por la web** (`/api/...` del dominio), no directo a Render, o marcar esa ruta como excepción.
