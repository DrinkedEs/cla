import { CatalogView } from "@/components/public/CatalogView";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getSessionUser } from "@/lib/auth";
import { searchPublicServices } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
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
        eyebrow="Buscar tratamientos"
        title="Encuentra el servicio adecuado"
        description="Explora tratamientos disponibles y entra al perfil del doctor para ver su CV, galeria y lo que ofrece."
        query={query}
        category={category}
        services={services}
      />
    </>
  );
}
