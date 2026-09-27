# ADR-003 · Producción en la nube gratuita; PC de casa solo como staging

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
Se busca costo mínimo. Se evaluó alojar todo en una PC de la casa.

## Decisión
- **Producción** en servicios gestionados con plan gratuito: web en Netlify o Cloudflare Pages, API en Render, base de datos en Neon y emails con Resend.
- La **PC de casa**, opcionalmente, como **staging**: Docker + Cloudflare Tunnel, para aprender a desplegar sin arriesgar reservas reales.

## Alternativas consideradas
- **PC de casa como producción (con Cloudflare Tunnel):** costo cero y mucho aprendizaje. Se descartó porque un corte de luz o de internet, o un reinicio por actualizaciones, deja a los clientes sin poder reservar y sin que nadie se entere. Además exige PC encendida 24/7 y backups propios, y un servidor vulnerado queda **dentro de la red de la casa**.
- **Vercel para la web:** su plan gratuito (Hobby) **no permite uso comercial**.
- **VPS pago (~US$5/mes):** opción válida si el plan gratuito se queda corto.

## Consecuencias
- ➕ Alta disponibilidad y backups sin esfuerzo.
- ➖ La API gratuita de Render "se duerme" sin uso: la primera visita tarda unos segundos. Si molesta, se pasa a un plan pago (~US$7/mes).
- ➖ Los límites de los planes gratuitos pueden cambiar: revisarlos antes de desplegar.
