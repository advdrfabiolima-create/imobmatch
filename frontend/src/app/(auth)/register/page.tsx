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
  Building2, Users, Zap, CheckCircle2, ArrowLeft, Star,
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

const REGISTER_PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "Grátis",
    period: "",
    badge: null,
    features: ["3 imóveis", "3 compradores", "Feed + Parcerias"],
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: "R$ 39",
    period: "/mês",
    badge: "Recomendado",
    features: ["20 imóveis", "30 compradores", "Matching automático"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 79",
    period: "/mês",
    badge: null,
    features: ["Ilimitados", "Prioridade no match", "Badge Profissional"],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "R$ 149",
    period: "/mês",
    badge: null,
    features: ["Tudo do Pro", "Prioridade máxima", "Destaque total"],
  },
  {
    id: "agency" as const,
    name: "Agency",
    price: "R$ 399",
    period: "/mês",
    badge: null,
    features: ["Multi-usuário", "Gestão de equipe", "Analytics completo"],
  },
];

type PlanId = "free" | "starter" | "pro" | "premium" | "agency";

const LEFT_FEATURES = [
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
    message: "Você deve aceitar os Termos de Uso e a Política de Privacidade",
  }),
});

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div
        className={[
          "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
          step >= 1
            ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm shadow-blue-300/40"
            : "bg-slate-100 text-slate-400",
        ].join(" ")}
      >
        {step > 1 ? <Check className="h-3 w-3" /> : "1"}
      </div>
      <div
        className={[
          "w-8 h-px transition-all duration-500",
          step >= 2
            ? "bg-gradient-to-r from-blue-500 to-violet-500"
            : "bg-slate-200",
        ].join(" ")}
      />
      <div
        className={[
          "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
          step >= 2
            ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm shadow-blue-300/40"
            : "bg-slate-100 text-slate-400",
        ].join(" ")}
      >
        2
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function PlanSelector({
  selected,
  onChange,
}: {
  selected: PlanId;
  onChange: (p: PlanId) => void;
}) {
  const current = REGISTER_PLANS.find((p) => p.id === selected);

  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Escolha seu plano
      </p>

      {/* Pills row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {REGISTER_PLANS.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={[
                "relative flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all duration-200 min-w-[72px]",
                active
                  ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
              ].join(" ")}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap leading-tight">
                  {plan.badge}
                </span>
              )}
              <span
                className={[
                  "text-[11.5px] font-semibold leading-tight",
                  active ? "text-blue-700" : "text-slate-600",
                ].join(" ")}
              >
                {plan.name}
              </span>
              <span
                className={[
                  "text-[10px] mt-0.5 leading-tight",
                  active ? "text-blue-500" : "text-slate-400",
                ].join(" ")}
              >
                {plan.price}
                {plan.period}
              </span>
              {active && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active plan features */}
      {current && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {current.features.map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-400 mt-2.5">
        Plano Free sempre grátis · Planos pagos sem cartão agora
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-slate-500 mb-1.5 tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11.5px] text-red-500">{error}</p>
      )}
    </div>
  );
}

// shared input className
const inputCls = (hasError?: boolean) =>
  [
    "h-11 text-sm rounded-xl bg-slate-50 border-slate-200 text-slate-900",
    "placeholder:text-slate-300 transition-all duration-150",
    "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.10] focus:outline-none",
    hasError ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.10]" : "",
  ].join(" ");

