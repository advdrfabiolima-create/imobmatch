"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Loader2, ArrowRight,
  Building2, Users, TrendingUp, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

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

const BULLETS = [
  { icon: Building2,   text: "Seus imóveis e compradores, prontos para uso"  },
  { icon: Users,       text: "Parcerias ativas e novas conexões na rede"      },
  { icon: TrendingUp,  text: "Oportunidades geradas desde o seu último acesso" },
];

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col items-center justify-center px-14 py-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0c1a52 0%, #1e1060 45%, #3b1585 80%, #4c1d96 100%)",
      }}
    >
      {/* Single ambient glow — subtle */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{ background: "rgba(109,40,217,0.20)", filter: "blur(120px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full"
        style={{ background: "rgba(37,99,235,0.14)", filter: "blur(100px)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start w-full max-w-[340px] gap-12">

        {/* Logo */}
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Image
            src="/logo.png"
            alt="ImobMatch"
            width={180}
            height={56}
            className="h-11 w-auto object-contain brightness-0 invert"
          />
        </Link>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-[2.6rem] font-extrabold text-white leading-[1.06] tracking-[-0.035em]">
            Bem-vindo<br />de volta.
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed font-normal">
            Continue de onde parou e gere<br />novos negócios hoje.
          </p>
        </div>

        {/* Bullets — clean, no icon boxes */}
        <ul className="w-full space-y-4">
          {BULLETS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="h-4 w-4 text-white/35 flex-shrink-0 mt-0.5" />
              <span className="text-white/60 text-[13.5px] leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Trust line */}
        <div className="flex items-center gap-2 text-white/35 text-[12px]">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
          Conexão segura · Seus dados não são compartilhados
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
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col items-center justify-center px-6 py-16 sm:px-12 bg-[#f8f9fb] overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-12">
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

        <div className="w-full max-w-[400px]">

          {/* Form card */}
          <div
            className="bg-white rounded-2xl border border-slate-100 px-8 py-9"
            style={{
              boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-[1.55rem] font-bold text-slate-900 tracking-[-0.03em] leading-tight">
                Acessar minha conta
              </h2>
              <p className="text-slate-400 mt-1.5 text-sm">
                Continue de onde você parou.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-500 tracking-wide">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoFocus
                  autoComplete="email"
                  {...register("email")}
                  className={[
                    "h-11 text-sm rounded-xl bg-slate-50 border-slate-200 text-slate-900",
                    "placeholder:text-slate-300 transition-all duration-150",
                    "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.10] focus:outline-none",
                    errors.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.10]"
                      : "",
                  ].join(" ")}
                />
                {errors.email && (
                  <p className="text-[11.5px] text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-500 tracking-wide">
                    Senha
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12.5px] text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={[
                      "h-11 text-sm pr-11 rounded-xl bg-slate-50 border-slate-200 text-slate-900",
                      "placeholder:text-slate-300 transition-all duration-150",
                      "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/[0.10] focus:outline-none",
                      errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.10]"
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
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11.5px] text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-11 rounded-xl font-semibold text-[14.5px] gap-2 border-0 text-white transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    boxShadow: isLoading ? "none" : "0 4px 16px rgba(37,99,235,0.25)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Register CTA */}
          <p className="mt-6 text-center text-[13px] text-slate-400">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
