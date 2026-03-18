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
  Check, X, Crown, Star, Loader2, ArrowRight,
  Zap, Sparkles, Gem, Building2, Users,
} from "lucide-react";
import { PLANS, PLAN_COLORS, formatPlanPrice, getPlanById } from "@/config/plans";
import { COPY } from "@/config/copy";
import toast from "react-hot-toast";

const PLAN_ICONS: Record<string, React.ElementType> = {
  free:    Users,
  starter: Zap,
  pro:     Sparkles,
  premium: Gem,
  agency:  Building2,
};

function FounderBadge() {
  return (
    <div className="p-6 max-w-2xl mx-auto mt-8 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
        <Crown className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Vitalício Ativo</h2>
      <p className="text-gray-500 mb-4">
        Você possui acesso completo a todos os recursos da plataforma, para sempre.
      </p>
      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1.5 text-sm font-semibold">
        {COPY.founderBadge} · Lifetime
      </Badge>
    </div>
  );
}

export default function MeuPlanoPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (user?.isLifetime) {
    return (
      <div>
        <Header title="Meu Plano" />
        <FounderBadge />
      </div>
    );
  }

  const currentPlan = user?.plan ?? "free";

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return;
    if (planId === "agency") {
      window.open("mailto:contato@useimobmatch.com.br?subject=Plano Agency", "_blank");
      return;
    }
    setLoading(planId);
    try {
      await api.patch("/users/plan", { plan: planId });
      updateUser({ plan: planId as any });
      toast.success(`Plano ${getPlanById(planId)?.name} ativado!`);
      router.push("/dashboard");
    } catch {
      toast.error("Erro ao alterar plano. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <Header title="Meu Plano" />
      <div className="p-4 md:p-6 max-w-6xl">

        {/* Founder badge para usuários iniciais */}
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">{COPY.founderMsg}</p>
            <p className="text-xs text-amber-700">Corretores que entram agora têm vantagem competitiva na rede.</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Escolha seu plano</h2>
          <p className="text-gray-500 text-sm mt-1">
            Plano atual: <span className="font-semibold text-blue-600 capitalize">{getPlanById(currentPlan)?.name ?? currentPlan}</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PLANS.map(plan => {
            const colors = PLAN_COLORS[plan.id];
            const Icon = PLAN_ICONS[plan.id] ?? Zap;
            const isCurrent = currentPlan === plan.id;
            const isLoading = loading === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-200 ${
                  isCurrent ? `ring-2 ${colors.ring}` : plan.highlighted ? "ring-2 ring-indigo-400 shadow-lg" : ""
                }`}
              >
                {plan.badge && !isCurrent && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                      {plan.badge}
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0">
                    <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-br-xl">
                      {COPY.currentPlan}
                    </div>
                  </div>
                )}

                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors.iconBg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>

                  <div className="mb-3">
                    {plan.price === null ? (
                      <p className="text-2xl font-extrabold text-gray-900">Grátis</p>
                    ) : (
                      <>
                        <p className="text-2xl font-extrabold text-gray-900">{formatPlanPrice(plan)}<span className="text-sm font-normal text-gray-400">/mês</span></p>
                        {plan.priceAnnual && (
                          <p className="text-xs text-gray-400">ou R$ {plan.priceAnnual}/ano</p>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{plan.description}</p>

                  <Button
                    className={`w-full text-white text-xs mb-4 gap-1.5 ${colors.btn}`}
                    size="sm"
                    disabled={isCurrent || isLoading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isCurrent ? (
                      <><Check className="h-3.5 w-3.5" /> {COPY.currentPlan}</>
                    ) : plan.id === "agency" ? (
                      "Falar com o time"
                    ) : (
                      <>{COPY.upgradeCta} <ArrowRight className="h-3.5 w-3.5" /></>
                    )}
                  </Button>

                  <ul className="space-y-1.5">
                    {plan.features.slice(0, 5).map(feature => (
                      <li key={feature.text} className={`flex items-start gap-1.5 text-xs ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                        {feature.included
                          ? <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                          : <X className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-gray-300" />
                        }
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Pagamentos e cobranças serão ativados em breve. Explore todos os recursos gratuitamente até lá.
        </p>
      </div>
    </div>
  );
}
