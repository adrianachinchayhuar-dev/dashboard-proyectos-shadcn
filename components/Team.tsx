"use client";
import { type State, type Member, type Action } from "@/lib/dashboard";
import { RecordForm, Details, DeleteButton, options } from "./DashboardForms";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
function MemberForm({
  member,
  state,
  save,
}: {
  member?: Member;
  state: State;
  save: (a: Action, message: string) => Promise<void>;
}) {
  return (
    <RecordForm
      title={member ? "Editar miembro" : "Nuevo miembro"}
      trigger={
        member ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : undefined
      }
      initial={{
        ...(member || {
          userId: "Se genera al guardar",
          role: "Colaborador",
          name: "",
          email: "",
          position: "",
          birthdate: "",
          phone: "",
          projectId: "",
          isActive: true,
        }),
      }}
      fields={[
        { key: "userId", label: "ID de usuario", type: "readonly" },
        { key: "name", label: "Nombre completo", required: true },
        { key: "email", label: "Correo", type: "email", required: true },
        {
          key: "role",
          label: "Rol",
          type: "select",
          options: options(["Administrador", "Líder", "Colaborador"]),
        },
        { key: "position", label: "Cargo", required: true },
        {
          key: "birthdate",
          label: "Fecha de nacimiento",
          type: "date",
          birthdate: true,
          required: true,
        },
        { key: "phone", label: "Teléfono", type: "tel", required: true },
        {
          key: "projectId",
          label: "Proyecto",
          type: "select",
          options: [
            { value: "", label: "Sin proyecto" },
            ...state.projects.map((p) => ({ value: p.id, label: p.name })),
          ],
        },
        { key: "isActive", label: "Miembro activo", type: "checkbox" },
      ]}
      validate={(v) =>
        state.members.some(
          (m) =>
            m.userId !== member?.userId &&
            m.email.toLowerCase() === String(v.email).trim().toLowerCase(),
        )
          ? "Este correo ya está registrado."
          : ""
      }
      onSave={async (v) =>
        save(
          {
            type: "member",
            value: {
              userId: member?.userId || crypto.randomUUID(),
              name: String(v.name),
              email: String(v.email),
              role: String(v.role),
              position: String(v.position),
              birthdate: String(v.birthdate),
              phone: String(v.phone),
              projectId: String(v.projectId),
              isActive: Boolean(v.isActive),
            },
          },
          member ? "Miembro actualizado" : "Miembro creado",
        )
      }
    />
  );
}
export function Team({
  state,
  save,
}: {
  state: State;
  save: (a: Action, message: string) => Promise<void>;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Un gran equipo, mejores proyectos
          </h2>
          <p className="text-sm text-muted-foreground">
            Personas, roles y asignaciones en un solo lugar.
          </p>
        </div>
        <MemberForm state={state} save={save} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.members.map((m) => (
          <Card key={m.userId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-secondary text-primary">
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Badge variant={m.isActive ? "secondary" : "outline"}>
                  {m.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardTitle className="pt-2">{m.name}</CardTitle>
              <CardDescription>
                {m.position} · {m.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm break-all">{m.email}</p>
              <p className="text-sm text-muted-foreground">
                {state.projects.find((p) => p.id === m.projectId)?.name ||
                  "Sin proyecto"}
              </p>
              <div className="flex flex-wrap gap-1">
                <Details title={m.name}>
                  <dl className="grid gap-2">
                    {Object.entries({
                      userId: m.userId,
                      Rol: m.role,
                      Nombre: m.name,
                      Correo: m.email,
                      Cargo: m.position,
                      Nacimiento: m.birthdate,
                      Teléfono: m.phone,
                      Proyecto:
                        state.projects.find((p) => p.id === m.projectId)
                          ?.name || "Sin proyecto",
                      Estado: m.isActive ? "Activo" : "Inactivo",
                    }).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Details>
                <MemberForm member={m} state={state} save={save} />
                <DeleteButton
                  name="este miembro"
                  description="Sus tareas quedarán sin responsable."
                  onDelete={() =>
                    save(
                      { type: "delete", kind: "member", id: m.userId },
                      "Miembro eliminado",
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!state.members.length && (
        <p className="py-12 text-center text-muted-foreground">
          Tu equipo está por comenzar. Añade el primer miembro.
        </p>
      )}
    </div>
  );
}
