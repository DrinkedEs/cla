import { NextResponse } from "next/server";
import { createUserSession, hashPassword } from "@/lib/auth";
import { createAssetInputFromFile } from "@/lib/file-assets";
import {
  createDoctorAccount,
  createPatientAccount
} from "@/lib/data";
import { readFormString } from "@/lib/form-data";
import { handleApiError } from "@/lib/http";
import {
  optionalImages,
  registerDoctorSchema,
  registerPatientSchema,
  requirePdf
} from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const role = readFormString(formData, "role");

    if (role === "paciente") {
      const parsed = registerPatientSchema.parse({
        role,
        email: readFormString(formData, "email"),
        phone: readFormString(formData, "phone"),
        password: readFormString(formData, "password"),
        fullName: readFormString(formData, "fullName"),
        birthDate: readFormString(formData, "birthDate"),
        sex: readFormString(formData, "sex"),
        allergies: readFormString(formData, "allergies"),
        currentMedications: readFormString(formData, "currentMedications"),
        consultationReason: readFormString(formData, "consultationReason")
      });

      const userId = await createPatientAccount({
        email: parsed.email,
        phone: parsed.phone,
        passwordHash: await hashPassword(parsed.password),
        fullName: parsed.fullName,
        birthDate: parsed.birthDate,
        sex: parsed.sex,
        allergies: parsed.allergies,
        currentMedications: parsed.currentMedications,
        consultationReason: parsed.consultationReason
      });

      await createUserSession(userId);

      return NextResponse.json({ ok: true, redirectTo: "/paciente" }, { status: 201 });
    }

    const parsed = registerDoctorSchema.parse({
      role,
      email: readFormString(formData, "email"),
      phone: readFormString(formData, "phone"),
      password: readFormString(formData, "password"),
      fullName: readFormString(formData, "fullName"),
      university: readFormString(formData, "university"),
      semester: readFormString(formData, "semester"),
      bio: readFormString(formData, "bio"),
      serviceTitle: readFormString(formData, "serviceTitle"),
      serviceCategory: readFormString(formData, "serviceCategory"),
      serviceDescription: readFormString(formData, "serviceDescription"),
      servicePriceMxn: readFormString(formData, "servicePriceMxn"),
      serviceDurationMinutes: readFormString(formData, "serviceDurationMinutes")
    });

    const cvFile = requirePdf(formData.get("cv"));
    const photoFiles = optionalImages(formData.getAll("photos"));
    const [cvAsset, photoAssets] = await Promise.all([
      createAssetInputFromFile(cvFile, "doctor_cv"),
      Promise.all(
        photoFiles.map((file) => createAssetInputFromFile(file, "doctor_photo"))
      )
    ]);

    const userId = await createDoctorAccount({
      email: parsed.email,
      phone: parsed.phone,
      passwordHash: await hashPassword(parsed.password),
      fullName: parsed.fullName,
      university: parsed.university,
      semester: parsed.semester,
      bio: parsed.bio,
      cvAsset,
      photoAssets,
      service: {
        title: parsed.serviceTitle,
        category: parsed.serviceCategory,
        description: parsed.serviceDescription,
        priceMxn: parsed.servicePriceMxn,
        durationMinutes: parsed.serviceDurationMinutes
      }
    });

    await createUserSession(userId);

    return NextResponse.json({ ok: true, redirectTo: "/doctor" }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
