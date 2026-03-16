import Link from "next/link";
import { Check, X, Zap } from "lucide-react";
import { plans, TRIAL_DAYS, PROMO_DAYS } from "@/config/plans";

export const metadata = {
  title: "Planos e Preços - ImobMatch",
  description: "Escolha o plano ideal para o seu negócio imobiliário. Teste grátis por 7 dias.",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="ImobMatch" className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/imoveis" className="text-sm text-gray-600 hover:text-blue-600">
              Ver imóveis
            </Link>
            <Link
              href="/login"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Preço promocional por {PROMO_DAYS} dias · Sem cartão de crédito
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planos para cada etapa
            <br />
            <span className="text-blue-600">do seu negócio</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Do corretor autônomo à imobiliária completa. Escolha o plano que cresce com você.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                plan.highlighted
                  ? "border-blue-600 shadow-xl shadow-blue-100 md:-mt-4 md:mb-4"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
              </div>

              {/* Price com promocional */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-400 line-through">{formatCurrency(plan.priceRegular)}/mês</span>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                    Promo {PROMO_DAYS} dias
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-500 mb-1.5 text-sm">/mês</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ou {formatCurrency(plan.priceAnnual)}/ano · Cancele quando quiser
                </p>
              </div>

              <Link
                href={`/register?plan=${plan.id}`}
                className={`w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors mb-2 ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                    : "border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {plan.cta}
              </Link>

              <p className="text-center text-xs text-gray-400 mb-7">
                {TRIAL_DAYS} dias de teste grátis · Sem cartão de crédito
              </p>

              <div className="border-t border-gray-100 mb-5" />

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm ${
                      feature.included ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          {[
            "✓ Sem cartão de crédito",
            "✓ Cancele quando quiser",
            "✓ Suporte incluso",
            "✓ Dados 100% seguros",
          ].map((item) => (
            <span key={item} className="font-medium">{item}</span>
          ))}
        </div>

        {/* FAQ Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              title: `Teste grátis por ${TRIAL_DAYS} dias`,
              desc: "Experimente todos os recursos do plano escolhido sem precisar de cartão de crédito.",
            },
            {
              title: "Cancele quando quiser",
              desc: "Sem fidelidade, sem multa. Você está no controle da sua assinatura.",
            },
            {
              title: "Suporte incluído",
              desc: "Todos os planos incluem suporte via WhatsApp e e-mail nos dias úteis.",
            },
          ].map((item) => (
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
            Crie sua conta agora e teste grátis por {TRIAL_DAYS} dias. Sem cartão de crédito.
          </p>
          <Link
            href="/register?plan=starter"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Criar conta gratuita
          </Link>
        </div>
      </div>
    </div>
  );
}