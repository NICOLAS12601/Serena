import { ArrowRight, Heart, Leaf } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { PageDecorations } from "@/components/decorations";

// Entry point: new clients go to the first-visit session, returning clients
// choose their massage.
export default function Home() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-16">
      <PageDecorations />
      <div className="relative">
        <BrandLogo size="lg" />
        <nav className="mt-16 flex flex-col gap-5">
          <EntryCard
            href="/primera-vez"
            label="Es mi primer masaje en Serena"
            icon={<Leaf className="h-9 w-9" strokeWidth={1.1} />}
            cardClass="bg-blush"
            iconClass="bg-[#e5c4b3]"
            arrowClass="bg-terracotta"
          />
          <EntryCard
            href="/masajes"
            label="Ya soy cliente"
            icon={<Heart className="h-9 w-9" strokeWidth={1.1} />}
            cardClass="bg-linen"
            iconClass="bg-[#cfc6b2]"
            arrowClass="bg-olive"
          />
        </nav>
      </div>
    </div>
  );
}

type EntryCardProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  cardClass: string;
  iconClass: string;
  arrowClass: string;
};

function EntryCard({ href, label, icon, cardClass, iconClass, arrowClass }: EntryCardProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-5 rounded-3xl p-6 transition-transform hover:-translate-y-0.5 ${cardClass}`}
    >
      <span
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[40%_60%_55%_45%] text-coffee ${iconClass}`}
      >
        {icon}
      </span>
      <span className="h-14 border-l border-taupe/40" />
      <span className="flex-1 font-serif text-2xl leading-tight">{label}</span>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-cream ${arrowClass}`}
      >
        <ArrowRight className="h-5 w-5" strokeWidth={1.25} />
      </span>
    </Link>
  );
}
