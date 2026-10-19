import { formatMinutes, zonedTimeToUtc } from '../common/time.js';

export type Interval = { startsAt: Date; endsAt: Date };

export type Slot = { time: string; available: boolean };

export type SlotInput = {
  /** "YYYY-MM-DD" in Montevideo. */
  date: string;
  /** Opening hours of that weekday, in minutes since midnight. */
  ranges: { startMinutes: number; endMinutes: number }[];
  durationMin: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  /** Time off that touches the day. */
  timeOff: Interval[];
  /** Bookings that hold the agenda, each from startsAt to blockedUntil. */
  bookings: { startsAt: Date; blockedUntil: Date }[];
  /** Nothing starting before this instant is offered (now + minimum notice). */
  earliestStart: Date;
};

const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && bStart < aEnd;

/**
 * Start times of one day for a service (ADR-013):
 * - Candidates go every `slotIntervalMinutes` from the start of each opening
 *   range, as long as the session ends within the range.
 * - The break after the session only matters against other bookings: the
 *   last session of a range may end right at closing time.
 * - A candidate is unavailable if it overlaps time off, collides with a
 *   booking (same rule as the database's no-overlap constraint, ADR-008) or
 *   starts too soon.
 * Unavailable candidates are returned too, so the site can show them crossed out.
 */
export function computeSlots(input: SlotInput): Slot[] {
  const slots: Slot[] = [];
  const ranges = [...input.ranges].sort(
    (a, b) => a.startMinutes - b.startMinutes,
  );
  for (const range of ranges) {
    for (
      let minutes = range.startMinutes;
      minutes + input.durationMin <= range.endMinutes;
      minutes += input.slotIntervalMinutes
    ) {
      const startsAt = zonedTimeToUtc(input.date, minutes);
      const endsAt = new Date(startsAt.getTime() + input.durationMin * 60_000);
      const blockedUntil = new Date(
        endsAt.getTime() + input.bufferMinutes * 60_000,
      );
      const available =
        startsAt >= input.earliestStart &&
        !input.timeOff.some((off) =>
          overlaps(startsAt, endsAt, off.startsAt, off.endsAt),
        ) &&
        !input.bookings.some((booking) =>
          overlaps(
            startsAt,
            blockedUntil,
            booking.startsAt,
            booking.blockedUntil,
          ),
        );
      slots.push({ time: formatMinutes(minutes), available });
    }
  }
  return slots;
}
