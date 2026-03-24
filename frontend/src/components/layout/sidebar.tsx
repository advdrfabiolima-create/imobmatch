"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Home, Users, Zap, Flame, UserCheck,
  MessageSquare, Search, Settings, LogOut, Shield, UsersRound, BarChart2, CreditCard, X,
  Rss, Trophy, Calculator,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useSidebarStore } from "@/store/sidebar.store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AgentAvatar } from "@/components/ui/agent-avatar";


export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

  const { data: myRanking } = useQuery({
    queryKey: ["my-ranking-score"],
    queryFn: () => api.get("/ranking?limit=200").then((r) =>
      (r.data.data as any[]).find((a) => a.id === user?.id)?.score ?? null
    ),
    staleTime: 60_000,
    enabled: !!user,
  });

  const { data: partnershipsData } = useQuery({
    queryKey: ["partnerships-badge"],
    queryFn: () => api.get("/partnerships").then((r) => r.data),
    refetchInterval: 30000,
  });

  const pendingCount = partnershipsData?.data?.filter(
    (p: any) => p.receiverId === user?.id && p.status === "PENDING"
  ).length ?? 0;

  const newlyAccepted = partnershipsData?.data?.filter(
    (p: any) => p.requesterId === user?.id && p.status === "ACCEPTED"
  ).length ?? 0;

  const NavLink = ({ href, label, icon: Icon, badge, activeColor = "blue", bonus }: {
    href: string; label: string; icon: React.ElementType; badge?: number; activeColor?: string; bonus?: boolean;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");

    const glowColor =
      activeColor === "purple" ? "rgba(192,132,252,0.18)"
      : activeColor === "amber" ? "rgba(251,191,36,0.18)"
      : "rgba(96,165,250,0.18)";

    const borderColor =
      activeColor === "purple" ? "#c084fc"
      : activeColor === "amber" ? "#fbbf24"
      : "#60a5fa";

    const activeIcon =
      activeColor === "purple" ? "text-purple-300"
      : activeColor === "amber" ? "text-amber-300"
      : "text-blue-300";

    return (
      <div className="relative">
        {active && (
          <div className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: glowColor,
              boxShadow: `inset 0 0 12px ${glowColor}, 0 0 8px ${glowColor}`,
              borderLeft: `2px solid ${borderColor}`,
            }} />
        )}
        <Link
          href={href}
          onClick={close}
          className={cn(
            "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            active
              ? "text-white pl-[10px]"
              : "text-[#94A3B8] hover:bg-white/[0.07] hover:text-[#E2E8F0]"
          )}
        >
          <Icon className={cn("h-[18px] w-[18px] flex-shrink-0 transition-colors", active ? activeIcon : "text-[#64748B] group-hover:text-[#94A3B8]")} />
          <span className="flex-1 tracking-[0.01em]">{label}</span>
          {bonus && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300/80 border border-purple-400/25 leading-none">
              Bônus
            </span>
          )}
          {badge != null && badge > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center justify-center shadow-sm shadow-emerald-500/30">
              {badge}
            </span>
          )}
        </Link>
      </div>
    );
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={close} aria-hidden="true" />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 flex flex-col z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
        style={{
          background: "linear-gradient(170deg, #080f2e 0%, #0e1848 30%, #1a0e56 60%, #2d1270 85%, #3b1585 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.40)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/8">
          <Link href="/dashboard" onClick={close}>
            <img
              src="/logo_texto_branco.png"
              alt="ImobMatch"
              className="h-5 w-auto object-contain"
            />
          </Link>
          <button
            onClick={close}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <AgentAvatar
              name={user?.name ?? ""}
              avatarUrl={user?.avatarUrl}
              score={myRanking ?? null}
              size="md"
              fallbackClassName="bg-gradient-to-br from-blue-500 to-violet-600 text-white"
            />
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#CBD5E1] truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-[#94A3B8] truncate mt-0.5">{user?.agency || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">

          {/* Principal */}
          <p className="px-3 pt-1 pb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 select-none">
            Principal
          </p>
          <NavLink href="/dashboard"     label="Dashboard"        icon={LayoutDashboard} />
          <NavLink href="/meus-imoveis"  label="Imóveis"          icon={Home} />
          <NavLink href="/compradores"   label="Compradores"      icon={Users} />
          <NavLink href="/matches"       label="Matches"          icon={Zap} />

          {/* Rede */}
          <p className="px-3 pt-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 select-none">
            Rede
          </p>
          <NavLink
            href="/parcerias"
            label="Parcerias"
            icon={UserCheck}
            badge={pendingCount > 0 ? pendingCount : undefined}
          />
          <NavLink href="/mensagens"     label="Mensagens"        icon={MessageSquare} />
          <NavLink href="/corretores"    label="Corretores"       icon={Search} />
          <NavLink href="/oportunidades" label="Oportunidades"    icon={Flame}      activeColor="amber" />
          <NavLink href="/feed"          label="Feed da Rede"     icon={Rss} />
          <NavLink href="/ranking"       label="Ranking"          icon={Trophy} />

          {/* Ferramentas */}
          <p className="px-3 pt-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 select-none">
            Ferramentas
          </p>
          <NavLink href="/analytics"               label="Analytics"   icon={BarChart2} />
          <NavLink href="/simulador-financiamento" label="Simulador"   icon={Calculator} bonus />
          <NavLink href="/perfil"                  label="Perfil"      icon={Settings} />
          <NavLink href="/meu-plano"               label="Planos"      icon={CreditCard} activeColor="amber" />

          {(user?.plan === "agency" || user?.isLifetime) && (
            <NavLink href="/team" label="Gestão de Equipe" icon={UsersRound} />
          )}

          {user?.role === "ADMIN" && (
            <>
              <p className="px-3 pt-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 select-none">
                Sistema
              </p>
              <NavLink href="/admin" label="Administração" icon={Shield} activeColor="purple" />
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/8">
          <button
            onClick={() => { close(); logout(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
