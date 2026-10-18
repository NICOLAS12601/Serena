import type { Metadata } from "next";

// The admin panel must never show up in search engines.
export const metadata: Metadata = {
  title: "Panel · SERENA",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
