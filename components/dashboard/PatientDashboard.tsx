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
  const [appointments, setAppointments] = useState(initialData.appointments);
  const [conversations, setConversations] = useState(initialData.conversations);
  const [messages, setMessages] = useState(initialData.messages);
  const [clinicalRecords, setClinicalRecords] = useState(initialData.clinicalRecords);
  const [clinicalEntries] = useState(initialData.clinicalEntries);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    startTransition(() => router.refresh());
  }

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
      await refresh();
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

  async function handleCreateAppointment(formData: FormData) {
    setError(null);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctorId: Number(formData.get("doctorId")),
        treatmentTitle: String(formData.get("treatmentTitle") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        scheduledFor: String(formData.get("scheduledFor") ?? "")
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; appointments?: PatientDashboardData["appointments"] }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "No pudimos crear tu cita.");
      return;
    }

    setAppointments(payload?.appointments ?? []);
    setSuccess("Tu cita se agrego a la agenda.");
    await refresh();
  }

  async function handleSendMessage() {
    if (!conversations[0] || !messageBody.trim()) {
      return;
    }

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversationId: conversations[0].conversationId,
        body: messageBody
      })
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          conversations?: PatientDashboardData["conversations"];
          messages?: PatientDashboardData["messages"];
        }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "No pudimos enviar el mensaje.");
      return;
    }

    setConversations(payload?.conversations ?? conversations);
    setMessages(payload?.messages ?? messages);
    setMessageBody("");
    await refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.16fr_0.84fr] lg:px-8">
      <div className="grid gap-5">
        <Surface className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(160,112,231,0.2),transparent)]" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <StatusPill tone="mint">Paciente activo</StatusPill>
              <h2 className="mt-4 text-3xl font-black text-[var(--text)]">
                {account.profile.fullName}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                Tu panel ahora vive como un feed: ves publicaciones, agenda, mensajes y resumen
                clinico sin salir de la misma pantalla.
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
              <StatusPill tone="violet">Feed para ti</StatusPill>
              <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Novedades y recomendaciones</h3>
            </div>
            <Link href="/buscar" className="text-sm font-bold text-[var(--violet-main)]">
              Explorar doctores
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {initialData.feed.map((post) => (
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
                      <StatusPill tone={post.visibility === "public" ? "violet" : "mint"}>
                        {post.topic}
                      </StatusPill>
                      {post.featured ? <StatusPill tone="rose">Destacado</StatusPill> : null}
                    </div>
                    <h4 className="mt-3 text-xl font-black text-[var(--text)]">{post.headline}</h4>
                    <p className="mt-1 text-sm text-[var(--text-soft)]">
                      {post.doctorName} · {post.doctorSemester}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{post.body}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-soft)]">
                      <span>{post.reactionCount} reacciones</span>
                      <span>{new Date(post.createdAt).toLocaleDateString("es-MX")}</span>
                    </div>
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
                <StatusPill tone="mint">Agenda</StatusPill>
                <h3 className="mt-3 text-xl font-black text-[var(--text)]">Tu proxima cita</h3>
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
                        <p className="font-black text-[var(--text)]">{appointment.treatmentTitle}</p>
                        <p className="text-sm text-[var(--text-soft)]">
                          {appointment.doctorName} ·{" "}
                          {new Date(appointment.scheduledFor).toLocaleString("es-MX")}
                        </p>
                      </div>
                      <StatusPill tone="violet">{appointment.status}</StatusPill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                      {appointment.notes}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.4rem] border border-dashed border-[rgba(105,73,150,0.14)] bg-white/72 p-4 text-sm text-[var(--text-soft)]">
                  Aun no tienes citas. Agenda una desde el formulario de abajo.
                </p>
              )}
            </div>

            <form action={handleCreateAppointment} className="mt-5 grid gap-3">
              <select
                name="doctorId"
                defaultValue={initialData.featuredDoctors[0]?.id ?? ""}
                className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
                required
              >
                <option value="">Selecciona doctor</option>
                {initialData.featuredDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
              <input
                name="treatmentTitle"
                placeholder="Tratamiento que quieres agendar"
                className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
                required
              />
              <input
                name="scheduledFor"
                type="datetime-local"
                className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
                required
              />
              <textarea
                name="notes"
                placeholder="Comparte sintomas, disponibilidad o una nota para el doctor"
                className="min-h-28 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 py-3 text-sm text-[var(--text)] outline-none"
                required
              />
              <PrimaryButton type="submit" icon="calendar" className="sm:w-fit">
                Agendar cita
              </PrimaryButton>
            </form>
          </Surface>

          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="violet">Mensajes</StatusPill>
                <h3 className="mt-3 text-xl font-black text-[var(--text)]">Conversacion activa</h3>
              </div>
              <span className="text-sm text-[var(--text-soft)]">{conversations.length} chats</span>
            </div>
            <div className="mt-4 grid gap-3">
              {messages.length > 0 ? (
                messages.slice(-5).map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-[1.3rem] px-4 py-3 text-sm leading-6 ${message.isOwn ? "ml-auto bg-[rgba(124,76,194,0.12)] text-[var(--violet-deep)]" : "mr-auto bg-white/75 text-[var(--text-soft)]"}`}
                  >
                    <p className="font-bold">{message.senderName}</p>
                    <p>{message.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-soft)]">
                  Tus mensajes apareceran aqui al abrir una conversacion.
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Escribe a tu doctor..."
                className="min-h-12 flex-1 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm text-[var(--text)] outline-none"
              />
              <PrimaryButton onClick={handleSendMessage} icon="send">
                Enviar
              </PrimaryButton>
            </div>
          </Surface>
        </div>
      </div>

      <div className="grid gap-5">
        <Surface>
          <StatusPill tone="rose">Historial clinico</StatusPill>
          <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Resumen de tu seguimiento</h3>
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
                      <p className="text-sm text-[var(--text-soft)]">{record.doctorName}</p>
                    </div>
                    <StatusPill tone="mint">{record.status}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                    {record.diagnosis}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-soft)]">
                Aun no tienes expedientes clinicos registrados.
              </p>
            )}
          </div>

          {clinicalEntries.length > 0 ? (
            <div className="mt-5 rounded-[1.4rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4">
              <p className="text-sm font-bold text-[var(--text)]">Ultima nota clinica</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                {clinicalEntries[0].note}
              </p>
            </div>
          ) : null}
        </Surface>

        <Surface>
          <StatusPill tone="violet">Perfil</StatusPill>
          <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Ajusta tus datos personales</h3>
          <form action={handleProfileSubmit} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Nombre completo" name="fullName" defaultValue={account.profile.fullName} required />
              <TextInput label="Correo" name="email" type="email" defaultValue={account.email} required />
              <TextInput label="Telefono" name="phone" defaultValue={account.phone} required />
              <TextInput label="Fecha de nacimiento" name="birthDate" type="date" defaultValue={account.profile.birthDate} required />
            </div>
            <SelectField label="Sexo" name="sex" options={sexOptions} defaultValue={account.profile.sex} />
            <TextareaField label="Alergias" name="allergies" defaultValue={account.profile.allergies} required />
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
              <div className="rounded-2xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm text-[#177d6d]">
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
    </div>
  );
}
