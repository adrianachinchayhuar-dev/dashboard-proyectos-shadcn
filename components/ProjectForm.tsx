"use client";
import { RecordForm, options, type Values } from "./DashboardForms";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  type Member,
  type Project,
  projectStatuses,
  priorities,
} from "@/lib/dashboard";
export function ProjectForm({
  project,
  members,
  onSave,
}: {
  project?: Project;
  members: Member[];
  onSave: (project: Project, memberIds: string[]) => Promise<void>;
}) {
  const initial: Values = {
    ...(project || {
      id: "",
      name: "",
      description: "",
      category: "Desarrollo Web",
      priority: "Media",
      status: "Planificado",
    }),
    ...Object.fromEntries(
      members.map((m) => ["member:" + m.userId, m.projectId === project?.id]),
    ),
  };
  return (
    <RecordForm
      title={project ? "Editar proyecto" : "Nuevo proyecto"}
      trigger={
        project ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : undefined
      }
      initial={initial}
      fields={[
        { key: "name", label: "Nombre del proyecto", required: true },
        {
          key: "status",
          label: "Estado",
          type: "select",
          options: options(projectStatuses),
        },
        {
          key: "description",
          label: "Descripción",
          type: "textarea",
          required: true,
        },
        {
          key: "category",
          label: "Categoría",
          type: "select",
          options: options([
            "Desarrollo Web",
            "Desarrollo Mobile",
            "Diseño",
            "Marketing",
            "Otro",
          ]),
        },
        {
          key: "priority",
          label: "Prioridad",
          type: "select",
          options: options(priorities),
        },
      ]}
      onSave={async (v) =>
        onSave(
          {
            id: project?.id || crypto.randomUUID(),
            name: String(v.name),
            description: String(v.description),
            category: String(v.category),
            priority: String(v.priority),
            status: String(v.status),
          },
          members.filter((m) => v["member:" + m.userId]).map((m) => m.userId),
        )
      }
    >
      {(v, set) => (
        <div className="space-y-3">
          <p className="font-medium text-sm">Miembros del equipo</p>
          <p className="text-xs text-muted-foreground">
            Cada miembro pertenece a un proyecto. Al trasladarlo se desasignan
            sus tareas anteriores.
          </p>
          {members.length ? (
            members.map((m) => (
              <Label key={m.userId} className="flex items-center gap-2">
                <Checkbox
                  checked={Boolean(v["member:" + m.userId])}
                  onCheckedChange={(value) =>
                    set({ ...v, ["member:" + m.userId]: value === true })
                  }
                />
                {m.name} {!m.isActive && "(Inactivo)"}
              </Label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Añade miembros desde Equipo.
            </p>
          )}
        </div>
      )}
    </RecordForm>
  );
}
