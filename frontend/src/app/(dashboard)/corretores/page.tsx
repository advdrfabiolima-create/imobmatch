"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Search, MapPin, Building2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 12;

export default function CorretoresPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["agents", search, city, page],
    queryFn: () =>
      api.get("/users", { params: { search, city, page, limit: PAGE_SIZE } }).then((r) => r.data),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div>
      <Header title="Buscar Corretores" />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar por nome ou imobiliária..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Input placeholder="Filtrar por cidade..." value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} className="sm:w-48" />
        </div>

        <p className="text-sm text-gray-500 mb-4">{data?.total ?? 0} corretor(es) encontrado(s)</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search || city ? "Nenhum corretor encontrado" : "A rede ainda está vazia"}
            </h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
              {search || city
                ? "Tente buscar por outros termos ou limpe os filtros."
                : "Em breve outros corretores vão se cadastrar na plataforma."}
            </p>
            {(search || city) && (
              <Button variant="outline" onClick={() => { setSearch(""); setCity(""); }}>
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((agent: any) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <AgentAvatar
                      name={agent.name}
                      avatarUrl={agent.avatarUrl}
                      score={agent.score}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      {agent.agency && <p className="text-sm text-blue-600 truncate">{agent.agency}</p>}
                      {(agent.city || agent.state) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{agent.city}{agent.state ? `/${agent.state}` : ""}</span>
                        </div>
                      )}
                      {agent.creci && (
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {agent.creci}
                        </span>
                      )}
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.bio}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{agent._count?.properties ?? 0} imóveis cadastrados</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => router.push(`/mensagens?partner=${agent.id}`)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Mensagem
                    </Button>
                    <Link href={`/corretor/${agent.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 gap-1">
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
