"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  Building2, Users, Zap, UserCheck, TrendingUp, ArrowRight, Trophy, Loader2,
} from "lucide-react";
import { PROPERTY_TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
type AnalyticsData = {
  overview: {
    totalProperties: number; totalBuyers: number; totalMatches: number;
    totalPartnerships: number; closedMatches: number; conversionRate: number;
  };
  matchesByStatus: { status: string; count: number }[];
  propertiesByType: { type: string; count: number }[];
  monthlyEvolution: { month: string; properties: number; buyers: number; matches: number }[];
  topProperties: { id: string; title: string; city: string; type: string; matchCount: number }[];
  partnershipStats: { pending: number; accepted: number; rejected: number };
  scoreBuckets: { range: string; count: number }[];
};

// ── Palette — dark-compatible ──────────────────────────────────────────────────
const PIE_COLORS = ["#6366f1", "#8b5cf6", "#34d399", "#f59e0b", "#ef4444"];
const STATUS_COLORS: Record<string, string> = {
  Pendente:       "#64748b",
  Contactado:     "#60a5fa",
  Visitado:       "#818cf8",
  "Em negociação": "#fbbf24",
  Fechado:        "#34d399",
  Rejeitado:      "#f87171",
};
const CHART_GRID  = "rgba(255,255,255,0.05)";
const CHART_AXIS  = "#475569";

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, color = "blue",
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  const styles: Record<string, { icon: string; ring: string }> = {
    blue:    { icon: "text-blue-400",    ring: "bg-blue-500/15"    },
    green:   { icon: "text-emerald-400", ring: "bg-emerald-500/15" },
    purple:  { icon: "text-violet-400",  ring: "bg-violet-500/15"  },
    amber:   { icon: "text-amber-400",   ring: "bg-amber-500/15"   },
    emerald: { icon: "text-emerald-400", ring: "bg-emerald-500/15" },
    indigo:  { icon: "text-indigo-400",  ring: "bg-indigo-500/15"  },
  };
  const s = styles[color] ?? styles.blue;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.ring}`}>
            <Icon className={`h-5 w-5 ${s.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl shadow-2xl p-3 text-sm">
      <p className="font-medium text-foreground/80 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Upgrade Banner ─────────────────────────────────────────────────────────────
function UpgradeBanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 border border-border rounded-2xl p-6 text-white flex items-center justify-between">
      <div>
        <p className="font-semibold text-lg mb-1">Analytics avançados no plano Professional</p>
        <p className="text-white/70 text-sm">
          Veja funil de conversão, distribuição de scores, performance de parcerias e muito mais.
        </p>
      </div>
      <Link href="/meu-plano">
        <button className="flex-shrink-0 bg-white/15 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/25 transition flex items-center gap-2 text-sm">
          Fazer upgrade <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const isPro = user?.plan === "pro" || user?.plan === "premium" || user?.plan === "agency"
    || user?.isLifetime === true || (user?.plan as string) === "professional";

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: () => api.get("/analytics").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const ov = data?.overview;

  return (
    <div>
      <Header title="Analytics" />
      <div className="p-6 space-y-6 max-w-6xl">

        {!isPro && <UpgradeBanner />}

        {/* KPI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard icon={Building2} label="Imóveis"     value={ov?.totalProperties   ?? 0} color="blue"    />
          <KpiCard icon={Users}     label="Compradores" value={ov?.totalBuyers        ?? 0} color="purple"  />
          <KpiCard icon={Zap}       label="Matches"     value={ov?.totalMatches       ?? 0} color="amber"   />
          <KpiCard icon={UserCheck} label="Parcerias"   value={ov?.totalPartnerships  ?? 0} color="indigo"  />
          <KpiCard icon={Trophy}    label="Fechamentos" value={ov?.closedMatches       ?? 0} color="emerald" />
          <KpiCard icon={TrendingUp} label="Conversão"  value={`${ov?.conversionRate ?? 0}%`}
            sub="matches → fechados" color="green" />
        </div>

        {/* Monthly Evolution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Evolução nos últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.monthlyEvolution ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gProperties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gBuyers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_AXIS }} stroke={CHART_GRID} />
                <YAxis tick={{ fontSize: 12, fill: CHART_AXIS }} stroke={CHART_GRID} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: CHART_AXIS }} />
                <Area type="monotone" dataKey="properties" name="Imóveis"     stroke="#6366f1" fill="url(#gProperties)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="buyers"     name="Compradores" stroke="#8b5cf6" fill="url(#gBuyers)"     strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="matches"    name="Matches"     stroke="#f59e0b" fill="url(#gMatches)"    strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Row 2 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Matches by status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Matches por status</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.matchesByStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum match gerado ainda</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.matchesByStatus ?? []} layout="vertical"
                    margin={{ top: 0, right: 10, left: 70, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_GRID} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: CHART_AXIS }} stroke={CHART_GRID} allowDecimals={false} />
                    <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: CHART_AXIS }} stroke={CHART_GRID} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Matches" radius={[0, 6, 6, 0]}>
                      {data?.matchesByStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#64748b"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Properties by type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Imóveis por tipo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {data?.propertiesByType.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum imóvel cadastrado</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data?.propertiesByType.map(d => ({ ...d, type: PROPERTY_TYPE_LABELS[d.type] ?? d.type })) ?? []} dataKey="count" nameKey="type"
                      cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {data?.propertiesByType.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]}
                      contentStyle={{ background: "hsl(220 50% 11%)", border: "1px solid hsl(220 33% 20%)", borderRadius: 12 }}
                      labelStyle={{ color: "#d7e4f4" }} itemStyle={{ color: "#94a3b8" }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: CHART_AXIS }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 3 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score distribution */}
          <Card className={!isPro ? "relative overflow-hidden" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Distribuição de score dos matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.scoreBuckets ?? []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: CHART_AXIS }} stroke={CHART_GRID} />
                  <YAxis tick={{ fontSize: 12, fill: CHART_AXIS }} stroke={CHART_GRID} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Matches" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {!isPro && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                  <p className="text-sm font-semibold text-foreground/80 mb-2">Disponível no plano Professional</p>
                  <Link href="/meu-plano">
                    <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
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
              <CardTitle className="text-base font-semibold text-foreground">Top imóveis por matches</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.topProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum imóvel com matches ainda</p>
              ) : (
                <div className="space-y-3">
                  {data?.topProperties.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i === 0 ? "bg-amber-500/20 text-amber-300"
                        : i === 1 ? "bg-slate-400/15 text-slate-300"
                        : "bg-orange-500/15 text-orange-300"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{PROPERTY_TYPE_LABELS[p.type] ?? p.type} · {p.city}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                          <Zap className="h-3 w-3" /> {p.matchCount}
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
              <CardTitle className="text-base font-semibold text-foreground">Status das parcerias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Pendentes",  value: data?.partnershipStats.pending  ?? 0, style: "bg-amber-500/15 text-amber-300"   },
                  { label: "Aceitas",    value: data?.partnershipStats.accepted ?? 0, style: "bg-emerald-500/15 text-emerald-300" },
                  { label: "Rejeitadas", value: data?.partnershipStats.rejected ?? 0, style: "bg-red-500/15 text-red-300"        },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-4 text-center border border-white/5 ${s.style}`}>
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
