import type { Metadata, Viewport } from "next";
import { AppExperienceShell } from "@/components/ui/AppExperienceShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "L&A Dental",
  description:
    "Plataforma con MySQL local, autenticacion real y dashboards por rol para pacientes y estudiantes de odontologia."
};

export const viewport: Viewport = {
  themeColor: "#f6f1fb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="page-shell min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <AppExperienceShell>{children}</AppExperienceShell>
      </body>
    </html>
  );
}
