"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays } from "lucide-react";
import { es } from "date-fns/locale";
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "select"
    | "checkbox"
    | "textarea"
    | "readonly";
  options?: { value: string; label: string }[];
  required?: boolean;
  birthdate?: boolean;
};
export type Values = Record<string, string | boolean>;
export function DateField({
  id,
  value,
  onChange,
  birthdate,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  birthdate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <CalendarDays />
          {value
            ? new Date(value + "T12:00:00").toLocaleDateString("es-PE")
            : "Selecciona una fecha"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={es}
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(1920, 0)}
          endMonth={birthdate ? new Date() : new Date(2040, 11)}
          disabled={birthdate ? { after: new Date() } : undefined}
          selected={value ? new Date(value + "T12:00:00") : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
              );
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
export function Fields({
  fields,
  values,
  setValues,
  prefix,
}: {
  fields: Field[];
  values: Values;
  setValues: (v: Values) => void;
  prefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div
          key={f.key}
          className={
            f.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"
          }
        >
          <Label htmlFor={prefix + f.key}>
            {f.label}
            {f.required ? " *" : ""}
          </Label>
          {f.type === "checkbox" ? (
            <Checkbox
              id={prefix + f.key}
              checked={Boolean(values[f.key])}
              onCheckedChange={(v) =>
                setValues({ ...values, [f.key]: v === true })
              }
            />
          ) : f.type === "date" ? (
            <DateField
              id={prefix + f.key}
              value={String(values[f.key] || "")}
              onChange={(v) => setValues({ ...values, [f.key]: v })}
              birthdate={f.birthdate}
            />
          ) : f.type === "select" ? (
            <Select
              value={String(values[f.key] || "none")}
              onValueChange={(v) =>
                setValues({ ...values, [f.key]: v === "none" ? "" : v })
              }
            >
              <SelectTrigger id={prefix + f.key} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {f.options?.map((o) => (
                  <SelectItem key={o.value || "none"} value={o.value || "none"}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : f.type === "textarea" ? (
            <Textarea
              id={prefix + f.key}
              value={String(values[f.key] || "")}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            />
          ) : (
            <Input
              id={prefix + f.key}
              type={f.type === "readonly" ? "text" : f.type || "text"}
              readOnly={f.type === "readonly"}
              value={String(values[f.key] || "")}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
export function validateFields(fields: Field[], values: Values) {
  for (const f of fields) {
    const v = String(values[f.key] || "").trim();
    if (f.required && !v) return `Completa el campo «${f.label}».`;
    if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return "Introduce un correo válido.";
    if (f.type === "tel" && v && !/^\+?[\d\s()-]{7,20}$/.test(v))
      return "Introduce un teléfono válido (7 a 20 caracteres).";
    if (
      f.type === "date" &&
      v &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v)))
    )
      return "Selecciona una fecha válida.";
    if (f.birthdate && v && new Date(v + "T00:00:00") > new Date())
      return "La fecha de nacimiento no puede ser futura.";
  }
  return "";
}
export function RecordForm({
  title,
  trigger,
  initial,
  fields,
  onSave,
  validate,
  children,
}: {
  title: string;
  trigger?: ReactNode;
  initial: Values;
  fields: Field[] | ((v: Values) => Field[]);
  onSave: (v: Values) => Promise<void>;
  validate?: (v: Values) => string;
  children?: (v: Values, set: (v: Values) => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false),
    [values, setValues] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const activeFields = typeof fields === "function" ? fields(values) : fields;
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          if (v) {
            setValues(initial);
            setError("");
          }
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || <Button>{title}</Button>}
      </DialogTrigger>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Completa los campos obligatorios (*). Los cambios se guardan durante
            esta sesión.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const message =
              validateFields(activeFields, values) || validate?.(values);
            if (message) {
              setError(message);
              return;
            }
            setError("");
            setBusy(true);
            try {
              await onSave(
                Object.fromEntries(
                  Object.entries(values).map(([k, v]) => [
                    k,
                    typeof v === "string" ? v.trim() : v,
                  ]),
                ),
              );
              setOpen(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "No se pudo guardar.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy} className="space-y-5">
            <Fields
              fields={activeFields}
              values={values}
              setValues={setValues}
              prefix={title}
            />
            {children?.(values, setValues)}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Spinner />}
                {busy ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function Details({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Ver detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Información del registro en esta sesión.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm break-words">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
export function DeleteButton({
  name,
  description,
  onDelete,
}: {
  name: string;
  description: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>¿Eliminar {name}?</DialogTitle>
          <DialogDescription>
            {description} Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onDelete();
              setBusy(false);
              setOpen(false);
            }}
          >
            {busy && <Spinner />}Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export const options = (values: string[]) =>
  values.map((value) => ({ value, label: value }));
