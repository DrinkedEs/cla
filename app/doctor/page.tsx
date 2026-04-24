import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { requireRole } from "@/lib/auth";
import { getDoctorDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DoctorDashboardPage() {
  const user = await requireRole("doctor");
  const data = await getDoctorDashboardData(user.id);

  if (!data) {
    throw new Error("No pudimos cargar el dashboard del doctor.");
  }

  return <DoctorDashboard initialData={data} />;
}
