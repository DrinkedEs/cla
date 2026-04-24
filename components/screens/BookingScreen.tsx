import { student } from "@/data/mock";
import type { ScreenKey } from "@/components/navigation/types";
import { AppIcon } from "@/components/icons/AppIcon";
import { Avatar } from "@/components/ui/Avatar";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";

type ScreenProps = {
  onNavigate: (screen: ScreenKey) => void;
};

const days = ["Hoy", "Jue", "Vie", "Sab"];
const hours = ["10:00", "12:15", "16:30", "18:00"];

export function BookingScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="Agendar cita"
      title="Confirma tu horario"
      description="Mock del flujo que recibira el paciente al abrir el link o escanear el QR enviado por el doctor o estudiante."
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Surface className="grid gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="md" />
            <div>
              <p className="font-black text-white">Limpieza dental profunda</p>
              <p className="text-sm text-white/50">Con {student.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {days.map((day, index) => (
              <button
                key={day}
                type="button"
                className={`rounded-2xl border p-3 text-center text-sm font-black ${
                  index === 0
                    ? "border-violet-200/30 bg-violet-300/16 text-white"
                    : "border-white/10 bg-black/20 text-white/55"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {hours.map((hour, index) => (
              <button
                key={hour}
                type="button"
                className={`flex min-h-14 items-center justify-center rounded-2xl border text-sm font-black ${
                  index === 2
                    ? "border-mint/30 bg-mint/10 text-mint"
                    : "border-white/10 bg-black/20 text-white/60"
                }`}
              >
                {hour}
              </button>
            ))}
          </div>
          <PrimaryButton onClick={() => onNavigate("agenda")} icon="calendar">
            Confirmar cita
          </PrimaryButton>
        </Surface>

        <div className="grid gap-4">
          <Surface>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <StatusPill tone="violet">Link del paciente</StatusPill>
                <h3 className="mt-3 text-xl font-black text-white">
                  la.app/cita/linda-430
                </h3>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
                <AppIcon name="link" className="h-6 w-6" />
              </div>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-4">
              <div className="grid aspect-square place-items-center rounded-2xl border border-white/10 bg-white p-3 text-ink">
                <div className="grid h-full w-full grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={`rounded-[0.18rem] ${
                        [0, 1, 2, 5, 10, 12, 14, 18, 20, 22, 24].includes(index)
                          ? "bg-ink"
                          : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-6 text-white/62">
                  El paciente escanea, selecciona horario, confirma sus datos y
                  completa el historial clinico inicial.
                </p>
                <div className="mt-4 flex gap-2">
                  <PrimaryButton icon="qr" variant="secondary" className="px-3">
                    QR
                  </PrimaryButton>
                  <PrimaryButton icon="send" variant="ghost" className="px-3">
                    Enviar
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Surface>

          <Surface>
            <h3 className="text-lg font-black text-white">Datos previos</h3>
            <div className="mt-4 grid gap-3">
              {["Nombre del paciente", "Telefono", "Alergias", "Motivo de consulta"].map(
                (field) => (
                  <div
                    key={field}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/42"
                  >
                    {field}
                  </div>
                )
              )}
            </div>
          </Surface>
        </div>
      </div>
    </ScreenShell>
  );
}