const selectCls =
  "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-all duration-150 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.10] focus:outline-none";

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER FORM
// ─────────────────────────────────────────────────────────────────────────────

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialPlan  = (searchParams.get("plan") as PlanId) || "starter";
  const validPlans: PlanId[] = ["free", "starter", "pro", "premium", "agency"];
  const inviteEmail  = searchParams.get("email") ?? "";

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    validPlans.includes(initialPlan) ? initialPlan : "starter"
  );
  const [step, setStep]               = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const { register: authRegister, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptTerms: false, email: inviteEmail },
  });

  const termsAccepted = watch("acceptTerms");

  const handleNextStep = async () => {
    const valid = await trigger(["name", "email", "password", "acceptTerms"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { acceptTerms, ...payload } = data;
      await authRegister({ ...payload, plan: selectedPlan });
      toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      router.push("/verificar-email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 px-8 py-8"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-[1.35rem] font-bold text-slate-900 tracking-[-0.025em] leading-tight">
            {step === 1 ? "Crie sua conta gratuitamente" : "Quase lá — mais um passo"}
          </h2>
          <p className="text-[13px] text-slate-400 mt-1.5">
            {step === 1 ? (
              <>
                Já tem conta?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Fazer login
                </Link>
              </>
            ) : (
              "Dados profissionais opcionais — preencha agora ou depois no perfil"
            )}
          </p>
        </div>
        <StepIndicator step={step} />
      </div>

      {/* Plan selector — step 1 only */}
      {step === 1 && (
        <PlanSelector selected={selectedPlan} onChange={setSelectedPlan} />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── STEP 1 ──────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Nome completo *" error={errors.name?.message}>
              <Input
                placeholder="João Silva"
                autoFocus
                autoComplete="name"
                {...register("name")}
                className={inputCls(!!errors.name)}
              />
            </Field>

            <Field label="E-mail *" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="joao@email.com"
                autoComplete="email"
                {...register("email")}
                className={inputCls(!!errors.email)}
              />
            </Field>

            <Field label="Senha *" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  {...register("password")}
                  className={inputCls(!!errors.password) + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {/* Terms */}
            <div className="pt-0.5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-[12.5px] text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                  Li e concordo com os{" "}
                  <Link href="/termos" target="_blank" className="text-blue-600 hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                  . Dados tratados conforme a LGPD.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1.5 text-[11.5px] text-red-500">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="pt-1 space-y-2.5">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!termsAccepted}
                className="group w-full h-11 rounded-xl font-semibold text-[14.5px] text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: termsAccepted
                    ? "0 4px 16px rgba(37,99,235,0.25)"
                    : "none",
                }}
              >
                Criar conta grátis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-center text-[11.5px] text-slate-400">
                Sem cartão de crédito &nbsp;·&nbsp; Comece em segundos
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100/80">
              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-blue-700 leading-relaxed">
                <span className="font-semibold">Conta quase pronta!</span>{" "}
                Essas informações ajudam outros corretores a te encontrar na rede.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Telefone">
                <Input
                  autoFocus
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  {...register("phone")}
                  onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                  className={inputCls()}
                />
              </Field>

              <Field label="Estado">
                <select {...register("state")} className={selectCls}>
                  <option value="">Selecione</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Cidade">
                <Input
                  placeholder="São Paulo"
                  {...register("city")}
                  className={inputCls()}
                />
              </Field>

              <Field label="Imobiliária">
                <Input
                  placeholder="Nome da imobiliária"
                  {...register("agency")}
                  className={inputCls()}
                />
              </Field>

              <div className="col-span-2">
                <Field label="CRECI (opcional)">
                  <Input
                    placeholder="Ex: CRECI-SP 12345"
                    {...register("creci")}
                    className={inputCls()}
                  />
                </Field>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-1 space-y-2.5">
              <Button
                type="submit"
                disabled={isLoading}
                className="group w-full h-11 rounded-xl font-semibold text-[14.5px] text-white border-0 flex items-center justify-center gap-2 transition-all duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando sua conta...
                  </>
                ) : (
                  <>
                    Finalizar cadastro
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 transition-colors py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>
                <span className="text-slate-200 text-sm">·</span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-[12px] text-slate-400 hover:text-blue-600 transition-colors py-1 disabled:opacity-40"
                >
                  Pular e criar conta agora →
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
      className="hidden lg:flex lg:w-[45%] xl:w-5/12 relative flex-col items-center justify-center px-14 py-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0c1a52 0%, #1a1070 42%, #3b1280 72%, #4a1d96 100%)",
      }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -top-32 right-0 w-[460px] h-[460px] rounded-full"
        style={{ background: "rgba(124,58,237,0.22)", filter: "blur(120px)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 rounded-full"
        style={{ background: "rgba(37,99,235,0.18)", filter: "blur(100px)" }}
      />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[360px] gap-10">

        {/* Logo */}
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Image
            src="/logo.png"
            alt="ImobMatch"
            width={200}
            height={60}
            className="h-12 w-auto object-contain brightness-0 invert"
          />
        </Link>

        {/* Headline block */}
        <div className="space-y-4">
          <h1 className="text-[2.2rem] font-extrabold text-white leading-[1.1] tracking-[-0.03em]">
            Pare de perder clientes por não ter o imóvel certo.
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed">
            Conecte-se com corretores da sua região e<br />
            transforme lacunas em negócios fechados.
          </p>
        </div>

        {/* Feature list */}
        <ul className="w-full space-y-4 text-left">
          {LEFT_FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="h-4 w-4 text-white/35 flex-shrink-0 mt-0.5" />
              <span className="text-white/65 text-[13.5px] leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Social proof */}
        <div className="flex items-center gap-2.5 text-white/40 text-[12.5px]">
          <div className="flex -space-x-1.5">
            {["from-pink-400 to-rose-500", "from-blue-400 to-indigo-500", "from-violet-400 to-purple-500"].map(
              (g, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-white/20`}
                />
              )
            )}
          </div>
          <span>Você está entre os primeiros usuários</span>
        </div>

        {/* Live glass card */}
        <div
          className="w-full rounded-2xl px-5 py-4 border border-white/[0.13] text-left"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-white/80 text-[13px] font-medium">Plataforma ativa agora</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-white/40 text-[12px] leading-relaxed">
            Novos matches e parcerias sendo gerados. Quanto antes você entrar, maior sua vantagem na rede.
          </p>
        </div>

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

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-[55%] xl:w-7/12 flex flex-col items-center justify-center px-6 py-14 sm:px-10 bg-[#f8f9fb] overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ImobMatch"
              width={150}
              height={44}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="w-full max-w-[500px]">
          <Suspense
            fallback={
              <div className="bg-white rounded-2xl border border-slate-100 px-8 py-8 h-[520px] animate-pulse" />
            }
          >
            <RegisterForm />
          </Suspense>

          {/* Trust footer */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-center gap-2 text-[11.5px] text-slate-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Corretores já estão encontrando oportunidades reais na plataforma
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Sem cartão de crédito &nbsp;·&nbsp; Cancele quando quiser &nbsp;·&nbsp; Dados 100% seguros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
