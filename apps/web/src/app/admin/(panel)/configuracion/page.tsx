"use client";

import { useEffect, useState } from "react";
import { adminFetch, type AdminSettings } from "@/lib/admin-api";
import {
  Button,
  Card,
  Field,
  INPUT,
  Loading,
  Notice,
  PageHeader,
} from "../../ui";

type TextKey =
  | "whatsappNumber"
  | "neighborhood"
  | "address"
  | "bankDetails"
  | "cancellationPolicyText";
type NumberKey = Exclude<keyof AdminSettings, TextKey>;

const EDITABLE: (keyof AdminSettings)[] = [
  "depositPercent",
  "transferDiscountPercent",
  "mpHoldMinutes",
  "transferHoldHours",
  "bufferMinutes",
  "minAdvanceHours",
  "maxAdvanceDays",
  "bankDetails",
  "address",
  "neighborhood",
  "whatsappNumber",
  "cancellationPolicyText",
];

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<AdminSettings>("/admin/settings").then(setSettings);
  }, []);

  if (!settings) return <Loading />;

  const setText = (key: TextKey, value: string) =>
    setSettings({ ...settings, [key]: value });
  const setNumber = (key: NumberKey, value: string) =>
    setSettings({ ...settings, [key]: Number(value) });

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      // Send only the editable fields (the API rejects unknown ones like id).
      const body = Object.fromEntries(
        EDITABLE.map((key) => [key, settings![key]]),
      );
      const saved = await adminFetch<AdminSettings>("/admin/settings", {
        method: "PATCH",
        body,
      });
      setSettings(saved);
      setNotice({
        kind: "ok",
        text: "Configuración guardada. Ya se ve en el sitio.",
      });
    } catch (error) {
      setNotice({ kind: "error", text: (error as Error).message });
    }
    setSaving(false);
    window.scrollTo({ top: 0 });
  }

  const number = (
    key: NumberKey,
    label: string,
    min: number,
    max: number,
    hint?: string,
  ) => (
    <Field label={label} hint={hint}>
      <input
        type="number"
        required
        min={min}
        max={max}
        value={settings[key]}
        onChange={(e) => setNumber(key, e.target.value)}
        className={INPUT}
      />
    </Field>
  );

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Configuración"
        description="Los datos y reglas que usa el sitio. Los cambios se aplican a las reservas nuevas."
        actions={
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        }
      />
      {notice && (
        <div className="mb-6">
          <Notice kind={notice.kind}>{notice.text}</Notice>
        </div>
      )}
      <div className="flex flex-col gap-8">
        <Card title="Contacto y ubicación">
          <div className="grid grid-cols-2 gap-6">
            <Field
              label="WhatsApp"
              hint="Con código de país, por ejemplo +598 99 123 456. Lo usa el botón para enviar el comprobante."
            >
              <input
                value={settings.whatsappNumber ?? ""}
                onChange={(e) => setText("whatsappNumber", e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Barrio" hint="Público: se muestra en el sitio.">
              <input
                value={settings.neighborhood ?? ""}
                onChange={(e) => setText("neighborhood", e.target.value)}
                className={INPUT}
              />
            </Field>
            <div className="col-span-2">
              <Field
                label="Dirección exacta"
                hint="Privada: solo se envía en el email de confirmación, cuando se cobra la seña."
              >
                <input
                  value={settings.address ?? ""}
                  onChange={(e) => setText("address", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Pagos">
          <div className="grid grid-cols-2 gap-6">
            {number(
              "depositPercent",
              "Seña (%)",
              0,
              100,
              "Porcentaje del precio que se paga al reservar.",
            )}
            {number(
              "transferDiscountPercent",
              "Descuento por transferencia (%)",
              0,
              100,
              "Se descuenta del precio si pagan por transferencia.",
            )}
            {number(
              "mpHoldMinutes",
              "Tiempo para pagar con Mercado Pago (minutos)",
              5,
              60,
              "Mientras tanto, el horario queda guardado.",
            )}
            {number(
              "transferHoldHours",
              "Tiempo para transferir (horas)",
              1,
              48,
              "Si no llega la transferencia, el horario se libera.",
            )}
            <div className="col-span-2">
              <Field
                label="Datos bancarios"
                hint="Se muestran al cliente cuando elige transferencia: banco, tipo y número de cuenta, titular."
              >
                <textarea
                  rows={4}
                  value={settings.bankDetails ?? ""}
                  onChange={(e) => setText("bankDetails", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Agenda">
          <div className="grid grid-cols-3 gap-6">
            {number(
              "bufferMinutes",
              "Descanso entre sesiones (minutos)",
              0,
              120,
            )}
            {number(
              "minAdvanceHours",
              "Anticipación mínima (horas)",
              0,
              168,
              "No se puede reservar con menos anticipación.",
            )}
            {number(
              "maxAdvanceDays",
              "Ventana de reservas (días)",
              1,
              365,
              "Hasta cuántos días hacia adelante se puede reservar.",
            )}
          </div>
        </Card>

        <Card title="Políticas de reserva y cancelación">
          <Field
            label="Texto que el cliente acepta al reservar"
            hint="Por ahora el sitio muestra un texto fijo; este campo se conecta cuando se guarden las reservas."
          >
            <textarea
              rows={6}
              value={settings.cancellationPolicyText ?? ""}
              onChange={(e) =>
                setText("cancellationPolicyText", e.target.value)
              }
              className={INPUT}
            />
          </Field>
        </Card>
      </div>
    </form>
  );
}
