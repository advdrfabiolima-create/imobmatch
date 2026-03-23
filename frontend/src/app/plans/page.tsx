import Link from "next/link";
import { Check, X, Minus, ArrowRight, Zap, Shield, Headphones } from "lucide-react";

export const metadata = {
  title: "Planos e Preços — ImobMatch",
  description: "Comece grátis e escale quando precisar. Planos para corretores autônomos e imobiliárias.",
};

// ── Dados ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore a plataforma sem compromisso",
    price: null,
    cta: "Criar conta grátis",
    highlighted: false,
    badge: null,
    color: "from-gray-500 to-gray-600",
    borderColor: "border-white/10",
    benefits: ["Até 3 imóveis", "Até 3 clientes", "Acesso ao feed", "Parcerias básicas"],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Para começar a gerar oportunidades",
    price: 39,
    cta: "Começar agora",
    highlighted: true,
    badge: "Mais escolhido",
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-400/50",
    benefits: ["Até 20 imóveis", "Até 30 clientes", "Acesso completo", "Matches automáticos", "Mais visibilidade"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para fechar mais negócios",
    price: 79,
    cta: "Quero mais visibilidade",
    highlighted: false,
    badge: null,
    color: "from-indigo-500 to-violet-600",
    borderColor: "border-indigo-400/30",
    benefits: ["Imóveis ilimitados", "Clientes ilimitados", "Prioridade nos matches", "Destaque no feed", "Perfil profissional"],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Máxima visibilidade na rede",
    price: 149,
    cta: "Quero prioridade total",
    highlighted: false,
    badge: null,
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-400/30",
    benefits: ["Prioridade máxima", "Destaque no feed", "Destaque no ranking", "Analytics completo", "Suporte prioritário"],
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "Para equipes e imobiliárias",
    price: 399,
    cta: "Escalar minha equipe",
    highlighted: false,
    badge: null,
    color: "from-purple-600 to-pink-600",
    borderColor: "border-purple-400/30",
    benefits: ["Multiusuário", "Gestão de equipe", "Permissões por usuário", "Analytics avançado", "Suporte dedicado"],
  },
];

// ── Tabela comparativa ────────────────────────────────────────────────────────

type CellValue = boolean | string;

interface CompRow {
  label: string;
  category?: boolean;
  values: CellValue[];
}

const COMPARE: CompRow[] = [
  { label: "Cadastro", category: true, values: [] },
  { label: "Imóveis",                values: ["3",         "20",          "Ilimitados",  "Ilimitados",  "Ilimitados"] },
  { label: "Clientes (compradores)", values: ["3",         "30",          "Ilimitados",  "Ilimitados",  "Ilimitados"] },
  { label: "Matches",                category: true, values: [] },
  { label: "Geração de matches",     values: [true,        true,          true,          true,          true]  },
  { label: "Prioridade nos matches", values: [false,       false,         "Alta",        "Máxima",      "Máxima"] },
  { label: "Feed e Visibilidade",    category: true, values: [] },
  { label: "Feed de oportunidades",  values: [true,        true,          true,          true,          true]  },
  { label: "Destaque no feed",       values: [false,       false,         true,          true,          true]  },
  { label: "Destaque no ranking",    values: [false,       false,         false,         true,          true]  },
  { label: "Parcerias",              category: true, values: [] },
  { label: "Solicitação de parceria",values: ["Básica",    true,          true,          true,          true]  },
  { label: "Término de parceria digital", values: [false,  true,          true,          true,          true]  },
  { label: "Perfil e Analytics",     category: true, values: [] },
  { label: "Perfil profissional",    values: [false,       false,         true,          true,          true]  },
  { label: "Analytics",              values: [false,       "Básico",      "Completo",    "Completo",    "Avançado"] },
  { label: "Equipe",                 category: true, values: [] },
  { label: "Multiusuário",           values: [false,       false,         false,         false,         true]  },
  { label: "Gestão de equipe",       values: [false,       false,         false,         false,         true]  },
  { label: "Suporte",                category: true, values: [] },
  { label: "Suporte por e-mail",     values: [true,        true,          true,          true,          true]  },
  { label: "Suporte prioritário",    values: [false,       false,         false,         true,          true]  },
  { label: "Suporte dedicado",       values: [false,       false,         false,         false,         true]  },
];

const PLAN_COLORS = ["text-gray-400", "text-blue-400", "text-indigo-400", "text-violet-400", "text-purple-400"];

