# 03 · Arquitectura

## Vista general

```
[Navegador del cliente / de Micaela]
        │
        ▼
┌──────────────────┐   HTTP/JSON   ┌──────────────────┐        ┌──────────────┐
│ Next.js  (web)   │ ────────────► │ NestJS  (api)    │ ─────► │ PostgreSQL   │
│ sitio + panel    │               │ reservas, pagos  │ Prisma │ (Neon)       │
└──────────────────┘               └──────────────────┘        └──────────────┘
                                       │         ▲
                              envía    ▼         │ webhook ("hubo un pago")
                              emails  Resend   MercadoPago
```

## Las piezas

| Pieza | Qué es | Responsabilidad |
|---|---|---|
| **Next.js** (`apps/web`) | Framework de **frontend** basado en React | Todo lo que se ve: páginas públicas, calendario de reserva, panel de admin |
| **NestJS** (`apps/api`) | Framework de **backend** (API REST) | La lógica y las reglas: horarios libres, crear y bloquear reservas, pagos, emails, autenticación del admin |
| **PostgreSQL** | Base de datos relacional | Guardar servicios, horarios, reservas, pagos y configuración |
| **Prisma** | ORM | Definir las tablas en un esquema tipado y consultarlas desde TypeScript |
| **MercadoPago** | Pasarela de pagos | Cobrar la seña con tarjeta u otros medios |
| **Resend** | Servicio de email | Enviar confirmaciones y recordatorios |

> **Analogía:** Next.js es la vidriera y el mostrador; NestJS es la trastienda y la caja registradora; PostgreSQL es el cuaderno donde se anota todo.

Por qué Next.js **y** NestJS separados (y no todo en Next): ver [ADR-001](decisiones/ADR-001-nextjs-y-nestjs-separados.md).

## Estructura del repositorio (monorepo)

```
serena/
├── apps/
│   ├── web/                ← Next.js (puerto 3000)
│   └── api/                ← NestJS + esquema de Prisma (puerto 3001)
├── docs/                   ← esta documentación
├── package.json            ← scripts que corren en todas las apps (dev, build, lint)
├── pnpm-workspace.yaml     ← qué carpetas son apps del monorepo
├── pnpm-lock.yaml          ← versiones exactas instaladas (se versiona)
└── README.md
```

El gestor del monorepo es **pnpm workspaces** ([ADR-007](decisiones/ADR-007-pnpm-workspaces.md)).

## Hosting (entorno de producción)

| Pieza | Servicio | Costo | A tener en cuenta |
|---|---|---|---|
| Web | Netlify o Cloudflare Pages | Gratis | El plan gratis de **Vercel no permite uso comercial**, por eso no lo usamos |
| API | Render (free) | Gratis | La API "se duerme" después de un rato sin uso: la primera visita tarda ~30–50 s. Plan pago ≈ US$7/mes si molesta |
| Base de datos | Neon (free) | Gratis | Sobra para este volumen |
| Emails | Resend (free) | Gratis | Límite diario de envíos, holgado para este caso |
| Dominio | `.uy` / `.com.uy` | **Pago anual** | Se puede arrancar con el subdominio gratis del hosting |
| MercadoPago | — | Comisión por venta | Sin costo fijo |

> ⚠️ Los límites de los planes gratuitos cambian seguido. **Revisarlos al momento de desplegar.**

### ¿Qué es una "base de datos gestionada"?
En vez de instalar y mantener PostgreSQL en un servidor propio (backups, actualizaciones, que no se caiga), un proveedor (Neon) lo corre por nosotros y nos da una URL de conexión. Ver [ADR-003](decisiones/ADR-003-hosting-nube-y-pc-de-casa.md).

## Entornos

| Entorno | Dónde | Para qué |
|---|---|---|
| **Local** | La PC de desarrollo | Programar. Base de datos local (Docker) o una rama de Neon |
| **Staging** (opcional) | PC de casa con Docker + Cloudflare Tunnel | Aprender a desplegar y probar sin riesgo |
| **Producción** | Nube (tabla de arriba) | Lo que usan los clientes reales |

Por qué la PC de casa no es producción: [ADR-003](decisiones/ADR-003-hosting-nube-y-pc-de-casa.md).

## Secretos y configuración

- Las **claves** (MercadoPago, base de datos, Resend, JWT) van en variables de entorno (`.env`), **nunca en el repo**. Se versiona un `.env.example` con valores falsos.
- Los **datos del negocio** (dirección, datos bancarios, precios, horarios) viven en la **base de datos** y se editan desde el panel.
