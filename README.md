# SERENA · Masajes & Bienestar

> *Un momento para vos.*

**ES** — Sitio web y sistema de reservas online para SERENA, un emprendimiento de masajes en Montevideo, Uruguay. Permite a los clientes ver los servicios, elegir día y horario, y reservar pagando una seña (MercadoPago o transferencia). Incluye un panel de administración para gestionar agenda, servicios, precios y políticas.

**EN** — Website and online booking system for SERENA, a massage therapy business in Montevideo, Uruguay. Clients browse services, pick an available slot and book by paying a deposit (MercadoPago or bank transfer). Includes an admin panel to manage availability, services, pricing and policies.

## Estado / Status

🚧 En diseño — *In design phase.* La documentación de análisis y arquitectura está en [`docs/`](docs/README.md).

## Stack

| Capa / Layer | Tecnología |
|---|---|
| Frontend | Next.js (React + TypeScript) |
| Backend (API) | NestJS (TypeScript) |
| Base de datos | PostgreSQL (Neon) + Prisma ORM |
| Pagos | MercadoPago Checkout Pro + transferencia bancaria |
| Emails | Resend |

## Highlights técnicos / Technical highlights

- **Reserva con bloqueo temporal** (patrón tipo venta de entradas): el horario queda retenido mientras el cliente paga y se libera si no completa el pago.
- **Sin reservas superpuestas garantizado por la base de datos** (*exclusion constraint* de PostgreSQL), no solo por la lógica de la aplicación.
- **Webhooks de pago verificados**: firma validada y estado del pago consultado siempre a la API de MercadoPago (nunca se confía en el contenido del aviso).
- Todo lo operativo (horarios, precios, seña, políticas) es **configurable desde el panel**, sin tocar código.

## Documentación

Ver [`docs/README.md`](docs/README.md).
