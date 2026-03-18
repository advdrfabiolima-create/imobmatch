"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  CheckCircle2, AlertCircle, ArrowRight, Building2,
  Users, Zap, HelpingHand, Lock, ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { maskPhone } from "@/lib/masks";

// ── Copies centralizadas ──────────────────────────────────────────────────────
const COPY = {
  badge:      "Acesso exclusivo · Grupo Negócios Imobiliários",
  headline:   "Pare de perder clientes por não ter o imóvel certo.",
  subheadline:"Uma plataforma para corretores encontrarem imóveis, compradores e parcerias com mais facilidade.",
  support:    "Estou liberando acesso antecipado para membros do grupo Negócios Imobiliários.",
  ctaButton:  "Quero acesso antecipado",
  scarcity:   "As vagas estão sendo liberadas de forma gradual para garantir qualidade na plataforma.",
  privacy:    "Seus dados serão usados apenas para liberar o acesso antecipado e comunicar novidades do ImobMatch.",
  successTitle:   "Cadastro realizado!",
  successMessage: "Você entrou na lista de acesso antecipado. Estamos liberando as vagas aos poucos para garantir a qualidade da plataforma. Fique atento ao seu e-mail.",
  pains: [
    "Têm cliente, mas não encontram o imóvel certo",
    "Têm imóvel, mas não encontram o comprador ideal",
    "Têm dificuldade de fazer parcerias confiáveis",
  ],
  benefits: [
    { icon: Building2, label: "Cadastre seus imóveis",                   color: "blue"   },
    { icon: Users,     label: "Cadastre seus compradores",               color: "indigo" },
    { icon: Zap,       label: "Encontre oportunidades com corretores",   color: "violet" },
    { icon: HelpingHand, label: "Gere mais negócios com parcerias",       color: "purple" },
  ],
} as const;

// ── Validação ─────────────────────────────────────────────────────────────────
const schema = z.object({
  fullName: z.string().min(2, "Nome obrigatório (mínimo 2 caracteres)"),
  email:    z.string().email("E-mail inválido"),
  whatsapp: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Componente principal ──────────────────────────────────────────────────────
export default function AcessoAntecipadoPage() {
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

  return (
    <>
      {/* SEO */}
      <title>Acesso Antecipado · ImobMatch</title>
      <meta name="description" content="Cadastre-se na lista de acesso antecipado do ImobMatch — a plataforma que conecta corretores, imóveis e compradores para gerar mais parcerias e negócios." />

      <div className="min-h-screen bg-white">

        {/* ── Header mínimo ── */}
        <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/">
              <img src="/logo.png" alt="ImobMatch" className="h-8 w-auto object-contain" />
            </Link>
            <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              Já tenho conta
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="max-w-5xl mx-auto px-6 pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />
                {COPY.badge}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
                {COPY.headline}
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-4">
                {COPY.subheadline}
              </p>

              <p className="text-sm text-blue-700 font-medium bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-8">
                🎯 {COPY.support}
              </p>

              {/* Benefícios visuais */}
              <div className="grid grid-cols-2 gap-3">
                {COPY.benefits.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 p-3 bg-${color}-50 rounded-xl border border-${color}-100`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 text-${color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário */}
            <div className="w-full">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100 p-8">

                {submitted ? (
                  /* ── Estado de sucesso ── */
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      ✅ {COPY.successTitle}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      {COPY.successMessage}
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left mb-6">
                      <p className="text-sm font-semibold text-green-800 mb-1">Próximos passos:</p>
                      <ul className="space-y-1.5">
                        {[
                          "Verifique seu e-mail (incluindo spam)",
                          "Aguarde o convite de acesso",
                          "Compartilhe com outros corretores do grupo",
                        ].map(t => (
                          <li key={t} className="flex items-start gap-2 text-sm text-green-700">
                            <ChevronRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Conhecer a plataforma <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  /* ── Formulário ── */
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Quero acesso antecipado</h2>
                      <p className="text-sm text-gray-400">Preencha seus dados e entre na fila de espera.</p>
                    </div>

                    {serverError && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        {serverError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      {/* Nome */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nome completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="João Silva"
                          {...register("fullName")}
                          className={`w-full h-11 px-4 rounded-xl border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                            errors.fullName ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        />
                        {errors.fullName && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      {/* E-mail */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="joao@email.com"
                          {...register("email")}
                          className={`w-full h-11 px-4 rounded-xl border text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                            errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                          }`}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          WhatsApp <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          {...register("whatsapp")}
                          onChange={(e) => setValue("whatsapp", maskPhone(e.target.value))}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Enviando...
                          </span>
                        ) : (
                          <>
                            {COPY.ctaButton}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Escassez */}
                    <p className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                      🔒 {COPY.scarcity}
                    </p>

                    {/* Privacidade */}
                    <p className="text-[11px] text-gray-400 text-center mt-3 flex items-start justify-center gap-1">
                      <Lock className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      {COPY.privacy}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Dores ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Muitos corretores enfrentam os mesmos problemas todos os dias:
            </h2>
            <p className="text-gray-400 text-sm text-center mb-8">Você se identifica com algum deles?</p>
            <div className="grid md:grid-cols-3 gap-4">
              {COPY.pains.map((pain) => (
                <div key={pain} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs font-bold">✕</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white text-center">
              <p className="font-semibold text-lg mb-1">O ImobMatch foi criado para ajudar a resolver isso.</p>
              <p className="text-blue-100 text-sm">Uma plataforma onde corretores colaboram e fecham mais negócios juntos.</p>
            </div>
          </div>
        </section>

        {/* ── Como funciona (preview) ── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Como vai funcionar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Cadastre-se na lista",     desc: "Preencha o formulário e garanta sua vaga no acesso antecipado.",           color: "blue"   },
              { num: "2", title: "Receba o convite",          desc: "Você receberá um e-mail com seu acesso exclusivo quando a vaga abrir.",     color: "indigo" },
              { num: "3", title: "Comece a gerar negócios",   desc: "Entre na plataforma, cadastre seus imóveis e compradores e gere matches.", color: "violet" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className={`w-14 h-14 rounded-2xl bg-${step.color}-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-${step.color}-200`}>
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="bg-gradient-to-br from-blue-600 to-violet-700 py-16">
          <div className="max-w-xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Garanta sua vaga agora
            </h2>
            <p className="text-blue-200 mb-8 text-sm leading-relaxed">
              As vagas de acesso antecipado são limitadas. Cadastre-se e seja avisado em primeira mão quando a plataforma abrir para o seu perfil.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition shadow-xl shadow-blue-900/20 text-[15px]"
            >
              Quero acesso antecipado
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* ── Footer mínimo ── */}
        <footer className="border-t py-8">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400">
            <Link href="/">
              <img src="/logo.png" alt="ImobMatch" className="h-6 w-auto object-contain" />
            </Link>
            <p>© {new Date().getFullYear()} ImobMatch · useimobmatch.com.br</p>
            <div className="flex gap-4">
              <Link href="/privacidade" className="hover:text-blue-600 transition-colors">Privacidade</Link>
              <Link href="/termos"      className="hover:text-blue-600 transition-colors">Termos</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
