"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Users, BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const steps = [
  {
    id: "property",
    icon: Building2,
    title: "Cadastre seu primeiro imóvel",
    description: "Adicione um imóvel manualmente ou importe diretamente de um link de anúncio.",
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

const colorMap: Record<string, { bg: string; border: string; icon: string; btn: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-600",   btn: "bg-blue-600 hover:bg-blue-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", btn: "bg-violet-600 hover:bg-violet-700" },
};

export default function WelcomePage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const [completing, setCompleting] = useState(false);

  // Guard: redirect unauthenticated users to login
  if (typeof window !== "undefined" && !isAuthenticated) {
    router.replace("/login");
    return null;
  }

  const handleGoToDashboard = async () => {
    setCompleting(true);
    try {
      await api.patch("/users/onboarding/complete");
      updateUser({ isFirstLogin: false });
    } catch {
      // silently ignore — don't block navigation
    } finally {
      setCompleting(false);
      router.push("/dashboard");
    }
  };

  const handleStepClick = async (href: string) => {
    try {
      await api.patch("/users/onboarding/complete");
      updateUser({ isFirstLogin: false });
    } catch {
      // ignore
    }
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
          </Link>
          <button
            onClick={handleGoToDashboard}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Pular →
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Conta criada com sucesso!
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Bem-vindo ao ImobMatch,{" "}
            <span className="text-blue-600">{user?.name?.split(" ")[0] ?? "corretor"}</span>!
          </h1>
          <p className="text-gray-500 text-lg">
            Veja como aproveitar ao máximo a plataforma em 3 passos simples.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
          {steps.map((step, i) => {
            const c = colorMap[step.color];
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`relative bg-white rounded-2xl border-2 ${c.border} p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${c.icon}`} />
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 flex-1 mb-6">{step.description}</p>

                <button
                  onClick={() => handleStepClick(step.href)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 ${c.btn}`}
                >
                  {step.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <Button
          onClick={handleGoToDashboard}
          disabled={completing}
          className="h-11 px-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold"
        >
          Ir para o painel
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </main>
    </div>
  );
}
