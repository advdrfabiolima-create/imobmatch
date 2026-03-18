"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Users, Zap, Shield, TrendingUp, MessageSquare,
  Menu, X, ArrowRight, MapPin, Check, Star, CheckCircle2,
  HandshakeIcon, Trophy, ChevronRight,
} from "lucide-react";
import { COPY } from "@/config/copy";

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "/plans",          label: "Planos"          },
  { href: "/imoveis",        label: "Imóveis"         },
];

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Building2,
    title: "Gestão de Imóveis",
    desc: "Cadastre, edite e compartilhe seus imóveis com página pública e link direto para WhatsApp.",
    color: "blue",
  },
  {
    icon: Zap,
    title: "Matching Inteligente",
    desc: "Algoritmo que combina automaticamente compradores com imóveis por localização, preço e tipo.",
    color: "yellow",
  },
  {
    icon: Users,
    title: "Rede de Parcerias",
    desc: "Conecte-se com outros corretores, divida comissões e feche mais negócios em conjunto.",
    color: "green",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    desc: "Comunicação direta entre corretores para coordenar parcerias e negociações sem sair da plataforma.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Radar de Oportunidades",
    desc: "Encontre imóveis com desconto urgente publicados por corretores parceiros da rede.",
    color: "orange",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    desc: "Autenticação segura, dados criptografados e termos de parceria com hash de verificação.",
    color: "indigo",
  },
];

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Renata Oliveira",
    role: "Corretora autônoma · Salvador, BA",
    text: "Antes eu perdia clientes toda semana por não ter o imóvel certo. Com o ImobMatch, encontro parceiros que têm o que preciso e a gente divide a comissão. Já fechei 3 negócios em dois meses.",
    stars: 5,
    initial: "RO",
    color: "from-pink-400 to-rose-500",
  },
  {
    name: "Marcos Teixeira",
    role: "Corretor · São Paulo, SP",
    text: "O matching automático é incrível. Cadastrei meus compradores e no mesmo dia o sistema já sugeriu imóveis de outros corretores com mais de 90% de compatibilidade. Virei fã.",
    stars: 5,
    initial: "MT",
    color: "from-blue-400 to-indigo-500",
  },
  {
    name: "Cláudia Ferreira",
    role: "Diretora comercial · Rio de Janeiro, RJ",
    text: "Minha equipe usa o ImobMatch para gerenciar imóveis e compradores. O Radar de Oportunidades nos ajuda a encontrar negócios com desconto antes de todo mundo. Vale muito o investimento.",
    stars: 5,
    initial: "CF",
    color: "from-violet-400 to-purple-500",
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Cadastre seus imóveis e compradores",
    desc: "Em minutos, publique seus imóveis e registre o perfil dos seus compradores com as preferências deles.",
    color: "blue",
  },
  {
    num: "02",
    title: "O algoritmo gera os matches",
    desc: "Automaticamente o sistema cruza imóveis e compradores da rede inteira e aponta os melhores pares.",
    color: "indigo",
  },
  {
    num: "03",
    title: "Proponha parceria e feche o negócio",
    desc: "Entre em contato pelo chat, formalize a parceria com termo digital e divida a comissão de forma justa.",
    color: "purple",
  },
];

