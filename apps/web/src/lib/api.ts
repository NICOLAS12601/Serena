// Calls to the SERENA API (apps/api).

export type Service = {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  price: number; // whole Uruguayan pesos
  imageUrl: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`);
  if (!response.ok) {
    throw new Error(`GET /services failed with status ${response.status}`);
  }
  return response.json();
}

export function formatPrice(pesos: number): string {
  return `$ ${pesos.toLocaleString("es-UY")}`;
}
