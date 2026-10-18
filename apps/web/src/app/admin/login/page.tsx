"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo from "../../../../public/logo-serena.png";
import { adminFetch } from "@/lib/admin-api";
import { Button, Field, INPUT, Notice } from "../ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await adminFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      router.push("/admin/servicios");
    } catch (caught) {
      setError(
        (caught as Error).message.includes("ThrottlerException")
          ? "Demasiados intentos. Esperá un minuto y probá de nuevo."
          : (caught as Error).message,
      );
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-line bg-white/70 p-8"
      >
        <Image
          src={logo}
          alt="SERENA"
          className="mx-auto h-auto w-48"
          priority
        />
        <h1 className="text-center font-serif text-3xl">Panel de Micaela</h1>
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={INPUT}
          />
        </Field>
        <Field label="Contraseña">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={INPUT}
          />
        </Field>
        {error && <Notice kind="error">{error}</Notice>}
        <Button type="submit" disabled={sending}>
          {sending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </main>
  );
}
