"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Loader2, ArrowRight, Check,
  Building2, Users, Zap, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { STATES } from "@/lib/utils";
import { maskPhone } from "@/lib/masks";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  { id: "free"    as const, name: "Free",    price: "Grátis", period: "",     popular: false },
  { id: "starter" as const, name: "Starter", price: "R$ 39",  period: "/mês", popular: true  },
  { id: "pro"     as const, name: "Pro",     price: "R$ 79",  period: "/mês", popular: false },
  { id: "premium" as const, name: "Premium", price: "R$ 149", period: "/mês", popular: false },
  { id: "agency"  as const, name: "Agency",  price: "R$ 399", period: "/mês", popular: false },
];

type PlanId = (typeof PLANS)[number]["id"];

const FEATURES = [
  { icon: Building2, text: "Encontre imóveis para seus clientes em segundos" },
  { icon: Users,     text: "Descubra compradores compatíveis na rede"         },
  { icon: Zap,       text: "Parcerias automáticas com corretores da região"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(2, "Nome obrigatório"),
  email:       z.string().email("E-mail inválido"),
  password:    z.string().min(6, "Mínimo 6 caracteres"),
  phone:       z.string().optional(),
  city:        z.string().optional(),
  state:       z.string().optional(),
  agency:      z.string().optional(),
  creci:       z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "Aceite os Termos para continuar",
  }),
});

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  [
    "h-11 text-sm rounded-xl bg-slate-50 border-slate-200 text-slate-900",
    "placeholder:text-slate-300 transition-all duration-150",
    "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.09] focus:outline-none",
    err ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.09]" : "",
  ].join(" ");

