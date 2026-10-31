"use client";
import { useState } from "react";
import {
  type State,
  type Task,
  type Action,
  statuses,
  priorities,
  filterTasks,
  paginate,
} from "@/lib/dashboard";
import {
  RecordForm,
  Details,
  DeleteButton,
  options,
  type Values,
} from "./DashboardForms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
export function TaskForm({
  task,
  state,
  save,
}: {
  task?: Task;
  state: State;
  save: (a: Action, message: string) => Promise<void>;
}) {
  return (
    <RecordForm
      title={task ? "Editar tarea" : "Nueva tarea"}
      trigger={
        task ? (
          <Button size="sm" variant="outline">
            Editar
          </Button>
        ) : (
          <Button disabled={!state.projects.length}>Nueva tarea</Button>
        )
      }
      initial={{
        ...(task || {
          id: "",
          description: "",
          projectId: state.projects[0]?.id || "",
          status: "Pendiente",
          priority: "Media",
          userId: "",
          deadline: "",
        }),
      }}
      fields={(v: Values) => [
        {
          key: "description",
          label: "Descripción",
          type: "textarea",
          required: true,
        },
        {
          key: "projectId",
          label: "Proyecto",
          type: "select",
          required: true,
          options: state.projects.map((p) => ({ value: p.id, label: p.name })),
        },
        {
          key: "status",
          label: "Estado",
          type: "select",
          options: options(statuses),
        },
        {
          key: "priority",
          label: "Prioridad",
          type: "select",
          options: options(priorities),
        },
        {
          key: "userId",
          label: "Responsable",
          type: "select",
          options: [
            { value: "", label: "Sin asignar" },
            ...state.members
              .filter((m) => m.isActive && m.projectId === v.projectId)
              .map((m) => ({ value: m.userId, label: m.name })),
          ],
        },
        {
          key: "deadline",
          label: "Fecha límite",
          type: "date",
          required: true,
        },
      ]}
      validate={(v) =>
        v.userId &&
        !state.members.some(
          (m) =>
            m.userId === v.userId && m.projectId === v.projectId && m.isActive,
        )
          ? "Selecciona un responsable activo del proyecto o «Sin asignar»."
          : ""
      }
      onSave={async (v) =>
        save(
          {
            type: "task",
            value: {
              id: task?.id || crypto.randomUUID(),
              description: String(v.description),
              projectId: String(v.projectId),
              status: String(v.status),
              priority: String(v.priority),
              userId: String(v.userId),
              deadline: String(v.deadline),
            },
          },
          task ? "Tarea actualizada" : "Tarea creada",
        )
      }
    />
  );
}
export function TasksTable({
  state,
  save,
}: {
  state: State;
  save: (a: Action, message: string) => Promise<void>;
}) {
  const [project, setProject] = useState(""),
    [status, setStatus] = useState(""),
    [priority, setPriority] = useState(""),
    [page, setPage] = useState(1);
  const filtered = filterTasks(state.tasks, project, status, priority),
    result = paginate(filtered, page);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            {
              name: "Proyecto",
              value: project,
              set: setProject,
              items: state.projects.map((p) => ({
                value: p.id,
                label: p.name,
              })),
            },
            {
              name: "Estado",
              value: status,
              set: setStatus,
              items: options(statuses),
            },
            {
              name: "Prioridad",
              value: priority,
              set: setPriority,
              items: options(priorities),
            },
          ].map((f) => (
            <Select
              key={f.name}
              value={f.value || "all"}
              onValueChange={(v) => {
                f.set(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label={`Filtrar por ${f.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.name}: todos</SelectItem>
                {f.items.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        <TaskForm state={state} save={save} />
      </div>
      {!state.projects.length && (
        <p className="text-sm text-muted-foreground">
          Crea un proyecto para añadir tareas.
        </p>
      )}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Tarea",
                "Proyecto",
                "Estado",
                "Prioridad",
                "Responsable",
                "Fecha límite",
                "Acciones",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length ? (
              result.items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="min-w-48 whitespace-normal font-medium">
                    {t.description}
                  </TableCell>
                  <TableCell>
                    {state.projects.find((p) => p.id === t.projectId)?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "Completado" ? "default" : "secondary"
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.priority === "Urgente" ? "destructive" : "outline"
                      }
                    >
                      {t.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {state.members.find((m) => m.userId === t.userId)?.name ||
                      "Sin asignar"}
                  </TableCell>
                  <TableCell>{t.deadline}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Details title={t.description}>
                        <p>
                          Proyecto:{" "}
                          {
                            state.projects.find((p) => p.id === t.projectId)
                              ?.name
                          }
                        </p>
                        <p>
                          Estado: {t.status} · Prioridad: {t.priority}
                        </p>
                        <p>
                          Responsable:{" "}
                          {state.members.find((m) => m.userId === t.userId)
                            ?.name || "Sin asignar"}
                        </p>
                        <p>Fecha límite: {t.deadline}</p>
                      </Details>
                      <TaskForm task={t} state={state} save={save} />
                      <DeleteButton
                        name="esta tarea"
                        description="Se eliminará del proyecto y de las métricas."
                        onDelete={() =>
                          save(
                            { type: "delete", kind: "task", id: t.id },
                            "Tarea eliminada",
                          )
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No hay tareas para estos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} tareas · Página {result.current} de {result.pages}
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                disabled={result.current === 1}
                onClick={() => setPage(result.current - 1)}
              >
                Anterior
              </Button>
            </PaginationItem>
            {Array.from({ length: result.pages }, (_, i) => i + 1)
              .filter(
                (n) =>
                  Math.abs(n - result.current) <= 1 ||
                  n === 1 ||
                  n === result.pages,
              )
              .map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === result.current}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <Button
                variant="outline"
                disabled={result.current === result.pages}
                onClick={() => setPage(result.current + 1)}
              >
                Siguiente
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
