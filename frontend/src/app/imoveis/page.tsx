import { Suspense } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getProperties(params: URLSearchParams) {
  try {
    const res = await fetch(`${API_URL}/properties?${params.toString()}`, { next: { revalidate: 30 } });
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

export default async function ImoveisPublicPage({ searchParams }: { searchParams: any }) {
  const params = new URLSearchParams();
  if (searchParams.city) params.set("city", searchParams.city);
  if (searchParams.type) params.set("type", searchParams.type);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  if (searchParams.bedrooms) params.set("bedrooms", searchParams.bedrooms);
  if (searchParams.search) params.set("search", searchParams.search);

  const { data: properties, total } = await getProperties(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo_texto_preto.png" alt="ImobMatch" className="h-5 w-auto object-contain" />
          </Link>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Entrar / Cadastrar
          </Link>
        </div>
      </header>

      <div className="bg-blue-600 py-10">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-6">Encontre seu imóvel ideal</h1>
          <form method="GET" className="flex flex-wrap gap-3">
            <input name="search" placeholder="Buscar por título ou bairro..." defaultValue={searchParams.search || ""}
              className="flex-1 min-w-48 h-11 px-4 rounded-xl text-sm border-0 outline-none" />
            <input name="city" placeholder="Cidade" defaultValue={searchParams.city || ""}
              className="w-40 h-11 px-4 rounded-xl text-sm border-0 outline-none" />
            <select name="type" defaultValue={searchParams.type || ""}
              className="h-11 px-3 rounded-xl text-sm border-0 outline-none">
              <option value="">Tipo</option>
              <option value="APARTMENT">Apartamento</option>
              <option value="HOUSE">Casa</option>
              <option value="CONDO_HOUSE">Casa em Condomínio</option>
              <option value="LAND">Terreno</option>
              <option value="COMMERCIAL">Comercial</option>
            </select>
            <input name="maxPrice" type="number" placeholder="Preço máximo" defaultValue={searchParams.maxPrice || ""}
              className="w-40 h-11 px-4 rounded-xl text-sm border-0 outline-none" />
            <button type="submit" className="h-11 px-6 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 flex items-center gap-2">
              <Search className="h-4 w-4" /> Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <p className="text-gray-500 mb-6">{total} imóvel(is) encontrado(s)</p>
        {properties?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">Nenhum imóvel encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties?.map((p: any) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
