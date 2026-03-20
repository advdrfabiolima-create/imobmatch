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
  ShieldCheck, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const BULLETS = [
  { icon: Building2, text: "Acesse seus imóveis e compradores cadastrados" },
  { icon: Users,     text: "Continue suas parcerias ativas na rede"        },
  { icon: Zap,       text: "Veja novas oportunidades geradas desde ontem"  },
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
// LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col items-center justify-center p-14 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #0f1f5c 0%, #2d1478 40%, #4a1d96 72%, #5b21b6 100%)",
      }}
    >
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full"
          style={{ background: "rgba(124,58,237,0.28)", filter: "blur(100px)" }}
        />
        <div
          className="absolute top-1/3 -left-28 w-80 h-80 rounded-full"
          style={{ background: "rgba(37,99,235,0.22)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full"
          style={{ background: "rgba(109,40,217,0.18)", filter: "blur(80px)" }}
        />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[340px] w-full gap-10">

        {/* Logo */}
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt="ImobMatch"
            width={210}
            height={64}
            className="h-[3.25rem] w-auto object-contain brightness-0 invert"
          />
        </Link>

        {/* Headline block */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/[0.15] text-white/90 text-[11px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            Sua conta está esperando
          </div>

          <h1 className="text-[2.8rem] font-black text-white leading-[1.03] tracking-[-0.04em]">
            Bem-vindo<br />de volta.
          </h1>

          <p className="text-purple-100/75 text-[14.5px] leading-relaxed">
            Entre na sua conta e continue<br />gerando negócios na rede.
          </p>
        </div>

        {/* Bullets */}
        <ul className="w-full space-y-2.5">
          {BULLETS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3.5 rounded-2xl px-4 py-3 border border-white/[0.09] backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.055)" }}
            >
              <div className="w-8 h-8 rounded-xl border border-white/[0.14] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.09)" }}>
                <Icon className="h-3.5 w-3.5 text-white/75" />
              </div>
              <span className="text-purple-100/80 text-[13px] text-left leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Glass security card */}
        <div
          className="w-full rounded-2xl px-5 py-4 border border-white/[0.13] backdrop-blur-md flex items-start gap-3.5"
          style={{ background: "rgba(255,255,255,0.065)" }}
        >
          <div
            className="w-9 h-9 rounded-xl border border-emerald-400/25 flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(52,211,153,0.14)" }}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="text-left">
            <p className="text-white text-[13px] font-semibold mb-1">
              Acesso seguro e criptografado
            </p>
            <p className="text-purple-100/65 text-[12px] leading-relaxed">
              Seus dados são protegidos. Nunca compartilhamos suas informações com terceiros.
            </p>
          </div>
        </div>

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

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col items-center justify-center px-6 py-14 sm:px-12 overflow-y-auto bg-[#f7f8fc]">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ImobMatch"
              width={160}
              height={48}
              className="h-11 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="w-full max-w-[420px]">

          {/* Form card */}
          <div
            className="bg-white rounded-3xl border border-slate-200/50 p-9"
            style={{
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05), 0 32px 64px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-[1.65rem] font-bold text-slate-900 tracking-[-0.025em] leading-tight">
                Acessar minha conta
              </h2>
              <p className="text-slate-400 mt-2 text-[13.5px]">
                Continue de onde você parou.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-600">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoFocus
                  autoComplete="email"
                  {...register("email")}
                  className={[
                    "h-12 text-[14px] rounded-xl bg-slate-50/60 border-slate-200",
                    "placeholder:text-slate-300",
                    "transition-all duration-200",
                    "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.12] focus:outline-none",
                    errors.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.12]"
                      : "",
                  ].join(" ")}
                />
                {errors.email && (
                  <p className="text-[11.5px] text-red-500 flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-600">
                    Senha
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
                    className={[
                      "h-12 text-[14px] pr-11 rounded-xl bg-slate-50/60 border-slate-200",
                      "placeholder:text-slate-300",
                      "transition-all duration-200",
                      "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.12] focus:outline-none",
                      errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.12]"
                        : "",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeOff className="h-[17px] w-[17px]" />
                      : <Eye className="h-[17px] w-[17px]" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11.5px] text-red-500 flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-12 rounded-xl font-semibold text-[15px] gap-2 border-0 text-white transition-all duration-200 disabled:opacity-60 disabled:shadow-none hover:scale-[1.018] active:scale-[0.99]"
                  style={{
                    background: isLoading
                      ? "#6366f1"
                      : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 20px rgba(37,99,235,0.30), 0 1px 3px rgba(0,0,0,0.08)",
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

                <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
                  <Lock className="h-3 w-3 text-slate-300 flex-shrink-0" />
                  Conexão segura e criptografada
                </div>
              </div>
            </form>
          </div>

          {/* Register CTA */}
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <span className="text-[13px] text-slate-400">Ainda não tem conta?</span>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              Criar conta grátis
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
