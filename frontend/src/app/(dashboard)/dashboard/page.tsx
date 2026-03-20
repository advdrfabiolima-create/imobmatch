"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ActivityTicker } from "@/components/layout/activity-ticker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDate, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";
import {
  Building2, Users, Zap, UserCheck, ArrowRight,
  Crown, Sparkles, Infinity, Flame, MapPin,
  Lightbulb, TrendingUp, Phone, ChevronRight, AlertCircle,
  CheckCircle2, Circle, X, PartyPopper,
} from "lucide-react";
import Link from "next/link";
import { normalizePlan } from "@/config/plans";

// ─── Onboarding Checklist ─────────────────────────────────────────────────────

const STORAGE_KEY = "imobmatch_onboarding_dismissed";

function OnboardingChecklist({ user, stats }: { user: any; stats: any }) {
  const [dismissed, setDismissed]   = useState(true); // inicia true para evitar flash
  const [allDone,   setAllDone]     = useState(false);

  const steps = [
    {
      id:        "account",
      label:     "Conta criada",
      done:      true,
      href:      null,
    },
    {
      id:        "email",
      label:     "Verificar e-mail",
      done:      !!user?.emailVerified,
      href:      "/verificar-email",
    },
    {
      id:        "property",
      label:     "Cadastrar primeiro imóvel",
      done:      (stats?.propertiesCount ?? 0) > 0,
      href:      "/meus-imoveis",
    },
    {
      id:        "buyer",
      label:     "Adicionar primeiro comprador",
      done:      (stats?.buyersCount ?? 0) > 0,
      href:      "/compradores",
    },
    {
      id:        "match",
      label:     "Gerar seu primeiro match",
      done:      (stats?.matchesCount ?? 0) > 0,
      href:      "/matches",
    },
  ];

  const completed = steps.filter(s => s.done).length;
  const total     = steps.length;
  const pct       = Math.round((completed / total) * 100);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    setDismissed(false);
  }, []);

  // Quando todos os passos são concluídos, mostra celebração por 3s e dismiss
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

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  // Tela de conclusão
  if (allDone) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
        <PartyPopper className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-800">Primeiros passos concluídos!</p>
          <p className="text-xs text-emerald-600 mt-0.5">Você está pronto para aproveitar o ImobMatch ao máximo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-50/60 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">Primeiros passos</span>
          <span className="text-xs font-medium text-blue-500 bg-white border border-blue-200 px-2 py-0.5 rounded-full">
            {completed} de {total}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-300 hover:text-blue-500 transition-colors"
          aria-label="Fechar checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-blue-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-50">
        {steps.map((step) => {
          const content = (
            <div className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
              !step.done && step.href ? "hover:bg-blue-50/40 cursor-pointer" : ""
            }`}>
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm flex-1 ${step.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>
                {step.label}
              </span>
              {!step.done && step.href && (
                <ArrowRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              )}
            </div>
          );

          return step.href && !step.done ? (
            <Link key={step.id} href={step.href}>{content}</Link>
          ) : (
            <div key={step.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

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
  const content = (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
          <div className={`relative p-3 rounded-xl bg-${color}-50`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
            {pulse && value > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}-500`} />
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ─── Network Opportunities Block ──────────────────────────────────────────────

function NetworkOppsBlock({ opps, city }: { opps: any[]; city: string | null }) {
  if (!opps.length) return null;

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50/60 to-amber-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          🔥 Oportunidades para você agora
          {city && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
              <MapPin className="h-3 w-3" />{city}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2.5">
        {opps.map((opp: any) => {
          const discount = Math.round(((Number(opp.priceNormal) - Number(opp.priceUrgent)) / Number(opp.priceNormal)) * 100);
          const commission = Math.round(Number(opp.priceUrgent) * 0.03);
          const wppUrl = opp.agent?.phone
            ? `https://wa.me/55${opp.agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${opp.agent.name}, vi sua oportunidade "${opp.title}" no ImobMatch e tenho um cliente interessado!`)}`
            : null;
          return (
            <div key={opp.id} className="bg-white rounded-xl p-3.5 border border-orange-100 hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{opp.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {PROPERTY_TYPE_LABELS[opp.propertyType]} · {opp.city}
                  </p>
                </div>
                <span className="flex-shrink-0 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">{formatCurrency(opp.priceUrgent)}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    💰 Potencial de comissão: {formatCurrency(commission)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {wppUrl && (
                    <a href={wppUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-semibold bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" /> Tenho comprador
                    </a>
                  )}
                  <Link href="/oportunidades"
                    className="text-[11px] font-semibold bg-orange-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        <Link href="/oportunidades" className="flex items-center justify-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium pt-1">
          Ver todas as oportunidades do radar <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Smart Actions Block ───────────────────────────────────────────────────────

function SmartActionsBlock({ stats }: { stats: any }) {
  const actions: { icon: string; title: string; desc: string; cta: string; href: string; priority: "high" | "medium" | "low" }[] = [];

  // Parcerias pendentes — urgente
  if (stats.partnershipsPending > 0) {
    actions.push({
      icon: "🔔",
      title: `${stats.partnershipsPending} parceria${stats.partnershipsPending > 1 ? "s" : ""} aguardando sua resposta`,
      desc: "Aceite agora e marque presença na rede. Parceria fechada = +10 pontos no ranking.",
      cta: "Responder agora",
      href: "/parcerias",
      priority: "high",
    });
  }

  // Compradores sem match
  if (stats.unmatchedBuyers?.length > 0) {
    const b = stats.unmatchedBuyers[0];
    actions.push({
      icon: "👤",
      title: `${b.buyerName} não tem imóvel compatível ainda`,
      desc: `Busca ${PROPERTY_TYPE_LABELS[b.propertyType] ?? "imóvel"} em ${b.desiredCity} até ${formatCurrency(b.maxPrice)}. Você pode fechar isso.`,
      cta: "Buscar oportunidades",
      href: "/oportunidades",
      priority: "high",
    });
  }

  // Imóveis sem matches
  if (stats.propertiesWithoutMatches?.length > 0) {
    const p = stats.propertiesWithoutMatches[0];
    actions.push({
      icon: "🏠",
      title: `"${p.title}" ainda sem matches`,
      desc: "Esse imóvel pode ter compradores compatíveis na rede. Gere matches agora.",
      cta: "Gerar matches",
      href: "/matches",
      priority: "medium",
    });
  }

  // Sem compradores cadastrados
  if (stats.buyersCount === 0) {
    actions.push({
      icon: "🎯",
      title: "Cadastre seus compradores para gerar matches",
      desc: "Quanto mais compradores você cadastrar, mais oportunidades o sistema encontra para você.",
      cta: "Cadastrar comprador",
      href: "/compradores",
      priority: "medium",
    });
  }

  // Sem imóveis
  if (stats.propertiesCount === 0) {
    actions.push({
      icon: "🏗️",
      title: "Nenhum imóvel cadastrado ainda",
      desc: "Imóveis cadastrados aumentam suas chances de fechamento e aparecem nos matches da rede.",
      cta: "Cadastrar imóvel",
      href: "/meus-imoveis",
      priority: "medium",
    });
  }

  // Matches existentes — incentivo para ir a parcerias
  if (stats.matchesCount > 0 && stats.partnershipsPending === 0) {
    actions.push({
      icon: "⚡",
      title: `Você tem ${stats.matchesCount} match${stats.matchesCount > 1 ? "es" : ""} — explore parcerias`,
      desc: "Corretores da rede podem ter o comprador certo para os seus imóveis.",
      cta: "Ver parcerias",
      href: "/parcerias",
      priority: "low",
    });
  }

  // Sugestão de publicar oportunidade urgente
  if (stats.propertiesCount > 0 && (!stats.myOpportunities || stats.myOpportunities.length === 0)) {
    actions.push({
      icon: "📢",
      title: "Publique uma oportunidade urgente no radar",
      desc: "Corretores de toda a rede podem trazer compradores para os seus imóveis com desconto.",
      cta: "Publicar no radar",
      href: "/oportunidades",
      priority: "low",
    });
  }

  if (!actions.length) {
    return (
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="p-5 text-center py-8">
          <Sparkles className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Tudo em dia! Continue assim.</p>
          <p className="text-xs text-gray-500 mt-1">Explore o radar de oportunidades para novas chances.</p>
        </CardContent>
      </Card>
    );
  }

  const priorityBorder: Record<string, string> = {
    high: "border-l-4 border-l-red-400",
    medium: "border-l-4 border-l-amber-400",
    low: "border-l-4 border-l-blue-300",
  };
  const priorityBg: Record<string, string> = {
    high: "bg-red-50",
    medium: "bg-amber-50/60",
    low: "bg-blue-50/40",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          ⚡ Próximas ações para aumentar seus resultados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2.5">
        {actions.slice(0, 4).map((action, i) => (
          <div
            key={i}
            className={`rounded-xl p-3.5 ${priorityBorder[action.priority]} ${priorityBg[action.priority]} transition-all hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{action.desc}</p>
              </div>
              <Link
                href={action.href}
                className="flex-shrink-0 text-[11px] font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                {action.cta}
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── My Activity Block ────────────────────────────────────────────────────────

function MyActivityBlock({ stats }: { stats: any }) {
  const hasPartnerships = stats.recentPartnerships?.length > 0;
  const hasMatches      = stats.recentMatches?.length > 0;
  const hasOpportunities = stats.myOpportunities?.length > 0;

  if (!hasPartnerships && !hasMatches && !hasOpportunities) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Atividade na sua conta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">

        {/* Parcerias aceitas */}
        {hasPartnerships && stats.recentPartnerships.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-lg">🤝</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">Parceria aceita</p>
              <p className="text-[11px] text-gray-500 truncate">
                {p.property?.title} · com {p.requesterId === p.receiver?.id ? p.requester?.name : p.receiver?.name}
              </p>
            </div>
            <Link href="/parcerias" className="text-[10px] text-emerald-600 font-medium whitespace-nowrap flex items-center gap-0.5">
              Ver <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}

        {/* Matches recentes */}
        {hasMatches && stats.recentMatches.slice(0, 2).map((m: any) => (
          <div key={m.id} className="flex items-center gap-3 p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
            <span className="text-lg">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">
                {m.buyer?.buyerName} × {m.property?.title}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Alto potencial de fechamento · {formatCurrency(m.buyer?.maxPrice)}
              </p>
            </div>
            <Link href="/matches" className="text-[10px] text-yellow-700 font-medium whitespace-nowrap flex items-center gap-0.5">
              Ver <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}

        {/* Minhas oportunidades ativas */}
        {hasOpportunities && stats.myOpportunities.map((o: any) => (
          <div key={o.id} className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-lg">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{o.title}</p>
              <p className="text-[11px] text-orange-700 font-medium">
                Oportunidade ativa no radar · {o.city}
              </p>
            </div>
            <Link href="/oportunidades" className="text-[10px] text-orange-600 font-medium whitespace-nowrap flex items-center gap-0.5">
              Ver <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Platform Activity (sem números falsos) ───────────────────────────────────

function PlatformPulse() {
  const items = [
    { icon: "🟢", text: "Corretores ativos na plataforma agora" },
    { icon: "🔥", text: "Novas oportunidades sendo publicadas" },
    { icon: "⚡", text: "Matches acontecendo neste momento" },
    { icon: "💰", text: "Negócios sendo fechados na plataforma" },
  ];
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Atividade agora</span>
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm leading-none">{item.icon}</span>
            <span className="text-[11px] text-slate-300">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Properties ────────────────────────────────────────────────────────

function RecentPropertiesCard({ properties }: { properties: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          Meus Imóveis Recentes
        </CardTitle>
        <Link href="/meus-imoveis" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {!properties?.length ? (
          <div className="text-center py-6">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            <p className="text-xs text-gray-400 mb-2">Nenhum imóvel cadastrado</p>
            <Link href="/meus-imoveis" className="text-xs font-semibold text-blue-600 hover:underline">
              Cadastrar agora →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map((p: any) => (
              <Link key={p.id} href="/meus-imoveis"
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div>
                  <p className="font-medium text-xs text-gray-900 truncate max-w-[160px] group-hover:text-blue-700">{p.title}</p>
                  <p className="text-[11px] text-gray-500">{PROPERTY_TYPE_LABELS[p.type]} · {formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs text-blue-600">{formatCurrency(p.price)}</p>
                  <Badge variant={p.status === "AVAILABLE" ? "success" : "secondary"} className="text-[10px] mt-0.5">
                    {PROPERTY_STATUS_LABELS[p.status]}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent Matches ───────────────────────────────────────────────────────────

function RecentMatchesCard({ matches }: { matches: any[] }) {
  return (
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
        {!matches?.length ? (
          <div className="text-center py-6">
            <Zap className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            <p className="text-xs text-gray-400 mb-2">Nenhum match gerado ainda</p>
            <Link href="/matches" className="text-xs font-semibold text-blue-600 hover:underline">
              Gerar matches →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m: any) => (
              <Link key={m.id} href="/matches"
                className="block p-2.5 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-medium text-xs text-gray-900 group-hover:text-yellow-800">{m.buyer?.buyerName}</p>
                  <Badge variant="warning" className="text-[10px]">Score: {m.score}%</Badge>
                </div>
                <p className="text-[11px] text-gray-500 truncate">{m.property?.title}</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  Oportunidade com potencial de fechamento
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
      <div>
        <Header title="Dashboard" />
        <div className="p-4 md:p-6 space-y-4">
          <div className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" />
      <ActivityTicker />

      <div className="p-4 md:p-6 space-y-5">

        {/* Saudação */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Olá, {firstName} 👋</h2>
            <p className="text-sm text-gray-500">O que você pode fechar hoje?</p>
          </div>
        </div>

        {/* Checklist de onboarding — some após completar ou dismiss */}
        <OnboardingChecklist user={user} stats={stats} />

        <PlanBanner />

        {/* Stats reais do usuário */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Meus Imóveis"        value={stats?.propertiesCount ?? 0}    icon={Building2} color="blue"   href="/meus-imoveis" />
          <StatCard title="Compradores Ativos"  value={stats?.buyersCount ?? 0}         icon={Users}     color="green"  href="/compradores"  />
          <StatCard title="Matches Gerados"     value={stats?.matchesCount ?? 0}        icon={Zap}       color="yellow" href="/matches"       pulse />
          <StatCard title="Parcerias Pendentes" value={stats?.partnershipsPending ?? 0} icon={UserCheck} color="purple" href="/parcerias"     pulse />
        </div>

        {/* Oportunidades da rede na minha região */}
        {stats?.networkOpportunities?.length > 0 && (
          <NetworkOppsBlock opps={stats.networkOpportunities} city={stats.userCity} />
        )}

        {/* Próximas ações inteligentes */}
        <SmartActionsBlock stats={stats ?? {}} />

        {/* Grid: imóveis + matches */}
        <div className="grid lg:grid-cols-2 gap-5">
          <RecentPropertiesCard properties={stats?.recentProperties ?? []} />
          <RecentMatchesCard    matches={stats?.recentMatches ?? []} />
        </div>

        {/* Atividade na conta (dados reais) */}
        <MyActivityBlock stats={stats ?? {}} />

        {/* Plataforma ao vivo — texto, sem números falsos */}
        <PlatformPulse />

      </div>
    </div>
  );
}
