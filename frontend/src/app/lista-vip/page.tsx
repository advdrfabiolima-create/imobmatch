"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2, AlertCircle, ArrowRight, Lock,
  Users, HelpingHand, TrendingUp, Search, Star,
  ChevronRight, Shield, Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { maskPhone } from "@/lib/masks";

// ── Contador de visitantes únicos (por IP) ────────────────────────────────────
function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Registra a visita e retorna o total de visitantes únicos.
    // O backend deve verificar o IP e só incrementar se for um IP novo.
    api.post("/visits/track").then((res) => {
      const total = typeof res.data === "number" ? res.data : res.data?.uniqueVisitors ?? 0;
      setCount(total);
    }).catch(() => {
      // Fallback: tenta apenas buscar o contador sem registrar
      api.get("/visits/count").then((res) => {
        const total = typeof res.data === "number" ? res.data : res.data?.uniqueVisitors ?? 0;
        setCount(total);
      }).catch(() => {});
    });
  }, []);

  // Animação de contagem
  useEffect(() => {
    if (count === null) return;
    let start = 0;
    const duration = 1200;
    const step = Math.max(1, Math.ceil(count / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= count) { setDisplayed(count); clearInterval(timer); }
      else setDisplayed(start);
    }, 16);
    return () => clearInterval(timer);
  }, [count]);

  if (count === null) return null;

  return (
    <div
      className="flex items-center gap-2.5 rounded-full px-4 py-2 mb-5 w-fit"
      style={{
        background: "rgba(16,185,129,0.10)",
        border: "1px solid rgba(16,185,129,0.25)",
      }}
    >
      <span className="flex -space-x-1.5">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="w-5 h-5 rounded-full border-2 border-[#0b1437] bg-gradient-to-br from-violet-400 to-blue-500 flex-shrink-0"
          />
        ))}
      </span>
      <span className="text-emerald-400 text-xs font-semibold">
        <span className="font-extrabold text-white">{displayed.toLocaleString("pt-BR")}</span> pessoas já visitaram esta página
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
    </div>
  );
}

const schema = z.object({
  fullName: z.string().min(2, "Nome obrigatório"),
  email:    z.string().email("E-mail inválido"),
  whatsapp: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Métricas ──────────────────────────────────────────────────────────────────
const STATS = [
  { value: "Gratuito",  label: "Sem cartão de crédito" },
  { value: "R$ 48M+",  label: "Potencial estimado" },
  { value: "1 semana", label: "Primeiros matches" },
  { value: "100%",     label: "Focado em corretores" },
];

// ── Depoimentos ───────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Carlos Mendonça",
    role: "Corretor · São Paulo / SP",
    text: "Em 3 semanas já tinha fechado uma parceria que me rendeu R$ 14 mil. Nunca achei que seria tão direto.",
    stars: 5,
  },
  {
    name: "Patrícia Lemos",
    role: "Corretora · Campinas / SP",
    text: "Eu tinha imóveis parados há meses. Na primeira semana na plataforma apareceu um comprador perfeito via match.",
    stars: 5,
  },
  {
    name: "Rodrigo Faria",
    role: "Corretor · Belo Horizonte / MG",
    text: "Finalmente uma ferramenta feita para quem é corretor de verdade. Simples, prática e que entrega resultado.",
    stars: 5,
  },
];

