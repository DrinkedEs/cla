"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AppIcon } from "@/components/icons/AppIcon";
import { TextInput, TextareaField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import type { DoctorDashboardData } from "@/lib/types";

type DoctorDashboardProps = {
  initialData: DoctorDashboardData;
};

type MessageState = {
  error: string | null;
  success: string | null;
};

const emptyMessageState: MessageState = {
  error: null,
  success: null
};

export function DoctorDashboard({ initialData }: DoctorDashboardProps) {
  const router = useRouter();
  const [account, setAccount] = useState(initialData.account);
  const [profileMessage, setProfileMessage] = useState<MessageState>(emptyMessageState);
  const [photoMessage, setPhotoMessage] = useState<MessageState>(emptyMessageState);
  const [serviceMessage, setServiceMessage] = useState<MessageState>(emptyMessageState);
  const [isPending, startTransition] = useTransition();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [workingServiceId, setWorkingServiceId] = useState<number | null>(null);

  async function refreshAfterMutate() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleProfileSubmit(formData: FormData) {
    setProfileMessage(emptyMessageState);

    const response = await fetch("/api/me", {
      method: "PATCH",
      body: formData
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; account?: DoctorDashboardData["account"] }
      | null;

    if (!response.ok) {
      setProfileMessage({
        error: payload?.error ?? "No pudimos actualizar tu perfil.",
        success: null
      });
      return;
    }

    if (payload?.account) {
      setAccount(payload.account);
      setProfileMessage({
        error: null,
        success: "Perfil actualizado correctamente."
      });
      await refreshAfterMutate();
    }
  }

  async function handlePhotoUpload(formData: FormData) {
    setPhotoMessage(emptyMessageState);

    const response = await fetch("/api/doctor/photos", {
      method: "POST",
      body: formData
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; photos?: DoctorDashboardData["account"]["photos"] }
      | null;

    if (!response.ok) {
      setPhotoMessage({
        error: payload?.error ?? "No pudimos subir las fotos.",
        success: null
      });
      return;
    }

    setAccount((current) => ({
      ...current,
      photos: payload?.photos ?? current.photos
    }));
    setPhotoMessage({
      error: null,
      success: "Galeria actualizada."
    });
    await refreshAfterMutate();
  }

  async function handleDeletePhoto(photoId: number) {
    const response = await fetch("/api/doctor/photos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ photoId })
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; photos?: DoctorDashboardData["account"]["photos"] }
      | null;

    if (!response.ok) {
      setPhotoMessage({
        error: payload?.error ?? "No pudimos eliminar la foto.",
        success: null
      });
      return;
    }

    setAccount((current) => ({
      ...current,
      photos: payload?.photos ?? current.photos
    }));
    setPhotoMessage({
      error: null,
      success: "Foto eliminada."
    });
    await refreshAfterMutate();
  }

  async function handleCreateService(formData: FormData) {
    setServiceMessage(emptyMessageState);

    const response = await fetch("/api/doctor/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        category: String(formData.get("category") ?? ""),
        description: String(formData.get("description") ?? ""),
        priceMxn: Number(formData.get("priceMxn") ?? 0),
        durationMinutes: Number(formData.get("durationMinutes") ?? 0),
        isActive: true
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; services?: DoctorDashboardData["account"]["services"] }
      | null;

    if (!response.ok) {
      setServiceMessage({
        error: payload?.error ?? "No pudimos crear el servicio.",
        success: null
      });
      return;
    }

    setAccount((current) => ({
      ...current,
      services: payload?.services ?? current.services
    }));
    setServiceMessage({
      error: null,
      success: "Servicio creado correctamente."
    });
    await refreshAfterMutate();
  }

  async function handleUpdateService(serviceId: number, formData: FormData) {
    setWorkingServiceId(serviceId);
    setServiceMessage(emptyMessageState);

    try {
      const response = await fetch("/api/doctor/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId,
          title: String(formData.get("title") ?? ""),
          category: String(formData.get("category") ?? ""),
          description: String(formData.get("description") ?? ""),
          priceMxn: Number(formData.get("priceMxn") ?? 0),
          durationMinutes: Number(formData.get("durationMinutes") ?? 0),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; services?: DoctorDashboardData["account"]["services"] }
        | null;

      if (!response.ok) {
        setServiceMessage({
          error: payload?.error ?? "No pudimos actualizar el servicio.",
          success: null
        });
        return;
      }

      setAccount((current) => ({
        ...current,
        services: payload?.services ?? current.services
      }));
      setServiceMessage({
        error: null,
        success: "Servicio actualizado."
      });
      await refreshAfterMutate();
    } finally {
      setWorkingServiceId(null);
    }
  }

  async function handleDeleteService(serviceId: number) {
    const confirmed = window.confirm("Deseas eliminar este servicio?");

    if (!confirmed) {
      return;
    }

    setWorkingServiceId(serviceId);
    setServiceMessage(emptyMessageState);

    try {
      const response = await fetch("/api/doctor/services", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ serviceId })
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; services?: DoctorDashboardData["account"]["services"] }
        | null;

      if (!response.ok) {
        setServiceMessage({
          error: payload?.error ?? "No pudimos eliminar el servicio.",
          success: null
        });
        return;
      }

      setAccount((current) => ({
        ...current,
        services: payload?.services ?? current.services
      }));
      setServiceMessage({
        error: null,
        success: "Servicio eliminado."
      });
      await refreshAfterMutate();
    } finally {
      setWorkingServiceId(null);
    }
  }

  async function handleDeactivateAccount() {
    const confirmed = window.confirm(
      "Esto desactivara tu cuenta, ocultara tu perfil del catalogo y cerrara tu sesion. Deseas continuar?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingAccount(true);
    setProfileMessage(emptyMessageState);

    try {
      const response = await fetch("/api/me", {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        setProfileMessage({
          error: payload?.error ?? "No pudimos desactivar la cuenta.",
          success: null
        });
        return;
      }

      startTransition(() => {
        router.push(payload?.redirectTo ?? "/");
        router.refresh();
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
      <div className="grid gap-5">
        <Surface>
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusPill tone="violet">Perfil publico activo</StatusPill>
              <h2 className="mt-3 text-2xl font-black text-white">
                {account.profile.fullName}
              </h2>
              <p className="mt-1 text-sm text-white/55">{account.profile.displayTitle}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                URL publica: /doctores/{account.profile.publicSlug}
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
              <AppIcon name="tooth" className="h-6 w-6" />
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
                label="Semestre"
                name="semester"
                defaultValue={account.profile.semester}
                required
              />
            </div>

            <TextInput
              label="Universidad"
              name="university"
              defaultValue={account.profile.university}
              required
            />

            <TextareaField
              label="Bio"
              name="bio"
              defaultValue={account.profile.bio}
              required
            />

            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                Reemplazar CV
              </span>
              <input
                name="cv"
                type="file"
                accept=".pdf,application/pdf"
                className="block min-h-12 rounded-2xl border border-dashed border-violet-300/25 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-violet-electric file:px-3 file:py-2 file:font-bold file:text-white"
              />
              <span className="text-xs text-white/38">
                Archivo actual: {account.profile.cvFilename}
              </span>
              {account.profile.cvUrl ? (
                <a
                  href={account.profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-violet-100 transition hover:text-white"
                >
                  Ver CV publicado
                </a>
              ) : null}
            </label>

            {profileMessage.error ? (
              <div className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
                {profileMessage.error}
              </div>
            ) : null}
            {profileMessage.success ? (
              <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-mint">
                {profileMessage.success}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <PrimaryButton type="submit" disabled={isPending} icon="arrow">
                {isPending ? "Guardando..." : "Guardar perfil"}
              </PrimaryButton>
              <PrimaryButton
                type="button"
                variant="ghost"
                disabled={deletingAccount}
                onClick={handleDeactivateAccount}
              >
                {deletingAccount ? "Desactivando..." : "Desactivar cuenta"}
              </PrimaryButton>
            </div>
          </form>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <StatusPill tone="mint">Servicios</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">Agregar servicio</h3>
            </div>
            <span className="text-sm text-white/45">
              {account.services.filter((service) => service.isActive).length} activos
            </span>
          </div>

          <form action={handleCreateService} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Titulo" name="title" placeholder="Limpieza dental profunda" required />
              <TextInput label="Categoria" name="category" placeholder="Preventivo" required />
              <TextInput
                label="Precio MXN"
                name="priceMxn"
                type="number"
                step="0.01"
                min="1"
                placeholder="350"
                required
              />
              <TextInput
                label="Duracion en minutos"
                name="durationMinutes"
                type="number"
                min="1"
                placeholder="55"
                required
              />
            </div>
            <TextareaField
              label="Descripcion"
              name="description"
              placeholder="Incluye valoracion, limpieza y recomendaciones posteriores."
              required
            />
            <PrimaryButton type="submit" icon="arrow" className="sm:w-fit">
              Crear servicio
            </PrimaryButton>
          </form>

          {serviceMessage.error ? (
            <div className="mt-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
              {serviceMessage.error}
            </div>
          ) : null}
          {serviceMessage.success ? (
            <div className="mt-4 rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-mint">
              {serviceMessage.success}
            </div>
          ) : null}
        </Surface>
      </div>

      <div className="grid gap-5">
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <StatusPill tone="violet">Galeria</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">Fotos del perfil</h3>
            </div>
            <span className="text-sm text-white/45">{account.photos.length} archivos</span>
          </div>

          <form action={handlePhotoUpload} className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                Subir fotos
              </span>
              <input
                name="photos"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="block min-h-12 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white"
              />
            </label>
            <PrimaryButton type="submit" variant="secondary" icon="arrow" className="sm:w-fit">
              Subir fotos
            </PrimaryButton>
          </form>

          {photoMessage.error ? (
            <div className="mt-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
              {photoMessage.error}
            </div>
          ) : null}
          {photoMessage.success ? (
            <div className="mt-4 rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-mint">
              {photoMessage.success}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {account.photos.length > 0 ? (
              account.photos.map((photo) => (
                <div key={photo.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/5">
                    <Image
                      src={photo.fileUrl}
                      alt="Foto del doctor"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                  <PrimaryButton
                    type="button"
                    variant="ghost"
                    className="mt-3 w-full"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    Eliminar foto
                  </PrimaryButton>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50 sm:col-span-2">
                Aun no has subido fotos. Puedes publicar tu CV y empezar solo con servicios si quieres.
              </div>
            )}
          </div>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <StatusPill tone="mint">CRUD completo</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">Servicios publicados</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="rounded-2xl bg-black/20 px-3 py-2">
                <p className="font-black text-white">{account.services.length}</p>
                <p className="text-[0.72rem] text-white/45">Totales</p>
              </div>
              <div className="rounded-2xl bg-black/20 px-3 py-2">
                <p className="font-black text-white">
                  {account.services.filter((service) => service.isActive).length}
                </p>
                <p className="text-[0.72rem] text-white/45">Activos</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {account.services.length > 0 ? (
              account.services.map((service) => (
                <form
                  key={service.id}
                  action={(formData) => handleUpdateService(service.id, formData)}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{service.title}</p>
                      <p className="text-sm text-white/45">{service.category}</p>
                    </div>
                    <StatusPill tone={service.isActive ? "mint" : "muted"}>
                      {service.isActive ? "Activo" : "Oculto"}
                    </StatusPill>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextInput label="Titulo" name="title" defaultValue={service.title} required />
                      <TextInput
                        label="Categoria"
                        name="category"
                        defaultValue={service.category}
                        required
                      />
                      <TextInput
                        label="Precio MXN"
                        name="priceMxn"
                        type="number"
                        step="0.01"
                        min="1"
                        defaultValue={String(service.priceMxn)}
                        required
                      />
                      <TextInput
                        label="Duracion"
                        name="durationMinutes"
                        type="number"
                        min="1"
                        defaultValue={String(service.durationMinutes)}
                        required
                      />
                    </div>
                    <TextareaField
                      label="Descripcion"
                      name="description"
                      defaultValue={service.description}
                      required
                    />
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/72">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={service.isActive}
                        className="h-4 w-4 rounded border-white/20 bg-transparent"
                      />
                      Mostrar este servicio en el catalogo publico
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <PrimaryButton
                        type="submit"
                        disabled={workingServiceId === service.id}
                        icon="arrow"
                      >
                        {workingServiceId === service.id ? "Guardando..." : "Guardar servicio"}
                      </PrimaryButton>
                      <PrimaryButton
                        type="button"
                        variant="ghost"
                        disabled={workingServiceId === service.id}
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Eliminar
                      </PrimaryButton>
                    </div>
                  </div>
                </form>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                Aun no tienes servicios publicados. Agrega el primero arriba para aparecer en resultados.
              </div>
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}
