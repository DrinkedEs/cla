import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import {
  createDoctorService,
  deleteDoctorService,
  getDoctorAccountByUserId,
  updateDoctorService
} from "@/lib/data";
import { readJsonBoolean } from "@/lib/form-data";
import { apiError, handleApiError } from "@/lib/http";
import {
  doctorServiceSchema,
  doctorServiceUpdateSchema
} from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiRole("doctor");
    const account = await getDoctorAccountByUserId(user.id);

    return NextResponse.json({ ok: true, services: account?.services ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("doctor");
    const body = await request.json();
    const parsed = doctorServiceSchema.parse({
      title: body.title,
      category: body.category,
      description: body.description,
      priceMxn: body.priceMxn,
      durationMinutes: body.durationMinutes,
      isActive:
        body.isActive === undefined ? undefined : readJsonBoolean(body.isActive)
    });

    const services = await createDoctorService(user.id, parsed);

    return NextResponse.json({ ok: true, services }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiRole("doctor");
    const body = await request.json();
    const parsed = doctorServiceUpdateSchema.parse({
      serviceId: body.serviceId,
      title: body.title,
      category: body.category,
      description: body.description,
      priceMxn: body.priceMxn,
      durationMinutes: body.durationMinutes,
      isActive:
        body.isActive === undefined ? undefined : readJsonBoolean(body.isActive)
    });

    const services = await updateDoctorService(user.id, parsed);

    return NextResponse.json({ ok: true, services });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiRole("doctor");
    const body = await request.json();
    const serviceId = Number(body.serviceId);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      apiError("Servicio invalido.");
    }

    const services = await deleteDoctorService(user.id, serviceId);

    return NextResponse.json({ ok: true, services });
  } catch (error) {
    return handleApiError(error);
  }
}
