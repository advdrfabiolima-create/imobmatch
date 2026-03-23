import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Planos e Preços — ImobMatch",
  description: "Comece grátis e escale quando precisar. Planos para corretores autônomos e imobiliárias.",
};

// ── Dados simplificados exclusivos desta página ───────────────────────────────
// (desacoplado do plans.ts que tem dados do app interno)
const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Teste a plataforma",
    price: null,
    cta: "Criar conta grátis",
    highlighted: false,
    badge: null,
    benefits: [
      "Até 3 imóveis",
      "Até 3 clientes",
      "Acesso ao feed",
      "Parcerias básicas",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Para começar a gerar oportunidades",
    price: 39,
    cta: "Começar agora",
    highlighted: true,
    badge: "Mais escolhido",
    benefits: [
      "Até 20 imóveis",
      "Até 30 clientes",
      "Acesso completo ao sistema",
      "Encontre oportunidades automaticamente",
      "Mais visibilidade na rede",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para fechar mais negócios",
    price: 79,
    cta: "Quero mais visibilidade",
    highlighted: false,
    badge: null,
    benefits: [
      "Imóveis ilimitados",
      "Clientes ilimitados",
      "Prioridade nos matches",
      "Mais destaque no feed",
      "Perfil profissional",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Máxima visibilidade",
    price: 149,
    cta: "Quero prioridade total",
    highlighted: false,
    badge: null,
    benefits: [
      "Prioridade máxima nos matches",
      "Destaque no feed",
      "Destaque no ranking",
      "Mais oportunidades",
      "Analytics completo",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "Para equipes e imobiliárias",
    price: 399,
    cta: "Escalar minha equipe",
    highlighted: false,
    badge: null,
    benefits: [
      "Multiusuário",
      "Gestão de equipe",
      "Permissões por usuário",
      "Dashboard completo",
      "Analytics avançado",
    ],
  },
];

// Estilos hardcoded aqui (não no plans.ts) para garantir que o Tailwind inclua no build
const STYLES: Record<string, { btn: string; check: string; label: string }> = {
  free:    { btn: "bg-gray-800 hover:bg-gray-700",     check: "text-gray-400",   label: "text-gray-500"   },
  starter: { btn: "bg-blue-600 hover:bg-blue-700",     check: "text-blue-500",   label: "text-blue-600"   },
  pro:     { btn: "bg-indigo-600 hover:bg-indigo-700", check: "text-indigo-500", label: "text-indigo-600" },
  premium: { btn: "bg-violet-600 hover:bg-violet-700", check: "text-violet-500", label: "text-violet-600" },
  agency:  { btn: "bg-purple-600 hover:bg-purple-700", check: "text-purple-500", label: "text-purple-600" },
};

const TRUST = [
  "Sem cartão de crédito no free",
  "Cancele quando quiser",
  "Suporte em todos os planos",
];

const FAQ = [
  {
    title: "Comece sem compromisso",
    desc: "O plano Free não pede cartão de crédito e não expira.",
  },
  {
    title: "Cancele quando quiser",
    desc: "Sem fidelidade, sem multa. Você no controle.",
  },
  {
    title: "Suporte incluso",
    desc: "Atendimento por e-mail nos dias úteis.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlansPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
          <Link href="/">
            <img src="/logo_texto_preto.png" alt="ImobMatch" className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 max-w-6xl">

        {/* ── Hero ── */}
        <div className="text-center pt-16 pb-14 md:pt-20 md:pb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Simples. Sem complicação.
          </h1>
          <p className="text-lg text-gray-400">
            Comece grátis. Evolua quando precisar.
          </p>
        </div>

        {/* ── Plans Grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 pb-4">
          {PLANS.map((plan) => {
            const s = STYLES[plan.id];

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-6 transition-shadow ${
                  plan.highlighted
                    ? "bg-blue-50 border-2 border-blue-200 shadow-xl shadow-blue-100/40"
                    : "bg-white border border-gray-100 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* 1 — Nome */}
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${s.label}`}>
                  {plan.name}
                </p>

                {/* 2 — Tagline (altura mínima fixa para alinhar o preço) */}
                <p className="text-sm text-gray-500 leading-snug min-h-[2.5rem] mb-5">
                  {plan.tagline}
                </p>

                {/* 3 — Preço */}
                <div className="mb-5">
                  {plan.price === null ? (
                    <p className="text-4xl font-extrabold text-gray-900">Grátis</p>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">
                        R$&nbsp;{plan.price}
                      </span>
                      <span className="text-sm text-gray-400 mb-1.5">/mês</span>
                    </div>
                  )}
                </div>

                {/* 4 — CTA */}
                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors text-white ${s.btn}`}
                >
                  {plan.cta}
                </Link>

                {/* Divisor */}
                <div className="border-t border-gray-100 mt-6 mb-5" />

                {/* 5 — Benefícios */}
                <ul className="space-y-2.5 flex-1">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${s.check}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Trust strip ── */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-3 text-sm text-gray-400">
          {TRUST.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              <span>{item}</span>
              {i < TRUST.length - 1 && <span className="text-gray-200">·</span>}
            </span>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div className="mt-20 grid md:grid-cols-3 gap-5">
          {FAQ.map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-16 mb-20 text-center bg-blue-600 rounded-2xl px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-2">Pronto para começar?</h2>
          <p className="text-blue-200 mb-7 text-sm">
            Crie sua conta grátis agora. Sem cartão de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-7 py-3 rounded-xl hover:bg-blue-50 transition text-sm"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
