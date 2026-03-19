"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { ActivityTicker } from "@/components/layout/activity-ticker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";
import {
  Building2, Users, Zap, UserCheck, TrendingUp, ArrowRight,
  Crown, Sparkles, Infinity, Flame, Activity, Wifi,
} from "lucide-react";
import Link from "next/link";
import { normalizePlan } from "@/config/plans";

// ─── Plan Banner ──────────────────────────────────────────────────────────────

const PLAN_META: Record<string, { label: string; color: string; dot: string }> = {
  free:    { label: "Free",    color: "bg-gray-100 text-gray-600 border-gray-200",       dot: "bg-gray-400"   },
  starter: { label: "Starter", color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-500"   },
  pro:     { label: "Pro",     color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  premium: { label: "Premium", color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  agency:  { label: "Agency",  color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

function PlanBanner() {
  const { user } = useAuthStore();
  if (user?.isLifetime) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium text-amber-800">Seu plano:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Agency
          </span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-amber-200" />
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border bg-amber-100 text-amber-700 border-amber-300">
          <Infinity className="h-3.5 w-3.5" /> Acesso vitalício
        </div>
        <div className="sm:ml-auto text-xs text-amber-600 flex items-center gap-1 font-medium">
          <Crown className="h-3 w-3" /> Fundador
        </div>
      </div>
    );
  }
  const plan = normalizePlan(user?.plan ?? "free");
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const isPaidTop = plan === "premium" || plan === "agency";
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-600">Seu plano:</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
        </span>
      </div>
      <div className="hidden sm:block w-px h-5 bg-gray-200" />
      <div className="sm:ml-auto">
        {isPaidTop ? (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Crown className="h-3 w-3" /> Plano completo
          </span>
        ) : (
          <Link href="/meu-plano" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            <Sparkles className="h-3.5 w-3.5" /> Fazer upgrade
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, href, pulse }: any) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`relative p-3 rounded-xl bg-${color}-50`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
            {pulse && value > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}-500`} />
              </span>
            )}
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

// ─── Live Activity Block ───────────────────────────────────────────────────────

function seeded(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return Math.floor((Math.abs(Math.sin(h * 9301 + 49297)) % 1) * (max - min + 1)) + min;
}

function LiveActivityBlock({ stats }: { stats: any }) {
  const now        = new Date().toISOString();
  const activeNow  = seeded(now.slice(0, 13), 12, 67); // muda por hora
  const oppsToday  = seeded(now.slice(0, 10) + "o", 3, 18);
  const matchesToday = seeded(now.slice(0, 10) + "m", 2, 11);
  const dealsToday = seeded(now.slice(0, 10) + "d", 0, 4);

  const items = [
    { icon: "🟢", label: `${activeNow} corretores ativos agora na plataforma`,  highlight: true  },
    { icon: "🔥", label: `${oppsToday} novas oportunidades publicadas hoje`,     highlight: false },
    { icon: "⚡", label: `${matchesToday} novos matches gerados hoje`,            highlight: false },
    { icon: "💰", label: dealsToday > 0 ? `${dealsToday} negócios fechados hoje` : "Parcerias ativas em andamento", highlight: false },
    ...(stats?.partnershipsPending > 0
      ? [{ icon: "🔔", label: `${stats.partnershipsPending} parceria${stats.partnershipsPending > 1 ? "s" : ""} aguardando sua resposta`, highlight: true }]
      : []
    ),
  ];

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          Atividade Recente na Plataforma
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-sm py-1 ${item.highlight ? "font-semibold text-gray-900" : "text-gray-600"}`}>
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">agora</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700">
              <Wifi className="h-3.5 w-3.5" />
              <span>Plataforma operando normalmente</span>
            </div>
            <Link href="/oportunidades" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
              Ver radar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── FOMO Block ───────────────────────────────────────────────────────────────

function FomoBlock() {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4" />
            <span className="font-bold text-sm">Não perca oportunidades!</span>
          </div>
          <p className="text-xs text-orange-100 leading-relaxed">
            Corretores ativos estão fechando negócios agora mesmo. Acesse o Radar de Oportunidades.
          </p>
        </div>
        <Link
          href="/oportunidades"
          className="flex-shrink-0 ml-4 bg-white text-orange-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors"
        >
          Ver radar →
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey:        ["dashboard-stats"],
    queryFn:         () => api.get("/users/dashboard").then(r => r.data),
    refetchInterval: 60_000, // auto-refresh a cada 1 min
    staleTime:       30_000,
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-4 md:p-6">
          <div className="h-8 bg-gray-800 animate-pulse mb-1" />
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

      {/* Activity Ticker — faixa escura acima de tudo */}
      <ActivityTicker />

      <div className="p-4 md:p-6 space-y-5">

        <PlanBanner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Meus Imóveis"       value={stats?.propertiesCount ?? 0}    icon={Building2} color="blue"   href="/meus-imoveis" />
          <StatCard title="Compradores Ativos" value={stats?.buyersCount ?? 0}         icon={Users}     color="green"  href="/compradores"  />
          <StatCard title="Matches Gerados"    value={stats?.matchesCount ?? 0}        icon={Zap}       color="yellow" href="/matches"       pulse />
          <StatCard title="Parcerias Pendentes" value={stats?.partnershipsPending ?? 0} icon={UserCheck} color="purple" href="/parcerias"    pulse />
        </div>

        {/* FOMO + Live Activity */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <FomoBlock />
            <LiveActivityBlock stats={stats} />
          </div>

          {/* Imóveis + Matches */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Imóveis Recentes
                </CardTitle>
                <Link href="/meus-imoveis" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {!stats?.recentProperties?.length ? (
                  <div className="text-center py-6 text-gray-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Nenhum imóvel cadastrado</p>
                    <Link href="/meus-imoveis" className="text-blue-600 text-xs hover:underline">Cadastrar agora</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.recentProperties.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-xs text-gray-900 truncate max-w-[160px]">{p.title}</p>
                          <p className="text-[11px] text-gray-500">{PROPERTY_TYPE_LABELS[p.type]} · {formatDate(p.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-xs text-blue-600">{formatCurrency(p.price)}</p>
                          <Badge variant={p.status === "AVAILABLE" ? "success" : "secondary"} className="text-[10px] mt-0.5">
                            {PROPERTY_STATUS_LABELS[p.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Matches Recentes
                </CardTitle>
                <Link href="/matches" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {!stats?.recentMatches?.length ? (
                  <div className="text-center py-6 text-gray-400">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Nenhum match gerado</p>
                    <Link href="/matches" className="text-blue-600 text-xs hover:underline">Gerar agora</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.recentMatches.map((m: any) => (
                      <div key={m.id} className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-medium text-xs text-gray-900">{m.buyer?.buyerName}</p>
                          <Badge variant="warning" className="text-[10px]">Score: {m.score}%</Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{m.property?.title}</p>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
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
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Ações Rápidas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: "/meus-imoveis", label: "Novo Imóvel",        icon: Building2, color: "blue"   },
                { href: "/compradores",  label: "Novo Comprador",      icon: Users,     color: "green"  },
                { href: "/matches",      label: "Gerar Matches",       icon: Zap,       color: "yellow" },
                { href: "/corretores",   label: "Buscar Corretores",   icon: TrendingUp, color: "purple" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-${a.color}-50 hover:bg-${a.color}-100 hover:-translate-y-0.5 transition-all duration-200 text-center`}
                >
                  <a.icon className={`h-6 w-6 text-${a.color}-600`} />
                  <span className={`text-xs font-medium text-${a.color}-700`}>{a.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
