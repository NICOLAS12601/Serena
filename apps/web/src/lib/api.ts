// Calls to the SERENA API (apps/api).

export type Service = {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  price: number; // whole Uruguayan pesos
  imageUrl: string | null;
  icon: string | null;
  isFirstVisit: boolean;
};

/** GET /settings/public: what the site needs from Micaela's configuration. */
export type PublicSettings = {
  depositPercent: number;
  transferDiscountPercent: number;
  transferHoldHours: number;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  neighborhood: string | null;
  whatsappNumber: string | null; // digits only, e.g. "59899123456"
};

// Server-side only (pages render on the server); browsers use the /api proxy.
const API_URL = process.env.API_URL ?? "http://localhost:3001";

// The key shared with the API (same as src/proxy.ts does for browser calls).
function apiFetch(path: string) {
  const key = process.env.INTERNAL_API_KEY;
  return fetch(`${API_URL}${path}`, {
    headers: key ? { "x-internal-api-key": key } : undefined,
  });
}

export async function getServices(): Promise<Service[]> {
  const response = await apiFetch("/services");
  if (!response.ok) {
    throw new Error(`GET /services failed with status ${response.status}`);
  }
  return response.json();
}

/** Like getServices, but returns null instead of throwing (page shows a message). */
export async function getServicesOrNull(): Promise<Service[] | null> {
  try {
    return await getServices();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getPublicSettingsOrNull(): Promise<PublicSettings | null> {
  try {
    const response = await apiFetch("/settings/public");
    if (!response.ok) {
      throw new Error(
        `GET /settings/public failed with status ${response.status}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function formatPrice(pesos: number): string {
  // Non-breaking space so "$" never ends up alone at the end of a line.
  return `$\u00a0${pesos.toLocaleString("es-UY")}`;
}
