import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth";
import { addDoctorPhotos, deleteDoctorPhoto } from "@/lib/data";
import { createAssetInputFromFile } from "@/lib/file-assets";
import { handleApiError } from "@/lib/http";
import { doctorPhotoDeleteSchema, optionalImages } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("doctor");
    const formData = await request.formData();
    const photoFiles = optionalImages(formData.getAll("photos"));
    const photoAssets = await Promise.all(
      photoFiles.map((file) => createAssetInputFromFile(file, "doctor_photo"))
    );

    const photos = await addDoctorPhotos(user.id, photoAssets);

    return NextResponse.json({ ok: true, photos }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiRole("doctor");
    const body = await request.json();
    const parsed = doctorPhotoDeleteSchema.parse(body);
    const result = await deleteDoctorPhoto(user.id, parsed.photoId);

    return NextResponse.json({ ok: true, photos: result.photos });
  } catch (error) {
    return handleApiError(error);
  }
}
