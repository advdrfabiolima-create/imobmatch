"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Loader2, ArrowRight, Check, Building2, Users, Zap,
  CheckCircle2, ArrowLeft, Star,
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
    badge: "Mais recomendado",
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

const LEFT_BULLETS = [
  { icon: Building2, text: "Encontre imóveis para seus clientes rapidamente" },
  { icon: Users,     text: "Descubra compradores compatíveis na rede"        },
  { icon: Zap,       text: "Faça parcerias com corretores da sua região"     },
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
// PLAN SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function PlanSelector({ selected, onChange }: { selected: PlanId; onChange: (p: PlanId) => void }) {
  const currentPlan = REGISTER_PLANS.find((p) => p.id === selected);

  return (
    <div className="mb-7">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Escolha seu plano
      </p>

      {/* Plan pills */}
      <div className="grid grid-cols-5 gap-2">
        {REGISTER_PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={`relative flex flex-col items-center w-full px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-100"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap leading-tight">
                  {plan.badge}
                </span>
              )}
              <span className={`text-xs font-bold leading-tight ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                {plan.name}
              </span>
              <span className={`text-[11px] leading-tight ${isSelected ? "text-blue-600" : "text-gray-400"}`}>
                {plan.price}
                <span className="text-[10px]">{plan.period}</span>
              </span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected plan features */}
      {currentPlan && (
        <div className="mt-3 flex flex-wrap gap-3">
          {currentPlan.features.map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
              <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-2">
        Plano Free sempre grátis. Planos pagos sem cartão agora — ative quando quiser.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        step >= 1
          ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-200"
          : "bg-gray-100 text-gray-400"
      }`}>
        1
      </div>
      <div className={`w-10 h-0.5 rounded-full transition-all duration-500 ${
        step >= 2 ? "bg-gradient-to-r from-blue-600 to-violet-600" : "bg-gray-200"
      }`} />
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        step >= 2
          ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-200"
          : "bg-gray-100 text-gray-400"
      }`}>
        2
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD WRAPPER — label + input + error
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER FORM
// ─────────────────────────────────────────────────────────────────────────────

function RegisterForm() {
  const searchParams  = useSearchParams();
  const initialPlan   = (searchParams.get("plan") as PlanId) || "starter";
  const validPlans: PlanId[] = ["free", "starter", "pro", "premium", "agency"];
  const inviteEmail   = searchParams.get("email") ?? "";

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
    <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg shadow-gray-100/60">

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {step === 1 ? "Crie sua conta gratuitamente" : "Quase lá — só mais um passo"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? (
              <>
                Já tem conta?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 underline underline-offset-2">
                  Fazer login
                </Link>
              </>
            ) : (
              "Dados profissionais opcionais — complete agora ou depois no perfil"
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
                className={`transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60 ${
                  errors.name ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
            </Field>

            <Field label="E-mail *" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="joao@email.com"
                autoComplete="email"
                {...register("email")}
                className={`transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60 ${
                  errors.email ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
              />
            </Field>

            <Field label="Senha *" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  {...register("password")}
                  className={`pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60 ${
                    errors.password ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                  Li e concordo com os{" "}
                  <Link href="/termos" target="_blank" className="text-blue-600 font-medium hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-blue-600 font-medium hover:underline">
                    Política de Privacidade
                  </Link>
                  . Dados tratados conforme a LGPD.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!termsAccepted}
                className="group w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-300/50 hover:opacity-95 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Criar conta grátis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-center text-xs text-gray-400">
                Sem cartão de crédito &nbsp;•&nbsp; Comece em segundos
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-semibold">Conta quase pronta!</span> Essas informações ajudam outros corretores a te encontrar na rede. Pode preencher agora ou depois no perfil.
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
                  className="transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60"
                />
              </Field>

              <Field label="Estado">
                <select
                  {...register("state")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
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
                  className="transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60"
                />
              </Field>

              <Field label="Imobiliária">
                <Input
                  placeholder="Nome da imobiliária"
                  {...register("agency")}
                  className="transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60"
                />
              </Field>

              <div className="col-span-2">
                <Field label="CRECI (opcional)">
                  <Input
                    placeholder="Ex: CRECI-SP 12345"
                    {...register("creci")}
                    className="transition-shadow duration-200 focus:shadow-md focus:shadow-blue-100/60"
                  />
                </Field>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-1 space-y-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-[15px] gap-2 shadow-lg shadow-blue-300/40 hover:shadow-xl hover:opacity-95 active:scale-[0.99] transition-all duration-200 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando sua conta...
                  </>
                ) : (
                  <>
                    Finalizar cadastro
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>
                <span className="text-gray-200">|</span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors py-2 disabled:opacity-50"
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
    <div className="hidden lg:flex lg:w-[45%] xl:w-5/12 relative bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 flex-col justify-between p-12 overflow-hidden">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/8 blur-3xl" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.3)" }} />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.25)" }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="ImobMatch"
            width={160}
            height={48}
            className="h-11 w-auto object-contain brightness-0 invert"
          />
        </Link>
      </div>

      {/* Main copy */}
      <div className="relative z-10 space-y-8">
        <div>
          <h1 className="text-[2.1rem] font-extrabold text-white leading-[1.12] tracking-tight">
            Pare de perder clientes por não ter o imóvel certo.
          </h1>
          <p className="mt-4 text-blue-100 text-base leading-relaxed">
            Conecte-se com outros corretores e encontre oportunidades reais de negócio todos os dias.
          </p>
        </div>

        {/* Bullets */}
        <ul className="space-y-4">
          {LEFT_BULLETS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Icon className="h-4.5 w-4.5 text-white" style={{ height: "18px", width: "18px" }} />
              </div>
              <span className="text-blue-100 text-sm leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Founder badge */}
        <div className="pt-5 border-t border-white/15">
          <div className="flex items-start gap-3">
            <div className="flex -space-x-1.5 flex-shrink-0 mt-0.5">
              {["from-pink-400 to-rose-500", "from-blue-400 to-indigo-500", "from-violet-400 to-purple-500"].map((g, i) => (
                <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-white/30 flex items-center justify-center`}>
                  <span className="text-[8px] font-bold text-white">{["RO","MT","CF"][i]}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-100 leading-snug">
              <span className="font-semibold text-white">Você está entre os primeiros usuários.</span>{" "}
              Corretores que entram agora têm vantagem competitiva na rede.
            </p>
          </div>
        </div>
      </div>

      {/* Live card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-white font-semibold text-sm">Plataforma ativa agora</p>
          </div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>
        <p className="text-blue-100 text-xs leading-relaxed">
          Novos matches e parcerias sendo gerados. Quanto antes você entrar, maior sua vantagem competitiva na rede.
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

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-[55%] xl:w-7/12 flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50/70 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-7">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ImobMatch"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="w-full max-w-[520px]">
          <Suspense
            fallback={
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg shadow-gray-100/60 animate-pulse h-[500px]" />
            }
          >
            <RegisterForm />
          </Suspense>

          {/* Social proof + trust */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Corretores já estão encontrando oportunidades reais na plataforma
            </div>
            <p className="text-center text-xs text-gray-400">
              Sem cartão de crédito &nbsp;·&nbsp; Cancele quando quiser &nbsp;·&nbsp; Dados 100% seguros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
