"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Zap, Shield, TrendingUp, MessageSquare, Menu, X, ArrowRight, MapPin } from "lucide-react";
import { COPY } from "@/config/copy";

const NAV_LINKS = [
  { href: "#features", label: "Funcionalidades" },
  { href: "/plans",    label: "Planos" },
  { href: "/imoveis",  label: "Imóveis" },
];

const FEATURES = [
  {
    icon: Building2,
    title: "Gestão de Imóveis",
    desc: "Cadastre, edite e compartilhe seus imóveis com página pública e link para WhatsApp.",
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
    desc: "Conecte-se com outros corretores, divida comissões e feche mais negócios juntos.",
    color: "green",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    desc: "Comunicação direta entre corretores para coordenar parcerias e negociações.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Radar de Oportunidades",
    desc: "Encontre imóveis com desconto urgente publicados por corretores da rede.",
    color: "orange",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    desc: "Autenticação segura, dados criptografados e termos de parceria com hash de verificação.",
    color: "indigo",
  },
];

// ── Product Mockup ──────────────────────────────────────────────────────────
function ProductMockup() {
  return (
    <div className="relative select-none">
      {/* Ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-50 rounded-3xl blur-2xl opacity-80 pointer-events-none" />

      {/* Browser frame */}
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-100/60 border border-gray-200/80 overflow-hidden">

        {/* ── Browser chrome ── */}
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

        {/* ── App top bar ── */}
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

        {/* ── Navigation tabs ── */}
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
                tab.active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* ── App content ── */}
        <div className="bg-gray-50/70 p-3 space-y-2.5">

          {/* Section header */}
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

          {/* ── Featured property card ── */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Property thumbnail — gradient with building silhouette */}
            <div className="relative h-[60px] bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-500 overflow-hidden">
              {/* Subtle grid lines */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
              {/* Building silhouette */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end px-3 gap-0.5">
                <div className="w-5  h-7  bg-white/20 rounded-t"  />
                <div className="w-7  h-10 bg-white/25 rounded-t"  />
                <div className="w-4  h-5  bg-white/15 rounded-t"  />
                <div className="w-8  h-9  bg-white/20 rounded-t"  />
                <div className="w-4  h-6  bg-white/15 rounded-t"  />
                <div className="w-6  h-8  bg-white/20 rounded-t"  />
                <div className="w-3  h-4  bg-white/10 rounded-t"  />
              </div>
              {/* Overlay badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-amber-400 text-amber-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  Oportunidade
                </span>
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  −15%
                </span>
              </div>
            </div>

            {/* Card body */}
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
                    <Zap className="h-2.5 w-2.5" />
                    3 matches
                  </span>
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    Parceria
                  </span>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-semibold">
                  Ver <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </div>

          {/* ── Match suggestion card ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white leading-none">CS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-semibold text-gray-800 truncate">Carlos Santos</p>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                    94% match
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Apto · até R$ 500.000 · 3q · São Paulo</p>
              </div>
            </div>
            {/* Compatibility bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                <div className="bg-purple-500 h-1 rounded-full" style={{ width: "94%" }} />
              </div>
              <span className="text-[9px] text-gray-400 flex-shrink-0">Compatibilidade</span>
            </div>
          </div>

          {/* ── Feed mini list ── */}
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
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${item.cls}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
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
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Cadastrar Grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-14 pb-10 md:pt-20 md:pb-14 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
              {COPY.socialProof}
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight max-w-lg">
              {COPY.heroHeadline}
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-md">
              {COPY.heroSubtext}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-200 text-[15px]"
              >
                {COPY.heroCta}
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </Link>
              <Link
                href="/plans"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition text-[15px]"
              >
                Ver planos
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-sm text-gray-400">{COPY.heroTrust}</p>
          </div>

          {/* Right — mockup */}
          <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0 mt-6 lg:mt-0">
            <ProductMockup />
          </div>

        </div>
      </section>

      {/* Growth banner */}
      <section className="bg-blue-600 py-10">
        <div className="container mx-auto px-6 text-center text-white">
          <p className="text-lg font-semibold mb-1">{COPY.growthMsg}</p>
          <p className="text-blue-200 text-sm">{COPY.founderMsg} — <Link href="/register" className="underline hover:text-white">Quero fazer parte</Link></p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
          <p className="text-xl text-gray-500">Uma plataforma completa para gestão e colaboração imobiliária</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(feature => (
            <div key={feature.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition">
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Seja um dos primeiros a aproveitar
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Conecte-se com corretores e oportunidades reais. Comece gratuitamente, sem cartão de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Criar conta grátis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="ImobMatch" className="h-7 w-auto object-contain" />
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} ImobMatch · useimobmatch.com.br</p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/privacidade" className="hover:text-blue-600">Privacidade</Link>
            <Link href="/termos" className="hover:text-blue-600">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
