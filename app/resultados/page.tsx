import { CatalogView } from "@/components/public/CatalogView";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getSessionUser } from "@/lib/auth";
import { searchPublicServices } from "@/lib/data";

export const dynamic = "force-dynamic";

type ResultsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const category = params.category ?? "";
  const [currentUser, services] = await Promise.all([
    getSessionUser(),
    searchPublicServices({ query, category })
  ]);

  return (
    <>
      <PublicHeader currentUser={currentUser} />
      <CatalogView
        eyebrow="Resultados"
        title={`${services.length} servicio${services.length === 1 ? "" : "s"} disponible${services.length === 1 ? "" : "s"}`}
        description="Solo se muestran doctores activos y servicios marcados como visibles en el catalogo publico."
        query={query}
        category={category}
        services={services}
      />
    </>
  );
}
