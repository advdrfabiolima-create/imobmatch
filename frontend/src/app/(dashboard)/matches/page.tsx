"use client";

import { useState, useEffect } from "react";
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

// ─── Match Animation ──────────────────────────────────────────────────────────
function MatchAnimation({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3300);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(8,6,26,0.80)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes mPopIn {
          0%   { transform:scale(0.05); opacity:0; }
          55%  { transform:scale(1.15); opacity:1; }
          72%  { transform:scale(0.93); }
          88%  { transform:scale(1.05); }
          100% { transform:scale(1); opacity:1; }
        }
        @keyframes mFloat {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-8px); }
        }
        @keyframes mRing {
          0%   { transform:scale(0.1); opacity:1; }
          100% { transform:scale(3.6); opacity:0; }
        }
        @keyframes mBurst {
          0%   { transform:scale(0.15); opacity:0.85; }
          100% { transform:scale(3.2); opacity:0; }
        }
        @keyframes mConfetti {
          0%   { opacity:1; transform:translate(0,0) rotate(0deg) scale(1); }
          100% { opacity:0; transform:var(--mend); }
        }
        @keyframes mSparkle {
          0%,100% { opacity:0; transform:scale(0.3); }
          50%      { opacity:1; transform:scale(1.3); }
        }
        @keyframes mFadeUp {
          0%   { opacity:0; transform:translateY(10px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes mShimmer {
          0%,100% { opacity:0.2; }
          50%      { opacity:0.55; }
        }
      `}</style>

      <MatchStars />
      <MatchConfetti />

      {/* Anéis de onda */}
      {[
        { delay: "0s",    border: "3px solid #AFA9EC" },
        { delay: "0.1s",  border: "2px solid #7F77DD" },
        { delay: "0.2s",  border: "1.5px solid rgba(83,74,183,0.55)" },
      ].map((r, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 300, height: 300,
          border: r.border,
          borderRadius: "50%",
          animation: `mRing 0.75s cubic-bezier(0.22,1,0.36,1) ${r.delay} forwards`,
        }} />
      ))}

      {/* Burst de raios */}
      <div style={{
        position: "absolute",
        width: 300, height: 300,
        animation: "mBurst 0.65s ease-out forwards",
      }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <polygon fill="#7F77DD" opacity="0.25"
            points="100,2 112,38 132,12 126,50 156,30 140,64 176,58 150,84 182,92 150,106 176,122 142,120 154,156 124,140 120,176 100,156 80,176 76,140 46,156 58,120 24,122 50,106 18,92 50,84 24,58 60,64 44,30 74,50 68,12 88,38"
          />
        </svg>
      </div>

      {/* Estrelinhas decorativas */}
      {[
        { top: "calc(50% - 145px)", left: "calc(50% - 145px)", size: 20, color: "#FAC775", delay: "0.32s" },
        { top: "calc(50% - 140px)", left: "calc(50% + 118px)", size: 16, color: "#fff",    delay: "0.44s" },
        { top: "calc(50% + 118px)", left: "calc(50% - 140px)", size: 18, color: "#FAC775", delay: "0.38s" },
        { top: "calc(50% + 112px)", left: "calc(50% + 110px)", size: 14, color: "#AFA9EC", delay: "0.50s" },
        { top: "calc(50% - 20px)",  left: "calc(50% - 158px)", size: 13, color: "#5DCAA5", delay: "0.56s" },
        { top: "calc(50% - 20px)",  left: "calc(50% + 132px)", size: 15, color: "#F4C0D1", delay: "0.42s" },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          animation: `mSparkle 0.65s ease ${s.delay} infinite`,
        }}>
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path fill={s.color} d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
          </svg>
        </div>
      ))}

      {/* Blob principal */}
      <div style={{
        position: "absolute",
        width: 260, height: 260,
        animation: "mPopIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="matchBlobGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#9088E8"/>
              <stop offset="100%" stopColor="#3C3489"/>
            </radialGradient>
          </defs>
          <path fill="url(#matchBlobGrad)"
            d="M 40,26 C 58,4 104,2 136,19 C 172,38 190,70 186,108 C 182,148 156,174 116,183 C 74,193 36,176 18,148 C 0,118 2,74 14,50 C 20,38 30,32 40,26 Z"
          />
          <path fill="rgba(255,255,255,0.07)"
            d="M 46,26 C 64,10 104,5 128,17 C 154,30 164,56 154,78 C 144,100 116,106 94,98 C 72,90 48,70 44,50 C 42,38 38,34 46,26 Z"
          />
        </svg>

        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 0,
        }}>
          {/* Ícone imóvel */}
          <div style={{ animation: "mFadeUp 0.38s ease 0.38s both" }}>
            <svg width="54" height="54" viewBox="0 0 64 64"
              style={{ display: "block", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>
              <polygon points="32,7 8,30 56,30"
                fill="rgba(255,255,255,0.1)"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect x="11" y="30" width="42" height="26" rx="2"
                fill="rgba(255,255,255,0.08)"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="2"
              />
              <rect x="24" y="38" width="16" height="18" rx="3" fill="rgba(255,255,255,0.92)"/>
              <circle cx="37.5" cy="47" r="2" fill="#534AB7"/>
              <rect x="14" y="33" width="10" height="9" rx="2" fill="rgba(255,255,255,0.55)"/>
              <rect x="40" y="33" width="10" height="9" rx="2" fill="rgba(255,255,255,0.55)"/>
            </svg>
          </div>
          {/* Texto */}
          <div style={{
            fontSize: 27, fontWeight: 800, color: "#fff",
            whiteSpace: "nowrap", letterSpacing: "-0.3px",
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            marginTop: 6,
            animation: "mFadeUp 0.32s ease 0.54s both",
          }}>
            Deu Match!
          </div>
          <div style={{
            fontSize: 11, color: "rgba(255,255,255,0.75)",
            fontWeight: 500, marginTop: 3,
            animation: "mFadeUp 0.32s ease 0.66s both",
          }}>
            Compatibilidade ≥ 70%
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchStars() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 48 }).map((_, i) => {
        const size = 1 + Math.random() * 2;
        return (
          <div key={i} style={{
            position: "absolute",
            borderRadius: "50%",
            background: `rgba(255,255,255,${0.15 + Math.random() * 0.4})`,
            width: size, height: size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `mShimmer ${1.5 + Math.random() * 2.5}s ease-in-out ${Math.random() * 2}s infinite`,
          }} />
        );
      })}
    </div>
  );
}

function MatchConfetti() {
  const colors = ["#AFA9EC","#FAC775","#5DCAA5","#F4C0D1","#fff","#7F77DD","#EEEDFE","#EF9F27","#9088E8"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 52 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist  = 80 + Math.random() * 130;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const rot = (Math.random() * 900 - 450) + "deg";
        const size = 5 + Math.random() * 9;
        const delay = Math.random() * 0.2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const isCircle = Math.random() > 0.45;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `calc(50% - ${size / 2}px)`,
            top: `calc(50% - ${size / 2}px)`,
            width: size, height: size,
            background: color,
            borderRadius: isCircle ? "50%" : "3px",
            ["--mend" as any]: `translate(${tx}px,${ty}px) rotate(${rot}) scale(0)`,
            animation: `mConfetti ${0.6 + Math.random() * 0.7}s cubic-bezier(0.22,1,0.36,1) ${delay}s forwards`,
          }} />
        );
      })}
    </div>
  );
}

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

// ─── Partnership modal ─────────────────────────────────────────────────────────
type PartnershipTarget = {
  matchId: string;
  buyerId: string;
  propertyId: string;
  receiverId: string;
  receiverName: string;
};

function PartnershipModal({
  target,
  onClose,
}: {
  target: PartnershipTarget;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [commission, setCommission] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.post("/partnerships", {
        buyerId: target.buyerId,
        propertyId: target.propertyId,
        receiverId: target.receiverId,
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Propor Parceria</h2>
            <p className="text-xs text-gray-500 mt-0.5">Para: <strong>{target.receiverName}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Sua % de comissão (opcional)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Ex: 50"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                min={1}
                max={99}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            {commission && Number(commission) > 0 && Number(commission) < 100 && (
              <p className="text-xs text-gray-400 mt-1">
                Você: {commission}% · {target.receiverName}: {100 - Number(commission)}%
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Mensagem (opcional)
            </label>
            <textarea
              placeholder="Apresente-se e explique a proposta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2"
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
  const [showMatchAnim, setShowMatchAnim] = useState(false);

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
      if (data.data.newMatches > 0) {
        setShowMatchAnim(true);
      }
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
      {showMatchAnim && <MatchAnimation onDone={() => setShowMatchAnim(false)} />}

      {/* Partnership modal — rendered at page root, completely isolated from match cards */}
      {partnershipTarget && (
        <PartnershipModal
          target={partnershipTarget}
          onClose={() => setPartnershipTarget(null)}
        />
      )}

      <Header title="Matches" />
      <div className="p-4 md:p-6 space-y-6">

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
              const isClosed   = m.status === "CLOSED";

              const otherAgentId   = m.buyer?.agent?.id === myId ? m.property?.agentId    : m.buyer?.agent?.id;
              const otherAgentName = m.buyer?.agent?.id === myId ? m.property?.agent?.name : m.buyer?.agent?.name;

              const partnershipStatus   = m.partnership?.status ?? null;
              const partnershipExists   = !!m.partnership;
              const partnershipAccepted = partnershipStatus === "ACCEPTED";

              const buyerPhone = m.buyer?.phone ?? null;

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
                          {!isSameAgent && partnershipAccepted && buyerPhone && (
                            <a
                              href={getWhatsAppLink(buyerPhone, `Olá ${m.buyer.buyerName}, tenho um imóvel que pode ser do seu interesse!`)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded mt-1.5 hover:bg-green-700 transition"
                            >
                              <Phone className="h-3 w-3" /> {buyerPhone}
                            </a>
                          )}
                          {!isSameAgent && !partnershipAccepted && (
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
                        {isSameAgent && buyerPhone && (
                          <a
                            href={getWhatsAppLink(buyerPhone, `Olá ${m.buyer.buyerName}, tenho um imóvel que pode ser do seu interesse!`)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                          >
                            <Phone className="h-3 w-3" /> WhatsApp
                          </a>
                        )}

                        {!isSameAgent && otherAgentId && partnershipExists && (
                          <span
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium cursor-default ${
                              partnershipAccepted
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Users className="h-3.5 w-3.5" />
                            {partnershipAccepted ? "Parceria Aceita" : "Proposta Enviada"}
                          </span>
                        )}

                        {!isSameAgent && otherAgentId && !partnershipExists && (
                          <button
                            onClick={() =>
                              setPartnershipTarget({
                                matchId: m.id,
                                buyerId: m.buyer?.id,
                                propertyId: m.property?.id,
                                receiverId: otherAgentId,
                                receiverName: otherAgentName ?? "corretor",
                              })
                            }
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium bg-violet-600 text-white hover:bg-violet-700"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Propor Parceria
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