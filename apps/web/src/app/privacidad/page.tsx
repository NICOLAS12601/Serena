import { PageShell } from "@/components/page-shell";

// Placeholder: the final text must cover Law 18.331 (what data is collected, why,
// who sees it, how long it is kept and how to request its deletion).
export default function PrivacyPage() {
  return (
    <PageShell backHref="/">
      <h1 className="font-serif text-5xl font-medium">
        Política de privacidad
      </h1>
      <span className="mt-5 block h-0.5 w-14 bg-terracotta" />
      <p className="mt-5 text-lg leading-relaxed">
        Estamos preparando el texto completo de nuestra política de privacidad.
      </p>
      <p className="mt-4 leading-relaxed text-taupe">
        Los datos que nos dejás al reservar se usan únicamente para gestionar tu
        turno y solo los ve Micaela. Podés pedir que los eliminemos en cualquier
        momento.
      </p>
    </PageShell>
  );
}
