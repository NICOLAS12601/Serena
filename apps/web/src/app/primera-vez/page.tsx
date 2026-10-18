import { Coffee, Flower2, Leaf, MessageCircle } from "lucide-react";
import Image from "next/image";
import { connection } from "next/server";
import spacePhoto from "../../../public/espacio.jpg";
import { ActionButton } from "@/components/action-button";
import { PageShell } from "@/components/page-shell";
import { getServicesOrNull } from "@/lib/api";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Entrevista inicial",
    text: "Un espacio para conocerte, conversar sobre tus necesidades, preferencias y objetivos.",
  },
  {
    icon: Flower2,
    title: "Masaje personalizado",
    text: "Según lo conversado, el masaje se adapta a lo que tu cuerpo necesita ese día (relajante, descontracturante o una combinación).",
  },
  {
    icon: Coffee,
    title: "Para cerrar, un momento de calma",
    text: "Al finalizar, podrás disfrutar de un café o té, en un ambiente tranquilo, para que la experiencia se complete con serenidad.",
  },
];

export default async function FirstVisitPage() {
  await connection();
  const services = await getServicesOrNull();
  const firstVisit = services?.find((service) => service.isFirstVisit);

  return (
    <PageShell backHref="/">
      {/* Desktop: intro text and photo side by side. */}
      <div className="md:grid md:grid-cols-2 md:items-center md:gap-10">
        <div>
          <h1 className="font-serif text-5xl leading-none font-medium">
            Tu primera experiencia en Serena
          </h1>
          <span className="mt-5 block h-0.5 w-14 bg-terracotta" />
          <p className="mt-5 text-lg leading-relaxed">
            En tu primera visita te dedico un encuentro completo
            {firstVisit && ` de ${firstVisit.durationMin} minutos`}, donde
            comenzamos con una entrevista inicial para conocerte, escuchar tus
            necesidades y adaptar el masaje especialmente para vos.
          </p>
        </div>

        <Image
          src={spacePhoto}
          alt="La sala de masajes de Serena: camilla con manta crema, toallas, aceites y una lámpara de sal"
          placeholder="blur"
          sizes="(min-width: 768px) 480px, 100vw"
          className="mt-8 aspect-[4/3] w-full rounded-[2rem_6rem_2rem_6rem] object-cover object-[50%_60%] md:mt-0 md:aspect-[4/5]"
        />
      </div>

      <section className="mt-8 rounded-3xl bg-blush/80 p-6 md:p-8">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-[40%_60%_55%_45%] bg-[#e5c4b3]">
            <Leaf className="h-9 w-9" strokeWidth={1.1} />
          </span>
          <span className="h-14 border-l border-terracotta/40" />
          <div>
            <h2 className="font-serif text-3xl">
              {firstVisit?.name ?? "Encuentro inicial"}
            </h2>
            {firstVisit && (
              <p className="font-serif text-2xl text-terracotta">
                {firstVisit.durationMin} minutos
              </p>
            )}
          </div>
        </div>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5c4b3]">
                <Icon className="h-6 w-6" strokeWidth={1.25} />
              </span>
              <div>
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="text-sm text-taupe">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-col items-center gap-3">
        {firstVisit ? (
          <ActionButton
            href={`/reservar?servicio=${firstVisit.id}`}
            className="w-full md:w-auto md:min-w-80"
          >
            Reservar turno
          </ActionButton>
        ) : (
          <p className="text-center text-taupe">
            Las reservas online no están disponibles en este momento.
          </p>
        )}
      </div>
    </PageShell>
  );
}
