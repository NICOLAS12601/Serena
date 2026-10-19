// Calls from the admin panel (browser) to the API, through the /api proxy.
// The session cookie travels automatically; nothing is stored in JavaScript.

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Turns the API's error body (string or list of messages) into one sentence. */
function errorMessage(body: unknown, status: number): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string") return message;
  return `Algo salió mal (error ${status}). Probá de nuevo.`;
}

export async function adminFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: init.method ?? "GET",
    credentials: "same-origin",
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (response.status === 401 && path !== "/auth/login") {
    // Session missing or expired: back to the login screen.
    // A full reload (not router.push) drops any panel data left in memory.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/login";
    throw new AdminApiError("Tenés que iniciar sesión.", 401);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new AdminApiError(
      errorMessage(body, response.status),
      response.status,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

// ─── Types returned by the admin endpoints ─────────────────────────────────

export type AdminService = {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
  icon: string | null;
  isFirstVisit: boolean;
  active: boolean;
  sortOrder: number;
  _count: { bookings: number };
};

export type WeeklyRange = {
  weekday: number;
  startMinutes: number;
  endMinutes: number;
};

export type TimeOff = {
  id: number;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export type AdminSettings = {
  depositPercent: number;
  transferDiscountPercent: number;
  mpHoldMinutes: number;
  transferHoldHours: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  bankDetails: string | null;
  address: string | null;
  neighborhood: string | null;
  whatsappNumber: string | null;
  notificationEmail: string | null;
  cancellationPolicyText: string | null;
};

export type ClientSummary = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  birthDate: string;
  createdAt: string;
  _count: { bookings: number };
  bookings: { startsAt: string }[];
};

export type ClientDetail = Omit<ClientSummary, "_count" | "bookings"> & {
  bookings: {
    id: number;
    startsAt: string;
    status: string;
    paymentMethod: string;
    paymentPlan: string;
    priceSnapshot: number;
    depositAmount: number;
    reason: string | null;
    service: { name: string };
  }[];
};

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PENDING_VERIFICATION"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED"
  | "EXPIRED";

export type AdminBooking = {
  id: number;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  paymentMethod: "MERCADO_PAGO" | "BANK_TRANSFER";
  paymentPlan: "DEPOSIT" | "FULL";
  priceSnapshot: number;
  depositAmount: number;
  holdExpiresAt: string | null;
  /** Transfer receipt received: the slot stays held until the money shows up. */
  receiptReceivedAt: string | null;
  /** Health data: shown only here. */
  reason: string | null;
  /** Total collected so far (approved payments). */
  paid: number;
  client: { id: number; name: string; phone: string };
  service: { id: number; name: string; durationMin: number };
};

export type BookingsOverview = {
  toReview: AdminBooking[];
  toClose: AdminBooking[];
  upcoming: AdminBooking[];
};

// ─── Formatting helpers ────────────────────────────────────────────────────

/** "09:00" <-> 540 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Date and time as seen in Montevideo, whatever the computer's time zone. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-UY", {
    timeZone: "America/Montevideo",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
  });
}

export function ageFrom(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getUTCMonth() ||
    (today.getMonth() === birth.getUTCMonth() &&
      today.getDate() < birth.getUTCDate());
  if (beforeBirthday) age--;
  return age;
}
