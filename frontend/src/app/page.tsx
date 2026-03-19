"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Building2, Users, Zap, Shield, TrendingUp, MessageSquare,
  Menu, X, ArrowRight, Check, Star, CheckCircle2,
  HeartHandshake, Trophy, ChevronRight, Flame,
  ArrowRightLeft,
} from "lucide-react";
import { COPY } from "@/config/copy";
import HeroSection from "@/components/layout/HeroSection";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "#como-funciona",  label: "Como funciona"  },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "/plans",           label: "Planos"          },
  { href: "/imoveis",         label: "Imóveis"         },
];

const FEATURES = [
  {
    icon: Building2,
    title: "Gestão de Imóveis",
    desc: "Cadastre e compartilhe seus imóveis com página pública e link direto para WhatsApp.",
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-200",
  },
  {
    icon: Zap,
    title: "Matching Inteligente",
    desc: "Algoritmo que combina automaticamente compradores com imóveis por localização, preço e tipo.",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-200",
  },
  {
    icon: Users,
    title: "Rede de Parcerias",
    desc: "Conecte-se com outros corretores, divida comissões e feche mais negócios em conjunto.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-200",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    desc: "Comunicação direta entre corretores para coordenar parcerias sem sair da plataforma.",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-200",
  },
  {
    icon: TrendingUp,
    title: "Radar de Oportunidades",
    desc: "Encontre imóveis com desconto urgente publicados por corretores parceiros da rede.",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-200",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    desc: "Autenticação segura, dados criptografados e termos de parceria com hash de verificação.",
    gradient: "from-indigo-500 to-blue-700",
    glow: "shadow-indigo-200",
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
    highlight: "Fechei 3 negócios em 2 meses",
  },
  {
    name: "Marcos Teixeira",
    role: "Corretor · São Paulo, SP",
    text: "O matching automático é incrível. Cadastrei meus compradores e no mesmo dia o sistema já sugeriu imóveis de outros corretores com mais de 90% de compatibilidade. Virei fã.",
    stars: 5,
    initial: "MT",
    gradient: "from-blue-500 to-indigo-600",
    highlight: "Match com 90%+ de compatibilidade no mesmo dia",
  },
  {
    name: "Cláudia Ferreira",
    role: "Diretora comercial · Rio de Janeiro, RJ",
    text: "Minha equipe usa o ImobMatch para gerenciar imóveis e compradores. O Radar de Oportunidades nos ajuda a encontrar negócios com desconto antes de todo mundo. Vale muito o investimento.",
    stars: 5,
    initial: "CF",
    gradient: "from-violet-500 to-purple-600",
    highlight: "Encontramos oportunidades antes de todo mundo",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Building2,
    title: "Cadastre imóveis e compradores",
    desc: "Em minutos, publique seus imóveis e registre o perfil dos seus compradores com as preferências deles.",
  },
  {
    num: "02",
    icon: Zap,
    title: "O algoritmo gera os matches",
    desc: "O sistema cruza imóveis e compradores da rede inteira e aponta os melhores pares automaticamente.",
  },
  {
    num: "03",
    icon: HeartHandshake,
    title: "Feche com outros corretores",
    desc: "Entre em contato pelo chat, formalize a parceria com termo digital e divida a comissão de forma justa.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: FADE-IN ON SCROLL
// ─────────────────────────────────────────────────────────────────────────────

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY TICKER — auto-scroll marquee
// ─────────────────────────────────────────────────────────────────────────────

function ActivityTicker() {
  const items = [
    { icon: "🔥", text: "Nova oportunidade publicada em Salvador" },
    { icon: "💡", text: "Match gerado com 92% de compatibilidade" },
    { icon: "🤝", text: "Parceria iniciada entre dois corretores no RJ" },
    { icon: "📈", text: "Novo imóvel adicionado à rede em SP" },
    { icon: "💡", text: "Match de 94% encontrado em Fortaleza" },
    { icon: "🔥", text: "Oportunidade urgente publicada em BH" },
    { icon: "🤝", text: "Comissão dividida — negócio fechado" },
    { icon: "📈", text: "Corretor novo entrou na rede" },
  ];

  return (
    <div className="border-y border-gray-100 bg-gray-50/70 py-3 overflow-hidden">
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll 45s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex items-center gap-4 px-6">
        {/* Label */}
        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full whitespace-nowrap">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          </span>
          Ativo agora
        </span>
        {/* Marquee */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex gap-10 w-max">
            {[...items, ...items].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap">
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ACTIVITY SECTION — feed rotativo com novas entradas
// ─────────────────────────────────────────────────────────────────────────────

const FEED_POOL = [
  { icon: "🔥", title: "Nova oportunidade publicada", desc: "Apartamento em Salvador com −18% de desconto", border: "border-orange-100", bg: "bg-orange-50/70", dot: "bg-orange-400" },
  { icon: "💡", title: "Match encontrado", desc: "92% de compatibilidade — comprador em Salvador, BA", border: "border-violet-100", bg: "bg-violet-50/70", dot: "bg-violet-400" },
  { icon: "🤝", title: "Parceria iniciada", desc: "Dois corretores formalizaram acordo de comissão", border: "border-blue-100", bg: "bg-blue-50/70", dot: "bg-blue-400" },
  { icon: "📈", title: "Imóvel adicionado à rede", desc: "Casa em São Paulo · R$ 650.000 · 3 quartos", border: "border-emerald-100", bg: "bg-emerald-50/70", dot: "bg-emerald-400" },
  { icon: "💡", title: "Match de alto impacto", desc: "94% de compatibilidade — Rio de Janeiro, RJ", border: "border-violet-100", bg: "bg-violet-50/70", dot: "bg-violet-400" },
  { icon: "🔥", title: "Oportunidade urgente", desc: "Studio no RJ com −15% · 3 interessados na fila", border: "border-orange-100", bg: "bg-orange-50/70", dot: "bg-orange-400" },
  { icon: "🤝", title: "Negócio fechado", desc: "Comissão dividida entre dois corretores — BH, MG", border: "border-blue-100", bg: "bg-blue-50/70", dot: "bg-blue-400" },
  { icon: "📈", title: "Corretor entrou na rede", desc: "Novo membro em Fortaleza, CE — perfil ativo", border: "border-emerald-100", bg: "bg-emerald-50/70", dot: "bg-emerald-400" },
  { icon: "🔥", title: "Oportunidade publicada", desc: "Cobertura em Fortaleza com −18% — 4 matches", border: "border-orange-100", bg: "bg-orange-50/70", dot: "bg-orange-400" },
  { icon: "💡", title: "Match gerado automaticamente", desc: "88% de compatibilidade — Recife, PE", border: "border-violet-100", bg: "bg-violet-50/70", dot: "bg-violet-400" },
];

type FeedEvent = typeof FEED_POOL[0] & { uid: number; time: string };

function formatAgo(secsAgo: number): string {
  if (secsAgo < 60) return "agora";
  const m = Math.floor(secsAgo / 60);
  return `${m} min`;
}

function LiveActivitySection() {
  const { ref, visible } = useFadeIn(0.08);
  const poolIdxRef = useRef(6);
  const uidRef = useRef(100);

  const [feed, setFeed] = useState<FeedEvent[]>(() =>
    FEED_POOL.slice(0, 6).map((e, i) => ({
      ...e,
      uid: i,
      time: formatAgo(i * 150),
    }))
  );
  const [newUid, setNewUid] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = FEED_POOL[poolIdxRef.current % FEED_POOL.length];
      poolIdxRef.current++;
      const uid = uidRef.current++;
      setFeed(prev => [{ ...next, uid, time: "agora" }, ...prev.slice(0, 5)]);
      setNewUid(uid);
      setTimeout(() => setNewUid(null), 700);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white py-20">
      <style>{`
        @keyframes feed-slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .feed-new { animation: feed-slide-in 0.5s ease forwards; }
      `}</style>

      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.55s ease, transform 0.55s ease",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Atividade na rede
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            O que está acontecendo agora
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Matches, parcerias e oportunidades como essas surgem todos os dias na rede ImobMatch.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {feed.map((ev) => (
            <div
              key={ev.uid}
              className={`${ev.uid === newUid ? "feed-new" : ""} flex items-start gap-3 p-4 rounded-2xl border ${ev.border} ${ev.bg} hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default`}
            >
              <div className="flex-shrink-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center text-base shadow-sm border border-gray-100">
                {ev.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1 whitespace-nowrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${ev.dot} ${ev.uid === newUid ? "animate-ping" : ""}`} />
                    {ev.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="text-center mt-8"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 700ms" }}
        >
          <p className="text-xs text-gray-400 mb-3">
            Esses são exemplos do tipo de atividade que acontece na plataforma
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
          >
            Quero fazer parte da rede
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPPORTUNITY IMPACT — pool rotativo de 6 oportunidades (2 grupos de 3)
// ─────────────────────────────────────────────────────────────────────────────

const OPP_POOL = [
  {
    label: "Salvador, BA",
    type: "Casa · 4 quartos · 180 m²",
    from: "R$ 800.000", to: "R$ 680.000", save: "−R$ 120.000", pct: "15%", matches: 3,
    gradient: "from-orange-500 to-red-500",
  },
  {
    label: "São Paulo, SP",
    type: "Apartamento · 3 quartos · 90 m²",
    from: "R$ 550.000", to: "R$ 460.000", save: "−R$ 90.000", pct: "16%", matches: 5,
    gradient: "from-orange-400 to-orange-600", featured: true,
  },
  {
    label: "Rio de Janeiro, RJ",
    type: "Studio · 1 quarto · 48 m²",
    from: "R$ 380.000", to: "R$ 320.000", save: "−R$ 60.000", pct: "16%", matches: 2,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    label: "Fortaleza, CE",
    type: "Cobertura · 3 quartos · 120 m²",
    from: "R$ 620.000", to: "R$ 510.000", save: "−R$ 110.000", pct: "18%", matches: 4,
    gradient: "from-orange-500 to-red-500", featured: true,
  },
  {
    label: "Belo Horizonte, MG",
    type: "Apartamento · 2 quartos · 65 m²",
    from: "R$ 420.000", to: "R$ 360.000", save: "−R$ 60.000", pct: "14%", matches: 3,
    gradient: "from-orange-400 to-orange-600",
  },
  {
    label: "Recife, PE",
    type: "Casa · 3 quartos · 150 m²",
    from: "R$ 480.000", to: "R$ 400.000", save: "−R$ 80.000", pct: "17%", matches: 2,
    gradient: "from-amber-500 to-orange-500",
  },
];

function OpportunityImpactSection() {
  const [groupIdx, setGroupIdx] = useState(0);
  const [cardOpacity, setCardOpacity] = useState(1);

  const rotate = (next: number) => {
    setCardOpacity(0);
    setTimeout(() => { setGroupIdx(next); setCardOpacity(1); }, 420);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      rotate((groupIdx + 1) % 2);
    }, 22000);
    return () => clearInterval(timer);
  }, [groupIdx]);

  const currentGroup = OPP_POOL.slice(groupIdx * 3, groupIdx * 3 + 3);

  return (
    <section className="bg-[#0F1117] py-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5" />
            Exemplos de oportunidades na plataforma
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Oportunidades como essa{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              surgem todos os dias
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Corretores publicam imóveis com desconto urgente na rede. Quem está cadastrado acessa primeiro.
          </p>
        </div>

        <div
          className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-8"
          style={{ opacity: cardOpacity, transition: "opacity 0.42s ease" }}
        >
          {currentGroup.map((opp) => (
            <div
              key={opp.label}
              className={`relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                opp.featured
                  ? "border-orange-500/50 bg-white/5 shadow-xl shadow-orange-500/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              {opp.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
              )}
              <div className={`h-2 bg-gradient-to-r ${opp.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-white text-sm">{opp.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{opp.type}</p>
                  </div>
                  <span className="text-[10px] font-black text-red-400 bg-red-500/15 border border-red-500/20 px-2 py-0.5 rounded-full">
                    −{opp.pct} OFF
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3.5 mb-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 line-through">{opp.from}</p>
                      <p className="text-xl font-extrabold text-white mt-0.5">{opp.to}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Economia</p>
                      <p className="text-sm font-bold text-orange-400">{opp.save}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    <Zap className="h-3 w-3" />
                    {opp.matches} compradores compatíveis
                  </div>
                </div>
                <Link
                  href="/register"
                  className="group w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  Ver oportunidades reais
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => rotate(i)}
              aria-label={`Grupo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === groupIdx ? "w-6 bg-orange-400" : "w-1.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">
            Exemplos do tipo de oportunidade publicada por corretores da plataforma todos os dias
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.99] transition-all duration-200"
          >
            Começar a gerar oportunidades
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCH SHOWCASE — prova visual do algoritmo
// ─────────────────────────────────────────────────────────────────────────────

function MatchShowcaseSection() {
  const { ref, visible } = useFadeIn(0.12);

  return (
    <section className="bg-[#F8FAFC] py-20">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left: texto */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-20px)",
              transition: "opacity 0.6s ease 100ms, transform 0.6s ease 100ms",
            }}
          >
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Matching inteligente
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
              Seu próximo negócio já pode estar esperando na rede.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              O algoritmo cruza automaticamente compradores e imóveis de toda a rede. Quando há alta compatibilidade, você recebe o match — e fecha o negócio com outro corretor dividindo a comissão.
            </p>
            <ul className="space-y-3">
              {[
                "Compatibilidade calculada por localização, tipo e faixa de preço",
                "Notificação imediata quando um match é encontrado",
                "Chat direto para formalizar a parceria sem burocracia",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-2">
              <span className="text-xs text-gray-400">Novos matches sendo gerados</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs text-violet-600 font-medium">continuamente</span>
              </span>
            </div>
          </div>

          {/* Right: card de match */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(20px)",
              transition: "opacity 0.6s ease 220ms, transform 0.6s ease 220ms",
            }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-violet-100/70 to-blue-100/50 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative bg-white rounded-2xl border border-violet-100 p-5 shadow-xl shadow-violet-100/60">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Zap className="h-4.5 w-4.5 text-white" style={{ height: "18px", width: "18px" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Match encontrado</p>
                  <p className="text-[11px] text-gray-400">Compatibilidade calculada pelo algoritmo</p>
                </div>
                <span className="text-sm font-black text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                  94%
                </span>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                  <span>Compatibilidade</span>
                  <span className="text-violet-600 font-semibold">94 / 100</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    style={{
                      width: visible ? "94%" : "0%",
                      transition: "width 1.3s cubic-bezier(0.4,0,0.2,1) 600ms",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">Imóvel disponível</p>
                  <p className="text-xs font-bold text-gray-800">Casa · Salvador</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">R$ 650.000 · 3 quartos</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3.5 border border-violet-100">
                  <p className="text-[9px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">Comprador na rede</p>
                  <p className="text-xs font-bold text-gray-800">Quer: Casa · Salvador</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Até R$ 700.000 · 2-4q</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex -space-x-2 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white border-2 border-white shadow-sm">JS</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white border-2 border-white shadow-sm">MC</div>
                </div>
                <p className="text-xs text-gray-600 flex-1">
                  <span className="font-semibold">2 corretores</span> · divisão de comissão acordada
                </p>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                  Ativo
                </span>
              </div>

              <p className="text-center text-[11px] text-gray-400 mt-3">
                Corretores entrando na rede · Novos matches todos os dias
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const fadeComoFunciona    = useFadeIn(0.1);
  const fadeProblema        = useFadeIn(0.1);
  const fadeFuncionalidades = useFadeIn(0.1);
  const fadeDepoimentos     = useFadeIn(0.1);
  const fadePlanos          = useFadeIn(0.1);

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-blue-700 via-blue-600 to-violet-700 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo.png" alt="ImobMatch" className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition shadow-lg shadow-blue-900/30 active:scale-[0.98]"
            >
              Cadastrar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/15 text-white transition-colors"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-blue-800/95 backdrop-blur-sm px-6 py-4 space-y-1 shadow-xl">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition">
                Entrar
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition">
                Cadastrar grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          HERO — componente com canvas animado
      ══════════════════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVITY TICKER — auto-scroll
      ══════════════════════════════════════════════════════════════════ */}
      <ActivityTicker />

      {/* ══════════════════════════════════════════════════════════════════
          "O QUE ESTÁ ACONTECENDO AGORA"
      ══════════════════════════════════════════════════════════════════ */}
      <LiveActivitySection />

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO DE IMPACTO — OPORTUNIDADES REAIS (fundo escuro)
      ══════════════════════════════════════════════════════════════════ */}
      <OpportunityImpactSection />

      {/* ══════════════════════════════════════════════════════════════════
          COMO FUNCIONA
      ══════════════════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div
            ref={fadeComoFunciona.ref}
            className="text-center mb-16"
            style={{
              opacity: fadeComoFunciona.visible ? 1 : 0,
              transform: fadeComoFunciona.visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">Simples assim</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Como funciona</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Em 3 passos você já começa a gerar oportunidades e fechar mais negócios.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-9 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-blue-300 via-violet-300 to-purple-300 z-0" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative z-10 text-center group">
                  <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 opacity-10 group-hover:opacity-20 transition-opacity blur-sm" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-200/60 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2.5 text-lg leading-tight">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="md:hidden flex justify-center mt-7">
                      <ChevronRight className="h-5 w-5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link href="/register"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-300/40 hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all duration-200">
              Começar a gerar oportunidades
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MATCH SHOWCASE — prova visual do matching
      ══════════════════════════════════════════════════════════════════ */}
      <MatchShowcaseSection />

      {/* ══════════════════════════════════════════════════════════════════
          PROBLEMA vs SOLUÇÃO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div
            ref={fadeProblema.ref}
            className="text-center mb-14"
            style={{
              opacity: fadeProblema.visible ? 1 : 0,
              transform: fadeProblema.visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Por que mudar?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              O que muda com o ImobMatch
            </h2>
            <p className="text-lg text-blue-100/80 max-w-xl mx-auto">
              Pare de trabalhar no escuro. Veja a diferença de ter uma rede inteligente do seu lado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {/* Sem ImobMatch */}
            <div
              style={{
                opacity: fadeProblema.visible ? 1 : 0,
                transform: fadeProblema.visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 100ms, transform 0.5s ease 100ms",
              }}
              className="rounded-2xl border border-red-200/60 bg-white p-8 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="h-[18px] w-[18px] text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Sem ImobMatch</h3>
                  <p className="text-xs text-red-500 font-medium">Você trabalha sozinho</p>
                </div>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Perde clientes por não ter o imóvel certo",
                  "Não sabe quais corretores têm o que seu cliente precisa",
                  "Deixa comissão na mesa por falta de parceiros",
                  "Busca de parceiros manual e demorada",
                  "Sem controle de compradores e preferências",
                  "Perde oportunidades com desconto urgente",
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

            {/* Com ImobMatch */}
            <div
              style={{
                opacity: fadeProblema.visible ? 1 : 0,
                transform: fadeProblema.visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease 200ms, transform 0.5s ease 200ms",
              }}
              className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-xl shadow-blue-900/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Com ImobMatch</h3>
                  <p className="text-xs text-emerald-600 font-medium">Você tem uma rede trabalhando por você</p>
                </div>
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

      {/* ══════════════════════════════════════════════════════════════════
          FUNCIONALIDADES
      ══════════════════════════════════════════════════════════════════ */}
      <section id="funcionalidades" className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div
            ref={fadeFuncionalidades.ref}
            className="text-center mb-14"
            style={{
              opacity: fadeFuncionalidades.visible ? 1 : 0,
              transform: fadeFuncionalidades.visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Plataforma completa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Tudo que você precisa</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Uma plataforma completa para gestão e colaboração imobiliária.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                style={{
                  opacity: fadeFuncionalidades.visible ? 1 : 0,
                  transform: fadeFuncionalidades.visible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms`,
                }}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/80 hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
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

      {/* ══════════════════════════════════════════════════════════════════
          DEPOIMENTOS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div
            ref={fadeDepoimentos.ref}
            className="text-center mb-14"
            style={{
              opacity: fadeDepoimentos.visible ? 1 : 0,
              transform: fadeDepoimentos.visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3">Resultados reais</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">O que dizem os corretores</h2>
            <p className="text-lg text-gray-500">De quem já usa a plataforma para gerar negócios.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                style={{
                  opacity: fadeDepoimentos.visible ? 1 : 0,
                  transform: fadeDepoimentos.visible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                }}
                className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-7 hover:shadow-xl hover:shadow-gray-100/80 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <p className="text-xs font-bold text-gray-700">&ldquo;{t.highlight}&rdquo;</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">
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

      {/* ══════════════════════════════════════════════════════════════════
          PLANOS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div
            ref={fadePlanos.ref}
            className="text-center mb-12"
            style={{
              opacity: fadePlanos.visible ? 1 : 0,
              transform: fadePlanos.visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Preços transparentes</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Comece grátis. Escale quando quiser.
            </h2>
            <p className="text-lg text-gray-500">Sem cartão de crédito. Sem burocracia.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
            {[
              { name: "Free",    price: "Grátis",    desc: "3 imóveis · 3 compradores",           highlight: false },
              { name: "Starter", price: "R$ 39/mês", desc: "20 imóveis · 30 compradores",         highlight: true  },
              { name: "Pro",     price: "R$ 79/mês", desc: "Ilimitado · prioridade no algoritmo",  highlight: false },
            ].map((p, i) => (
              <div
                key={p.name}
                style={{
                  opacity: fadePlanos.visible ? 1 : 0,
                  transform: fadePlanos.visible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
                }}
                className={`relative rounded-2xl p-6 text-center transition-all duration-200 ${
                  p.highlight
                    ? "bg-white border-2 border-blue-600 shadow-xl shadow-blue-100/60 scale-[1.02]"
                    : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-md shadow-blue-200">
                    Mais popular
                  </span>
                )}
                <p className={`font-bold text-base mb-1 ${p.highlight ? "text-gray-900" : "text-gray-700"}`}>{p.name}</p>
                <p className={`text-2xl font-extrabold mb-1 ${p.highlight ? "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent" : "text-gray-900"}`}>
                  {p.price}
                </p>
                <p className={`text-xs mb-5 ${p.highlight ? "text-gray-500" : "text-gray-400"}`}>{p.desc}</p>
                <Link href="/register"
                  className={`inline-flex items-center justify-center gap-1 w-full py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
                    p.highlight
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 shadow-md shadow-blue-200/60"
                      : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}>
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

      {/* ══════════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto mb-7 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
            <ArrowRightLeft className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight leading-[1.08]">
            Pronto para fechar mais negócios?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
            Entre para a rede de corretores que estão gerando oportunidades todos os dias. Comece gratuitamente hoje.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/register"
              className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-base font-bold hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-blue-900/30">
              Começar a gerar oportunidades
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/imoveis"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-4 text-base font-medium text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200">
              <Flame className="h-4 w-4 text-orange-300" />
              Ver oportunidades
            </Link>
          </div>

          <p className="text-sm text-blue-200">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.png" alt="ImobMatch" className="h-8 w-auto object-contain brightness-0 invert mb-4" />
              <p className="text-sm leading-relaxed text-gray-500 mb-5">
                A rede colaborativa de corretores que conecta imóveis, compradores e parceiros de forma inteligente.
              </p>
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} ImobMatch</p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-5">Produto</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/plans"            className="hover:text-white transition-colors">Planos e preços</Link></li>
                <li><Link href="/imoveis"          className="hover:text-white transition-colors">Imóveis</Link></li>
                <li><Link href="/#como-funciona"   className="hover:text-white transition-colors">Como funciona</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-5">Conta</p>
              <ul className="space-y-3 text-sm">
                <li><Link href="/login"    className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Criar conta grátis</Link></li>
              </ul>
            </div>
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

          <div className="border-t border-gray-800 pt-7 mb-6">
            <p className="text-[11px] leading-relaxed text-gray-600 text-center max-w-4xl mx-auto">
              <span className="text-amber-500 font-semibold">⚠ Aviso Legal:</span>{" "}
              A ImobMatch é uma plataforma de publicidade tecnológica e <strong className="text-gray-500">não se
              responsabiliza</strong> por negociações de compra, venda, locação, permuta ou qualquer outra
              transação imobiliária realizada entre usuários. Toda negociação é de responsabilidade exclusiva
              das partes envolvidas e do corretor habilitado pelo CRECI (Lei nº 6.530/1978). A Plataforma não
              verifica a regularidade documental dos imóveis anunciados nem garante a veracidade das informações
              publicadas pelos usuários. Consulte nossos{" "}
              <Link href="/termos" className="text-gray-400 hover:text-gray-300 underline underline-offset-2">
                Termos de Uso
              </Link>{" "}
              para mais detalhes.
            </p>
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