function Cell({ value, col }: { value: CellValue; col: number }) {
  if (value === true)  return <Check className={`h-4 w-4 mx-auto ${PLAN_COLORS[col]}`} />;
  if (value === false) return <Minus className="h-4 w-4 mx-auto text-white/15" />;
  return <span className={`text-xs font-semibold ${PLAN_COLORS[col]}`}>{value}</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlansPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e" }}>

      {/* ── Header (igual à Home) ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md"
        style={{ background: "linear-gradient(160deg, #0b1849 0%, #18106a 44%, #361178 72%, #461a8e 100%)" }}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo_texto_branco.png" alt="ImobMatch" className="h-5 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {[
              { href: "/#features", label: "Funcionalidades" },
              { href: "/#oportunidades", label: "Oportunidades" },
              { href: "/plans", label: "Planos" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="hidden md:inline text-sm font-medium text-white/70 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/register"
              className="text-sm bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-500/15 border border-blue-400/20 px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-3 w-3" /> Preços simples e transparentes
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 tracking-tight leading-[1.05]">
            Invista no seu crescimento
          </h1>
          <p className="text-lg text-blue-200/70 max-w-xl mx-auto leading-relaxed">
            Comece grátis e evolua conforme sua carteira cresce. Sem fidelidade, sem surpresas.
          </p>
        </div>
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-blue-600/20 to-blue-900/20 border-blue-400/50 shadow-2xl shadow-blue-500/20 scale-[1.02]"
                  : "bg-white/5 hover:bg-white/8 border-white/10 hover:border-white/20"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-500/30 whitespace-nowrap">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {/* Gradiente nome */}
              <div className={`inline-flex w-fit mb-3 px-2.5 py-1 rounded-lg bg-gradient-to-r ${plan.color} bg-clip-text`}>
                <p className="text-[11px] font-black uppercase tracking-widest text-transparent bg-gradient-to-r bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                  {plan.name}
                </p>
              </div>

              <p className="text-xs text-white/50 leading-snug min-h-[2.5rem] mb-5">{plan.tagline}</p>

              {/* Preço */}
              <div className="mb-5">
                {plan.price === null ? (
                  <p className="text-4xl font-extrabold text-white">Grátis</p>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">R$&nbsp;{plan.price}</span>
                    <span className="text-sm text-white/40 mb-1.5">/mês</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link href={`/register?plan=${plan.id}`}
                className={`w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-all text-white bg-gradient-to-r ${plan.color} hover:opacity-90 hover:shadow-lg`}>
                {plan.cta}
              </Link>

              <div className="border-t border-white/8 mt-6 mb-5" />

              {/* Benefícios */}
              <ul className="space-y-2.5 flex-1">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-white/60">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Trust strip ── */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-white/35">
          {[
            { icon: Shield, text: "Sem cartão no plano Free" },
            { icon: X,      text: "Cancele quando quiser" },
            { icon: Headphones, text: "Suporte em todos os planos" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-white/25" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Tabela Comparativa ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
            Compare os planos
          </h2>
          <p className="text-white/45 text-sm">Veja o que está incluído em cada plano em detalhe</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10"
                style={{ background: "linear-gradient(160deg, #0b1849 0%, #18106a 60%, #2d1070 100%)" }}>
                <th className="text-left px-6 py-4 text-sm font-semibold text-white/50 w-56">Recurso</th>
                {PLANS.map((p, i) => (
                  <th key={p.id} className="px-4 py-4 text-center">
                    <span className={`text-xs font-black uppercase tracking-widest ${PLAN_COLORS[i]}`}>
                      {p.name}
                    </span>
                    {p.highlighted && (
                      <div className="text-[9px] text-blue-300/70 font-semibold mt-0.5">Mais popular</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, idx) => {
                if (row.category) {
                  return (
                    <tr key={row.label}
                      className="border-b border-white/5"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <td colSpan={6} className="px-6 py-3">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                          {row.label}
                        </span>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={row.label}
                    className={`border-b border-white/5 transition-colors hover:bg-white/3 ${
                      idx % 2 === 0 ? "bg-white/[0.015]" : ""
                    }`}>
                    <td className="px-6 py-3.5 text-sm text-white/60">{row.label}</td>
                    {row.values.map((val, col) => (
                      <td key={col}
                        className={`px-4 py-3.5 text-center ${col === 1 ? "bg-blue-500/5" : ""}`}>
                        <Cell value={val} col={col} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ cards ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield,      title: "Comece sem compromisso", desc: "O plano Free não pede cartão de crédito e não expira. Explore a plataforma sem pressa." },
            { icon: X,          title: "Cancele quando quiser",  desc: "Sem fidelidade, sem multa. Faça o downgrade ou cancele a qualquer momento pelo painel." },
            { icon: Headphones, title: "Suporte incluso",        desc: "Atendimento por e-mail em todos os planos. Planos superiores têm prioridade no atendimento." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="rounded-2xl border border-white/8 bg-white/4 p-6 hover:bg-white/6 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-4">
                <Icon className="h-4.5 w-4.5 text-blue-400" style={{ height: "18px", width: "18px" }} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden text-center px-8 py-16"
          style={{ background: "linear-gradient(135deg, #0b1849 0%, #18106a 50%, #461a8e 100%)" }}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-violet-500/20 blur-3xl rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Pronto para fechar mais negócios?
            </h2>
            <p className="text-blue-200/70 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Entre para a rede de corretores que estão gerando oportunidades todos os dias. Comece gratuitamente.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-xl shadow-blue-500/30 text-sm">
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
