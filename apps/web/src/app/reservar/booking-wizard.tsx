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
  MessageCircle,
  Moon,
  Phone,
  Sun,
  Sunset,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CountryCode } from "libphonenumber-js/mobile";
import { useMemo, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { BrandLogo } from "@/components/brand-logo";
import { PageShell } from "@/components/page-shell";
import { formatPrice, type PublicSettings, type Service } from "@/lib/api";
import { checkMobile, countryOptions } from "@/lib/phone";
import {
  DEMO_POLICIES,
  getDemoSlots,
  isDemoDayAvailable,
  type Slot,
} from "@/lib/demo";

type Step = "date" | "time" | "policies" | "details" | "confirm" | "done";
const ORDER: Step[] = [
  "date",
  "time",
  "policies",
  "details",
  "confirm",
  "done",
];

export type ClientDetails = {
  name: string;
  /** As typed by the client; validated with phoneCountry on "Continuar". */
  phone: string;
  phoneCountry: CountryCode;
  /** Validated number in E.164 (e.g. "+59899230654"): the one that is stored. */
  phoneE164: string;
  email: string;
  birthDate: string;
  reason: string;
  privacyConsent: boolean;
};

const EMPTY_DETAILS: ClientDetails = {
  name: "",
  phone: "",
  phoneCountry: "UY",
  phoneE164: "",
  email: "",
  birthDate: "",
  reason: "",
  privacyConsent: false,
};

export function BookingWizard({
  service,
  settings,
  backHref,
}: {
  service: Service;
  settings: PublicSettings;
  backHref: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [details, setDetails] = useState<ClientDetails>(EMPTY_DETAILS);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [plan, setPlan] = useState<PaymentPlan | null>(null);

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };
  const back = () => {
    const index = ORDER.indexOf(step);
    if (index === 0) router.push(backHref);
    else go(ORDER[index - 1]);
  };

  if (step === "done" && date && time && method && plan) {
    return (
      <DoneScreen
        settings={settings}
        service={service}
        date={date}
        time={time}
        method={method}
        plan={plan}
        clientName={details.name}
      />
    );
  }

  return (
    <PageShell onBack={back}>
      <DemoNotice />
      <Stepper step={step} />
      {step === "date" && (
        <DateStep
          maxAdvanceDays={settings.maxAdvanceDays}
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
        <DetailsStep
          details={details}
          onChange={setDetails}
          onContinue={() => go("confirm")}
        />
      )}
      {step === "confirm" && date && time && (
        <ConfirmStep
          settings={settings}
          service={service}
          date={date}
          time={time}
          method={method}
          plan={plan}
          onMethodChange={setMethod}
          onPlanChange={setPlan}
          onConfirm={() => go("done")}
        />
      )}
    </PageShell>
  );
}

// ─── Shared pieces ──────────────────────────────────────────────────────────

function DemoNotice() {
  return (
    <p className="mx-auto mb-6 w-full max-w-xl rounded-xl border border-dashed border-terracotta/50 px-4 py-2 text-center text-xs text-terracotta">
      Modo demostración: los horarios son de ejemplo y la reserva todavía no se
      guarda.
    </p>
  );
}

/** Main button of each step: full width on phones, centered on larger screens. */
const CONTINUE = "mt-8 w-full md:w-auto md:min-w-80 md:self-center";

const STEPPER: { label: string; steps: Step[] }[] = [
  { label: "Fecha", steps: ["date"] },
  { label: "Horario", steps: ["time"] },
  { label: "Tus datos", steps: ["policies", "details"] },
  { label: "Confirmar", steps: ["confirm"] },
];

function Stepper({ step }: { step: Step }) {
  const current = STEPPER.findIndex((item) => item.steps.includes(step));
  return (
    <ol className="mx-auto mb-8 flex w-full max-w-xl items-start justify-between">
      {STEPPER.map((item, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={item.label}
            className="flex flex-1 flex-col items-center gap-2 text-center"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg ${
                done || active
                  ? "bg-terracotta text-cream"
                  : "bg-blush text-taupe"
              }`}
            >
              {done ? (
                <Check className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`text-xs ${active ? "text-coffee" : "text-taupe"}`}
            >
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
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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
  maxAdvanceDays,
  selected,
  onSelect,
  onContinue,
}: {
  maxAdvanceDays: number;
  selected: Date | null;
  onSelect: (date: Date) => void;
  onContinue: () => void;
}) {
  const today = startOfDay(new Date());
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + maxAdvanceDays);
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // Grid starts on Monday: getDay() is 0 for Sunday, so shift it to the end.
  const offset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];

  const isBookable = (day: Date) =>
    day > today && day <= lastDay && isDemoDayAvailable(day);
  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoForward =
    new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay;
  const shiftMonth = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <>
      {/* Desktop: text and legend on the left, calendar on the right. */}
      <div className="md:grid md:grid-cols-[2fr_3fr] md:items-start md:gap-12">
        <div>
          <StepTitle
            title="Elegí la fecha"
            subtitle="Seleccioná el día que mejor se adapte a tu disponibilidad."
          />
          <ul className="mb-6 hidden flex-col gap-1 text-sm text-taupe md:flex">
            <Legend />
          </ul>
        </div>
        <div>
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
              {capitalize(month.toLocaleDateString("es-UY", { month: "long" }))}{" "}
              {month.getFullYear()}
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

          <ul className="mt-5 flex flex-col items-center gap-1 text-sm text-taupe md:hidden">
            <Legend />
          </ul>
        </div>
      </div>

      <ActionButton
        onClick={onContinue}
        disabled={!selected}
        className={CONTINUE}
      >
        Continuar
      </ActionButton>
    </>
  );
}

function Legend() {
  return (
    <>
      <li className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-terracotta" /> Día seleccionado
      </li>
      <li className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full border border-taupe/40" /> Día
        disponible
      </li>
      <li className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-mist" /> Sin disponibilidad
      </li>
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
        <button
          type="button"
          onClick={onChangeDate}
          className="underline underline-offset-4"
        >
          Cambiar fecha
        </button>
      </div>

      {PERIODS.map(({ label, icon: Icon, from, to }) => {
        const periodSlots = slots.filter(
          (slot) => minutesOf(slot.time) >= from && minutesOf(slot.time) < to,
        );
        if (periodSlots.length === 0) return null;
        return (
          <section
            key={label}
            className="mb-6 border-b border-line pb-6 last:border-0"
          >
            <h2 className="mb-3 flex items-center gap-3 font-serif text-xl">
              <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.25} />{" "}
              {label}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
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

      <ActionButton
        onClick={onContinue}
        disabled={!selected}
        className={CONTINUE}
      >
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
      <ul className="grid gap-5 rounded-3xl bg-blush/70 p-5 md:grid-cols-2 md:gap-8 md:p-8">
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
      <ActionButton
        onClick={onContinue}
        disabled={!accepted}
        className={CONTINUE}
      >
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
  const set = <K extends keyof ClientDetails>(
    key: K,
    value: ClientDetails[K],
  ) => onChange({ ...details, [key]: value });
  const todayIso = new Date().toISOString().slice(0, 10);
  const countries = useMemo(() => countryOptions(), []);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        const phone = checkMobile(details.phone, details.phoneCountry);
        if (!phone.ok) {
          setPhoneError(phone.message);
          document.getElementById("phone")?.focus();
          return;
        }
        setPhoneError(null);
        onChange({ ...details, phoneE164: phone.e164 });
        onContinue();
      }}
    >
      <StepTitle
        title="Tus datos"
        subtitle="Completá la información para confirmar tu reserva."
      />
      <div className="grid gap-4 md:grid-cols-2">
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
        <div className="flex flex-col gap-1">
          <Field icon={Phone}>
            <select
              aria-label="País del teléfono"
              value={details.phoneCountry}
              onChange={(event) => {
                set("phoneCountry", event.target.value as CountryCode);
                setPhoneError(null);
              }}
              className="w-32 shrink-0 bg-transparent text-sm outline-none"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
            <input
              id="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="Celular (WhatsApp)"
              value={details.phone}
              aria-invalid={phoneError !== null}
              onChange={(event) => {
                set("phone", event.target.value);
                setPhoneError(null);
              }}
              className="w-full bg-transparent outline-none placeholder:text-taupe"
            />
          </Field>
          {phoneError && (
            <p role="alert" className="text-sm text-terracotta">
              {phoneError}
            </p>
          )}
        </div>
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
        <label className="rounded-xl border border-taupe/40 bg-white/40 px-4 py-3 md:col-span-2">
          <textarea
            rows={4}
            placeholder="¿Querés contarnos algo más? (Alergias, lesiones, preferencias, etc.)"
            value={details.reason}
            onChange={(event) => set("reason", event.target.value)}
            className="w-full resize-none bg-transparent outline-none placeholder:text-taupe"
          />
          <span className="text-xs text-taupe">
            Opcional. Solo lo ve Micaela.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm md:col-span-2">
          <input
            required
            type="checkbox"
            checked={details.privacyConsent}
            onChange={(event) => set("privacyConsent", event.target.checked)}
            className="mt-0.5 h-5 w-5 accent-terracotta"
          />
          <span>
            Acepto la{" "}
            <Link
              href="/privacidad"
              target="_blank"
              className="underline underline-offset-4"
            >
              política de privacidad
            </Link>{" "}
            y el uso de mis datos para gestionar la reserva.
          </span>
        </label>
      </div>
      <ActionButton type="submit" className={CONTINUE}>
        Continuar
      </ActionButton>
    </form>
  );
}

function Field({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-taupe/40 bg-white/40 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-taupe" strokeWidth={1.25} />
      {children}
    </label>
  );
}

// ─── Step 4: confirm ────────────────────────────────────────────────────────

export type PaymentMethod = "MERCADO_PAGO" | "BANK_TRANSFER";
/** How much is paid online now; the rest is paid after the session. */
export type PaymentPlan = "DEPOSIT" | "FULL";

/** Price actually charged: bank transfers get a discount (no Mercado Pago fee). */
function priceFor(
  settings: PublicSettings,
  service: Service,
  method: PaymentMethod,
) {
  return method === "BANK_TRANSFER"
    ? Math.round(
        (service.price * (100 - settings.transferDiscountPercent)) / 100,
      )
    : service.price;
}

function depositFor(
  settings: PublicSettings,
  service: Service,
  method: PaymentMethod,
) {
  return Math.round(
    (priceFor(settings, service, method) * settings.depositPercent) / 100,
  );
}

function amountNow(
  settings: PublicSettings,
  service: Service,
  method: PaymentMethod,
  plan: PaymentPlan,
) {
  return plan === "FULL"
    ? priceFor(settings, service, method)
    : depositFor(settings, service, method);
}

function RadioCard({
  name,
  checked,
  onChange,
  title,
  detail,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
        checked
          ? "border-terracotta bg-white/60"
          : "border-taupe/30 bg-white/30"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-terracotta"
      />
      <span>
        <span className="block font-serif text-lg">{title}</span>
        <span className="block text-sm text-taupe">{detail}</span>
      </span>
    </label>
  );
}

function ConfirmStep({
  settings,
  service,
  date,
  time,
  method,
  plan,
  onMethodChange,
  onPlanChange,
  onConfirm,
}: {
  settings: PublicSettings;
  service: Service;
  date: Date;
  time: string;
  method: PaymentMethod | null;
  plan: PaymentPlan | null;
  onMethodChange: (method: PaymentMethod) => void;
  onPlanChange: (plan: PaymentPlan) => void;
  onConfirm: () => void;
}) {
  const rows = [
    { icon: Flower2, label: "Servicio", value: service.name },
    {
      icon: CalendarDays,
      label: "Fecha",
      value: capitalize(formatLongDate(date)),
    },
    { icon: Clock, label: "Horario", value: `${time} hs` },
    {
      icon: Hourglass,
      label: "Duración",
      value: `${service.durationMin} minutos`,
    },
    { icon: MapPin, label: "Ubicación", value: "Serena | Masajes & Bienestar" },
  ];
  // Amounts shown for the plan options follow the chosen method (transfer is cheaper).
  const shownMethod = method ?? "MERCADO_PAGO";
  const price = priceFor(settings, service, shownMethod);
  const deposit = depositFor(settings, service, shownMethod);

  return (
    <>
      <StepTitle
        title="Confirmá tu reserva"
        subtitle="Revisá que toda la información sea correcta antes de pagar."
      />
      {/* Desktop: booking summary next to the payment options. */}
      <div className="md:grid md:grid-cols-2 md:items-start md:gap-6">
        <dl className="flex flex-col gap-3 rounded-3xl bg-white/40 p-5">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon
                className="h-5 w-5 shrink-0 text-terracotta"
                strokeWidth={1.25}
              />
              <dt className="w-20 shrink-0 text-taupe">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-5 rounded-3xl bg-blush/70 p-5 md:mt-0">
          <h2 className="font-serif text-xl">¿Cómo querés pagar?</h2>
          <div className="mt-3 flex flex-col gap-3" role="radiogroup">
            <RadioCard
              name="payment-method"
              checked={method === "MERCADO_PAGO"}
              onChange={() => onMethodChange("MERCADO_PAGO")}
              title="Mercado Pago"
              detail="Con tarjeta, débito o saldo. Tu turno se confirma al instante."
            />
            <RadioCard
              name="payment-method"
              checked={method === "BANK_TRANSFER"}
              onChange={() => onMethodChange("BANK_TRANSFER")}
              title={`Transferencia · ${settings.transferDiscountPercent}% de descuento`}
              detail={`Te guardamos el turno ${settings.transferHoldHours} horas para transferir; se confirma cuando Micaela recibe el pago.`}
            />
          </div>

          <h2 className="mt-6 font-serif text-xl">¿Cuánto pagás ahora?</h2>
          <div className="mt-3 flex flex-col gap-3" role="radiogroup">
            <RadioCard
              name="payment-plan"
              checked={plan === "DEPOSIT"}
              onChange={() => onPlanChange("DEPOSIT")}
              title={`Seña del ${settings.depositPercent}% · ${formatPrice(deposit)}`}
              detail={`El resto (${formatPrice(price - deposit)}) lo pagás después del masaje.`}
            />
            <RadioCard
              name="payment-plan"
              checked={plan === "FULL"}
              onChange={() => onPlanChange("FULL")}
              title={`Total · ${formatPrice(price)}`}
              detail="Dejás todo pago y no tenés que pensar en nada el día del masaje."
            />
          </div>
          <p className="mt-4 text-xs text-taupe">
            Para reagendar sin perder la seña, avisanos con más de 12 horas de
            anticipación. La dirección exacta te llega por email cuando se
            confirma el pago.
          </p>
        </section>
      </div>

      <ActionButton
        onClick={onConfirm}
        disabled={!method || !plan}
        className={CONTINUE}
      >
        {method === "MERCADO_PAGO"
          ? "Pagar con Mercado Pago"
          : "Confirmar reserva"}
      </ActionButton>
    </>
  );
}

// ─── Done ───────────────────────────────────────────────────────────────────

/**
 * Opens WhatsApp with the message already written. Without Micaela's number
 * (Settings.whatsappNumber, from the panel) WhatsApp asks which chat to use.
 */
function whatsappReceiptLink(number: string | null, message: string) {
  return `https://wa.me/${number ?? ""}?text=${encodeURIComponent(message)}`;
}

function DoneScreen({
  settings,
  service,
  date,
  time,
  method,
  plan,
  clientName,
}: {
  settings: PublicSettings;
  service: Service;
  date: Date;
  time: string;
  method: PaymentMethod;
  plan: PaymentPlan;
  clientName: string;
}) {
  const transfer = method === "BANK_TRANSFER";
  const paid = amountNow(settings, service, method, plan);
  const rest = priceFor(settings, service, method) - paid;
  const firstName = clientName.trim().split(/\s+/)[0] || clientName;
  const receiptMessage = `¡Hola Micaela! Soy ${clientName.trim()}. Reservé ${service.name} el ${formatLongDate(date)} a las ${time} hs. Te envío el comprobante de la transferencia de ${formatPrice(paid)}.`;

  return (
    <PageShell showLogo={false}>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
        <BrandLogo size="lg" />
        <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-olive text-cream">
          <Check className="h-8 w-8" strokeWidth={1.25} />
        </span>
        <h1 className="mt-6 font-serif text-5xl font-medium">
          {transfer
            ? "¡Tu turno está reservado!"
            : "¡Tu reserva está confirmada!"}
        </h1>
        <p className="mt-5 text-lg leading-relaxed">
          {service.name}, {formatLongDate(date)} a las {time} hs.
        </p>

        {transfer ? (
          <>
            <p className="mt-3 leading-relaxed text-taupe">
              {firstName}, para confirmarlo transferí {formatPrice(paid)} dentro
              de las próximas {settings.transferHoldHours} horas y poné{" "}
              <strong>tu nombre</strong> como referencia. Cuando Micaela reciba
              el pago, te llega la confirmación por email con la dirección.
            </p>
            <section className="mt-6 w-full rounded-3xl bg-blush/70 p-5 text-left">
              <h2 className="font-serif text-xl">
                Datos para la transferencia
              </h2>
              {/* Replaced by Settings.bankDetails, loaded by Micaela from the panel. */}
              <p className="mt-2 text-sm text-taupe">
                Acá van a aparecer el banco, la cuenta y el titular que cargue
                Micaela desde el panel.
              </p>
            </section>
            <a
              href={whatsappReceiptLink(
                settings.whatsappNumber,
                receiptMessage,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-olive px-6 py-4 font-serif text-lg text-cream transition-colors hover:bg-olive-dark"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.25} />
              Enviar comprobante por WhatsApp
            </a>
            {/* A wa.me link can carry text but not files: the client attaches it. */}
            <p className="mt-3 text-sm text-taupe">
              Se abre WhatsApp con el mensaje listo: adjuntá la captura o el PDF
              del comprobante con el clip 📎 y envialo.
            </p>
          </>
        ) : (
          <p className="mt-3 leading-relaxed text-taupe">
            Recibimos tu pago de {formatPrice(paid)}. Te enviamos todos los
            detalles y la dirección por email. ¡Nos vemos pronto!
          </p>
        )}

        {rest > 0 && (
          <p className="mt-4 text-sm text-taupe">
            El resto ({formatPrice(rest)}) lo pagás después del masaje.
          </p>
        )}
        <p className="mt-6 rounded-xl border border-dashed border-terracotta/50 px-4 py-2 text-xs text-terracotta">
          Modo demostración: esta reserva no se guardó
          {transfer ? "." : " y no se cobró nada."}
        </p>
        <ActionButton href="/" className="mt-8">
          Volver al inicio
        </ActionButton>
      </div>
    </PageShell>
  );
}
