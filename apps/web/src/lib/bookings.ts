// Creating a booking from the browser, through the /api proxy.

export type PaymentMethod = "MERCADO_PAGO" | "BANK_TRANSFER";
/** How much is paid online now; the rest is paid after the session. */
export type PaymentPlan = "DEPOSIT" | "FULL";

export type NewBooking = {
  serviceId: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM", Montevideo
  name: string;
  phone: string; // E.164
  email: string;
  birthDate: string;
  reason: string;
  policiesAccepted: boolean;
  privacyConsent: boolean;
  paymentMethod: PaymentMethod;
  paymentPlan: PaymentPlan;
};

/** What the API answers: the amounts it computed, not the ones the page showed. */
export type CreatedBooking = {
  id: number;
  status: string;
  startsAt: string;
  holdExpiresAt: string | null;
  priceSnapshot: number;
  depositAmount: number;
  amountDue: number;
  bankDetails: string | null;
};

export class BookingError extends Error {
  constructor(
    message: string,
    /** 409: someone else took the time in the meantime. */
    readonly slotTaken: boolean,
  ) {
    super(message);
  }
}

export async function createBooking(
  booking: NewBooking,
): Promise<CreatedBooking> {
  let response: Response;
  try {
    response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
    });
  } catch {
    throw new BookingError(
      "No pudimos conectarnos. Revisá tu conexión y probá de nuevo.",
      false,
    );
  }
  if (response.ok) return response.json();

  if (response.status === 429) {
    throw new BookingError(
      "Demasiados intentos seguidos. Esperá un minuto y probá de nuevo.",
      false,
    );
  }
  const body = await response.json().catch(() => null);
  const message = (body as { message?: unknown } | null)?.message;
  const text = Array.isArray(message)
    ? message.join(" ")
    : typeof message === "string"
      ? message
      : "Algo salió mal al guardar la reserva. Probá de nuevo.";
  throw new BookingError(text, response.status === 409);
}
