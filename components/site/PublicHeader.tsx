import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/PrimaryButton";
import type { SessionUser } from "@/lib/types";

type PublicHeaderProps = {
  currentUser: SessionUser | null;
};

export function PublicHeader({ currentUser }: PublicHeaderProps) {
  const dashboardHref =
    currentUser?.role === "doctor" ? "/doctor" : currentUser ? "/paciente" : null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Avatar name="L&A" size="sm" tone="violet" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100">
              L&A Dental
            </p>
            <p className="text-sm text-white/55">Pacientes y estudiantes conectados</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 text-sm font-semibold text-white/60 md:flex">
          <Link href="/" className="transition hover:text-white">
            Inicio
          </Link>
          <Link href="/buscar" className="transition hover:text-white">
            Buscar
          </Link>
          <Link href="/resultados" className="transition hover:text-white">
            Servicios
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {dashboardHref ? (
            <Link href={dashboardHref} className={buttonClasses("secondary")}>
              Mi panel
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonClasses("ghost")}>
                Iniciar sesion
              </Link>
              <Link href="/registro" className={buttonClasses("primary")}>
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
