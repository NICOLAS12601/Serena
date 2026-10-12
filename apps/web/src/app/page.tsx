import { connection } from "next/server";
import { formatPrice, getServices, type Service } from "@/lib/api";

export default async function Home() {
  // Render on every request so prices are always current (they live in the
  // database and Micaela edits them from the admin panel).
  await connection();

  let services: Service[] | null = null;
  try {
    services = await getServices();
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center px-6 pt-24 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-sage">
          Masajes &amp; Bienestar
        </p>
        <h1 className="mt-4 font-serif text-5xl font-medium tracking-[0.25em] sm:text-7xl">
          SERENA
        </h1>
        <p className="mt-6 font-serif text-2xl italic text-taupe">
          Un momento para vos.
        </p>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <h2 className="mb-8 text-center text-xs uppercase tracking-[0.3em] text-taupe">
          Servicios
        </h2>

        {services === null ? (
          <p className="text-center text-taupe">
            No pudimos cargar los servicios en este momento.
          </p>
        ) : services.length === 0 ? (
          <p className="text-center text-taupe">
            Pronto vas a ver acá nuestros servicios.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-3">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex flex-col rounded-sm border border-sand bg-white/50 p-6 text-center"
              >
                <h3 className="font-serif text-2xl">{service.name}</h3>
                {service.description && (
                  <p className="mt-2 text-sm text-taupe">{service.description}</p>
                )}
                <p className="mt-4 text-sm uppercase tracking-widest text-sage">
                  {service.durationMin} min
                </p>
                <p className="mt-1 text-lg">{formatPrice(service.price)}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 text-center">
          <span className="inline-block rounded-full bg-terracotta px-8 py-3 text-sm uppercase tracking-widest text-cream">
            Reservas online muy pronto
          </span>
        </div>
      </section>

      <footer className="mt-auto border-t border-sand py-6 text-center text-xs uppercase tracking-[0.3em] text-taupe">
        Montevideo · Uruguay
      </footer>
    </main>
  );
}
