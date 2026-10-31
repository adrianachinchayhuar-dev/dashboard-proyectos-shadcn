export type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  status: string;
};
export type Member = {
  userId: string;
  role: string;
  name: string;
  email: string;
  position: string;
  birthdate: string;
  phone: string;
  projectId: string;
  isActive: boolean;
};
export type Task = {
  id: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  userId: string;
  deadline: string;
};
export type Settings = {
  name: string;
  email: string;
  notifications: boolean;
  theme: string;
  compact: boolean;
  showActivity: boolean;
};
export type State = {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  settings: Settings;
  activity: { id: string; text: string; time: string }[];
};
export const statuses = ["Pendiente", "En progreso", "Completado"];
export const priorities = ["Baja", "Media", "Alta", "Urgente"];
export const projectStatuses = [
  "Planificado",
  "En progreso",
  "En revisión",
  "Completado",
];
export const initialState: State = {
  projects: [
    {
      id: "p1",
      name: "E-commerce Platform",
      description: "Una experiencia de compra simple, rápida y accesible.",
      category: "Desarrollo Web",
      priority: "Alta",
      status: "En progreso",
    },
    {
      id: "p2",
      name: "Mobile App",
      description: "Llevamos nuestros servicios al bolsillo de cada usuario.",
      category: "Desarrollo Mobile",
      priority: "Media",
      status: "En revisión",
    },
    {
      id: "p3",
      name: "Design System",
      description: "Un lenguaje visual compartido para construir mejor.",
      category: "Diseño",
      priority: "Media",
      status: "Planificado",
    },
  ],
  members: [
    {
      userId: "u1",
      name: "María García",
      role: "Colaborador",
      position: "Frontend Developer",
      email: "maria@example.com",
      birthdate: "1998-04-12",
      phone: "+51 987654321",
      projectId: "p1",
      isActive: true,
    },
    {
      userId: "u2",
      name: "Juan Pérez",
      role: "Colaborador",
      position: "Backend Developer",
      email: "juan@example.com",
      birthdate: "1997-08-20",
      phone: "+51 987654322",
      projectId: "p1",
      isActive: true,
    },
    {
      userId: "u3",
      name: "Ana López",
      role: "Líder",
      position: "UI/UX Designer",
      email: "ana@example.com",
      birthdate: "1999-02-10",
      phone: "+51 987654323",
      projectId: "p2",
      isActive: true,
    },
    {
      userId: "u4",
      name: "Carlos Ruiz",
      role: "Colaborador",
      position: "Designer",
      email: "carlos@example.com",
      birthdate: "1995-06-05",
      phone: "+51 987654324",
      projectId: "p3",
      isActive: false,
    },
  ],
  tasks: [
    "Implementar autenticación",
    "Optimizar catálogo",
    "Diseñar carrito",
    "Validar accesibilidad",
    "Diseñar perfil móvil",
    "Probar navegación",
    "Definir tipografía",
    "Documentar componentes",
  ].map((description, i) => ({
    id: `t${i + 1}`,
    description,
    projectId: i < 4 ? "p1" : i < 6 ? "p2" : "p3",
    userId: i < 4 ? (i % 2 ? "u2" : "u1") : i < 6 ? "u3" : "",
    status: statuses[i % 3],
    priority: priorities[i % 4],
    deadline: `2026-11-${String(10 + i).padStart(2, "0")}`,
  })),
  settings: {
    name: "Alex Morgan",
    email: "alex@example.com",
    notifications: true,
    theme: "light",
    compact: false,
    showActivity: true,
  },
  activity: [],
};
export type Action =
  | { type: "project"; value: Project; memberIds: string[] }
  | { type: "member"; value: Member }
  | { type: "task"; value: Task }
  | { type: "delete"; kind: "project" | "member" | "task"; id: string }
  | { type: "settings"; value: Settings };
function upsert<T>(items: T[], value: T, key: keyof T) {
  return items.some((x) => x[key] === value[key])
    ? items.map((x) => (x[key] === value[key] ? value : x))
    : [...items, value];
}
export function applyAction(state: State, action: Action): State {
  const next = { ...state };
  if (action.type === "project") {
    next.projects = upsert(state.projects, action.value, "id");
    next.members = state.members.map((m) => ({
      ...m,
      projectId: action.memberIds.includes(m.userId)
        ? action.value.id
        : m.projectId === action.value.id
          ? ""
          : m.projectId,
    }));
  } else if (action.type === "member")
    next.members = upsert(state.members, action.value, "userId");
  else if (action.type === "task")
    next.tasks = upsert(state.tasks, action.value, "id");
  else if (action.type === "settings") next.settings = action.value;
  else if (action.kind === "project") {
    next.projects = state.projects.filter((p) => p.id !== action.id);
    next.tasks = state.tasks.filter((t) => t.projectId !== action.id);
    next.members = state.members.map((m) =>
      m.projectId === action.id ? { ...m, projectId: "" } : m,
    );
  } else if (action.kind === "member") {
    next.members = state.members.filter((m) => m.userId !== action.id);
    next.tasks = state.tasks.map((t) =>
      t.userId === action.id ? { ...t, userId: "" } : t,
    );
  } else next.tasks = state.tasks.filter((t) => t.id !== action.id);
  // Reconcile assignments after project changes, team transfers and deactivation.
  next.tasks = next.tasks.map((t) => ({
    ...t,
    userId: next.members.some(
      (m) => m.userId === t.userId && m.projectId === t.projectId && m.isActive,
    )
      ? t.userId
      : "",
  }));
  return next;
}
export function progress(state: State, id: string) {
  const tasks = state.tasks.filter((t) => t.projectId === id);
  return tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "Completado").length / tasks.length) *
          100,
      )
    : 0;
}
export function filterTasks(
  tasks: Task[],
  project: string,
  status: string,
  priority: string,
) {
  return tasks.filter(
    (t) =>
      (!project || t.projectId === project) &&
      (!status || t.status === status) &&
      (!priority || t.priority === priority),
  );
}
export function paginate<T>(items: T[], page: number, size = 5) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return {
    items: items.slice((current - 1) * size, current * size),
    pages,
    current,
  };
}
