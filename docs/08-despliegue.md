# Despliegue

Cómo se publica SERENA en la nube ([ADR-003](decisiones/ADR-003-hosting-nube-y-pc-de-casa.md)). Primero un **despliegue de prueba**: planes gratis, sin el dominio y con datos de prueba, para aprender y encontrar problemas con poco código. El dominio se conecta al lanzar.

## Cómo se conectan las piezas

```
Navegador ──► Netlify (la web, Next.js)        serena-xxx.netlify.app → después serenabienestar.uy
                 │  reenvía /api/... (rewrite, API_URL)
                 ▼
              Render (la API, NestJS)          serena-api.onrender.com
                 │  DATABASE_URL (secreta)
                 ▼
              Neon (PostgreSQL)
```

- El navegador **solo habla con la web**. La dirección de la API la conoce el servidor de Next (`API_URL`), y la de la base solo la API (`DATABASE_URL`).
- La API y la base igual están en internet: la seguridad no depende de esconder direcciones. Los endpoints de `/admin` exigen sesión y a la base solo se entra con la contraseña de la URL.
- En Cloudflare (DNS) va **solo la web** ([ADR-015](decisiones/ADR-015-dominio-uy-y-dns-en-cloudflare.md)).
- Orden para crear las cuentas: **Neon → Render → Netlify**, porque cada pieza necesita la dirección de la anterior.

## Estado del despliegue de prueba

| Pieza | Estado | Dónde |
|---|---|---|
| Base (Neon) | ✅ Creada (2026-10-23) | Proyecto `serena`, rama `production`, PostgreSQL 18, N. Virginia, plan Free |
| Tablas | ✅ Las creó Render con `prisma migrate deploy` (`btree_gist` funciona en Neon) | — |
| API (Render) | ✅ Live (2026-10-23) | `https://serena-api-atje.onrender.com` (Blueprint `serena`; el nombre `serena-api` ya estaba usado y Render agregó `-atje`) |
| Datos iniciales (seed) | ⏳ Falta | Sin la fila de `Settings`, `GET /settings/public` da 500 |
| Web (Netlify) | ⏳ Falta | — |
| `TRUST_PROXY` | ⏳ Falta medir | Ver abajo |

**Lo que se vio en la API (2026-10-23):** `GET /health` llamado directo a Render devolvió `198.41.230.66`, una IP de **Cloudflare**, no la del visitante: Render tiene a Cloudflare adelante, así que hay un proxy más de lo supuesto y `TRUST_PROXY=2` se queda corto en la llamada directa. Con `X-Forwarded-For: 6.6.6.6` siguió devolviendo la IP de Cloudflare: **no se deja falsificar**. El valor final se mide por el camino real (navegador → Netlify → Render), en el paso 4.

