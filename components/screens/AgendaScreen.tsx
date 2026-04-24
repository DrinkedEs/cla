import { appointments } from "@/data/mock";
import type { ScreenKey } from "@/components/navigation/types";
import { AppIcon } from "@/components/icons/AppIcon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";

type ScreenProps = {
  onNavigate: (screen: ScreenKey) => void;
};

function statusTone(status: string): StatusTone {
  if (status === "Confirmada") return "mint";
  if (status === "Pendiente") return "violet";
  return "rose";
}

export function AgendaScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="Mi agenda"
      title="Citas y pacientes"
      description="Vista para que Linda o el doctor revisen horarios, estados y proximos pasos clinicos."
      action={
        <button
          type="button"
          onClick={() => onNavigate("booking")}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-electric text-white shadow-aura"
          aria-label="Crear cita"
        >
          <AppIcon name="calendar" className="h-5 w-5" />
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3">
          {appointments.map((appointment) => (
            <Surface key={appointment.id} as="article">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-white/35">
                    {appointment.date} · {appointment.time}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-white">
                    {appointment.patient}
                  </h3>
                  <p className="mt-1 text-sm text-white/55">
                    {appointment.treatment}
                  </p>
                </div>
                <StatusPill tone={statusTone(appointment.status)}>
                  {appointment.status}
                </StatusPill>
              </div>
              <div className="mt-4 flex gap-2">
                <PrimaryButton
                  variant="ghost"
                  icon="message"
                  className="min-h-10 flex-1 px-3"
                  onClick={() => onNavigate("messages")}
                >
                  Chat
                </PrimaryButton>
                <PrimaryButton
                  variant="secondary"
                  icon="chart"
                  className="min-h-10 flex-1 px-3"
                  onClick={() => onNavigate("history")}
                >
                  Historial
                </PrimaryButton>
              </div>
            </Surface>
          ))}
        </div>

        <Surface className="h-fit">
          <div className="flex items-center justify-between">
            <div>
              <StatusPill tone="mint">Hoy</StatusPill>
              <h3 className="mt-3 text-2xl font-black text-white">
                4:30 PM
              </h3>
              <p className="text-sm text-white/50">Mariana Ruiz · Limpieza</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-[1.25rem] bg-mint/10 text-mint">
              <AppIcon name="clock" className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {["Confirmar asistencia", "Revisar alergias", "Preparar hoja clinica"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      index === 0 ? "bg-mint" : "bg-violet-electric"
                    }`}
                  />
                  <p className="text-sm font-semibold text-white/70">{item}</p>
                </div>
              )
            )}
          </div>
        </Surface>
      </div>
    </ScreenShell>
  );
}
