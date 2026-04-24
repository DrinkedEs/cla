import { creator, quickStats, student } from "@/data/mock";
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

export function HomeScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="L&A Dental"
      title="Agenda dental simple, elegante y conectada."
      description="Pacientes encuentran tratamientos accesibles y estudiantes de odontologia gestionan citas, links, QR e historial clinico desde una sola app."
      action={<Avatar name="L&A" size="sm" tone="violet" />}
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Surface className="relative overflow-hidden p-5 sm:p-7">
          <div className="absolute right-5 top-5 rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-xs font-bold text-violet-100">
            Proyecto L&A
          </div>
          <div className="mb-8 grid h-16 w-16 place-items-center rounded-[1.4rem] bg-violet-electric text-white shadow-aura">
            <AppIcon name="tooth" className="h-9 w-9" />
          </div>
          <h2 className="max-w-sm text-2xl font-black leading-tight text-white sm:text-4xl">
            Citas por link o QR para que el paciente agende en segundos.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/62">
            El estudiante comparte disponibilidad, el paciente confirma datos y
            el historial queda listo para seguimiento clinico.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={() => onNavigate("search")} icon="arrow">
              Buscar tratamiento
            </PrimaryButton>
            <PrimaryButton
              onClick={() => onNavigate("booking")}
              icon="qr"
              variant="secondary"
            >
              Ver link de cita
            </PrimaryButton>
          </div>
        </Surface>

        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-4">
              <Avatar name={student.name} size="lg" />
              <div className="min-w-0">
                <StatusPill tone="mint">Disponible hoy</StatusPill>
                <h3 className="mt-3 text-xl font-black text-white">
                  {student.name}
                </h3>
                <p className="text-sm text-white/55">{student.role}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <p className="text-lg font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-[0.68rem] font-semibold text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint/10 text-mint">
                <AppIcon name="shield" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Flujo supervisado</p>
                <p className="text-xs text-white/50">
                  Validacion academica antes de tratamientos sensibles.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
                <AppIcon name="chart" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{creator.name}</p>
                <p className="text-xs text-white/50">
                  {creator.role} del {creator.project}.
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </ScreenShell>
  );
}
