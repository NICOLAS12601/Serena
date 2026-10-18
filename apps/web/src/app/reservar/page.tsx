import { connection } from "next/server";
import { PageShell } from "@/components/page-shell";
import { getServicesOrNull } from "@/lib/api";
import { BookingWizard } from "./booking-wizard";

export default async function BookingPage({ searchParams }: PageProps<"/reservar">) {
  await connection();
  const { servicio } = await searchParams;
  const serviceId = Number(servicio);
  const services = await getServicesOrNull();
  const service = services?.find((candidate) => candidate.id === serviceId);

  if (!service) {
    return (
      <PageShell backHref="/">
        <p className="mt-10 text-center text-taupe">
          {services === null
            ? "No pudimos cargar el servicio en este momento."
            : "No encontramos el servicio que elegiste."}
        </p>
      </PageShell>
    );
  }

  return (
    <BookingWizard
      service={service}
      backHref={service.isFirstVisit ? "/primera-vez" : "/masajes"}
    />
  );
}
