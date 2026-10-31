"use client";
import { useState } from "react";
import {
  Fields,
  validateFields,
  type Values,
  type Field,
} from "./DashboardForms";
import { type Settings as Preferences } from "@/lib/dashboard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
const fields: Field[] = [
  { key: "name", label: "Nombre de usuario", required: true },
  { key: "email", label: "Correo de contacto", type: "email", required: true },
  {
    key: "theme",
    label: "Tema visual",
    type: "select",
    options: [
      { value: "light", label: "Claro" },
      { value: "dark", label: "Oscuro" },
    ],
  },
  {
    key: "notifications",
    label: "Mostrar confirmaciones de operaciones",
    type: "checkbox",
  },
  { key: "compact", label: "Vista compacta", type: "checkbox" },
  {
    key: "showActivity",
    label: "Mostrar actividad en el resumen",
    type: "checkbox",
  },
];
export function Settings({
  initial,
  onSave,
}: {
  initial: Preferences;
  onSave: (value: Preferences) => Promise<void>;
}) {
  const [values, setValues] = useState<Values>({ ...initial }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Tu espacio, a tu manera</CardTitle>
        <CardDescription>
          Preferencias de cuenta y del dashboard. Se restablecen al recargar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaved(false);
            const error = validateFields(fields, values);
            setError(error);
            if (error) return;
            setBusy(true);
            await onSave({
              name: String(values.name).trim(),
              email: String(values.email).trim(),
              theme: String(values.theme),
              notifications: Boolean(values.notifications),
              compact: Boolean(values.compact),
              showActivity: Boolean(values.showActivity),
            });
            setBusy(false);
            setSaved(true);
          }}
        >
          <fieldset disabled={busy} className="space-y-6">
            <Fields
              fields={fields}
              values={values}
              setValues={(v) => {
                setValues(v);
                setSaved(false);
              }}
              prefix="settings"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {saved && (
              <Alert>
                <AlertDescription>
                  Preferencias guardadas para esta sesión.
                </AlertDescription>
              </Alert>
            )}
            <Button disabled={busy}>
              {busy && <Spinner />}
              {busy ? "Guardando…" : "Guardar preferencias"}
            </Button>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
