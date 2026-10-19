// DEMO DATA for the booking screens while the API doesn't provide it yet.
// Delete it when the policies come from the database.

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
