"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, Users, BarChart3, ArrowRight, Sparkles,
  Zap, ArrowRightLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const STEPS_CONFIG = [
  {
    id: "property",
    icon: Building2,
    title: "Cadastre seu primeiro imóvel",
    description: "Adicione um imóvel e ele fica disponível para toda a rede de corretores.",
    href: "/meus-imoveis",
    cta: "Cadastrar imóvel",
    color: "blue",
  },
  {
    id: "buyer",
    icon: Users,
    title: "Adicione um comprador",
    description: "Registre o perfil de um cliente e o sistema encontrará imóveis compatíveis automaticamente.",
    href: "/compradores",
    cta: "Adicionar comprador",
    color: "indigo",
  },
  {
    id: "dashboard",
    icon: BarChart3,
    title: "Explore o painel",
    description: "Acompanhe suas estatísticas, matches e parcerias em tempo real.",
    href: "/dashboard",
    cta: "Ver painel",
    color: "violet",
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string; btn: string; gradFrom: string; gradTo: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-600",   btn: "bg-blue-600 hover:bg-blue-700",     gradFrom: "from-blue-500",   gradTo: "to-blue-600"   },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700", gradFrom: "from-indigo-500", gradTo: "to-indigo-600" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", btn: "bg-violet-600 hover:bg-violet-700", gradFrom: "from-violet-500", gradTo: "to-violet-600" },
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Boas-vindas + ações
// ─────────────────────────────────────────────────────────────────────────────

function StepWelcome({
  userName,
  onNext,
  onStepClick,
}: {
  userName: string;
  onNext: () => void;
  onStepClick: (href: string) => void;
}) {
  return (
    <>
      {/* Hero */}
      <div className="text-center mb-12 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-100">
          <Sparkles className="h-4 w-4" />
          Conta criada com sucesso!
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Bem-vindo ao ImobMatch,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            {userName}
          </span>
          !
        </h1>
        <p className="text-gray-500 text-lg">
          Veja como aproveitar ao máximo a plataforma em 3 passos simples.
        </p>
      </div>

      {/* Step cards */}
      <div className="grid md:grid-cols-3 gap-5 w-full max-w-4xl mb-10">
        {STEPS_CONFIG.map((step, i) => {
          const c = COLOR_MAP[step.color];
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`relative bg-white rounded-2xl border-2 ${c.border} p-6 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="absolute -top-3 -left-3 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                {i + 1}
              </div>
              <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 ${c.icon}`} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 flex-1 mb-6 leading-relaxed">{step.description}</p>
              <button
                onClick={() => onStepClick(step.href)}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 ${c.btn}`}
              >
                {step.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Advance */}
      <button
        onClick={onNext}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
      >
        Ver como funciona o matching
        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Demonstração de match
// ─────────────────────────────────────────────────────────────────────────────

function StepMatchDemo({ onFinish, finishing }: { onFinish: () => void; finishing: boolean }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-violet-100">
          <Zap className="h-4 w-4" />
          Como o matching funciona
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Veja como funciona um match na prática
        </h2>
        <p className="text-gray-500 text-base leading-relaxed max-w-lg mx-auto">
          Usamos os dados que você acabou de cadastrar para simular uma conexão.
        </p>
      </div>

      {/* Nota de simulação */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-7 text-sm text-amber-800">
        <span className="text-base leading-none mt-0.5 flex-shrink-0">⚠️</span>
        <span>
          <span className="font-semibold">Isso é uma simulação.</span> Os dados abaixo são exemplos criados para ilustrar. Os matches reais aparecem no seu painel quando outros corretores cadastrarem dados compatíveis.
        </span>
      </div>

      {/* Bloco de destaque — o conceito */}
      <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 mb-7 text-white shadow-lg shadow-blue-200/50">
        <div className="flex items-start gap-3 mb-5">
          <span className="text-xl leading-none flex-shrink-0">💡</span>
          <div>
            <p className="font-bold text-base mb-2">Na prática, isso acontece entre:</p>
            <ul className="space-y-2 text-sm text-blue-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0 mt-1.5" />
                compradores cadastrados por <span className="font-semibold text-white mx-1">outros corretores</span> e imóveis cadastrados por <span className="font-semibold text-white ml-1">você</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0 mt-1.5" />
                ou o contrário: seu comprador com o imóvel de outro corretor
              </li>
            </ul>
          </div>
        </div>

        {/* Fluxo visual */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-4 text-center">Fluxo de um match</p>

          <div className="space-y-3">
            {/* Fluxo 1 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                <p className="text-[10px] text-blue-200 font-medium uppercase tracking-wide mb-0.5">Você</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">Seu imóvel</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Zap className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                <p className="text-[10px] text-blue-200 font-medium uppercase tracking-wide mb-0.5">Outro corretor</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-white flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">Comprador dele</span>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Fluxo 2 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                <p className="text-[10px] text-blue-200 font-medium uppercase tracking-wide mb-0.5">Você</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-white flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">Seu comprador</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Zap className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                <p className="text-[10px] text-blue-200 font-medium uppercase tracking-wide mb-0.5">Outro corretor</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">Imóvel dele</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulação de match real */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Exemplo de como um match aparece
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Imóvel */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Imóvel</p>
                  <p className="text-sm font-bold text-gray-900 truncate">Casa em Salvador, BA</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 pl-10">
                <p>4 quartos · 180 m²</p>
                <p className="text-blue-600 font-semibold">R$ 620.000</p>
              </div>
            </div>

            {/* Seta de match */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-200">
                <ArrowRightLeft className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full border border-violet-100">
                94%
              </span>
            </div>

            {/* Comprador */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Comprador</p>
                  <p className="text-sm font-bold text-gray-900 truncate">Carlos Santos</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 pl-10">
                <p>Quer casa · 3–4q</p>
                <p className="font-medium">Até R$ 650.000</p>
              </div>
            </div>
          </div>

          {/* Barra de compatibilidade */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Compatibilidade</span>
              <span className="text-xs font-bold text-violet-600">94%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000"
                style={{ width: "94%" }}
              />
            </div>
          </div>

          {/* Rodapé da simulação */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-xs text-gray-400 italic">Simulação — dados de exemplo para ilustração</p>
          </div>
        </div>
      </div>

      {/* Reforço de valor */}
      <div className="text-center mb-8">
        <p className="text-base font-semibold text-gray-700">
          É assim que novos negócios surgem dentro da rede.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Cada imóvel ou comprador que você cadastra aumenta suas chances de match com outros corretores.
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={onFinish}
          disabled={finishing}
          className="group w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-300/40 hover:shadow-xl hover:opacity-95 active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
        >
          {finishing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Carregando...
            </span>
          ) : (
            <>
              Ver oportunidades reais
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400">
          Agora vamos encontrar oportunidades reais para você
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const [screen, setScreen] = useState<"welcome" | "match-demo">("welcome");
  const [finishing, setFinishing] = useState(false);

  if (typeof window !== "undefined" && !isAuthenticated) {
    router.replace("/login");
    return null;
  }

  const completeOnboarding = async () => {
    try {
      await api.patch("/users/onboarding/complete");
      updateUser({ isFirstLogin: false });
    } catch {
      // silently ignore
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.push("/dashboard");
  };

  const handleStepClick = async (href: string) => {
    await completeOnboarding();
    router.push(href);
  };

  const handleFinish = async () => {
    setFinishing(true);
    await completeOnboarding();
    router.push("/dashboard");
  };

  const firstName = user?.name?.split(" ")[0] ?? "corretor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50/40 flex flex-col">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/">
            <img src="/logo_texto_preto.png" alt="ImobMatch" className="h-9 w-auto object-contain" />
          </Link>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen("welcome")}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                screen === "welcome"
                  ? "bg-blue-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label="Etapa 1"
            />
            <button
              onClick={() => setScreen("match-demo")}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                screen === "match-demo"
                  ? "bg-blue-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label="Etapa 2"
            />
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Pular →
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {screen === "welcome" && (
          <StepWelcome
            userName={firstName}
            onNext={() => setScreen("match-demo")}
            onStepClick={handleStepClick}
          />
        )}

        {screen === "match-demo" && (
          <StepMatchDemo
            onFinish={handleFinish}
            finishing={finishing}
          />
        )}
      </main>
    </div>
  );
}
