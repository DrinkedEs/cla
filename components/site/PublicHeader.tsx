import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { buttonClasses } from "@/components/ui/PrimaryButton";
import type { SessionUser } from "@/lib/types";

type PublicHeaderProps = {
  currentUser: SessionUser | null;
};

export function PublicHeader({ currentUser }: PublicHeaderProps) {
  const dashboardHref =
    currentUser?.role === "doctor" ? "/doctor" : currentUser ? "/paciente" : null;

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(105,73,150,0.08)] bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--violet-main)]">
              L&A Dental
            </p>
            <p className="text-sm text-[var(--text-soft)]">
              Feed clinico, agenda y cuidado dental mas humano
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-semibold text-[var(--text-soft)] md:flex">
          <Link href="/" className="transition hover:text-[var(--text)]">
            Inicio
          </Link>
          <Link href="/buscar" className="transition hover:text-[var(--text)]">
            Buscar
          </Link>
          <Link href="/resultados" className="transition hover:text-[var(--text)]">
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
