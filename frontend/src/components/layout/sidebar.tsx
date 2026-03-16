"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Home, Users, Zap, UserCheck,
  MessageSquare, Search, Settings, LogOut, Shield, UsersRound, BarChart2, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meus-imoveis", label: "Imóveis", icon: Home },
  { href: "/compradores", label: "Compradores", icon: Users },
  { href: "/matches", label: "Matches", icon: Zap },
  { href: "/parcerias", label: "Parcerias", icon: UserCheck },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/corretores", label: "Corretores", icon: Search },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/perfil", label: "Perfil", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center">
          <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      {/* User Info */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", active ? "text-blue-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}

        {/* Plans */}
        <Link
          href="/plans"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/plans"
              ? "bg-amber-50 text-amber-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <CreditCard className={cn("h-5 w-5", pathname === "/plans" ? "text-amber-500" : "text-gray-400")} />
          Planos
        </Link>

        {/* Agency-only: Team Management */}
        {(user?.plan === "agency" || user?.isLifetime) && (
          <Link
            href="/team"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/team" || pathname.startsWith("/team/")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <UsersRound
              className={cn(
                "h-5 w-5",
                pathname === "/team" || pathname.startsWith("/team/") ? "text-blue-600" : "text-gray-400"
              )}
            />
            Gestão de equipe
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2",
              pathname === "/admin"
                ? "bg-purple-50 text-purple-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Shield className="h-5 w-5 text-purple-400" />
            Administração
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
