"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SelectField, TextInput, TextareaField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Surface } from "@/components/ui/Surface";

const sexOptions = [
  { label: "Selecciona una opcion", value: "prefiero_no_decir" },
  { label: "Femenino", value: "femenino" },
  { label: "Masculino", value: "masculino" },
  { label: "Otro", value: "otro" },
  { label: "Prefiero no decirlo", value: "prefiero_no_decir" }
];

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<"paciente" | "doctor">("paciente");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; redirectTo?: string }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "No pudimos crear tu cuenta.");
      return;
    }

    startTransition(() => {
      router.push(payload?.redirectTo ?? "/");
      router.refresh();
    });
  }

  return (
    <Surface className="mx-auto w-full max-w-4xl">
      <form action={handleSubmit} className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole("paciente")}
            className={`rounded-[1.35rem] border p-4 text-left transition ${
              role === "paciente"
                ? "border-mint/35 bg-mint/10 text-white"
                : "border-white/10 bg-black/20 text-white/58"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              Rol
            </p>
            <p className="mt-2 text-lg font-black">Paciente</p>
            <p className="mt-2 text-sm leading-6">
              Completa tu perfil clinico para buscar tratamientos y entrar mas rapido.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`rounded-[1.35rem] border p-4 text-left transition ${
              role === "doctor"
                ? "border-violet-300/35 bg-violet-300/12 text-white"
                : "border-white/10 bg-black/20 text-white/58"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
              Rol
            </p>
            <p className="mt-2 text-lg font-black">Doctor</p>
            <p className="mt-2 text-sm leading-6">
              Este rol representa al estudiante de odontologia que publica perfil, CV y servicios.
            </p>
          </button>
        </div>

        <input type="hidden" name="role" value={role} />

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Nombre completo"
            name="fullName"
            placeholder="Linda Martinez"
            required
          />
          <TextInput
            label="Correo"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            required
          />
          <TextInput
            label="Telefono"
            name="phone"
            placeholder="+52 55 1234 5678"
            required
          />
          <TextInput
            label="Contrasena"
            name="password"
            type="password"
            placeholder="Minimo 8 caracteres"
            required
          />
        </div>

        {role === "paciente" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Fecha de nacimiento"
              name="birthDate"
              type="date"
              required
            />
            <SelectField
              label="Sexo"
              name="sex"
              options={sexOptions}
              defaultValue="prefiero_no_decir"
            />
            <TextareaField
              label="Alergias"
              name="allergies"
              placeholder="Ninguna / Penicilina / Latex..."
              className="md:col-span-2"
              required
            />
            <TextareaField
              label="Medicamentos actuales"
              name="currentMedications"
              placeholder="Ninguno / Ibuprofeno / Tratamiento..."
              className="md:col-span-2"
              required
            />
            <TextareaField
              label="Motivo de consulta"
              name="consultationReason"
              placeholder="Limpieza, dolor, revision, resina..."
              className="md:col-span-2"
              required
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Universidad"
                name="university"
                placeholder="Facultad de Odontologia L&A"
                required
              />
              <TextInput
                label="Semestre"
                name="semester"
                placeholder="8vo semestre"
                required
              />
            </div>

            <TextareaField
              label="Bio profesional"
              name="bio"
              placeholder="Describe tu enfoque, experiencia academica y tipos de atencion que brindas."
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Servicio inicial"
                name="serviceTitle"
                placeholder="Limpieza dental profunda"
                required
              />
              <TextInput
                label="Categoria"
                name="serviceCategory"
                placeholder="Preventivo"
                required
              />
              <TextInput
                label="Precio MXN"
                name="servicePriceMxn"
                type="number"
                min="1"
                step="0.01"
                placeholder="350"
                required
              />
              <TextInput
                label="Duracion en minutos"
                name="serviceDurationMinutes"
                type="number"
                min="1"
                placeholder="55"
                required
              />
            </div>

            <TextareaField
              label="Descripcion del servicio"
              name="serviceDescription"
              placeholder="Explica que incluye, para quien esta pensado y como trabajas."
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  CV en PDF
                </span>
                <input
                  name="cv"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="block min-h-12 rounded-2xl border border-dashed border-violet-300/25 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-violet-electric file:px-3 file:py-2 file:font-bold file:text-white"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  Fotos opcionales
                </span>
                <input
                  name="photos"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="block min-h-12 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white"
                />
              </label>
            </div>
          </div>
        )}

        {error ? (
          <div className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
            {error}
          </div>
        ) : null}

        <PrimaryButton type="submit" disabled={isPending} icon="arrow" className="sm:w-fit">
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </PrimaryButton>
      </form>
    </Surface>
  );
}
