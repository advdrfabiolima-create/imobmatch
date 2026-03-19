"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Users, Zap, Shield, TrendingUp, MessageSquare,
  Menu, X, ArrowRight, MapPin, Check, Star, CheckCircle2,
  HeartHandshake, Trophy, ChevronRight,
} from "lucide-react";
import { COPY } from "@/config/copy";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "/plans",          label: "Planos"          },
  { href: "/imoveis",        label: "Imóveis"         },
];

const FEATURES = [
  {
    icon: Building2,
    title: "Gestão de Imóveis",
    desc: "Cadastre, edite e compartilhe seus imóveis com página pública e link direto para WhatsApp.",
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    icon: Zap,
    title: "Matching Inteligente",
    desc: "Algoritmo que combina automaticamente compradores com imóveis por localização, preço e tipo.",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    icon: Users,
    title: "Rede de Parcerias",
    desc: "Conecte-se com outros corretores, divida comissões e feche mais negócios em conjunto.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    desc: "Comunicação direta entre corretores para coordenar parcerias e negociações sem sair da plataforma.",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-200",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    icon: TrendingUp,
    title: "Radar de Oportunidades",
    desc: "Encontre imóveis com desconto urgente publicados por corretores parceiros da rede.",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    desc: "Autenticação segura, dados criptografados e termos de parceria com hash de verificação.",
    gradient: "from-indigo-500 to-blue-700",
    glow: "shadow-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
];

const TESTIMONIALS = [
  {
    name: "Renata Oliveira",
    role: "Corretora autônoma · Salvador, BA",
    text: "Antes eu perdia clientes toda semana por não ter o imóvel certo. Com o ImobMatch, encontro parceiros que têm o que preciso e a gente divide a comissão. Já fechei 3 negócios em dois meses.",
    stars: 5,
    initial: "RO",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Marcos Teixeira",
    role: "Corretor · São Paulo, SP",
    text: "O matching automático é incrível. Cadastrei meus compradores e no mesmo dia o sistema já sugeriu imóveis de outros corretores com mais de 90% de compatibilidade. Virei fã.",
    stars: 5,
    initial: "MT",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Cláudia Ferreira",
    role: "Diretora comercial · Rio de Janeiro, RJ",
    text: "Minha equipe usa o ImobMatch para gerenciar imóveis e compradores. O Radar de Oportunidades nos ajuda a encontrar negócios com desconto antes de todo mundo. Vale muito o investimento.",
    stars: 5,
    initial: "CF",
    gradient: "from-violet-500 to-purple-600",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Cadastre imóveis e compradores",
    desc: "Em minutos, publique seus imóveis e registre o perfil dos seus compradores com as preferências deles.",
  },
  {
    num: "02",
    title: "O algoritmo gera os matches",
    desc: "Automaticamente o sistema cruza imóveis e compradores da rede inteira e aponta os melhores pares.",
  },
  {
    num: "03",
    title: "Proponha parceria e feche",
    desc: "Entre em contato pelo chat, formalize a parceria com termo digital e divida a comissão de forma justa.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MOCKUP
// ─────────────────────────────────────────────────────────────────────────────

function ProductMockup() {
  return (
    <div className="relative select-none">
      {/* Glow layers */}
      <div className="absolute -inset-6 bg-gradient-to-br from-blue-400/20 via-violet-400/15 to-blue-300/10 rounded-3xl blur-3xl pointer-events-none" />
      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-3xl blur-xl pointer-events-none" />

      <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200/80"
        style={{ boxShadow: "0 25px 60px -12px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.06)" }}>

        {/* Browser chrome */}
        <div className="bg-gray-50/90 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-0.5 text-[10px] text-gray-400 text-center truncate">
            app.useimobmatch.com.br
          </div>
        </div>

        {/* App top bar */}
        <div className="bg-white border-b border-gray-100 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-800 tracking-tight">ImobMatch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-2.5 w-2.5 text-gray-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-white leading-none">JS</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 px-3.5 flex items-center gap-1">
          {[
            { label: "Radar",     active: true  },
            { label: "Feed",      active: false },
            { label: "Parcerias", active: false },
            { label: "Ranking",   active: false },
          ].map((tab) => (
            <div
              key={tab.label}
              className={`px-2.5 py-2 text-[10px] font-semibold border-b-2 -mb-px transition-colors ${
                tab.active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-50/70 p-3 space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-[11px] font-bold text-gray-800">Radar de Oportunidades</p>
              <p className="text-[10px] text-gray-400 mt-0.5">5 imóveis com desconto urgente na rede</p>
            </div>
            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="h-2.5 w-2.5" />
              3 novos
            </div>
          </div>

          {/* Featured card */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="relative h-[60px] bg-gradient-to-br from-blue-500 via-blue-400 to-violet-500 overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-end px-3 gap-0.5">
                <div className="w-5  h-7  bg-white/20 rounded-t" />
                <div className="w-7  h-10 bg-white/25 rounded-t" />
                <div className="w-4  h-5  bg-white/15 rounded-t" />
                <div className="w-8  h-9  bg-white/20 rounded-t" />
                <div className="w-4  h-6  bg-white/15 rounded-t" />
                <div className="w-6  h-8  bg-white/20 rounded-t" />
                <div className="w-3  h-4  bg-white/10 rounded-t" />
              </div>
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-amber-400 text-amber-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">Oportunidade</span>
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">−15%</span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-xs font-semibold text-gray-900 leading-tight">Casa em Salvador, BA</p>
                  <p className="text-blue-600 font-bold text-sm leading-tight mt-0.5">R$ 620.000</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">4q · 180 m²</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2.5">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                <span>Pituba, Salvador</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    <Zap className="h-2.5 w-2.5" />3 matches
                  </span>
                  <span className="bg-violet-50 text-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">Parceria</span>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-semibold">
                  Ver <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Match suggestion */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white leading-none">CS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-semibold text-gray-800 truncate">Carlos Santos</p>
                  <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">94% match</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Apto · até R$ 500.000 · 3q · São Paulo</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-1 rounded-full" style={{ width: "94%" }} />
              </div>
              <span className="text-[9px] text-gray-400 flex-shrink-0">Compatibilidade</span>
            </div>
          </div>

          {/* Mini list */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
            {[
              { title: "Apto em São Paulo, SP",    price: "R$ 480.000", label: "2 matches", cls: "bg-blue-50 text-blue-600",       dot: "bg-blue-500"    },
              { title: "Studio no Rio de Janeiro", price: "R$ 320.000", label: "1 match",   cls: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-2.5 px-3 py-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-700 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400">{item.price}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${item.cls}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ════════════════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition shadow-md shadow-blue-200/60"
            >
              Cadastrar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm px-6 py-4 space-y-1 shadow-xl">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                Cadastrar grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-100/70 to-violet-100/50 blur-3xl" />
          <div className="absolute -bottom-20 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-50/80 to-indigo-100/60 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-violet-50/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left col */}
            <div>
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 mb-7 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                {COPY.socialProof}
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-gray-900 mb-5 leading-[1.08] tracking-tight max-w-lg">
                Pare de perder clientes por{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  não ter o imóvel certo.
                </span>
              </h1>

              <p className="text-lg text-gray-500 mb-3 leading-relaxed max-w-md">
                {COPY.heroSubtext}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                Corretores já estão encontrando oportunidades reais na plataforma.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-7">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-7 py-3.5 rounded-xl font-semibold text-[15px] shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-300/50 hover:opacity-95 active:scale-[0.98] transition-all duration-200"
                >
                  Começar gratuitamente
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/plans"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                >
                  Ver planos
                </Link>
              </div>

              <p className="text-xs text-gray-400 mb-9">{COPY.heroTrust}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-5 border-t border-gray-100">
                {[
                  { value: "100%", label: "gratuito para começar" },
                  { value: "+3",   label: "negócios fechados na rede" },
                  { value: "2",    label: "estados ativos" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col — mockup */}
            <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
              <ProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TRUST BAR
      ════════════════════════════════════════════════════════════════════ */}
      <div className="border-y border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {COPY.trust.map(t => (
            <span key={t} className="text-sm text-gray-500 font-medium">{t}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          COM vs SEM
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Por que mudar?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              O que muda com o ImobMatch
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Pare de trabalhar no escuro. Veja a diferença de ter uma rede inteligente do seu lado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Sem */}
            <div className="rounded-2xl border border-red-100 bg-red-50/40 p-8 hover:shadow-md hover:shadow-red-50 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="h-4.5 w-4.5 text-red-500" style={{ height: "18px", width: "18px" }} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Sem ImobMatch</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Perde clientes por não ter o imóvel certo",
                  "Não sabe quais corretores têm o que seu cliente precisa",
                  "Deixa comissão na mesa por falta de parceiros",
                  "Busca de parceiros manual e demorada",
                  "Sem controle de compradores e preferências",
                  "Perda de oportunidades com desconto urgente",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <X className="h-3 w-3 text-red-500" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Com */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-8 shadow-md shadow-emerald-100/60 hover:shadow-lg hover:shadow-emerald-100 transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Com ImobMatch</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Matching automático de compradores com imóveis",
                  "Acesso a imóveis de toda a rede de corretores",
                  "Parcerias formalizadas com divisão de comissão",
                  "Chat direto com corretores parceiros",
                  "Radar de oportunidades com desconto em tempo real",
                  "Ranking de reputação para se destacar na rede",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          COMO FUNCIONA
      ════════════════════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">Simples assim</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Como funciona
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Em 3 passos simples você começa a gerar oportunidades e fechar mais negócios.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-blue-300 via-violet-300 to-purple-300 z-0" />

            {STEPS.map((step, i) => (
              <div key={step.num} className="relative z-10 text-center group">
                {/* Number circle */}
                <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 opacity-10 group-hover:opacity-20 transition-opacity blur-sm" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-200/60 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-black text-xl tracking-tighter">{step.num}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2.5 text-lg leading-tight">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="md:hidden flex justify-center mt-7">
                    <ChevronRight className="h-5 w-5 text-gray-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-300/40 hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all duration-200"
            >
              Quero começar agora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FUNCIONALIDADES
      ════════════════════════════════════════════════════════════════════ */}
      <section id="funcionalidades" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Plataforma completa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Tudo que você precisa
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Uma plataforma completa para gestão e colaboração imobiliária.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/80 hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                {/* Icon */}
                <div className={`mb-5 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          DEPOIMENTOS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">Prova social</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              O que dizem os corretores
            </h2>
            <p className="text-lg text-gray-500">Resultados reais de quem já usa a plataforma.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-7 hover:shadow-xl hover:shadow-gray-100/80 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <span className="text-xs font-bold text-white">{t.initial}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PLANOS RESUMO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Preços transparentes</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Comece grátis. Escale quando quiser.
            </h2>
            <p className="text-lg text-gray-500">Sem cartão de crédito. Sem burocracia.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
            {[
              { name: "Free",    price: "Grátis",    desc: "3 imóveis · 3 compradores",          highlight: false },
              { name: "Starter", price: "R$ 39/mês", desc: "20 imóveis · 30 compradores",        highlight: true  },
              { name: "Pro",     price: "R$ 79/mês", desc: "Ilimitado · prioridade no algoritmo", highlight: false },
            ].map(p => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-6 text-center transition-all duration-200 ${
                  p.highlight
                    ? "bg-white border-2 border-blue-600 shadow-xl shadow-blue-100/60 scale-[1.02]"
                    : "bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-md shadow-blue-200">
                    Mais popular
                  </span>
                )}
                <p className={`font-bold text-base mb-1 ${p.highlight ? "text-gray-900" : "text-gray-700"}`}>
                  {p.name}
                </p>
                <p className={`text-2xl font-extrabold mb-1 ${p.highlight ? "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent" : "text-gray-900"}`}>
                  {p.price}
                </p>
                <p className={`text-xs mb-5 ${p.highlight ? "text-gray-500" : "text-gray-400"}`}>{p.desc}</p>
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center gap-1 w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 shadow-md shadow-blue-200/60"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  Começar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            Precisa de mais?{" "}
            <Link href="/plans" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2">
              Ver todos os planos →
            </Link>
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700" />
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto mb-7 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
            <HeartHandshake className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight leading-[1.08]">
            Pronto para fechar mais negócios?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-lg mx-auto leading-relaxed">
            Junte-se à rede de corretores que colaboram, compartilham e crescem juntos. Comece gratuitamente hoje.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-base font-bold hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-blue-900/30"
            >
              Criar conta grátis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/imoveis"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-4 text-base font-medium text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
            >
              Ver imóveis disponíveis
            </Link>
          </div>

          <p className="text-sm text-blue-200">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.png" alt="ImobMatch" className="h-8 w-auto object-contain brightness-0 invert mb-4" />
              <p className="text-sm leading-relaxed text-gray-500 mb-5">
                A rede colaborativa de corretores que conecta imóveis, compradores e parceiros de forma inteligente.
              </p>
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} ImobMatch</p>
            </div>

            {/* Produto */}
            <div>
              <p className="text-white font-semibold text-sm mb-5">Produto</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/plans"            className="hover:text-white transition-colors">Planos e preços</Link></li>
                <li><Link href="/imoveis"          className="hover:text-white transition-colors">Imóveis</Link></li>
                <li><Link href="/#como-funciona"   className="hover:text-white transition-colors">Como funciona</Link></li>
              </ul>
            </div>

            {/* Conta */}
            <div>
              <p className="text-white font-semibold text-sm mb-5">Conta</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/login"    className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Criar conta grátis</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white font-semibold text-sm mb-5">Legal</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link href="/termos"      className="hover:text-white transition-colors">Termos de uso</Link></li>
              </ul>
              <div className="mt-7">
                <p className="text-white font-semibold text-sm mb-2">Contato</p>
                <p className="text-sm text-gray-500">contato@useimobmatch.com.br</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-7 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>useimobmatch.com.br — Conectando corretores de imóveis no Brasil</p>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Sistema de reputação e ranking de corretores</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
