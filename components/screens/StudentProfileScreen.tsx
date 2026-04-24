import { student, treatments } from "@/data/mock";
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

export function StudentProfileScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell eyebrow="Perfil del estudiante" title={student.name}>
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Surface className="h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar name={student.name} size="lg" />
            <StatusPill tone="mint">Agenda abierta</StatusPill>
            <h2 className="mt-4 text-2xl font-black text-white">{student.name}</h2>
            <p className="text-sm text-white/55">{student.role}</p>
            <p className="mt-1 text-xs font-semibold text-white/35">
              {student.semester} · {student.university}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
              <p className="text-2xl font-black text-white">{student.rating}</p>
              <p className="text-xs text-white/42">Rating</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
              <p className="text-2xl font-black text-white">
                {student.completedTreatments}
              </p>
              <p className="text-xs text-white/42">Tratamientos</p>
            </div>
          </div>
          <PrimaryButton
            onClick={() => onNavigate("booking")}
            icon="calendar"
            className="mt-5 w-full"
          >
            Agendar cita
          </PrimaryButton>
        </Surface>

        <div className="grid gap-4">
          <Surface>
            <h3 className="text-lg font-black text-white">Sobre Linda</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">{student.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {student.specialties.map((specialty) => (
                <StatusPill key={specialty} tone="violet">
                  {specialty}
                </StatusPill>
              ))}
            </div>
          </Surface>

          <Surface>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Tratamientos</h3>
              <AppIcon name="tooth" className="h-5 w-5 text-violet-100" />
            </div>
            <div className="grid gap-3">
              {treatments.slice(0, 3).map((treatment) => (
                <button
                  key={treatment.id}
                  type="button"
                  onClick={() => onNavigate("booking")}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-violet-200/25"
                >
                  <div>
                    <p className="font-bold text-white">{treatment.title}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {treatment.duration} · {treatment.availability}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-mint">
                    {treatment.price}
                  </p>
                </button>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </ScreenShell>
  );
}
