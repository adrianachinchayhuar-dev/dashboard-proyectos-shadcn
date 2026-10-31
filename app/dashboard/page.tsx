"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectForm } from "@/components/ProjectForm";
import { TasksTable } from "@/components/TasksTable";
import { Team } from "@/components/Team";
import { Settings } from "@/components/Settings";
import { DeleteButton, Details } from "@/components/DashboardForms";
import {
  initialState,
  applyAction,
  progress,
  type Action,
} from "@/lib/dashboard";
import {
  Layers3,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings2,
  ArrowUpRight,
  CheckCheck,
  Clock3,
  Activity,
} from "lucide-react";
const navigation = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "projects", label: "Proyectos", icon: FolderKanban },
  { id: "tasks", label: "Tareas", icon: ListTodo },
  { id: "team", label: "Equipo", icon: Users },
  { id: "settings", label: "Configuración", icon: Settings2 },
];
export default function DashboardPage() {
  const [state, setState] = useState(initialState),
    [notice, setNotice] = useState("");
  async function save(action: Action, message: string) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setState((previous) => ({
      ...applyAction(previous, action),
      activity: [
        {
          id: crypto.randomUUID(),
          text: message,
          time: new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...previous.activity,
      ].slice(0, 30),
    }));
    setNotice(message);
  }
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      state.settings.theme === "dark",
    );
    return () => document.documentElement.classList.remove("dark");
  }, [state.settings.theme]);
  const completed = state.tasks.filter((t) => t.status === "Completado").length;
  const stats = [
    {
      label: "Proyectos",
      value: state.projects.length,
      caption: "Ideas que se convierten en resultados",
      icon: FolderKanban,
    },
    {
      label: "Total de tareas",
      value: state.tasks.length,
      caption: `${state.tasks.filter((t) => t.status === "En progreso").length} en progreso`,
      icon: ListTodo,
    },
    {
      label: "Completadas",
      value: completed,
      caption: `${state.tasks.filter((t) => t.status === "Pendiente").length} pendientes · ${state.tasks.length - completed} sin completar`,
      icon: CheckCheck,
    },
    {
      label: "Miembros activos",
      value: state.members.filter((m) => m.isActive).length,
      caption: `${state.members.length} personas en el equipo`,
      icon: Users,
    },
  ];
  return (
    <div className={state.settings.theme === "dark" ? "dark" : ""}>
      <div
        className={`min-h-screen bg-background text-foreground ${state.settings.compact ? "compact" : ""}`}
      >
        <header className="border-b bg-card/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Layers3 className="size-6" />
              </span>
              <div>
                <p className="text-lg font-bold tracking-tight">
                  Nexo<span className="text-primary">.</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PROJECT WORKSPACE
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{state.settings.name}</p>
              <p className="text-xs text-muted-foreground">
                Espacio académico · En memoria
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[.18em] text-primary">
                MENOS FRICCIÓN. MÁS PROGRESO.
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Todo tu equipo. Un mismo rumbo.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Organiza proyectos, conecta personas y haz que las cosas
                sucedan.
              </p>
            </div>
            <ProjectForm
              members={state.members}
              onSave={(value, memberIds) =>
                save(
                  { type: "project", value, memberIds },
                  "Proyecto guardado: " + value.name,
                )
              }
            />
          </div>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border bg-card p-1.5">
              {navigation.map((n) => (
                <TabsTrigger
                  key={n.id}
                  value={n.id}
                  className="flex-none gap-2 px-4 py-2.5"
                >
                  <n.icon className="size-4" />
                  {n.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {notice && state.settings.notifications && (
              <Alert className="border-primary/20 bg-secondary">
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span role="status">{notice}</span>
                  <button
                    aria-label="Cerrar notificación"
                    onClick={() => setNotice("")}
                    className="px-2"
                  >
                    ×
                  </button>
                </AlertDescription>
              </Alert>
            )}
            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Una mirada al progreso
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Datos reales de tu espacio de trabajo, actualizados al
                    instante.
                  </p>
                </div>
                <Badge variant="outline">Sesión actual</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s, i) => (
                  <Card key={s.label} className="metric-card">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardDescription>{s.label}</CardDescription>
                      <span className={`metric-icon tone-${i}`}>
                        <s.icon className="size-5" />
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-semibold tracking-tight">
                        {s.value}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {s.caption}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="size-5 text-primary" />
                      Progreso de proyectos
                    </CardTitle>
                    <CardDescription>
                      Porcentaje de tareas completadas por proyecto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {state.projects.length ? (
                      state.projects.map((p) => (
                        <div key={p.id}>
                          <div className="mb-2 flex justify-between gap-3 text-sm">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground">
                              {progress(state, p.id)}%
                            </span>
                          </div>
                          <Progress
                            aria-label={`Progreso de ${p.name}`}
                            value={progress(state, p.id)}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Crea un proyecto para comenzar.
                      </p>
                    )}
                  </CardContent>
                </Card>
                {state.settings.showActivity && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="size-5 text-primary" />
                        Actividad reciente
                      </CardTitle>
                      <CardDescription>
                        Operaciones realizadas durante esta sesión.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-72 space-y-5 overflow-y-auto">
                        {state.activity.length ? (
                          state.activity.map((a) => (
                            <div key={a.id} className="flex items-start gap-3">
                              <span className="mt-1 rounded-full bg-secondary p-2">
                                <ArrowUpRight className="size-4 text-primary" />
                              </span>
                              <p className="flex-1 text-sm">{a.text}</p>
                              <time className="text-xs text-muted-foreground">
                                {a.time}
                              </time>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <Clock3 className="mx-auto mb-3 size-7 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Tu próxima acción empieza esta historia.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            <TabsContent value="projects" className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Proyectos con propósito
                </h2>
                <p className="text-sm text-muted-foreground">
                  {state.projects.length} proyectos · El progreso se calcula a
                  partir de sus tareas.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {state.projects.map((p) => (
                  <Card key={p.id} className="project-card">
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-xl bg-secondary p-3 text-primary">
                          <FolderKanban className="size-5" />
                        </span>
                        <Badge variant="secondary">{p.status}</Badge>
                      </div>
                      <CardTitle>{p.name}</CardTitle>
                      <CardDescription className="min-h-10 break-words">
                        {p.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso de tareas</span>
                        <span>{progress(state, p.id)}%</span>
                      </div>
                      <Progress
                        value={progress(state, p.id)}
                        aria-label={`Progreso de ${p.name}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {state.members
                          .filter((m) => m.projectId === p.id)
                          .map((m) => m.name)
                          .join(", ") || "Sin miembros asignados"}
                      </p>
                      <div className="flex flex-wrap gap-1 border-t pt-4">
                        <Details title={p.name}>
                          <p>{p.description}</p>
                          <p>Estado: {p.status}</p>
                          <p>
                            Categoría: {p.category} · Prioridad: {p.priority}
                          </p>
                          <p>Progreso: {progress(state, p.id)}%</p>
                          <p>
                            Equipo:{" "}
                            {state.members
                              .filter((m) => m.projectId === p.id)
                              .map((m) => m.name)
                              .join(", ") || "Sin asignar"}
                          </p>
                          <p>
                            Tareas:{" "}
                            {
                              state.tasks.filter((t) => t.projectId === p.id)
                                .length
                            }
                          </p>
                          {state.tasks
                            .filter((t) => t.projectId === p.id)
                            .map((t) => (
                              <p key={t.id}>
                                • {t.description} — {t.status}
                              </p>
                            ))}
                        </Details>
                        <ProjectForm
                          project={p}
                          members={state.members}
                          onSave={(value, memberIds) =>
                            save(
                              { type: "project", value, memberIds },
                              "Proyecto actualizado: " + value.name,
                            )
                          }
                        />
                        <DeleteButton
                          name="este proyecto"
                          description="Se eliminarán sus tareas y sus miembros quedarán sin proyecto."
                          onDelete={() =>
                            save(
                              { type: "delete", kind: "project", id: p.id },
                              "Proyecto eliminado: " + p.name,
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {!state.projects.length && (
                <p className="py-12 text-center text-muted-foreground">
                  Aún no hay proyectos. Crea el primero con «Nuevo proyecto».
                </p>
              )}
            </TabsContent>
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Del plan a la acción</CardTitle>
                  <CardDescription>
                    Gestiona tareas, prioridades y responsables.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TasksTable state={state} save={save} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="team">
              <Team state={state} save={save} />
            </TabsContent>
            <TabsContent value="settings">
              <Settings
                initial={state.settings}
                onSave={(value) =>
                  save({ type: "settings", value }, "Preferencias actualizadas")
                }
              />
            </TabsContent>
          </Tabs>
          <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t pt-5 text-xs text-muted-foreground">
            <span>Nexo · Un espacio para avanzar juntos</span>
            <span>
              Datos de ejemplo en memoria · Se restablecen al recargar
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
