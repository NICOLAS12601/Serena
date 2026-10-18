"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  adminFetch,
  ageFrom,
  formatDateTime,
  type ClientSummary,
} from "@/lib/admin-api";
import { Card, INPUT, Loading, PageHeader } from "../../ui";

export default function ClientsAdminPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientSummary[] | null>(null);

  // Search as you type, waiting a moment so not every keystroke hits the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = search.trim()
        ? `?q=${encodeURIComponent(search.trim())}`
        : "";
      adminFetch<ClientSummary[]>(`/admin/clients${query}`).then(setClients);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Se crean solos cuando alguien reserva. Se reconocen por su celular."
      />
      <input
        type="search"
        placeholder="Buscar por nombre, email o teléfono"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${INPUT} mb-6 w-full max-w-md`}
      />
      <Card>
        {!clients ? (
          <Loading />
        ) : clients.length === 0 ? (
          <p className="text-taupe">
            {search
              ? "No hay clientes que coincidan con la búsqueda."
              : "Todavía no hay clientes. Van a aparecer acá cuando el sitio empiece a guardar reservas."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-taupe">
              <tr>
                <th className="py-3 font-normal">Nombre</th>
                <th className="py-3 font-normal">Contacto</th>
                <th className="py-3 font-normal">Edad</th>
                <th className="py-3 font-normal">Reservas</th>
                <th className="py-3 font-normal">Última</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-line/60 last:border-0"
                >
                  <td className="py-3">
                    <Link
                      href={`/admin/clientes/${client.id}`}
                      className="font-serif text-lg hover:text-terracotta"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="py-3">
                    <p>{client.phone}</p>
                    <p className="text-taupe">{client.email}</p>
                  </td>
                  <td className="py-3">{ageFrom(client.birthDate)}</td>
                  <td className="py-3">{client._count.bookings}</td>
                  <td className="py-3 text-taupe">
                    {client.bookings[0]
                      ? formatDateTime(client.bookings[0].startsAt)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