// ── Formulário de cadastro ────────────────────────────────────────────────────
function SignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.post("/early-access", {
        fullName: data.fullName,
        email:    data.email,
        whatsapp: data.whatsapp || undefined,
        source:   "facebook_group",
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? "";
      if (msg.toLowerCase().includes("já está")) {
        setServerError("Este e-mail já está na nossa lista! Fique de olho no inbox.");
      } else {
        setServerError("Ocorreu um erro. Tente novamente em instantes.");
      }
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(16,185,129,0.15)" }}
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Você está na lista!</h3>
        <p className="text-white/45 text-sm leading-relaxed mb-6">
          Seu cadastro foi confirmado. Estamos liberando as vagas gradualmente
          para garantir a qualidade da experiência. Fique de olho no seu e-mail.
        </p>
        <div
          className="rounded-xl p-4 text-left border"
          style={{
            background: "rgba(16,185,129,0.08)",
            borderColor: "rgba(16,185,129,0.20)",
          }}
        >
          <p className="text-sm font-semibold text-emerald-400 mb-2">Próximos passos:</p>
          <ul className="space-y-2">
            {[
              "Verifique seu e-mail (incluindo a pasta de spam)",
              "Aguarde o link de acesso exclusivo",
              "Convide outros corretores do grupo",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-emerald-300/70">
                <ChevronRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <VisitCounter />

      <div className="mb-5">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">
          Acesso exclusivo · Grupo Negócios Imobiliários
        </p>
        <h3 className="text-xl font-bold text-white">Garantir minha vaga grátis</h3>
        <p className="text-sm text-white/35 mt-1">Sem cartão de crédito. Sem compromisso.</p>
      </div>

      {serverError && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm border"
          style={{
            background: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <div>
          <label className="block text-xs font-medium text-white/45 mb-1.5">
            Nome completo <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="João Silva"
            {...register("fullName")}
            className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-white/25 border transition-colors focus:outline-none"
            style={{
              background: errors.fullName ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.07)",
              borderColor: errors.fullName ? "rgba(239,68,68,0.40)" : "rgba(255,255,255,0.12)",
            }}
          />
          {errors.fullName && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-white/45 mb-1.5">
            E-mail <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            placeholder="joao@email.com"
            {...register("email")}
            className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-white/25 border transition-colors focus:outline-none"
            style={{
              background: errors.email ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.07)",
              borderColor: errors.email ? "rgba(239,68,68,0.40)" : "rgba(255,255,255,0.12)",
            }}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-white/45 mb-1.5">
            WhatsApp{" "}
            <span className="text-white/25 font-normal">(opcional — para contato prioritário)</span>
          </label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            {...register("whatsapp")}
            onChange={(e) => setValue("whatsapp", maskPhone(e.target.value))}
            className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-white/25 border transition-colors focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px] mt-1"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(37,99,235,0.30)",
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Enviando...
            </>
          ) : (
            <>
              Quero acesso antecipado gratuito
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-white/25">
        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> 100% gratuito</span>
        <span className="w-px h-3 bg-white/10" />
        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Dados protegidos</span>
        <span className="w-px h-3 bg-white/10" />
        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Sem spam</span>
      </div>
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ListaVipPage() {
  return (
    <>
      <title>Acesso Antecipado Exclusivo · ImobMatch</title>
      <meta name="description" content="Plataforma de matches e parcerias para corretores. Garanta seu acesso exclusivo antecipado." />

      <div
        className="min-h-screen font-sans"
        style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 60%, #080e1f 100%)" }}
      >

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(160deg,#0b1437 0%,#0f1d5e 40%,#1a0f5c 70%,#2e0f6e 100%)" }}
        >
          {/* Imagem de fundo hero */}
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/hero_lista_vip.jpg"
              alt=""
              className="w-full h-full object-cover object-center opacity-20"
            />
          </div>

          {/* Ambient glows */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
            style={{ background: "rgba(109,40,217,0.22)", filter: "blur(120px)" }} />
          <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full"
            style={{ background: "rgba(37,99,235,0.15)", filter: "blur(100px)" }} />

          <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-8 pb-14 md:pt-14 md:pb-24">

            {/* Logo */}
            <div className="mb-8 md:mb-12">
              <img src="/logo_texto_branco.png" alt="ImobMatch" className="h-5 md:h-6 w-auto object-contain" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">

              {/* Copy */}
              <div>
                <div className="inline-flex items-center gap-2 border border-violet-400/30 bg-violet-500/10 text-violet-300 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-wider mb-6 max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
                  <span className="truncate">Acesso exclusivo · Grupo Negócios Imobiliários</span>
                </div>

                <h1 className="text-[2rem] sm:text-4xl md:text-[3.2rem] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
                  Pare de trabalhar sozinho.<br />
                  <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(90deg,#60a5fa,#a78bfa)" }}>
                    A rede fecha por você.
                  </span>
                </h1>

                <p className="text-white/60 text-base md:text-lg leading-relaxed mb-7 max-w-md">
                  Conecte seus imóveis e compradores à maior rede colaborativa de corretores.
                  Matches automáticos, parcerias confiáveis e mais negócios — sem prospectar no escuro.
                </p>

                <ul className="space-y-3 mb-10">
                  {[
                    "Tem cliente mas não acha o imóvel certo?",
                    "Tem imóvel mas não encontra o comprador ideal?",
                    "Dificuldade de fechar parcerias confiáveis?",
                  ].map((pain) => (
                    <li key={pain} className="flex items-center gap-3 text-white/70 text-sm">
                      <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center flex-shrink-0 text-red-400 text-xs font-bold">✕</span>
                      {pain}
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {STATS.map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl font-extrabold text-white">{s.value}</p>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário */}
              <div>
                <div
                  className="rounded-2xl p-7 md:p-8 border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.10)",
                    boxShadow: "0 4px 40px rgba(0,0,0,0.50)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <SignupForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ──────────────────────────────────────────────────── */}
        <section
          className="py-14 md:py-20 border-y"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Como funciona</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Do cadastro ao primeiro negócio<br className="hidden sm:block" /> em poucos dias
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: "01", title: "Garanta sua vaga",       desc: "Preencha o formulário acima. Vagas limitadas — estamos liberando por ordem de cadastro.", from: "#2563eb", to: "#1d4ed8" },
                { num: "02", title: "Receba o acesso",         desc: "Você recebe um e-mail com o link exclusivo para criar sua conta e configurar seu perfil.", from: "#7c3aed", to: "#6d28d9" },
                { num: "03", title: "Comece a gerar negócios", desc: "Cadastre imóveis e compradores. A plataforma faz o match e conecta você com os parceiros certos.", from: "#0891b2", to: "#0e7490" },
              ].map((step) => (
                <div
                  key={step.num}
                  className="relative rounded-2xl p-7 overflow-hidden border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <span
                    className="text-7xl font-black leading-none select-none block mb-3"
                    style={{ backgroundImage: `linear-gradient(135deg,${step.from},${step.to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  >
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                    style={{ backgroundImage: `linear-gradient(90deg,${step.from},${step.to})` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFÍCIOS ─────────────────────────────────────────────────────── */}
        <section className="py-14 md:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">O que você ganha</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Tudo que um corretor moderno precisa<br className="hidden sm:block" /> em uma só plataforma
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  icon: Search,
                  title: "Match automático",
                  desc: "Seus compradores são cruzados com imóveis da rede em tempo real. Você recebe o lead — sem esforço.",
                  from: "#2563eb", to: "#7c3aed",
                },
                {
                  icon: HelpingHand,
                  title: "Parcerias inteligentes",
                  desc: "Conecte-se com corretores verificados e feche negócios que sozinho você nunca fecharia.",
                  from: "#7c3aed", to: "#a855f7",
                },
                {
                  icon: TrendingUp,
                  title: "Mais negócios, menos esforço",
                  desc: "A rede trabalha por você 24/7. Quando acorda, já tem oportunidades esperando.",
                  from: "#0891b2", to: "#2563eb",
                },
                {
                  icon: Shield,
                  title: "Carteira protegida",
                  desc: "Seus clientes e imóveis ficam registrados, organizados e seguros em um só lugar.",
                  from: "#059669", to: "#0891b2",
                },
              ].map(({ icon: Icon, title, desc, from, to }) => (
                <div
                  key={title}
                  className="relative rounded-2xl p-6 flex items-start gap-4 overflow-hidden border hover:-translate-y-0.5 transition-transform duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                    style={{ backgroundImage: `linear-gradient(135deg,${from},${to})` }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEPOIMENTOS ────────────────────────────────────────────────────── */}
        <section
          className="max-w-5xl mx-auto px-5 sm:px-6 py-14 md:py-20 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Quem já usa</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Corretores que saíram do escuro
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border p-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-5">"{t.text}"</p>
                <div
                  className="flex items-center gap-3 pt-4 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{t.name}</p>
                    <p className="text-xs text-white/35">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ──────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-14 md:py-20"
          style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#4c1d95 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, rgba(109,40,217,0.3) 0%, transparent 70%)" }} />
          <div className="relative max-w-xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 font-medium mb-6">
              <Users className="h-3.5 w-3.5" />
              Vagas limitadas — liberação gradual
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Sua concorrência já está dentro.
            </h2>
            <p className="text-blue-200/70 text-base leading-relaxed mb-8">
              Cada dia fora da rede é um negócio que você deixou para outro corretor fechar.
              Entre agora e comece a trabalhar de forma colaborativa.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition shadow-2xl shadow-blue-900/30 text-[15px]"
            >
              Garantir minha vaga agora
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-blue-300/60 text-xs mt-4">Gratuito · Sem cartão de crédito · Cancele quando quiser</p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer
          className="border-t py-7"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <img src="/logo_texto_branco.png" alt="ImobMatch" className="h-5 w-auto object-contain opacity-30" />
            <p className="text-xs text-white/20">
              © {new Date().getFullYear()} ImobMatch · Todos os direitos reservados · Seus dados são protegidos e nunca serão compartilhados.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}