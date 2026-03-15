"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Plus, Search, Home } from "lucide-react";
import toast from "react-hot-toast";
import { PropertyFormModal } from "@/components/properties/property-form-modal";
import { STATES } from "@/lib/utils";

const STATUS_TABS = [
  { value: "", label: "Todos" },
  { value: "AVAILABLE", label: "Disponíveis" },
  { value: "SOLD", label: "Vendidos" },
  { value: "RENTED", label: "Alugados" },
  { value: "INACTIVE", label: "Inativos" },
];

const EMPTY_MESSAGES: Record<string, { title: string; desc: string }> = {
  "":          { title: "Nenhum imóvel cadastrado", desc: "Comece cadastrando seu primeiro imóvel" },
  AVAILABLE:   { title: "Nenhum imóvel disponível", desc: "Cadastre um novo imóvel ou reative um imóvel inativo" },
  SOLD:        { title: "Nenhum imóvel vendido", desc: "Os imóveis marcados como vendidos aparecerão aqui" },
  RENTED:      { title: "Nenhum imóvel alugado", desc: "Os imóveis marcados como alugados aparecerão aqui" },
  INACTIVE:    { title: "Nenhum imóvel inativo", desc: "Os imóveis desativados temporariamente aparecerão aqui" },
};

export default function ImoveisPage() {
  const [showForm, setShowForm] = useState(false);
  const [editProperty, setEditProperty] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-properties", search, status, city, state],
    queryFn: () => api.get("/properties/my", { params: { search, status, city, state } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      toast.success("Imóvel excluído");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
    onError: () => toast.error("Erro ao excluir imóvel"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      api.patch(`/properties/${id}`, { status: newStatus }),
    onSuccess: (_, { newStatus }) => {
      const labels: Record<string, string> = {
        SOLD: "vendido", RENTED: "alugado", INACTIVE: "inativo", AVAILABLE: "reativado",
      };
      toast.success(`Imóvel marcado como ${labels[newStatus] ?? newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
    onError: () => toast.error("Erro ao alterar status"),
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este imóvel?")) {
      deleteMutation.mutate(id);
    }
  };

  const emptyMsg = EMPTY_MESSAGES[status] ?? EMPTY_MESSAGES[""];
  const showRegisterCta = status === "" || status === "AVAILABLE";

  return (
    <div>
      <Header title="Meus Imóveis" />
      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título, cidade, bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="sm:w-36"
          />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm sm:w-24"
          >
            <option value="">Estado</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button
            onClick={() => { setEditProperty(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Imóvel
          </Button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === tab.value
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">
          {data?.total ?? 0} imóvel(is) encontrado(s)
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMsg.title}</h3>
            <p className="text-gray-500 mb-4">{emptyMsg.desc}</p>
            {showRegisterCta && (
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                Cadastrar Imóvel
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((p: any) => (
              <PropertyCard
                key={p.id}
                property={p}
                showActions
                onEdit={() => { setEditProperty(p); setShowForm(true); }}
                onDelete={() => handleDelete(p.id)}
                onStatusChange={(newStatus) => statusMutation.mutate({ id: p.id, newStatus })}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PropertyFormModal
          property={editProperty}
          onClose={() => { setShowForm(false); setEditProperty(null); }}
          onSuccess={() => {
            setShowForm(false);
            setEditProperty(null);
            queryClient.invalidateQueries({ queryKey: ["my-properties"] });
          }}
        />
      )}
    </div>
  );
}
