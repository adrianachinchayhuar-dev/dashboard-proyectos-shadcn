import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  applyAction,
  progress,
  filterTasks,
  paginate,
} from "../lib/dashboard.ts";
const fresh = () => structuredClone(initialState);
test("CRUD de proyectos y eliminación en cascada sin referencias inválidas", () => {
  let s = fresh();
  const p = {
    id: "new",
    name: "Nuevo",
    description: "Prueba",
    status: "Planificado",
    category: "Diseño",
    priority: "Media",
  };
  s = applyAction(s, { type: "project", value: p, memberIds: ["u1"] });
  assert.equal(s.projects.length, 4);
  assert.equal(s.members[0].projectId, "new");
  assert.ok(
    s.tasks.filter((t) => t.projectId === "p1").every((t) => t.userId !== "u1"),
  );
  s = applyAction(s, {
    type: "project",
    value: { ...p, name: "Editado" },
    memberIds: ["u1"],
  });
  assert.equal(s.projects.find((p) => p.id === "new").name, "Editado");
  s = applyAction(s, { type: "delete", kind: "project", id: "p1" });
  assert.ok(s.tasks.every((t) => t.projectId !== "p1"));
  assert.ok(s.members.every((m) => m.projectId !== "p1"));
  assert.equal(s.projects.length, 3);
});
test("CRUD de miembros y desasignación al desactivar, trasladar y eliminar", () => {
  for (const changes of [{ isActive: false }, { projectId: "p2" }]) {
    let s = fresh();
    s = applyAction(s, {
      type: "member",
      value: { ...s.members[0], ...changes },
    });
    assert.ok(s.tasks.every((t) => t.userId !== "u1"));
  }
  let s = fresh();
  s = applyAction(s, {
    type: "member",
    value: { ...s.members[0], userId: "new", name: "Nuevo" },
  });
  assert.equal(s.members.length, 5);
  s = applyAction(s, { type: "delete", kind: "member", id: "u1" });
  assert.equal(s.members.length, 4);
  assert.ok(s.tasks.every((t) => t.userId !== "u1"));
});
test("CRUD de tareas recalcula métricas y progreso", () => {
  let s = fresh();
  const before = s.tasks.length;
  const t = {
    id: "new",
    description: "Prueba",
    projectId: "p3",
    status: "Completado",
    priority: "Alta",
    userId: "",
    deadline: "2026-11-15",
  };
  s = applyAction(s, { type: "task", value: t });
  assert.equal(s.tasks.length, before + 1);
  assert.equal(progress(s, "p3"), 33);
  s = applyAction(s, { type: "task", value: { ...t, status: "Pendiente" } });
  assert.equal(progress(s, "p3"), 0);
  s = applyAction(s, { type: "delete", kind: "task", id: "new" });
  assert.equal(s.tasks.length, before);
});
test("filtros combinados y paginación real, incluyendo página vacía tras borrar", () => {
  const s = fresh();
  assert.equal(filterTasks(s.tasks, "p1", "En progreso", "Media").length, 1);
  const first = paginate(s.tasks, 1),
    second = paginate(s.tasks, 2);
  assert.equal(first.items.length, 5);
  assert.equal(second.items.length, 3);
  assert.ok(second.items.every((t) => !first.items.includes(t)));
  assert.equal(paginate(s.tasks.slice(0, 3), 2).current, 1);
  assert.deepEqual(paginate([], 9), { items: [], pages: 1, current: 1 });
});
test("preferencias en memoria, estado inicial intacto para una recarga", () => {
  const s = fresh();
  const changed = applyAction(s, {
    type: "settings",
    value: { ...s.settings, name: "Cambio", theme: "dark" },
  });
  assert.equal(changed.settings.theme, "dark");
  assert.equal(initialState.settings.theme, "light");
  assert.equal(initialState.settings.name, "Alex Morgan");
});
