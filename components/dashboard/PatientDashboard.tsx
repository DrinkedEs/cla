"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AppIcon } from "@/components/icons/AppIcon";
import { SelectField, TextInput, TextareaField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import type { PatientDashboardData } from "@/lib/types";

type PatientDashboardProps = {
  initialData: PatientDashboardData;
};

const sexOptions = [
  { label: "Femenino", value: "femenino" },
  { label: "Masculino", value: "masculino" },
  { label: "Otro", value: "otro" },
  { label: "Prefiero no decirlo", value: "prefiero_no_decir" }
];

export function PatientDashboard({ initialData }: PatientDashboardProps) {
  const router = useRouter();
  const [account, setAccount] = useState(initialData.account);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  async function handleProfileSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/me", {
      method: "PATCH",
      body: formData
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; account?: PatientDashboardData["account"] }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "No pudimos guardar tus cambios.");
      return;
    }

    if (payload?.account) {
      setAccount(payload.account);
      setSuccess("Perfil actualizado correctamente.");
      startTransition(() => router.refresh());
    }
  }

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Esto desactivara tu cuenta y cerrara tu sesion. Deseas continuar?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/me", {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "No pudimos desactivar tu cuenta.");
        return;
      }

      startTransition(() => {
        router.push(payload?.redirectTo ?? "/");
        router.refresh();
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <div className="grid gap-5">
        <Surface>
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusPill tone="mint">Paciente activo</StatusPill>
              <h2 className="mt-3 text-2xl font-black text-white">
                {account.profile.fullName}
              </h2>
              <p className="mt-1 text-sm text-white/55">{account.email}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint/10 text-mint">
              <AppIcon name="user" className="h-6 w-6" />
            </div>
          </div>

          <form action={handleProfileSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Nombre completo"
                name="fullName"
                defaultValue={account.profile.fullName}
                required
              />
              <TextInput
                label="Correo"
                name="email"
                type="email"
                defaultValue={account.email}
                required
              />
              <TextInput
                label="Telefono"
                name="phone"
                defaultValue={account.phone}
                required
              />
              <TextInput
                label="Fecha de nacimiento"
                name="birthDate"
                type="date"
                defaultValue={account.profile.birthDate}
                required
              />
            </div>

            <SelectField
              label="Sexo"
              name="sex"
              options={sexOptions}
              defaultValue={account.profile.sex}
            />

            <TextareaField
              label="Alergias"
              name="allergies"
              defaultValue={account.profile.allergies}
              required
            />
            <TextareaField
              label="Medicamentos actuales"
              name="currentMedications"
              defaultValue={account.profile.currentMedications}
              required
            />
            <TextareaField
              label="Motivo de consulta"
              name="consultationReason"
              defaultValue={account.profile.consultationReason}
              required
            />

            {error ? (
              <div className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-mint">
                {success}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <PrimaryButton type="submit" disabled={isPending} icon="arrow">
                {isPending ? "Guardando..." : "Guardar perfil"}
              </PrimaryButton>
              <PrimaryButton
                type="button"
                variant="ghost"
                disabled={deleting}
                onClick={handleDeactivate}
              >
                {deleting ? "Desactivando..." : "Desactivar cuenta"}
              </PrimaryButton>
            </div>
          </form>
        </Surface>
      </div>

      <div className="grid gap-5">
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <StatusPill tone="violet">Explorar</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">Doctores destacados</h3>
            </div>
            <Link href="/buscar" className="text-sm font-bold text-violet-100">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {initialData.featuredDoctors.length > 0 ? (
              initialData.featuredDoctors.map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/doctores/${doctor.slug}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-200/25"
                >
                  <p className="font-black text-white">{doctor.fullName}</p>
                  <p className="mt-1 text-sm text-white/55">
                    {doctor.semester} · {doctor.university}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/58">{doctor.bio}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                Todavia no hay doctores publicados. Puedes volver mas tarde o invitar al primero a registrarse.
              </div>
            )}
          </div>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <StatusPill tone="mint">Servicios</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">Tratamientos activos</h3>
            </div>
            <Link href="/resultados" className="text-sm font-bold text-violet-100">
              Ver resultados
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {initialData.featuredServices.length > 0 ? (
              initialData.featuredServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/doctores/${service.doctorSlug}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-mint/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{service.title}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                        {service.category}
                      </p>
                    </div>
                    <StatusPill tone="mint">${service.priceMxn.toFixed(2)} MXN</StatusPill>
                  </div>
                  <p className="mt-3 text-sm text-white/58">
                    {service.doctorName} · {service.durationMinutes} min
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                Aun no hay servicios activos publicados.
              </div>
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}
