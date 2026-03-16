"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Check, Zap, Crown, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { plans, PROMO_DAYS } from "@/config/plans";
import toast from "react-hot-toast";

type PlanKey = "starter" | "professional" | "agency";

const ICON_MAP: Record<string, React.ElementType> = {
  starter: Zap,
  professional: Sparkles,
  agency: Crown,
};

const COLOR_MAP: Record<string, { ring: string; text: string; btn: string; iconBg: string }> = {
  starter: {
    ring: "ring-gray-200",
    text: "text-gray-600",
    btn: "bg-gray-800 hover:bg-gray-900",
    iconBg: "bg-gray-100",
  },
  professional: {
    ring: "ring-blue-500",
    text: "text-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700",
    iconBg: "bg-blue-100",
  },
  agency: {
    ring: "ring-purple-500",
    text: "text-purple-600",
    btn: "bg-purple-600 hover:bg-purple-700",
    iconBg: "bg-purple-100",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

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
      <div className="p-4 md:p-6 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu plano</h2>
          <p className="text-gray-500">Escale seus resultados com o plano ideal para o seu perfil.</p>
          {user?.plan && (
            <p className="text-sm text-blue-600 font-medium mt-2">
              Plano atual: <span className="capitalize font-semibold">{user.plan}</span>
            </p>
          )}
        </div>

        {/* Faixa promocional */}
        <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <Zap className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span>
            <strong>Preço promocional de lançamento</strong> — válido pelos primeiros {PROMO_DAYS} dias.
            Após esse período, o valor regular será aplicado automaticamente.
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const colors = COLOR_MAP[plan.id];
            const Icon = ICON_MAP[plan.id];
            const isCurrent = user?.plan === plan.id;
            const isLoadingPlan = loading === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-200 ${
                  isCurrent
                    ? `ring-2 ${colors.ring}`
                    : plan.highlighted
                    ? "ring-2 ring-blue-400 shadow-lg"
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors.iconBg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>

                  {/* Preço com riscado */}
                  <div className="mb-1">
                    <span className="text-xs text-gray-400 line-through mr-2">{formatCurrency(plan.priceRegular)}/mês</span>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                      Promo {PROMO_DAYS} dias
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm text-gray-500">R$</span>
                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">/mês</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    ou {formatCurrency(plan.priceAnnual)}/ano
                  </p>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                  <Button
                    className={`w-full text-white mb-5 gap-2 ${colors.btn}`}
                    disabled={isCurrent || isLoadingPlan}
                    onClick={() => handleSelectPlan(plan.id as PlanKey)}
                  >
                    {isLoadingPlan ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      <>
                        <Check className="h-4 w-4" /> Plano atual
                      </>
                    ) : plan.id === "starter" && user?.plan !== "starter" ? (
                      "Fazer downgrade"
                    ) : (
                      <>
                        Assinar agora <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                        ) : (
                          <span className="h-4 w-4 mt-0.5 flex-shrink-0 text-center text-gray-300 font-bold leading-none">×</span>
                        )}
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          * Plataforma em fase MVP — cobrança real será ativada em breve. Teste todos os recursos gratuitamente.
        </p>
      </div>
    </div>
  );
}