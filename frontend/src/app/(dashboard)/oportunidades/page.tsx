"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Zap, MapPin, Tag, Phone, Plus, X, Filter,
  TrendingDown, Building2, Home, Landmark, Warehouse, Trees
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { CitySelect } from "@/components/ui/city-select";
import { STATES } from "@/lib/utils";
import toast from "react-hot-toast";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
  RURAL: "Rural",
};

const PROPERTY_TYPE_ICONS: Record<string, React.ElementType> = {
  HOUSE: Home,
  APARTMENT: Building2,
  LAND: Landmark,
  COMMERCIAL: Warehouse,
  RURAL: Trees,
};

function NewOpportunityModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "", propertyType: "APARTMENT", priceNormal: "", priceUrgent: "",
    state: "", city: "", neighborhood: "", description: "", acceptsOffer: false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/opportunities", data),
    onSuccess: () => {
      toast.success("Oportunidade publicada!");
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      onClose();
    },
    onError: () => toast.error("Erro ao publicar oportunidade"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      priceNormal: Number(form.priceNormal),
      priceUrgent: Number(form.priceUrgent),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Nova Oportunidade Urgente
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Título</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Ex: Apartamento urgente - dono viajando"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Tipo do Imóvel</label>
            <select
              value={form.propertyType}
              onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Preço Normal (R$)</label>
              <input
                required type="number"
                value={form.priceNormal}
                onChange={e => setForm(f => ({ ...f, priceNormal: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Preço Urgente (R$)</label>
              <input
                required type="number"
                value={form.priceUrgent}
                onChange={e => setForm(f => ({ ...f, priceUrgent: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="420000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Estado *</label>
              <select
                required
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value, city: "" }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Selecione</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Cidade *</label>
              <CitySelect
                required
                stateValue={form.state}
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Bairro</label>
            <input
              value={form.neighborhood}
              onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Descreva a urgência e detalhes relevantes..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptsOffer}
              onChange={e => setForm(f => ({ ...f, acceptsOffer: e.target.checked }))}
              className="rounded"
            />
            <span className="text-gray-700">Aceita proposta / contraproposta</span>
          </label>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {mutation.isPending ? "Publicando..." : "Publicar Oportunidade"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function OpportunityCard({ opp }: { opp: any }) {
  const discount = Math.round(
    ((Number(opp.priceNormal) - Number(opp.priceUrgent)) / Number(opp.priceNormal)) * 100
  );
  const TypeIcon = PROPERTY_TYPE_ICONS[opp.propertyType] ?? Building2;

  return (
    <Card className="border-orange-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 p-1.5 rounded-lg">
              <TypeIcon className="h-4 w-4 text-orange-600" />
            </span>
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{opp.title}</p>
              <p className="text-xs text-gray-500">{PROPERTY_TYPE_LABELS[opp.propertyType]}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-orange-500 text-white border-0 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              URGENTE
            </Badge>
            {opp.acceptsOffer && (
              <Badge variant="outline" className="text-xs border-green-400 text-green-700">
                Aceita proposta
              </Badge>
            )}
          </div>
        </div>

        {/* Preços */}
        <div className="bg-orange-50 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 line-through">{formatCurrency(opp.priceNormal)}</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(opp.priceUrgent)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-lg">
                <TrendingDown className="h-4 w-4" />
                <span className="font-bold text-sm">{discount}% OFF</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Economia: {formatCurrency(Number(opp.priceNormal) - Number(opp.priceUrgent))}
              </p>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{opp.neighborhood ? `${opp.neighborhood}, ` : ""}{opp.city}</span>
        </div>

        {opp.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{opp.description}</p>
        )}

        {/* Agente */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs overflow-hidden">
              {opp.agent?.avatarUrl
                ? <img src={opp.agent.avatarUrl} alt={opp.agent.name} className="w-full h-full object-cover" />
                : opp.agent?.name?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{opp.agent?.name}</p>
              <p className="text-xs text-gray-500">{opp.agent?.agency}</p>
            </div>
          </div>
          <a
            href={opp.agent?.phone ? `https://wa.me/55${opp.agent.phone.replace(/\D/g, "")}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            Tenho comprador
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-2">{formatDate(opp.createdAt)}</p>
      </CardContent>
    </Card>
  );
}

export default function OportunidadesPage() {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ city: "", maxPrice: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.city) params.set("city", filters.city);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      return api.get(`/opportunities?${params}`).then(r => r.data);
    },
  });

  return (
    <div>
      {showModal && <NewOpportunityModal onClose={() => setShowModal(false)} />}

      <Header title="Radar de Oportunidades" />

      <div className="p-4 md:p-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-800">
              <strong>Radar ativo:</strong> Imóveis com desconto urgente para venda rápida
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowFilters(f => !f)}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              className="gap-2 bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4" />
              Nova Oportunidade
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white border rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600">Cidade</label>
              <input
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Filtrar por cidade..."
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600">Preço máximo (R$)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="500000"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ city: "", maxPrice: "" })}
              >
                Limpar
              </Button>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma oportunidade no radar</h3>
            <p className="text-gray-500 mb-6">Seja o primeiro a publicar uma oportunidade urgente</p>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Publicar Oportunidade
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((opp: any) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
