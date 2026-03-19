"use client";

/**
 * NotificationBell — sino com badge e dropdown de notificações
 *
 * Agrega dados de:
 *   - Parcerias pendentes (receiverId=eu, status=PENDING) → ação obrigatória
 *   - Parcerias aceitas (requesterId=eu, status=ACCEPTED) → boas notícias
 *   - Matches recentes do dashboard → informação
 *   - Oportunidades recentes → descoberta
 *
 * Usa localStorage para rastrear "último visto" e marcar como lido.
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, X, UserCheck, Zap, Flame, CheckCircle2, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";

// ─── tipos ────────────────────────────────────────────────────────────────────

type Notif = {
  id: string;
  type: "partnership_pending" | "partnership_accepted" | "match" | "opportunity";
  title: string;
  desc: string;
  href: string;
  time: string;
  urgent?: boolean;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60)    return "agora mesmo";
  if (d < 3600)  return `${Math.floor(d / 60)}min`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

const LAST_SEEN_KEY = "notif_last_seen";

function getLastSeen(): number {
  if (typeof window === "undefined") return Date.now();
  return Number(localStorage.getItem(LAST_SEEN_KEY) ?? 0);
}
function setLastSeen() {
  if (typeof window !== "undefined")
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
}

// ─── componente ───────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeenState] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setLastSeenState(getLastSeen()); }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Dados
  const { data: parsData } = useQuery({
    queryKey: ["partnerships-badge"],
    queryFn:  () => api.get("/partnerships").then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const { data: oppsData } = useQuery({
    queryKey:  ["ticker-opps"],
    queryFn:   () => api.get("/opportunities?limit=5").then(r => r.data),
    staleTime: 60_000,
  });

  const { data: dashData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn:  () => api.get("/users/dashboard").then(r => r.data),
    staleTime: 60_000,
  });

  // Build notifications list
  const notifs: Notif[] = [];

  const pars: any[] = parsData?.data ?? [];

  // Parcerias pendentes — ação obrigatória
  pars
    .filter(p => p.receiverId === user?.id && p.status === "PENDING")
    .forEach(p => {
      notifs.push({
        id:     `pp-${p.id}`,
        type:   "partnership_pending",
        title:  "Parceria aguardando sua resposta",
        desc:   `${p.requester?.name} quer fazer parceria em "${p.property?.title}"`,
        href:   "/parcerias",
        time:   p.createdAt,
        urgent: true,
      });
    });

  // Parcerias aceitas (pelo receptor, para o solicitante)
  pars
    .filter(p => p.requesterId === user?.id && p.status === "ACCEPTED")
    .slice(0, 3)
    .forEach(p => {
      if (!p.acceptedAt) return;
      notifs.push({
        id:   `pa-${p.id}`,
        type: "partnership_accepted",
        title: "Parceria aceita! 🎉",
        desc:  `${p.receiver?.name} aceitou sua proposta em "${p.property?.title}"`,
        href:  "/parcerias",
        time:  p.acceptedAt,
      });
    });

  // Matches recentes
  if (dashData?.recentMatches?.length) {
    dashData.recentMatches.slice(0, 2).forEach((m: any) => {
      notifs.push({
        id:   `match-${m.id}`,
        type: "match",
        title: "Novo match gerado",
        desc:  `${m.buyer?.buyerName} × ${m.property?.title} — ${m.score}% compatível`,
        href:  "/matches",
        time:  m.createdAt,
      });
    });
  }

  // Oportunidades recentes na rede
  const opps: any[] = oppsData?.data ?? [];
  opps.slice(0, 2).forEach(o => {
    notifs.push({
      id:   `opp-${o.id}`,
      type: "opportunity",
      title: "Nova oportunidade no radar",
      desc:  `${o.title} — ${o.city} com desconto`,
      href:  "/oportunidades",
      time:  o.createdAt,
    });
  });

  // Sort por tempo, mais recente primeiro
  notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Contagem de não lidos
  const urgentCount = notifs.filter(n => n.urgent).length;
  const newCount    = notifs.filter(n => new Date(n.time).getTime() > lastSeen).length;
  const badgeCount  = urgentCount + Math.max(0, newCount - urgentCount);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) {
      setLastSeen();
      setLastSeenState(Date.now());
    }
  };

  const ICONS: Record<Notif["type"], React.ElementType> = {
    partnership_pending:  UserCheck,
    partnership_accepted: CheckCircle2,
    match:                Zap,
    opportunity:          Flame,
  };

  const ICON_COLORS: Record<Notif["type"], string> = {
    partnership_pending:  "text-blue-600 bg-blue-50",
    partnership_accepted: "text-emerald-600 bg-emerald-50",
    match:                "text-yellow-600 bg-yellow-50",
    opportunity:          "text-orange-600 bg-orange-50",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell className={`h-5 w-5 ${badgeCount > 0 ? "text-blue-600" : "text-gray-600"}`} />
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900">Notificações</h3>
              {badgeCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {badgeCount} nova{badgeCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifs.slice(0, 8).map(n => {
                const Icon     = ICONS[n.type];
                const iconCls  = ICON_COLORS[n.type];
                const isNew    = new Date(n.time).getTime() > lastSeen;
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${n.urgent ? "bg-blue-50/50" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconCls}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-semibold text-gray-900 leading-snug ${n.urgent ? "text-blue-700" : ""}`}>
                          {n.title}
                          {n.urgent && <span className="ml-1 text-[9px] bg-blue-600 text-white px-1 py-0.5 rounded uppercase">Ação</span>}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.time)}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.desc}</p>
                    </div>
                    {isNew && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t bg-gray-50/80">
              <Link href="/parcerias" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas as parcerias pendentes
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
