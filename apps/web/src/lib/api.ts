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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`);
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

export function formatPrice(pesos: number): string {
  // Non-breaking space so "$" never ends up alone at the end of a line.
  return `$\u00a0${pesos.toLocaleString("es-UY")}`;
}
