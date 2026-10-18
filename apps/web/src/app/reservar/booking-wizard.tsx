"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flower2,
  Hourglass,
  Lock,
  Mail,
  MapPin,
  Moon,
  Phone,
  Sun,
  Sunset,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "@/components/action-button";
import { BrandLogo } from "@/components/brand-logo";
import { PageShell } from "@/components/page-shell";
import { formatPrice, type Service } from "@/lib/api";
import {
  DEMO_DEPOSIT_PERCENT,
  DEMO_MAX_ADVANCE_DAYS,
  DEMO_POLICIES,
  getDemoSlots,
  isDemoDayAvailable,
  type Slot,
} from "@/lib/demo";

type Step = "date" | "time" | "policies" | "details" | "confirm" | "done";
const ORDER: Step[] = ["date", "time", "policies", "details", "confirm", "done"];

export type ClientDetails = {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  reason: string;
  privacyConsent: boolean;
};

const EMPTY_DETAILS: ClientDetails = {
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  reason: "",
  privacyConsent: false,
};

export function BookingWizard({ service, backHref }: { service: Service; backHref: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [details, setDetails] = useState<ClientDetails>(EMPTY_DETAILS);

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };
  const back = () => {
    const index = ORDER.indexOf(step);
    if (index === 0) router.push(backHref);
    else go(ORDER[index - 1]);
  };

  if (step === "done" && date && time) {
    return <DoneScreen service={service} date={date} time={time} />;
  }

  return (
    <PageShell onBack={back}>
      <DemoNotice />
      <Stepper step={step} />
      {step === "date" && (
        <DateStep
          selected={date}
          onSelect={(day) => {
            setDate(day);
            setTime(null);
          }}
          onContinue={() => go("time")}
        />
      )}
      {step === "time" && date && (
        <TimeStep
          date={date}
          selected={time}
          onSelect={setTime}
          onChangeDate={() => go("date")}
          onContinue={() => go("policies")}
        />
      )}
      {step === "policies" && (
        <PoliciesStep
          accepted={policiesAccepted}
          onAcceptedChange={setPoliciesAccepted}
          onContinue={() => go("details")}
        />
      )}
      {step === "details" && (
        <DetailsStep details={details} onChange={setDetails} onContinue={() => go("confirm")} />
      )}
      {step === "confirm" && date && time && (
        <ConfirmStep service={service} date={date} time={time} onConfirm={() => go("done")} />
      )}
    </PageShell>
  );
}

// ─── Shared pieces ──────────────────────────────────────────────────────────

function DemoNotice() {
  return (
    <p className="mb-6 rounded-xl border border-dashed border-terracotta/50 px-4 py-2 text-center text-xs text-terracotta">
      Modo demostración: los horarios son de ejemplo y la reserva todavía no se guarda.
    </p>
  );
}

const STEPPER: { label: string; steps: Step[] }[] = [
  { label: "Fecha", steps: ["date"] },
  { label: "Horario", steps: ["time"] },
  { label: "Tus datos", steps: ["policies", "details"] },
  { label: "Confirmar", steps: ["confirm"] },
];

