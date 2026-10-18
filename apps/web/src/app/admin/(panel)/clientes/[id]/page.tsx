"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  adminFetch,
  ageFrom,
  formatDateTime,
  type ClientDetail,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/api";
import { Card, Loading, Notice, PageHeader } from "../../../ui";

const STATUS: Record<string, string> = {
  PENDING_PAYMENT: "Pagando (Mercado Pago)",
  PENDING_VERIFICATION: "Esperando transferencia",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  NO_SHOW: "No vino",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<ClientDetail>(`/admin/clients/${id}`)
      .then(setClient)
      .catch((caught) => setError((caught as Error).message));
  }, [id]);

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!client) return <Loading />;

  const whatsapp = client.phone.replace(/\D/g, "");
  return (
    <>
      <Link
        href="/admin/clientes"
        className="mb-6 flex items-center gap-2 text-sm text-taupe hover:text-coffee"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Clientes
      </Link>
      <PageHeader
        title={client.name}
        description={`${ageFrom(client.birthDate)} años`}
      />
      <div className="flex flex-col gap-8">
        <Card title="Contacto">
          <dl className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-taupe">Teléfono</dt>
              <dd>
                {client.phone}{" "}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta underline underline-offset-2"
                  >
                    WhatsApp
                  </a>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-taupe">Email</dt>
              <dd>{client.email}</dd>
            </div>
            <div>
              <dt className="text-taupe">Cliente desde</dt>
              <dd>{formatDateTime(client.createdAt)}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Reservas">
          {client.bookings.length === 0 ? (
            <p className="text-taupe">Sin reservas.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line/70 text-sm">
              {client.bookings.map((booking) => (
                <li key={booking.id} className="py-4">
                  <div className="flex justify-between">
                    <p>
                      <span className="font-serif text-lg">
                        {booking.service.name}
                      </span>{" "}
                      <span className="text-taupe">
                        · {formatDateTime(booking.startsAt)}
                      </span>
                    </p>
                    <span className="rounded-full bg-blush px-3 py-1 text-xs">
                      {STATUS[booking.status] ?? booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-taupe">
                    {formatPrice(booking.priceSnapshot)} ·{" "}
                    {booking.paymentMethod === "BANK_TRANSFER"
                      ? "Transferencia"
                      : "Mercado Pago"}{" "}
                    ·{" "}
                    {booking.paymentPlan === "FULL"
                      ? "pagó el total"
                      : `seña de ${formatPrice(booking.depositAmount)}`}
                  </p>
                  {booking.reason && (
                    <p className="mt-2 rounded-lg bg-blush/50 px-3 py-2">
                      <span className="text-taupe">Motivo de consulta:</span>{" "}
                      {booking.reason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
