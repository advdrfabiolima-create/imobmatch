"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Loader2, ArrowRight, Building2, Users, Zap,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const BULLETS = [
  { icon: Building2, text: "Acesse seus imóveis e compradores cadastrados"  },
  { icon: Users,     text: "Continue suas parcerias ativas na rede"         },
  { icon: Zap,       text: "Veja novas oportunidades geradas desde ontem"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL — retorno, continuidade, pertencimento
// ─────────────────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #4c1d95 55%, #6d28d9 100%)" }}
    >
      {/* Decorative blobs — diferentes do register para identidade própria */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgba(109,40,217,0.35)" }} />
        <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "rgba(30,58,138,0.4)" }} />
        <div className="absolute -bottom-16 right-1/3 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "rgba(124,58,237,0.25)" }} />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
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

      {/* Copy */}
      <div className="relative z-10 space-y-8">
        <div>
          {/* Tag de contexto */}
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            Sua conta está esperando
          </span>

          <h1 className="text-[2.2rem] font-extrabold text-white leading-[1.1] tracking-tight">
            Bem-vindo<br />de volta.
          </h1>
          <p className="mt-4 text-purple-100 text-base leading-relaxed max-w-xs">
            Entre na sua conta e continue gerando negócios com outros corretores da rede.
          </p>
        </div>

        {/* Bullets — continuidade, não descoberta */}
        <ul className="space-y-4">
          {BULLETS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/12 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-purple-100 text-sm leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Pertencimento — diferente do FOMO do register */}
        <div className="pt-5 border-t border-white/15">
          <p className="text-sm text-purple-100 leading-relaxed">
            <span className="font-semibold text-white">Você já faz parte da rede ImobMatch.</span>{" "}
            Acesse sua conta e veja o que aconteceu desde sua última visita.
          </p>
        </div>
      </div>

      {/* Bottom card — rede ativa */}
      <div className="relative z-10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5 mb-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <p className="text-white font-semibold text-sm">Acesso seguro e criptografado</p>
        </div>
        <p className="text-purple-100 text-xs leading-relaxed">
          Seus dados e conversas são protegidos. Nunca compartilhamos suas informações com terceiros.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      const { user } = useAuthStore.getState();
      toast.success("Bem-vindo de volta!");
      router.push(user?.isFirstLogin ? "/welcome" : "/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-gray-50/70 overflow-y-auto">

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

        <div className="w-full max-w-md">

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg shadow-gray-100/60">

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Acessar minha conta
              </h2>
              <p className="text-gray-500 mt-1.5 text-sm">
                Continue de onde você parou.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoFocus
                  autoComplete="email"
                  {...register("email")}
                  className={`h-11 transition-shadow duration-200 focus:shadow-md focus:shadow-indigo-100/60 ${
                    errors.email ? "border-red-400 focus-visible:ring-red-400" : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Senha</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={`h-11 pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-indigo-100/60 ${
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
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="pt-1 space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-12 rounded-xl font-bold text-[15px] gap-2 border-0 shadow-lg shadow-indigo-300/40 hover:shadow-xl hover:shadow-indigo-300/50 hover:opacity-95 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:shadow-none"
                  style={{
                    background: isLoading
                      ? undefined
                      : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar na minha conta
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Trust */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  Acesso seguro à sua conta
                </div>
              </div>
            </form>
          </div>

          {/* Register CTA — separado e distinto */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200/80 px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Ainda não tem conta?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap"
            >
              Criar conta grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
