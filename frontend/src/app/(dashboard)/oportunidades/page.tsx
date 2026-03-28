"use client";

import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Zap, MapPin, Phone, Plus, X, TrendingDown,
  Building2, Home, Landmark, Warehouse, Trees,
  Eye, MessageCircle, Clock, Flame, RefreshCw,
  Wallet, Users, MoreVertical, PauseCircle, CheckCircle2, Trash2,
} from "lucide-react";
import { STATES } from "@/lib/utils";
import { CitySelect } from "@/components/ui/city-select";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "Casa", CONDO_HOUSE: "Casa em Condomínio", APARTMENT: "Apartamento",
  LAND: "Terreno", COMMERCIAL: "Comercial", RURAL: "Rural",
};
const PROPERTY_TYPE_ICONS: Record<string, React.ElementType> = {
  HOUSE: Home, CONDO_HOUSE: Home, APARTMENT: Building2, LAND: Landmark,
  COMMERCIAL: Warehouse, RURAL: Trees,
};
const PROPERTY_TYPE_COLORS: Record<string, string> = {
  HOUSE:       "from-orange-500 to-amber-600",
  CONDO_HOUSE: "from-orange-400 to-amber-500",
  APARTMENT:   "from-blue-500 to-indigo-600",
  LAND:        "from-green-500 to-emerald-600",
  COMMERCIAL:  "from-purple-500 to-violet-600",
  RURAL:       "from-teal-500 to-cyan-600",
};

