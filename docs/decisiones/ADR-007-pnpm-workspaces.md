# ADR-007 · pnpm workspaces como gestor del monorepo

- **Estado:** Aceptada
- **Fecha:** 2026-09-27

## Contexto
El monorepo ([ADR-001](ADR-001-nextjs-y-nestjs-separados.md)) tiene dos aplicaciones, cada una con sus dependencias. Hace falta una herramienta que instale todo desde la raíz, permita compartir código entre las apps y corra tareas en ambas a la vez.

## Decisión
Usar **pnpm workspaces**. Las apps viven en `apps/*` (declarado en `pnpm-workspace.yaml`) y la versión de pnpm queda fijada en el campo `packageManager` del `package.json` raíz.

## Alternativas consideradas
- **npm workspaces:** viene con Node y no requiere instalar nada, pero es más lento y más permisivo: una app puede usar sin querer una librería que no declaró, y eso falla recién al desplegar.
- **Turborepo (sobre pnpm):** coordina tareas y cachea builds. Aporta poco con solo dos apps; se puede sumar después sin rehacer nada.

## Consecuencias
- ➕ Instalación rápida y un solo `pnpm-lock.yaml` para todo el repo.
- ➕ Estricto con las dependencias: cada app solo ve lo que declara en su `package.json`.
- ➕ pnpm bloquea por defecto los scripts de instalación de las dependencias; las permitidas se listan en `allowBuilds` (`pnpm-workspace.yaml`).
- ➖ Hay que tener pnpm instalado (o activarlo con `corepack enable`).
