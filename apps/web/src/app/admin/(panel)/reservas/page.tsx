"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminFetch,
  type AdminBooking,
  type AdminSettings,
  type BookingStatus,
  type BookingsOverview,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/api";
import type { Slot } from "@/lib/availability";
import { Button, Card, INPUT, Loading, Notice, PageHeader } from "../../ui";

const TIME_ZONE = "America/Montevideo";

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "Pagando con Mercado Pago",
    className: "bg-mist text-taupe",
  },
  PENDING_VERIFICATION: {
    label: "Esperando transferencia",
    className: "bg-amber-100 text-amber-800",
  },
  CONFIRMED: { label: "Confirmada", className: "bg-olive/15 text-olive-dark" },
  COMPLETED: { label: "Completada", className: "bg-mist text-taupe" },
  NO_SHOW: { label: "No vino", className: "bg-red-50 text-red-700" },
  CANCELLED: { label: "Cancelada", className: "bg-red-50 text-red-700" },
  EXPIRED: { label: "Vencida", className: "bg-red-50 text-red-700" },
};

// ─── Formatting ─────────────────────────────────────────────────────────────

const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

/** "sábado 24 de octubre" */
const longDay = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("es-UY", {
      timeZone: TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(",", "");

const hour = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-UY", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
  });

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** "1 h 20 min" until the hold runs out. */
function timeLeft(iso: string): string {
  const minutes = Math.max(
    0,
    Math.round((new Date(iso).getTime() - Date.now()) / 60_000),
  );
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
}

/** What the client has to pay online for this booking. */
const amountDue = (booking: AdminBooking) =>
  booking.paymentPlan === "FULL"
    ? booking.priceSnapshot
    : booking.depositAmount;

