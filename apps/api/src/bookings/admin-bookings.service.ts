import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { zonedTimeToUtc } from '../common/time.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { expireStaleHolds, isOverlapError } from './bookings.service.js';

type Status = Prisma.BookingGetPayload<object>['status'];

const LIST_SELECT = {
  id: true,
  startsAt: true,
  endsAt: true,
  status: true,
  paymentMethod: true,
  paymentPlan: true,
  priceSnapshot: true,
  depositAmount: true,
  holdExpiresAt: true,
  reason: true,
  client: { select: { id: true, name: true, phone: true } },
  service: { select: { id: true, name: true, durationMin: true } },
  payments: { where: { status: 'APPROVED' }, select: { amount: true } },
} satisfies Prisma.BookingSelect;

type ListedBooking = Prisma.BookingGetPayload<{ select: typeof LIST_SELECT }>;

/** Replaces the payments list with the total collected. */
function withPaid({ payments, ...booking }: ListedBooking) {
  return {
    ...booking,
    paid: payments.reduce((sum, payment) => sum + payment.amount, 0),
  };
}

const STATUS_NAMES: Record<Status, string> = {
  PENDING_PAYMENT: 'esperando el pago',
  PENDING_VERIFICATION: 'esperando la transferencia',
  CONFIRMED: 'confirmada',
  COMPLETED: 'completada',
  NO_SHOW: 'marcada como que no vino',
  CANCELLED: 'cancelada',
  EXPIRED: 'vencida',
};

const PENDING: Status[] = ['PENDING_PAYMENT', 'PENDING_VERIFICATION'];

/** Expired transfer bookings stay "to review" this long, for late transfers. */
const LATE_TRANSFER_WINDOW_MS = 48 * 3_600_000;

