"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2, Users, BarChart3, ArrowRight, Sparkles,
  Zap, ArrowRightLeft, ChevronRight,
} from "lucide-react";
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
    accent: { glow: "rgba(37,99,235,0.15)", border: "rgba(37,99,235,0.25)", icon: "#3b82f6", label: "#60a5fa" },
  },
  {
    id: "buyer",
    icon: Users,
    title: "Adicione um comprador",
    description: "Registre o perfil de um cliente e o sistema encontrará imóveis compatíveis automaticamente.",
    href: "/compradores",
    cta: "Adicionar comprador",
    accent: { glow: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.25)", icon: "#818cf8", label: "#a5b4fc" },
  },
  {
    id: "dashboard",
    icon: BarChart3,
    title: "Explore o painel",
    description: "Acompanhe suas estatísticas, matches e parcerias em tempo real.",
    href: "/dashboard",
    cta: "Ver painel",
    accent: { glow: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.25)", icon: "#a78bfa", label: "#c4b5fd" },
  },
];

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
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border"
          style={{
            background: "rgba(37,99,235,0.12)",
            borderColor: "rgba(37,99,235,0.25)",
            color: "#93c5fd",
          }}
        >
          <Sparkles className="h-4 w-4" />
          Conta criada com sucesso!
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
          Bem-vindo ao ImobMatch,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)" }}
          >
            {userName}
          </span>
          !
        </h1>
        <p className="text-white/50 text-lg">
          Veja como aproveitar ao máximo a plataforma em 3 passos simples.
        </p>
      </div>

      {/* Step cards */}
      <div className="grid md:grid-cols-3 gap-5 w-full max-w-4xl mb-10">
        {STEPS_CONFIG.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative rounded-2xl p-6 flex flex-col hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${step.accent.border}`,
                boxShadow: `0 0 30px ${step.accent.glow}`,
              }}
            >
              {/* Step number */}
              <div
                className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "#0f1629",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {i + 1}
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: step.accent.glow }}
              >
                <Icon className="h-6 w-6" style={{ color: step.accent.icon }} />
              </div>

              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/45 flex-1 mb-6 leading-relaxed">{step.description}</p>

              <button
                onClick={() => onStepClick(step.href)}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-150 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 2px 12px rgba(37,99,235,0.25)",
                }}
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
        className="group inline-flex items-center gap-2 text-sm font-semibold text-white/35 hover:text-white/70 transition-colors"
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
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 border"
          style={{
            background: "rgba(124,58,237,0.12)",
            borderColor: "rgba(124,58,237,0.25)",
            color: "#c4b5fd",
          }}
        >
          <Zap className="h-4 w-4" />
          Como o matching funciona
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
          Veja como funciona um match na prática
        </h2>
        <p className="text-white/45 text-base leading-relaxed max-w-lg mx-auto">
          Usamos os dados que você acabou de cadastrar para simular uma conexão.
        </p>
      </div>

      {/* Nota de simulação */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 mb-7 text-sm border"
        style={{
          background: "rgba(245,158,11,0.08)",
          borderColor: "rgba(245,158,11,0.20)",
          color: "#fcd34d",
        }}
      >
        <span className="text-base leading-none mt-0.5 flex-shrink-0">⚠️</span>
        <span>
          <span className="font-semibold">Isso é uma simulação.</span>{" "}
          <span style={{ color: "rgba(252,211,77,0.7)" }}>
            Os dados abaixo são exemplos criados para ilustrar. Os matches reais aparecem no seu painel quando outros corretores cadastrarem dados compatíveis.
          </span>
        </span>
      </div>

      {/* Bloco de destaque */}
      <div
        className="rounded-2xl p-6 mb-7 border"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.20) 0%, rgba(124,58,237,0.20) 100%)",
          borderColor: "rgba(124,58,237,0.25)",
          boxShadow: "0 0 40px rgba(124,58,237,0.12)",
        }}
      >
        <div className="flex items-start gap-3 mb-5">
          <span className="text-xl leading-none flex-shrink-0">💡</span>
          <div>
            <p className="font-bold text-base text-white mb-2">Na prática, isso acontece entre:</p>
            <ul className="space-y-2 text-sm text-white/55">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                compradores cadastrados por{" "}
                <span className="font-semibold text-white/80 mx-1">outros corretores</span>{" "}
                e imóveis cadastrados por{" "}
                <span className="font-semibold text-white/80 ml-1">você</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                ou o contrário: seu comprador com o imóvel de outro corretor
              </li>
            </ul>
          </div>
        </div>

        {/* Fluxo visual */}
        <div
          className="rounded-xl p-4 border"
          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)" }}
        >
          <p className="text-xs text-white/35 uppercase tracking-wider font-semibold mb-4 text-center">
            Fluxo de um match
          </p>

          <div className="space-y-3">
            {/* Fluxo 1 */}
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-lg px-3 py-2 text-center border"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                <p className="text-[10px] text-white/35 font-medium uppercase tracking-wide mb-0.5">Você</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Seu imóvel</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div
                className="flex-1 rounded-lg px-3 py-2 text-center border"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                <p className="text-[10px] text-white/35 font-medium uppercase tracking-wide mb-0.5">Outro corretor</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Comprador dele</span>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Fluxo 2 */}
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-lg px-3 py-2 text-center border"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                <p className="text-[10px] text-white/35 font-medium uppercase tracking-wide mb-0.5">Você</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Seu comprador</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div
                className="flex-1 rounded-lg px-3 py-2 text-center border"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                <p className="text-[10px] text-white/35 font-medium uppercase tracking-wide mb-0.5">Outro corretor</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Imóvel dele</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulação de match real */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">
          Exemplo de como um match aparece
        </p>
        <div
          className="rounded-2xl border p-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-start gap-4">
            {/* Imóvel */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,99,235,0.15)" }}
                >
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wide">Imóvel</p>
                  <p className="text-sm font-bold text-white/80 truncate">Casa em Salvador, BA</p>
                </div>
              </div>
              <div className="text-xs text-white/35 space-y-0.5 pl-10">
                <p>4 quartos · 180 m²</p>
                <p className="text-blue-400 font-semibold">R$ 620.000</p>
              </div>
            </div>

            {/* Seta de match */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 2px 12px rgba(124,58,237,0.35)",
                }}
              >
                <ArrowRightLeft className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                style={{
                  color: "#c4b5fd",
                  background: "rgba(124,58,237,0.15)",
                  borderColor: "rgba(124,58,237,0.25)",
                }}
              >
                94%
              </span>
            </div>

            {/* Comprador */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.15)" }}
                >
                  <Users className="h-4 w-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wide">Comprador</p>
                  <p className="text-sm font-bold text-white/80 truncate">Carlos Santos</p>
                </div>
              </div>
              <div className="text-xs text-white/35 space-y-0.5 pl-10">
                <p>Quer casa · 3–4q</p>
                <p className="text-white/50 font-medium">Até R$ 650.000</p>
              </div>
            </div>
          </div>

          {/* Barra de compatibilidade */}
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/30">Compatibilidade</span>
              <span className="text-xs font-bold text-violet-400">94%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: "94%",
                  background: "linear-gradient(to right, #2563eb, #7c3aed)",
                }}
              />
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-xs text-white/25 italic">Simulação — dados de exemplo para ilustração</p>
          </div>
        </div>
      </div>

      {/* Reforço de valor */}
      <div className="text-center mb-8">
        <p className="text-base font-semibold text-white/70">
          É assim que novos negócios surgem dentro da rede.
        </p>
        <p className="text-sm text-white/35 mt-1">
          Cada imóvel ou comprador que você cadastra aumenta suas chances de match com outros corretores.
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={onFinish}
          disabled={finishing}
          className="group w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            boxShadow: finishing ? "none" : "0 4px 20px rgba(37,99,235,0.30)",
          }}
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
        <p className="text-center text-xs text-white/25">
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full"
        style={{ background: "rgba(124,58,237,0.06)", filter: "blur(140px)", zIndex: 0 }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full"
        style={{ background: "rgba(37,99,235,0.05)", filter: "blur(120px)", zIndex: 0 }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl border-b"
        style={{
          background: "rgba(6,12,26,0.80)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image
              src="/logo_texto_branco.png"
              alt="ImobMatch"
              width={140}
              height={40}
              className="h-5 w-auto object-contain"
            />
          </Link>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen("welcome")}
              className={`h-2 rounded-full transition-all duration-300 ${
                screen === "welcome"
                  ? "w-6 bg-blue-500"
                  : "w-2 bg-white/15 hover:bg-white/25"
              }`}
              aria-label="Etapa 1"
            />
            <button
              onClick={() => setScreen("match-demo")}
              className={`h-2 rounded-full transition-all duration-300 ${
                screen === "match-demo"
                  ? "w-6 bg-blue-500"
                  : "w-2 bg-white/15 hover:bg-white/25"
              }`}
              aria-label="Etapa 2"
            />
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Pular →
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
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
