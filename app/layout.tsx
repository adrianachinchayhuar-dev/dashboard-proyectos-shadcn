import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Nexo | Dashboard de proyectos",
  description: "Proyectos, tareas y equipo en un solo espacio de trabajo.",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
