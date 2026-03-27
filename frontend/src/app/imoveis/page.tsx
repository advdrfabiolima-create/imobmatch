import { Suspense } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import {
  OpportunitiesSidebar,
  MobileOpportunitiesStrip,
  type OpportunityItem,
} from "@/components/properties/OpportunitiesSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getProperties(params: URLSearchParams) {
  try {
    const res = await fetch(`${API_URL}/properties?${params.toString()}`, {
      next: { revalidate: 30 },
    });
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

async function getOpportunities(): Promise<{ data: OpportunityItem[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/opportunities?limit=6`, {
      next: { revalidate: 60 },
    });
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

export default async function ImoveisPublicPage({ searchParams }: { searchParams: any }) {
  const params = new URLSearchParams();
  if (searchParams.city)     params.set("city",     searchParams.city);
  if (searchParams.type)     params.set("type",     searchParams.type);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  if (searchParams.bedrooms) params.set("bedrooms", searchParams.bedrooms);
  if (searchParams.search)   params.set("search",   searchParams.search);

  const [{ data: properties, total }, { data: opportunities, total: oppsTotal }] =
    await Promise.all([getProperties(params), getOpportunities()]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: "rgba(124,58,237,0.06)", filter: "blur(140px)", zIndex: 0 }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          background: "rgba(6,12,26,0.85)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-70">
            <img src="/logo_texto_branco.png" alt="ImobMatch" className="h-5 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/radar"
              className="hidden sm:flex items-center gap-1.5 text-sm text-orange-400/75 hover:text-orange-400 transition-colors font-medium"
            >
              🔥 Oportunidades
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Search bar */}
      <div
        className="relative py-10 border-b"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.12) 100%)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
            Encontre seu imóvel ideal
          </h1>
          <form method="GET" className="flex flex-wrap gap-3">
            <input
              name="search"
              placeholder="Buscar por título ou bairro..."
              defaultValue={searchParams.search || ""}
              className="flex-1 min-w-48 h-11 px-4 rounded-xl text-sm text-white placeholder-white/30 border transition-colors focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
            <input
              name="city"
              placeholder="Cidade"
              defaultValue={searchParams.city || ""}
              className="w-40 h-11 px-4 rounded-xl text-sm text-white placeholder-white/30 border transition-colors focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
            <select
              name="type"
              defaultValue={searchParams.type || ""}
              className="h-11 px-3 rounded-xl text-sm border focus:outline-none"
              style={{
                background: "rgba(15,20,40,0.95)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              <option value="">Tipo</option>
              <option value="APARTMENT">Apartamento</option>
              <option value="HOUSE">Casa</option>
              <option value="CONDO_HOUSE">Casa em Condomínio</option>
              <option value="LAND">Terreno</option>
              <option value="COMMERCIAL">Comercial</option>
            </select>
            <input
              name="maxPrice"
              type="number"
              placeholder="Preço máximo"
              defaultValue={searchParams.maxPrice || ""}
              className="w-40 h-11 px-4 rounded-xl text-sm text-white placeholder-white/30 border focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-xl font-semibold text-sm text-white flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                boxShadow: "0 2px 12px rgba(37,99,235,0.25)",
              }}
            >
              <Search className="h-4 w-4" /> Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">

        {/* Strip de oportunidades — mobile */}
        <MobileOpportunitiesStrip opportunities={opportunities} total={oppsTotal} />

        {/* Layout: grid + sidebar */}
        <div className="flex gap-6 items-start">

          {/* Coluna principal */}
          <div className="flex-1 min-w-0">
            <p className="text-white/35 text-sm mb-6">
              {total} imóvel(is) encontrado(s)
            </p>

            {properties?.length === 0 ? (
              <div className="text-center py-20">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(37,99,235,0.12)" }}
                >
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-lg text-white/50 font-medium">Nenhum imóvel encontrado</p>
                <p className="text-sm text-white/25 mt-2">Tente ajustar os filtros de busca.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties?.map((p: any) => <PropertyCard key={p.id} property={p} />)}
              </div>
            )}
          </div>

          {/* Sidebar — desktop */}
          <OpportunitiesSidebar opportunities={opportunities} total={oppsTotal} />
        </div>
      </div>
    </div>
  );
}
