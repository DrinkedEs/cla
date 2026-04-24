import { clinicalHistory } from "@/data/mock";
import type { ScreenKey } from "@/components/navigation/types";
import { AppIcon } from "@/components/icons/AppIcon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";

type ScreenProps = {
  onNavigate: (screen: ScreenKey) => void;
};

export function ClinicalHistoryScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="Historial clinico"
      title="Expediente del paciente"
      description="Registro mock con valoraciones, notas de seguimiento y pendientes para preparar la conexion a backend."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-3">
          {clinicalHistory.map((record) => (
            <Surface key={record.id} as="article">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
                  <AppIcon name="chart" className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-white">{record.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-white/40">
                        {record.date}
                      </p>
                    </div>
                    <StatusPill
                      tone={record.status === "Completado" ? "mint" : "violet"}
                    >
                      {record.status}
                    </StatusPill>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/58">
                    {record.notes}
                  </p>
                </div>
              </div>
            </Surface>
          ))}
        </div>

        <Surface className="h-fit">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <StatusPill tone="rose">Alerta medica</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">
                Datos importantes
              </h3>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose/10 text-rose">
              <AppIcon name="shield" className="h-6 w-6" />
            </div>
          </div>
          <div className="grid gap-3">
            {[
              ["Alergias", "Niega alergias conocidas"],
              ["Medicacion", "Ninguna registrada"],
              ["Contacto", "+52 55 1234 9087"]
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-xs font-bold uppercase text-white/35">
                  {label}
                </p>
                <p className="mt-2 font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
          <PrimaryButton
            onClick={() => onNavigate("booking")}
            icon="calendar"
            className="mt-5 w-full"
          >
            Agendar seguimiento
          </PrimaryButton>
        </Surface>
      </div>
    </ScreenShell>
  );
}
