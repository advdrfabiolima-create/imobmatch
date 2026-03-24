import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Bed, BedDouble, Bath, Car, Maximize2, MapPin, Phone, MessageCircle } from "lucide-react";
import { ShareButton } from "./share-button";
import { PhotoGallery } from "./photo-gallery";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getProperty(id: string) {
  try {
    const res = await fetch(`${API_URL}/properties/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await getProperty(params.id);
  if (!property) return { title: "Imóvel não encontrado" };
  return {
    title: `${property.title} - ImobMatch`,
    description: property.description || `${property.type} em ${property.city}/${property.state}`,
    openGraph: {
      images: property.photos?.[0] ? [property.photos[0]] : [],
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  HOUSE: "Casa", CONDO_HOUSE: "Casa em Condomínio", APARTMENT: "Apartamento",
  LAND: "Terreno", COMMERCIAL: "Comercial", RURAL: "Rural",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default async function PropertyPublicPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const property = await getProperty(params.id);
  if (!property) notFound();

  const fromDashboard = searchParams?.from === "dashboard";

  const whatsappMsg = encodeURIComponent(
    `Olá! Vi o imóvel "${property.title}" no ImobMatch e gostaria de mais informações.`
  );
  const whatsappUrl = property.agent?.phone
    ? `https://wa.me/55${property.agent.phone.replace(/\D/g, "")}?text=${whatsappMsg}`
    : null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full"
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
          {fromDashboard && (
            <Link
              href="/meus-imoveis"
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              ← Meus Imóveis
            </Link>
          )}
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-5xl">
        {/* Photo Gallery */}
        <PhotoGallery photos={property.photos ?? []} title={property.title} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    background: "rgba(37,99,235,0.12)",
                    borderColor: "rgba(37,99,235,0.25)",
                    color: "#60a5fa",
                  }}
                >
                  {TYPE_LABELS[property.type]}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    borderColor: "rgba(16,185,129,0.25)",
                    color: "#34d399",
                  }}
                >
                  Disponível
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-white/40 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {property.neighborhood ? `${property.neighborhood}, ` : ""}
                  {property.city}/{property.state}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                property.bedrooms   && { icon: Bed,      value: property.bedrooms,              label: "Quartos"   },
                property.suites     && { icon: BedDouble, value: property.suites,                label: "Suítes"    },
                property.bathrooms  && { icon: Bath,     value: property.bathrooms,             label: "Banheiros" },
                property.parkingSpots && { icon: Car,    value: property.parkingSpots,          label: "Vagas"     },
                property.areaM2     && { icon: Maximize2, value: Number(property.areaM2),       label: property.type === "RURAL" ? "ha" : "m²" },
              ].filter(Boolean).map((item: any) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl text-center border"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <item.icon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-white/35">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div
                className="p-6 rounded-2xl border"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <h2 className="text-base font-semibold text-white mb-3">Sobre o imóvel</h2>
                <p className="text-white/50 leading-relaxed whitespace-pre-wrap text-sm">
                  {property.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Price & Agent */}
          <div className="space-y-4">
            <div
              className="p-6 rounded-2xl border sticky top-24"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.09)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.3)",
              }}
            >
              <p
                className="text-3xl font-bold mb-1"
                style={{ color: "#60a5fa" }}
              >
                {formatCurrency(property.price)}
              </p>
              <p className="text-sm text-white/35 mb-6">Valor de venda</p>

              {/* Agent */}
              {property.agent && (
                <div
                  className="border-t pt-4 mb-5"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <p className="text-[11px] text-white/30 mb-3 font-semibold uppercase tracking-wider">
                    Responsável
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0"
                      style={{ background: "rgba(37,99,235,0.20)" }}
                    >
                      {property.agent.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white/80 text-sm">{property.agent.name}</p>
                      {property.agent.agency && (
                        <p className="text-xs text-white/35">{property.agent.agency}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Buttons */}
              <div className="space-y-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: "#16a34a" }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contato via WhatsApp
                  </a>
                )}
                {property.agent?.phone && (
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm border transition-colors hover:bg-white/[0.06]"
                    style={{
                      borderColor: "rgba(37,99,235,0.40)",
                      color: "#60a5fa",
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    Ligar para o Corretor
                  </a>
                )}
                <ShareButton title={property.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
