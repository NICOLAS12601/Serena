// Small building blocks shared by the admin panel screens (desktop only).

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

const BUTTON_STYLES = {
  primary: "bg-terracotta text-cream hover:bg-terracotta-dark",
  secondary:
    "border border-taupe/40 bg-white text-coffee hover:border-terracotta",
  danger: "border border-red-300 bg-white text-red-700 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-normal transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
    />
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <h1 className="font-serif text-4xl font-medium">{title}</h1>
        {description && <p className="mt-2 text-taupe">{description}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white/70 p-6">
      {title && <h2 className="mb-4 font-serif text-2xl">{title}</h2>}
      {children}
    </section>
  );
}

/** Label + control + optional hint, stacked. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-coffee">{label}</span>
      {children}
      {hint && <span className="text-xs text-taupe">{hint}</span>}
    </label>
  );
}

export const INPUT =
  "rounded-lg border border-taupe/40 bg-white px-3 py-2 text-base text-coffee outline-none focus:border-terracotta";

/** Success or error message after an action. */
export function Notice({
  kind,
  children,
}: {
  kind: "ok" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg px-4 py-3 text-sm ${
        kind === "ok" ? "bg-olive/10 text-olive-dark" : "bg-red-50 text-red-700"
      }`}
    >
      {children}
    </p>
  );
}

export function Loading() {
  return <p className="text-taupe">Cargando…</p>;
}
