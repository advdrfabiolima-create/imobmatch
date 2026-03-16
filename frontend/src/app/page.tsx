import Link from "next/link";
import { Building2, Users, Zap, Shield, TrendingUp, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600">Funcionalidades</Link>
            <Link href="/plans" className="text-gray-600 hover:text-blue-600">Planos</Link>
            <Link href="/imoveis" className="text-gray-600 hover:text-blue-600">Imóveis</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Entrar</Link>
            <Link href="/plans" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
              Cadastrar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-6">
          Plataforma Nº 1 para Corretores
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Conecte-se com outros<br />
          <span className="text-blue-600">corretores e feche mais</span>
          <br />negócios
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          O ImobMatch é a plataforma SaaS que conecta corretores para compartilhar imóveis,
          encontrar compradores ideais e criar parcerias lucrativas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/plans" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Começar Gratuitamente
          </Link>
          <Link href="/imoveis" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-300 transition">
            Ver Imóveis
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">Sem cartão de crédito. Grátis para começar.</p>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: "3.000+", label: "Corretores Ativos" },
            { value: "10.000+", label: "Imóveis Cadastrados" },
            { value: "R$ 900k+", label: "em Negócios Fechados" },
            { value: "99%", label: "Satisfação dos Usuários" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-blue-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
          <p className="text-xl text-gray-600">Uma plataforma completa para gestão e colaboração imobiliária</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
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
              title: "Painel Analítico",
              desc: "Acompanhe estatísticas, leads, matches e desempenho dos seus imóveis.",
              color: "red",
            },
            {
              icon: Shield,
              title: "Seguro e Confiável",
              desc: "Plataforma com autenticação segura, dados criptografados e backup automático.",
              color: "indigo",
            },
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition">
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pronto para crescer?</h2>
          <p className="text-xl text-gray-600 mb-8">Junte-se a milhares de corretores que já usam o ImobMatch</p>
          <Link href="/plans" className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Criar conta grátis agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img src="/logo.png" alt="ImobMatch" className="h-7 w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm">© 2024 ImobMatch. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/privacidade" className="hover:text-blue-600">Privacidade</Link>
            <Link href="/termos" className="hover:text-blue-600">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
