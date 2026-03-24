import Link from "next/link";
import { Flame, MapPin, Tag, Phone, MessageCircle, ArrowRight, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartamento", HOUSE: "Casa", CONDO_HOUSE: "Casa em Condomínio",
  LAND: "Terreno", COMMERCIAL: "Comercial", RURAL: "Rural",
};

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

async function getOpportunities(params: URLSearchParams) {
  try {
    const res = await fetch(`${API_URL}/opportunities?${params.toString()}`, { cache: "no-store" });
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

export default async function OportunidadesPublicPage({ searchParams }: { searchParams: any }) {
  const params = new URLSearchParams();
  if (searchParams.city)     params.set("city",     searchParams.city);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  params.set("limit", "24");

  const { data: opportunities, total } = await getOpportunities(params);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: "rgba(234,88,12,0.06)", filter: "blur(140px)", zIndex: 0 }}
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
            <Link href="/imoveis" className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block">
              Imóveis
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                boxShadow: "0 2px 10px rgba(37,99,235,0.25)",
              }}
            >
              Entrar / Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div
        className="relative py-12 border-b"
        style={{
          background: "linear-gradient(135deg, rgba(234,88,12,0.18) 0%, rgba(153,27,27,0.15) 100%)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(234,88,12,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-6">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider border"
            style={{
              background: "rgba(234,88,12,0.15)",
              borderColor: "rgba(234,88,12,0.30)",
              color: "#fb923c",
            }}
          >
            <Flame className="h-3.5 w-3.5" />
            Oportunidades com desconto urgente
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Radar de Oportunidades</h1>
          <p className="text-white/45 mb-6 text-base">
            Imóveis publicados por corretores com desconto especial na rede ImobMatch.
          </p>

          {/* Filters */}
          <form method="GET" className="flex flex-wrap gap-3">
            <input
              name="city"
              placeholder="Filtrar por cidade..."
              defaultValue={searchParams.city || ""}
              className="flex-1 min-w-48 h-11 px-4 rounded-xl text-sm text-white placeholder-white/30 border focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
            <input
              name="maxPrice"
              type="number"
              placeholder="Preço máximo"
              defaultValue={searchParams.maxPrice || ""}
              className="w-44 h-11 px-4 rounded-xl text-sm text-white placeholder-white/30 border focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                color: "#fff",
                boxShadow: "0 2px 12px rgba(234,88,12,0.30)",
              }}
            >
              <Flame className="h-4 w-4" /> Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-10">
        <p className="text-white/35 text-sm mb-6">
          {total > 0 ? `${total} oportunidade(s) encontrada(s)` : "Nenhuma oportunidade no momento"}
        </p>

        {opportunities?.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(234,88,12,0.12)" }}
            >
              <Flame className="h-8 w-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white/60 mb-2">
              Nenhuma oportunidade por aqui ainda
            </h2>
            <p className="text-white/35 text-sm mb-6">
              Quando corretores publicarem imóveis com desconto urgente, eles aparecem aqui.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                boxShadow: "0 2px 12px rgba(234,88,12,0.25)",
              }}
            >
              Seja o primeiro a publicar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {opportunities.map((opp: any) => {
              const pct = opp.priceNormal > 0 ? Math.round((1 - opp.priceUrgent / opp.priceNormal) * 100) : 0;
              const save = opp.priceNormal - opp.priceUrgent;
              const whatsappMsg = encodeURIComponent(
                `Olá! Vi a oportunidade "${opp.title}" no ImobMatch e gostaria de mais informações.`
              );
              const whatsappUrl = opp.agent?.phone
                ? `https://wa.me/55${opp.agent.phone.replace(/\D/g, "")}?text=${whatsappMsg}`
                : null;

              return (
                <div
                  key={opp.id}
                  className="rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  }}
                >
                  {/* Photo */}
                  <div
                    className="relative h-40 overflow-hidden"
                    style={{ background: "rgba(234,88,12,0.08)" }}
                  >
                    {(opp.photoUrl || opp.property?.photos?.[0]) ? (
                      <img
                        src={opp.photoUrl || opp.property.photos[0]}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-orange-400/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        −{pct}% OFF
                      </span>
                    </div>
                    {opp.acceptsOffer && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Aceita proposta
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Type badge */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{
                          background: "rgba(234,88,12,0.12)",
                          borderColor: "rgba(234,88,12,0.25)",
                          color: "#fb923c",
                        }}
                      >
                        <Tag className="h-2.5 w-2.5 inline mr-0.5" />
                        {TYPE_LABELS[opp.propertyType] ?? opp.propertyType}
                      </span>
                    </div>

                    <h3 className="font-bold text-white/85 text-sm mb-1 line-clamp-2">{opp.title}</h3>

                    <div className="flex items-center gap-1 text-white/35 text-xs mb-3">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>{opp.city}</span>
                    </div>

                    {/* Prices */}
                    <div
                      className="rounded-xl p-3 mb-3 border"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.07)",
                      }}
                    >
                      <p className="text-xs text-white/25 line-through">{fmt(opp.priceNormal)}</p>
                      <p className="text-lg font-extrabold text-white/85">{fmt(opp.priceUrgent)}</p>
                      <p className="text-xs text-orange-400 font-semibold">Economia: −{fmt(save)}</p>
                    </div>

                    {/* Agent */}
                    {opp.agent && (
                      <div
                        className="flex items-center gap-2 mb-3 pb-3 border-b"
                        style={{ borderColor: "rgba(255,255,255,0.07)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-blue-300 text-[10px] font-bold flex-shrink-0"
                          style={{ background: "rgba(37,99,235,0.20)" }}
                        >
                          {opp.agent.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white/55 truncate">{opp.agent.name}</p>
                          {opp.agent.agency && (
                            <p className="text-[10px] text-white/30 truncate">{opp.agent.agency}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact buttons */}
                    <div className="flex gap-2">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90"
                          style={{ background: "#16a34a" }}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      )}
                      {opp.agent?.phone && (
                        <a
                          href={`tel:${opp.agent.phone}`}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors hover:bg-white/[0.06] ${whatsappUrl ? "" : "flex-1"}`}
                          style={{
                            borderColor: "rgba(37,99,235,0.35)",
                            color: "#60a5fa",
                          }}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {whatsappUrl ? "" : "Ligar"}
                        </a>
                      )}
                      {!whatsappUrl && !opp.agent?.phone && (
                        <Link
                          href="/register"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90"
                          style={{
                            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                          }}
                        >
                          Ver contato
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA to register */}
        {opportunities?.length > 0 && (
          <div
            className="mt-16 rounded-2xl p-8 text-center border"
            style={{
              background: "linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(153,27,27,0.12) 100%)",
              borderColor: "rgba(234,88,12,0.20)",
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Você é corretor?</h2>
            <p className="text-white/45 mb-6 text-sm">
              Publique suas oportunidades urgentes e conecte-se com corretores parceiros que já têm clientes interessados.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
              }}
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
