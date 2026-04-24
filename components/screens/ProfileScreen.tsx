import { creator, student } from "@/data/mock";
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

export function ProfileScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell eyebrow="Mi perfil" title="Cuenta L&A">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Surface>
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="lg" />
            <div className="min-w-0">
              <StatusPill tone="mint">Estudiante verificada</StatusPill>
              <h2 className="mt-3 text-2xl font-black text-white">
                {student.name}
              </h2>
              <p className="text-sm text-white/50">{student.role}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              ["Universidad", student.university],
              ["Semestre", student.semester],
              ["Modalidad", "Citas por link, QR y agenda interna"]
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
        </Surface>

        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
                <AppIcon name="qr" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Link publico de agenda
                </h3>
                <p className="text-sm text-white/50">la.app/linda-martinez</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <PrimaryButton
                onClick={() => onNavigate("booking")}
                icon="link"
                variant="secondary"
              >
                Copiar link
              </PrimaryButton>
              <PrimaryButton
                onClick={() => onNavigate("booking")}
                icon="qr"
                variant="ghost"
              >
                Ver QR
              </PrimaryButton>
            </div>
          </Surface>

          <Surface>
            <h3 className="text-lg font-black text-white">Proyecto</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              {creator.project} fue creado para conectar estudiantes de
              odontologia con pacientes y facilitar citas, mensajes e historial
              clinico.
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase text-white/35">
                Desarrollo
              </p>
              <p className="mt-2 font-black text-white">{creator.name}</p>
              <p className="text-sm text-white/50">{creator.role}</p>
            </div>
          </Surface>
        </div>
      </div>
    </ScreenShell>
  );
}
