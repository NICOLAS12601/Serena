import {
  addDays,
  formatMinutes,
  localDate,
  weekdayOf,
  zonedTimeToUtc,
} from './time.js';

describe('time helpers', () => {
  it('turns Montevideo wall-clock time into the UTC instant (UTC-3)', () => {
    expect(zonedTimeToUtc('2026-10-22', 10 * 60).toISOString()).toBe(
      '2026-10-22T13:00:00.000Z',
    );
  });

  it('handles daylight saving in zones that have it', () => {
    // New York moves from UTC-5 to UTC-4 at 02:00 on 2026-03-08.
    expect(
      zonedTimeToUtc('2026-03-08', 60, 'America/New_York').toISOString(),
    ).toBe('2026-03-08T06:00:00.000Z');
    expect(
      zonedTimeToUtc('2026-03-08', 10 * 60, 'America/New_York').toISOString(),
    ).toBe('2026-03-08T14:00:00.000Z');
  });

  it('gives the Montevideo date, which can differ from the UTC date', () => {
    // 01:00 UTC on the 23rd is still 22:00 on the 22nd in Montevideo.
    expect(localDate(new Date('2026-10-23T01:00:00Z'))).toBe('2026-10-22');
  });

  it('computes weekdays, adds days and formats minutes', () => {
    expect(weekdayOf('2026-10-22')).toBe(4); // Thursday
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(formatMinutes(540)).toBe('09:00');
  });
});
