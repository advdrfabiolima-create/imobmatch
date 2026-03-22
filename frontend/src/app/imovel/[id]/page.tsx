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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="ImobMatch" className="h-9 w-auto object-contain" />
          </Link>
          {fromDashboard && (
            <Link href="/meus-imoveis" className="text-sm text-gray-600 hover:text-blue-600">
              ← Meus Imóveis
            </Link>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Photo Gallery */}
        <PhotoGallery photos={property.photos ?? []} title={property.title} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
                <span className="bg-blue-100 px-3 py-1 rounded-full">{TYPE_LABELS[property.type]}</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Disponível</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city}/{property.state}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {property.bedrooms && (
                <div className="bg-white p-4 rounded-xl text-center border">
                  <Bed className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-xs text-gray-500">Quartos</p>
                </div>
              )}
              {property.suites && (
                <div className="bg-white p-4 rounded-xl text-center border">
                  <BedDouble className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{property.suites}</p>
                  <p className="text-xs text-gray-500">Suítes</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-white p-4 rounded-xl text-center border">
                  <Bath className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-xs text-gray-500">Banheiros</p>
                </div>
              )}
              {property.parkingSpots && (
                <div className="bg-white p-4 rounded-xl text-center border">
                  <Car className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{property.parkingSpots}</p>
                  <p className="text-xs text-gray-500">Vagas</p>
                </div>
              )}
              {property.areaM2 && (
                <div className="bg-white p-4 rounded-xl text-center border">
                  <Maximize2 className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{Number(property.areaM2)}</p>
                  <p className="text-xs text-gray-500">{property.type === "RURAL" ? "ha" : "m²"}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white p-6 rounded-2xl border">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Sobre o imóvel</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Price & Agent */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {formatCurrency(property.price)}
              </p>
              <p className="text-sm text-gray-500 mb-6">Valor de venda</p>

              {/* Agent */}
              {property.agent && (
                <div className="border-t pt-4 mb-4">
                  <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Responsável</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {property.agent.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{property.agent.name}</p>
                      {property.agent.agency && <p className="text-sm text-gray-500">{property.agent.agency}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Buttons */}
              <div className="space-y-3">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Contato via WhatsApp
                  </a>
                )}
                {property.agent?.phone && (
                  <a href={`tel:${property.agent.phone}`}
                    className="flex items-center justify-center gap-2 w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl font-medium hover:bg-blue-50 transition"
                  >
                    <Phone className="h-5 w-5" />
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