function whatsappLink(phone: string, text?: string) {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * The confirmation Micaela sends: day, time, address and what is left to pay.
 * No emojis: WhatsApp Web and Desktop can garble them when they come in a
 * wa.me link (they show up as "�").
 */
function confirmationMessage(booking: AdminBooking, address: string | null) {
  const firstName = booking.client.name.trim().split(/\s+/)[0];
  const rest = booking.priceSnapshot - booking.paid;
  return [
    `¡Hola ${firstName}! Te confirmo tu reserva de ${booking.service.name} el ${longDay(booking.startsAt)} a las ${hour(booking.startsAt)} hs.`,
    address ? `La dirección es ${address}.` : "Te paso la dirección por acá.",
    booking.paid > 0
      ? `Recibí ${formatPrice(booking.paid)}${rest > 0 ? `; el resto (${formatPrice(rest)}) lo abonás el día de la sesión` : ""}.`
      : "",
    "¡Te espero!",
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Page ───────────────────────────────────────────────────────────────────

type Action = (booking: AdminBooking) => Promise<void>;

export default function BookingsAdminPage() {
  const [data, setData] = useState<BookingsOverview | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const reload = useCallback(
    () => adminFetch<BookingsOverview>("/admin/bookings").then(setData),
    [],
  );
  useEffect(() => {
    reload();
    adminFetch<AdminSettings>("/admin/settings").then(setSettings);
  }, [reload]);

  /** Runs an action against the API, shows the result and refreshes the lists. */
  const run = (
    path: string,
    okText: (booking: AdminBooking) => string,
    body?: unknown,
  ): Action => {
    return async (booking) => {
      setNotice(null);
      try {
        await adminFetch(`/admin/bookings/${booking.id}/${path}`, {
          method: "POST",
          body,
        });
        setNotice({ kind: "ok", text: okText(booking) });
      } catch (error) {
        setNotice({ kind: "error", text: (error as Error).message });
      }
      await reload();
    };
  };

  if (!data) return <Loading />;

  const confirmPayment = run(
    "confirm-payment",
    (b) =>
      `Reserva de ${b.client.name} confirmada. Avisale por WhatsApp desde "Próximas".`,
  );
  const cancel: Action = async (booking) => {
    if (
      !window.confirm(
        `¿Cancelar la reserva de ${booking.client.name} del ${longDay(booking.startsAt)}? El horario queda libre.`,
      )
    )
      return;
    await run(
      "cancel",
      (b) => `Reserva de ${b.client.name} cancelada.`,
    )(booking);
  };

  return (
    <>
      <PageHeader
        title="Reservas"
        description="Lo que tenés que revisar, las sesiones por cerrar y tu agenda."
        actions={
          <Button variant="secondary" onClick={() => reload()}>
            Actualizar
          </Button>
        }
      />
      {notice && (
        <div className="mb-6">
          <Notice kind={notice.kind}>{notice.text}</Notice>
        </div>
      )}
      {settings && !settings.address && (
        <div className="mb-6">
          <Notice kind="error">
            Todavía no cargaste tu dirección en Configuración: el mensaje de
            confirmación dirá que la pasás por WhatsApp.
          </Notice>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {data.toReview.length > 0 && (
          <Card title={`Para revisar (${data.toReview.length})`}>
            <p className="-mt-2 mb-4 text-sm text-taupe">
              Transferencias pendientes. Confirmá solo cuando veas la plata en
              tu cuenta, nunca por una captura.
            </p>
            <ul className="flex flex-col gap-3">
              {data.toReview.map((booking) => (
                <ReviewRow
                  key={booking.id}
                  booking={booking}
                  onConfirm={confirmPayment}
                  onCancel={cancel}
                />
              ))}
            </ul>
          </Card>
        )}

        {data.toClose.length > 0 && (
          <Card title={`Para cerrar (${data.toClose.length})`}>
            <p className="-mt-2 mb-4 text-sm text-taupe">
              Sesiones que ya pasaron. Anotá cuánto cobraste en el momento.
            </p>
            <ul className="flex flex-col gap-3">
              {data.toClose.map((booking) => (
                <CloseRow
                  key={booking.id}
                  booking={booking}
                  onComplete={(b, extraAmount) =>
                    run(
                      "complete",
                      (x) => `Sesión de ${x.client.name} completada.`,
                      { extraAmount },
                    )(b)
                  }
                  onNoShow={run(
                    "no-show",
                    (b) => `Marcaste que ${b.client.name} no vino.`,
                  )}
                />
              ))}
            </ul>
          </Card>
        )}

        <Card title="Próximas">
          {data.upcoming.length === 0 ? (
            <p className="text-taupe">No hay reservas próximas.</p>
          ) : (
            <Upcoming
              bookings={data.upcoming}
              address={settings?.address ?? null}
              onCancel={cancel}
              onRescheduled={(booking) => {
                setNotice({
                  kind: "ok",
                  text: `Reserva de ${booking.client.name} movida al ${longDay(booking.startsAt)} a las ${hour(booking.startsAt)}. Avisale por WhatsApp.`,
                });
                reload();
              }}
            />
          )}
        </Card>
      </div>
    </>
  );
}

// ─── Rows ───────────────────────────────────────────────────────────────────

function Who({ booking }: { booking: AdminBooking }) {
  return (
    <div>
      <Link
        href={`/admin/clientes/${booking.client.id}`}
        className="font-serif text-lg hover:text-terracotta"
      >
        {booking.client.name}
      </Link>
      <p className="text-sm text-taupe">
        {booking.service.name} · {capitalize(longDay(booking.startsAt))},{" "}
        {hour(booking.startsAt)} hs
      </p>
    </div>
  );
}

function ReviewRow({
  booking,
  onConfirm,
  onCancel,
}: {
  booking: AdminBooking;
  onConfirm: Action;
  onCancel: Action;
}) {
  const [busy, setBusy] = useState(false);
  const expired = booking.status === "EXPIRED";
  const act = (action: Action) => async () => {
    setBusy(true);
    await action(booking);
    setBusy(false);
  };
  return (
    <li className="flex items-center justify-between gap-6 rounded-xl border border-line bg-white p-4">
      <div>
        <Who booking={booking} />
        <p className="mt-1 text-sm">
          Transferencia de{" "}
          <strong className="font-normal">
            {formatPrice(amountDue(booking))}
          </strong>{" "}
          ({booking.paymentPlan === "FULL" ? "total" : "seña"}) ·{" "}
          {expired ? (
            <span className="text-red-700">
              venció: si la plata llegó igual, podés confirmarla
            </span>
          ) : (
            booking.holdExpiresAt && (
              <span className="text-amber-800">
                vence en {timeLeft(booking.holdExpiresAt)}
              </span>
            )
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={whatsappLink(booking.client.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-taupe/40 bg-white px-3 py-2 text-sm hover:border-terracotta"
          title="Abrir el chat"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
        </a>
        <Button disabled={busy} onClick={act(onConfirm)}>
          Llegó la plata
        </Button>
        {!expired && (
          <Button variant="danger" disabled={busy} onClick={act(onCancel)}>
            Cancelar
          </Button>
        )}
      </div>
    </li>
  );
}

function CloseRow({
  booking,
  onComplete,
  onNoShow,
}: {
  booking: AdminBooking;
  onComplete: (booking: AdminBooking, extraAmount: number) => Promise<void>;
  onNoShow: Action;
}) {
  const [extra, setExtra] = useState(
    String(Math.max(0, booking.priceSnapshot - booking.paid)),
  );
  const [busy, setBusy] = useState(false);
  return (
    <li className="flex items-center justify-between gap-6 rounded-xl border border-line bg-white p-4">
      <div>
        <Who booking={booking} />
        <p className="mt-1 text-sm text-taupe">
          Pagó {formatPrice(booking.paid)} de{" "}
          {formatPrice(booking.priceSnapshot)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          Cobrado hoy $
          <input
            type="number"
            min={0}
            step={1}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className={`${INPUT} w-28`}
          />
        </label>
        <Button
          disabled={busy || extra === ""}
          onClick={async () => {
            setBusy(true);
            await onComplete(booking, Number(extra));
            setBusy(false);
          }}
        >
          Completada
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onNoShow(booking);
            setBusy(false);
          }}
        >
          No vino
        </Button>
      </div>
    </li>
  );
}

function Upcoming({
  bookings,
  address,
  onCancel,
  onRescheduled,
}: {
  bookings: AdminBooking[];
  address: string | null;
  onCancel: Action;
  onRescheduled: (booking: AdminBooking) => void;
}) {
  const [moving, setMoving] = useState<number | null>(null);
  const days = new Map<string, AdminBooking[]>();
  for (const booking of bookings) {
    const key = dayKey(booking.startsAt);
    days.set(key, [...(days.get(key) ?? []), booking]);
  }
  return (
    <div className="flex flex-col gap-6">
      {[...days.values()].map((dayBookings) => (
        <section key={dayKey(dayBookings[0].startsAt)}>
          <h3 className="mb-2 border-b border-line pb-1 font-serif text-xl">
            {capitalize(longDay(dayBookings[0].startsAt))}
          </h3>
          <ul className="flex flex-col">
            {dayBookings.map((booking) => (
              <li
                key={booking.id}
                className="border-b border-line/60 py-3 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className="w-14 font-serif text-lg">
                    {hour(booking.startsAt)}
                  </span>
                  <div className="flex-1">
                    <Link
                      href={`/admin/clientes/${booking.client.id}`}
                      className="hover:text-terracotta"
                    >
                      {booking.client.name}
                    </Link>
                    <p className="text-sm text-taupe">
                      {booking.service.name} · pagó {formatPrice(booking.paid)}{" "}
                      de {formatPrice(booking.priceSnapshot)}
                    </p>
                    {booking.reason && (
                      <p className="mt-1 text-sm text-coffee">
                        <span className="text-taupe">Comentario:</span>{" "}
                        {booking.reason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${STATUS[booking.status].className}`}
                  >
                    {STATUS[booking.status].label}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    {booking.status === "CONFIRMED" && (
                      <a
                        href={whatsappLink(
                          booking.client.phone,
                          confirmationMessage(booking, address),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-olive px-3 py-2 text-sm text-cream hover:bg-olive-dark"
                      >
                        <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                        Avisar por WhatsApp
                      </a>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setMoving(moving === booking.id ? null : booking.id)
                      }
                    >
                      Reprogramar
                    </Button>
                    <Button variant="danger" onClick={() => onCancel(booking)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
                {moving === booking.id && (
                  <Reschedule
                    booking={booking}
                    onClose={() => setMoving(null)}
                    onDone={(moved) => {
                      setMoving(null);
                      onRescheduled(moved);
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Pick a new day and a free time for a booking. */
function Reschedule({
  booking,
  onClose,
  onDone,
}: {
  booking: AdminBooking;
  onClose: () => void;
  onDone: (booking: AdminBooking) => void;
}) {
  const [date, setDate] = useState(dayKey(booking.startsAt));
  const [slots, setSlots] = useState<{ date: string; slots: Slot[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    adminFetch<{ date: string; slots: Slot[] }>(
      `/admin/bookings/${booking.id}/slots?date=${date}`,
    ).then(
      (result) => !cancelled && setSlots(result),
      (caught: Error) => !cancelled && setError(caught.message),
    );
    return () => {
      cancelled = true;
    };
  }, [booking.id, date]);

  const current = slots?.date === date ? slots.slots : null;

  async function move(time: string) {
    setError(null);
    try {
      onDone(
        await adminFetch<AdminBooking>(
          `/admin/bookings/${booking.id}/reschedule`,
          { method: "POST", body: { date, time } },
        ),
      );
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-blush/40 p-4">
      <div className="flex items-center gap-3 text-sm">
        <span>Mover a</span>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setError(null);
          }}
          className={INPUT}
        />
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-taupe underline underline-offset-2"
        >
          Cerrar
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {current === null && date && (
          <p className="text-sm text-taupe">Buscando horarios…</p>
        )}
        {current?.length === 0 && (
          <p className="text-sm text-taupe">Ese día no atendés.</p>
        )}
        {current?.map((slot) => (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => move(slot.time)}
            className="rounded-lg border border-taupe/40 bg-white px-3 py-1 text-sm hover:border-terracotta disabled:border-mist disabled:bg-mist disabled:text-taupe/60 disabled:line-through"
          >
            {slot.time}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-taupe">
        Lo que ya pagó queda en la reserva. Después avisale por WhatsApp.
      </p>
    </div>
  );
}
