import { treatments } from "@/data/mock";
import type { ScreenKey } from "@/components/navigation/types";
import { AppIcon } from "@/components/icons/AppIcon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";

type ScreenProps = {
  onNavigate: (screen: ScreenKey) => void;
};

const filters = ["Limpieza", "Resinas", "Urgencia", "Estetica", "Revision"];

export function SearchScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="Buscar tratamientos"
      title="Encuentra una cita cerca de ti."
      description="Filtra por tratamiento, horario y estudiante disponible. La data es mock por ahora, lista para conectar backend despues."
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Surface className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-white/42">
              Tratamiento
            </span>
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4">
              <AppIcon name="search" className="h-5 w-5 text-violet-100" />
              <input
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
                placeholder="Limpieza, resina, valoracion..."
                defaultValue="Limpieza dental"
              />
            </div>
          </label>
          <div className="grid gap-2">
            <span className="text-xs font-bold uppercase text-white/42">
              Preferencias
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-2xl border border-violet-200/25 bg-violet-200/10 px-4 py-3 text-left text-sm font-bold text-violet-50">
                Hoy
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm font-bold text-white/70">
                Esta semana
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm font-bold text-white/70">
                Cerca de mi
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm font-bold text-white/70">
                Supervisado
              </button>
            </div>
          </div>
          <PrimaryButton onClick={() => onNavigate("results")} icon="arrow">
            Ver resultados
          </PrimaryButton>
        </Surface>

        <div className="grid gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {filters.map((filter) => (
              <StatusPill key={filter} tone={filter === "Limpieza" ? "violet" : "muted"}>
                {filter}
              </StatusPill>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {treatments.slice(0, 4).map((treatment) => (
              <Surface key={treatment.id} as="article" className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
                    <AppIcon name="tooth" className="h-6 w-6" />
                  </div>
                  <StatusPill tone="mint">{treatment.price}</StatusPill>
                </div>
                <h3 className="text-base font-black text-white">
                  {treatment.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-white/42">
                  {treatment.category} · {treatment.duration}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("results")}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-100"
                >
                  Revisar opciones
                  <AppIcon name="arrow" className="h-4 w-4" />
                </button>
              </Surface>
            ))}
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
