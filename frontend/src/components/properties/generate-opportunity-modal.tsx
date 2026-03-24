"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, X, Building2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  neighborhood?: string;
  description?: string;
  photos?: string[];
}

interface GenerateOpportunityModalProps {
  property: Property;
  onClose: () => void;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE:       "Casa",
  CONDO_HOUSE: "Casa em Condomínio",
  APARTMENT:   "Apartamento",
  LAND:        "Terreno",
  COMMERCIAL:  "Comercial",
  RURAL:       "Rural",
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — mesmo padrão visual do NewOpportunityModal
// ─────────────────────────────────────────────────────────────────────────────

export function GenerateOpportunityModal({ property, onClose }: GenerateOpportunityModalProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title:        property.title,
    propertyType: property.type,
    priceUrgent:  "",
    neighborhood: property.neighborhood ?? "",
    description:  property.description ?? "",
    acceptsOffer: false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/opportunities", data),
    onSuccess: () => {
      toast.success("Oportunidade publicada no radar!");
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      onClose();
    },
    onError: () => toast.error("Erro ao publicar oportunidade"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceUrgent = Number(form.priceUrgent);
    if (!priceUrgent || priceUrgent <= 0) {
      toast.error("Informe o preço urgente");
      return;
    }
    if (priceUrgent >= property.price) {
      toast.error("O preço urgente deve ser menor que o preço normal");
      return;
    }
    mutation.mutate({
      title:        form.title,
      propertyType: form.propertyType,
      priceNormal:  property.price,
      priceUrgent,
      state:        property.state,
      city:         property.city,
      neighborhood: form.neighborhood,
      description:  form.description,
      acceptsOffer: form.acceptsOffer,
      propertyId:   property.id,
      photoUrl:     property.photos?.[0] ?? null,
    });
  };

  const discount = form.priceUrgent
    ? Math.round(((property.price - Number(form.priceUrgent)) / property.price) * 100)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

        {/* ── Header — mesma estrutura do NewOpportunityModal ── */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-orange-400" />
            Gerar Oportunidade Urgente
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* ── Banner de contexto ── */}
          <div className="flex items-start gap-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
            <Info className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-300">
                Criando oportunidade a partir de um imóvel já cadastrado
              </p>
              <p className="text-xs text-orange-400/80 mt-0.5">
                Os dados do imóvel foram pré-preenchidos. Defina o preço urgente para publicar no radar.
              </p>
            </div>
          </div>

          {/* ── Imóvel de origem (somente leitura) ── */}
          <div className="bg-muted/50 rounded-xl p-3 border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4.5 w-4.5 text-primary" style={{ height: "18px", width: "18px" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{property.title}</p>
              <p className="text-xs text-muted-foreground">
                {PROPERTY_TYPE_LABELS[property.type]} · {property.city}/{property.state}
              </p>
            </div>
            <span className="text-sm font-bold text-primary flex-shrink-0 ml-auto">
              {formatCurrency(property.price)}
            </span>
          </div>

          {/* ── Título (editável, pré-preenchido) ── */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Título</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full border border-border bg-muted/60 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              placeholder="Ex: Apartamento urgente - dono viajando"
            />
          </div>

          {/* ── Tipo (editável, pré-preenchido) ── */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Tipo do Imóvel</label>
            <select
              value={form.propertyType}
              onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
              className="mt-1 w-full border border-border bg-muted/60 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* ── Preços ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground/80">Preço Normal (R$)</label>
              <input
                readOnly
                value={property.price}
                className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
                tabIndex={-1}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">
                Preço Urgente (R$){" "}
                <span className="text-orange-400">*</span>
                {discount !== null && discount > 0 && (
                  <span className="ml-1 text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                    −{discount}%
                  </span>
                )}
              </label>
              <input
                required
                type="number"
                autoFocus
                value={form.priceUrgent}
                onChange={e => setForm(f => ({ ...f, priceUrgent: e.target.value }))}
                className="mt-1 w-full border border-border bg-muted/60 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                placeholder="Ex: 420000"
              />
            </div>
          </div>

          {/* ── Localização (somente leitura) ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground/80">Estado</label>
              <input
                readOnly
                value={property.state}
                className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
                tabIndex={-1}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Cidade</label>
              <input
                readOnly
                value={property.city}
                className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* ── Bairro (editável) ── */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Bairro</label>
            <input
              value={form.neighborhood}
              onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
              className="mt-1 w-full border border-border bg-muted/60 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          {/* ── Descrição (editável, pré-preenchida) ── */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Motivo da urgência / Observação</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full border border-border bg-muted/60 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
              placeholder="Descreva o motivo da urgência e detalhes relevantes..."
            />
          </div>

          {/* ── Aceita proposta ── */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptsOffer}
              onChange={e => setForm(f => ({ ...f, acceptsOffer: e.target.checked }))}
              className="rounded"
            />
            <span className="text-foreground/80">Aceita proposta / contraproposta</span>
          </label>

          {/* ── Submit ── */}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {mutation.isPending ? "Publicando..." : "🔥 Publicar no Radar de Oportunidades"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            A oportunidade será publicada imediatamente no radar da rede
          </p>
        </form>
      </div>
    </div>
  );
}
