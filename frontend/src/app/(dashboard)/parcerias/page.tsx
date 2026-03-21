"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  UserCheck, Check, X, Building2, FileText, User, AlertTriangle,
  Zap, Trophy, ChevronLeft, ChevronRight, Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import toast from "react-hot-toast";
import { showPointsToast } from "@/lib/points-toast";

const STATUS_COLORS: Record<string, any> = {
  PENDING:   "warning",
  ACCEPTED:  "success",
  REJECTED:  "destructive",
  CANCELLED: "secondary",
  CLOSED:    "success",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:   "Pendente",
  ACCEPTED:  "Aceita",
  REJECTED:  "Recusada",
  CANCELLED: "Cancelada",
  CLOSED:    "Negócio Fechado",
};

const SENT_PAGE_SIZE = 10;

// ─── Modal de encerramento (negócio NÃO fechado) ──────────────────────────────
function CloseDealModal({ partnership, onClose }: { partnership: any; onClose: () => void }) {
  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: (reason: "not_closed" | "buyer_quit") =>
      api.patch(`/partnerships/${partnership.id}/close`, { reason }),
    onSuccess: (_, reason) => {
      toast.success(
        reason === "buyer_quit"
          ? "Parceria encerrada e comprador inativado."
          : "Parceria encerrada. Comprador permanece ativo."
      );
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      onClose();
    },
    onError: () => toast.error("Erro ao encerrar parceria"),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">Negócio não fechado</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600">
            O imóvel <strong>{partnership.property?.title}</strong> não foi negociado.
            Como deseja prosseguir?
          </p>
          <button
            onClick={() => closeMutation.mutate("not_closed")}
            disabled={closeMutation.isPending}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
          >
            <p className="font-semibold text-gray-900 group-hover:text-amber-700">
              Venda não concluída — manter comprador ativo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              A parceria é encerrada, mas o comprador permanece ativo e pode fechar negócio em outro imóvel.
            </p>
          </button>
          <button
            onClick={() => closeMutation.mutate("buyer_quit")}
            disabled={closeMutation.isPending}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all group"
          >
            <p className="font-semibold text-gray-900 group-hover:text-red-700">Comprador desistiu</p>
            <p className="text-xs text-gray-500 mt-1">
              A parceria é encerrada, o comprador é inativado e os matches relacionados são arquivados.
            </p>
          </button>
          <p className="text-xs text-gray-400 text-center pt-1">
            O Termo de Parceria é preservado como registro histórico em ambos os casos.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Paginação simples ────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-gray-600">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "active",     label: "Parcerias Ativas"      },
  { key: "closed",     label: "Negócios Fechados"      },
  { key: "notclosed",  label: "Negócios não Fechados"  },
  { key: "sent",       label: "Minhas Solicitações"    },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ParceriasPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [closingPartnership, setClosingPartnership] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [sentPage, setSentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => api.get("/partnerships").then((r) => r.data),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/partnerships/${id}/respond`, { status }),
    onSuccess: (_, vars) => {
      if (vars.status === "ACCEPTED") {
        toast.success("Parceria aceita!");
        showPointsToast(10, "Parceria aceita!");
        queryClient.invalidateQueries({ queryKey: ["ranking"] });
      } else {
        toast.success("Parceria recusada");
      }
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/partnerships/${id}/cancel`),
    onSuccess: () => {
      toast.success("Parceria cancelada");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
    },
  });

  const closedMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/partnerships/${id}/close`, { reason: "deal_closed" }),
    onSuccess: () => {
      toast.success("Negócio fechado! +50 pts para ambos os corretores 🎉");
      showPointsToast(50, "Negócio fechado!");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
    },
    onError: () => toast.error("Erro ao registrar negócio fechado"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/partnerships/${id}`),
    onSuccess: () => {
      toast.success("Parceria removida");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
    },
    onError: () => toast.error("Erro ao remover parceria"),
  });

  const all     = data?.data ?? [];
  const pending = all.filter((p: any) => p.receiverId === user?.id && p.status === "PENDING");
  const active  = all.filter((p: any) => p.status === "ACCEPTED");
  const closed  = all.filter((p: any) => p.status === "CLOSED");
  const notclosed = all.filter((p: any) =>
    p.status === "CANCELLED" || p.status === "REJECTED"
  );
  const sent    = all.filter((p: any) => p.requesterId === user?.id);

  // Paginação de "Minhas Solicitações"
  const sentTotalPages = Math.ceil(sent.length / SENT_PAGE_SIZE);
  const sentSlice = sent.slice((sentPage - 1) * SENT_PAGE_SIZE, sentPage * SENT_PAGE_SIZE);

  const tabCounts: Record<TabKey, number> = {
    active:    active.length,
    closed:    closed.length,
    notclosed: notclosed.length,
    sent:      sent.length,
  };

  return (
    <div>
      {closingPartnership && (
        <CloseDealModal
          partnership={closingPartnership}
          onClose={() => setClosingPartnership(null)}
        />
      )}

      <Header title="Parcerias" />
      <div className="p-4 md:p-6 space-y-6">

        {/* Pendentes recebidas — sempre visíveis no topo */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Aguardando sua resposta ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((p: any) => (
                <Card key={p.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">{p.property?.title}</span>
                          <span className="text-blue-600 font-medium">{formatCurrency(p.property?.price)}</span>
                        </div>
                        {p.buyer && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span>Cliente: <strong>{p.buyer?.buyerName}</strong></span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">
                          Solicitado por <strong>{p.requester?.name}</strong> em {formatDate(p.createdAt)}
                        </p>
                        {p.message && (
                          <p className="text-sm text-gray-500 mt-2 bg-white p-2 rounded-lg italic">"{p.message}"</p>
                        )}
                        {p.commissionSplit && (
                          <p className="text-xs text-gray-500 mt-1">Comissão proposta: {p.commissionSplit}%</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() => respondMutation.mutate({ id: p.id, status: "ACCEPTED" })}
                        >
                          <Check className="h-4 w-4" /> Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                          onClick={() => respondMutation.mutate({ id: p.id, status: "REJECTED" })}
                        >
                          <X className="h-4 w-4" /> Recusar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Parcerias Ativas ── */}
        {activeTab === "active" && (
          active.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma parceria ativa no momento.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {active.map((p: any) => (
                <Card key={p.id} className="border-green-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{p.property?.title}</p>
                        <p className="text-blue-600 font-medium text-sm">{formatCurrency(p.property?.price)}</p>
                      </div>
                      <Badge variant="success">Ativa</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {p.buyer && (
                        <div className="flex items-center gap-1.5 py-1.5 px-2 bg-blue-50 rounded-lg mb-2">
                          <User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span>Cliente: <strong className="text-blue-800">{p.buyer?.buyerName}</strong></span>
                        </div>
                      )}
                      <p>Solicitante: {p.requester?.name}</p>
                      <p>Receptor: {p.receiver?.name}</p>
                      {p.commissionSplit && <p className="font-medium">Comissão: {p.commissionSplit}%</p>}
                    </div>
                    <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                      <Link href={`/termo/${p.id}`} target="_blank">
                        <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 w-full">
                          <FileText className="h-4 w-4" /> Ver Termo de Parceria
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        onClick={() => closedMutation.mutate(p.id)}
                        disabled={closedMutation.isPending}
                      >
                        <Trophy className="h-4 w-4" /> Negócio Fechado
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 w-full"
                        onClick={() => setClosingPartnership(p)}
                      >
                        <AlertTriangle className="h-4 w-4" /> Negócio não fechado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Negócios Fechados ── */}
        {activeTab === "closed" && (
          closed.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum negócio fechado ainda. Bora fechar o primeiro! 🚀</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {closed.map((p: any) => (
                <Card key={p.id} className="border-emerald-200 bg-emerald-50/40">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{p.property?.title}</p>
                        <p className="text-blue-600 font-medium text-sm">{formatCurrency(p.property?.price)}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                        💰 Fechado
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {p.buyer && (
                        <div className="flex items-center gap-1.5 py-1.5 px-2 bg-blue-50 rounded-lg mb-2">
                          <User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span>Cliente: <strong className="text-blue-800">{p.buyer?.buyerName}</strong></span>
                        </div>
                      )}
                      <p>Parceiros: {p.requester?.name} & {p.receiver?.name}</p>
                      {p.commissionSplit && <p className="font-medium">Comissão: {p.commissionSplit}%</p>}
                      <p className="text-xs text-gray-400">{formatDate(p.updatedAt)}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t flex gap-2">
                      <Link href={`/termo/${p.id}`} target="_blank" className="flex-1">
                        <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 w-full">
                          <FileText className="h-4 w-4" /> Ver Termo
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(p.id)}
                        disabled={deleteMutation.isPending}
                        title="Remover do histórico"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Negócios não Fechados ── */}
        {activeTab === "notclosed" && (
          notclosed.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <X className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma parceria encerrada sem negócio.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notclosed.map((p: any) => (
                <Card key={p.id} className="border-gray-200 opacity-80">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.property?.title}</p>
                      {p.buyer && <p className="text-xs text-gray-500 mt-0.5">Cliente: {p.buyer?.buyerName}</p>}
                      <p className="text-sm text-gray-500">
                        {p.requester?.name} & {p.receiver?.name} · {formatDate(p.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(p.id)}
                        disabled={deleteMutation.isPending}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Minhas Solicitações (com paginação) ── */}
        {activeTab === "sent" && (
          sent.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma solicitação enviada ainda.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {sentSlice.map((p: any) => (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{p.property?.title}</p>
                        {p.buyer && (
                          <p className="text-xs text-gray-500 mt-0.5">Cliente: {p.buyer?.buyerName}</p>
                        )}
                        <p className="text-sm text-gray-500">Para: {p.receiver?.name} · {formatDate(p.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                        {p.status === "PENDING" && (
                          <Button size="sm" variant="outline" onClick={() => cancelMutation.mutate(p.id)}>
                            Cancelar
                          </Button>
                        )}
                        {["REJECTED", "CANCELLED"].includes(p.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => deleteMutation.mutate(p.id)}
                            disabled={deleteMutation.isPending}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Pagination page={sentPage} totalPages={sentTotalPages} onChange={setSentPage} />
            </>
          )
        )}

        {!isLoading && all.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma parceria ainda</h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
              Explore os matches gerados e solicite parcerias com outros corretores para fechar negócios juntos.
            </p>
            <Link href="/matches">
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Zap className="h-4 w-4" /> Explorar Matches
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
