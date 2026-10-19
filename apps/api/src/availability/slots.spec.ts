import { computeSlots, type SlotInput } from './slots.js';

// Montevideo is UTC-3: 10:00 there is 13:00 UTC.
const at = (time: string) => new Date(`2026-10-22T${time}:00-03:00`);

// The example in docs/05-flujo-de-reserva.md: Thursday 09:00–13:00 and
// 15:00–19:00, an errand from 17:00, and a 60-min booking at 10:00 with a
// 15-min break (blocked until 11:15).
const example: SlotInput = {
  date: '2026-10-22',
  ranges: [
    { startMinutes: 15 * 60, endMinutes: 19 * 60 },
    { startMinutes: 9 * 60, endMinutes: 13 * 60 },
  ],
  durationMin: 60,
  bufferMinutes: 15,
  slotIntervalMinutes: 30,
  timeOff: [{ startsAt: at('17:00'), endsAt: at('19:00') }],
  bookings: [{ startsAt: at('10:00'), blockedUntil: at('11:15') }],
  earliestStart: new Date('2026-10-01T00:00:00Z'),
};

const available = (input: SlotInput) =>
  computeSlots(input)
    .filter((slot) => slot.available)
    .map((slot) => slot.time);

describe('computeSlots', () => {
  it('solves the documented example', () => {
    expect(available(example)).toEqual([
      '11:30',
      '12:00',
      '15:00',
      '15:30',
      '16:00',
    ]);
  });

  it('returns taken candidates too, in order, so they can be crossed out', () => {
    expect(computeSlots(example).map((slot) => slot.time)).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
    ]);
  });

  it('lets the last session end at closing time (break only between bookings)', () => {
    const slots = available({ ...example, timeOff: [], bookings: [] });
    expect(slots.at(-1)).toBe('18:00');
    expect(slots).toContain('12:00');
  });

  it('keeps the break before the next booking', () => {
    // Booking at 12:00: a session at 11:00 would end 12:00 but needs until 12:15.
    const slots = available({
      ...example,
      bookings: [{ startsAt: at('12:00'), blockedUntil: at('13:15') }],
    });
    expect(slots).not.toContain('11:00');
    expect(slots).toContain('10:30');
  });

  it('follows the configured interval', () => {
    const slots = available({
      ...example,
      ranges: [{ startMinutes: 9 * 60, endMinutes: 11 * 60 }],
      bookings: [],
      timeOff: [],
      slotIntervalMinutes: 15,
    });
    expect(slots).toEqual(['09:00', '09:15', '09:30', '09:45', '10:00']);
  });

  it('does not offer start times before the minimum notice', () => {
    const slots = available({ ...example, earliestStart: at('15:10') });
    expect(slots).toEqual(['15:30', '16:00']);
  });

  it('offers nothing on a day without opening hours', () => {
    expect(computeSlots({ ...example, ranges: [] })).toEqual([]);
  });
});
