import Link from "next/link";
import { AppIcon } from "@/components/icons/AppIcon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import type { PublicService } from "@/lib/types";

type CatalogViewProps = {
  eyebrow: string;
  title: string;
  description: string;
  query: string;
  category: string;
  services: PublicService[];
};

export function CatalogView({
  eyebrow,
  title,
  description,
  query,
  category,
  services
}: CatalogViewProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--violet-main)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black text-[var(--text)] sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-soft)] sm:text-base">{description}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <Surface className="h-fit">
          <form action="/resultados" className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Buscar tratamiento
              </span>
              <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4">
                <AppIcon name="search" className="h-5 w-5 text-[var(--violet-main)]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Limpieza, resina, revision..."
                  className="w-full bg-transparent text-sm font-medium text-[var(--text)] outline-none"
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Categoria
              </span>
              <input
                name="category"
                defaultValue={category}
                placeholder="Preventivo, estetico, restaurativo..."
                className="min-h-12 rounded-2xl border border-[rgba(105,73,150,0.12)] bg-white/80 px-4 text-sm font-medium text-[var(--text)] outline-none"
              />
            </label>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--violet-main)] px-4 text-sm font-bold text-white transition hover:brightness-105"
            >
              Ver resultados
              <AppIcon name="arrow" className="h-4 w-4" />
            </button>
          </form>
        </Surface>

        <div className="grid gap-4">
          {services.length > 0 ? (
            services.map((service) => (
              <Link key={service.id} href={`/doctores/${service.doctorSlug}`}>
                <Surface className="transition hover:border-[rgba(124,76,194,0.2)] hover:bg-white/90">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[rgba(124,76,194,0.12)] text-[var(--violet-deep)]">
                      <AppIcon name="tooth" className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-[var(--text)]">{service.title}</h3>
                          <p className="mt-1 text-sm text-[var(--text-soft)]">
                            {service.doctorName} · {service.doctorSemester}
                          </p>
                        </div>
                        <StatusPill tone="mint">${service.priceMxn.toFixed(2)} MXN</StatusPill>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusPill tone="violet">{service.category}</StatusPill>
                        <StatusPill tone="muted">{service.durationMinutes} min</StatusPill>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Surface>
              </Link>
            ))
          ) : (
            <Surface>
              <h3 className="text-xl font-black text-[var(--text)]">Sin coincidencias por ahora</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                Prueba otro termino de busqueda o registra el primer doctor para poblar el catalogo.
              </p>
            </Surface>
          )}
        </div>
      </div>
    </section>
  );
}