// ── Product Mockup ──────────────────────────────────────────────────────────
function ProductMockup() {
  return (
    <div className="relative select-none">
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50 rounded-3xl blur-2xl opacity-80 pointer-events-none" />
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-100/60 border border-gray-200/80 overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
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
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
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
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-white leading-none">JS</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
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

        {/* App content */}
        <div className="bg-gray-50/70 p-3 space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-[11px] font-bold text-gray-800">Radar de Oportunidades</p>
              <p className="text-[10px] text-gray-400 mt-0.5">5 imóveis com desconto urgente na rede</p>
            </div>
            <div className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="h-2.5 w-2.5" />
              3 novos
            </div>
          </div>

          {/* Featured property card */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="relative h-[60px] bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500 overflow-hidden">
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
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">Parceria</span>
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white leading-none">CS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-semibold text-gray-800 truncate">Carlos Santos</p>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">94% match</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Apto · até R$ 500.000 · 3q · São Paulo</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                <div className="bg-purple-500 h-1 rounded-full" style={{ width: "94%" }} />
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm">
              Entrar
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm shadow-blue-200">
              Cadastrar Grátis
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white px-6 py-4 space-y-1 shadow-lg">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
                Entrar
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                Cadastrar Grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="container mx-auto px-6 pt-14 pb-10 md:pt-20 md:pb-14 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
              {COPY.socialProof}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight max-w-lg">
              {COPY.heroHeadline}
            </h1>

            <p className="text-lg text-gray-500 mb-3 leading-relaxed max-w-md">
              {COPY.heroSubtext}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              Corretores já estão encontrando oportunidades reais na plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-200 text-[15px]"
              >
                {COPY.heroCta}
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </Link>
              <Link
                href="/plans"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-500 px-5 py-3 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 transition text-sm"
              >
                Ver planos
              </Link>
            </div>

            <p className="text-sm text-gray-400 mb-8">{COPY.heroTrust}</p>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
              {[
                { value: "100%", label: "gratuito para começar" },
                { value: "+3",   label: "negócios fechados na rede" },
                { value: "2",    label: "estados ativos" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0 mt-6 lg:mt-0">
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* ── Antes vs Depois ── */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que muda com o ImobMatch</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Pare de trabalhar no escuro. Veja a diferença de ter uma rede inteligente do seu lado.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Sem ImobMatch */}
            <div className="bg-white rounded-2xl border border-red-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Sem ImobMatch</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Perde clientes por não ter o imóvel certo",
                  "Não sabe quais corretores têm o que seu cliente precisa",
                  "Deixa comissão na mesa por falta de parceiros",
                  "Busca de parceiros manual e demorada",
                  "Sem controle de compradores e preferências",
                  "Perda de oportunidades com desconto urgente",
                ].map(t => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="h-2.5 w-2.5 text-red-500" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Com ImobMatch */}
            <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-md shadow-green-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Com ImobMatch</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Matching automático de compradores com imóveis",
                  "Acesso a imóveis de toda a rede de corretores",
                  "Parcerias formalizadas com divisão de comissão",
                  "Chat direto com corretores parceiros",
                  "Radar de oportunidades com desconto em tempo real",
                  "Ranking de reputação para se destacar na rede",
                ].map(t => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Como Funciona ── */}
      <section id="como-funciona" className="container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">Em 3 passos simples você começa a gerar oportunidades e fechar mais negócios.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 z-0" />

          {STEPS.map((step, i) => (
            <div key={step.num} className="relative z-10 text-center">
              <div className={`w-16 h-16 rounded-2xl bg-${step.color}-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-${step.color}-200`}>
                <span className="text-white font-bold text-xl">{step.num}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="md:hidden flex justify-center mt-6">
                  <ChevronRight className="h-5 w-5 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Quero começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section id="funcionalidades" className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
            <p className="text-xl text-gray-500">Uma plataforma completa para gestão e colaboração imobiliária</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(feature => (
              <div key={feature.title} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition group">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que dizem os corretores</h2>
          <p className="text-lg text-gray-500">Resultados reais de quem já usa a plataforma.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{t.initial}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Planos resumo ── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Comece grátis. Escale quando quiser.</h2>
            <p className="text-blue-200 text-lg">Sem cartão de crédito. Sem burocracia.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { name: "Free",    price: "Grátis",    desc: "3 imóveis · 3 compradores",          highlight: false },
              { name: "Starter", price: "R$ 39/mês", desc: "20 imóveis · 30 compradores",        highlight: true  },
              { name: "Pro",     price: "R$ 79/mês", desc: "Ilimitado · prioridade no algoritmo", highlight: false },
            ].map(p => (
              <div
                key={p.name}
                className={`rounded-2xl p-5 text-center ${
                  p.highlight
                    ? "bg-white shadow-xl shadow-blue-900/20"
                    : "bg-white/10 border border-white/20"
                }`}
              >
                {p.highlight && (
                  <span className="inline-block bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-3">
                    Mais popular
                  </span>
                )}
                <p className={`font-bold text-lg mb-1 ${p.highlight ? "text-gray-900" : "text-white"}`}>{p.name}</p>
                <p className={`text-2xl font-extrabold mb-1 ${p.highlight ? "text-blue-600" : "text-white"}`}>{p.price}</p>
                <p className={`text-xs mb-4 ${p.highlight ? "text-gray-500" : "text-blue-200"}`}>{p.desc}</p>
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center gap-1 w-full py-2 rounded-lg text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  Começar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-blue-200 text-sm">
            Precisa de mais?{" "}
            <Link href="/plans" className="text-white font-semibold underline underline-offset-2 hover:text-blue-100">
              Ver todos os planos →
            </Link>
          </p>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gray-50 rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HandshakeIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pronto para fechar mais negócios?
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">
            Junte-se à rede de corretores que colaboram, compartilham e crescem juntos. Comece gratuitamente hoje.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Criar conta grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/imoveis"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-6 py-4 rounded-xl text-base font-medium hover:border-blue-300 hover:text-blue-600 transition"
            >
              Ver imóveis disponíveis
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.png" alt="ImobMatch" className="h-8 w-auto object-contain brightness-0 invert mb-4" />
              <p className="text-sm leading-relaxed text-gray-500 mb-4">
                A rede colaborativa de corretores que conecta imóveis, compradores e parceiros de forma inteligente.
              </p>
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} ImobMatch</p>
            </div>

            {/* Produto */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Produto</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/plans"            className="hover:text-white transition-colors">Planos e preços</Link></li>
                <li><Link href="/imoveis"          className="hover:text-white transition-colors">Imóveis</Link></li>
                <li><Link href="/#como-funciona"   className="hover:text-white transition-colors">Como funciona</Link></li>
              </ul>
            </div>

            {/* Conta */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Conta</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login"    className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Criar conta grátis</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Legal</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link href="/termos"      className="hover:text-white transition-colors">Termos de uso</Link></li>
              </ul>
              <div className="mt-6">
                <p className="text-white font-semibold text-sm mb-2">Contato</p>
                <p className="text-sm text-gray-500">contato@useimobmatch.com.br</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>useimobmatch.com.br — Conectando corretores de imóveis no Brasil</p>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              <span>Sistema de reputação e ranking de corretores</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