const selectCls =
  "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-all duration-150 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.09] focus:outline-none";

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  const dot = (n: number) => (
    <div
      className={[
        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
        step >= n
          ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white"
          : "bg-slate-100 text-slate-400",
      ].join(" ")}
    >
      {n === 1 && step > 1 ? <Check className="h-2.5 w-2.5" /> : n}
    </div>
  );

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {dot(1)}
      <div className={["w-6 h-px transition-all duration-500", step >= 2 ? "bg-blue-400" : "bg-slate-200"].join(" ")} />
      {dot(2)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function PlanSelector({ selected, onChange }: { selected: PlanId; onChange: (p: PlanId) => void }) {
  return (
    <div className="mb-7">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">
        Plano
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {PLANS.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={[
                "relative flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-xl transition-all duration-150 min-w-[68px]",
                active
                  ? "bg-blue-600 shadow-sm shadow-blue-300/30"
                  : plan.popular
                  ? "bg-white border border-blue-200 hover:border-blue-300"
                  : "bg-white border border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              <span className={["text-[11.5px] font-semibold leading-tight", active ? "text-white" : "text-slate-700"].join(" ")}>
                {plan.name}
              </span>
              <span className={["text-[10px] mt-0.5 leading-tight", active ? "text-blue-200" : "text-slate-400"].join(" ")}>
                {plan.price}{plan.period}
              </span>
              {plan.popular && !active && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8.5px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-px rounded-full whitespace-nowrap leading-none">
                  Popular
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400 mt-2">
        Free sempre grátis · Sem cartão para planos pagos
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11.5px] text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER FORM
// ─────────────────────────────────────────────────────────────────────────────

function RegisterForm() {
  const searchParams = useSearchParams();
  const rawPlan      = searchParams.get("plan") as PlanId;
  const validIds     = PLANS.map((p) => p.id);
  const inviteEmail  = searchParams.get("email") ?? "";

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    validIds.includes(rawPlan) ? rawPlan : "starter"
  );
  const [step, setStep]               = useState<1 | 2>(1);
  const [showPw, setShowPw]           = useState(false);
  const { register: authRegister, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { acceptTerms: false, email: inviteEmail } });

  const termsOk = watch("acceptTerms");

  const toStep2 = async () => {
    if (await trigger(["name", "email", "password", "acceptTerms"])) setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { acceptTerms, ...payload } = data;
      await authRegister({ ...payload, plan: selectedPlan });
      toast.success("Conta criada! Verifique seu e-mail.");
      router.push("/verificar-email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao criar conta");
    }
  };

  const btnStyle = {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    boxShadow: "0 4px 14px rgba(37,99,235,0.22)",
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 px-8 py-8"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 10px 36px rgba(0,0,0,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-[-0.02em] leading-tight">
            {step === 1 ? "Criar conta" : "Dados profissionais"}
          </h2>
          <p className="text-[13px] text-slate-400 mt-1">
            {step === 1 ? (
              <>Já tem conta?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
                  Entrar
                </Link>
              </>
            ) : (
              "Opcional — complete agora ou depois no perfil"
            )}
          </p>
        </div>
        <StepIndicator step={step} />
      </div>

      {step === 1 && <PlanSelector selected={selectedPlan} onChange={setSelectedPlan} />}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Nome completo" error={errors.name?.message}>
              <Input placeholder="João Silva" autoFocus autoComplete="name"
                {...register("name")} className={inputCls(!!errors.name)} />
            </Field>

            <Field label="E-mail" error={errors.email?.message}>
              <Input type="email" placeholder="joao@email.com" autoComplete="email"
                {...register("email")} className={inputCls(!!errors.email)} />
            </Field>

            <Field label="Senha" error={errors.password?.message}>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password" {...register("password")}
                  className={inputCls(!!errors.password) + " pr-11"} />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="pt-0.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("acceptTerms")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0" />
                <span className="text-[12px] text-slate-500 leading-relaxed">
                  Concordo com os{" "}
                  <Link href="/termos" target="_blank" className="text-blue-600 hover:underline">Termos de Uso</Link>
                  {" "}e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-blue-600 hover:underline">Política de Privacidade</Link>.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1.5 text-[11.5px] text-red-500">{errors.acceptTerms.message}</p>
              )}
            </div>

            <div className="pt-1 space-y-2.5">
              <button type="button" onClick={toStep2} disabled={!termsOk}
                className="group w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={termsOk ? btnStyle : { background: "#94a3b8" }}>
                Criar conta grátis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Sem cartão · Comece em segundos
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-[12.5px] text-slate-400 -mt-2 mb-2">
              Essas informações ajudam corretores a te encontrar na rede.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefone">
                <Input autoFocus placeholder="(11) 99999-9999" autoComplete="tel"
                  {...register("phone")}
                  onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                  className={inputCls()} />
              </Field>

              <Field label="Estado">
                <select {...register("state")} className={selectCls}>
                  <option value="">Selecione</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Cidade">
                <Input placeholder="São Paulo" {...register("city")} className={inputCls()} />
              </Field>

              <Field label="Imobiliária">
                <Input placeholder="Nome da imobiliária" {...register("agency")} className={inputCls()} />
              </Field>

              <div className="col-span-2">
                <Field label="CRECI">
                  <Input placeholder="Ex: CRECI-SP 12345" {...register("creci")} className={inputCls()} />
                </Field>
              </div>
            </div>

            <div className="pt-1 space-y-2.5">
              <Button type="submit" disabled={isLoading}
                className="group w-full h-11 rounded-xl font-semibold text-sm text-white border-0 flex items-center justify-center gap-2 transition-all duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                style={btnStyle}>
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Criando conta...</>
                ) : (
                  <>Finalizar cadastro <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </Button>

              <div className="flex items-center gap-3 text-[12px] text-slate-400">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 hover:text-slate-600 transition-colors py-1">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>
                <span className="text-slate-200">·</span>
                <button type="submit" disabled={isLoading}
                  className="hover:text-blue-600 transition-colors py-1 disabled:opacity-40">
                  Pular esta etapa →
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] xl:w-5/12 relative flex-col items-start justify-center px-14 py-16 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0b1849 0%, #18106a 44%, #361178 72%, #461a8e 100%)",
      }}
    >
      {/* Single ambient glow */}
      <div className="pointer-events-none absolute -top-40 -right-20 w-[480px] h-[480px] rounded-full"
        style={{ background: "rgba(109,40,217,0.18)", filter: "blur(130px)" }} />
      <div className="pointer-events-none absolute -bottom-32 -left-10 w-72 h-72 rounded-full"
        style={{ background: "rgba(37,99,235,0.14)", filter: "blur(100px)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-full max-w-[340px] gap-11">

        {/* Logo */}
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Image src="/logo.png" alt="ImobMatch" width={190} height={56}
            className="h-11 w-auto object-contain brightness-0 invert" />
        </Link>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-[2rem] font-extrabold text-white leading-[1.12] tracking-[-0.03em]">
            Pare de perder clientes por não ter o imóvel certo.
          </h1>
          <p className="text-white/45 text-[14.5px] leading-relaxed">
            Conecte-se com corretores da sua região e<br />
            transforme lacunas em negócios fechados.
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="h-[15px] w-[15px] text-white/30 flex-shrink-0 mt-0.5" />
              <span className="text-white/55 text-[13.5px] leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Live indicator */}
        <div
          className="rounded-xl px-4 py-3.5 border border-white/[0.10]"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-white/70 text-[12.5px] font-medium">Plataforma ativa agora</span>
          </div>
          <p className="text-white/35 text-[12px] leading-relaxed">
            Novos matches sendo gerados. Quanto antes você entrar, maior sua vantagem na rede.
          </p>
        </div>

        {/* Social proof */}
        <p className="text-white/30 text-[12px]">
          Você está entre os primeiros corretores a entrar na plataforma.
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      <div className="w-full lg:w-[55%] xl:w-7/12 flex flex-col items-center justify-center px-6 py-14 sm:px-10 bg-[#f8f9fb] overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/">
            <Image src="/logo.png" alt="ImobMatch" width={148} height={44}
              className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-[480px]">
          <Suspense fallback={
            <div className="bg-white rounded-2xl border border-slate-100 px-8 py-8 h-[500px] animate-pulse" />
          }>
            <RegisterForm />
          </Suspense>

          <p className="mt-5 text-center text-[11px] text-slate-400">
            Sem cartão de crédito &nbsp;·&nbsp; Cancele quando quiser &nbsp;·&nbsp; Dados seguros
          </p>
        </div>
      </div>
    </div>
  );
}
