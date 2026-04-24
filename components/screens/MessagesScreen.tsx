import { messages } from "@/data/mock";
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

export function MessagesScreen({ onNavigate }: ScreenProps) {
  return (
    <ScreenShell
      eyebrow="Mensajes"
      title="Conversaciones"
      description="Chat mock para coordinar cita, enviar link y pedir datos clinicos al paciente."
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3">
          {messages.map((message) => (
            <Surface
              key={message.id}
              as="button"
              className="w-full text-left transition hover:border-violet-200/30"
            >
              <div className="flex gap-3">
                <Avatar
                  name={message.from}
                  size="sm"
                  tone={message.unread ? "violet" : "mint"}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-black text-white">
                      {message.from}
                    </h3>
                    <span className="text-xs font-bold text-white/35">
                      {message.time}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/52">
                    {message.preview}
                  </p>
                </div>
                {message.unread ? (
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-electric" />
                ) : null}
              </div>
            </Surface>
          ))}
        </div>

        <Surface className="flex min-h-[32rem] flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Avatar name="Linda Martinez" size="sm" />
              <div>
                <p className="font-black text-white">Linda Martinez</p>
                <p className="text-xs text-mint">En linea</p>
              </div>
            </div>
            <StatusPill tone="violet">Cita</StatusPill>
          </div>
          <div className="flex flex-1 flex-col gap-3 py-5">
            <div className="max-w-[82%] rounded-[1.25rem] rounded-tl-sm bg-white/[0.07] p-4 text-sm leading-6 text-white/70">
              Hola, soy Linda de L&A. Te mando el link para confirmar tu cita y
              completar tu historial clinico.
            </div>
            <div className="ml-auto max-w-[82%] rounded-[1.25rem] rounded-tr-sm bg-violet-electric p-4 text-sm leading-6 text-white">
              Perfecto, quiero agendar limpieza dental hoy por la tarde.
            </div>
            <button
              type="button"
              onClick={() => onNavigate("booking")}
              className="mr-auto flex items-center gap-3 rounded-2xl border border-violet-200/20 bg-violet-200/10 p-3 text-left"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-electric text-white">
                <AppIcon name="link" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Abrir link L&A</p>
                <p className="text-xs text-white/45">la.app/cita/linda-430</p>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 p-2">
            <input
              className="min-h-11 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Escribe un mensaje..."
            />
            <PrimaryButton icon="send" className="min-h-11 px-3">
              Enviar
            </PrimaryButton>
          </div>
        </Surface>
      </div>
    </ScreenShell>
  );
}
