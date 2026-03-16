"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Home, Users, Zap, UserCheck,
  MessageSquare, Search, Settings, LogOut, Shield, UsersRound, BarChart2, CreditCard, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useSidebarStore } from "@/store/sidebar.store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

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

  const NavLink = ({ href, label, icon: Icon, badge, activeColor = "blue" }: {
    href: string; label: string; icon: React.ElementType; badge?: number; activeColor?: string;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    const activeClass =
      activeColor === "purple" ? "bg-purple-50 text-purple-600"
      : activeColor === "amber" ? "bg-amber-50 text-amber-600"
      : "bg-blue-50 text-blue-600";
    const activeIconClass =
      activeColor === "purple" ? "text-purple-600"
      : activeColor === "amber" ? "text-amber-500"
      : "text-blue-600";

    return (
      <Link
        href={href}
        onClick={close}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          active ? activeClass : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon className={cn("h-5 w-5", active ? activeIconClass : "text-gray-400")} />
        <span className="flex-1">{label}</span>
        {badge != null && badge > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={close} aria-hidden="true" />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r flex flex-col z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center" onClick={close}>
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
          </Link>
          <button
            onClick={close}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-blue-600 font-semibold text-sm">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.agency || user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink href="/dashboard"    label="Dashboard"   icon={LayoutDashboard} />
          <NavLink href="/meus-imoveis" label="Imóveis"     icon={Home} />
          <NavLink href="/compradores"  label="Compradores" icon={Users} />
          <NavLink href="/matches"      label="Matches"     icon={Zap} />
          <NavLink
            href="/parcerias"
            label="Parcerias"
            icon={UserCheck}
            badge={pendingCount > 0 ? pendingCount : newlyAccepted > 0 ? newlyAccepted : undefined}
          />
          <NavLink href="/mensagens"  label="Mensagens"  icon={MessageSquare} />
          <NavLink href="/corretores" label="Corretores" icon={Search} />
          <NavLink href="/analytics"  label="Analytics"  icon={BarChart2} />
          <NavLink href="/perfil"     label="Perfil"     icon={Settings} />
          <NavLink href="/meu-plano"  label="Planos"     icon={CreditCard} activeColor="amber" />

          {(user?.plan === "agency" || user?.isLifetime) && (
            <NavLink href="/team" label="Gestão de Equipe" icon={UsersRound} />
          )}

          {user?.role === "ADMIN" && (
            <NavLink href="/admin" label="Administração" icon={Shield} activeColor="purple" />
          )}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => { close(); logout(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}