import { ArrowRight } from "lucide-react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  variant?: "terracotta" | "olive";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

const COLORS = {
  terracotta: "bg-terracotta hover:bg-terracotta-dark",
  olive: "bg-olive hover:bg-olive-dark",
};

/** Rounded call-to-action with a trailing arrow, as in the designs. */
export function ActionButton({
  children,
  variant = "terracotta",
  href,
  onClick,
  disabled,
  type = "button",
  className = "",
}: Props) {
  const classes = `inline-flex items-center justify-center gap-4 rounded-full px-8 py-4 font-serif text-xl text-cream transition-colors ${COLORS[variant]} disabled:cursor-not-allowed disabled:opacity-40 ${className}`;
  const content = (
    <>
      {children}
      <ArrowRight className="h-5 w-5" strokeWidth={1.25} />
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
