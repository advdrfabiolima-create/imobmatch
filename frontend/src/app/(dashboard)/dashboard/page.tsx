"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ActivityTicker } from "@/components/layout/activity-ticker";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";
import { MatchRadar } from "@/components/dashboard/MatchRadar";
import {
  Building2, Users, Zap, UserCheck, ArrowRight,
  Crown, Sparkles, Infinity, Flame, MapPin,
  Lightbulb, TrendingUp, Phone, ChevronRight, AlertCircle,
  CheckCircle2, Circle, X, PartyPopper, Target,
  Activity, Star,
} from "lucide-react";
import Link from "next/link";
import { normalizePlan } from "@/config/plans";

// ─── Glass card primitive ─────────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "blue" | "violet" | "green" | "orange" | "amber";
}) {
  const glowMap = {
    blue:   "shadow-[0_0_32px_rgba(99,102,241,0.15)] border-indigo-500/20",
    violet: "shadow-[0_0_32px_rgba(139,92,246,0.15)] border-violet-500/20",
    green:  "shadow-[0_0_32px_rgba(16,185,129,0.15)] border-emerald-500/20",
    orange: "shadow-[0_0_32px_rgba(249,115,22,0.15)] border-orange-500/20",
    amber:  "shadow-[0_0_32px_rgba(245,158,11,0.15)] border-amber-500/20",
  };
  return (
    <div
      className={`
        bg-[#0d1424]/80 backdrop-blur-md
        border border-border
        rounded-2xl
        ${glow ? glowMap[glow] : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─── Stat pill badge ──────────────────────────────────────────────────────────

function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-xl bg-white/[0.04] border border-border`}>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</span>
    </div>
  );
}

// ─── Onboarding Checklist ─────────────────────────────────────────────────────

const STORAGE_KEY = "imobmatch_onboarding_dismissed";

