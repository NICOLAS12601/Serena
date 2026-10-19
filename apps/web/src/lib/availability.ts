// Free start times, asked from the browser through the /api proxy.
// The API does the math in Montevideo time (apps/api/src/availability).

export type Slot = { time: string; available: boolean };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`);
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
  return response.json();
}

/** Days ("YYYY-MM-DD") of a month ("YYYY-MM") with at least one free time. */
export async function fetchAvailableDays(
  serviceId: number,
  month: string,
): Promise<string[]> {
  const { days } = await getJson<{ days: string[] }>(
    `/availability/days?serviceId=${serviceId}&month=${month}`,
  );
  return days;
}

/** Start times of a day, including taken ones (shown crossed out). */
export async function fetchDaySlots(
  serviceId: number,
  date: string,
): Promise<Slot[]> {
  const { slots } = await getJson<{ slots: Slot[] }>(
    `/availability?serviceId=${serviceId}&date=${date}`,
  );
  return slots;
}

/** A calendar day as "YYYY-MM-DD", from its own year, month and day. */
export function isoDate(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${String(day.getDate()).padStart(2, "0")}`;
}