function seeded(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return Math.floor((Math.abs(Math.sin(h * 9301 + 49297)) % 1) * (max - min + 1)) + min;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "agora mesmo";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

const SOCIAL_PROOF_TEXTS = [
  "Essa oportunidade está sendo disputada",
  "Alta procura na região",
  "Corretores demonstrando interesse",
  "Oportunidade em destaque no radar",
  "Negócio com alta chance de fechamento",
];

type SortChip = "recent" | "discount" | "urgent" | "region";

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmModal({
  title, body, confirmLabel, confirmClass, onConfirm, onClose,
}: {
  title: string; body: string; confirmLabel: string; confirmClass: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="font-bold text-foreground text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{body}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm text-white font-semibold transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Opportunity Modal ────────────────────────────────────────────────────

function NewOpportunityModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "", propertyType: "APARTMENT", priceNormal: "", priceUrgent: "",
    state: "", city: "", neighborhood: "", description: "", acceptsOffer: false,
  });
  const [photoUrl, setPhotoUrl]       = useState<string | null>(null);
  const [uploading, setUploading]     = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await api.post("/upload/images", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.urls?.[0] ?? null);
    } catch {
      toast.error("Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/opportunities", data),
    onSuccess: () => {
      toast.success("Oportunidade publicada no radar! 🔥");
      queryClient.invalidateQueries({ queryKey: ["opportunities-feed"] });
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
      photoUrl: photoUrl ?? undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Nova Oportunidade Urgente
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/80">Título</label>
            <input required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
              placeholder="Ex: Apartamento urgente — dono viajando"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Tipo do Imóvel</label>
            <select value={form.propertyType}
              onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
              className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground/80">Preço Normal (R$)</label>
              <input required type="number" value={form.priceNormal}
                onChange={e => setForm(f => ({ ...f, priceNormal: e.target.value }))}
                className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Preço Urgente (R$)</label>
              <input required type="number" value={form.priceUrgent}
                onChange={e => setForm(f => ({ ...f, priceUrgent: e.target.value }))}
                className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
                placeholder="420000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground/80">Estado *</label>
              <select required value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value, city: "" }))}
                className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Selecione</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Cidade *</label>
              <CitySelect required stateValue={form.state} value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Bairro</label>
            <input value={form.neighborhood}
              onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
              className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">Descrição da urgência</label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full border border-border bg-muted/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none placeholder:text-muted-foreground"
              placeholder="Descreva o motivo da urgência..."
            />
          </div>
          {/* Foto do imóvel */}
          <div>
            <label className="text-sm font-medium text-foreground/80">Foto do Imóvel</label>
            <div className="mt-1">
              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: 140 }}>
                  <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed border-border rounded-xl py-6 cursor-pointer hover:border-orange-400 hover:bg-orange-500/5 transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  {uploading ? (
                    <span className="text-xs text-orange-500 font-medium">Enviando foto...</span>
                  ) : (
                    <>
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs text-muted-foreground">Clique para adicionar foto</span>
                      <span className="text-[11px] text-muted-foreground/60">JPG, PNG até 10MB</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.acceptsOffer}
              onChange={e => setForm(f => ({ ...f, acceptsOffer: e.target.checked }))}
              className="rounded"
            />
            <span className="text-foreground/80">Aceita proposta / contraproposta</span>
          </label>
          <Button type="submit" disabled={mutation.isPending || uploading}
            className="w-full bg-orange-500 hover:bg-orange-600 h-11 font-semibold"
          >
            {mutation.isPending ? "Publicando..." : "🔥 Publicar no Radar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Author Actions Menu ──────────────────────────────────────────────────────

function AuthorMenu({
  oppId, onStatusChange,
}: {
  oppId: string;
  onStatusChange: (id: string, status: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
        title="Gerenciar oportunidade"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-52 bg-popover rounded-xl shadow-xl border border-border z-30 overflow-hidden">
          <button
            onClick={() => { onStatusChange(oppId, "paused", "Oportunidade pausada"); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <PauseCircle className="h-4 w-4 text-amber-500" />
            Retirar do radar
          </button>
          <button
            onClick={() => { onStatusChange(oppId, "closed", "Negócio registrado como fechado 🎉"); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Marcar como fechada
          </button>
          <div className="h-px bg-border" />
          <button
            onClick={() => { onStatusChange(oppId, "removed", "Oportunidade removida"); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Remover permanentemente
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Opportunity Card ─────────────────────────────────────────────────────────

function OpportunityCard({
  opp, index, currentUserId, onStatusAction,
}: {
  opp: any; index: number; currentUserId?: string;
  onStatusAction: (id: string, status: string, label: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), Math.min(index * 60, 300));
    return () => clearTimeout(t);
  }, [index]);

  const discount    = Math.round(((Number(opp.priceNormal) - Number(opp.priceUrgent)) / Number(opp.priceNormal)) * 100);
  const savings     = Number(opp.priceNormal) - Number(opp.priceUrgent);
  const commission  = Math.round(Number(opp.priceUrgent) * 0.03);
  const isOwner     = currentUserId === opp.agentId;
  const isCritical  = discount >= 30;
  const isNew       = (Date.now() - new Date(opp.createdAt).getTime()) < 2 * 3_600_000;

  const views       = seeded(opp.id, 4, 47);
  const proposals   = seeded(opp.id + "p", 0, Math.min(views - 1, 8));
  const socialIdx   = seeded(opp.id + "s", 0, SOCIAL_PROOF_TEXTS.length - 1);

  const TypeIcon    = PROPERTY_TYPE_ICONS[opp.propertyType] ?? Building2;
  const gradientBg  = PROPERTY_TYPE_COLORS[opp.propertyType] ?? "from-orange-500 to-amber-600";

  // Resolve photo: photoUrl > property.photos[0] > null (fallback)
  const photo = opp.photoUrl || opp.property?.photos?.[0] || null;

  const whatsappUrl = opp.agent?.phone
    ? `https://wa.me/55${opp.agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${opp.agent.name}, vi sua oportunidade "${opp.title}" no ImobMatch e tenho um cliente interessado!`)}`
    : undefined;

  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
      className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:border-border hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* ── Image / Fallback ── */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        {photo ? (
          <img
            src={photo}
            alt={opp.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientBg} flex flex-col items-center justify-center gap-2`}>
            <TypeIcon className="h-12 w-12 text-white/70" strokeWidth={1.5} />
            <span className="text-white/60 text-xs font-medium">Imagem não disponível</span>
          </div>
        )}

        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {isCritical ? (
            <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
              🔥 MUITO URGENTE
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              ⚡ URGENTE
            </span>
          )}
          {isNew && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              🆕 NOVO
            </span>
          )}
        </div>

        {/* Top-right: discount badge + author menu */}
        <div className="absolute top-3 right-3 flex items-start gap-2">
          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-lg ${isCritical ? "bg-red-600" : "bg-orange-500"} text-white`}>
            <span className="text-[9px] font-medium leading-none">OFF</span>
            <span className="text-lg font-extrabold leading-tight">{discount}%</span>
          </div>
          {isOwner && (
            <AuthorMenu oppId={opp.id} onStatusChange={onStatusAction} />
          )}
        </div>

        {/* Bottom: property type + social signals */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-3 text-white text-xs">
          <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">
            {PROPERTY_TYPE_LABELS[opp.propertyType]}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="h-3 w-3" /> {views}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> {proposals}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {timeAgo(opp.createdAt)}
          </span>
        </div>

        {/* Owner indicator */}
        {isOwner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <span className="bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">Sua oportunidade</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-[15px] leading-snug mb-1">{opp.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{opp.neighborhood ? `${opp.neighborhood}, ` : ""}{opp.city}</span>
        </div>

        {/* Price block */}
        <div className={`rounded-xl p-3 mb-3 ${isCritical ? "bg-red-500/10 border border-red-500/20" : "bg-orange-500/10 border border-orange-500/20"}`}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground/60 line-through">{formatCurrency(opp.priceNormal)}</p>
              <p className={`text-2xl font-extrabold leading-tight ${isCritical ? "text-red-400" : "text-orange-400"}`}>
                {formatCurrency(opp.priceUrgent)}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isCritical ? "bg-red-500/15 text-red-300" : "bg-orange-500/15 text-orange-300"}`}>
                <TrendingDown className="h-3.5 w-3.5" />
                {discount}% OFF
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">💰 Economia: <strong className="text-foreground">{formatCurrency(savings)}</strong></p>
            </div>
          </div>
        </div>

        {/* Commission */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-3">
          <Wallet className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300">
            <span className="font-semibold">Comissão estimada para você:</span>{" "}
            <span className="font-bold text-emerald-200 text-sm">{formatCurrency(commission)}</span>
            <span className="text-emerald-400"> (3%)</span>
          </p>
        </div>

        {opp.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{opp.description}</p>
        )}

        {/* Social proof */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex -space-x-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 border-white bg-gradient-to-br ${["from-blue-400 to-indigo-500","from-orange-400 to-red-500","from-emerald-400 to-teal-500"][i]}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {SOCIAL_PROOF_TEXTS[socialIdx]}
          </p>
        </div>

        {/* Agent + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-xs">
              {opp.agent?.avatarUrl
                ? <img src={opp.agent.avatarUrl} alt={opp.agent.name} className="w-full h-full object-cover" />
                : opp.agent?.name?.charAt(0).toUpperCase()
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{opp.agent?.name}</p>
              <p className="text-[11px] text-muted-foreground/60 truncate">{opp.agent?.agency || "Corretor"}</p>
            </div>
          </div>

          {isOwner ? (
            <span className="text-xs text-muted-foreground/60 italic">Você publicou</span>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-95 ${
                isCritical ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"
              } ${!whatsappUrl ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Phone className="h-3.5 w-3.5" />
              💰 Tenho comprador
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/8 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-16 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-px bg-border" />
        <div className="flex justify-between">
          <div className="h-8 w-24 bg-white/5 rounded-lg" />
          <div className="h-8 w-28 bg-white/8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CHIPS: { key: SortChip; label: string }[] = [
  { key: "recent",   label: "🆕 Recentes"      },
  { key: "discount", label: "💰 Maior desconto" },
  { key: "urgent",   label: "🔥 Urgentes"       },
  { key: "region",   label: "📍 Região"         },
];

type PendingAction = { id: string; status: string; label: string } | null;

export default function OportunidadesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal]     = useState(false);
  const [activeChip, setActiveChip]   = useState<SortChip>("recent");
  const [cityFilter, setCityFilter]   = useState("");
  const [showRegion, setShowRegion]   = useState(false);
  const [newBanner, setNewBanner]     = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const firstIdRef  = useRef<string | null>(null);

  const {
    data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch,
  } = useInfiniteQuery({
    queryKey: ["opportunities-feed", cityFilter],
    queryFn: ({ pageParam = 1 }) =>
      api.get("/opportunities", { params: { city: cityFilter || undefined, page: pageParam, limit: 10 } })
        .then(r => r.data),
    getNextPageParam: (last: any) => last.page < last.totalPages ? last.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/opportunities/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      const label = CONFIRM_CONFIG[status as keyof typeof CONFIRM_CONFIG]?.successLabel ?? "Oportunidade atualizada";
      toast.success(label);
      queryClient.invalidateQueries({ queryKey: ["opportunities-feed"] });
    },
    onError: () => toast.error("Erro ao atualizar oportunidade"),
  });

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Poll for new items
  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await api.get("/opportunities", { params: { page: 1, limit: 1 } });
      const latestId = res.data?.data?.[0]?.id;
      if (firstIdRef.current && latestId && latestId !== firstIdRef.current) setNewBanner(true);
    }, 90_000);
    return () => clearInterval(timer);
  }, []);

  const allOpps: any[] = (data?.pages ?? []).flatMap((p: any) => p.data ?? []);

  useEffect(() => {
    if (!firstIdRef.current && allOpps.length > 0) firstIdRef.current = allOpps[0]?.id ?? null;
  }, [allOpps]);

  const sorted = [...allOpps].sort((a, b) => {
    if (activeChip === "discount" || activeChip === "urgent") {
      const da = (Number(a.priceNormal) - Number(a.priceUrgent)) / Number(a.priceNormal);
      const db = (Number(b.priceNormal) - Number(b.priceUrgent)) / Number(b.priceNormal);
      return db - da;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleRefresh = () => { firstIdRef.current = null; setNewBanner(false); refetch(); };

  const handleChip = (chip: SortChip) => {
    setActiveChip(chip);
    if (chip === "region") setShowRegion(v => !v);
    else setShowRegion(false);
  };

  const handleStatusAction = (id: string, status: string, label: string) => {
    setPendingAction({ id, status, label });
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    statusMutation.mutate({ id: pendingAction.id, status: pendingAction.status });
    setPendingAction(null);
  };

  const total = data?.pages?.[0]?.total ?? 0;

  return (
    <div>
      <style>{`
        @keyframes slide-down {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .banner-animate { animation: slide-down 0.35s ease forwards; }
      `}</style>

      {showModal && <NewOpportunityModal onClose={() => setShowModal(false)} />}

      {pendingAction && (
        <ConfirmModal
          title={CONFIRM_CONFIG[pendingAction.status as keyof typeof CONFIRM_CONFIG]?.title ?? "Confirmar ação"}
          body={CONFIRM_CONFIG[pendingAction.status as keyof typeof CONFIRM_CONFIG]?.body ?? ""}
          confirmLabel={CONFIRM_CONFIG[pendingAction.status as keyof typeof CONFIRM_CONFIG]?.btn ?? "Confirmar"}
          confirmClass={CONFIRM_CONFIG[pendingAction.status as keyof typeof CONFIRM_CONFIG]?.cls ?? "bg-gray-600 hover:bg-gray-700"}
          onConfirm={confirmAction}
          onClose={() => setPendingAction(null)}
        />
      )}

      <Header title="Radar de Oportunidades" />

      <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">

        {/* Feed header */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">🔥 Radar de Oportunidades</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Oportunidades urgentes publicadas por corretores da rede</p>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600 gap-1.5 text-sm flex-shrink-0">
              <Plus className="h-4 w-4" /> Publicar
            </Button>
          </div>
          {total > 0 && (
            <p className="text-xs text-muted-foreground/60 mt-2">{total} oportunidade{total !== 1 ? "s" : ""} no radar</p>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CHIPS.map(chip => (
            <button key={chip.key} onClick={() => handleChip(chip.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeChip === chip.key
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-transparent text-muted-foreground border-border hover:border-orange-500/50 hover:text-orange-300"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Region filter */}
        {showRegion && (
          <div className="bg-card border border-border rounded-xl p-3 mb-4 flex gap-2 items-center">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input autoFocus value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              placeholder="Filtrar por cidade..."
              className="flex-1 text-sm bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
            {cityFilter && (
              <button onClick={() => setCityFilter("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* New items banner */}
        {newBanner && (
          <button onClick={handleRefresh}
            className="banner-animate w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-md hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Nova oportunidade adicionada — atualizar feed
          </button>
        )}

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: "rgba(249,115,22,0.1)" }}>
              <Zap className="h-6 w-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma oportunidade no radar</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {cityFilter ? `Sem oportunidades em "${cityFilter}" agora.` : "Seja o primeiro a publicar."}
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowModal(true)}>
              <Flame className="h-4 w-4 mr-2" /> Publicar Oportunidade
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sorted.map((opp, i) => (
                <OpportunityCard
                  key={opp.id} opp={opp} index={i}
                  currentUserId={user?.id}
                  onStatusAction={handleStatusAction}
                />
              ))}
            </div>
            <div ref={sentinelRef} className="h-8 mt-2" />
            {isFetchingNextPage && (
              <div className="space-y-4 mt-4"><CardSkeleton /><CardSkeleton /></div>
            )}
            {!hasNextPage && sorted.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-8">
                Você viu todas as {sorted.length} oportunidades do radar 🎯
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Confirm config ───────────────────────────────────────────────────────────

const CONFIRM_CONFIG = {
  paused: {
    title:        "Retirar do radar?",
    body:         "Ela deixará de aparecer para outros corretores, mas continuará salva no seu histórico.",
    btn:          "Retirar do radar",
    cls:          "bg-amber-500 hover:bg-amber-600",
    successLabel: "Oportunidade retirada do radar",
  },
  closed: {
    title:        "Marcar como fechada?",
    body:         "Essa oportunidade será removida do radar público e registrada como negócio concluído. Parabéns!",
    btn:          "Marcar como fechada",
    cls:          "bg-emerald-600 hover:bg-emerald-700",
    successLabel: "Negócio registrado como fechado 🎉",
  },
  removed: {
    title:        "Remover oportunidade?",
    body:         "A oportunidade será removida permanentemente do radar. Essa ação não pode ser desfeita.",
    btn:          "Remover",
    cls:          "bg-red-600 hover:bg-red-700",
    successLabel: "Oportunidade removida",
  },
};
