// Text version of the SERENA logo. Replace the mark with the original SVG
// once the logo files are available (docs/pendientes.md).

type Props = { size?: "sm" | "lg" };

export function BrandLogo({ size = "sm" }: Props) {
  const large = size === "lg";
  return (
    <div className="flex flex-col items-center text-center">
      <LogoMark className={large ? "h-20 w-40" : "h-12 w-24"} />
      <p
        className={`font-serif font-medium text-coffee ${
          large ? "text-6xl tracking-[0.18em]" : "text-4xl tracking-[0.15em]"
        }`}
      >
        SERENA
      </p>
      <p
        className={`mt-1 uppercase text-coffee ${
          large ? "text-xs tracking-[0.45em]" : "text-[0.6rem] tracking-[0.4em]"
        }`}
      >
        | Masajes &amp; Bienestar |
      </p>
      <p
        className={`font-script text-terracotta ${large ? "mt-3 text-4xl" : "mt-1 text-2xl"}`}
      >
        Un momento para vos.
      </p>
    </div>
  );
}

// Simplified mark: an open arc with a flowing line, echoing the logo's hand and curve.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" fill="none" className={className} aria-hidden="true">
      <path
        d="M112 6c22 6 32 32 18 52-10 14-28 18-44 16"
        stroke="var(--color-terracotta)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 62c18-14 46-18 70-8 14 6 26 8 40 2"
        stroke="var(--color-terracotta)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M76 46c8-6 18-9 28-8 6 0 11 2 14 5m-30 1c4-5 10-9 17-10"
        stroke="var(--color-coffee)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M96 68c10 2 22 0 32-6"
        stroke="var(--color-olive)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
