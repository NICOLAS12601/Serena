// DEMO DATA for the booking screens while the API endpoints don't exist yet.
// Each block says what replaces it; delete it when that endpoint is ready.

/** Replaced by Settings.depositPercent (public settings endpoint). */
export const DEMO_DEPOSIT_PERCENT = 50;

/** Replaced by Settings.transferDiscountPercent. */
export const DEMO_TRANSFER_DISCOUNT_PERCENT = 10;

/** Replaced by Settings.transferHoldHours. */
export const DEMO_TRANSFER_HOLD_HOURS = 2;

/** Replaced by Settings.whatsappNumber (international format, digits only, e.g. 598...). */
export const DEMO_WHATSAPP_NUMBER: string | null = null;

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
 * Basic rule: with 12+ hours of notice the booking is rescheduled and the
 * deposit is kept; with less notice it is lost. Micaela handles special cases
 * (e.g. full payments) one by one.
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
    title: "Reprogramación",
    text: "Si necesitás cambiar tu turno, avisanos con más de 12 horas de anticipación y lo reagendamos sin que pierdas la seña.",
  },
  {
    icon: "x",
    title: "Cancelaciones con menos de 12 horas de anticipación",
    text: "Si avisás con menos de 12 horas de anticipación o no te presentás, se pierde la seña.",
  },
] as const;
