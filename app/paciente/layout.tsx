import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PatientLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await requireRole("paciente");

  return (
    <>
      <DashboardHeader
        user={user}
        title="Tu dashboard de paciente"
        subtitle="Actualiza tus datos clinicos y explora servicios activos sin salir de tu cuenta."
      />
      {children}
    </>
  );
}
