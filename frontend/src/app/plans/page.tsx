import Link from "next/link";
import { Check, X, ArrowRight, Zap } from "lucide-react";
import { PLANS, PLAN_COLORS, formatPlanPrice } from "@/config/plans";
import { COPY } from "@/config/copy";

export const metadata = {
  title: "Planos e Preços — ImobMatch",
  description: "Comece grátis e escale quando precisar. Planos para corretores autônomos e imobiliárias.",
};

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="ImobMatch" className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/imoveis" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Ver imóveis
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {COPY.planPageTitle}
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            {COPY.planPageSubtitle}
          </p>
        </div>

        {/* Plans Grid */}
        <p className="text-center text-sm text-gray-500 mb-8 max-w-xl mx-auto">
          Usuários pagos têm mais visibilidade, mais oportunidades e maior prioridade na plataforma.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {PLANS.map(plan => {
            const colors = PLAN_COLORS[plan.id];
            const isFree = plan.price === null;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col h-full transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                  plan.highlighted ? "border-indigo-500 shadow-xl shadow-indigo-100" : "border-gray-200 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Top section grows to align price+button across cards */}
                <div className="flex-1 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${colors.badge}`}>
                    {plan.name}
                  </span>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{plan.description}</p>
                </div>

                {/* Preço */}
                <div className="mb-5">
                  {isFree ? (
                    <p className="text-3xl font-bold text-gray-900">Grátis</p>
                  ) : (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-gray-900">{formatPlanPrice(plan)}</span>
                        <span className="text-gray-400 mb-1 text-sm">/mês</span>
                      </div>
                      {plan.priceAnnual && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ou R$ {plan.priceAnnual}/ano
                        </p>
                      )}
                    </>
                  )}
                </div>

                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors mb-6 text-white ${colors.btn}`}
                >
                  {plan.cta}
                </Link>

                <div className="border-t border-gray-100 mb-4" />

                <ul className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 text-xs ${feature.included ? "text-gray-700" : "text-gray-400"}`}
                    >
                      {feature.included ? (
                        <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                      ) : (
                        <X className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          {COPY.trust.map(item => (
            <span key={item} className="font-medium">{item}</span>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
          {[
            { title: "Comece sem compromisso",     desc: "O plano Free não pede cartão de crédito e não tem prazo de expiração." },
            { title: "Cancele quando quiser",       desc: "Sem fidelidade, sem multa. Você está no controle da sua assinatura." },
            { title: "Suporte em todos os planos",  desc: "Atendimento via WhatsApp e e-mail nos dias úteis para qualquer dúvida." },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-blue-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-2">Pronto para começar?</h2>
          <p className="text-blue-100 mb-6">
            Crie sua conta grátis agora. Sem cartão de crédito, sem prazo de expiração.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
