# Nexo · Dashboard académico

Dashboard de gestión de proyectos con Next.js 16, React 19, TypeScript, Tailwind CSS v4 y shadcn/ui. Conserva las cinco pestañas y los componentes originales ProjectForm y TasksTable, ahora conectados a un estado compartido.

## Ejecutar

Requiere Node.js 22.20 o posterior (las pruebas usan eliminación nativa de tipos).

```powershell
cd C:\WEB_AVANZADO\tarea-dashboard-shadcn\next-shadcn-ui
npm ci
npm run dev
```

Abrir la URL que indique Next.js y visitar `/dashboard`. `/` redirige al dashboard. Si el puerto está ocupado, usar `npm run dev -- --port 3002` después de cerrar otros servidores de este mismo proyecto.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Los scripts usan Webpack y el adaptador oficial `@tailwindcss/postcss`: Turbopack presentó un fallo interno al ejecutar el procesador CSS en este entorno Windows. Se usan fuentes del sistema para evitar descargas de Google Fonts durante la compilación.

## Funcionalidades

- Proyectos: creación, consulta de detalles, edición y eliminación confirmada; descripción, categoría, prioridad, estado y selección de miembros.
- Equipo: CRUD con userId único, role, name, email, position, birthdate, phone, projectId e isActive. Validación de obligatorios, correo único sin distinguir mayúsculas, teléfono y nacimiento no futuro.
- Tareas: CRUD con description, projectId, status, priority, userId y deadline; responsable activo del proyecto, calendario y filtros combinados. Paginación real de cinco registros por página, que se ajusta al reducirse los resultados.
- Configuración: nombre, correo, confirmaciones, tema claro/oscuro, vista compacta y visibilidad de actividad. Guardado simulado de 450 ms y confirmación.
- Resumen: proyectos, total de tareas, completadas, pendientes, tareas en progreso, miembros activos y progreso por proyecto calculados desde los registros. Actividad generada únicamente por operaciones reales de la sesión.
- Diseño responsive con paleta azul, turquesa y violeta, estados vacíos y formularios reutilizables.

## Estado y relaciones

El estado vive en `DashboardPage`, por encima de Tabs, y se actualiza funcionalmente mediante `applyAction`. No hay backend, endpoints, base de datos, localStorage ni sessionStorage. Cambiar de pestaña conserva los registros guardados; recargar la página los restaura a los ejemplos iniciales. Los borradores no guardados pueden descartarse al salir de una pestaña.

Cada miembro pertenece como máximo a un proyecto (projectId). Asignarlo desde un proyecto lo traslada del anterior. Sus tareas anteriores quedan sin responsable. Desactivar o eliminar a un miembro también desasigna sus tareas. Eliminar un proyecto elimina sus tareas y deja a sus miembros sin proyecto. Ninguna operación de eliminación deja referencias rotas.

El progreso es tareas completadas / total de tareas; vale 0 si no hay tareas. El estado administrativo del proyecto se edita independientemente de este progreso. Los roles son datos académicos, sin autenticación ni permisos reales. Notificaciones significa mostrar confirmaciones dentro del dashboard; no envía correos ni notificaciones del sistema.

## Componentes shadcn/ui

Instalados oficialmente: Alert, Calendar, Pagination, Spinner, Popover, Textarea y Progress. Se reutilizan Avatar, Badge, Button, Card, Checkbox, Dialog, Input, Label, Select, Table y Tabs. Calendar usa react-day-picker y date-fns.

## Archivos de la implementación

Modificados:
- `app/dashboard/page.tsx`: composición, cinco pestañas y estado compartido.
- `components/ProjectForm.tsx`: formulario funcional con edición y equipo.
- `components/TasksTable.tsx`: gestión de tareas, filtros y paginación.
- `app/globals.css`: tokens de color, temas, espaciado y animación accesible.
- `app/layout.tsx`, `app/page.tsx`: metadatos, idioma español y acceso al dashboard.
- `package.json`, `package-lock.json`, `next.config.ts`: dependencias, verificaciones y compilación.

Creados:
- `lib/dashboard.ts`: tipos, ejemplos, operaciones y selectores.
- `components/DashboardForms.tsx`: formularios, validación, calendario, detalles y confirmación.
- `components/Team.tsx`, `components/Settings.tsx`: módulos de equipo y preferencias.
- `components/ui/{alert,calendar,pagination,spinner,popover,textarea,progress}.tsx`.
- `postcss.config.mjs`, `tests/dashboard.test.mjs`.

El repositorio ya tenía cambios locales al comenzar; se conservaron los componentes instalados y se trabajó únicamente dentro del proyecto.

## Verificación

Cinco pruebas automatizadas de lógica cubren CRUD, cascada de eliminación, traslado/desactivación de responsables, métricas, filtros, paginación y aislamiento del estado inicial. No sustituyen una suite completa de pruebas de navegador. Se verificaron además manualmente en el navegador validación de obligatorios, creación/listado/detalles de proyecto, navegación entre pestañas, segunda página de tareas selección de fecha desde Calendar, formulario completo de miembros, guardado de configuración y restablecimiento de datos al recargar.

## Despliegue en Vercel

Importar el repositorio y seleccionar `next-shadcn-ui` como Root Directory si el repositorio incluye la carpeta superior. Seleccionar Next.js, usar `npm ci` y `npm run build`, y mantener la salida predeterminada del framework. Usar una versión de Node compatible con Next.js y las pruebas (22.20+). No requiere variables de entorno ni servicios de datos. Comprobar `/dashboard` en la preview antes de publicar. Cada visitante y cada recarga empiezan con datos de ejemplo; Vercel no añade persistencia a este estado en React.
