"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
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
  const [feed, setFeed] = useState(initialData.feed);
  const [appointments, setAppointments] = useState(initialData.appointments);
  const [conversations, setConversations] = useState(initialData.conversations);
  const [messages, setMessages] = useState(initialData.messages);
  const [clinicalRecords, setClinicalRecords] = useState(initialData.clinicalRecords);
  const [clinicalEntries, setClinicalEntries] = useState(initialData.clinicalEntries);
  const [profileMessage, setProfileMessage] = useState<MessageState>(emptyMessageState);
  const [photoMessage, setPhotoMessage] = useState<MessageState>(emptyMessageState);
  const [serviceMessage, setServiceMessage] = useState<MessageState>(emptyMessageState);
  const [timelineMessage, setTimelineMessage] = useState<MessageState>(emptyMessageState);
  const [isPending, startTransition] = useTransition();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [workingServiceId, setWorkingServiceId] = useState<number | null>(null);
  const [messageBody, setMessageBody] = useState("");

  const topConversation = conversations[0] ?? null;
  const myPatients = useMemo(
    () =>
      Array.from(
        new Map(
          clinicalRecords.map((record) => [record.patientId, { id: record.patientId, name: record.patientName }])
        ).values()
      ),
    [clinicalRecords]
  );

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

  async function handleCreatePost(formData: FormData) {
    setTimelineMessage(emptyMessageState);

    const response = await fetch("/api/feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        headline: String(formData.get("headline") ?? ""),
        body: String(formData.get("body") ?? ""),
        topic: String(formData.get("topic") ?? ""),
        visibility: String(formData.get("visibility") ?? "public"),
        featured: formData.get("featured") === "on"
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; feed?: DoctorDashboardData["feed"] }
      | null;

    if (!response.ok) {
      setTimelineMessage({
        error: payload?.error ?? "No pudimos publicar en tu feed.",
        success: null
      });
      return;
    }

    setFeed(payload?.feed ?? feed);
    setTimelineMessage({
      error: null,
      success: "Publicacion creada y visible en tu feed."
    });
    await refreshAfterMutate();
  }

  async function handleUpdateAppointmentStatus(appointmentId: number, status: string) {
    const response = await fetch("/api/appointments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        appointmentId,
        status,
        note: "Actualizado desde el panel del doctor"
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; appointments?: DoctorDashboardData["appointments"] }
      | null;

    if (!response.ok) {
      setTimelineMessage({
        error: payload?.error ?? "No pudimos actualizar la cita.",
        success: null
      });
      return;
    }

    setAppointments(payload?.appointments ?? appointments);
    await refreshAfterMutate();
  }

  async function handleSendMessage() {
    if (!topConversation || !messageBody.trim()) {
      return;
    }

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversationId: topConversation.conversationId,
        body: messageBody
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          conversations?: DoctorDashboardData["conversations"];
          messages?: DoctorDashboardData["messages"];
        }
      | null;

    if (!response.ok) {
      setTimelineMessage({
        error: payload?.error ?? "No pudimos enviar el mensaje.",
        success: null
      });
      return;
    }

    setConversations(payload?.conversations ?? conversations);
    setMessages(payload?.messages ?? messages);
    setMessageBody("");
    await refreshAfterMutate();
  }

  async function handleCreateClinicalRecord(formData: FormData) {
    setTimelineMessage(emptyMessageState);

    const response = await fetch("/api/clinical-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        patientId: Number(formData.get("patientId")),
        title: String(formData.get("title") ?? ""),
        diagnosis: String(formData.get("diagnosis") ?? ""),
        treatmentPlan: String(formData.get("treatmentPlan") ?? ""),
        status: String(formData.get("status") ?? "active")
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          clinicalRecords?: DoctorDashboardData["clinicalRecords"];
          clinicalEntries?: DoctorDashboardData["clinicalEntries"];
        }
      | null;

    if (!response.ok) {
      setTimelineMessage({
        error: payload?.error ?? "No pudimos crear el expediente.",
        success: null
      });
      return;
    }

    setClinicalRecords(payload?.clinicalRecords ?? clinicalRecords);
    setClinicalEntries(payload?.clinicalEntries ?? clinicalEntries);
    setTimelineMessage({
      error: null,
      success: "Expediente clinico creado."
    });
    await refreshAfterMutate();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
      <div className="grid gap-5">
        <Surface className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(160,112,231,0.2),transparent)]" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <StatusPill tone="violet">Feed profesional activo</StatusPill>
              <h2 className="mt-4 text-3xl font-black text-[var(--text)]">
                {account.profile.fullName}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                Convierte tu panel en una experiencia viva: publica avances, organiza citas,
                responde mensajes y documenta seguimiento clinico.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {initialData.activitySummary.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 px-4 py-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-2xl font-black text-[var(--violet-deep)]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <StatusPill tone="violet">Publicar</StatusPill>
              <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Nuevo post para tu feed</h3>
            </div>
            <span className="text-sm text-[var(--text-soft)]">{feed.length} publicaciones</span>
          </div>

          <form action={handleCreatePost} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
              <TextInput label="Titular" name="headline" placeholder="Nueva jornada de limpieza y valoracion" required />
              <TextInput label="Tema" name="topic" placeholder="Agenda, consejos, seguimiento..." required />
            </div>
            <TextareaField
              label="Contenido"
              name="body"
              placeholder="Comparte una novedad tranquila, profesional y util para tus pacientes."
              required
            />
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <select
                name="visibility"
                defaultValue="public"
                className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
              >
                <option value="public">Visible para todos</option>
                <option value="patients_only">Solo pacientes</option>
              </select>
              <label className="flex items-center gap-3 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--text)]">
                <input type="checkbox" name="featured" />
                Destacar publicacion
              </label>
            </div>

            {timelineMessage.error ? (
              <div className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
                {timelineMessage.error}
              </div>
            ) : null}
            {timelineMessage.success ? (
              <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-[#177d6d]">
                {timelineMessage.success}
              </div>
            ) : null}

            <PrimaryButton type="submit" icon="arrow" className="sm:w-fit">
              Publicar actualizacion
            </PrimaryButton>
          </form>

          <div className="mt-6 grid gap-4">
            {feed.map((post) => (
              <article
                key={post.id}
                className="rounded-[1.6rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(124,76,194,0.12)] text-[var(--violet-deep)]">
                    <AppIcon name="tooth" className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone="violet">{post.topic}</StatusPill>
                      {post.featured ? <StatusPill tone="rose">Destacado</StatusPill> : null}
                      <StatusPill tone={post.visibility === "public" ? "mint" : "muted"}>
                        {post.visibility === "public" ? "Publico" : "Pacientes"}
                      </StatusPill>
                    </div>
                    <h4 className="mt-3 text-xl font-black text-[var(--text)]">{post.headline}</h4>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{post.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Surface>

        <div className="grid gap-5 lg:grid-cols-2">
          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="mint">Agenda operativa</StatusPill>
                <h3 className="mt-3 text-xl font-black text-[var(--text)]">Citas y estados</h3>
              </div>
              <span className="text-sm text-[var(--text-soft)]">{appointments.length} activas</span>
            </div>
            <div className="mt-4 grid gap-3">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[1.4rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-[var(--text)]">{appointment.patientName}</p>
                        <p className="text-sm text-[var(--text-soft)]">
                          {appointment.treatmentTitle} ·{" "}
                          {new Date(appointment.scheduledFor).toLocaleString("es-MX")}
                        </p>
                      </div>
                      <StatusPill tone="violet">{appointment.status}</StatusPill>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <PrimaryButton
                        variant="secondary"
                        className="min-h-10 px-3 text-xs"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, "confirmed")}
                      >
                        Confirmar
                      </PrimaryButton>
                      <PrimaryButton
                        variant="ghost"
                        className="min-h-10 px-3 text-xs"
                        onClick={() => handleUpdateAppointmentStatus(appointment.id, "completed")}
                      >
                        Completar
                      </PrimaryButton>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-soft)]">
                  Aun no tienes citas registradas.
                </p>
              )}
            </div>
          </Surface>

          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="violet">Mensajeria</StatusPill>
                <h3 className="mt-3 text-xl font-black text-[var(--text)]">Respuesta rapida</h3>
              </div>
              <span className="text-sm text-[var(--text-soft)]">{conversations.length} chats</span>
            </div>
            <div className="mt-4 grid gap-3">
              {messages.slice(-5).map((message) => (
                <div
                  key={message.id}
                  className={`rounded-[1.3rem] px-4 py-3 text-sm leading-6 ${message.isOwn ? "ml-auto bg-[rgba(124,76,194,0.12)] text-[var(--violet-deep)]" : "mr-auto bg-white/75 text-[var(--text-soft)]"}`}
                >
                  <p className="font-bold">{message.senderName}</p>
                  <p>{message.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder={topConversation ? `Responder a ${topConversation.counterpartName}` : "Sin conversacion activa"}
                className="min-h-12 flex-1 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
              />
              <PrimaryButton onClick={handleSendMessage} icon="send" disabled={!topConversation}>
                Enviar
              </PrimaryButton>
            </div>
          </Surface>
        </div>
      </div>

      <div className="grid gap-5">
        <Surface>
          <StatusPill tone="rose">Historial clinico</StatusPill>
          <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Expedientes activos</h3>
          <div className="mt-4 grid gap-3">
            {clinicalRecords.length > 0 ? (
              clinicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-[1.4rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-[var(--text)]">{record.title}</p>
                      <p className="text-sm text-[var(--text-soft)]">{record.patientName}</p>
                    </div>
                    <StatusPill tone="mint">{record.status}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{record.diagnosis}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-soft)]">Aun no has creado expedientes.</p>
            )}
          </div>
          <form action={handleCreateClinicalRecord} className="mt-5 grid gap-3">
            <select
              name="patientId"
              defaultValue={myPatients[0]?.id ?? ""}
              className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
              required
            >
              <option value="">Selecciona paciente</option>
              {myPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            <input
              name="title"
              placeholder="Nombre del expediente o seguimiento"
              className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
              required
            />
            <textarea
              name="diagnosis"
              placeholder="Diagnostico actual"
              className="min-h-24 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 py-3 text-sm text-[var(--text)] outline-none"
              required
            />
            <textarea
              name="treatmentPlan"
              placeholder="Plan de tratamiento"
              className="min-h-24 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 py-3 text-sm text-[var(--text)] outline-none"
              required
            />
            <select
              name="status"
              defaultValue="active"
              className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
            >
              <option value="active">Activo</option>
              <option value="follow_up">Seguimiento</option>
              <option value="completed">Completado</option>
            </select>
            <PrimaryButton type="submit" icon="arrow" className="sm:w-fit">
              Crear expediente
            </PrimaryButton>
          </form>
        </Surface>

        <Surface>
          <StatusPill tone="violet">Perfil y servicios</StatusPill>
          <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Tu marca profesional</h3>
          <form action={handleProfileSubmit} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Nombre completo" name="fullName" defaultValue={account.profile.fullName} required />
              <TextInput label="Correo" name="email" type="email" defaultValue={account.email} required />
              <TextInput label="Telefono" name="phone" defaultValue={account.phone} required />
              <TextInput label="Semestre" name="semester" defaultValue={account.profile.semester} required />
            </div>

            <TextInput label="Universidad" name="university" defaultValue={account.profile.university} required />
            <TextareaField label="Bio" name="bio" defaultValue={account.profile.bio} required />

            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Reemplazar CV
              </span>
              <input
                name="cv"
                type="file"
                accept=".pdf,application/pdf"
                className="block min-h-12 rounded-2xl border border-dashed border-[rgba(124,76,194,0.25)] bg-white/80 px-4 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--violet-main)] file:px-3 file:py-2 file:font-bold file:text-white"
              />
            </label>

            {profileMessage.error ? (
              <div className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
                {profileMessage.error}
              </div>
            ) : null}
            {profileMessage.success ? (
              <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-[#177d6d]">
                {profileMessage.success}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <PrimaryButton type="submit" disabled={isPending} icon="arrow">
                {isPending ? "Guardando..." : "Guardar perfil"}
              </PrimaryButton>
              <PrimaryButton type="button" variant="ghost" disabled={deletingAccount} onClick={handleDeactivateAccount}>
                {deletingAccount ? "Desactivando..." : "Desactivar cuenta"}
              </PrimaryButton>
            </div>
          </form>

          <form action={handleCreateService} className="mt-6 grid gap-4 rounded-[1.6rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4">
            <p className="text-lg font-black text-[var(--text)]">Agregar servicio</p>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Titulo" name="title" placeholder="Limpieza dental profunda" required />
              <TextInput label="Categoria" name="category" placeholder="Preventivo" required />
              <TextInput label="Precio MXN" name="priceMxn" type="number" step="0.01" min="1" placeholder="350" required />
              <TextInput label="Duracion en minutos" name="durationMinutes" type="number" min="1" placeholder="55" required />
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

          <div className="mt-5 grid gap-4">
            {account.services.map((service) => (
              <form
                key={service.id}
                action={(formData) => handleUpdateService(service.id, formData)}
                className="rounded-[1.6rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-[var(--text)]">{service.title}</p>
                    <p className="text-sm text-[var(--text-soft)]">{service.category}</p>
                  </div>
                  <StatusPill tone={service.isActive ? "mint" : "muted"}>
                    {service.isActive ? "Activo" : "Oculto"}
                  </StatusPill>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput label="Titulo" name="title" defaultValue={service.title} required />
                    <TextInput label="Categoria" name="category" defaultValue={service.category} required />
                    <TextInput label="Precio MXN" name="priceMxn" type="number" step="0.01" min="1" defaultValue={String(service.priceMxn)} required />
                    <TextInput label="Duracion" name="durationMinutes" type="number" min="1" defaultValue={String(service.durationMinutes)} required />
                  </div>
                  <TextareaField label="Descripcion" name="description" defaultValue={service.description} required />
                  <label className="flex items-center gap-3 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 py-3 text-sm font-semibold text-[var(--text)]">
                    <input type="checkbox" name="isActive" defaultChecked={service.isActive} className="h-4 w-4 rounded" />
                    Mostrar este servicio en el catalogo publico
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <PrimaryButton type="submit" disabled={workingServiceId === service.id} icon="arrow">
                      {workingServiceId === service.id ? "Guardando..." : "Guardar servicio"}
                    </PrimaryButton>
                    <PrimaryButton type="button" variant="ghost" disabled={workingServiceId === service.id} onClick={() => handleDeleteService(service.id)}>
                      Eliminar
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            ))}
          </div>
          {serviceMessage.error ? (
            <div className="mt-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
              {serviceMessage.error}
            </div>
          ) : null}
          {serviceMessage.success ? (
            <div className="mt-4 rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-[#177d6d]">
              {serviceMessage.success}
            </div>
          ) : null}
        </Surface>

        <Surface>
          <StatusPill tone="mint">Galeria</StatusPill>
          <h3 className="mt-3 text-xl font-black text-[var(--text)]">Fotos del perfil</h3>
          <form action={handlePhotoUpload} className="mt-4 grid gap-4">
            <input
              name="photos"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="block min-h-12 rounded-2xl border border-dashed border-[rgba(105,73,150,0.16)] bg-white/80 px-4 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-[var(--text)]"
            />
            <PrimaryButton type="submit" variant="secondary" icon="arrow" className="sm:w-fit">
              Subir fotos
            </PrimaryButton>
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {account.photos.length > 0 ? (
              account.photos.map((photo) => (
                <div key={photo.id} className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-3">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-white/60">
                    <Image
                      src={photo.fileUrl}
                      alt="Foto del doctor"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                  <PrimaryButton type="button" variant="ghost" className="mt-3 w-full" onClick={() => handleDeletePhoto(photo.id)}>
                    Eliminar foto
                  </PrimaryButton>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[rgba(105,73,150,0.14)] bg-white/72 p-4 text-sm text-[var(--text-soft)] sm:col-span-2">
                Aun no has subido fotos. Puedes mantener un perfil limpio y sumar galeria despues.
              </div>
            )}
          </div>

          {photoMessage.error ? (
            <div className="mt-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
              {photoMessage.error}
            </div>
          ) : null}
          {photoMessage.success ? (
            <div className="mt-4 rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-[#177d6d]">
              {photoMessage.success}
            </div>
          ) : null}
        </Surface>
      </div>
    </div>
  );
}