function OnboardingChecklist({ user, stats }: { user: any; stats: any }) {
  const [dismissed, setDismissed] = useState(true);
  const [allDone, setAllDone]     = useState(false);

  const steps = [
    { id: "account",  label: "Conta criada",                done: true,                              href: null              },
    { id: "email",    label: "Verificar e-mail",            done: !!user?.emailVerified,              href: "/verificar-email" },
    { id: "property", label: "Cadastrar primeiro imóvel",   done: (stats?.propertiesCount ?? 0) > 0, href: "/meus-imoveis"   },
    { id: "buyer",    label: "Adicionar primeiro comprador", done: (stats?.buyersCount ?? 0) > 0,     href: "/compradores"   },
    { id: "match",    label: "Gerar seu primeiro match",     done: (stats?.matchesCount ?? 0) > 0,    href: "/matches"       },
  ];

  const completed = steps.filter(s => s.done).length;
  const total     = steps.length;
  const pct       = Math.round((completed / total) * 100);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    setDismissed(false);
  }, []);

  useEffect(() => {
    if (dismissed || completed < total) return;
    setAllDone(true);
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true");
      setDismissed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [completed, total, dismissed]);

  if (dismissed) return null;

  const handleDismiss = () => { localStorage.setItem(STORAGE_KEY, "true"); setDismissed(true); };

  if (allDone) {
    return (
      <GlassCard glow="green" className="flex items-center gap-3 p-4">
        <PartyPopper className="h-5 w-5 text-emerald-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Primeiros passos concluídos!</p>
          <p className="text-xs text-slate-400 mt-0.5">Você está pronto para aproveitar o ImobMatch ao máximo.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow="blue" className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Primeiros passos</span>
          <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            {completed} de {total}
          </span>
        </div>
        <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-0.5 bg-white/[0.05]">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="divide-y divide-white/[0.04]">
        {steps.map((step) => {
          const content = (
            <div className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${!step.done && step.href ? "hover:bg-white/[0.03] cursor-pointer" : ""}`}>
              {step.done
                ? <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                : <Circle       className="h-4 w-4 text-slate-600    flex-shrink-0" />}
              <span className={`text-sm flex-1 ${step.done ? "text-slate-600 line-through" : "text-slate-300 font-medium"}`}>
                {step.label}
              </span>
              {!step.done && step.href && <ArrowRight className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />}
            </div>
          );
          return step.href && !step.done
            ? <Link key={step.id} href={step.href}>{content}</Link>
            : <div   key={step.id}>{content}</div>;
        })}
      </div>
    </GlassCard>
  );
}

// ─── Plan Banner ──────────────────────────────────────────────────────────────

const PLAN_META: Record<string, { label: string; gradient: string; dot: string }> = {
  free:    { label: "Free",    gradient: "from-slate-500/10 to-slate-600/5",   dot: "bg-slate-400"   },
  starter: { label: "Starter", gradient: "from-indigo-500/10 to-blue-600/5",   dot: "bg-indigo-400"  },
  pro:     { label: "Pro",     gradient: "from-indigo-500/15 to-violet-600/10", dot: "bg-indigo-400"  },
  premium: { label: "Premium", gradient: "from-violet-500/15 to-purple-600/10", dot: "bg-violet-400"  },
  agency:  { label: "Agency",  gradient: "from-purple-500/15 to-indigo-600/10", dot: "bg-purple-400"  },
};

function PlanBanner() {
  const { user } = useAuthStore();
  if (user?.isLifetime) {
    return (
      <GlassCard glow="amber" className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-400">Plano:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Agency
          </span>
        </div>
        <div className="w-px h-5 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 whitespace-nowrap">
          <Infinity className="h-3.5 w-3.5 flex-shrink-0" /> Acesso vitalício
        </div>
        <div className="text-xs text-amber-500 flex items-center gap-1 font-medium whitespace-nowrap">
          <Crown className="h-3 w-3" /> Fundador
        </div>
      </GlassCard>
    );
  }

  const plan = normalizePlan(user?.plan ?? "free");
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const isPaidTop = plan === "premium" || plan === "agency";

  return (
    <GlassCard className={`flex flex-row flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 bg-gradient-to-r ${meta.gradient}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Crown className="h-4 w-4 text-slate-500 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-400 whitespace-nowrap">Seu plano:</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-border text-white whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />{meta.label}
        </span>
      </div>
      {isPaidTop ? (
        <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
          <Crown className="h-3 w-3" /> Plano completo
        </span>
      ) : (
        <Link href="/meu-plano" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition whitespace-nowrap">
          <Sparkles className="h-3.5 w-3.5" /> Fazer upgrade
        </Link>
      )}
    </GlassCard>
  );
}

// ─── Premium Stat Card ────────────────────────────────────────────────────────

const STAT_THEMES = {
  blue:   { icon: "bg-indigo-500/15 text-indigo-400",  glow: "hover:shadow-[0_0_24px_rgba(99,102,241,0.2)]",  bar: "bg-indigo-500",  pulse: "bg-indigo-400"   },
  green:  { icon: "bg-emerald-500/15 text-emerald-400", glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]", bar: "bg-emerald-500", pulse: "bg-emerald-400"  },
  yellow: { icon: "bg-amber-500/15 text-amber-400",     glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]", bar: "bg-amber-500",   pulse: "bg-amber-400"    },
  purple: { icon: "bg-violet-500/15 text-violet-400",   glow: "hover:shadow-[0_0_24px_rgba(139,92,246,0.2)]", bar: "bg-violet-500",  pulse: "bg-violet-400"   },
};

function PremiumStatCard({ title, value, sub, icon: Icon, color, href, pulse }: any) {
  const theme = STAT_THEMES[color as keyof typeof STAT_THEMES] ?? STAT_THEMES.blue;

  const content = (
    <div className={`
      relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-1 cursor-pointer
      bg-[#0d1424]/80 backdrop-blur-md border border-border
      ${theme.glow}
    `}>

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${theme.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        {pulse && value > 0 && (
          <div className="relative flex h-2.5 w-2.5 mt-1">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.pulse} opacity-60`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.pulse}`} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-0.5 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-400">{title}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Compact Right-side Stat Card ─────────────────────────────────────────────

function CompactStatCard({ title, value, sub, badge, icon: Icon, accent, href }: any) {
  const content = (
    <div className="flex items-center gap-3 p-4 bg-[#0d1424]/60 border border-border rounded-xl hover:border-border hover:bg-white/[0.03] transition-all group cursor-pointer">
      {Icon && (
        <div className={`p-2 rounded-lg ${accent?.iconBg ?? "bg-white/[0.06]"} flex-shrink-0`}>
          <Icon className={`h-4 w-4 ${accent?.iconColor ?? "text-slate-400"}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-500 font-medium">{title}</p>
        <p className={`text-xl font-bold tracking-tight ${accent?.valueColor ?? "text-white"}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5 truncate">{sub}</p>}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${accent?.badgeStyle ?? "bg-white/[0.06] border-border text-slate-400"}`}>
          {badge}
        </span>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Match Score Ring ─────────────────────────────────────────────────────────

function MatchScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 36;
  const progress = (score / 100) * circumference;
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke="url(#ringGrad)" strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{score}%</span>
      </div>
      <p className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

// ─── Network Opportunities Block ──────────────────────────────────────────────

function NetworkOppsBlock({ opps, city }: { opps: any[]; city: string | null }) {
  if (!opps.length) return null;

  return (
    <GlassCard glow="orange" className="overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/15">
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <span className="text-sm font-semibold text-white">Oportunidades para você agora</span>
          {city && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
              <MapPin className="h-3 w-3" />{city}
            </span>
          )}
        </div>
        <Link href="/oportunidades" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {opps.map((opp: any) => {
          const discount   = Math.round(((Number(opp.priceNormal) - Number(opp.priceUrgent)) / Number(opp.priceNormal)) * 100);
          const commission = Math.round(Number(opp.priceUrgent) * 0.03);
          const wppUrl     = opp.agent?.phone
            ? `https://wa.me/55${opp.agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${opp.agent.name}, vi sua oportunidade "${opp.title}" no ImobMatch e tenho um cliente interessado!`)}`
            : null;

          return (
            <div key={opp.id}
              className="bg-white/[0.03] border border-border hover:border-orange-500/20 hover:bg-white/[0.05] rounded-xl p-3.5 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{opp.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {PROPERTY_TYPE_LABELS[opp.propertyType]} · {opp.city}
                  </p>
                </div>
                <span className="flex-shrink-0 bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-white">{formatCurrency(opp.priceUrgent)}</p>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    💰 Comissão potencial: {formatCurrency(commission)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {wppUrl && (
                    <a href={wppUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-semibold bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Tenho comprador
                    </a>
                  )}
                  <Link href="/oportunidades"
                    className="text-[11px] font-semibold bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2.5 py-1.5 rounded-lg hover:bg-orange-500/30 transition-colors">
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─── Smart Actions Block ───────────────────────────────────────────────────────

function SmartActionsBlock({ stats }: { stats: any }) {
  const actions: { icon: string; title: string; desc: string; cta: string; href: string; priority: "high" | "medium" | "low" }[] = [];

  if (stats.partnershipsPending > 0) {
    actions.push({ icon: "🔔", title: `${stats.partnershipsPending} parceria${stats.partnershipsPending > 1 ? "s" : ""} aguardando sua resposta`,
      desc: "Aceite agora e marque presença na rede. Parceria fechada = +10 pontos no ranking.",
      cta: "Responder agora", href: "/parcerias", priority: "high" });
  }

  if (stats.unmatchedBuyers?.length > 0) {
    const b = stats.unmatchedBuyers[0];
    actions.push({ icon: "👤", title: `${b.buyerName} não tem imóvel compatível ainda`,
      desc: `Busca ${PROPERTY_TYPE_LABELS[b.propertyType] ?? "imóvel"} em ${b.desiredCity} até ${formatCurrency(b.maxPrice)}. Você pode fechar isso.`,
      cta: "Buscar oportunidades", href: "/oportunidades", priority: "high" });
  }

  if (stats.propertiesWithoutMatches?.length > 0) {
    const p = stats.propertiesWithoutMatches[0];
    actions.push({ icon: "🏠", title: `"${p.title}" ainda sem matches`,
      desc: "Esse imóvel pode ter compradores compatíveis na rede. Gere matches agora.",
      cta: "Gerar matches", href: "/matches", priority: "medium" });
  }

  if (stats.buyersCount === 0) {
    actions.push({ icon: "🎯", title: "Cadastre seus compradores para gerar matches",
      desc: "Quanto mais compradores você cadastrar, mais oportunidades o sistema encontra para você.",
      cta: "Cadastrar comprador", href: "/compradores", priority: "medium" });
  }

  if (stats.propertiesCount === 0) {
    actions.push({ icon: "🏗️", title: "Nenhum imóvel cadastrado ainda",
      desc: "Imóveis cadastrados aumentam suas chances de fechamento e aparecem nos matches da rede.",
      cta: "Cadastrar imóvel", href: "/meus-imoveis", priority: "medium" });
  }

  if (stats.matchesCount > 0 && stats.partnershipsPending === 0) {
    actions.push({ icon: "⚡", title: `Você tem ${stats.matchesCount} match${stats.matchesCount > 1 ? "es" : ""} — explore parcerias`,
      desc: "Corretores da rede podem ter o comprador certo para os seus imóveis.",
      cta: "Ver parcerias", href: "/parcerias", priority: "low" });
  }

  if (stats.propertiesCount > 0 && (!stats.myOpportunities || stats.myOpportunities.length === 0)) {
    actions.push({ icon: "📢", title: "Publique uma oportunidade urgente no radar",
      desc: "Corretores de toda a rede podem trazer compradores para os seus imóveis com desconto.",
      cta: "Publicar no radar", href: "/oportunidades", priority: "low" });
  }

  if (!actions.length) {
    return (
      <GlassCard glow="blue" className="p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-white">Tudo em dia! Continue assim.</p>
        <p className="text-xs text-slate-500 mt-1">Explore o radar de oportunidades para novas chances.</p>
      </GlassCard>
    );
  }

  const priorityStyles: Record<string, { left: string; badge: string; label: string }> = {
    high:   { left: "border-l-[3px] border-l-red-500/60",    badge: "bg-red-500/10 text-red-400 border-red-500/20",       label: "Urgente"    },
    medium: { left: "border-l-[3px] border-l-amber-500/60",  badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Importante" },
    low:    { left: "border-l-[3px] border-l-indigo-500/40", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", label: "Sugestão" },
  };

  return (
    <GlassCard>
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/15">
          <Lightbulb className="h-4 w-4 text-amber-400" />
        </div>
        <span className="text-sm font-semibold text-white">Oportunidades para agir agora</span>
        <span className="ml-auto text-xs text-slate-500">{Math.min(actions.length, 4)} ação{actions.length !== 1 ? "ões" : ""}</span>
      </div>
      <div className="p-4 space-y-3">
        {actions.slice(0, 4).map((action, i) => {
          const st = priorityStyles[action.priority];
          return (
            <div key={i}
              className={`bg-white/[0.03] rounded-xl p-3.5 ${st.left} hover:bg-white/[0.05] transition-all`}>
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5 flex-shrink-0">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-white leading-tight">{action.title}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{action.desc}</p>
                </div>
                <Link href={action.href}
                  className="flex-shrink-0 text-[11px] font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  {action.cta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─── My Activity Block ────────────────────────────────────────────────────────

function MyActivityBlock({ stats }: { stats: any }) {
  const hasPartnerships  = stats.recentPartnerships?.length > 0;
  const hasMatches       = stats.recentMatches?.length > 0;
  const hasOpportunities = stats.myOpportunities?.length > 0;
  if (!hasPartnerships && !hasMatches && !hasOpportunities) return null;

  return (
    <GlassCard>
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/15">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-white">Atividade recente</span>
      </div>
      <div className="p-4 space-y-2.5">
        {hasPartnerships && stats.recentPartnerships.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl">
            <span className="text-lg">🤝</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">Parceria aceita</p>
              <p className="text-[11px] text-slate-500 truncate">{p.property?.title} · com {p.requesterId === p.receiver?.id ? p.requester?.name : p.receiver?.name}</p>
            </div>
            <Link href="/parcerias" className="text-[10px] text-emerald-400 font-medium whitespace-nowrap flex items-center gap-0.5">
              Ver <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
        {hasMatches && stats.recentMatches.slice(0, 2).map((m: any) => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl">
            <span className="text-lg">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{m.buyer?.buyerName} × {m.property?.title}</p>
              <p className="text-[11px] text-emerald-400 font-medium">Alto potencial de fechamento · {formatCurrency(m.buyer?.maxPrice)}</p>
            </div>
            <Link href="/matches" className="text-[10px] text-amber-400 font-medium whitespace-nowrap flex items-center gap-0.5">
              Ver <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
        {hasOpportunities && stats.myOpportunities.map((o: any) => (
          <div key={o.id} className="flex items-center gap-3 p-3 bg-orange-500/[0.06] border border-orange-500/15 rounded-xl">
            <span className="text-lg">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{o.title}</p>
              <p className="text-[11px] text-orange-400 font-medium">Oportunidade ativa no radar · {o.city}</p>
            </div>
            <Link href="/oportunidades" className="text-[10px] text-orange-400 font-medium whitespace-nowrap flex items-center gap-0.5">
              Ver <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Platform Pulse ───────────────────────────────────────────────────────────

function PlatformPulse() {
  const items = [
    { icon: "🟢", text: "Corretores ativos na plataforma agora" },
    { icon: "🔥", text: "Novas oportunidades sendo publicadas"  },
    { icon: "⚡", text: "Matches acontecendo neste momento"     },
    { icon: "💰", text: "Negócios sendo fechados na rede"       },
  ];
  return (
    <GlassCard className="px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plataforma ao vivo</span>
      </div>
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm leading-none">{item.icon}</span>
            <span className="text-[11px] text-slate-500">{item.text}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─── Recent Properties ────────────────────────────────────────────────────────

function RecentPropertiesCard({ properties }: { properties: any[] }) {
  return (
    <GlassCard>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15">
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-white">Meus Imóveis Recentes</span>
        </div>
        <Link href="/meus-imoveis" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="p-4">
        {!properties?.length ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 mb-2">Nenhum imóvel cadastrado</p>
            <Link href="/meus-imoveis" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Cadastrar agora →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map((p: any) => (
              <Link key={p.id} href="/meus-imoveis"
                className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-border hover:border-border rounded-xl transition-all group">
                <div>
                  <p className="font-medium text-xs text-white truncate max-w-[160px] group-hover:text-indigo-300 transition-colors">{p.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{PROPERTY_TYPE_LABELS[p.type]} · {formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs text-indigo-400">{formatCurrency(p.price)}</p>
                  <span className={`text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded-full font-medium ${
                    p.status === "AVAILABLE"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                  }`}>
                    {PROPERTY_STATUS_LABELS[p.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ─── Recent Matches ───────────────────────────────────────────────────────────

function RecentMatchesCard({ matches }: { matches: any[] }) {
  return (
    <GlassCard>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-white">Matches Recentes</span>
        </div>
        <Link href="/matches" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="p-4">
        {!matches?.length ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
              <Zap className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500 mb-2">Nenhum match gerado ainda</p>
            <Link href="/matches" className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Gerar matches →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m: any) => (
              <Link key={m.id} href="/matches"
                className="block p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-border hover:border-border rounded-xl transition-all group">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-xs text-white group-hover:text-amber-300 transition-colors">{m.buyer?.buyerName}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-300">
                    {m.score}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{m.property?.title}</p>
                <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Alto potencial de fechamento</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey:        ["dashboard-stats"],
    queryFn:         () => api.get("/users/dashboard").then(r => r.data),
    refetchInterval: 60_000,
    staleTime:       30_000,
  });

  const firstName = user?.name?.split(" ")[0] ?? "Corretor";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d1c]">
        <Header title="Dashboard" />
        <div className="p-4 md:p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Compute match score for display
  const matchScore = stats?.matchesCount > 0
    ? Math.min(Math.round((stats.matchesCount / Math.max(stats.propertiesCount + stats.buyersCount, 1)) * 100 + 40), 99)
    : 0;

  return (
    <div className="min-h-screen bg-[#070d1c]">

      {/* ── Deep space background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {/* Large radial glow — center left (behind radar) */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/[0.06] rounded-full blur-[120px]" />
        {/* Top right accent */}
        <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.05] rounded-full blur-[100px]" />
        {/* Bottom left */}
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-blue-700/[0.04] rounded-full blur-[80px]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="relative">
        <Header title="Dashboard" />
        <ActivityTicker />

        <div className="p-4 md:p-6 space-y-5 max-w-[1400px]">

          {/* ══════════════════════════════════════
              HERO SECTION — 3 columns like reference
              Left sidebar | Center Radar | Right stats
          ══════════════════════════════════════ */}
          <div className="grid xl:grid-cols-[280px_1fr_300px] lg:grid-cols-[240px_1fr_280px] gap-5">

            {/* ── LEFT: Greeting + quick nav + plan ── */}
            <div className="flex flex-col gap-4">

              {/* Greeting card */}
              <GlassCard className="p-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Central de Oportunidades</p>
                <h2 className="text-xl font-bold text-white leading-tight">
                  Olá, {firstName} 👋
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Veja as oportunidades que podem virar negócio hoje.
                </p>

                {/* Mini stat pills */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <StatPill value={stats?.propertiesCount ?? 0} label="Imóveis" color="text-indigo-400" />
                  <StatPill value={stats?.buyersCount ?? 0} label="Compradores" color="text-emerald-400" />
                  <StatPill value={stats?.matchesCount ?? 0} label="Matches" color="text-amber-400" />
                  <StatPill value={stats?.partnershipsPending ?? 0} label="Parcerias" color="text-violet-400" />
                </div>
              </GlassCard>

              {/* Quick nav */}
              <GlassCard className="p-3">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">Acesso rápido</p>
                <nav className="space-y-0.5">
                  {[
                    { href: "/matches",       label: "Ver Matches",   icon: Zap,       color: "text-amber-400  hover:bg-amber-500/10"  },
                    { href: "/parcerias",     label: "Parcerias",     icon: UserCheck, color: "text-violet-400 hover:bg-violet-500/10" },
                    { href: "/oportunidades", label: "Radar",         icon: Target,    color: "text-orange-400 hover:bg-orange-500/10" },
                    { href: "/meus-imoveis",  label: "Meus Imóveis",  icon: Building2, color: "text-indigo-400 hover:bg-indigo-500/10" },
                    { href: "/compradores",   label: "Compradores",   icon: Users,     color: "text-emerald-400 hover:bg-emerald-500/10"},
                  ].map(({ href, label, icon: Icon, color }) => (
                    <Link key={href} href={href}
                      className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors ${color}`}>
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />{label}
                    </Link>
                  ))}
                </nav>
              </GlassCard>

              {/* Plan banner compact */}
              <PlanBanner />

            </div>

            {/* ── CENTER: Radar Hero ── */}
            <GlassCard glow="violet" className="relative overflow-hidden flex flex-col">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                    </span>
                    <p className="text-[9px] font-bold text-indigo-400/70 uppercase tracking-widest">Análise em andamento</p>
                  </div>
                  <p className="text-sm font-semibold text-white">Radar de Conexões Ativas</p>
                </div>
                <Link href="/matches"
                  className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-600/25 transition-colors">
                  Explorar <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Radar component */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-5 relative">
                {/* Glow ambiente atrás do radar */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
                </div>
                <MatchRadar stats={stats} size={440} />
              </div>

              {/* Footer info */}
              <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
                <p className="text-[11px] leading-relaxed">
                  {(stats?.matchesCount > 0 || (stats?.myOpportunities?.length ?? 0) > 0) ? (
                    <span className="text-emerald-400 font-medium">
                      Detectando conexões e oportunidades na sua rede
                    </span>
                  ) : (stats?.propertiesCount > 0 || stats?.buyersCount > 0) ? (
                    <span className="text-indigo-400/70">
                      Analisando sua rede — aguarde os primeiros matches
                    </span>
                  ) : (
                    <span className="text-slate-600">Cadastre imóveis e compradores para ativar o radar</span>
                  )}
                </p>
                <span className="relative flex-shrink-0 flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stats?.matchesCount > 0 ? "bg-emerald-400" : stats?.propertiesCount > 0 || stats?.buyersCount > 0 ? "bg-indigo-400" : "bg-slate-700"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${stats?.matchesCount > 0 ? "bg-emerald-400" : stats?.propertiesCount > 0 || stats?.buyersCount > 0 ? "bg-indigo-400" : "bg-slate-700"}`} />
                </span>
              </div>
            </GlassCard>

            {/* ── RIGHT: Score ring + compact stat cards ── */}
            <div className="flex flex-col gap-3">

              {/* Match Score ring card */}
              <GlassCard glow="violet" className="p-5 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opportunity Score</p>
                  <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <MatchScoreRing score={matchScore} label="Score de compatibilidade" />
                <div className="w-full mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Starter", active: false },
                    { label: "Pro",     active: true  },
                    { label: "Premium", active: false },
                  ].map(({ label, active }) => (
                    <Link key={label} href="/meu-plano"
                      className={`text-center text-[10px] font-semibold py-1.5 rounded-lg border transition-colors ${
                        active
                          ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                          : "bg-white/[0.03] border-border text-slate-600 hover:text-slate-400"
                      }`}>
                      {label}
                    </Link>
                  ))}
                </div>
              </GlassCard>

              {/* Compact stat rows */}
              <CompactStatCard
                title="Imóveis na Carteira"
                value={stats?.propertiesCount ?? 0}
                sub={`${stats?.propertiesCount > 0 ? "disponíveis para match" : "nenhum cadastrado"}`}
                badge={stats?.propertiesCount > 0 ? "Ver" : null}
                icon={Building2}
                href="/meus-imoveis"
                accent={{ iconBg: "bg-indigo-500/15", iconColor: "text-indigo-400", valueColor: "text-indigo-300", badgeStyle: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" }}
              />

              <CompactStatCard
                title="Compradores Ativos"
                value={stats?.buyersCount ?? 0}
                sub={`${stats?.buyersCount > 0 ? "na plataforma" : "nenhum cadastrado"}`}
                badge={stats?.buyersCount > 0 ? "Ver" : null}
                icon={Users}
                href="/compradores"
                accent={{ iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", valueColor: "text-emerald-300", badgeStyle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" }}
              />

              <CompactStatCard
                title="Parcerias Pendentes"
                value={stats?.partnershipsPending ?? 0}
                sub={stats?.partnershipsPending > 0 ? "aguardando resposta" : "nenhuma pendente"}
                badge={stats?.partnershipsPending > 0 ? "Urgente" : null}
                icon={UserCheck}
                href="/parcerias"
                accent={{ iconBg: "bg-violet-500/15", iconColor: "text-violet-400", valueColor: "text-violet-300", badgeStyle: "bg-red-500/10 border-red-500/20 text-red-400" }}
              />

            </div>
          </div>

          {/* ── 4 Main Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PremiumStatCard
              title="Meus Imóveis"
              value={stats?.propertiesCount ?? 0}
              sub="na carteira"
              icon={Building2}
              color="blue"
              href="/meus-imoveis"
            />
            <PremiumStatCard
              title="Compradores Ativos"
              value={stats?.buyersCount ?? 0}
              sub="cadastrados"
              icon={Users}
              color="green"
              href="/compradores"
            />
            <PremiumStatCard
              title="Matches Gerados"
              value={stats?.matchesCount ?? 0}
              sub="compatibilidades"
              icon={Zap}
              color="yellow"
              href="/matches"
              pulse
            />
            <PremiumStatCard
              title="Parcerias Pendentes"
              value={stats?.partnershipsPending ?? 0}
              sub="aguardando resposta"
              icon={UserCheck}
              color="purple"
              href="/parcerias"
              pulse
            />
          </div>

          {/* ── Onboarding ── */}
          <OnboardingChecklist user={user} stats={stats} />

          {/* ── Network Opportunities ── */}
          {stats?.networkOpportunities?.length > 0 && (
            <NetworkOppsBlock opps={stats.networkOpportunities} city={stats.userCity} />
          )}

          {/* ── Smart Actions ── */}
          <SmartActionsBlock stats={stats ?? {}} />

          {/* ── Properties + Matches grid ── */}
          <div className="grid lg:grid-cols-2 gap-5">
            <RecentPropertiesCard properties={stats?.recentProperties ?? []} />
            <RecentMatchesCard    matches={stats?.recentMatches ?? []} />
          </div>

          {/* ── Activity + Pulse ── */}
          <MyActivityBlock stats={stats ?? {}} />
          <PlatformPulse />

        </div>
      </div>
    </div>
  );
}