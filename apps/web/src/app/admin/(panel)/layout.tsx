"use client";

import {
  CalendarClock,
  KeyRound,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../../../public/logo-serena.png";
import { adminFetch } from "@/lib/admin-api";

const NAV = [
  { href: "/admin/servicios", label: "Servicios", icon: Sparkles },
  {
    href: "/admin/horarios",
    label: "Horarios y bloqueos",
    icon: CalendarClock,
  },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: KeyRound },
];

/**
 * Frame of every panel screen: sidebar + content. It checks the session on load;
 * the real protection is in the API (every /admin route requires the cookie).
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ email: string }>("/auth/me")
      .then((admin) => setEmail(admin.email))
      .catch(() => {
        // adminFetch already redirects to the login on 401.
      });
  }, []);

  async function logout() {
    await adminFetch("/auth/logout", { method: "POST" });
    // A full reload (not router.push) drops any panel data left in memory.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/login";
  }

  if (!email) {
    return <p className="p-10 text-taupe">Cargando…</p>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-white/60 p-6">
        <Link href="/" target="_blank" title="Ver el sitio">
          <Image src={logo} alt="SERENA" className="h-auto w-44" priority />
        </Link>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-terracotta text-cream"
                    : "text-coffee hover:bg-blush"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-line pt-4 text-xs text-taupe">
          <p className="truncate">{email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-coffee hover:text-terracotta"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 px-12 py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
