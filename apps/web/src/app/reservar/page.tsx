import { connection } from "next/server";
import { PageShell } from "@/components/page-shell";
import { getPublicSettingsOrNull, getServicesOrNull } from "@/lib/api";
import { BookingWizard } from "./booking-wizard";

export default async function BookingPage({ searchParams }: PageProps<"/reservar">) {
  await connection();
  const { servicio } = await searchParams;
  const serviceId = Number(servicio);
  const [services, settings] = await Promise.all([
    getServicesOrNull(),
    getPublicSettingsOrNull(),
  ]);
  const service = services?.find((candidate) => candidate.id === serviceId);

  if (!service || !settings) {
    return (
      <PageShell backHref="/">
        <p className="mt-10 text-center text-taupe">
          {services === null || !settings
            ? "No pudimos cargar la reserva en este momento."
            : "No encontramos el servicio que elegiste."}
        </p>
      </PageShell>
    );
  }

  return (
    <BookingWizard
      service={service}
      settings={settings}
      backHref={service.isFirstVisit ? "/primera-vez" : "/masajes"}
    />
  );
}
