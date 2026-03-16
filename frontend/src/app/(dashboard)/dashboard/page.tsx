"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";
import { Building2, Users, Zap, UserCheck, TrendingUp, ArrowRight, Clock, Crown, Sparkles, Infinity } from "lucide-react";
import Link from "next/link";
import { TRIAL_DAYS } from "@/config/plans";

// ── Plan config ───────────────────────────────────────────────────────────────
const PLAN_META = {
  starter: { label: "Starter", color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-400" },
  professional: { label: "Professional", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  agency: { label: "Agency", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

// ── Trial / Plan Banner ───────────────────────────────────────────────────────
function PlanBanner() {
  const { user } = useAuthStore();

  // Lifetime — founder account
  if (user?.isLifetime) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium text-amber-800">Seu plano:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Agency
          </span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-amber-200" />
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border bg-amber-100 text-amber-700 border-amber-300">
          <Infinity className="h-3.5 w-3.5" />
          Acesso vitalício
        </div>
        <div className="sm:ml-auto text-xs text-amber-600 flex items-center gap-1 font-medium">
          <Crown className="h-3 w-3" /> Fundador
        </div>
      </div>
    );
  }

  const plan = user?.plan ?? "starter";
  const meta = PLAN_META[plan] ?? PLAN_META.starter;

  // Trial countdown — based on account creation date
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  const trialEnd = createdAt ? new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000) : null;
  const now = new Date();
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const trialActive = daysLeft > 0;
  const trialExpired = createdAt !== null && !trialActive;

  const urgencyColor =
    daysLeft <= 1 ? "text-red-600 bg-red-50 border-red-200" :
    daysLeft <= 3 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-blue-600 bg-blue-50 border-blue-200";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Plan badge */}
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-600">Seu plano:</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-5 bg-gray-200" />

      {/* Trial countdown */}
      {trialActive && (
        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${urgencyColor}`}>
          <Clock className="h-3.5 w-3.5" />
          <span>
            {daysLeft === 1 ? "Último dia de trial!" : `${daysLeft} dias restantes de trial`}
          </span>
        </div>
      )}

      {trialExpired && plan === "starter" && (
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border text-orange-700 bg-orange-50 border-orange-200">
          <Clock className="h-3.5 w-3.5" />
          <span>Trial encerrado</span>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="sm:ml-auto">
        {plan === "starter" ? (
          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Fazer upgrade
          </Link>
        ) : plan === "professional" ? (
          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline"
          >
            Ver plano Agency <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Crown className="h-3 w-3" /> Plano completo
          </span>
        )}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, href }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-${color}-50`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        {href && (
          <Link href={href} className={`text-xs text-${color}-600 hover:underline flex items-center gap-1 mt-3`}>
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/users/dashboard").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="h-14 bg-gray-100 rounded-xl animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Plan + Trial Banner */}
        <PlanBanner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Meus Imóveis" value={stats?.propertiesCount ?? 0} icon={Building2} color="blue" href="/meus-imoveis" />
          <StatCard title="Compradores Ativos" value={stats?.buyersCount ?? 0} icon={Users} color="green" href="/compradores" />
          <StatCard title="Matches Gerados" value={stats?.matchesCount ?? 0} icon={Zap} color="yellow" href="/matches" />
          <StatCard title="Parcerias Pendentes" value={stats?.partnershipsPending ?? 0} icon={UserCheck} color="purple" href="/parcerias" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Imóveis Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Imóveis Recentes</CardTitle>
              <Link href="/meus-imoveis" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!stats?.recentProperties?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <Building2 className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm">Nenhum imóvel cadastrado</p>
                  <Link href="/meus-imoveis" className="text-blue-600 text-sm hover:underline">Cadastrar primeiro imóvel</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentProperties.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-900 truncate max-w-[180px]">{p.title}</p>
                        <p className="text-xs text-gray-500">{PROPERTY_TYPE_LABELS[p.type]} • {formatDate(p.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-blue-600">{formatCurrency(p.price)}</p>
                        <Badge variant={p.status === "AVAILABLE" ? "success" : "secondary"} className="text-xs mt-1">
                          {PROPERTY_STATUS_LABELS[p.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Melhores Matches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Matches Recentes</CardTitle>
              <Link href="/matches" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!stats?.recentMatches?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <Zap className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm">Nenhum match gerado</p>
                  <Link href="/matches" className="text-blue-600 text-sm hover:underline">Gerar matches agora</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentMatches.map((m: any) => (
                    <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-gray-900">{m.buyer?.buyerName}</p>
                        <Badge variant="warning" className="text-xs">Score: {m.score}%</Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{m.property?.title}</p>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Busca: {formatCurrency(m.buyer?.maxPrice)}</span>
                        <span>Imóvel: {formatCurrency(m.property?.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Ações Rápidas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: "/meus-imoveis", label: "Novo Imóvel", icon: Building2, color: "blue" },
                { href: "/compradores", label: "Novo Comprador", icon: Users, color: "green" },
                { href: "/matches", label: "Gerar Matches", icon: Zap, color: "yellow" },
                { href: "/corretores", label: "Buscar Corretores", icon: TrendingUp, color: "purple" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors text-center`}
                >
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                  <span className={`text-sm font-medium text-${action.color}-700`}>{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
