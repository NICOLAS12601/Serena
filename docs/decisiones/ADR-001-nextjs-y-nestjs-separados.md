# ADR-001 · Next.js (web) + NestJS (API) separados, en un monorepo

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
Se necesita un sitio público, un panel de admin y una lógica de negocio con cierta complejidad (disponibilidad, bloqueos, pagos, webhooks). Además del resultado, el proyecto busca **aprender**, tener **control total del código** y servir como **portfolio**. El desarrollador ya conoce NestJS de un proyecto facultativo.

## Decisión
- **Frontend:** Next.js (React + TypeScript) en `apps/web`.
- **Backend:** NestJS (TypeScript) en `apps/api`, que expone una API REST.
- **Monorepo:** ambos en el mismo repositorio.

## Alternativas consideradas
- **Solo Next.js (full-stack):** un único despliegue y más simple. Se descartó porque mezcla presentación y reglas de negocio, y aprovecha menos el conocimiento previo de NestJS. La separación en capas también se muestra mejor en un portfolio.
- **WordPress / Wix + plugin de reservas:** rápido, pero sin control ni aprendizaje, y pagos locales limitados.

## Consecuencias
- ➕ Separación clara de responsabilidades; la API se puede reutilizar (por ejemplo, una app en el futuro).
- ➕ Todo en TypeScript de punta a punta.
- ➖ Hay dos aplicaciones que desplegar y configurar (CORS, URLs entre ambas).
- ➖ En el hosting gratuito, la API puede tener un arranque lento (ver ADR-003).
