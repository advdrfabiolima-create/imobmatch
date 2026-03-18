"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  Building2,
  Users,
  Zap,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Trophy,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
type AnalyticsData = {
  overview: {
    totalProperties: number;
    totalBuyers: number;
    totalMatches: number;
    totalPartnerships: number;
    closedMatches: number;
    conversionRate: number;
  };
  matchesByStatus: { status: string; count: number }[];
  propertiesByType: { type: string; count: number }[];
  monthlyEvolution: { month: string; properties: number; buyers: number; matches: number }[];
  topProperties: { id: string; title: string; city: string; type: string; matchCount: number }[];
  partnershipStats: { pending: number; accepted: number; rejected: number };
  scoreBuckets: { range: string; count: number }[];
};

// ── Palette ───────────────────────────────────────────────────────────────────
const PIE_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];
const STATUS_COLORS: Record<string, string> = {
  Pendente: "#94a3b8",
  Contactado: "#3b82f6",
  Visitado: "#8b5cf6",
  "Em negociação": "#f59e0b",
  Fechado: "#10b981",
  Rejeitado: "#ef4444",
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg[color] || bg.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Upgrade Banner ────────────────────────────────────────────────────────────
function UpgradeBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between">
      <div>
        <p className="font-semibold text-lg mb-1">Analytics avançados no plano Professional</p>
        <p className="text-blue-100 text-sm">
          Veja funil de conversão, distribuição de scores, performance de parcerias e muito mais.
        </p>
      </div>
      <Link href="/meu-plano">
        <button className="flex-shrink-0 bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition flex items-center gap-2 text-sm">
          Fazer upgrade
          <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const isPro = user?.plan === "pro" || user?.plan === "premium" || user?.plan === "agency" || user?.isLifetime === true;

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: () => api.get("/analytics").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const ov = data?.overview;

  return (
    <div>
      <Header title="Analytics" />
      <div className="p-6 space-y-6 max-w-6xl">

        {/* Upgrade banner for non-pro */}
        {!isPro && <UpgradeBanner />}

        {/* KPI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard icon={Building2} label="Imóveis" value={ov?.totalProperties ?? 0} color="blue" />
          <KpiCard icon={Users} label="Compradores" value={ov?.totalBuyers ?? 0} color="purple" />
          <KpiCard icon={Zap} label="Matches" value={ov?.totalMatches ?? 0} color="amber" />
          <KpiCard icon={UserCheck} label="Parcerias" value={ov?.totalPartnerships ?? 0} color="indigo" />
          <KpiCard icon={Trophy} label="Fechamentos" value={ov?.closedMatches ?? 0} color="emerald" />
          <KpiCard
            icon={TrendingUp}
            label="Conversão"
            value={`${ov?.conversionRate ?? 0}%`}
            sub="matches → fechados"
            color="green"
          />
        </div>

        {/* Monthly Evolution — full width */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Evolução nos últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.monthlyEvolution ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gProperties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBuyers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="properties" name="Imóveis" stroke="#2563eb" fill="url(#gProperties)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="buyers" name="Compradores" stroke="#7c3aed" fill="url(#gBuyers)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="matches" name="Matches" stroke="#f59e0b" fill="url(#gMatches)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Row 2: Matches by status + Properties by type */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Matches by status — horizontal bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Matches por status</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.matchesByStatus.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Nenhum match gerado ainda</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data?.matchesByStatus ?? []}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 70, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                    <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Matches" radius={[0, 6, 6, 0]}>
                      {data?.matchesByStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Properties by type — pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Imóveis por tipo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {data?.propertiesByType.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Nenhum imóvel cadastrado</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data?.propertiesByType ?? []}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {data?.propertiesByType.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Score distribution (pro) + Top properties */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score distribution */}
          <Card className={!isPro ? "relative overflow-hidden" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Distribuição de score dos matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.scoreBuckets ?? []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Matches" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {!isPro && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Disponível no plano Professional</p>
                  <Link href="/meu-plano">
                    <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                      Ver planos <ArrowRight className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top properties */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top imóveis por matches</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.topProperties.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Nenhum imóvel com matches ainda</p>
              ) : (
                <div className="space-y-3">
                  {data?.topProperties.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0
                            ? "bg-amber-100 text-amber-700"
                            : i === 1
                            ? "bg-gray-100 text-gray-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">
                          {p.type} · {p.city}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          <Zap className="h-3 w-3" />
                          {p.matchCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 4: Partnership stats (pro) */}
        {isPro && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Status das parcerias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Pendentes", value: data?.partnershipStats.pending ?? 0, color: "text-amber-600 bg-amber-50" },
                  { label: "Aceitas", value: data?.partnershipStats.accepted ?? 0, color: "text-green-600 bg-green-50" },
                  { label: "Rejeitadas", value: data?.partnershipStats.rejected ?? 0, color: "text-red-600 bg-red-50" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