function Stepper({ step }: { step: Step }) {
  const current = STEPPER.findIndex((item) => item.steps.includes(step));
  return (
    <ol className="mb-8 flex items-start justify-between">
      {STEPPER.map((item, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={item.label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg ${
                done || active ? "bg-terracotta text-cream" : "bg-blush text-taupe"
              }`}
            >
              {done ? <Check className="h-5 w-5" strokeWidth={1.5} /> : index + 1}
            </span>
            <span className={`text-xs ${active ? "text-coffee" : "text-taupe"}`}>
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-5xl font-medium">{title}</h1>
      {subtitle && <p className="mt-3 text-lg leading-snug">{subtitle}</p>}
    </div>
  );
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" });
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ─── Step 1: date ───────────────────────────────────────────────────────────

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function DateStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: Date | null;
  onSelect: (date: Date) => void;
  onContinue: () => void;
}) {
  const today = startOfDay(new Date());
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + DEMO_MAX_ADVANCE_DAYS);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Grid starts on Monday: getDay() is 0 for Sunday, so shift it to the end.
  const offset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];

  const isBookable = (day: Date) => day > today && day <= lastDay && isDemoDayAvailable(day);
  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoForward = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay;
  const shiftMonth = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <>
      <StepTitle
        title="Elegí la fecha"
        subtitle="Seleccioná el día que mejor se adapte a tu disponibilidad."
      />
      <div className="mb-4 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label="Mes anterior"
          className="disabled:opacity-20"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.25} />
        </button>
        <p className="font-serif text-3xl">
          {capitalize(month.toLocaleDateString("es-UY", { month: "long" }))} {month.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoForward}
          aria-label="Mes siguiente"
          className="disabled:opacity-20"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.25} />
        </button>
      </div>

      <div className="rounded-3xl bg-white/40 p-4">
        <div className="grid grid-cols-7 text-center text-sm text-taupe">
          {WEEKDAYS.map((day, index) => (
            <span key={index} className="py-2">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />;
            const bookable = isBookable(day);
            const isSelected = selected !== null && sameDay(day, selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={!bookable}
                onClick={() => onSelect(day)}
                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors ${
                  isSelected
                    ? "bg-terracotta text-cream"
                    : bookable
                      ? "hover:bg-blush"
                      : "text-taupe/40"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-5 flex flex-col items-center gap-1 text-sm text-taupe">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-terracotta" /> Día seleccionado
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-taupe/40" /> Día disponible
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-mist" /> Sin disponibilidad
        </li>
      </ul>

      <ActionButton onClick={onContinue} disabled={!selected} className="mt-8 w-full">
        Continuar
      </ActionButton>
    </>
  );
}

// ─── Step 2: time ───────────────────────────────────────────────────────────

const PERIODS = [
  { label: "Mañana", icon: Sun, from: 0, to: 13 * 60 },
  { label: "Tarde", icon: Sunset, from: 13 * 60, to: 20 * 60 },
  { label: "Noche", icon: Moon, from: 20 * 60, to: 24 * 60 },
];

function minutesOf(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function TimeStep({
  date,
  selected,
  onSelect,
  onChangeDate,
  onContinue,
}: {
  date: Date;
  selected: string | null;
  onSelect: (time: string) => void;
  onChangeDate: () => void;
  onContinue: () => void;
}) {
  const slots = getDemoSlots(date);
  return (
    <>
      <StepTitle
        title="Elegí el horario"
        subtitle={`Estos son los horarios disponibles para el ${formatLongDate(date)}.`}
      />
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-blush/80 px-4 py-3 text-sm text-terracotta">
        <span className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" strokeWidth={1.25} />
          {capitalize(formatLongDate(date))}
        </span>
        <button type="button" onClick={onChangeDate} className="underline underline-offset-4">
          Cambiar fecha
        </button>
      </div>

      {PERIODS.map(({ label, icon: Icon, from, to }) => {
        const periodSlots = slots.filter(
          (slot) => minutesOf(slot.time) >= from && minutesOf(slot.time) < to,
        );
        if (periodSlots.length === 0) return null;
        return (
          <section key={label} className="mb-6 border-b border-line pb-6 last:border-0">
            <h2 className="mb-3 flex items-center gap-3 font-serif text-xl">
              <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.25} /> {label}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {periodSlots.map((slot) => (
                <SlotButton
                  key={slot.time}
                  slot={slot}
                  selected={slot.time === selected}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        );
      })}

      <ActionButton onClick={onContinue} disabled={!selected} className="mt-2 w-full">
        Continuar
      </ActionButton>
    </>
  );
}

function SlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: Slot;
  selected: boolean;
  onSelect: (time: string) => void;
}) {
  if (!slot.available) {
    return (
      <span
        className="rounded-xl border border-mist bg-mist py-3 text-center text-taupe/60 line-through"
        aria-label={`${slot.time} no disponible`}
      >
        {slot.time}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(slot.time)}
      className={`rounded-xl border py-3 transition-colors ${
        selected
          ? "border-terracotta bg-terracotta text-cream"
          : "border-taupe/40 hover:border-terracotta"
      }`}
    >
      {slot.time}
    </button>
  );
}

// ─── Step 3a: policies ──────────────────────────────────────────────────────

const POLICY_ICONS = { calendar: CalendarDays, lock: Lock, clock: Clock, x: X };

function PoliciesStep({
  accepted,
  onAcceptedChange,
  onContinue,
}: {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <StepTitle
        title="Políticas de reserva y cancelación"
        subtitle="Para poder continuar con tu reserva, te pedimos que leas y aceptes nuestras políticas."
      />
      <ul className="flex flex-col gap-5 rounded-3xl bg-blush/70 p-5">
        {DEMO_POLICIES.map((policy) => {
          const Icon = POLICY_ICONS[policy.icon];
          return (
            <li key={policy.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5c4b3]">
                <Icon className="h-6 w-6" strokeWidth={1.25} />
              </span>
              <div>
                <h2 className="font-serif text-lg">{policy.title}</h2>
                <p className="text-sm text-taupe">{policy.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <label className="mt-6 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-terracotta"
        />
        Leí y acepto las políticas de reserva y cancelación.
      </label>
      <ActionButton onClick={onContinue} disabled={!accepted} className="mt-8 w-full">
        Continuar
      </ActionButton>
    </>
  );
}

// ─── Step 3b: client details ────────────────────────────────────────────────

function DetailsStep({
  details,
  onChange,
  onContinue,
}: {
  details: ClientDetails;
  onChange: (details: ClientDetails) => void;
  onContinue: () => void;
}) {
  const set = <K extends keyof ClientDetails>(key: K, value: ClientDetails[K]) =>
    onChange({ ...details, [key]: value });
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onContinue();
      }}
    >
      <StepTitle title="Tus datos" subtitle="Completá la información para confirmar tu reserva." />
      <div className="flex flex-col gap-4">
        <Field icon={User}>
          <input
            required
            autoComplete="name"
            placeholder="Nombre y apellido"
            value={details.name}
            onChange={(event) => set("name", event.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-taupe"
          />
        </Field>
        <Field icon={Phone}>
          <input
            required
            type="tel"
            autoComplete="tel"
            placeholder="Teléfono (WhatsApp)"
            value={details.phone}
            onChange={(event) => set("phone", event.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-taupe"
          />
        </Field>
        <Field icon={Mail}>
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={details.email}
            onChange={(event) => set("email", event.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-taupe"
          />
        </Field>
        <Field icon={CalendarDays}>
          <span className="flex w-full flex-col">
            <span className="text-xs text-taupe">Fecha de nacimiento</span>
            <input
              required
              type="date"
              max={todayIso}
              autoComplete="bday"
              value={details.birthDate}
              onChange={(event) => set("birthDate", event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </span>
        </Field>
        <label className="rounded-xl border border-taupe/40 bg-white/40 px-4 py-3">
          <textarea
            rows={4}
            placeholder="¿Querés contarnos algo más? (Alergias, lesiones, preferencias, etc.)"
            value={details.reason}
            onChange={(event) => set("reason", event.target.value)}
            className="w-full resize-none bg-transparent outline-none placeholder:text-taupe"
          />
          <span className="text-xs text-taupe">Opcional. Solo lo ve Micaela.</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            required
            type="checkbox"
            checked={details.privacyConsent}
            onChange={(event) => set("privacyConsent", event.target.checked)}
            className="mt-0.5 h-5 w-5 accent-terracotta"
          />
          <span>
            Acepto la{" "}
            <Link href="/privacidad" target="_blank" className="underline underline-offset-4">
              política de privacidad
            </Link>{" "}
            y el uso de mis datos para gestionar la reserva.
          </span>
        </label>
      </div>
      <ActionButton type="submit" className="mt-8 w-full">
        Continuar
      </ActionButton>
    </form>
  );
}

function Field({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-taupe/40 bg-white/40 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-taupe" strokeWidth={1.25} />
      {children}
    </label>
  );
}

// ─── Step 4: confirm ────────────────────────────────────────────────────────

function depositOf(service: Service) {
  return Math.round((service.price * DEMO_DEPOSIT_PERCENT) / 100);
}

function ConfirmStep({
  service,
  date,
  time,
  onConfirm,
}: {
  service: Service;
  date: Date;
  time: string;
  onConfirm: () => void;
}) {
  const rows = [
    { icon: Flower2, label: "Masaje", value: service.name },
    { icon: CalendarDays, label: "Fecha", value: capitalize(formatLongDate(date)) },
    { icon: Clock, label: "Horario", value: `${time} hs` },
    { icon: Hourglass, label: "Duración", value: `${service.durationMin} minutos` },
    { icon: MapPin, label: "Ubicación", value: "Serena | Masajes & Bienestar" },
  ];
  return (
    <>
      <StepTitle
        title="Confirmá tu reserva"
        subtitle="Revisá que toda la información sea correcta antes de realizar la seña."
      />
      <dl className="flex flex-col gap-3 rounded-3xl bg-white/40 p-5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <Icon className="h-5 w-5 shrink-0 text-terracotta" strokeWidth={1.25} />
            <dt className="w-20 shrink-0 text-taupe">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-5 rounded-3xl bg-blush/70 p-5">
        <h2 className="font-serif text-xl">Para confirmar tu turno</h2>
        <p className="mt-2 text-sm text-taupe">
          Realizá una seña del {DEMO_DEPOSIT_PERCENT}% del valor del servicio (
          {formatPrice(depositOf(service))} de {formatPrice(service.price)}) mediante
          transferencia bancaria. Los datos para transferir te aparecen en la siguiente pantalla y
          también te los enviamos por email. La dirección exacta te llega cuando se confirma la
          seña.
        </p>
      </section>
      <ActionButton onClick={onConfirm} className="mt-8 w-full">
        Realizar seña y confirmar
      </ActionButton>
    </>
  );
}

// ─── Done ───────────────────────────────────────────────────────────────────

function DoneScreen({ service, date, time }: { service: Service; date: Date; time: string }) {
  return (
    <PageShell showLogo={false}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <BrandLogo size="lg" />
        <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-olive text-cream">
          <Check className="h-8 w-8" strokeWidth={1.25} />
        </span>
        <h1 className="mt-6 font-serif text-5xl font-medium">¡Tu turno está reservado!</h1>
        <p className="mt-5 text-lg leading-relaxed">
          {service.name}, {formatLongDate(date)} a las {time} hs.
        </p>
        <p className="mt-3 leading-relaxed text-taupe">
          Para confirmarlo, transferí la seña de {formatPrice(depositOf(service))}. Te
          enviamos los datos de pago por email y, cuando la recibamos, tu reserva queda
          confirmada. ¡Nos vemos pronto!
        </p>
        <section className="mt-6 w-full rounded-3xl bg-blush/70 p-5 text-left">
          <h2 className="font-serif text-xl">Datos para la transferencia</h2>
          {/* Replaced by Settings.bankDetails, loaded by Micaela from the panel. */}
          <p className="mt-2 text-sm text-taupe">
            Acá van a aparecer el banco, la cuenta y el titular que cargue Micaela desde el
            panel.
          </p>
        </section>
        <p className="mt-6 rounded-xl border border-dashed border-terracotta/50 px-4 py-2 text-xs text-terracotta">
          Modo demostración: esta reserva no se guardó.
        </p>
        <ActionButton href="/" className="mt-8">
          Volver al inicio
        </ActionButton>
      </div>
    </PageShell>
  );
}
