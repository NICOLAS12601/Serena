import Image from "next/image";
import logo from "../../public/logo-serena.png";

type Props = { size?: "sm" | "lg" };

/** Official SERENA logo plus the handwritten tagline used in the designs. */
export function BrandLogo({ size = "sm" }: Props) {
  const large = size === "lg";
  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src={logo}
        alt="SERENA · Masajes & Bienestar"
        priority
        sizes={
          large
            ? "(min-width: 768px) 384px, 320px"
            : "(min-width: 768px) 256px, 224px"
        }
        className={large ? "h-auto w-80 md:w-96" : "h-auto w-56 md:w-64"}
      />
      <p
        className={`font-script text-terracotta ${large ? "mt-3 text-4xl" : "mt-1 text-2xl"}`}
      >
        Un momento para vos.
      </p>
    </div>
  );
}
