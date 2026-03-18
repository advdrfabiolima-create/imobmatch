"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Zap, Shield, TrendingUp, MessageSquare, Menu, X, ArrowRight } from "lucide-react";
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
      <section className="container mx-auto px-6 py-16 md:py-24 text-center">
        <div className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          {COPY.socialProof}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {COPY.heroHeadline}
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          {COPY.heroSubtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            {COPY.heroCta}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/plans"
            className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-300 transition"
          >
            Ver planos
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">{COPY.heroTrust}</p>
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
