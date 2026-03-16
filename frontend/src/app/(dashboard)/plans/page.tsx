"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  Check,
  Zap,
  Crown,
  Building2,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

type PlanKey = "starter" | "professional" | "agency";

const PLANS: {
  key: PlanKey;
  name: string;
  price: number | null;
  period: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  features: string[];
  limits: string[];
}[] = [
  {
    key: "starter",
    name: "Starter",
    price: 0,
    period: "grátis",
    description: "Para corretores autônomos começando na plataforma.",
    icon: Zap,
    color: "gray",
    features: [
      "Até 10 imóveis cadastrados",
      "Até 20 compradores ativos",
      "Matches automáticos",
      "Busca de corretores",
      "Mensagens entre corretores",
      "Dashboard básico",
    ],
    limits: ["Sem Analytics avançado", "Sem Gestão de Equipe"],
  },
  {
    key: "professional",
    name: "Professional",
    price: 97,
    period: "/mês",
    description: "Para corretores que querem escalar seus resultados.",
    icon: Sparkles,
    color: "blue",
    badge: "Mais popular",
    features: [
      "Até 100 imóveis cadastrados",
      "Compradores ilimitados",
      "Matches automáticos prioritários",
      "Analytics completo",
      "Parcerias ilimitadas",
      "Mensagens entre corretores",
      "Dashboard avançado",
    ],
    limits: ["Sem Gestão de Equipe"],
  },
  {
    key: "agency",
    name: "Agency",
    price: 197,
    period: "/mês",
    description: "Para imobiliárias e equipes de corretores.",
    icon: Crown,
    color: "purple",
    features: [
      "Imóveis ilimitados",
      "Compradores ilimitados",
      "Matches automáticos prioritários",
      "Analytics completo",
      "Parcerias ilimitadas",
      "Gestão de Equipe (convide corretores)",
      "Perfis de equipe unificados",
      "Dashboard avançado",
      "Suporte prioritário",
    ],
    limits: [],
  },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; btn: string }> = {
  gray: {
    ring: "ring-gray-200",
    bg: "bg-gray-50",
    text: "text-gray-600",
    btn: "bg-gray-800 hover:bg-gray-900",
  },
  blue: {
    ring: "ring-blue-500",
    bg: "bg-blue-600",
    text: "text-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  purple: {
    ring: "ring-purple-500",
    bg: "bg-purple-600",
    text: "text-purple-600",
    btn: "bg-purple-600 hover:bg-purple-700",
  },
};

export default function PlansPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);

  if (user?.isLifetime) {
    return (
      <div>
        <Header title="Planos" />
        <div className="p-6 max-w-2xl mx-auto mt-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Vitalício Ativo</h2>
          <p className="text-gray-500 mb-6">
            Você possui o plano Founder com acesso a todos os recursos da plataforma, para sempre.
          </p>
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1.5 text-sm font-semibold">
            Founder / Lifetime
          </Badge>
        </div>
      </div>
    );
  }

  const handleSelectPlan = async (plan: PlanKey) => {
    if (plan === user?.plan) return;
    setLoading(plan);
    try {
      await api.patch("/users/plan", { plan });
      updateUser({ plan });
      toast.success(`Plano ${plan === "agency" ? "Agency" : plan === "professional" ? "Professional" : "Starter"} ativado!`);
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao alterar plano. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <Header title="Planos" />
      <div className="p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu plano</h2>
          <p className="text-gray-500">
            Escale seus resultados com o plano ideal para o seu perfil.
          </p>
          {user?.plan && (
            <p className="text-sm text-blue-600 font-medium mt-2">
              Plano atual:{" "}
              <span className="capitalize font-semibold">{user.plan}</span>
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const colors = COLOR_MAP[plan.color];
            const isCurrent = user?.plan === plan.key;
            const isLoading = loading === plan.key;
            const Icon = plan.icon;

            return (
              <Card
                key={plan.key}
                className={`relative overflow-hidden transition-all duration-200 ${
                  isCurrent
                    ? `ring-2 ${colors.ring}`
                    : plan.key === "professional"
                    ? `ring-2 ring-blue-400 shadow-lg`
                    : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-0 left-0">
                    <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-br-xl">
                      Plano atual
                    </div>
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.color === "gray"
                        ? "bg-gray-100"
                        : plan.color === "blue"
                        ? "bg-blue-100"
                        : "bg-purple-100"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${colors.text}`}
                    />
                  </div>

                  {/* Name & Price */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-extrabold text-gray-900">Grátis</span>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">R$</span>
                        <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                        <span className="text-sm text-gray-500">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                  {/* CTA */}
                  <Button
                    className={`w-full text-white mb-5 gap-2 ${colors.btn}`}
                    disabled={isCurrent || isLoading}
                    onClick={() => handleSelectPlan(plan.key)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      <>
                        <Check className="h-4 w-4" />
                        Plano atual
                      </>
                    ) : plan.key === "starter" ? (
                      "Fazer downgrade"
                    ) : (
                      <>
                        Assinar agora
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limits.map((limit) => (
                      <div key={limit} className="flex items-start gap-2 text-sm">
                        <span className="h-4 w-4 mt-0.5 flex-shrink-0 text-center text-gray-300 font-bold leading-none">
                          ×
                        </span>
                        <span className="text-gray-400">{limit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lifetime Promo */}
        <Card className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-gray-900 text-lg">Acesso Vitalício — Oferta Founder</p>
              <p className="text-sm text-gray-600 mt-1">
                Pague uma única vez e tenha acesso completo para sempre. Sem mensalidades, sem surpresas.
                Disponível para os primeiros <strong>50 clientes</strong>.
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <p className="text-sm text-gray-500 line-through">R$ 2.997</p>
              <p className="text-2xl font-extrabold text-amber-700">R$ 997</p>
              <p className="text-xs text-gray-500 mb-2">pagamento único</p>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white gap-2 w-full sm:w-auto"
                onClick={() => toast.success("Entre em contato pelo suporte para contratar o plano Lifetime.")}
              >
                <Building2 className="h-4 w-4" />
                Quero ser Founder
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 mt-4 text-center">
          * Plataforma em fase MVP — cobrança real será ativada em breve. Teste todos os recursos gratuitamente.
        </p>
      </div>
    </div>
  );
}
