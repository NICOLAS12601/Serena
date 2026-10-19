import { Injectable, NotFoundException } from '@nestjs/common';
import {
  addDays,
  localDate,
  weekdayOf,
  zonedTimeToUtc,
} from '../common/time.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeSlots, type Slot } from './slots.js';

/** Used when Micaela reschedules a booking from the panel. */
export type AdminSlotOptions = {
  /** The booking being moved: it must not block its own new time. */
  excludeBookingId: number;
};

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /** Start times of one day ("YYYY-MM-DD"), available or not. */
  async daySlots(serviceId: number, date: string, now = new Date()) {
    const context = await this.load(serviceId, date, date, now);
    return context.slotsFor(date);
  }

  /**
   * Same calculation for Micaela: opening hours, time off and other bookings
   * still apply, but not the minimum notice or the booking window (she can
   * move a session to tomorrow), and the service may be inactive.
   */
  async adminDaySlots(
    serviceId: number,
    date: string,
    options: AdminSlotOptions,
    now = new Date(),
  ) {
    const context = await this.load(serviceId, date, date, now, options);
    return context.slotsFor(date);
  }

  /** Days of a month ("YYYY-MM") with at least one available start time. */
  async availableDays(serviceId: number, month: string, now = new Date()) {
    const [year, monthNumber] = month.split('-').map(Number);
    const first = `${month}-01`;
    // Day 0 of the next month is the last day of this one.
    const last = new Date(Date.UTC(year, monthNumber, 0))
      .toISOString()
      .slice(0, 10);
    const context = await this.load(serviceId, first, last, now);
    const days: string[] = [];
    for (let date = first; date <= last; date = addDays(date, 1)) {
      if (context.slotsFor(date).some((slot) => slot.available)) {
        days.push(date);
      }
    }
    return days;
  }

  /**
   * Reads everything the calculation needs for the dates from..to in a few
   * queries, and returns a function that computes the slots of one date.
   */
  private async load(
    serviceId: number,
    from: string,
    to: string,
    now: Date,
    admin?: AdminSlotOptions,
  ) {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, ...(admin ? {} : { active: true }) },
    });
    if (!service) throw new NotFoundException('El servicio no existe.');

    const rangeStart = zonedTimeToUtc(from, 0);
    const rangeEnd = zonedTimeToUtc(addDays(to, 1), 0);
    const [settings, weekly, timeOff, bookings] = await Promise.all([
      this.prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
      this.prisma.weeklySchedule.findMany(),
      this.prisma.timeOff.findMany({
        where: { startsAt: { lt: rangeEnd }, endsAt: { gt: rangeStart } },
      }),
      this.prisma.booking.findMany({
        where: {
          startsAt: { lt: rangeEnd },
          blockedUntil: { gt: rangeStart },
          ...(admin ? { id: { not: admin.excludeBookingId } } : {}),
          // Bookings that hold the agenda: confirmed (or already past),
          // pending payment while their hold has not run out (ADR-004), or
          // transfers whose receipt Micaela already got (ADR-014).
          OR: [
            { status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] } },
            {
              status: { in: ['PENDING_PAYMENT', 'PENDING_VERIFICATION'] },
              holdExpiresAt: { gt: now },
            },
            {
              status: 'PENDING_VERIFICATION',
              receiptReceivedAt: { not: null },
            },
          ],
        },
        select: { startsAt: true, blockedUntil: true },
      }),
    ]);

    const today = localDate(now);
    const lastDay = admin
      ? '9999-12-31'
      : addDays(today, settings.maxAdvanceDays);
    const earliestStart = admin
      ? now
      : new Date(now.getTime() + settings.minAdvanceHours * 3_600_000);

    return {
      slotsFor: (date: string): Slot[] => {
        if (date < today || date > lastDay) return [];
        const weekday = weekdayOf(date);
        return computeSlots({
          date,
          ranges: weekly.filter((range) => range.weekday === weekday),
          durationMin: service.durationMin,
          bufferMinutes: settings.bufferMinutes,
          slotIntervalMinutes: settings.slotIntervalMinutes,
          timeOff,
          bookings,
          earliestStart,
        });
      },
    };
  }
}
