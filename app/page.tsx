import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getFeaturedDoctors, getPublicStats, searchPublicServices } from "@/lib/data";
import { PublicHeader } from "@/components/site/PublicHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import { buttonClasses } from "@/components/ui/PrimaryButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [currentUser, stats, featuredDoctors, featuredServices] = await Promise.all([
    getSessionUser(),
    getPublicStats(),
    getFeaturedDoctors(3),
    searchPublicServices()
  ]);

  return (
    <>
      <PublicHeader currentUser={currentUser} />
      <ScreenShell
        eyebrow="L&A Dental"
        title="MySQL local, auth real y un catalogo listo para crecer."
        description="Pacientes registran su perfil clinico, estudiantes de odontologia publican CV, fotos y servicios, y cada rol entra a su propio dashboard."
      >
        <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <Surface className="relative overflow-hidden p-5 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(168,85,247,0.18),transparent)]" />
            <StatusPill tone="violet">App Router + MySQL local</StatusPill>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
              Registra pacientes y doctores con un flujo real, no con mocks.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              El rol doctor representa al estudiante de odontologia dentro de L&A. Cada cuenta
              maneja su propia sesion, perfil, servicios y visibilidad publica.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/registro" className={buttonClasses("primary")}>
                Crear cuenta
              </Link>
              <Link href="/resultados" className={buttonClasses("secondary")}>
                Explorar servicios
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Doctores activos
                </p>
                <p className="mt-3 text-3xl font-black text-white">{stats.activeDoctors}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Servicios activos
                </p>
                <p className="mt-3 text-3xl font-black text-white">{stats.activeServices}</p>
              </div>
            </div>
          </Surface>

          <div className="grid gap-5">
            <Surface>
              <StatusPill tone="mint">Flujo por rol</StatusPill>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-black text-white">Paciente</p>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Registra datos basicos y clinicos para buscar servicios y administrar su cuenta.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-black text-white">Doctor</p>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Sube CV en PDF, fotos opcionales y un servicio inicial para quedar visible en el catalogo.
                  </p>
                </div>
              </div>
            </Surface>

            <Surface>
              <StatusPill tone="violet">Atajo rapido</StatusPill>
              <h3 className="mt-4 text-2xl font-black text-white">Busca por tratamiento</h3>
              <form action="/resultados" className="mt-5 grid gap-3">
                <input
                  name="q"
                  defaultValue="Limpieza"
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-medium text-white outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white text-sm font-bold text-ink transition hover:bg-violet-100"
                >
                  Ver resultados
                </button>
              </form>
            </Surface>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="mint">Doctores destacados</StatusPill>
                <h3 className="mt-3 text-2xl font-black text-white">Perfiles publicados</h3>
              </div>
              <Link href="/buscar" className="text-sm font-bold text-violet-100">
                Ver catalogo
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {featuredDoctors.length > 0 ? (
                featuredDoctors.map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/doctores/${doctor.slug}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-200/25"
                  >
                    <p className="font-black text-white">{doctor.fullName}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {doctor.semester} · {doctor.university}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/58">{doctor.bio}</p>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                  Aun no hay doctores activos. El primer registro doctor aparecera aqui.
                </p>
              )}
            </div>
          </Surface>

          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="violet">Servicios recientes</StatusPill>
                <h3 className="mt-3 text-2xl font-black text-white">Tratamientos visibles</h3>
              </div>
              <Link href="/resultados" className="text-sm font-bold text-violet-100">
                Ver todos
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {featuredServices.slice(0, 4).length > 0 ? (
                featuredServices.slice(0, 4).map((service) => (
                  <Link
                    key={service.id}
                    href={`/doctores/${service.doctorSlug}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-mint/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{service.title}</p>
                        <p className="mt-1 text-sm text-white/55">{service.doctorName}</p>
                      </div>
                      <StatusPill tone="mint">${service.priceMxn.toFixed(2)} MXN</StatusPill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/58">{service.description}</p>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                  Los servicios aparecera aqui en cuanto un doctor publique el primero.
                </p>
              )}
            </div>
          </Surface>
        </div>
      </ScreenShell>
    </>
  );
}
