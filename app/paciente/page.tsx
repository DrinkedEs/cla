import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { requireRole } from "@/lib/auth";
import { getPatientDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const user = await requireRole("paciente");
  const data = await getPatientDashboardData(user.id);

  if (!data) {
    throw new Error("No pudimos cargar el dashboard del paciente.");
  }

  return <PatientDashboard initialData={data} />;
}
