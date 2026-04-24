import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  createAppointmentForPatient,
  getAppointmentsForUser,
  updateAppointmentStatus
} from "@/lib/data";
import { handleApiError } from "@/lib/http";
import { appointmentCreateSchema, appointmentStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    const appointments = await getAppointmentsForUser(user);
    return NextResponse.json({ ok: true, appointments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (user.role !== "paciente") {
      throw new Error("Solo los pacientes pueden crear citas desde este flujo.");
    }
    const body = await request.json();
    const parsed = appointmentCreateSchema.parse(body);
    await createAppointmentForPatient(user.id, parsed);
    const appointments = await getAppointmentsForUser(user);
    return NextResponse.json({ ok: true, appointments }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = appointmentStatusSchema.parse(body);
    await updateAppointmentStatus(user, parsed);
    const appointments = await getAppointmentsForUser(user);
    return NextResponse.json({ ok: true, appointments });
  } catch (error) {
    return handleApiError(error);
  }
}
