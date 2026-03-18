"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight, Check, Building2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { STATES } from "@/lib/utils";
import { maskPhone } from "@/lib/masks";
import toast from "react-hot-toast";

// ── Plan selector data ────────────────────────────────────────────────────────
const REGISTER_PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "Grátis",
    period: "",
    highlight: false,
    features: ["3 imóveis", "3 compradores", "Feed + Parcerias"],
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: "R$ 39",
    period: "/mês",
    highlight: true,
    features: ["20 imóveis", "30 compradores", "Matching automático"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 79",
    period: "/mês",
    highlight: false,
    features: ["Ilimitados", "Prioridade no match", "Badge Profissional"],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "R$ 149",
    period: "/mês",
    highlight: false,
    features: ["Tudo do Pro", "Prioridade máxima", "Destaque total"],
  },
  {
    id: "agency" as const,
    name: "Agency",
    price: "R$ 399",
    period: "/mês",
    highlight: false,
    features: ["Multi-usuário", "Gestão de equipe", "Analytics completo"],
  },
];

type PlanId = "free" | "starter" | "pro" | "premium" | "agency";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  agency: z.string().optional(),
  creci: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "Você deve aceitar os Termos de Uso e a Política de Privacidade",
  }),
});

type FormData = z.infer<typeof schema>;

const LEFT_BULLETS = [
  { icon: Building2, text: "Encontre imóveis para seus clientes" },
  { icon: Users,     text: "Descubra compradores compatíveis" },
  { icon: Zap,       text: "Faça parcerias com outros corretores" },
];

// ── Plan Selector ─────────────────────────────────────────────────────────────
function PlanSelector({ selected, onChange }: { selected: PlanId; onChange: (p: PlanId) => void }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-3">Escolha seu plano</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {REGISTER_PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={`relative flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                  Popular
                </span>
              )}
              <span className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                {plan.name}
              </span>
              <span className={`text-xs font-bold ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                {plan.price}
                <span className="font-normal text-gray-400">{plan.period}</span>
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {REGISTER_PLANS.find((p) => p.id === selected)?.features.map((f) => (
          <span key={f} className="flex items-center gap-1 text-xs text-gray-500">
            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
            {f}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Plano Free sempre grátis. Planos pagos sem cartão agora — ative quando quiser.
      </p>
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
          step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        1
      </span>
      <div className={`w-8 h-0.5 rounded-full transition-colors ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
          step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        2
      </span>
    </div>
  );
}

// ── Inner form (needs useSearchParams inside Suspense) ────────────────────────
function RegisterForm() {
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get("plan") as PlanId) || "starter";
  const validPlans: PlanId[] = ["free", "starter", "pro", "premium", "agency"];
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    validPlans.includes(initialPlan) ? initialPlan : "starter"
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const { register: authRegister, isLoading } = useAuthStore();
  const router = useRouter();

  // Pré-preenche e-mail quando vindo do convite (/register?email=xxx)
  const inviteEmail = searchParams.get("email") ?? "";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Crie sua conta e comece a encontrar oportunidades" : "Quase lá!"}
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 1 ? (
              <>
                Já tem conta?{" "}
                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                  Fazer login
                </Link>
              </>
            ) : (
              "Informações profissionais — opcional, complete depois se preferir"
            )}
          </p>
        </div>
        <StepIndicator step={step} />
      </div>

      {/* Plan selector — only on step 1 */}
      {step === 1 && <PlanSelector selected={selectedPlan} onChange={setSelectedPlan} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 ? (
          /* ── Step 1: dados obrigatórios ── */
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nome completo *</label>
              <Input
                placeholder="João Silva"
                autoFocus
                autoComplete="name"
                {...register("name")}
                className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">E-mail *</label>
              <Input
                type="email"
                placeholder="joao@email.com"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Senha *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  {...register("password")}
                  className={`pr-10 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Li e concordo com os{" "}
                  <Link href="/termos" target="_blank" className="text-blue-600 hover:underline font-medium">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-blue-600 hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                  . Dados tratados conforme a{" "}
                  <span className="font-medium text-gray-700">LGPD (Lei 13.709/2018)</span>.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-500 text-xs mt-1.5">{errors.acceptTerms.message}</p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!termsAccepted}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* ── Step 2: dados profissionais opcionais ── */
          <div className="space-y-4">
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              Essas informações ajudam outros corretores a encontrar você na rede. Pode preencher agora ou depois no perfil.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
                <Input
                  autoFocus
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  {...register("phone")}
                  onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Estado</label>
                <select
                  {...register("state")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cidade</label>
                <Input placeholder="São Paulo" {...register("city")} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Imobiliária</label>
                <Input placeholder="Nome da imobiliária" {...register("agency")} />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">CRECI</label>
                <Input placeholder="Ex: CRECI-SP 12345 (opcional)" {...register("creci")} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-shrink-0"
              >
                ← Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-medium gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-center text-xs text-gray-400 hover:text-blue-600 transition-colors py-1 disabled:opacity-50"
            >
              Pular e criar conta agora
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-white" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ImobMatch"
              width={160}
              height={48}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Mais oportunidades. Mais parcerias. Mais negócios.
            </h1>
            <p className="mt-4 text-blue-100 text-base leading-relaxed">
              Corretores já estão utilizando a plataforma para gerar novas oportunidades todos os dias.
            </p>
          </div>

          {/* Bullets */}
          <ul className="space-y-3">
            {LEFT_BULLETS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-blue-100 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Urgency line */}
          <div className="flex items-start gap-3 pt-4 border-t border-white/20">
            <p className="text-blue-100 text-sm">
              <span className="font-semibold text-white">Você está entre os primeiros usuários.</span>{" "}
              Corretores que entram agora têm vantagem competitiva na rede.
            </p>
          </div>
        </div>

        {/* Urgency card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white font-semibold text-sm">Plataforma em crescimento ativo</p>
          </div>
          <p className="text-blue-100 text-xs leading-relaxed">
            Novos matches e parcerias sendo gerados. Quanto antes você entrar, maior sua vantagem competitiva na rede.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6">
          <Link href="/">
            <Image src="/logo.png" alt="ImobMatch" width={140} height={40} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-xl">
          <Suspense fallback={<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-pulse h-96" />}>
            <RegisterForm />
          </Suspense>

          {/* Trust */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
