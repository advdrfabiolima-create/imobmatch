"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import {
  MapPin,
  Building2,
  MessageSquare,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  Home,
} from "lucide-react";
import Link from "next/link";

export default function CorretorPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Perfil do Corretor" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div>
        <Header title="Perfil do Corretor" />
        <div className="p-6 text-center text-gray-500 py-20">
          <p className="text-lg font-medium">Corretor não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Perfil do Corretor" />
      <div className="p-6 max-w-3xl space-y-5">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Corretores
        </button>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-600 font-bold text-3xl flex-shrink-0">
                {agent.avatarUrl ? (
                  <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                  agent.name?.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
                  {agent.creci && (
                    <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-medium">
                      {agent.creci}
                    </span>
                  )}
                </div>

                {agent.agency && (
                  <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium mb-2">
                    <Building2 className="h-3.5 w-3.5" />
                    {agent.agency}
                  </div>
                )}

                {(agent.city || agent.state) && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {agent.city}{agent.state ? `/${agent.state}` : ""}
                  </div>
                )}

                {agent.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{agent.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    {agent._count?.properties ?? 0} imóveis
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <Link href={`/mensagens?partner=${agent.id}`} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <MessageSquare className="h-4 w-4" />
                    Mensagem
                  </Button>
                </Link>
                {agent.phone && (
                  <a href={`https://wa.me/55${agent.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                    <Button className="w-full bg-green-600 hover:bg-green-700 gap-2" size="sm">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties */}
        {agent.properties?.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Imóveis disponíveis ({agent.properties.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {agent.properties.map((p: any) => (
                <Card key={p.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* Photo */}
                    <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                      {p.photos?.[0] ? (
                        <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Building2 className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 text-sm mb-1 truncate">{p.title}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {PROPERTY_TYPE_LABELS[p.type] ?? p.type}
                        </Badge>
                        <span className="font-bold text-blue-600 text-sm">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                      {(p.city || p.neighborhood) && (
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.neighborhood ? `${p.neighborhood}, ` : ""}{p.city}
                        </p>
                      )}
                      {(p.bedrooms || p.bathrooms || p.areaM2) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {p.bedrooms ? `${p.bedrooms} qts` : ""}
                          {p.bathrooms ? ` · ${p.bathrooms} bhs` : ""}
                          {p.areaM2 ? ` · ${p.areaM2}m²` : ""}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {agent.properties?.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-gray-400">
              <Building2 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Nenhum imóvel disponível no momento.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
