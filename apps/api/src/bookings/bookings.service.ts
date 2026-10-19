import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { hashSessionToken } from '../auth/session-token.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { normalizeMobile } from '../common/phone.js';
import { TIME_ZONE, zonedTimeToUtc } from '../common/time.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateBookingDto } from './bookings.dto.js';
import { priceBooking } from './pricing.js';

const SLOT_TAKEN = 'Ese horario se acaba de ocupar. Elegí otro, por favor.';

/**
 * True if the database rejected the booking because it overlaps another one
 * (the exclusion constraint of ADR-004; PostgreSQL error 23P01).
 */
export function isOverlapError(error: unknown): boolean {
  const text = `${String(error)} ${JSON.stringify(error)}`;
  return text.includes('Booking_no_overlap') || text.includes('23P01');
}

/**
 * Pending bookings whose hold ran out still count for the no-overlap
 * constraint until their status changes, so free the ones overlapping
 * [startsAt, blockedUntil) before saving there (ADR-004).
 */
export function expireStaleHolds(
  tx: Prisma.TransactionClient,
  startsAt: Date,
  blockedUntil: Date,
  now: Date,
) {
  return tx.booking.updateMany({
    where: {
      status: { in: ['PENDING_PAYMENT', 'PENDING_VERIFICATION'] },
      holdExpiresAt: { lte: now },
      startsAt: { lt: blockedUntil },
      blockedUntil: { gt: startsAt },
    },
    data: { status: 'EXPIRED' },
  });
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateBookingDto, now = new Date()) {
    const phone = normalizeMobile(dto.phone);
    if (!phone) {
      throw new BadRequestException(
        'El celular no parece válido. Revisá que esté completo.',
      );
    }
    const birthDate = new Date(`${dto.birthDate}T00:00:00Z`);
    if (birthDate >= now || dto.birthDate < '1900-01-01') {
      throw new BadRequestException('La fecha de nacimiento no es válida.');
    }

    // The same calculation the calendar shows: checks opening hours, time
    // off, notice, window and the slot grid. It cannot see a booking created
    // a millisecond later: the database constraint covers that case.
    const slots = await this.availability.daySlots(
      dto.serviceId,
      dto.date,
      now,
    );
    if (!slots.some((slot) => slot.time === dto.time && slot.available)) {
      throw new ConflictException(SLOT_TAKEN);
    }

    const [service, settings] = await Promise.all([
      this.prisma.service.findUniqueOrThrow({ where: { id: dto.serviceId } }),
      this.prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
    ]);
    const [hours, minutes] = dto.time.split(':').map(Number);
    const startsAt = zonedTimeToUtc(dto.date, hours * 60 + minutes);
    const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);
    const blockedUntil = new Date(
      endsAt.getTime() + settings.bufferMinutes * 60_000,
    );
    const pricing = priceBooking(
      service.price,
      dto.paymentMethod,
      dto.paymentPlan,
      settings,
    );
    const transfer = dto.paymentMethod === 'BANK_TRANSFER';
    const holdExpiresAt = new Date(
      now.getTime() +
        (transfer
          ? settings.transferHoldHours * 3_600_000
          : settings.mpHoldMinutes * 60_000),
    );
    const email = dto.email?.trim().toLowerCase() || null;

    let booking;
    try {
      booking = await this.prisma.$transaction(async (tx) => {
        await expireStaleHolds(tx, startsAt, blockedUntil, now);

        // Recognized by phone (ADR-012). Existing data is kept; only a missing
        // email is filled in, and only if no other client uses it.
        const emailOwner = email
          ? await tx.client.findUnique({ where: { email } })
          : null;
        const usableEmail =
          emailOwner && emailOwner.phone !== phone ? null : email;
        const client = await tx.client.upsert({
          where: { phone },
          update: {},
          create: {
            name: dto.name.trim(),
            phone,
            email: usableEmail,
            birthDate,
          },
        });
        if (!client.email && usableEmail) {
          await tx.client.update({
            where: { id: client.id },
            data: { email: usableEmail },
          });
        }

        return tx.booking.create({
          data: {
            clientId: client.id,
            serviceId: service.id,
            startsAt,
            endsAt,
            blockedUntil,
            status: transfer ? 'PENDING_VERIFICATION' : 'PENDING_PAYMENT',
            paymentMethod: dto.paymentMethod,
            paymentPlan: dto.paymentPlan,
            priceSnapshot: pricing.priceSnapshot,
            depositAmount: pricing.depositAmount,
            holdExpiresAt,
            reason: dto.reason?.trim() || null,
            privacyConsentAt: now,
            // The management link is shown once it exists; Micaela's
            // WhatsApp button generates a fresh one (ADR-012).
            manageTokenHash: hashSessionToken(
              randomBytes(32).toString('base64url'),
            ),
          },
          include: { client: { include: { _count: true } } },
        });
      });
    } catch (error) {
      if (isOverlapError(error)) throw new ConflictException(SLOT_TAKEN);
      throw error;
    }

    // Transfers need Micaela to check the bank. Mercado Pago bookings are
    // notified when the payment arrives (many are abandoned before paying).
    if (transfer) {
      void this.notifyNewTransfer(
        booking,
        service,
        pricing.amountDue,
        settings.notificationEmail,
      );
    }

    return {
      id: booking.id,
      status: booking.status,
      startsAt: booking.startsAt,
      holdExpiresAt: booking.holdExpiresAt,
      ...pricing,
      // Only shown to whoever just booked by transfer, never on the public site.
      bankDetails: transfer ? settings.bankDetails : null,
    };
  }

  /** Email to Micaela. A failure is logged and never undoes the booking. */
  private async notifyNewTransfer(
    booking: {
      startsAt: Date;
      holdExpiresAt: Date | null;
      paymentPlan: string;
      priceSnapshot: number;
      reason: string | null;
      client: { name: string; phone: string; _count: { bookings: number } };
    },
    service: { name: string; durationMin: number },
    amountDue: number,
    to: string | null,
  ) {
    if (!to) {
      this.logger.warn('New booking, but no notification email is set.');
      return;
    }
    const when = (date: Date, withDay: boolean) =>
      date.toLocaleString('es-UY', {
        timeZone: TIME_ZONE,
        ...(withDay ? { weekday: 'long', day: 'numeric', month: 'long' } : {}),
        hour: '2-digit',
        hourCycle: 'h23',
        minute: '2-digit',
      });
    const pesos = (amount: number) => `$ ${amount.toLocaleString('es-UY')}`;
    const { client } = booking;
    const firstTime = client._count.bookings <= 1;
    const lines = [
      'Nueva reserva por transferencia. Antes de confirmarla, revisá que la plata haya llegado a tu cuenta.',
      '',
      `Cliente: ${client.name}${firstTime ? ' (primera reserva)' : ''}`,
      `Celular: ${client.phone} · https://wa.me/${client.phone.replace(/\D/g, '')}`,
      `Servicio: ${service.name} (${service.durationMin} min)`,
      `Cuándo: ${when(booking.startsAt, true)} hs`,
      `Tiene que transferir: ${pesos(amountDue)} (${booking.paymentPlan === 'FULL' ? 'el total' : `seña; total ${pesos(booking.priceSnapshot)}`})`,
      booking.holdExpiresAt
        ? `Tiene hasta las ${when(booking.holdExpiresAt, false)} para mandarte el comprobante; si no, el turno se libera solo. Cuando te llegue, marcalo en el panel: el turno queda guardado hasta que veas la plata.`
        : '',
      // Health data stays in the panel, never in an email (Law 18.331).
      booking.reason ? 'Dejó un comentario: miralo en el panel.' : '',
    ];
    try {
      await this.notifications.sendEmail({
        to,
        subject: `Nueva reserva: ${client.name}, ${when(booking.startsAt, true)}`,
        text: lines.filter((line, i) => line || i === 1).join('\n'),
      });
    } catch (error) {
      this.logger.error(`Could not notify the new booking: ${String(error)}`);
    }
  }
}
