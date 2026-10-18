import { connection } from "next/server";
import { ActionButton } from "@/components/action-button";
import { PageShell } from "@/components/page-shell";
import { ServiceIcon } from "@/components/service-icon";
import { formatPrice, getServicesOrNull } from "@/lib/api";

// Returning clients: every active service except the first-visit session.
export default async function ServicesPage() {
  await connection();
  const services = (await getServicesOrNull())?.filter((service) => !service.isFirstVisit);

  return (
    <PageShell backHref="/">
      <h1 className="font-serif text-5xl font-medium">Elegí tu masaje</h1>
      <p className="mt-2 text-xs tracking-[0.4em] uppercase">Ya sos cliente de Serena</p>
      <span className="mt-5 block h-0.5 w-14 bg-terracotta" />
      <p className="mt-5 text-lg">
        Reservá el masaje que mejor se adapte a lo que tu cuerpo necesita hoy.
      </p>

      {services === undefined ? (
        <p className="mt-10 text-center text-taupe">
          No pudimos cargar los servicios en este momento.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-5">
          {services.map((service, index) => {
            const alternate = index % 2 === 1;
            return (
              <li key={service.id} className="rounded-3xl bg-blush/70 p-6">
                <div className="flex gap-4">
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
                      alternate ? "bg-linen" : "bg-[#e5c4b3]"
                    }`}
                  >
                    <ServiceIcon icon={service.icon} className="h-9 w-9" />
                  </span>
                  <div className="flex-1">
                    <h2 className="font-serif text-2xl leading-tight">{service.name}</h2>
                    {service.description && (
                      <p className="mt-2 text-sm leading-relaxed text-taupe">
                        {service.description}
                      </p>
                    )}
                    <p className="mt-3 text-sm tracking-wider text-taupe">
                      {service.durationMin} min · {formatPrice(service.price)}
                    </p>
                  </div>
                </div>
                <ActionButton
                  href={`/reservar?servicio=${service.id}`}
                  variant={alternate ? "olive" : "terracotta"}
                  className="mt-5 w-full py-3 text-lg"
                >
                  Reservar turno
                </ActionButton>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
