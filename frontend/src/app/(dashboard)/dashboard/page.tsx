"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";
import { Building2, Users, Zap, UserCheck, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

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
