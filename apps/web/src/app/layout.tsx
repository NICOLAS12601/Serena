import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Sacramento } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Handwritten font for the tagline "Un momento para vos."
const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "SERENA · Masajes & Bienestar",
  description: "Un momento para vos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} ${sacramento.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans font-light">{children}</body>
    </html>
  );
}
