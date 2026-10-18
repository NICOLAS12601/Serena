// DEMO DATA for the booking screens while the API endpoints don't exist yet.
// Each block says what replaces it; delete it when that endpoint is ready.

/** Replaced by Settings.depositPercent (public settings endpoint). */
export const DEMO_DEPOSIT_PERCENT = 50;

/** Replaced by Settings.maxAdvanceDays. */
export const DEMO_MAX_ADVANCE_DAYS = 30;

/**
 * Replaced by GET /availability. Mirrors the sample opening hours of the seed:
 * Monday to Saturday, no Sundays.
 */
export function isDemoDayAvailable(date: Date): boolean {
  return date.getDay() !== 0;
}

export type Slot = { time: string; available: boolean };

/** Replaced by GET /availability?serviceId&date. One slot looks taken, to show that state. */
export function getDemoSlots(date: Date): Slot[] {
  const saturday = date.getDay() === 6;
  const times = saturday
    ? ["09:00", "10:30", "12:00"]
    : ["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"];
  const taken = date.getDate() % times.length;
  return times.map((time, index) => ({ time, available: index !== taken }));
}

/**
 * Replaced by Settings.cancellationPolicyText, edited by Micaela from the panel.
 * Wording from her designs; the 12-hour limit is pending confirmation
 * (the requirements draft said 24 hours).
 */
export const DEMO_POLICIES = [
  {
    icon: "calendar",
    title: "Reserva del turno",
    text: "Para confirmar tu turno es necesario realizar una seña. Una vez realizada la seña, el turno queda bloqueado exclusivamente para vos.",
  },
  {
    icon: "lock",
    title: "Sin seña, no hay reserva",
    text: "El turno no se considera reservado hasta que se haya recibido la seña.",
  },
  {
    icon: "clock",
    title: "Cancelación y reprogramación",
    text: "Si necesitás cancelar o reprogramar tu turno con más de 12 horas de anticipación, podés hacerlo sin perder la seña ni el turno.",
  },
  {
    icon: "x",
    title: "Cancelaciones con menos de 12 horas de anticipación",
    text: "Si cancelás con menos de 12 horas de anticipación, se pierde la seña y el turno.",
  },
] as const;
