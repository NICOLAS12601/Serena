import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { PageDecorations } from "./decorations";

type Props = {
  children: React.ReactNode;
  /** Where "Volver" goes. Omit to hide it. */
  backHref?: string;
  /** Use instead of backHref when going back is handled in the page (wizard steps). */
  onBack?: () => void;
  showLogo?: boolean;
};

/** Mobile-first column with the logo header and the decorative background. */
export function PageShell({ children, backHref, onBack, showLogo = true }: Props) {
  const back = (
    <span className="flex items-center gap-2 text-sm">
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver
    </span>
  );
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col overflow-hidden px-6 pt-8 pb-12">
      <PageDecorations />
      <div className="relative flex min-h-6 items-center">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-coffee">
            {back}
          </button>
        ) : (
          backHref && (
            <Link href={backHref} className="text-coffee">
              {back}
            </Link>
          )
        )}
      </div>
      {showLogo && (
        <header className="relative mt-2">
          <BrandLogo />
        </header>
      )}
      <main className="relative mt-8 flex flex-1 flex-col">{children}</main>
    </div>
  );
}
