import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import { buttonClasses } from "@/components/ui/PrimaryButton";
import { getSessionUser } from "@/lib/auth";
import {
  getFeaturedDoctors,
  getPublicFeed,
  getPublicStats,
  searchPublicServices
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [currentUser, stats, featuredDoctors, featuredServices, publicFeed] = await Promise.all([
    getSessionUser(),
    getPublicStats(),
    getFeaturedDoctors(4),
    searchPublicServices(),
    getPublicFeed(6)
  ]);

  return (
    <>
      <PublicHeader currentUser={currentUser} />
      <ScreenShell
        eyebrow="L&A Dental"
        title="Una experiencia dental mas humana, viva y profesional."
        description="Pacientes y doctores conviven en una app con feed clinico, agenda, mensajes e historial real, con una identidad visual mas suave y calmada para los ojos."
        action={<BrandLogo size="lg" animated />}
      >
        <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <Surface className="relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(160,112,231,0.18),transparent)]" />
            <StatusPill tone="violet">Feed + agenda + mensajes + historial</StatusPill>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-[var(--text)] sm:text-5xl">
              El cuidado dental ya no se siente como un formulario frio.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
              El doctor comparte avances y espacios de agenda; el paciente agenda, escribe y sigue su
              historial desde una sola experiencia visual.
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
              <div className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Doctores activos
                </p>
                <p className="mt-3 text-3xl font-black text-[var(--violet-deep)]">{stats.activeDoctors}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Servicios activos
                </p>
                <p className="mt-3 text-3xl font-black text-[var(--violet-deep)]">{stats.activeServices}</p>
              </div>
            </div>
          </Surface>

          <div className="grid gap-5">
            <Surface>
              <StatusPill tone="mint">Flujo por rol</StatusPill>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4">
                  <p className="font-black text-[var(--text)]">Paciente</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                    Ve publicaciones, agenda citas, conversa y sigue notas clinicas.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4">
                  <p className="font-black text-[var(--text)]">Doctor</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                    Publica en su feed, administra agenda, responde mensajes y documenta seguimiento.
                  </p>
                </div>
              </div>
            </Surface>

            <Surface>
              <StatusPill tone="violet">Atajo rapido</StatusPill>
              <h3 className="mt-4 text-2xl font-black text-[var(--text)]">Busca por tratamiento</h3>
              <form action="/resultados" className="mt-5 grid gap-3">
                <input
                  name="q"
                  defaultValue="Limpieza"
                  className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm font-medium text-[var(--text)] outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--violet-main)] text-sm font-bold text-white transition hover:brightness-105"
                >
                  Ver resultados
                </button>
              </form>
            </Surface>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="violet">Feed publico</StatusPill>
                <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Novedades clinicas</h3>
              </div>
              <Link href="/buscar" className="text-sm font-bold text-[var(--violet-main)]">
                Ver catalogo
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {publicFeed.length > 0 ? (
                publicFeed.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone="violet">{post.topic}</StatusPill>
                      {post.featured ? <StatusPill tone="rose">Destacado</StatusPill> : null}
                    </div>
                    <h4 className="mt-3 text-lg font-black text-[var(--text)]">{post.headline}</h4>
                    <p className="mt-1 text-sm text-[var(--text-soft)]">
                      {post.doctorName} · {post.doctorSemester}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{post.body}</p>
                  </article>
                ))
              ) : (
                <p className="rounded-[1.5rem] border border-dashed border-[rgba(105,73,150,0.14)] bg-white/72 p-4 text-sm text-[var(--text-soft)]">
                  Aun no hay publicaciones activas. El primer doctor que publique aparecera aqui.
                </p>
              )}
            </div>
          </Surface>

          <div className="grid gap-5">
            <Surface>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <StatusPill tone="mint">Doctores destacados</StatusPill>
                  <h3 className="mt-3 text-2xl font-black text-[var(--text)]">Perfiles visibles</h3>
                </div>
                <Link href="/buscar" className="text-sm font-bold text-[var(--violet-main)]">
                  Ver todos
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                {featuredDoctors.map((doctor) => (
                  <Link
                    key={doctor.id}
                    href={`/doctores/${doctor.slug}`}
                    className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4 transition hover:border-[rgba(124,76,194,0.2)]"
                  >
                    <p className="font-black text-[var(--text)]">{doctor.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--text-soft)]">
                      {doctor.semester} · {doctor.university}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{doctor.bio}</p>
                  </Link>
                ))}
              </div>
            </Surface>

            <Surface>
              <StatusPill tone="violet">Tratamientos recientes</StatusPill>
              <div className="mt-4 grid gap-3">
                {featuredServices.slice(0, 4).map((service) => (
                  <Link
                    key={service.id}
                    href={`/doctores/${service.doctorSlug}`}
                    className="rounded-[1.5rem] border border-[rgba(105,73,150,0.08)] bg-white/72 p-4 transition hover:border-[rgba(124,76,194,0.2)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-[var(--text)]">{service.title}</p>
                        <p className="mt-1 text-sm text-[var(--text-soft)]">{service.doctorName}</p>
                      </div>
                      <StatusPill tone="mint">${service.priceMxn.toFixed(2)} MXN</StatusPill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{service.description}</p>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </ScreenShell>
    </>
  );
}
