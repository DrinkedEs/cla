import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import { getSessionUser } from "@/lib/auth";
import { getDoctorProfileBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

type DoctorProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { slug } = await params;
  const [currentUser, doctor] = await Promise.all([
    getSessionUser(),
    getDoctorProfileBySlug(slug)
  ]);

  if (!doctor) {
    notFound();
  }

  return (
    <>
      <PublicHeader currentUser={currentUser} />
      <ScreenShell
        eyebrow="Perfil del doctor"
        title={doctor.fullName}
        description={`${doctor.displayTitle} - ${doctor.semester} - ${doctor.university}`}
      >
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5">
            <Surface>
              <StatusPill tone="mint">Disponible en catalogo</StatusPill>
              <p className="mt-4 text-sm leading-7 text-white/62">{doctor.bio}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Contacto
                  </p>
                  <p className="mt-3 font-bold text-white">{doctor.email}</p>
                  <p className="mt-1 text-sm text-white/55">{doctor.phone}</p>
                </div>
                {doctor.cvUrl ? (
                  <a
                    href={doctor.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-violet-electric px-4 text-sm font-bold text-white transition hover:bg-violet-400"
                  >
                    Ver CV
                  </a>
                ) : null}
                <Link
                  href="/resultados"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                >
                  Volver a resultados
                </Link>
              </div>
            </Surface>

            <Surface>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <StatusPill tone="violet">Galeria</StatusPill>
                  <h3 className="mt-3 text-xl font-black text-white">Fotos del perfil</h3>
                </div>
                <span className="text-sm text-white/45">{doctor.photos.length} imagenes</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {doctor.photos.length > 0 ? (
                  doctor.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/5"
                    >
                      <Image
                        src={photo.fileUrl}
                        alt={`Foto de ${doctor.fullName}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50 sm:col-span-2">
                    Este doctor aun no ha agregado fotos al perfil.
                  </div>
                )}
              </div>
            </Surface>
          </div>

          <Surface>
            <div className="flex items-center justify-between gap-3">
              <div>
                <StatusPill tone="mint">Servicios activos</StatusPill>
                <h3 className="mt-3 text-2xl font-black text-white">Lo que puede ofrecer</h3>
              </div>
              <span className="text-sm text-white/45">{doctor.services.length} publicados</span>
            </div>
            <div className="mt-5 grid gap-3">
              {doctor.services.length > 0 ? (
                doctor.services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{service.title}</p>
                        <p className="mt-1 text-sm text-white/55">{service.category}</p>
                      </div>
                      <StatusPill tone="mint">${service.priceMxn.toFixed(2)} MXN</StatusPill>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/58">{service.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusPill tone="violet">{service.durationMinutes} min</StatusPill>
                      <StatusPill tone="muted">Perfil validado con CV</StatusPill>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                  Este doctor aun no ha publicado servicios visibles.
                </div>
              )}
            </div>
          </Surface>
        </div>
      </ScreenShell>
    </>
  );
}
