"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { Zap, RefreshCw, ArrowRight, User, Home, Phone, ChevronDown, Users, Lock, X } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { showPointsToast } from "@/lib/points-toast";
import Link from "next/link";

// ─── Status config — dark premium palette ─────────────────────────────────────
const STATUSES = [
  { value: "PENDING",     label: "Pendente",       color: "bg-white/10 text-slate-400",         dot: "bg-slate-400",    border: "border-l-slate-500/50" },
  { value: "CONTACTED",   label: "Contactado",     color: "bg-blue-500/15 text-blue-300",        dot: "bg-blue-400",     border: "border-l-blue-400/60" },
  { value: "VISITED",     label: "Visitado",       color: "bg-indigo-500/15 text-indigo-300",    dot: "bg-indigo-400",   border: "border-l-indigo-400/60" },
  { value: "NEGOTIATING", label: "Em Negociação",  color: "bg-amber-500/15 text-amber-300",      dot: "bg-amber-400",    border: "border-l-amber-400/60" },
  { value: "CLOSED",      label: "Fechado",        color: "bg-emerald-500/15 text-emerald-300",  dot: "bg-emerald-400",  border: "border-l-emerald-400/60" },
  { value: "REJECTED",    label: "Rejeitado",      color: "bg-red-500/15 text-red-300",          dot: "bg-red-400",      border: "border-l-red-400/40" },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const display = Math.min(score, 100);
  const color = display >= 70 ? "bg-emerald-400" : display >= 50 ? "bg-amber-400" : "bg-orange-400";
  const textColor = display >= 70 ? "text-emerald-400" : display >= 50 ? "text-amber-400" : "text-orange-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${display}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{display}%</span>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({
  status, matchId, onUpdate, editable = true,
}: {
  status: string; matchId: string;
  onUpdate: (id: string, status: string) => void; editable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.PENDING;

  if (!editable) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} opacity-70`}
        title="Disponível após aceite da parceria">
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <Lock className="h-3 w-3" />
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${cfg.color} hover:opacity-80`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-1 rounded-xl shadow-2xl z-20 overflow-hidden min-w-[170px] border"
            style={{ background: "rgba(8,14,31,0.97)", borderColor: "rgba(255,255,255,0.12)" }}>
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
              Atualizar progresso
            </p>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => { onUpdate(matchId, s.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition hover:bg-white/[0.07] ${status === s.value ? "font-semibold text-white" : "text-white/60"}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                {s.label}
                {status === s.value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Partnership modal ─────────────────────────────────────────────────────────
type PartnershipTarget = {
  matchId: string; buyerId: string; propertyId: string;
  receiverId: string; receiverName: string;
};

function PartnershipModal({ target, onClose }: { target: PartnershipTarget; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [commission, setCommission] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.post("/partnerships", {
        buyerId: target.buyerId, propertyId: target.propertyId, receiverId: target.receiverId,
        ...(commission ? { commissionSplit: Number(commission) } : {}),
        ...(message ? { message } : {}),
      }),
    onSuccess: () => {
      toast.success("Proposta de parceria enviada!");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Erro ao enviar proposta");
    },
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Propor Parceria</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Para: <strong className="text-foreground/80">{target.receiverName}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">
              Sua % de comissão (opcional)
            </label>
            <div className="relative">
              <input
                type="number" placeholder="Ex: 50" value={commission}
                onChange={(e) => setCommission(e.target.value)} min={1} max={99}
                className="w-full rounded-lg border border-border bg-muted/60 px-3 py-2 pr-8
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
            {commission && Number(commission) > 0 && Number(commission) < 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                Você: {commission}% · {target.receiverName}: {100 - Number(commission)}%
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 block mb-1.5">
              Mensagem (opcional)
            </label>
            <textarea
              placeholder="Apresente-se e explique a proposta..."
              value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              className="w-full rounded-lg border border-border bg-muted/60 px-3 py-2 resize-none
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 bg-violet-600 hover:bg-violet-500 gap-2"
            >
              {mutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Enviar proposta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const myId = user?.id;
  const [filterStatus, setFilterStatus] = useState("");
  const [partnershipTarget, setPartnershipTarget] = useState<PartnershipTarget | null>(null);

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", filterStatus],
    queryFn: () =>
      api.get("/matches", { params: filterStatus ? { status: filterStatus } : {} }).then((r) => r.data),
  });

  const { data: allMatches } = useQuery({
    queryKey: ["matches", ""],
    queryFn: () => api.get("/matches").then((r) => r.data),
  });

  const { data: bestMatches } = useQuery({
    queryKey: ["best-matches"],
    queryFn: () => api.get("/matches/best").then((r) => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post("/matches/generate"),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["best-matches"] });
    },
    onError: () => toast.error("Erro ao gerar matches"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/matches/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      const label = STATUS_MAP[status]?.label ?? status;
      toast.success(`Progresso atualizado para "${label}"`);
      if (status === "CLOSED") {
        showPointsToast(50, "Negócio fechado!");
        queryClient.invalidateQueries({ queryKey: ["ranking"] });
      }
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const countByStatus = (allMatches?.data ?? []).reduce((acc: Record<string, number>, m: any) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalAll = allMatches?.total ?? 0;

  return (
    <div>
      {partnershipTarget && (
        <PartnershipModal target={partnershipTarget} onClose={() => setPartnershipTarget(null)} />
      )}

      <Header title="Matches" />
      <div className="p-4 md:p-6 space-y-6">

        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pipeline de Matches</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acompanhe cada oportunidade do primeiro contato até o fechamento
            </p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="gap-2 flex-shrink-0"
          >
            {generateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Gerar Matches
          </Button>
        </div>

        {/* Pipeline info banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
          <p className="font-medium mb-1 text-blue-200">Como funciona o pipeline?</p>
          <p className="text-blue-300/80 text-xs leading-relaxed">
            Cada match representa uma oportunidade. Avance o status conforme você evolui com o cliente:
            <span className="font-medium text-blue-200"> Pendente → Contactado → Visitado → Em Negociação → Fechado</span>.
            Matches com <span className="font-medium text-violet-300">Oportunidade de parceria</span> cruzam seus compradores
            com imóveis de outros corretores — ou vice-versa.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="tab-bar">
          <button
            onClick={() => setFilterStatus("")}
            className={`tab-item ${filterStatus === "" ? "tab-item-active" : "tab-item-inactive"}`}
          >
            Todos
            {totalAll > 0 && (
              <span className="ml-1.5 bg-white/10 text-slate-400 rounded-full px-1.5 py-0.5 text-[10px]">
                {totalAll}
              </span>
            )}
          </button>
          {STATUSES.map((s) => {
            const count = countByStatus[s.value] ?? 0;
            if (count === 0 && filterStatus !== s.value) return null;
            return (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`tab-item flex items-center gap-1.5 ${filterStatus === s.value ? "tab-item-active" : "tab-item-inactive"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    filterStatus === s.value ? s.color : "bg-white/10 text-slate-400"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Best Matches Highlight */}
        {!filterStatus && bestMatches?.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 border border-border rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-300" />
              <h3 className="font-semibold">Melhores Matches (Score ≥ 70%)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bestMatches.slice(0, 3).map((m: any) => (
                <div key={m.id} className="bg-white/10 rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{m.buyer?.buyerName}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {Math.min(m.score, 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-1">{m.property?.title}</p>
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>Busca: {formatCurrency(m.buyer?.maxPrice)}</span>
                    <span>Imóvel: {formatCurrency(m.property?.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : matches?.data?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filterStatus ? `Nenhum match "${STATUS_MAP[filterStatus]?.label}"` : "Nenhum match ainda"}
            </h3>
            {!filterStatus && (
              <>
                <p className="text-muted-foreground mb-2 max-w-sm">
                  O sistema cruza <strong className="text-foreground/80">seus compradores</strong> com todos os imóveis disponíveis da plataforma.
                </p>
                <p className="text-muted-foreground/70 text-sm mb-6">
                  Certifique-se de ter compradores e imóveis cadastrados, depois clique em "Gerar Matches".
                </p>
                <Button onClick={() => generateMutation.mutate()} className="gap-2">
                  <Zap className="h-4 w-4" /> Gerar Matches Agora
                </Button>
              </>
            )}
            {filterStatus && (
              <p className="text-muted-foreground/70 text-sm">
                Avance o status de outros matches para "{STATUS_MAP[filterStatus]?.label}" e eles aparecerão aqui.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {matches.data.map((m: any) => {
              const isSameAgent = m.buyer?.agent?.id === m.property?.agentId;
              const statusCfg = STATUS_MAP[m.status] ?? STATUS_MAP.PENDING;
              const isRejected = m.status === "REJECTED";
              const isClosed   = m.status === "CLOSED";

              const otherAgentId   = m.buyer?.agent?.id === myId ? m.property?.agentId    : m.buyer?.agent?.id;
              const otherAgentName = m.buyer?.agent?.id === myId ? m.property?.agent?.name : m.buyer?.agent?.name;

              const partnershipStatus   = m.partnership?.status ?? null;
              const partnershipExists   = !!m.partnership;
              const partnershipAccepted = partnershipStatus === "ACCEPTED";
              const buyerPhone          = m.buyer?.phone ?? null;

              return (
                <Card
                  key={m.id}
                  className={`transition-all border-l-4 ${statusCfg.border || "border-l-border"} ${
                    isRejected ? "opacity-50" : "hover:border-border"
                  }`}
                >
                  <CardContent className="p-5">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isSameAgent ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-500/20">
                            <User className="h-3 w-3" /> Seu comprador · Seu imóvel
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full font-medium border border-violet-500/20">
                            <ArrowRight className="h-3 w-3" /> Oportunidade de parceria
                          </span>
                        )}
                        {isClosed && (
                          <span className="text-xs bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">
                            🎉 Negócio fechado!
                          </span>
                        )}
                      </div>
                      <StatusBadge
                        status={m.status} matchId={m.id}
                        onUpdate={(id, status) => updateStatusMutation.mutate({ id, status })}
                        editable={isSameAgent || partnershipAccepted}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Comprador */}
                      <div className="flex items-start gap-3 p-3 bg-blue-500/8 border border-blue-500/15 rounded-xl">
                        <div className="p-2 bg-blue-500/15 rounded-lg flex-shrink-0">
                          <User className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{m.buyer?.buyerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {PROPERTY_TYPE_LABELS[m.buyer?.propertyType]} • {m.buyer?.desiredCity}
                          </p>
                          <p className="text-sm font-medium text-blue-400 mt-1">
                            Até {formatCurrency(m.buyer?.maxPrice)}
                          </p>
                          {!isSameAgent && m.buyer?.agent && (
                            <p className="text-xs text-muted-foreground/70 mt-1">Corretor: {m.buyer.agent.name}</p>
                          )}
                          {!isSameAgent && partnershipAccepted && buyerPhone && (
                            <a
                              href={getWhatsAppLink(buyerPhone, `Olá ${m.buyer.buyerName}, tenho um imóvel que pode ser do seu interesse!`)}
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-emerald-600/90 text-white px-2 py-0.5 rounded mt-1.5 hover:bg-emerald-500 transition"
                            >
                              <Phone className="h-3 w-3" /> {buyerPhone}
                            </a>
                          )}
                          {!isSameAgent && !partnershipAccepted && (
                            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1.5 bg-white/5 border border-border px-2 py-0.5 rounded">
                              <Lock className="h-3 w-3" /> Contatos visíveis após parceria
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Imóvel */}
                      <div className="flex items-start gap-3 p-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
                        <div className="p-2 bg-emerald-500/15 rounded-lg flex-shrink-0">
                          <Home className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/imovel/${m.property?.id}`}
                            className="font-semibold text-foreground hover:text-primary line-clamp-1"
                          >
                            {m.property?.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{m.property?.city}</p>
                          <p className="text-sm font-medium text-emerald-400 mt-1">
                            {formatCurrency(m.property?.price)}
                          </p>
                          {!isSameAgent && m.property?.agent && (
                            <p className="text-xs text-muted-foreground/70 mt-1">Corretor: {m.property.agent.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground/70 mb-1">Compatibilidade</p>
                        <ScoreBar score={m.score} />
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isSameAgent && buyerPhone && (
                          <a
                            href={getWhatsAppLink(buyerPhone, `Olá ${m.buyer.buyerName}, tenho um imóvel que pode ser do seu interesse!`)}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs bg-emerald-600/90 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition"
                          >
                            <Phone className="h-3 w-3" /> WhatsApp
                          </a>
                        )}

                        {!isSameAgent && otherAgentId && partnershipExists && (
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium cursor-default ${
                            partnershipAccepted
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                              : "bg-white/10 text-slate-400 border border-border"
                          }`}>
                            <Users className="h-3.5 w-3.5" />
                            {partnershipAccepted ? "Parceria Aceita" : "Proposta Enviada"}
                          </span>
                        )}

                        {!isSameAgent && otherAgentId && !partnershipExists && (
                          <button
                            onClick={() =>
                              setPartnershipTarget({
                                matchId: m.id, buyerId: m.buyer?.id, propertyId: m.property?.id,
                                receiverId: otherAgentId, receiverName: otherAgentName ?? "corretor",
                              })
                            }
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium bg-violet-600/90 text-white hover:bg-violet-500"
                          >
                            <Users className="h-3.5 w-3.5" /> Propor Parceria
                          </button>
                        )}

                        {m.status === "PENDING" && !partnershipExists && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: m.id, status: "REJECTED" })}
                            title="Descartar match"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
