"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  CheckCircle2, AlertCircle, ArrowRight, Users,
  Zap, Shield, TrendingUp, Clock, Star, ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { maskPhone } from "@/lib/masks";

/* ─── Paleta ────────────────────────────────────────────── */
const BG       = "#07070d";
const CARD_BG  = "#0e0e18";
const BORDER   = "rgba(255,255,255,0.08)";
const ACCENT   = "#c8f04a";    // lime ácido
const GOLD     = "#e8c96a";    // dourado suave
const MUTED    = "rgba(255,255,255,0.40)";

/* ─── Fontes Google (injetadas via <style>) ─────────────────*/
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
`;

/* ─── Contagem real de membros ──────────────────────────── */
function MemberCount({ onLoad }: { onLoad?: (n: number) => void }) {
  const [count, setCount] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    api.get("/early-access/count")
      .then((res) => {
        const n = typeof res.data === "number" ? res.data : Number(res.data ?? 0);
        setCount(n);
        onLoad?.(n);
      })
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    if (count === null) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(count / 60));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, count);
      setDisplayed(cur);
      if (cur >= count) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [count]);

  if (count === null)
    return <span className="inline-block w-8 h-4 rounded animate-pulse" style={{ background: "rgba(200,240,74,0.2)" }} />;

  return <span>{displayed.toLocaleString("pt-BR")}</span>;
}

/* ─── Schema do formulário ──────────────────────────────── */
const schema = z.object({
  fullName: z.string().min(2, "Nome obrigatório"),
  email:    z.string().email("E-mail inválido"),
  whatsapp: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

/* ─── Formulário de cadastro ────────────────────────────── */
function SignupForm({ id = "form-hero" }: { id?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const whatsappVal = watch("whatsapp") ?? "";

  async function onSubmit(data: FormData) {
    setStatus("loading");
    try {
      await api.post("/early-access", { ...data, source: "facebook_group" });
      setStatus("success");
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? "";
      setStatus(msg.toLowerCase().includes("já") ? "duplicate" : "error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: CARD_BG, border: `1px solid ${ACCENT}33` }}
      >
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: ACCENT }} />
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>
          Você está na lista!
        </h3>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>
          Entraremos em contato assim que sua vaga for liberada.<br />
          Fique de olho no e-mail e WhatsApp.
        </p>
      </div>
    );
  }

  const inputClass = "w-full px-4 h-12 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-colors";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}` };
  const inputFocusStyle = { ...inputStyle, border: `1px solid ${ACCENT}55` };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={id} className="flex flex-col gap-3">
      <div>
        <input
          {...register("fullName")}
          placeholder="Seu nome completo"
          className={inputClass}
          style={inputStyle}
          onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={e => Object.assign(e.target.style, inputStyle)}
        />
        {errors.fullName && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Seu melhor e-mail"
          className={inputClass}
          style={inputStyle}
          onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={e => Object.assign(e.target.style, inputStyle)}
        />
        {errors.email && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("whatsapp")}
          placeholder="WhatsApp (opcional)"
          className={inputClass}
          style={inputStyle}
          value={whatsappVal}
          onChange={e => setValue("whatsapp", maskPhone(e.target.value))}
          onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={e => Object.assign(e.target.style, inputStyle)}
        />
      </div>

      {status === "duplicate" && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Este e-mail já está na lista. Aguarde o contato.
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171" }}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Algo deu errado. Tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: status === "loading" ? "rgba(200,240,74,0.5)" : ACCENT,
          color: "#07070d",
          opacity: status === "loading" ? 0.7 : 1,
        }}
      >
        {status === "loading" ? "Enviando..." : (
          <>Garantir minha vaga como Membro Fundador <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
        100% gratuito · Sem cartão de crédito · Acesso antecipado
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function ListaVipPage() {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  return (
    <>
      <style>{FONT_STYLE}</style>

      <div style={{ background: BG, minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

        {/* ── Ambient glows ─────────────────────────────────── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "-10%", left: "60%",
            width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT}0a 0%, transparent 65%)`,
            filter: "blur(60px)",
          }} />
          <div style={{
            position: "absolute", top: "40%", left: "-10%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
            filter: "blur(60px)",
          }} />
        </div>

        {/* ══════════════════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════════════════ */}
        <nav
          className="sticky top-0 z-40"
          style={{
            background: "rgba(7,7,13,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div className="container mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="transition-opacity hover:opacity-70">
              <img src="/logo_texto_branco.png" alt="ImobMatch" className="h-5 w-auto object-contain" />
            </Link>
            <a
              href="#form-hero"
              className="text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}33` }}
            >
              Garantir vaga
            </a>
          </div>
        </nav>

        <div className="relative z-10">

          {/* ══════════════════════════════════════════════════════
              HERO — 2 colunas
          ══════════════════════════════════════════════════════ */}
          <section className="container mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Coluna esquerda — copy */}
              <div>
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8"
                  style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, color: ACCENT }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
                  Acesso antecipado —&nbsp;
                  <MemberCount onLoad={setMemberCount} />
                  &nbsp;membros na fila
                </div>

                {/* Headline */}
                <h1
                  className="text-4xl lg:text-5xl xl:text-[3.4rem] leading-tight text-white mb-6"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  Seja um dos primeiros<br />
                  <em style={{ color: ACCENT, fontStyle: "italic" }}>Membros Fundadores</em><br />
                  da ImobMatch
                </h1>

                {/* Sub */}
                <p className="text-base lg:text-lg leading-relaxed mb-10" style={{ color: MUTED, maxWidth: 480 }}>
                  A plataforma que conecta corretores a compradores qualificados via inteligência artificial —
                  antes mesmo do lançamento público. Garanta condições exclusivas que não existirão depois.
                </p>

                {/* Lista de benefícios rápidos */}
                <ul className="flex flex-col gap-3 mb-10">
                  {[
                    "Acesso vitalício ao plano Fundador com desconto permanente",
                    "Matches automáticos com compradores qualificados na sua região",
                    "Radar de oportunidades da rede em tempo real",
                    "Badge exclusivo de Membro Fundador no perfil",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Social proof sutil */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["from-violet-500 to-blue-500", "from-teal-500 to-cyan-500", "from-pink-500 to-rose-500", "from-amber-400 to-orange-500"].map((g, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 bg-gradient-to-br ${g} flex-shrink-0`}
                        style={{ borderColor: BG }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: MUTED }}>
                    Corretores de todo o Brasil já garantiram sua vaga
                  </p>
                </div>
              </div>

              {/* Coluna direita — formulário */}
              <div>
                <div
                  className="rounded-2xl p-8"
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${BORDER}`,
                    boxShadow: `0 0 60px ${ACCENT}08`,
                  }}
                >
                  <div className="mb-6">
                    <div
                      className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 mb-4"
                      style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}25` }}
                    >
                      <Star className="h-3 w-3" /> Vagas limitadas
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}>
                      Garanta sua vaga agora
                    </h2>
                    <p className="text-sm" style={{ color: MUTED }}>
                      Sem compromisso. Gratuito para membros fundadores.
                    </p>
                  </div>

                  <SignupForm id="form-hero" />
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              BENEFÍCIOS — 3×2 grid
          ══════════════════════════════════════════════════════ */}
          <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
            <div className="container mx-auto px-6 py-20">
              <div className="text-center mb-14">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: `${ACCENT}90` }}>
                  Por que entrar agora
                </p>
                <h2
                  className="text-3xl lg:text-4xl text-white"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  O que Membros Fundadores ganham
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <TrendingUp className="h-5 w-5" />,
                    title: "Desconto permanente",
                    desc: "Membros fundadores travam o preço de lançamento para sempre. Mesmo quando os planos subirem, você não paga a mais.",
                    color: ACCENT,
                  },
                  {
                    icon: <Zap className="h-5 w-5" />,
                    title: "Matches automáticos",
                    desc: "A IA conecta seus imóveis a compradores com perfil compatível na rede — sem você precisar fazer nada.",
                    color: "#818cf8",
                  },
                  {
                    icon: <Users className="h-5 w-5" />,
                    title: "Radar da Rede",
                    desc: "Veja em tempo real quais imóveis estão com desconto, quais compradores entraram na rede e onde estão as oportunidades.",
                    color: "#fb923c",
                  },
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Badge exclusivo",
                    desc: "Seu perfil terá o selo de Membro Fundador — um diferencial visível para outros corretores e compradores da plataforma.",
                    color: GOLD,
                  },
                  {
                    icon: <Clock className="h-5 w-5" />,
                    title: "Acesso antecipado",
                    desc: "Você entra antes do lançamento público. Menos concorrência, mais visibilidade, primeiros a fechar negócios na rede.",
                    color: "#34d399",
                  },
                  {
                    icon: <Star className="h-5 w-5" />,
                    title: "Voz no produto",
                    desc: "Fundadores participam de calls diretas com o time para sugerir funcionalidades. Você ajuda a moldar a plataforma.",
                    color: "#f472b6",
                  },
                ].map(({ icon, title, desc, color }) => (
                  <div
                    key={title}
                    className="rounded-2xl p-6"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${color}14`, color }}
                    >
                      {icon}
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              COMO FUNCIONA — 3 passos
          ══════════════════════════════════════════════════════ */}
          <section className="container mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: `${ACCENT}90` }}>
                Simples assim
              </p>
              <h2
                className="text-3xl lg:text-4xl text-white"
                style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
              >
                Como funciona
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Cadastre-se na lista",
                  desc: "Preencha o formulário acima. É gratuito e leva menos de 30 segundos.",
                },
                {
                  step: "02",
                  title: "Receba o convite",
                  desc: "Assim que sua vaga for liberada, você recebe um e-mail com acesso à plataforma.",
                },
                {
                  step: "03",
                  title: "Comece a fechar negócios",
                  desc: "Cadastre seus imóveis, ative os matches e acompanhe as oportunidades no radar.",
                },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold"
                    style={{
                      fontFamily: "Instrument Serif, serif",
                      background: `${ACCENT}12`,
                      border: `1px solid ${ACCENT}25`,
                      color: ACCENT,
                    }}
                  >
                    {step}
                  </div>
                  {i < 2 && (
                    <ChevronRight
                      className="hidden md:block absolute translate-x-full mt-[-2.5rem]"
                      style={{ color: BORDER, position: "relative" }}
                    />
                  )}
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              HONESTY BLOCK — transparência
          ══════════════════════════════════════════════════════ */}
          <section style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="container mx-auto px-6 py-20 max-w-3xl">
              <div
                className="rounded-2xl p-8 lg:p-10"
                style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: `${GOLD}90` }}>
                  Transparência total
                </p>
                <h2
                  className="text-2xl lg:text-3xl text-white mb-5"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  O que você precisa saber antes de entrar
                </h2>
                <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                  <p>
                    A ImobMatch está em fase de lançamento. A plataforma existe, está funcionando e já tem corretores usando — mas ainda é cedo. Haverá bugs, ajustes e melhorias frequentes.
                  </p>
                  <p>
                    A lista de Membros Fundadores é para corretores que querem entrar primeiro, aceitar imperfeições iniciais e crescer junto com o produto. Em troca, você ganha condições que nunca mais serão oferecidas depois do lançamento público.
                  </p>
                  <p>
                    Não prometemos milagres nem resultados garantidos. O que prometemos é uma ferramenta séria, suporte ativo e um time comprometido em construir algo que realmente funcione para o corretor brasileiro.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              CTA FINAL
          ══════════════════════════════════════════════════════ */}
          <section style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="container mx-auto px-6 py-20 lg:py-28">
              <div className="max-w-xl mx-auto text-center mb-10">
                <h2
                  className="text-3xl lg:text-4xl text-white mb-4"
                  style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
                >
                  Pronto para garantir sua vaga?
                </h2>
                <p className="text-base" style={{ color: MUTED }}>
                  As vagas de Membro Fundador são limitadas e serão encerradas sem aviso prévio.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div
                  className="rounded-2xl p-8"
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${ACCENT}25`,
                    boxShadow: `0 0 80px ${ACCENT}0a`,
                  }}
                >
                  <SignupForm id="form-cta" />
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              FOOTER
          ══════════════════════════════════════════════════════ */}
          <footer style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="container mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="transition-opacity hover:opacity-70">
                <img src="/logo_texto_branco.png" alt="ImobMatch" className="h-4 w-auto object-contain" />
              </Link>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
                © {new Date().getFullYear()} ImobMatch · Todos os direitos reservados
              </p>
              <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
                <Link href="/imoveis" className="hover:text-white transition-colors">Ver imóveis</Link>
                <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
