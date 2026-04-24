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

export function ResultsScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="Resultados"
      title="4 opciones disponibles"
      description="Coincidencias para limpieza dental con estudiantes supervisados y horarios abiertos esta semana."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-3">
          {treatments.map((treatment, index) => (
            <Surface
              key={treatment.id}
              as="button"
              onClick={() => onNavigate("student")}
              className="w-full text-left transition hover:border-violet-200/30 hover:bg-white/[0.075]"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
                  <AppIcon name={index % 2 ? "star" : "tooth"} className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-white">{treatment.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-white/45">
                        {treatment.category} · {treatment.duration}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-mint">
                      {treatment.price}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <StatusPill tone="violet">{treatment.availability}</StatusPill>
                    <StatusPill tone="muted">{treatment.rating} rating</StatusPill>
                  </div>
                </div>
              </div>
            </Surface>
          ))}
        </div>

        <Surface className="h-fit">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="lg" />
            <div>
              <StatusPill tone="mint">Mejor match</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">
                {student.name}
              </h3>
              <p className="text-sm text-white/50">{student.semester}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-white/62">{student.bio}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-black/20 p-3">
              <p className="text-2xl font-black text-white">{student.rating}</p>
              <p className="text-xs text-white/45">Rating paciente</p>
            </div>
            <div className="rounded-2xl bg-black/20 p-3">
              <p className="text-2xl font-black text-white">
                {student.completedTreatments}
              </p>
              <p className="text-xs text-white/45">Casos atendidos</p>
            </div>
          </div>
          <PrimaryButton
            onClick={() => onNavigate("student")}
            icon="arrow"
            className="mt-5 w-full"
          >
            Ver perfil
          </PrimaryButton>
        </Surface>
      </div>
    </ScreenShell>
  );
}
