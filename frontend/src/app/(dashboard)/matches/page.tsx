"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { Zap, RefreshCw, ArrowRight, User, Home, Phone, ChevronDown, Users, Lock } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import Link from "next/link";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "PENDING",     label: "Pendente",       color: "bg-gray-100 text-gray-600",    dot: "bg-gray-400",    border: "" },
  { value: "CONTACTED",   label: "Contactado",     color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500",    border: "border-l-blue-400" },
  { value: "VISITED",     label: "Visitado",       color: "bg-indigo-100 text-indigo-700",dot: "bg-indigo-500",  border: "border-l-indigo-400" },
  { value: "NEGOTIATING", label: "Em Negociação",  color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500",   border: "border-l-amber-400" },
  { value: "CLOSED",      label: "Fechado",        color: "bg-green-100 text-green-700",  dot: "bg-green-500",   border: "border-l-green-400" },
  { value: "REJECTED",    label: "Rejeitado",      color: "bg-red-100 text-red-600",      dot: "bg-red-400",     border: "border-l-red-300" },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-orange-500";
  const textColor = score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-orange-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{score}%</span>
    </div>
  );
}

function StatusBadge({
  status,
  matchId,
  onUpdate,
}: {
  status: string;
  matchId: string;
  onUpdate: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.PENDING;

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
          <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[170px]">
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Atualizar progresso
            </p>
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => { onUpdate(matchId, s.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${status === s.value ? "font-semibold" : ""}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                {s.label}
                {status === s.value && <span className="ml-auto text-xs text-gray-400">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Partnership proposal form (inline) ───────────────────────────────────────
function PartnershipForm({
  propertyId,
  receiverId,
  receiverName,
  onClose,
}: {
  propertyId: string;
  receiverId: string;
  receiverName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [commission, setCommission] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.post("/partnerships", {
        propertyId,
        receiverId,
        ...(commission ? { commissionSplit: Number(commission) } : {}),
        ...(message ? { message } : {}),
      }),
    onSuccess: () => {
      toast.success("Proposta de parceria enviada!");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Erro ao enviar proposta");
    },
  });

  return (
    <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-xl space-y-2">
      <p className="text-xs font-medium text-violet-800">Proposta para <strong>{receiverName}</strong></p>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            placeholder="Sua % de comissão (ex: 50)"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            min={1}
            max={99}
            className="w-full text-xs rounded-lg border border-violet-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
          />
        </div>
      </div>
      <textarea
        placeholder="Mensagem para o corretor (opcional)..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full text-xs rounded-lg border border-violet-200 px-3 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-violet-400"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 text-xs h-7 px-3"
        >
          {mutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
          Enviar proposta
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose} className="text-xs h-7 px-3">
          Cancelar
        </Button>
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
  const [partnershipOpen, setPartnershipOpen] = useState<string | null>(null);

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
      toast.success(`${data.data.count} matches gerados!`);
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
      <Header title="Matches" />
      <div className="p-6 space-y-6">

        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pipeline de Matches</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Acompanhe cada oportunidade do primeiro contato até o fechamento
            </p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 gap-2 flex-shrink-0"
          >
            {generateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Gerar Matches
          </Button>
        </div>

        {/* Pipeline explanation banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">Como funciona o pipeline?</p>
          <p className="text-blue-700 text-xs leading-relaxed">
            Cada match representa uma oportunidade. Avance o status conforme você evolui com o cliente:
            <span className="font-medium"> Pendente → Contactado → Visitado → Em Negociação → Fechado</span>.
            Matches com <span className="font-medium text-violet-700">Oportunidade de parceria</span> cruzam seus compradores com imóveis de outros corretores — ou vice-versa.
            Proponha uma parceria para dividir a comissão e fechar o negócio juntos.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterStatus === "" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Todos
            {totalAll > 0 && (
              <span className="bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px]">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filterStatus === s.value ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filterStatus === s.value ? s.color : "bg-gray-200 text-gray-600"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Best Matches Highlight */}
        {!filterStatus && bestMatches?.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5" />
              <h3 className="font-semibold">Melhores Matches (Score ≥ 70%)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bestMatches.slice(0, 3).map((m: any) => (
                <div key={m.id} className="bg-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{m.buyer?.buyerName}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">{m.score}%</span>
                  </div>
                  <p className="text-xs text-blue-100 line-clamp-1">{m.property?.title}</p>
                  <div className="flex justify-between text-xs text-blue-200 mt-2">
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
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : matches?.data?.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filterStatus ? `Nenhum match "${STATUS_MAP[filterStatus]?.label}"` : "Nenhum match ainda"}
            </h3>
            {!filterStatus && (
              <>
                <p className="text-gray-500 mb-2">
                  O sistema cruza <strong>seus compradores</strong> com todos os imóveis disponíveis da plataforma.
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Certifique-se de ter compradores e imóveis cadastrados, depois clique em "Gerar Matches".
                </p>
                <Button onClick={() => generateMutation.mutate()} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Zap className="h-4 w-4" /> Gerar Matches Agora
                </Button>
              </>
            )}
            {filterStatus && (
              <p className="text-gray-400 text-sm">
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
              const isClosed = m.status === "CLOSED";

              // Quem é o outro corretor nesse match cruzado
              const otherAgentId = m.buyer?.agent?.id === myId ? m.property?.agentId : m.buyer?.agent?.id;
              const otherAgentName = m.buyer?.agent?.id === myId ? m.property?.agent?.name : m.buyer?.agent?.name;
              const isPartnershipFormOpen = partnershipOpen === m.id;

              // Contatos do comprador: só visíveis se o comprador é meu
              const buyerPhone = m.buyer?.agent?.id === myId ? m.buyer?.phone : null;

              return (
                <Card
                  key={m.id}
                  className={`transition-shadow border-l-4 ${statusCfg.border || "border-l-gray-200"} ${
                    isRejected ? "opacity-50" : "hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-5">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isSameAgent ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            <User className="h-3 w-3" /> Seu comprador · Seu imóvel
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                            <ArrowRight className="h-3 w-3" /> Oportunidade de parceria
                          </span>
                        )}
                        {isClosed && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            🎉 Negócio fechado!
                          </span>
                        )}
                      </div>
                      <StatusBadge
                        status={m.status}
                        matchId={m.id}
                        onUpdate={(id, status) => updateStatusMutation.mutate({ id, status })}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Comprador */}
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{m.buyer?.buyerName}</p>
                          <p className="text-xs text-gray-500">
                            {PROPERTY_TYPE_LABELS[m.buyer?.propertyType]} • {m.buyer?.desiredCity}
                          </p>
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            Até {formatCurrency(m.buyer?.maxPrice)}
                          </p>
                          {!isSameAgent && m.buyer?.agent && (
                            <p className="text-xs text-gray-400 mt-1">Corretor: {m.buyer.agent.name}</p>
                          )}
                          {/* Contatos bloqueados para compradores de outros corretores */}
                          {!isSameAgent && (
                            <p className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1.5 bg-white border border-gray-200 px-2 py-0.5 rounded">
                              <Lock className="h-3 w-3" /> Contatos visíveis após parceria
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Imóvel */}
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Home className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/imovel/${m.property?.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                          >
                            {m.property?.title}
                          </Link>
                          <p className="text-xs text-gray-500">{m.property?.city}</p>
                          <p className="text-sm font-medium text-green-600 mt-1">
                            {formatCurrency(m.property?.price)}
                          </p>
                          {!isSameAgent && m.property?.agent && (
                            <p className="text-xs text-gray-400 mt-1">Corretor: {m.property.agent.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Compatibilidade</p>
                        <ScoreBar score={m.score} />
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Match próprio: botão WhatsApp se tiver telefone */}
                        {isSameAgent && buyerPhone && (
                          <a
                            href={getWhatsAppLink(
                              buyerPhone,
                              `Olá ${m.buyer.buyerName}, tenho um imóvel que pode ser do seu interesse!`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                          >
                            <Phone className="h-3 w-3" /> WhatsApp
                          </a>
                        )}

                        {/* Match cruzado: botão propor parceria */}
                        {!isSameAgent && otherAgentId && (
                          <button
                            onClick={() =>
                              setPartnershipOpen(isPartnershipFormOpen ? null : m.id)
                            }
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                              isPartnershipFormOpen
                                ? "bg-violet-100 text-violet-700"
                                : "bg-violet-600 text-white hover:bg-violet-700"
                            }`}
                          >
                            <Users className="h-3.5 w-3.5" />
                            {isPartnershipFormOpen ? "Fechar" : "Propor Parceria"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline partnership form */}
                    {!isSameAgent && isPartnershipFormOpen && otherAgentId && (
                      <PartnershipForm
                        propertyId={m.property?.id}
                        receiverId={otherAgentId}
                        receiverName={otherAgentName ?? "corretor"}
                        onClose={() => setPartnershipOpen(null)}
                      />
                    )}
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
