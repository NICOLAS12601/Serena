// Dates as Micaela sees them: calendar days and wall-clock times in Montevideo,
// whatever the server's own time zone is (the API runs in the US).

export const TIME_ZONE = 'America/Montevideo';

/** "YYYY-MM-DD" of the given instant, in the business time zone. */
export function localDate(instant: Date, timeZone = TIME_ZONE): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant);
}

/** Minutes the time zone is ahead of UTC at that instant (Montevideo: -180). */
function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)!.value);
  const wallClockAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
  );
  return Math.round((wallClockAsUtc - instant.getTime()) / 60_000);
}

/**
 * The instant when the wall clock shows `minutes` after midnight of `date`
 * ("YYYY-MM-DD") in the time zone. E.g. ("2026-10-22", 600) -> 13:00 UTC.
 */
export function zonedTimeToUtc(
  date: string,
  minutes: number,
  timeZone = TIME_ZONE,
): Date {
  const [year, month, day] = date.split('-').map(Number);
  const asUtc = Date.UTC(year, month - 1, day, 0, minutes);
  // Correct by the offset; checked twice in case the guess crossed a
  // daylight-saving change (Uruguay has none today, but it had until 2015).
  let offset = offsetMinutes(new Date(asUtc), timeZone);
  const corrected = offsetMinutes(new Date(asUtc - offset * 60_000), timeZone);
  if (corrected !== offset) offset = corrected;
  return new Date(asUtc - offset * 60_000);
}

/** Day of the week of a "YYYY-MM-DD": 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** "YYYY-MM-DD" plus a number of days. */
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

/** 540 -> "09:00" */
export function formatMinutes(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  return `${hours}:${String(minutes % 60).padStart(2, '0')}`;
}