## 1. Base de datos: Neon
1. Crear una cuenta en [neon.com](https://neon.com) y un proyecto `serena`: **PostgreSQL 18**, región **AWS US East (N. Virginia)**.
2. Copiar la **connection string** (*Connect* → la opción **sin** *pooling*, que termina en `?sslmode=require`). Es la `DATABASE_URL`: **secreta**, no va en el repo ni en el chat.
3. Las tablas las crea Render en cada despliegue (`prisma migrate deploy`). La primera migración usa la extensión `btree_gist` (exclusion constraint): si Neon no la tuviera, ese paso falla con un mensaje claro.

## 2. API: Render
1. Crear una cuenta en [render.com](https://render.com) entrando con GitHub y darle acceso al repo.
2. *New* → **Blueprint** → elegir el repo. Render lee [`render.yaml`](../render.yaml) y pide los secretos:
   | Variable | Valor en la prueba |
   |---|---|
   | `DATABASE_URL` | La de Neon |
   | `WEB_ORIGIN` | La dirección de Netlify (se completa después; al principio cualquier valor) |
   | `TRUST_PROXY` | `2` para empezar; se ajusta en el paso 4 |
   | `RESEND_API_KEY` | La de Resend, o vacío (los mails se escriben en el log) |
   | `MAIL_FROM` | `SERENA <onboarding@resend.dev>` hasta verificar el dominio en Resend |
3. Esperar el primer despliegue y abrir `https://serena-api.onrender.com/health` (o el nombre que asigne Render): tiene que responder `{"status":"ok",...}`.
4. **Datos iniciales (una sola vez), desde la PC**, apuntando a Neon. En `apps/api`, con la `DATABASE_URL` de Neon y el email y la contraseña **reales** del panel (no los de prueba):
   ```powershell
   $env:DATABASE_URL="<la de Neon>"; $env:ADMIN_EMAIL="<email>"; $env:ADMIN_PASSWORD="<contraseña>"; pnpm db:seed
   ```
   Sin `NODE_ENV=production` también carga los servicios y horarios de prueba, que sirven para jugar. Después, cerrar esa terminal (las variables quedan solo en ella).

**Plan gratis:** la API se duerme a los 15 min sin uso y la primera visita tarda ~1 min. Dormida no corre la tarea que vence las reservas pendientes (igual se vencen al crear una reserva nueva que se superpone). Para el sitio real se recomienda el plan Starter (US$ 7/mes).

## 3. Web: Netlify
1. Crear una cuenta en [netlify.com](https://netlify.com) entrando con GitHub.
2. *Add new project* → *Import an existing project* → el repo. Netlify detecta el monorepo: elegir **`apps/web`** como proyecto. Detecta Next.js solo (usa el adaptador OpenNext; Next.js 16 está soportado).
   - Si no lo pregunta (pasó en la primera prueba: publicó la raíz del repo sin compilar y todo daba *Not Found*): *Project configuration → Build & deploy → Build settings* → **Base directory** vacío y **Package directory** `apps/web`. El comando y la carpeta de salida salen de [`apps/web/netlify.toml`](../apps/web/netlify.toml).
   - El proyecto nuevo puede quedar con **protección de acceso** (*Visitor access*): solo entra quien tenga sesión en Netlify (devuelve 401). Se cambia en *Project configuration → Access & security*.
3. En *Environment variables*: `API_URL` = la dirección de Render, **sin** barra final (`https://serena-api.onrender.com`).
4. Desplegar y abrir la dirección `*.netlify.app`. Volver a Render y poner esa dirección en `WEB_ORIGIN`.

## 4. Comprobar la IP real (límite de intentos)
La API limita intentos por IP: 5 logins por minuto al panel y 10 reservas por minuto, para que un script no llene la agenda de reservas pendientes. Detrás de los proxies, si no se lee bien la IP, **todos los visitantes comparten el mismo límite**.

1. Buscar tu IP pública (por ejemplo, en [ifconfig.me](https://ifconfig.me)).
2. Abrir `https://<la web>.netlify.app/api/health`: el campo `ip` tiene que ser **tu IP**. Si muestra la de un servidor, subir `TRUST_PROXY` de a 1 en Render; si muestra otra cosa rara, bajarlo.
3. Probar que no se pueda falsificar (desde PowerShell):
   ```powershell
   curl.exe -H "X-Forwarded-For: 6.6.6.6" https://<la web>.netlify.app/api/health
   ```
   Tiene que seguir mostrando **tu IP**, no `6.6.6.6`. Si muestra `6.6.6.6`, `TRUST_PROXY` está alto.

En la PC se comprobó que el proxy de Next (en desarrollo) reenvía el `X-Forwarded-For` tal cual llega, sin agregar nada: por eso el valor correcto depende de lo que agreguen Netlify y Render, y hay que medirlo.

## Al lanzar
- Conectar el dominio: en Netlify, agregar `serenabienestar.uy` y `www`; en Cloudflare, los registros que indique Netlify, en **DNS only**.
- Empezar con la base limpia (proyecto o rama nueva en Neon, o borrar los datos de prueba) y cargar los datos reales desde el panel.
- Pasar la API al plan pago si el arranque lento molesta.
