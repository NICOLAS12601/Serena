"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  adminFetch,
  formatDateTime,
  minutesToTime,
  timeToMinutes,
  type TimeOff,
  type WeeklyRange,
} from "@/lib/admin-api";
import {
  Button,
  Card,
  Field,
  INPUT,
  Loading,
  Notice,
  PageHeader,
} from "../../ui";

// Shown Monday first; values are JavaScript's (0 = Sunday).
const DAYS = [
  { weekday: 1, label: "Lunes" },
  { weekday: 2, label: "Martes" },
  { weekday: 3, label: "Miércoles" },
  { weekday: 4, label: "Jueves" },
  { weekday: 5, label: "Viernes" },
  { weekday: 6, label: "Sábado" },
  { weekday: 0, label: "Domingo" },
];

type EditableRange = { weekday: number; start: string; end: string };

export default function ScheduleAdminPage() {
  return (
    <>
      <PageHeader
        title="Horarios y bloqueos"
        description="Tu horario de atención de cada semana y los días en que no atendés."
      />
      <div className="flex flex-col gap-8">
        <WeeklySchedule />
        <TimeOffSection />
      </div>
    </>
  );
}

// ─── Weekly schedule ─────────────────────────────────────────────────────────

function WeeklySchedule() {
  const [ranges, setRanges] = useState<EditableRange[] | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<WeeklyRange[]>("/admin/schedule").then((data) =>
      setRanges(
        data.map((range) => ({
          weekday: range.weekday,
          start: minutesToTime(range.startMinutes),
          end: minutesToTime(range.endMinutes),
        })),
      ),
    );
  }, []);

  if (!ranges) return <Loading />;

  const update = (index: number, change: Partial<EditableRange>) =>
    setRanges(
      ranges.map((range, i) => (i === index ? { ...range, ...change } : range)),
    );
  const add = (weekday: number) =>
    setRanges([...ranges, { weekday, start: "09:00", end: "13:00" }]);
  const remove = (index: number) =>
    setRanges(ranges.filter((_, i) => i !== index));

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      await adminFetch("/admin/schedule", {
        method: "PUT",
        body: {
          ranges: ranges!.map((range) => ({
            weekday: range.weekday,
            startMinutes: timeToMinutes(range.start),
            endMinutes: timeToMinutes(range.end),
          })),
        },
      });
      setNotice({ kind: "ok", text: "Horario guardado." });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    }
    setSaving(false);
  }

  return (
    <Card title="Horario semanal">
      <p className="-mt-2 mb-5 text-sm text-taupe">
        Podés poner varias franjas en un mismo día (por ejemplo, de 9 a 13 y de
        15 a 19). En los días sin franjas no se puede reservar.
      </p>
      <div className="flex flex-col divide-y divide-line/70">
        {DAYS.map(({ weekday, label }) => {
          const dayRanges = ranges
            .map((range, index) => ({ range, index }))
            .filter(({ range }) => range.weekday === weekday);
          return (
            <div key={weekday} className="flex items-start gap-6 py-4">
              <p className="w-28 pt-2 font-serif text-lg">{label}</p>
              <div className="flex flex-1 flex-col gap-2">
                {dayRanges.length === 0 && (
                  <p className="pt-2 text-sm text-taupe">No atendés</p>
                )}
                {dayRanges.map(({ range, index }) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <input
                      type="time"
                      step={900}
                      value={range.start}
                      onChange={(e) => update(index, { start: e.target.value })}
                      className={INPUT}
                    />
                    <span className="text-taupe">a</span>
                    <input
                      type="time"
                      step={900}
                      value={range.end}
                      onChange={(e) => update(index, { end: e.target.value })}
                      className={INPUT}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-taupe hover:text-red-700"
                      aria-label={`Quitar franja del ${label}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" onClick={() => add(weekday)}>
                <span className="flex items-center gap-1">
                  <Plus className="h-4 w-4" strokeWidth={1.5} /> Franja
                </span>
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar horario"}
        </Button>
        {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      </div>
    </Card>
  );
}

// ─── Time off ────────────────────────────────────────────────────────────────

/** Uruguay is UTC-3 all year (no daylight saving time since 2015). */
function toIso(date: string, time: string) {
  return `${date}T${time}:00-03:00`;
}

function TimeOffSection() {
  const [items, setItems] = useState<TimeOff[] | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("00:00");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("23:59");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminFetch<TimeOff[]>("/admin/time-off").then(setItems);
  }, []);
  useEffect(load, [load]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await adminFetch("/admin/time-off", {
        method: "POST",
        body: {
          startsAt: toIso(fromDate, fromTime),
          endsAt: toIso(toDate || fromDate, toTime),
          reason: reason.trim() || undefined,
        },
      });
      setFromDate("");
      setToDate("");
      setReason("");
      load();
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  async function remove(item: TimeOff) {
    if (!window.confirm("¿Quitar este bloqueo?")) return;
    await adminFetch(`/admin/time-off/${item.id}`, { method: "DELETE" });
    load();
  }

  return (
    <Card title="Días bloqueados">
      <p className="-mt-2 mb-5 text-sm text-taupe">
        Vacaciones, feriados o trámites: en esos días y horas no se puede
        reservar.
      </p>
      {!items ? (
        <Loading />
      ) : items.length === 0 ? (
        <p className="text-sm text-taupe">No tenés bloqueos próximos.</p>
      ) : (
        <ul className="mb-6 flex flex-col divide-y divide-line/70 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3"
            >
              <span>
                <strong className="font-normal">
                  {formatDateTime(item.startsAt)}
                </strong>{" "}
                →{" "}
                <strong className="font-normal">
                  {formatDateTime(item.endsAt)}
                </strong>
                {item.reason && (
                  <span className="text-taupe"> · {item.reason}</span>
                )}
              </span>
              <Button variant="danger" onClick={() => remove(item)}>
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 rounded-xl bg-blush/40 p-5">
        <p className="mb-4 font-serif text-lg">Nuevo bloqueo</p>
        <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-4">
          <Field label="Desde (día)">
            <input
              type="date"
              required
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Hora">
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Hasta (día)" hint="Vacío = el mismo día.">
            <input
              type="date"
              min={fromDate}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Hora">
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <Field label="Motivo (opcional, solo lo ves vos)">
              <input
                maxLength={200}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
          <Button type="submit">Agregar bloqueo</Button>
        </div>
        {error && (
          <div className="mt-4">
            <Notice kind="error">{error}</Notice>
          </div>
        )}
      </form>
    </Card>
  );
}
