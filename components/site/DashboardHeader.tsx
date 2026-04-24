import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import type { SessionUser } from "@/lib/types";

type DashboardHeaderProps = {
  user: SessionUser;
  title: string;
  subtitle: string;
};

export function DashboardHeader({
  user,
  title,
  subtitle
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <Avatar name={user.email} size="md" tone={user.role === "doctor" ? "violet" : "mint"} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={user.role === "doctor" ? "violet" : "mint"}>
                {user.role === "doctor" ? "Panel del doctor" : "Panel del paciente"}
              </StatusPill>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                {user.email}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-white/58">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          >
            Inicio publico
          </Link>
          <Link
            href="/buscar"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          >
            Explorar servicios
          </Link>
          <LogoutButton variant="secondary" />
        </div>
      </div>
    </header>
  );
}