@Injectable()
export class AdminBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  /** The three blocks of the panel's bookings screen. */
  async overview(now = new Date()) {
    const [toReview, toClose, upcoming] = await Promise.all([
      // Transfers waiting for Micaela to check the bank, plus recently
      // expired ones: the money can arrive after the hold ran out.
      this.prisma.booking.findMany({
        where: {
          startsAt: { gt: now },
          OR: [
            { status: 'PENDING_VERIFICATION' },
            {
              status: 'EXPIRED',
              paymentMethod: 'BANK_TRANSFER',
              holdExpiresAt: {
                gte: new Date(now.getTime() - LATE_TRANSFER_WINDOW_MS),
              },
            },
          ],
        },
        orderBy: { startsAt: 'asc' },
        select: LIST_SELECT,
      }),
      // Sessions that already started and still need "completed" / "no-show".
      this.prisma.booking.findMany({
        where: { status: 'CONFIRMED', startsAt: { lte: now } },
        orderBy: { startsAt: 'asc' },
        select: LIST_SELECT,
      }),
      this.prisma.booking.findMany({
        where: {
          startsAt: { gt: now },
          status: { in: ['CONFIRMED', ...PENDING] },
        },
        orderBy: { startsAt: 'asc' },
        select: LIST_SELECT,
        take: 300,
      }),
    ]);
    return {
      toReview: toReview.map(withPaid),
      toClose: toClose.map(withPaid),
      upcoming: upcoming.map(withPaid),
    };
  }

  /** Micaela saw the money: the booking is confirmed and the payment recorded. */
  async confirmPayment(id: number, now = new Date()) {
    const booking = await this.find(id);
    this.expectStatus(booking.status, [...PENDING, 'EXPIRED']);
    const amount =
      booking.paymentPlan === 'FULL'
        ? booking.priceSnapshot
        : booking.depositAmount;
    try {
      await this.prisma.$transaction(async (tx) => {
        if (booking.status === 'EXPIRED') {
          // Its slot was released: it can be confirmed only if it is still free.
          await expireStaleHolds(
            tx,
            booking.startsAt,
            booking.blockedUntil,
            now,
          );
        }
        await tx.booking.update({
          where: { id },
          data: { status: 'CONFIRMED', holdExpiresAt: null },
        });
        if (amount > 0) {
          await tx.payment.create({
            data: {
              bookingId: id,
              amount,
              status: 'APPROVED',
              verifiedAt: now,
            },
          });
        }
      });
    } catch (error) {
      if (isOverlapError(error)) {
        throw new ConflictException(
          'Ese horario ya lo ocupó otra reserva, así que no se puede confirmar. Escribile a la persona para reprogramar.',
        );
      }
      throw error;
    }
    return this.findListed(id);
  }

  async cancel(id: number) {
    const booking = await this.find(id);
    this.expectStatus(booking.status, ['CONFIRMED', ...PENDING]);
    await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', holdExpiresAt: null },
    });
    return this.findListed(id);
  }

  /** The session happened; `extraAmount` is what was collected on the day. */
  async complete(id: number, extraAmount = 0, now = new Date()) {
    const booking = await this.find(id);
    this.expectStatus(booking.status, ['CONFIRMED']);
    this.expectStarted(booking.startsAt, now);
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id }, data: { status: 'COMPLETED' } });
      if (extraAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: id,
            amount: extraAmount,
            status: 'APPROVED',
            verifiedAt: now,
          },
        });
      }
    });
    return this.findListed(id);
  }

  async markNoShow(id: number, now = new Date()) {
    const booking = await this.find(id);
    this.expectStatus(booking.status, ['CONFIRMED']);
    this.expectStarted(booking.startsAt, now);
    await this.prisma.booking.update({
      where: { id },
      data: { status: 'NO_SHOW' },
    });
    return this.findListed(id);
  }

  /** Free times for moving this booking ("YYYY-MM-DD"). */
  async rescheduleSlots(id: number, date: string, now = new Date()) {
    const booking = await this.find(id);
    return this.availability.adminDaySlots(
      booking.serviceId,
      date,
      { excludeBookingId: id },
      now,
    );
  }

  /**
   * Moves the booking; payments stay with it (the deposit carries over when
   * the client gave enough notice, which Micaela judges case by case).
   */
  async reschedule(id: number, date: string, time: string, now = new Date()) {
    const booking = await this.find(id);
    this.expectStatus(booking.status, ['CONFIRMED', ...PENDING]);
    const slots = await this.rescheduleSlots(id, date, now);
    if (!slots.some((slot) => slot.time === time && slot.available)) {
      throw new ConflictException('Ese horario no está libre. Elegí otro.');
    }
    const [service, settings] = await Promise.all([
      this.prisma.service.findUniqueOrThrow({
        where: { id: booking.serviceId },
      }),
      this.prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
    ]);
    const [hours, minutes] = time.split(':').map(Number);
    const startsAt = zonedTimeToUtc(date, hours * 60 + minutes);
    const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);
    const blockedUntil = new Date(
      endsAt.getTime() + settings.bufferMinutes * 60_000,
    );
    try {
      await this.prisma.$transaction(async (tx) => {
        await expireStaleHolds(tx, startsAt, blockedUntil, now);
        await tx.booking.update({
          where: { id },
          data: { startsAt, endsAt, blockedUntil },
        });
      });
    } catch (error) {
      if (isOverlapError(error)) {
        throw new ConflictException(
          'Ese horario se acaba de ocupar. Elegí otro.',
        );
      }
      throw error;
    }
    return this.findListed(id);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private async find(id: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('La reserva no existe.');
    return booking;
  }

  private async findListed(id: number) {
    return withPaid(
      await this.prisma.booking.findUniqueOrThrow({
        where: { id },
        select: LIST_SELECT,
      }),
    );
  }

  private expectStatus(status: Status, allowed: Status[]) {
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `No se puede: la reserva está ${STATUS_NAMES[status]}.`,
      );
    }
  }

  private expectStarted(startsAt: Date, now: Date) {
    if (startsAt > now) {
      throw new BadRequestException('Esa sesión todavía no empezó.');
    }
  }
}
