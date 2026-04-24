import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DoctorLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await requireRole("doctor");

  return (
    <>
      <DashboardHeader
        user={user}
        title="Tu dashboard de doctor"
        subtitle="Edita tu perfil profesional, administra tu CV, tu galeria y el CRUD completo de servicios."
      />
      {children}
    </>
  );
}
