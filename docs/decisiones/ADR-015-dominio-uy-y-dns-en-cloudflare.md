# ADR-015 · Dominio `serenabienestar.uy` en HostingenlaWeb, con el DNS en Cloudflare

- **Estado:** Aceptada
- **Fecha:** 2026-10-23

## Contexto
SERENA necesita un dominio propio. HostingenlaWeb (registrador acreditado de `.uy`) confirmó por mail estas condiciones:

| | `.com.uy` | `.uy` |
|---|---|---|
| Registro | US$ 50 + IVA por año | US$ 10 + IVA por año |
| Gestión del DNS (registros A, CNAME, TXT) | Incluida | **Aparte: US$ 8 + IVA por año** ("Gestionar DNS") |
| Transferencia a otro registrador | No se puede | Sí, con el código EPP desde el panel |
| Editar contactos (administrativo, técnico, financiero) | No | Sí, desde el panel |

Comprar el dominio y gestionar su DNS son dos servicios distintos: el registro hace que el nombre sea nuestro; el DNS es donde se anota a qué servidor apunta (registros A/CNAME para la web, TXT para verificar el dominio y para que los mails de Resend no caigan en spam). Los **nameservers** dicen qué empresa guarda esas anotaciones.

## Decisión
- Dominio **`serenabienestar.uy`**, registrado en **HostingenlaWeb** (comprado el 2026-10-23), **sin** plan de hosting y **sin** "Gestionar DNS".
- El DNS lo maneja **Cloudflare, plan Free** (permite uso comercial). En el panel del dominio se pusieron los nameservers personalizados de Cloudflare:
  - `lamar.ns.cloudflare.com`
  - `roxy.ns.cloudflare.com`
- En Cloudflare: verificación en dos pasos activada; bots de buscadores y de asistentes de IA permitidos (el sitio tiene que aparecer en búsquedas); *Bot Preference Sync* activado.
- Cloudflare **no aloja** el sitio: solo publica los registros. El hosting sigue siendo el de [ADR-003](ADR-003-hosting-nube-y-pc-de-casa.md).

## Alternativas consideradas
- **`.com.uy` (US$ 50, DNS incluido):** cinco veces más caro y el dominio queda atado al registrador (no se puede transferir).
- **`.uy` con "Gestionar DNS" (US$ 18 por año en total):** todo en un solo panel, pero US$ 8 más por año por algo que Cloudflare da gratis.
- **DNS en el proveedor de hosting (Netlify):** gratis, pero ata el DNS a ese proveedor. Cloudflare sirve con cualquier hosting.

## Consecuencias
- ➕ US$ 10 + IVA por año en total; el dominio se puede llevar a otro registrador.
- ➕ HTTPS gratis (certificado universal de Cloudflare) y la opción de pasar las visitas por Cloudflare (*proxy*, nube naranja): oculta la IP del servidor, cachea y filtra ataques.
- ➖ Dos cuentas: la renovación del dominio se paga en HostingenlaWeb y los registros se editan en Cloudflare.
- ➖ Si se activa DNSSEC, tiene que hacerse desde Cloudflare y cargarse en el registrador; mientras tanto, apagado.
