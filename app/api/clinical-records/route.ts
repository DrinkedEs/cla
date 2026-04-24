import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  addClinicalRecordEntry,
  createClinicalRecord,
  getClinicalEntriesForUser,
  getClinicalRecordsForUser
} from "@/lib/data";
import { handleApiError } from "@/lib/http";
import { clinicalEntryCreateSchema, clinicalRecordCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    const [clinicalRecords, clinicalEntries] = await Promise.all([
      getClinicalRecordsForUser(user),
      getClinicalEntriesForUser(user)
    ]);
    return NextResponse.json({ ok: true, clinicalRecords, clinicalEntries });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    if ("recordId" in body) {
      const parsed = clinicalEntryCreateSchema.parse(body);
      const clinicalEntries = await addClinicalRecordEntry(user, parsed);
      const clinicalRecords = await getClinicalRecordsForUser(user);
      return NextResponse.json({ ok: true, clinicalRecords, clinicalEntries }, { status: 201 });
    }

    if (user.role !== "doctor") {
      throw new Error("Solo los doctores pueden crear expedientes clinicos.");
    }

    const parsed = clinicalRecordCreateSchema.parse(body);
    await createClinicalRecord(user.id, parsed);
    const [clinicalRecords, clinicalEntries] = await Promise.all([
      getClinicalRecordsForUser(user),
      getClinicalEntriesForUser(user)
    ]);
    return NextResponse.json({ ok: true, clinicalRecords, clinicalEntries }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
