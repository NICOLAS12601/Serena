"use client";

import { useCallback, useEffect, useState } from "react";
import { ServiceIcon } from "@/components/service-icon";
import { adminFetch, type AdminService } from "@/lib/admin-api";
import { formatPrice } from "@/lib/api";
import {
  Button,
  Card,
  Field,
  INPUT,
  Loading,
  Notice,
  PageHeader,
} from "../../ui";

type Draft = {
  name: string;
  description: string;
  durationMin: number;
  price: number;
  icon: string;
  isFirstVisit: boolean;
  active: boolean;
  sortOrder: number;
};

const ICONS = [
  { value: "lotus", label: "Loto" },
  { value: "leaf", label: "Hoja" },
  { value: "waves", label: "Ondas" },
  { value: "wood-roller", label: "Rodillo de madera" },
];

const EMPTY: Draft = {
  name: "",
  description: "",
  durationMin: 60,
  price: 0,
  icon: "lotus",
  isFirstVisit: false,
  active: true,
  sortOrder: 0,
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<AdminService[] | null>(null);
  // null = list view; "new" = creating; a number = editing that service.
  const [editing, setEditing] = useState<"new" | number | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(() => {
    adminFetch<AdminService[]>("/admin/services").then(setServices);
  }, []);
  useEffect(load, [load]);

  async function toggleActive(service: AdminService) {
    await adminFetch(`/admin/services/${service.id}`, {
      method: "PATCH",
      body: { active: !service.active },
    });
    load();
  }

  async function remove(service: AdminService) {
    if (!window.confirm(`¿Borrar "${service.name}"? No se puede deshacer.`))
      return;
    try {
      await adminFetch(`/admin/services/${service.id}`, { method: "DELETE" });
      setNotice({ kind: "ok", text: `"${service.name}" se borró.` });
      load();
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    }
  }

  if (!services) return <Loading />;

  if (editing !== null) {
    const service =
      editing === "new" ? null : services.find((s) => s.id === editing);
    return (
      <ServiceForm
        service={service ?? null}
        nextOrder={Math.max(0, ...services.map((s) => s.sortOrder)) + 1}
        onDone={(text) => {
          setEditing(null);
          if (text) setNotice({ kind: "ok", text });
          load();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Lo que aparece en el sitio para reservar. Los inactivos no se muestran."
        actions={
          <Button onClick={() => setEditing("new")}>Nuevo servicio</Button>
        }
      />
      {notice && (
        <div className="mb-6">
          <Notice kind={notice.kind}>{notice.text}</Notice>
        </div>
      )}
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-taupe">
            <tr>
              <th className="py-3 font-normal">Servicio</th>
              <th className="py-3 font-normal">Duración</th>
              <th className="py-3 font-normal">Precio</th>
              <th className="py-3 font-normal">Estado</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className="border-b border-line/60 last:border-0"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush">
                      <ServiceIcon icon={service.icon} className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-serif text-lg">{service.name}</p>
                      {service.isFirstVisit && (
                        <p className="text-xs text-terracotta">
                          Solo para clientes nuevos
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4">{service.durationMin} min</td>
                <td className="py-4">{formatPrice(service.price)}</td>
                <td className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleActive(service)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      service.active
                        ? "bg-olive/15 text-olive-dark"
                        : "bg-mist text-taupe"
                    }`}
                    title="Cambiar"
                  >
                    {service.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setEditing(service.id)}
                    >
                      Editar
                    </Button>
                    {service._count.bookings === 0 && (
                      <Button variant="danger" onClick={() => remove(service)}>
                        Borrar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function ServiceForm({
  service,
  nextOrder,
  onDone,
}: {
  service: AdminService | null;
  nextOrder: number;
  onDone: (message?: string) => void;
}) {
  const [draft, setDraft] = useState<Draft>(
    service
      ? {
          name: service.name,
          description: service.description ?? "",
          durationMin: service.durationMin,
          price: service.price,
          icon: service.icon ?? "lotus",
          isFirstVisit: service.isFirstVisit,
          active: service.active,
          sortOrder: service.sortOrder,
        }
      : { ...EMPTY, sortOrder: nextOrder },
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { ...draft, description: draft.description.trim() || null };
      if (service) {
        await adminFetch(`/admin/services/${service.id}`, {
          method: "PATCH",
          body,
        });
      } else {
        await adminFetch("/admin/services", { method: "POST", body });
      }
      onDone(`"${draft.name}" se guardó.`);
    } catch (caught) {
      setError((caught as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title={service ? `Editar "${service.name}"` : "Nuevo servicio"}
        actions={
          <>
            <Button variant="secondary" onClick={() => onDone()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </>
        }
      />
      {error && (
        <div className="mb-6">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
      <Card>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Nombre">
            <input
              required
              minLength={2}
              maxLength={80}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Ícono">
            <div className="flex items-center gap-3">
              <select
                value={draft.icon}
                onChange={(e) => set("icon", e.target.value)}
                className={`${INPUT} flex-1`}
              >
                {ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush">
                <ServiceIcon icon={draft.icon} className="h-6 w-6" />
              </span>
            </div>
          </Field>
          <div className="col-span-2">
            <Field
              label="Descripción"
              hint="Se muestra en la lista de masajes."
            >
              <textarea
                rows={3}
                maxLength={600}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
          <Field label="Duración (minutos)">
            <input
              type="number"
              required
              min={15}
              max={480}
              step={5}
              value={draft.durationMin}
              onChange={(e) => set("durationMin", Number(e.target.value))}
              className={INPUT}
            />
          </Field>
          <Field label="Precio ($)" hint="En pesos, sin centavos.">
            <input
              type="number"
              required
              min={0}
              step={50}
              value={draft.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className={INPUT}
            />
          </Field>
          <Field label="Orden" hint="Los números más bajos aparecen primero.">
            <input
              type="number"
              min={0}
              value={draft.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className={INPUT}
            />
          </Field>
          <div className="flex flex-col gap-3 pt-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 accent-terracotta"
              />
              Activo (se muestra en el sitio)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isFirstVisit}
                onChange={(e) => set("isFirstVisit", e.target.checked)}
                className="h-4 w-4 accent-terracotta"
              />
              Es el encuentro inicial (solo para clientes nuevos)
            </label>
          </div>
        </div>
      </Card>
    </form>
  );
}
