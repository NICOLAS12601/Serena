import { Flower2, Leaf, Waves } from "lucide-react";

/** Draws the icon stored in Service.icon. Unknown keys fall back to a flower. */
export function ServiceIcon({
  icon,
  className,
}: {
  icon: string | null;
  className?: string;
}) {
  switch (icon) {
    case "lotus":
      return <LotusIcon className={className} />;
    case "leaf":
      return <Leaf className={className} strokeWidth={1.25} />;
    case "waves":
      return <Waves className={className} strokeWidth={1.25} />;
    case "wood-roller":
      return <WoodRollerIcon className={className} />;
    default:
      return <Flower2 className={className} strokeWidth={1.25} />;
  }
}

function LotusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="2 6 44 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 38c-5-4-7-10-7-16 0-5 3-10 7-13 4 3 7 8 7 13 0 6-2 12-7 16Z" />
      <path d="M24 38c-6 0-12-3-15-9 2-5 6-8 10-9" />
      <path d="M24 38c6 0 12-3 15-9-2-5-6-8-10-9" />
      <path d="M24 38c-8 2-16 0-20-5M24 38c8 2 16 0 20-5" />
    </svg>
  );
}

function WoodRollerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="6 6 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
      aria-hidden="true"
    >
      <g transform="rotate(-35 24 24)">
        <rect x="12" y="18" width="24" height="12" rx="4" />
        <path d="M16 18v12M20 18v12M24 18v12M28 18v12M32 18v12" />
        <path d="M12 24H4M36 24h8" />
      </g>
    </svg>
  );
}
