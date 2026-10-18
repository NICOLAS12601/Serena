"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { Button, Card, Field, INPUT, Notice, PageHeader } from "../../ui";

export default function AccountPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (next !== repeat) {
      setNotice({
        kind: "error",
        text: "Las dos contraseñas nuevas no coinciden.",
      });
      return;
    }
    try {
      await adminFetch("/auth/password", {
        method: "PATCH",
        body: { currentPassword: current, newPassword: next },
      });
      setCurrent("");
      setNext("");
      setRepeat("");
      setNotice({
        kind: "ok",
        text: "Contraseña cambiada. Se cerraron las sesiones abiertas en otros dispositivos.",
      });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    }
  }

  return (
    <>
      <PageHeader title="Mi cuenta" />
      <Card title="Cambiar contraseña">
        <form onSubmit={save} className="flex max-w-md flex-col gap-5">
          <Field label="Contraseña actual">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Contraseña nueva" hint="Al menos 10 caracteres.">
            <input
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Repetí la contraseña nueva">
            <input
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className={INPUT}
            />
          </Field>
          {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
          <Button type="submit" className="self-start">
            Cambiar contraseña
          </Button>
        </form>
      </Card>
    </>
  );
}
