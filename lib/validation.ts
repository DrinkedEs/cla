import { z } from "zod";

export const sexSchema = z.enum([
  "femenino",
  "masculino",
  "otro",
  "prefiero_no_decir"
]);

const baseAccountSchema = z.object({
  email: z.email("Ingresa un correo valido.").trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un telefono valido.")
    .max(40, "El telefono es demasiado largo."),
  fullName: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo.")
    .max(160, "El nombre es demasiado largo.")
});

export const loginSchema = z.object({
  email: z.email("Ingresa un correo valido.").trim().toLowerCase(),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});

export const registerPatientSchema = baseAccountSchema.extend({
  role: z.literal("paciente"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  birthDate: z.iso.date("Selecciona una fecha valida."),
  sex: sexSchema,
  allergies: z.string().trim().min(2, "Describe alergias o escribe 'Ninguna'."),
  currentMedications: z
    .string()
    .trim()
    .min(2, "Describe medicamentos o escribe 'Ninguno'."),
  consultationReason: z
    .string()
    .trim()
    .min(5, "Describe el motivo de consulta.")
});

export const registerDoctorSchema = baseAccountSchema.extend({
  role: z.literal("doctor"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  university: z.string().trim().min(3, "Escribe la universidad."),
  semester: z.string().trim().min(1, "Indica el semestre."),
  bio: z.string().trim().min(20, "Agrega una bio un poco mas completa."),
  serviceTitle: z.string().trim().min(3, "Agrega un servicio inicial."),
  serviceCategory: z.string().trim().min(3, "Agrega la categoria del servicio."),
  serviceDescription: z
    .string()
    .trim()
    .min(10, "Describe el servicio inicial."),
  servicePriceMxn: z.coerce
    .number({ error: "Agrega un precio valido." })
    .positive("El precio debe ser mayor a 0."),
  serviceDurationMinutes: z.coerce
    .number({ error: "Agrega una duracion valida." })
    .int("La duracion debe ser entera.")
    .positive("La duracion debe ser mayor a 0.")
});

export const updatePatientSchema = baseAccountSchema.extend({
  birthDate: z.iso.date("Selecciona una fecha valida."),
  sex: sexSchema,
  allergies: z.string().trim().min(2, "Describe alergias o escribe 'Ninguna'."),
  currentMedications: z
    .string()
    .trim()
    .min(2, "Describe medicamentos o escribe 'Ninguno'."),
  consultationReason: z
    .string()
    .trim()
    .min(5, "Describe el motivo de consulta.")
});

export const updateDoctorSchema = baseAccountSchema.extend({
  university: z.string().trim().min(3, "Escribe la universidad."),
  semester: z.string().trim().min(1, "Indica el semestre."),
  bio: z.string().trim().min(20, "Agrega una bio un poco mas completa.")
});

export const doctorServiceSchema = z.object({
  title: z.string().trim().min(3, "Escribe el nombre del servicio."),
  category: z.string().trim().min(3, "Escribe la categoria."),
  description: z.string().trim().min(10, "Describe mejor el servicio."),
  priceMxn: z.coerce
    .number({ error: "Agrega un precio valido." })
    .positive("El precio debe ser mayor a 0."),
  durationMinutes: z.coerce
    .number({ error: "Agrega una duracion valida." })
    .int("La duracion debe ser entera.")
    .positive("La duracion debe ser mayor a 0."),
  isActive: z.boolean().optional().default(true)
});

export const doctorServiceUpdateSchema = doctorServiceSchema.extend({
  serviceId: z.coerce.number().int().positive("Servicio invalido.")
});

export const doctorPhotoDeleteSchema = z.object({
  photoId: z.coerce.number().int().positive("Foto invalida.")
});

export const feedPostSchema = z.object({
  headline: z.string().trim().min(4, "Agrega un titulo corto para la publicacion."),
  body: z.string().trim().min(20, "Comparte una actualizacion un poco mas completa."),
  topic: z.string().trim().min(3, "Indica el tema de la publicacion."),
  visibility: z.enum(["public", "patients_only"]).default("public"),
  featured: z.boolean().optional().default(false)
});

export const appointmentCreateSchema = z.object({
  doctorId: z.coerce.number().int().positive("Doctor invalido."),
  treatmentTitle: z.string().trim().min(3, "Selecciona un tratamiento."),
  notes: z.string().trim().min(6, "Agrega una nota breve para tu cita."),
  scheduledFor: z.string().trim().min(10, "Selecciona una fecha y hora validas.")
});

export const appointmentStatusSchema = z.object({
  appointmentId: z.coerce.number().int().positive("Cita invalida."),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "in_review"]),
  note: z.string().trim().max(255).optional().default("")
});

export const messageSendSchema = z.object({
  conversationId: z.coerce.number().int().positive("Conversacion invalida."),
  body: z.string().trim().min(1, "Escribe un mensaje.")
});

export const clinicalRecordCreateSchema = z.object({
  patientId: z.coerce.number().int().positive("Paciente invalido."),
  title: z.string().trim().min(4, "Agrega un titulo para el expediente."),
  diagnosis: z.string().trim().min(10, "Describe el diagnostico."),
  treatmentPlan: z.string().trim().min(10, "Describe el plan de tratamiento."),
  status: z.enum(["active", "completed", "follow_up"]).default("active")
});

export const clinicalEntryCreateSchema = z.object({
  recordId: z.coerce.number().int().positive("Expediente invalido."),
  note: z.string().trim().min(8, "Agrega una nota clinica mas completa."),
  entryType: z.enum(["assessment", "progress", "prescription", "follow_up"])
});

export function requirePdf(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("El CV en PDF es obligatorio.");
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("El CV debe subirse en formato PDF.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("El CV no puede pesar mas de 8 MB.");
  }

  return file;
}

export function optionalPdf(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return requirePdf(file);
}

export function optionalImages(files: FormDataEntryValue[]) {
  const imageFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0
  );

  for (const file of imageFiles) {
    const isImage =
      file.type.startsWith("image/") ||
      /\.(png|jpe?g|webp)$/i.test(file.name.toLowerCase());

    if (!isImage) {
      throw new Error("Las fotos deben ser PNG, JPG o WEBP.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Cada foto debe pesar menos de 5 MB.");
    }
  }

  return imageFiles;
}

export function formatZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Los datos enviados no son validos.";
}
