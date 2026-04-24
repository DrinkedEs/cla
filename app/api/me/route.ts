import { NextResponse } from "next/server";
import { clearUserSession, requireApiUser } from "@/lib/auth";
import { createAssetInputFromFile } from "@/lib/file-assets";
import {
  deactivateOwnAccount,
  getOwnAccount,
  updateDoctorAccount,
  updatePatientAccount
} from "@/lib/data";
import { readFormString } from "@/lib/form-data";
import { apiError, handleApiError } from "@/lib/http";
import {
  optionalPdf,
  updateDoctorSchema,
  updatePatientSchema
} from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    const account = await getOwnAccount(user);

    if (!account) {
      apiError("No encontramos tu cuenta.", 404);
    }

    return NextResponse.json({ ok: true, account });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const formData = await request.formData();

    if (user.role === "paciente") {
      const parsed = updatePatientSchema.parse({
        email: readFormString(formData, "email"),
        phone: readFormString(formData, "phone"),
        fullName: readFormString(formData, "fullName"),
        birthDate: readFormString(formData, "birthDate"),
        sex: readFormString(formData, "sex"),
        allergies: readFormString(formData, "allergies"),
        currentMedications: readFormString(formData, "currentMedications"),
        consultationReason: readFormString(formData, "consultationReason")
      });

      const account = await updatePatientAccount(user.id, parsed);

      return NextResponse.json({ ok: true, account });
    }

    const parsed = updateDoctorSchema.parse({
      email: readFormString(formData, "email"),
      phone: readFormString(formData, "phone"),
      fullName: readFormString(formData, "fullName"),
      university: readFormString(formData, "university"),
      semester: readFormString(formData, "semester"),
      bio: readFormString(formData, "bio")
    });

    const cvFile = optionalPdf(formData.get("cv"));
    const cvAsset = cvFile
      ? await createAssetInputFromFile(cvFile, "doctor_cv")
      : null;

    const result = await updateDoctorAccount(user.id, {
      ...parsed,
      cvAsset
    });

    return NextResponse.json({ ok: true, account: result.account });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireApiUser();
    await deactivateOwnAccount(user.id);
    await clearUserSession();
    return NextResponse.json({ ok: true, redirectTo: "/" });
  } catch (error) {
    return handleApiError(error);
  }
}
